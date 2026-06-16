#!/usr/bin/env python3
"""Generate election-margin forecast prompts from the baseline manifest."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROMPTS = ROOT / "prompts"
SOURCES = ROOT / "sources.json"
BASELINES = ROOT / "outputs" / "baselines.json"

MARGINS = [-20, -10, -1, 1, 10, 20]


def winner_from_margin(margin: int) -> str:
    if margin > 0:
        return "Janeese Lewis George"
    return "Kenyan McDuffie"


def scenario_id(margin: int) -> str:
    if margin > 0:
        return f"george_wins_by_{margin}"
    return f"mcduffie_wins_by_{abs(margin)}"


def compact_baseline(metric_id: str, baselines: dict) -> dict:
    metric = baselines["metrics"][metric_id]
    if metric_id == "dc_real_gdp":
        return {
            "latest": metric["latest"],
            "year_over_year_percent": metric["year_over_year_percent"],
            "recent_history": metric["history"][-8:],
        }
    if metric_id == "bike_lane_miles":
        return {
            "route_miles": metric["route_miles"],
            "lane_miles": metric["lane_miles"],
            "protected_route_miles": metric["protected_route_miles"],
            "protected_lane_miles": metric["protected_lane_miles"],
            "segments": metric["segments"],
        }
    if metric_id == "traffic_fatalities":
        return {
            "history": metric["history"],
            "current_year_to_date": metric["current_year_to_date"],
        }
    if metric_id == "housing_permits":
        return {
            "annual": metric["annual"],
            "latest_period": metric["latest_period"],
            "latest_month": metric["latest_month"],
            "limitation": metric["limitation"],
        }
    raise KeyError(metric_id)


def build_base_context(manifest: dict, baselines: dict) -> str:
    metrics = "\n".join(
        f"- {metric['id']}: {metric['label']} ({metric['unit']}); source: {metric['source_url']}"
        for metric in manifest["metrics"]
    )
    candidates = "\n".join(
        f"- {candidate['name']}: {candidate['summary_for_prompts']} Source: {candidate.get('platform_url') or candidate.get('campaign_url')}"
        for candidate in manifest["candidates"]
    )
    return "\n".join(
        [
            "# Base context for D.C. mayor forecast prompts",
            "",
            f"Election: {manifest['race']['name']}.",
            "",
            "The D.C. mayoral term begins at noon on January 2, 2027 and ends at noon on January 2, 2031. Forecast outcomes for the end of calendar year 2030 unless the metric target says otherwise.",
            "",
            "Candidates:",
            "",
            candidates,
            "",
            "Primary-source outcome metrics:",
            "",
            metrics,
            "",
            "Baselines:",
            "",
            "```json",
            json.dumps(baselines["metrics"], indent=2),
            "```",
            "",
            "Causal design:",
            "",
            "Use Janeese Lewis George's vote margin over Kenyan McDuffie as the running variable. Negative margins mean McDuffie wins. Positive margins mean George wins.",
            "",
            "The close-election estimand is the discontinuity between George winning by 1 point and McDuffie winning by 1 point. Do not treat the 20-point spread contrast as a clean causal effect of the winner; it also includes mandate, coalition, turnout, and broader political-environment differences.",
            "",
        ]
    )


def build_prompt(
    metric: dict,
    margin: int,
    baseline: dict,
    candidates: list[dict],
) -> dict:
    winner = winner_from_margin(margin)
    spread = abs(margin)
    scenario = scenario_id(margin)
    candidate_context = "\n".join(
        f"- {candidate['name']}: {candidate['summary_for_prompts']} Sources: "
        + ", ".join(
            url
            for url in [
                candidate.get("campaign_url"),
                candidate.get("platform_url"),
                candidate.get("housing_platform_url"),
                candidate.get("transportation_platform_url"),
            ]
            if url
        )
        for candidate in candidates
    )
    return {
        "metric_id": metric["id"],
        "scenario_id": scenario,
        "candidate": winner,
        "george_margin_points": margin,
        "prompt": "\n".join(
            [
                "You are forecasting a D.C. mayoral policy outcome for a blog analysis.",
                "",
                "Scenario:",
                f"- Winner: {winner}",
                f"- Janeese Lewis George margin over Kenyan McDuffie: {margin:+} percentage points",
                f"- Interpreted spread: {winner} wins by {spread} point(s)",
                f"- Forecast target: {metric['forecast_target']}",
                "",
                "Candidate mechanism context:",
                candidate_context,
                "",
                "Metric:",
                f"- ID: {metric['id']}",
                f"- Label: {metric['label']}",
                f"- Unit: {metric['unit']}",
                f"- Primary government source: {metric['source_url']}",
                f"- Series definition: {metric['series_definition']}",
                "",
                "Baseline data:",
                "```json",
                json.dumps(baseline, indent=2),
                "```",
                "",
                "Instructions:",
                "1. Forecast the metric distribution conditional on the scenario.",
                "2. Use the government baseline as the measurement anchor.",
                "3. You may use candidate platforms as mechanism evidence, but do not invent new baseline data.",
                "4. Keep the close-election causal interpretation separate from mandate effects.",
                "5. Return JSON only, matching the provided schema.",
                "",
                "Required JSON fields:",
                "- metric_id",
                "- scenario_id",
                "- candidate",
                "- george_margin_points",
                "- forecast_target",
                "- unit",
                "- p05, p25, p50, p75, p95",
                "- main_mechanisms: 2-6 strings",
                "- uncertainty_notes: 1-5 strings",
                "- primary_sources_used: URLs",
                "- near_cutoff_interpretation: explain whether this scenario helps identify the close-election RD contrast or a mandate/political-environment contrast",
            ]
        ),
    }


def main() -> None:
    manifest = json.loads(SOURCES.read_text(encoding="utf-8"))
    baselines = json.loads(BASELINES.read_text(encoding="utf-8"))
    PROMPTS.mkdir(exist_ok=True)

    (PROMPTS / "base-context.md").write_text(
        build_base_context(manifest, baselines), encoding="utf-8"
    )

    cells = []
    for margin in MARGINS:
        for metric in manifest["metrics"]:
            cells.append(
                build_prompt(
                    metric,
                    margin,
                    compact_baseline(metric["id"], baselines),
                    manifest["candidates"],
                )
            )

    with (PROMPTS / "forecast-cells.jsonl").open("w", encoding="utf-8") as f:
        for cell in cells:
            f.write(json.dumps(cell) + "\n")

    print(f"Wrote {len(cells)} prompt cells to {PROMPTS / 'forecast-cells.jsonl'}")


if __name__ == "__main__":
    main()
