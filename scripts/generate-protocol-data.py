"""
Generate protocol page data from Optiqal catalog.

Run from the optiqal-ai/python directory:
    cd ~/optiqal-ai/python && uv run python ~/maxghenis.com/scripts/generate-protocol-data.py

Outputs: ~/maxghenis.com/src/data/protocol-data.json
"""

import json
import sys
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

OUTPUT = Path.home() / "maxghenis.com" / "src" / "data" / "protocol-data.json"

# Max's profile
config = AnalysisConfig(
    profile=Profile(
        age=39,
        sex="male",
        bmi_category="normal",
        smoking_status="never",
        has_diabetes=False,
        has_hypertension=False,
        activity_level="light",
    ),
    n_simulations=50_000,
    random_state=42,
)

print("Running Optiqal analysis...")
result = analyze(config)

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
}

# Status labels
STATUS_LABELS = {
    "rx_current": "taking",
    "rx_candidate": "considering",
    "supplement_current": "taking",
    "supplement_bought": "testing",
    "supplement_candidate": "watching",
}

# Build supplement entries
supplements = []
for r in result.item_results:
    entry = CATALOG[r["id"]]
    supplements.append({
        "id": r["id"],
        "name": entry.name,
        "category": entry.category,
        "category_label": CATEGORY_LABELS[entry.category],
        "status": STATUS_LABELS[entry.category],
        "hr_observed": entry.hr_observed,
        "hr_corrected": round(r["hr_corrected"], 4),
        "days": round(r["days"], 1),
        "p_benefit": round(r["p_benefit"], 2),
        "annual_cost": entry.annual_cost,
        "gross_value": round(r["gross_value"]),
        "qol_annual": entry.qol_annual,
        "evidence": evidence_confidence(entry),
        "notes": entry.notes,
        "sources": list(entry.sources) if entry.sources else [],
        "in_portfolio": r["id"] in result.selected_ids,
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
    portfolio.append({
        "step": step["step"],
        "name": step["added_intervention"],
        "marginal_days": round(step["marginal_qaly"] * 365.25, 1),
        "marginal_net_value": round(step["marginal_net_value"]),
        "total_annual_cost": round(step["total_annual_cost"]),
        "diminishing_returns": round(step["diminishing_returns_factor"], 2),
    })

# Summary
summary = {
    "total_items": len(result.selected_ids),
    "total_annual_cost": round(result.total_annual_cost),
    "total_days": round(result.total_days, 1),
    "total_qaly": round(result.total_qaly, 4),
    "catalog_size": len(CATALOG),
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
        "pub_bias_shrinkage": config.pub_bias_shrinkage,
        "n_simulations": config.n_simulations,
    },
    "summary": summary,
    "supplements": supplements,
    "bundles": bundles,
    "portfolio": portfolio,
}

OUTPUT.write_text(json.dumps(data, indent=2))
print(f"Wrote {OUTPUT} ({len(supplements)} supplements, {len(bundles)} bundles, {len(portfolio)} portfolio steps)")
print(f"Summary: {summary['total_items']} selected, {summary['total_days']:.0f} days, ${summary['total_annual_cost']}/yr")
