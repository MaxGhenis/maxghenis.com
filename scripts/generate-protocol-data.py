"""
Generate protocol page data from Optiqal catalog + health DB.

Run from the optiqal-ai/python directory:
    cd ~/optiqal-ai/python && uv run python ~/maxghenis.com/scripts/generate-protocol-data.py

Outputs: ~/maxghenis.com/src/data/protocol-data.json

Data sources:
  - Optiqal catalog: QALY analysis, evidence confidence, portfolio optimization
  - Health DB (~/clawd/data/health.db): product details, ingredients, timing, prices
"""

import json
import sqlite3
import sys
from dataclasses import replace
from datetime import date
from pathlib import Path

# Ensure optiqal is importable
sys.path.insert(0, str(Path.home() / "optiqal-ai" / "python"))

from optiqal import (
    Profile,
    AnalysisConfig,
    analyze,
    CATALOG,
    BUNDLES,
)

def _resolve_output_path() -> Path:
    """Return the active protocol-data.json location.

    Prefers the directory where the Astro source currently lives; falls back
    to ``~/maxghenis.com/src/data/protocol-data.json``.
    """
    candidates = [
        Path.home() / "maxghenis.com" / "src" / "data" / "protocol-data.json",
        Path.home() / "worktrees" / "maxghenis-com-master" / "src" / "data" / "protocol-data.json",
    ]
    for candidate in candidates:
        if candidate.parent.exists():
            return candidate
    raise FileNotFoundError(
        "Could not locate an existing src/data directory for protocol-data.json."
    )


OUTPUT = _resolve_output_path()
HEALTH_DB = Path.home() / "clawd" / "data" / "health.db"

PROFILE = Profile(
    age=39,
    sex="male",
    bmi_category="normal",
    smoking_status="never",
    has_diabetes=False,
    has_hypertension=False,
    activity_level="light",
)

# Primary analysis at Max's personal WTP ($200K/QALY).
config = AnalysisConfig(
    profile=PROFILE,
    n_simulations=50_000,
    random_state=42,
)

print("Running Optiqal analysis...")
result = analyze(config)

# WTP sensitivity panel. For each alternative willingness-to-pay threshold we
# rerun the greedy portfolio on the same item simulations — this is much
# cheaper than re-running Monte Carlo because the per-item QALY draws don't
# depend on WTP. The frontier shows which items survive at a stricter bar.
WTP_FRONTIER_LEVELS = (50_000, 100_000, 150_000, 200_000)


def run_wtp_frontier(item_results, wtp_levels):
    """Run greedy portfolio across multiple WTP levels, reusing item sims."""
    from optiqal.combination import find_optimal_portfolio_with_costs
    from optiqal.stack_interactions import build_stack_interaction_penalty_fn

    single_qalys = {r["id"]: r["total_qaly"] for r in item_results}
    annual_costs = {r["id"]: r.get("effective_annual_cost", r["annual_cost"]) for r in item_results}
    cost_values = {r["id"]: r["total_cost"] for r in item_results}

    penalty_fn = build_stack_interaction_penalty_fn(
        catalog_entries=CATALOG,
        profile=config.profile,
        qaly_discount_rate=config.qaly_discount_rate,
        item_qalys=single_qalys,
    )

    frontier = []
    for wtp in wtp_levels:
        portfolio = find_optimal_portfolio_with_costs(
            single_qalys=single_qalys,
            annual_costs=annual_costs,
            cost_values=cost_values,
            wtp=wtp,
            horizon_years=config.horizon_years,
            stack_interaction_penalty_fn=penalty_fn,
            portfolio_qaly_ceiling=config.portfolio_qaly_ceiling,
        )
        last = portfolio[-1] if portfolio else None
        frontier.append({
            "wtp": wtp,
            "n_items": len(last["selected_interventions"]) if last else 0,
            "total_qaly": round(last["total_qaly"], 4) if last else 0,
            "total_raw_qaly": round(last.get("total_raw_qaly", 0), 4) if last else 0,
            "total_days": round(last["total_qaly"] * 365.25, 1) if last else 0,
            "total_annual_cost": round(last["total_annual_cost"]) if last else 0,
            "selected_ids": list(last["selected_interventions"]) if last else [],
        })
    return frontier


print("Running WTP sensitivity frontier...")
wtp_frontier = run_wtp_frontier(result.item_results, WTP_FRONTIER_LEVELS)
for row in wtp_frontier:
    print(f"  WTP=${row['wtp']:>7,}: {row['n_items']:>2} items, "
          f"{row['total_qaly']:.2f} QALY, ${row['total_annual_cost']}/yr")


# --- Health DB: products, ingredients, timing ---

def load_health_db():
    """Load supplement products and ingredients from health DB."""
    if not HEALTH_DB.exists():
        print(f"Warning: health DB not found at {HEALTH_DB}, skipping DB enrichment")
        return {}, {}, {}, {}

    conn = sqlite3.connect(HEALTH_DB)
    conn.row_factory = sqlite3.Row

    # Products keyed by name. Active products are the current schedule;
    # inactive products can still price candidate/unbundled catalog entries.
    all_products = {}
    products = {}
    for row in conn.execute("SELECT * FROM supplement_products"):
        product = dict(row)
        all_products[row["name"]] = product
        if product.get("active") == 1:
            products[row["name"]] = product

    # Ingredients grouped by product
    ingredients = {}
    for row in conn.execute(
        "SELECT * FROM supplement_ingredients ORDER BY product, ingredient"
    ):
        product = row["product"]
        if product not in ingredients:
            ingredients[product] = []
        ingredients[product].append({
            "ingredient": row["ingredient"],
            "amount": row["amount"],
            "unit": row["unit"],
        })

    catalog_product_map = {
        row["catalog_id"]: row["product_name"]
        for row in conn.execute(
            "SELECT catalog_id, product_name FROM catalog_product_mappings ORDER BY catalog_id"
        )
    }

    conn.close()
    print(
        f"Loaded {len(products)} active products ({len(all_products)} total), "
        f"{sum(len(v) for v in ingredients.values())} "
        f"ingredients, {len(catalog_product_map)} catalog mappings from health DB"
    )
    return products, all_products, ingredients, catalog_product_map


db_products, db_all_products, db_ingredients, db_catalog_product_map = load_health_db()


# Evidence confidence heuristic based on confounding priors and log_sd
def evidence_confidence(entry):
    """Classify evidence confidence: high, medium, or low."""
    causal_mean = entry.conf_alpha / (entry.conf_alpha + entry.conf_beta)
    if causal_mean > 0.55 and entry.log_sd <= 0.12:
        return "high"
    elif causal_mean > 0.30 or entry.log_sd <= 0.15:
        return "medium"
    return "low"


# Category display names
CATEGORY_LABELS = {
    "rx_current": "Prescriptions",
    "rx_candidate": "Prescription candidates",
    "supplement_current": "Current supplements",
    "supplement_bought": "Recently added",
    "supplement_candidate": "Under evaluation",
    "sleep_current": "Current sleep interventions",
    "sleep_candidate": "Sleep intervention candidates",
}

# Status labels
STATUS_LABELS = {
    "rx_current": "taking",
    "rx_candidate": "considering",
    "supplement_current": "taking",
    "supplement_bought": "testing",
    "supplement_candidate": "watching",
    "sleep_current": "taking",
    "sleep_candidate": "considering",
}

# Map Optiqal catalog IDs to health DB product names
CATALOG_TO_DB = {
    "finasteride_1.25mg": "Finasteride",
    "tadalafil_2.5mg": "Tadalafil",
    "trazodone_50mg": "Trazodone",
    "omega3_clo": "Nordic Naturals Arctic Cod Liver Oil",
    "garlic_1200": "Kyolic Aged Garlic Extract",
    "creatine_5g": "Blueprint Creatine",
    "nac_1200": "Blueprint NAC+Ginger+Curcumin",  # currently using Blueprint bundle
    "curcumin_250": "Blueprint NAC+Ginger+Curcumin",
    "ginger_400": "Blueprint NAC+Ginger+Curcumin",
    "magnesium_200": "Magnesium Lysinate Glycinate",
    "melatonin_300mcg": "Melatonin",
    "collagen_22g": "Blueprint Collagen Peptides",
    "vitamin_d_2000": "Blueprint Essential Capsules",
    "vitamin_k2": "Blueprint Advanced Antioxidants",
    "prebiotics": "Goddess Agave Inulin",
    "probiotic_daily": "Sports Research Daily Probiotics",
    "cocoa_flavanols_500": None,  # part of nutty pudding recipe, not a product
    "lions_mane_1g": "Lions Mane 1g",
    "cistanche_200": "Cistanche 200mg",
    "zinc_carnosine_75": "Zinc Carnosine 75mg",
    "apigenin_50": "Apigenin 50mg",
    "ashwagandha_600": "Ashwagandha KSM-66 600mg",
    "glycine_2g": "Glycine 2g",
    "omega3_epa_2g": "High-EPA Omega-3",
    "taurine_500_topup": "Taurine 500mg",
    # Blueprint bundle items with $0 cost (included in bundles)
    "astaxanthin_12": "Blueprint Advanced Antioxidants",
    "lutein_zeaxanthin": "Blueprint Advanced Antioxidants",
    "lycopene_15": "Blueprint Advanced Antioxidants",
    "fisetin_100": "Blueprint Essential Capsules",
    "spermidine_10": "Blueprint Essential Capsules",
    "nr_300": "Blueprint Essential Capsules",
    "ubiquinol_50": "Blueprint Essential Capsules",
    "lithium_1mg_orotate": "Blueprint Essential Capsules",
    "boron_3": "Blueprint Essential Capsules",
    "broccoli_seed_200": "Blueprint Essential Capsules",
    "luteolin_100": "Blueprint Essential Capsules",
    "hyaluronic_acid_120": "Blueprint Longevity Mix",
}


def enrich_with_db(supplement_entry):
    """Enrich an Optiqal supplement entry with health DB product data."""
    catalog_id = supplement_entry["id"]
    db_name = db_catalog_product_map.get(catalog_id) or CATALOG_TO_DB.get(catalog_id)
    if not db_name or db_name not in db_all_products:
        return

    product = db_all_products[db_name]
    supplement_entry["db_product"] = db_name
    supplement_entry["db_product_active"] = product.get("active") == 1
    supplement_entry["brand"] = product.get("brand")
    supplement_entry["serving_size"] = product.get("serving_size")
    supplement_entry["daily_servings"] = product.get("daily_servings")
    supplement_entry["dose_notes"] = product.get("daily_dose_notes")
    supplement_entry["time_of_day"] = product.get("time_of_day")
    supplement_entry["source_url"] = product.get("source_url")
    supplement_entry["package_price"] = product.get("package_price")

    if db_name in db_ingredients:
        supplement_entry["ingredients"] = db_ingredients[db_name]


# Build supplement entries
supplements = []
for r in result.item_results:
    entry = CATALOG[r["id"]]
    posterior_ci = r.get("hr_posterior_ci95")
    s = {
        "id": r["id"],
        "name": entry.name,
        "category": entry.category,
        "category_label": CATEGORY_LABELS[entry.category],
        "status": STATUS_LABELS[entry.category],
        "hr_observed": entry.hr_observed,
        # Publication-bias-only correction (kept for continuity; do not use to
        # compare items — the sim actually applies the posterior HR below.)
        "hr_corrected": round(r["hr_corrected"], 4),
        "pub_bias_shrinkage": round(r.get("pub_bias_shrinkage", 0.30), 3),
        "study_quality": r.get("study_quality"),
        # Posterior HR = what the simulator applies after pub-bias + Bayesian
        # confounding + profile transport + evidence shrinkage. This is the
        # HR users should compare items on.
        "hr_posterior_mean": round(r["hr_posterior_mean"], 4) if r.get("hr_posterior_mean") is not None else None,
        "hr_posterior_median": round(r["hr_posterior_median"], 4) if r.get("hr_posterior_median") is not None else None,
        "hr_posterior_ci95_low": round(posterior_ci[0], 4) if posterior_ci else None,
        "hr_posterior_ci95_high": round(posterior_ci[1], 4) if posterior_ci else None,
        # Mortality-arm QALY mean vs median. Surfacing both lets readers see
        # the Jensen corridor: mean is the decision metric (used in $/QALY
        # and ICER), median is a convexity-invariant diagnostic that shouldn't
        # drive ranking but flags interventions with heavy-tail harm exposure.
        "mortality_qaly_mean": round(r["mortality_qaly_mean"], 5) if r.get("mortality_qaly_mean") is not None else None,
        "mortality_qaly_median": round(r["mortality_qaly_median"], 5) if r.get("mortality_qaly_median") is not None else None,
        "days": round(r["days"], 1),
        "ci_low": round(r["ci_low"], 1) if r.get("ci_low") is not None else None,
        "ci_high": round(r["ci_high"], 1) if r.get("ci_high") is not None else None,
        "p_benefit": round(r["p_benefit"], 2),
        "annual_cost": entry.annual_cost,
        "effective_annual_cost": round(r.get("effective_annual_cost", entry.annual_cost), 2),
        "bundle_cost_share": round(r.get("bundle_cost_share", 0.0), 2),
        "bundle_id": r.get("bundle_id"),
        "gross_value": round(r["gross_value"]),
        "qol_annual": round(entry.raw_qol_annual(), 6),
        "effective_qol_annual": round(entry.effective_qol_annual(), 6),
        "qol_effects": r.get("qol_effects", []),
        "evidence": evidence_confidence(entry),
        "notes": entry.notes,
        "sources": list(entry.sources) if entry.sources else [],
        "in_portfolio": r["id"] in result.selected_ids,
        "cost_per_qaly": round(r["cost_per_qaly"]) if r.get("cost_per_qaly") else None,
    }
    enrich_with_db(s)
    supplements.append(s)

# Build daily schedule from DB products
schedule = {
    "morning_mix": [],
    "meal_1": [],
    "meal_2": [],
    "before_bed": [],
    "bedtime": [],
    "anytime": [],
}
for name, product in sorted(db_products.items()):
    times = (product.get("time_of_day") or "").split(",")
    for t in times:
        t = t.strip()
        if t in schedule:
            schedule[t].append({
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
                "ingredients": db_ingredients.get(name, []),
            })

# Build bundle entries
bundles = []
for b in result.bundle_recommendations:
    bundle_def = BUNDLES[b["bundle_id"]]
    bundles.append({
        "id": b["bundle_id"],
        "name": b["bundle_name"],
        "annual_cost": b["annual_cost"],
        "monthly_cost": round(b["annual_cost"] / 12),
        "items": list(bundle_def.item_ids),
        "selected_items": b["selected_items"],
        "n_selected": b["n_selected"],
        "n_total": b["n_total"],
        "net_value": round(b["net_value"]),
        "worth_it": b["worth_it"],
    })

# Portfolio steps
portfolio = []
for step in result.portfolio:
    total_raw = step.get("total_raw_qaly")
    total_qaly = step.get("total_qaly")
    saturation = (
        round(total_qaly / total_raw, 3)
        if total_raw and total_raw > 0 and total_qaly is not None
        else None
    )
    portfolio.append({
        "step": step["step"],
        "name": step["added_intervention"],
        "marginal_days": round(step["marginal_qaly"] * 365.25, 1),
        "marginal_net_value": round(step["marginal_net_value"]),
        "total_annual_cost": round(step["total_annual_cost"]),
        "total_qaly": round(total_qaly, 4) if total_qaly is not None else None,
        "total_raw_qaly": round(total_raw, 4) if total_raw is not None else None,
        "ceiling_retention": saturation,
        "interaction_penalty_qaly": round(step.get("interaction_penalty_qaly", 0.0), 4),
    })

# Summary
last_step = result.portfolio[-1] if result.portfolio else None
summary = {
    "total_items": len(result.selected_ids),
    "total_annual_cost": round(result.total_annual_cost),
    "total_days": round(result.total_days, 1),
    "total_qaly": round(result.total_qaly, 4),
    "total_raw_qaly": round(last_step["total_raw_qaly"], 4) if last_step else None,
    "portfolio_qaly_ceiling": config.portfolio_qaly_ceiling,
    "catalog_size": len(CATALOG),
    "db_products": len(db_products),
    "db_products_total": len(db_all_products),
    "db_ingredients": sum(len(v) for v in db_ingredients.values()),
}

data = {
    "generated_at": date.today().isoformat(),
    "profile": {
        "age": config.profile.age,
        "sex": config.profile.sex,
        "bmi_category": config.profile.bmi_category,
        "smoking_status": config.profile.smoking_status,
    },
    "config": {
        "wtp": config.wtp,
        "horizon_years": config.horizon_years,
        "qaly_discount_rate": config.qaly_discount_rate,
        "cost_discount_rate": config.cost_discount_rate,
        "pub_bias_shrinkage": config.pub_bias_shrinkage,
        "portfolio_qaly_ceiling": config.portfolio_qaly_ceiling,
        "n_simulations": config.n_simulations,
    },
    "summary": summary,
    "supplements": supplements,
    "schedule": schedule,
    "bundles": bundles,
    "portfolio": portfolio,
    "wtp_frontier": wtp_frontier,
}

OUTPUT.write_text(json.dumps(data, indent=2))
print(f"Wrote {OUTPUT}")
print(f"  {len(supplements)} supplements, {len(bundles)} bundles, {len(portfolio)} portfolio steps")
print(f"  Schedule: {sum(len(v) for v in schedule.values())} items across {len(schedule)} time slots")
print(f"  Summary: {summary['total_items']} selected, {summary['total_days']:.0f} days, ${summary['total_annual_cost']}/yr")
