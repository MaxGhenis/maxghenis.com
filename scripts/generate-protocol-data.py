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
HEALTH_DB = Path.home() / "clawd" / "data" / "health.db"

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


# --- Health DB: products, ingredients, timing ---

def load_health_db():
    """Load supplement products and ingredients from health DB."""
    if not HEALTH_DB.exists():
        print(f"Warning: health DB not found at {HEALTH_DB}, skipping DB enrichment")
        return {}, {}

    conn = sqlite3.connect(HEALTH_DB)
    conn.row_factory = sqlite3.Row

    # Products keyed by name
    products = {}
    for row in conn.execute(
        "SELECT * FROM supplement_products WHERE active = 1"
    ):
        products[row["name"]] = dict(row)

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

    conn.close()
    print(f"Loaded {len(products)} products, {sum(len(v) for v in ingredients.values())} ingredients from health DB")
    return products, ingredients


db_products, db_ingredients = load_health_db()


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
    "vitamin_d_2000": "Vitamin D 2000 IU",
    "vitamin_k2": "Vitamin K2",
    "prebiotics": "Goddess Agave Inulin",
    "cocoa_flavanols_500": None,  # part of nutty pudding recipe, not a product
    "lions_mane_1g": "Lions Mane 1g",
    "cistanche_200": "Cistanche 200mg",
    "apigenin_50": "Apigenin 50mg",
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
    db_name = CATALOG_TO_DB.get(catalog_id)
    if not db_name or db_name not in db_products:
        return

    product = db_products[db_name]
    supplement_entry["db_product"] = db_name
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
    s = {
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
        "cost_per_qaly": round(r["cost_per_qaly"]) if r.get("cost_per_qaly") else None,
    }
    enrich_with_db(s)
    supplements.append(s)

# Build daily schedule from DB products
schedule = {"morning_mix": [], "meal_1": [], "meal_2": [], "before_bed": []}
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
    "db_products": len(db_products),
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
        "n_simulations": config.n_simulations,
    },
    "summary": summary,
    "supplements": supplements,
    "schedule": schedule,
    "bundles": bundles,
    "portfolio": portfolio,
}

OUTPUT.write_text(json.dumps(data, indent=2))
print(f"Wrote {OUTPUT}")
print(f"  {len(supplements)} supplements, {len(bundles)} bundles, {len(portfolio)} portfolio steps")
print(f"  Schedule: {sum(len(v) for v in schedule.values())} items across {len(schedule)} time slots")
print(f"  Summary: {summary['total_items']} selected, {summary['total_days']:.0f} days, ${summary['total_annual_cost']}/yr")
