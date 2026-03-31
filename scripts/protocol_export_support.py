"""Support library for generating protocol page data."""

from __future__ import annotations

import sys
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any, Callable

sys.path.insert(0, str(Path.home() / "health-data"))
sys.path.insert(0, str(Path.home() / "optiqal-ai" / "python"))
from health_data import ProtocolReferenceData, load_protocol_reference_data

from optiqal import (
    AnalysisConfig,
    analyze,
    apply_protocol_spec,
    build_protocol_specs,
    ChoiceOptionSpec,
    ChoiceStateSpec,
    DecisionSequenceStepSpec,
    evaluate_decision_states,
    expected_stack_interaction_qaly,
    FrontierStateSpec,
    load_protocol_baseline,
    load_protocol_context,
    load_protocol_profile,
    protocol_metadata_from_specs,
    protocol_sleep_estimate_from_baseline,
    rank_interventions_by_marginal_cost_per_qaly,
    recommend_bundles,
    serialize_bundle_recommendations,
    serialize_decision_state_evaluations,
    serialize_decision_sequence,
    serialize_item_results,
    serialize_ranked_steps,
    BUNDLES,
    CATALOG,
)
from optiqal.catalog import CatalogEntry
from optiqal.sleep import (
    sleep_baseline_mortality_multiplier,
    sleep_component_overlap_multipliers,
)

OUTPUT = Path.home() / "maxghenis.com" / "src" / "data" / "protocol-data.json"
HEALTH_DB = Path.home() / "clawd" / "data" / "health.db"

CATEGORY_LABELS = {
    "rx_current": "Prescriptions",
    "rx_candidate": "Prescription candidates",
    "supplement_current": "Current supplements",
    "supplement_bought": "Recently added",
    "supplement_candidate": "Under evaluation",
    "sleep_current": "Sleep interventions",
    "sleep_candidate": "Sleep interventions",
}

STATUS_LABELS = {
    "rx_current": "taking",
    "rx_candidate": "considering",
    "supplement_current": "taking",
    "supplement_bought": "testing",
    "supplement_candidate": "watching",
    "sleep_current": "taking",
    "sleep_candidate": "watching",
}

CURRENT_STACK_CATEGORIES = {"rx_current", "supplement_current", "supplement_bought", "sleep_current"}


@dataclass(frozen=True)
class ProtocolAnalysisState:
    resources: ProtocolReferenceData
    protocol_context: Any
    protocol_baseline: dict[str, Any]
    protocol_specs: dict[str, Any]
    ground_up_metadata: dict[str, dict[str, Any]]
    protocol_sleep_estimate: Any
    benefit_overlap_multipliers: dict[str, float]
    config: AnalysisConfig
    analysis_catalog: dict[str, CatalogEntry]
    result: Any
    effective_results_by_id: dict[str, dict[str, Any]]
    single_qalys: dict[str, float]
    annual_costs: dict[str, float]
    cost_values: dict[str, float]
    portfolio_stack_penalty_fn: Callable[[list[str]], float]
    product_marginal_cost_value_fn: Callable[[list[str], str], float]
    product_total_annual_cost_fn: Callable[[list[str]], float]
    product_total_cost_value_fn: Callable[[list[str]], float]
    cost_factor: float
    portfolio_result: list[dict[str, Any]]
    selected_ids: list[str]
    bundle_recs: list[dict[str, Any]]


def load_protocol_resources(health_db: Path = HEALTH_DB) -> ProtocolReferenceData:
    resources = load_protocol_reference_data(health_db)
    print(
        f"Loaded {len(resources.products)} products, "
        f"{sum(len(v) for v in resources.ingredients.values())} ingredients, "
        f"and {len(resources.catalog_product_map)} catalog mappings from health DB"
    )
    return resources


def build_product_map_counts(catalog_product_map: dict[str, str]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for product_name in catalog_product_map.values():
        counts[product_name] = counts.get(product_name, 0) + 1
    return counts


def build_personalized_catalog(
    *,
    protocol_specs: dict[str, Any],
    products: dict[str, dict[str, Any]],
    catalog_product_map: dict[str, str],
    product_map_counts: dict[str, int],
) -> dict[str, CatalogEntry]:
    if not protocol_specs:
        return dict(CATALOG)

    personalized: dict[str, CatalogEntry] = {}
    for item_id, base_entry in CATALOG.items():
        db_name = catalog_product_map.get(item_id)
        annual_cost = float(base_entry.annual_cost)
        if db_name and db_name in products and product_map_counts.get(db_name, 0) == 1:
            db_annual_cost = products[db_name].get("annual_cost")
            if db_annual_cost is not None:
                annual_cost = float(db_annual_cost)
        personalized[item_id] = apply_protocol_spec(
            item_id=item_id,
            base_entry=base_entry,
            specs=protocol_specs,
            annual_cost=annual_cost,
        )
    return personalized


def effective_item_results_by_id(
    raw_results_by_id: dict[str, dict[str, Any]],
    ground_up_metadata: dict[str, dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    effective = {}
    for item_id, raw in raw_results_by_id.items():
        entry = dict(raw)
        metadata = ground_up_metadata.get(item_id)
        entry["qaly_source"] = "ground_up" if metadata else "catalog"
        if metadata:
            entry["range_low_qaly"] = metadata.get("range_low_qaly")
            entry["range_high_qaly"] = metadata.get("range_high_qaly")
            entry["within_range"] = metadata.get("within_range")
            entry["ground_up_rationale"] = metadata.get("rationale")
            entry["ground_up_personalization"] = metadata.get("personalization")
            entry["ground_up_sources"] = metadata.get("ground_up_sources", [])
        effective[item_id] = entry
    return effective


def selected_product_names(
    item_ids: list[str],
    resources: ProtocolReferenceData,
) -> list[str]:
    names = set()
    for item_id in item_ids:
        db_name = resources.catalog_product_map.get(item_id)
        if db_name and db_name in resources.products:
            names.add(db_name)
    return sorted(names)


def discounted_cost_factor(item_results_by_id: dict[str, dict[str, Any]], horizon_years: float) -> float:
    ratios = [
        result["total_cost"] / result["annual_cost"]
        for result in item_results_by_id.values()
        if result.get("annual_cost", 0) > 0 and result.get("total_cost", 0) > 0
    ]
    return float(round(sum(ratios) / len(ratios), 6)) if ratios else float(horizon_years)


def evidence_confidence(entry: CatalogEntry) -> str:
    return entry.evidence_confidence()


def build_protocol_analysis_state(resources: ProtocolReferenceData) -> ProtocolAnalysisState:
    protocol_context = load_protocol_context()
    protocol_baseline = load_protocol_baseline(protocol_context)
    protocol_specs = build_protocol_specs(protocol_baseline, protocol_context)
    ground_up_metadata = protocol_metadata_from_specs(protocol_specs)
    print(
        f"Loaded {len(ground_up_metadata)} personalized ground-up assumptions "
        "from live protocol builder"
    )

    product_map_counts = build_product_map_counts(resources.catalog_product_map)
    analysis_catalog = build_personalized_catalog(
        protocol_specs=protocol_specs,
        products=resources.products,
        catalog_product_map=resources.catalog_product_map,
        product_map_counts=product_map_counts,
    )
    protocol_sleep_estimate = protocol_sleep_estimate_from_baseline(protocol_baseline)
    benefit_overlap_multipliers = (
        {
            tag: round(multiplier, 3)
            for tag, multiplier in sleep_component_overlap_multipliers(protocol_sleep_estimate).items()
        }
        if protocol_sleep_estimate is not None
        else {}
    )

    config = AnalysisConfig(
        profile=load_protocol_profile(),
        n_simulations=50_000,
        random_state=42,
        sleep_estimate=protocol_sleep_estimate,
    )

    print("Running Optiqal analysis...")
    result = analyze(config, catalog_entries=analysis_catalog)
    effective_results = effective_item_results_by_id(result.item_results_by_id, ground_up_metadata)
    single_qalys = {item_id: entry["total_qaly"] for item_id, entry in effective_results.items()}
    annual_costs = {item_id: entry["annual_cost"] for item_id, entry in effective_results.items()}
    cost_values = {item_id: entry["total_cost"] for item_id, entry in effective_results.items()}
    cost_factor = discounted_cost_factor(effective_results, config.horizon_years)

    def product_name_for_item(item_id: str) -> str | None:
        db_name = resources.catalog_product_map.get(item_id)
        if db_name and db_name in resources.products:
            return db_name
        return None

    def infer_product_interaction_tags(item_ids: list[str]) -> list[str]:
        tags = []
        for product_name in selected_product_names(item_ids, resources):
            product_ingredients = resources.ingredients.get(product_name, [])
            if len(product_ingredients) <= 1:
                continue
            product_tags = set()
            for ingredient in product_ingredients:
                ingredient_name = ingredient["ingredient"].lower()
                if "vitamin e" in ingredient_name:
                    product_tags.add("bleeding_stack")
                if "vitamin d" in ingredient_name:
                    product_tags.add("vitamin_d")
                if "glycine" in ingredient_name or "theanine" in ingredient_name:
                    product_tags.add("sedating")
            tags.extend(sorted(product_tags))
        return tags

    def portfolio_stack_penalty(item_ids: list[str]) -> float:
        return expected_stack_interaction_qaly(
            item_ids=item_ids,
            catalog_entries=analysis_catalog,
            profile=config.profile,
            qaly_discount_rate=config.qaly_discount_rate,
            extra_tags=infer_product_interaction_tags(item_ids),
            item_qalys={item_id: effective_results[item_id]["total_qaly"] for item_id in item_ids},
            benefit_tag_multipliers=benefit_overlap_multipliers,
        )[0]

    def product_marginal_cost_value_fn(selected_ids: list[str], candidate_id: str) -> float:
        selected_products = {product_name_for_item(item_id) for item_id in selected_ids}
        candidate_product = product_name_for_item(candidate_id)
        if candidate_product:
            if candidate_product in selected_products:
                return 0.0
            annual_cost = resources.products[candidate_product].get("annual_cost") or 0.0
            return float(annual_cost) * cost_factor
        return float(effective_results[candidate_id]["total_cost"])

    def product_total_annual_cost_fn(selected_ids: list[str]) -> float:
        total = 0.0
        seen_products = set()
        for item_id in selected_ids:
            product_name = product_name_for_item(item_id)
            if product_name:
                if product_name not in seen_products:
                    total += float(resources.products[product_name].get("annual_cost") or 0.0)
                    seen_products.add(product_name)
            else:
                total += float(effective_results[item_id]["annual_cost"])
        return total

    def product_total_cost_value_fn(item_ids: list[str]) -> float:
        total = 0.0
        running: list[str] = []
        for item_id in item_ids:
            total += float(product_marginal_cost_value_fn(running.copy(), item_id))
            running.append(item_id)
        return total

    exclusive_groups = {
        item_id: entry.exclusive_group
        for item_id, entry in analysis_catalog.items()
        if entry.exclusive_group
    }
    portfolio_result = rank_interventions_by_marginal_cost_per_qaly(
        single_qalys=single_qalys,
        annual_costs=annual_costs,
        cost_values=cost_values,
        horizon_years=config.horizon_years,
        stack_interaction_penalty_fn=portfolio_stack_penalty,
        marginal_cost_value_fn=product_marginal_cost_value_fn,
        total_annual_cost_fn=product_total_annual_cost_fn,
        exclusive_groups=exclusive_groups,
    )
    selected_ids = portfolio_result[-1]["selected_interventions"] if portfolio_result else []
    bundle_recs = recommend_bundles(
        selected_ids=selected_ids,
        item_results=effective_results,
        horizon_years=config.horizon_years,
    )

    return ProtocolAnalysisState(
        resources=resources,
        protocol_context=protocol_context,
        protocol_baseline=protocol_baseline,
        protocol_specs=protocol_specs,
        ground_up_metadata=ground_up_metadata,
        protocol_sleep_estimate=protocol_sleep_estimate,
        benefit_overlap_multipliers=benefit_overlap_multipliers,
        config=config,
        analysis_catalog=analysis_catalog,
        result=result,
        effective_results_by_id=effective_results,
        single_qalys=single_qalys,
        annual_costs=annual_costs,
        cost_values=cost_values,
        portfolio_stack_penalty_fn=portfolio_stack_penalty,
        product_marginal_cost_value_fn=product_marginal_cost_value_fn,
        product_total_annual_cost_fn=product_total_annual_cost_fn,
        product_total_cost_value_fn=product_total_cost_value_fn,
        cost_factor=cost_factor,
        portfolio_result=portfolio_result,
        selected_ids=selected_ids,
        bundle_recs=bundle_recs,
    )


def build_protocol_export_data(state: ProtocolAnalysisState) -> dict[str, Any]:
    resources = state.resources
    item_name_by_id = {
        item_id: result["name"]
        for item_id, result in state.effective_results_by_id.items()
    }
    exclusive_groups = {
        item_id: entry.exclusive_group
        for item_id, entry in state.analysis_catalog.items()
        if entry.exclusive_group
    }

    def enrich_with_db(entry: dict[str, Any]) -> None:
        catalog_id = entry["id"]
        fallback_dose = {
            "nasacort_nightly": ("1 spray/nostril before bed", "bedtime"),
            "nasal_strips_nightly": ("1 strip at bedtime", "bedtime"),
            "head_elevation_nightly": ("sleep with mild head-of-bed elevation", "bedtime"),
        }
        if catalog_id in fallback_dose:
            entry["dose_notes"], entry["time_of_day"] = fallback_dose[catalog_id]

        db_name = resources.catalog_product_map.get(catalog_id)
        if not db_name or db_name not in resources.products:
            return

        product = resources.products[db_name]
        entry["db_product"] = db_name
        entry["brand"] = product.get("brand")
        entry["serving_size"] = product.get("serving_size")
        entry["daily_servings"] = product.get("daily_servings")
        entry["dose_notes"] = product.get("daily_dose_notes")
        entry["time_of_day"] = product.get("time_of_day")
        entry["source_url"] = product.get("source_url")
        entry["package_price"] = product.get("package_price")
        if product.get("cost_assumptions") is not None:
            entry["cost_assumptions"] = product.get("cost_assumptions")
        if db_name in resources.ingredients:
            entry["ingredients"] = resources.ingredients[db_name]

    def stack_interaction_summary(item_ids: list[str]) -> dict[str, Any]:
        product_tags = []
        for product_name in selected_product_names(item_ids, resources):
            product_ingredients = resources.ingredients.get(product_name, [])
            if len(product_ingredients) <= 1:
                continue
            product_tags.extend(
                tag
                for ingredient in product_ingredients
                for tag in (
                    ["bleeding_stack"] if "vitamin e" in ingredient["ingredient"].lower() else []
                ) + (
                    ["vitamin_d"] if "vitamin d" in ingredient["ingredient"].lower() else []
                ) + (
                    ["sedating"]
                    if any(keyword in ingredient["ingredient"].lower() for keyword in ["glycine", "theanine"])
                    else []
                )
            )
        penalty_qaly, triggered = expected_stack_interaction_qaly(
            item_ids=item_ids,
            catalog_entries=state.analysis_catalog,
            profile=state.config.profile,
            qaly_discount_rate=state.config.qaly_discount_rate,
            extra_tags=sorted(set(product_tags)),
            item_qalys={item_id: state.effective_results_by_id[item_id]["total_qaly"] for item_id in item_ids},
            benefit_tag_multipliers=state.benefit_overlap_multipliers,
        )
        return {
            "product_tags": sorted(set(product_tags)),
            "interaction_penalty_qaly": round(penalty_qaly, 4),
            "interaction_penalty_days": round(penalty_qaly * 365.25, 1),
            "triggered_interactions": [
                {
                    "id": detail["id"],
                    "description": detail["description"],
                    "requires_tags": detail["requires_tags"],
                    "matched_tag_count": detail["matched_tag_count"],
                    "penalty_qaly": round(detail["penalty_qaly"], 4),
                    "penalty_days": round(detail["penalty_qaly"] * 365.25, 1),
                    **({"item_ids": detail["item_ids"]} if "item_ids" in detail else {}),
                }
                for detail in triggered
            ],
        }

    supplements = serialize_item_results(
        state.result.item_results,
        effective_results_by_id=state.effective_results_by_id,
        catalog_entries=state.analysis_catalog,
        selected_ids=state.selected_ids,
        category_labels=CATEGORY_LABELS,
        status_labels=STATUS_LABELS,
        evidence_confidence_for_entry=evidence_confidence,
        row_enricher=enrich_with_db,
    )
    supplement_lookup = {supplement["id"]: supplement for supplement in supplements}

    schedule = {"morning_mix": [], "meal_1": [], "meal_2": [], "before_bed": []}
    for name, product in sorted(resources.products.items()):
        for time_of_day in (product.get("time_of_day") or "").split(","):
            time_of_day = time_of_day.strip()
            if time_of_day not in schedule:
                continue
            schedule[time_of_day].append(
                {
                    "name": name,
                    "brand": product.get("brand"),
                    "type": product.get("type"),
                    "serving_size": product.get("serving_size"),
                    "dose_notes": product.get("daily_dose_notes"),
                    "package_price": product.get("package_price"),
                    "servings_per_package": product.get("servings_per_package"),
                    "daily_servings": product.get("daily_servings"),
                    "annual_cost": product.get("annual_cost"),
                    "source_url": product.get("source_url"),
                    "cost_assumptions": product.get("cost_assumptions"),
                    "ingredients": resources.ingredients.get(name, []),
                }
            )

    bundles = serialize_bundle_recommendations(
        state.bundle_recs,
        bundles_by_id=BUNDLES,
    )

    portfolio = serialize_ranked_steps(
        state.portfolio_result,
        item_name_by_id=item_name_by_id,
        include_cost_details=True,
    )

    current_stack_ids = [supplement["id"] for supplement in supplements if supplement["category"] in CURRENT_STACK_CATEGORIES]
    current_stack_base_qaly = sum(state.effective_results_by_id[item_id]["total_qaly"] for item_id in current_stack_ids)
    current_stack_interactions = stack_interaction_summary(current_stack_ids)
    current_stack = {
        "item_ids": current_stack_ids,
        "product_ids": selected_product_names(current_stack_ids, resources),
        "base_qaly": round(current_stack_base_qaly, 4),
        "base_days": round(current_stack_base_qaly * 365.25, 1),
        "adjusted_qaly": round(current_stack_base_qaly + current_stack_interactions["interaction_penalty_qaly"], 4),
        "adjusted_days": round((current_stack_base_qaly + current_stack_interactions["interaction_penalty_qaly"]) * 365.25, 1),
        "total_annual_cost": round(state.product_total_annual_cost_fn(current_stack_ids)),
        **current_stack_interactions,
    }

    optimal_portfolio_interactions = stack_interaction_summary(state.selected_ids)
    optimal_portfolio = {
        "item_ids": state.selected_ids,
        "product_ids": selected_product_names(state.selected_ids, resources),
        "base_qaly": round(state.portfolio_result[-1]["total_base_qaly"], 4) if state.portfolio_result else 0,
        "adjusted_qaly": round(state.portfolio_result[-1]["total_qaly"], 4) if state.portfolio_result else 0,
        "adjusted_days": round(state.portfolio_result[-1]["total_qaly"] * 365.25, 1) if state.portfolio_result else 0,
        "total_annual_cost": round(state.product_total_annual_cost_fn(state.selected_ids)),
        **optimal_portfolio_interactions,
    }

    insomnia_rx_ids = [
        item_id for item_id, entry in state.analysis_catalog.items()
        if entry.exclusive_group == "insomnia_rx"
    ]
    current_without_insomnia_rx = [item_id for item_id in current_stack_ids if item_id not in insomnia_rx_ids]

    def option_item_summary(item_id: str) -> dict[str, Any]:
        item = supplement_lookup[item_id]
        return {
            "id": item_id,
            "name": item["name"],
            "days": item["days"],
            "annual_cost": item["annual_cost"],
            "cost_per_qaly": item["cost_per_qaly"],
            "p_benefit": item["p_benefit"],
            "p_harm": item["p_harm"],
        }

    sleep_decision_specs = [
        FrontierStateSpec(
            id="current_confirmed_mild_osa",
            label="Confirmed mild OSA, current stack",
            description=(
                "Current state after the home sleep study. This frontier starts from what you take now "
                "and asks what the next additions are, not from an empty stack."
            ),
            base_item_ids=current_stack_ids,
        ),
        ChoiceStateSpec(
            id="osa_primary_therapy_choice",
            label="Primary OSA therapy choice",
            description=(
                "Primary-airway treatment options on top of your current stack. This is the first treatment "
                "decision after confirming mild OSA."
            ),
            base_item_ids=current_stack_ids,
            options=[
                ChoiceOptionSpec(id="status_quo", label="No primary airway treatment yet", added_item_ids=[]),
                ChoiceOptionSpec(id="apap_nightly", label="Start APAP", added_item_ids=["apap_nightly"]),
                ChoiceOptionSpec(
                    id="oral_appliance_custom",
                    label="Start custom oral appliance",
                    added_item_ids=["oral_appliance_custom"],
                ),
            ],
        ),
        ChoiceStateSpec(
            id="bridge_insomnia_choice_while_waiting",
            label="Insomnia bridge while waiting on primary therapy",
            description=(
                "If primary OSA treatment is delayed, this compares insomnia-med options conditional on your "
                "current stack with the existing insomnia Rx removed first."
            ),
            base_item_ids=current_without_insomnia_rx,
            options=[
                ChoiceOptionSpec(id="no_insomnia_rx", label="No insomnia Rx", added_item_ids=[]),
                ChoiceOptionSpec(id="trazodone_50mg", label="Keep trazodone", added_item_ids=["trazodone_50mg"]),
                ChoiceOptionSpec(id="doxepin_3mg", label="Switch to doxepin", added_item_ids=["doxepin_3mg"]),
                ChoiceOptionSpec(
                    id="daridorexant_25mg",
                    label="Switch to daridorexant",
                    added_item_ids=["daridorexant_25mg"],
                ),
                ChoiceOptionSpec(
                    id="lemborexant_5mg",
                    label="Switch to lemborexant",
                    added_item_ids=["lemborexant_5mg"],
                ),
                ChoiceOptionSpec(
                    id="suvorexant_10mg",
                    label="Switch to suvorexant",
                    added_item_ids=["suvorexant_10mg"],
                ),
            ],
        ),
        ChoiceStateSpec(
            id="post_apap_insomnia_choice_if_needed",
            label="Insomnia choice after APAP",
            description=(
                "Conditional insomnia-med comparison after assuming APAP is in place. This is the right state "
                "for deciding what remains worth doing once the airway problem is treated."
            ),
            base_item_ids=current_without_insomnia_rx + ["apap_nightly"],
            options=[
                ChoiceOptionSpec(id="no_insomnia_rx", label="No insomnia Rx", added_item_ids=[]),
                ChoiceOptionSpec(id="trazodone_50mg", label="Use trazodone", added_item_ids=["trazodone_50mg"]),
                ChoiceOptionSpec(id="doxepin_3mg", label="Use doxepin", added_item_ids=["doxepin_3mg"]),
                ChoiceOptionSpec(
                    id="daridorexant_25mg",
                    label="Use daridorexant",
                    added_item_ids=["daridorexant_25mg"],
                ),
                ChoiceOptionSpec(
                    id="lemborexant_5mg",
                    label="Use lemborexant",
                    added_item_ids=["lemborexant_5mg"],
                ),
                ChoiceOptionSpec(
                    id="suvorexant_10mg",
                    label="Use suvorexant",
                    added_item_ids=["suvorexant_10mg"],
                ),
            ],
        ),
        ChoiceStateSpec(
            id="post_oral_appliance_insomnia_choice_if_needed",
            label="Insomnia choice after oral appliance",
            description="Conditional insomnia-med comparison after assuming a custom oral appliance is in place.",
            base_item_ids=current_without_insomnia_rx + ["oral_appliance_custom"],
            options=[
                ChoiceOptionSpec(id="no_insomnia_rx", label="No insomnia Rx", added_item_ids=[]),
                ChoiceOptionSpec(id="trazodone_50mg", label="Use trazodone", added_item_ids=["trazodone_50mg"]),
                ChoiceOptionSpec(id="doxepin_3mg", label="Use doxepin", added_item_ids=["doxepin_3mg"]),
                ChoiceOptionSpec(
                    id="daridorexant_25mg",
                    label="Use daridorexant",
                    added_item_ids=["daridorexant_25mg"],
                ),
                ChoiceOptionSpec(
                    id="lemborexant_5mg",
                    label="Use lemborexant",
                    added_item_ids=["lemborexant_5mg"],
                ),
                ChoiceOptionSpec(
                    id="suvorexant_10mg",
                    label="Use suvorexant",
                    added_item_ids=["suvorexant_10mg"],
                ),
            ],
        ),
    ]
    sleep_decision_states = serialize_decision_state_evaluations(
        evaluate_decision_states(
            sleep_decision_specs,
            single_qalys=state.single_qalys,
            annual_costs=state.annual_costs,
            cost_values=state.cost_values,
            horizon_years=state.config.horizon_years,
            stack_interaction_penalty_fn=state.portfolio_stack_penalty_fn,
            marginal_cost_value_fn=state.product_marginal_cost_value_fn,
            total_annual_cost_fn=state.product_total_annual_cost_fn,
            total_cost_value_fn=state.product_total_cost_value_fn,
            exclusive_groups=exclusive_groups,
        ),
        item_name_by_id=item_name_by_id,
        product_ids_for_stack=lambda item_ids: selected_product_names(list(item_ids), resources),
        item_summary_for_id=option_item_summary,
    )
    sleep_decision_sequence = serialize_decision_sequence(
        [
            DecisionSequenceStepSpec(
                step=1,
                id="choose_primary_therapy",
                label="Choose primary OSA therapy first",
                state_id="osa_primary_therapy_choice",
            ),
            DecisionSequenceStepSpec(
                step=2,
                id="reassess_after_primary_therapy",
                label="Reassess whether an insomnia Rx is still needed after primary therapy",
                preferred_state_id="post_apap_insomnia_choice_if_needed",
                alternative_state_id="post_oral_appliance_insomnia_choice_if_needed",
            ),
        ]
    )

    summary = {
        "selection_mode": "ordered_by_marginal_cost_per_qaly",
        "total_items": len(state.selected_ids),
        "total_products": len(selected_product_names(state.selected_ids, resources)),
        "total_annual_cost": round(state.product_total_annual_cost_fn(state.selected_ids)),
        "total_days": round(state.portfolio_result[-1]["total_qaly"] * 365.25, 1) if state.portfolio_result else 0,
        "total_qaly": round(state.portfolio_result[-1]["total_qaly"], 4) if state.portfolio_result else 0,
        "interaction_penalty_days": round(optimal_portfolio_interactions["interaction_penalty_days"], 1),
        "catalog_size": len(CATALOG),
        "analysis_catalog_size": len(state.analysis_catalog),
        "db_products": len(resources.products),
        "db_ingredients": sum(len(items) for items in resources.ingredients.values()),
        "db_meal_recipes": len(resources.meal_costs),
        "discounted_cost_factor": round(state.cost_factor, 3),
    }

    return {
        "generated_at": date.today().isoformat(),
        "profile": {
            "age": state.config.profile.age,
            "sex": state.config.profile.sex,
            "bmi_category": state.config.profile.bmi_category,
            "smoking_status": state.config.profile.smoking_status,
        },
        "config": {
            "wtp": state.config.wtp,
            "selection_mode": "ordered_by_marginal_cost_per_qaly",
            "horizon_years": state.config.horizon_years,
            "qaly_discount_rate": state.config.qaly_discount_rate,
            "cost_discount_rate": state.config.cost_discount_rate,
            "pub_bias_shrinkage": state.config.pub_bias_shrinkage,
            "n_simulations": state.config.n_simulations,
        },
        "sleep_model": (
            {
                "annual_qaly_loss": round(state.protocol_sleep_estimate.annual_qaly_loss, 5),
                "mortality_signal": round(state.protocol_sleep_estimate.mortality_signal, 5),
                "baseline_hazard_multiplier": round(
                    sleep_baseline_mortality_multiplier(state.protocol_sleep_estimate),
                    6,
                ),
                "component_burdens": {
                    key: round(value, 4)
                    for key, value in state.protocol_sleep_estimate.component_burdens.items()
                },
                "component_losses": {
                    key: round(value, 5)
                    for key, value in state.protocol_sleep_estimate.component_losses.items()
                },
                "airway": (
                    {
                        "upper_airway_probability": round(state.protocol_sleep_estimate.airway.upper_airway_probability, 3),
                        "nasal_inflammation_probability": round(state.protocol_sleep_estimate.airway.nasal_inflammation_probability, 3),
                        "mucus_probability": round(state.protocol_sleep_estimate.airway.mucus_probability, 3),
                        "response_signal": round(state.protocol_sleep_estimate.airway.response_signal, 3),
                    }
                    if state.protocol_sleep_estimate.airway is not None
                    else None
                ),
                "overlap_multipliers": state.benefit_overlap_multipliers,
            }
            if state.protocol_sleep_estimate is not None
            else None
        ),
        "summary": summary,
        "current_stack": current_stack,
        "optimal_portfolio": optimal_portfolio,
        "decision_states": sleep_decision_states,
        "decision_sequence": sleep_decision_sequence,
        "supplements": supplements,
        "schedule": schedule,
        "meal_costs": resources.meal_costs,
        "bundles": bundles,
        "portfolio": portfolio,
    }
