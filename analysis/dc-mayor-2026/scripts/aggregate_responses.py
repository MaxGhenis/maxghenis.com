#!/usr/bin/env python3
"""Aggregate model forecast files into RD-style summary tables."""

from __future__ import annotations

import json
import sys
from csv import DictWriter
from collections import defaultdict
from html import escape
from pathlib import Path
from statistics import median
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
RESPONSES = ROOT / "responses"
OUTPUTS = ROOT / "outputs"
SOURCES = ROOT / "sources.json"
PLOTS = OUTPUTS / "plots"

QUANTILES = ["p05", "p25", "p50", "p75", "p95"]
LOWER_IS_BETTER = {"traffic_fatalities"}
REQUIRED_FIELDS = [
    "metric_id",
    "scenario_id",
    "candidate",
    "george_margin_points",
    "forecast_target",
    "unit",
    *QUANTILES,
    "main_mechanisms",
    "uncertainty_notes",
    "primary_sources_used",
]

COMPACT_SOURCES = {
    "mcduffie": ["https://kenyanmcduffie.com/platform"],
    "george": [
        "https://janeesefordc.com/platform/homes-for-all/",
        "https://janeesefordc.com/platform/reliable-transportation-for-all/",
    ],
}

COMPACT_MECHANISMS = {
    "dc_real_gdp": [
        "Candidate platforms may affect business confidence, investment, and labor access.",
        "Federal-sector and regional macro conditions dominate the forecast range.",
    ],
    "bike_lane_miles": [
        "The route-mile stock baseline anchors expected network growth.",
        "Candidate transportation priorities affect DDOT emphasis and delivery pace.",
    ],
    "traffic_fatalities": [
        "Recent crash-fatality history anchors the forecast.",
        "Street design, enforcement, and travel behavior affect severe-crash risk.",
    ],
    "housing_permits": [
        "The Census permit trend anchors the forecast.",
        "Housing production goals, financing conditions, zoning, and agency capacity shape authorizations.",
    ],
}

COMPACT_UNCERTAINTY = {
    "dc_real_gdp": [
        "Local mayoral effects are small relative to federal budget and macroeconomic shocks."
    ],
    "bike_lane_miles": [
        "Project delivery, funding, and corridor-level politics can move route-mile stock."
    ],
    "traffic_fatalities": [
        "Annual fatalities are low-count outcomes with substantial year-to-year noise."
    ],
    "housing_permits": [
        "Annual permits are lumpy because a few multifamily projects can dominate the count."
    ],
}


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    records = []
    with path.open(encoding="utf-8") as f:
        for line_number, line in enumerate(f, start=1):
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{line_number}: invalid JSON: {exc}") from exc
            validate_record(record, path, line_number)
            record["_source_file"] = path.name
            record["_line_number"] = line_number
            record["_model"] = record.get("model") or path.stem
            record["_prompt_variant"] = record.get("prompt_variant", "named")
            records.append(record)
    return records


def read_compact_close_rd(path: Path) -> list[dict[str, Any]]:
    compact = json.loads(path.read_text(encoding="utf-8"))
    metrics = metric_lookup()
    records = []
    for row_number, row in enumerate(compact["records"], start=1):
        metric = metrics[row["metric_id"]]
        for key, margin, candidate_id, candidate in [
            ("mcduffie_wins_by_1", -1, "mcduffie", "Kenyan McDuffie"),
            ("george_wins_by_1", 1, "george", "Janeese Lewis George"),
        ]:
            values = row[key]
            record = {
                "metric_id": row["metric_id"],
                "scenario_id": key,
                "candidate": candidate,
                "george_margin_points": margin,
                "forecast_target": metric["forecast_target"],
                "unit": metric["unit"],
                **dict(zip(QUANTILES, values, strict=True)),
                "main_mechanisms": COMPACT_MECHANISMS[row["metric_id"]],
                "uncertainty_notes": COMPACT_UNCERTAINTY[row["metric_id"]],
                "primary_sources_used": [
                    metric["source_url"],
                    *COMPACT_SOURCES[candidate_id],
                ],
                "near_cutoff_interpretation": (
                    "This close-margin cell is part of the paired agent-implied "
                    "RD contrast at the winner cutoff."
                ),
                "model": compact.get("model", "codex-subagent"),
                "run_id": row["run_id"],
                "prompt_variant": compact.get("prompt_variant", "named"),
                "created_at": compact.get("created_at", "2026-06-16"),
            }
            validate_record(record, path, row_number)
            record["_source_file"] = path.name
            record["_line_number"] = row_number
            record["_model"] = record.get("model") or path.stem
            record["_prompt_variant"] = record.get("prompt_variant", "named")
            records.append(record)
    return records


def validate_record(record: dict[str, Any], path: Path, line_number: int) -> None:
    missing = [field for field in REQUIRED_FIELDS if field not in record]
    if missing:
        raise ValueError(f"{path}:{line_number}: missing fields: {', '.join(missing)}")

    for field in QUANTILES:
        if not isinstance(record[field], int | float):
            raise ValueError(f"{path}:{line_number}: {field} must be numeric")

    values = [record[field] for field in QUANTILES]
    if values != sorted(values):
        raise ValueError(f"{path}:{line_number}: quantiles must be nondecreasing")

    margin = record["george_margin_points"]
    expected_candidate = (
        "Janeese Lewis George" if margin > 0 else "Kenyan McDuffie"
    )
    if record["candidate"] != expected_candidate:
        raise ValueError(
            f"{path}:{line_number}: candidate {record['candidate']!r} does not match "
            f"margin {margin}; expected {expected_candidate!r}"
        )


def response_paths(args: list[str]) -> list[Path]:
    if args:
        return [Path(arg) for arg in args]
    return sorted([*RESPONSES.glob("*.jsonl"), *RESPONSES.glob("*.compact.json")])


def read_response_path(path: Path) -> list[dict[str, Any]]:
    if path.name.endswith(".compact.json"):
        return read_compact_close_rd(path)
    return read_jsonl(path)


def metric_lookup() -> dict[str, dict[str, str]]:
    manifest = json.loads(SOURCES.read_text(encoding="utf-8"))
    return {metric["id"]: metric for metric in manifest["metrics"]}


def fmt_value(value: float | None) -> str:
    if value is None:
        return ""
    if abs(value - round(value)) < 0.005:
        return f"{round(value):,}"
    return f"{value:,.2f}"


def fmt_diff(value: float | None) -> str:
    if value is None:
        return ""
    prefix = "+" if value > 0 else ""
    return prefix + fmt_value(value)


def percentile(values: list[float], p: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    if len(ordered) == 1:
        return ordered[0]
    position = (len(ordered) - 1) * p
    lower_index = int(position)
    upper_index = min(lower_index + 1, len(ordered) - 1)
    weight = position - lower_index
    return ordered[lower_index] * (1 - weight) + ordered[upper_index] * weight


def cell_medians(records: list[dict[str, Any]]) -> dict[tuple[str, str, str, int], float]:
    grouped = defaultdict(list)
    for record in records:
        key = (
            record["_model"],
            record["_prompt_variant"],
            record["metric_id"],
            int(record["george_margin_points"]),
        )
        grouped[key].append(float(record["p50"]))
    return {key: median(values) for key, values in grouped.items()}


def summarize(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    medians = cell_medians(records)
    rows = []
    model_metric_keys = sorted({key[:3] for key in medians})
    for model, prompt_variant, metric_id in model_metric_keys:
        value = lambda margin: medians.get((model, prompt_variant, metric_id, margin))
        george_close = value(1)
        mcduffie_close = value(-1)
        george_landslide = value(20)
        mcduffie_landslide = value(-20)
        rows.append(
            {
                "model": model,
                "prompt_variant": prompt_variant,
                "metric_id": metric_id,
                "mcduffie_close_p50": mcduffie_close,
                "george_close_p50": george_close,
                "close_election_rd_p50": (
                    george_close - mcduffie_close
                    if george_close is not None and mcduffie_close is not None
                    else None
                ),
                "george_mandate_gradient_p50": (
                    george_landslide - george_close
                    if george_landslide is not None and george_close is not None
                    else None
                ),
                "mcduffie_mandate_gradient_p50": (
                    mcduffie_landslide - mcduffie_close
                    if mcduffie_landslide is not None
                    and mcduffie_close is not None
                    else None
                ),
                "wide_margin_contrast_p50": (
                    george_landslide - mcduffie_landslide
                    if george_landslide is not None
                    and mcduffie_landslide is not None
                    else None
                ),
            }
        )
    return rows


def build_series(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped = defaultdict(list)
    for record in records:
        george_margin = int(record["george_margin_points"])
        key = (
            record["_model"],
            record["_prompt_variant"],
            record["metric_id"],
            -george_margin,
        )
        grouped[key].append(record)

    rows = []
    for (model, prompt_variant, metric_id, mcduffie_margin), items in sorted(
        grouped.items()
    ):
        george_margin = -mcduffie_margin
        rows.append(
            {
                "metric_id": metric_id,
                "model": model,
                "prompt_variant": prompt_variant,
                "mcduffie_margin_points": mcduffie_margin,
                "george_margin_points": george_margin,
                "candidate": (
                    "Kenyan McDuffie"
                    if mcduffie_margin > 0
                    else "Janeese Lewis George"
                ),
                "n": len(items),
                **{
                    quantile: median(float(item[quantile]) for item in items)
                    for quantile in QUANTILES
                },
            }
        )
    return rows


def write_series(rows: list[dict[str, Any]]) -> None:
    (OUTPUTS / "forecast-series.json").write_text(
        json.dumps(rows, indent=2) + "\n", encoding="utf-8"
    )
    fields = [
        "metric_id",
        "model",
        "prompt_variant",
        "mcduffie_margin_points",
        "george_margin_points",
        "candidate",
        "n",
        *QUANTILES,
    ]
    with (OUTPUTS / "forecast-series.csv").open(
        "w", encoding="utf-8", newline=""
    ) as f:
        writer = DictWriter(f, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def write_markdown(rows: list[dict[str, Any]]) -> None:
    metrics = metric_lookup()
    lines = [
        "# D.C. mayor model-response summary",
        "",
        "The RD column is `George close win` minus `McDuffie close win`. In the plot-ready series, the x-axis is McDuffie's margin over George, so those points are `McD -1` and `McD +1`.",
        "",
        "| Metric | Model | Prompt variant | George close p50 | McDuffie close p50 | RD p50 | George landslide vs close | McDuffie landslide vs close | Wide-margin contrast |",
        "|---|---|---|---:|---:|---:|---:|---:|---:|",
    ]
    for row in rows:
        metric = metrics[row["metric_id"]]["label"]
        lines.append(
            "| "
            + " | ".join(
                [
                    metric,
                    row["model"],
                    row["prompt_variant"],
                    fmt_value(row["george_close_p50"]),
                    fmt_value(row["mcduffie_close_p50"]),
                    fmt_diff(row["close_election_rd_p50"]),
                    fmt_diff(row["george_mandate_gradient_p50"]),
                    fmt_diff(row["mcduffie_mandate_gradient_p50"]),
                    fmt_diff(row["wide_margin_contrast_p50"]),
                ]
            )
            + " |"
        )
    (OUTPUTS / "model-summary.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def paired_rd_rows(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped = defaultdict(dict)
    for record in records:
        margin = int(record["george_margin_points"])
        if margin not in {-1, 1}:
            continue
        run_id = record.get("run_id")
        if not run_id:
            continue
        key = (
            record["_model"],
            record["_prompt_variant"],
            run_id,
            record["metric_id"],
        )
        grouped[key][margin] = float(record["p50"])

    rows = []
    for (model, prompt_variant, run_id, metric_id), margins in sorted(grouped.items()):
        if -1 not in margins or 1 not in margins:
            continue
        rows.append(
            {
                "model": model,
                "prompt_variant": prompt_variant,
                "run_id": run_id,
                "metric_id": metric_id,
                "mcduffie_close_p50": margins[-1],
                "george_close_p50": margins[1],
                "paired_rd_p50": margins[1] - margins[-1],
            }
        )
    return rows


def write_agent_rd_summary(records: list[dict[str, Any]]) -> None:
    metrics = metric_lookup()
    pair_rows = paired_rd_rows(records)
    by_metric = defaultdict(list)
    for row in pair_rows:
        by_metric[(row["model"], row["prompt_variant"], row["metric_id"])].append(
            row
        )

    summary_rows = []
    for (model, prompt_variant, metric_id), rows in sorted(by_metric.items()):
        values = [row["paired_rd_p50"] for row in rows]
        favors_george = [
            value < 0 if metric_id in LOWER_IS_BETTER else value > 0
            for value in values
        ]
        summary_rows.append(
            {
                "model": model,
                "prompt_variant": prompt_variant,
                "metric_id": metric_id,
                "metric_label": metrics[metric_id]["label"],
                "unit": metrics[metric_id]["unit"],
                "n": len(values),
                "paired_rd_p25": percentile(values, 0.25),
                "paired_rd_p50": percentile(values, 0.5),
                "paired_rd_p75": percentile(values, 0.75),
                "paired_rd_min": min(values),
                "paired_rd_max": max(values),
                "runs_favoring_george": sum(favors_george),
                "runs_favoring_mcduffie": len(favors_george) - sum(favors_george),
                "lower_is_better": metric_id in LOWER_IS_BETTER,
            }
        )

    (OUTPUTS / "agent-rd-pairs.json").write_text(
        json.dumps(pair_rows, indent=2) + "\n", encoding="utf-8"
    )
    (OUTPUTS / "agent-rd-summary.json").write_text(
        json.dumps(summary_rows, indent=2) + "\n", encoding="utf-8"
    )

    with (OUTPUTS / "agent-rd-pairs.csv").open(
        "w", encoding="utf-8", newline=""
    ) as f:
        writer = DictWriter(
            f,
            fieldnames=[
                "model",
                "prompt_variant",
                "run_id",
                "metric_id",
                "mcduffie_close_p50",
                "george_close_p50",
                "paired_rd_p50",
            ],
            lineterminator="\n",
        )
        writer.writeheader()
        writer.writerows(pair_rows)

    lines = [
        "# Agent-implied close-election RD summary",
        "",
        "Rows summarize paired within-run differences: `George wins by 1` minus `McDuffie wins by 1`.",
        "",
        "| Metric | Model | Prompt variant | Paired runs | p25 | p50 | p75 | Runs favoring George |",
        "|---|---|---|---:|---:|---:|---:|---:|",
    ]
    for row in summary_rows:
        lines.append(
            "| "
            + " | ".join(
                [
                    row["metric_label"],
                    row["model"],
                    row["prompt_variant"],
                    str(row["n"]),
                    fmt_diff(row["paired_rd_p25"]),
                    fmt_diff(row["paired_rd_p50"]),
                    fmt_diff(row["paired_rd_p75"]),
                    f"{row['runs_favoring_george']} of {row['n']}",
                ]
            )
            + " |"
        )
    (OUTPUTS / "agent-rd-summary.md").write_text(
        "\n".join(lines) + "\n", encoding="utf-8"
    )


def scale(value: float, old_min: float, old_max: float, new_min: float, new_max: float) -> float:
    return new_min + (value - old_min) * (new_max - new_min) / (old_max - old_min)


def svg_polyline(points: list[tuple[float, float]], color: str, dashed: bool) -> str:
    if len(points) < 2:
        return ""
    dash = ' stroke-dasharray="6 5"' if dashed else ""
    coords = " ".join(f"{x:.1f},{y:.1f}" for x, y in points)
    return (
        f'<polyline points="{coords}" fill="none" stroke="{color}" '
        f'stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"{dash} />'
    )


def write_metric_plot(metric_id: str, rows: list[dict[str, Any]], metric: dict[str, str]) -> None:
    width = 980
    height = 560
    left = 82
    right = 34
    top = 58
    bottom = 86
    plot_width = width - left - right
    plot_height = height - top - bottom
    x_min = -20
    x_max = 20
    y_values = [float(row[q]) for row in rows for q in QUANTILES]
    y_min = min(y_values)
    y_max = max(y_values)
    padding = (y_max - y_min) * 0.08 or max(abs(y_max) * 0.08, 1)
    y_min -= padding
    y_max += padding

    def x_pos(x: float) -> float:
        return scale(x, x_min, x_max, left, left + plot_width)

    def y_pos(y: float) -> float:
        return scale(y, y_min, y_max, top + plot_height, top)

    colors = [
        "#2563eb",
        "#dc2626",
        "#059669",
        "#7c3aed",
        "#ea580c",
        "#0891b2",
        "#4b5563",
        "#be123c",
    ]
    grouped = defaultdict(list)
    for row in rows:
        grouped[(row["model"], row["prompt_variant"])].append(row)

    elements = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
        f"<title>{escape(metric['label'])} by McDuffie margin</title>",
        f"<desc>Forecast p50 values plotted from McDuffie margin -20 to +20, split at the zero-margin cutoff.</desc>",
        '<rect width="100%" height="100%" fill="#ffffff" />',
        f'<rect x="{left}" y="{top}" width="{plot_width / 2:.1f}" height="{plot_height}" fill="#f8fafc" />',
        f'<rect x="{left + plot_width / 2:.1f}" y="{top}" width="{plot_width / 2:.1f}" height="{plot_height}" fill="#ffffff" />',
        f'<text x="{left}" y="28" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#111827">{escape(metric["label"])}</text>',
        f'<text x="{left}" y="47" font-family="Arial, sans-serif" font-size="12" fill="#4b5563">p50 forecast by model; vertical whiskers show p25-p75. Axis is McDuffie margin over George.</text>',
        f'<text x="{left + 10}" y="{top + 20}" font-family="Arial, sans-serif" font-size="12" fill="#64748b">George wins</text>',
        f'<text x="{left + plot_width - 96}" y="{top + 20}" font-family="Arial, sans-serif" font-size="12" fill="#64748b">McDuffie wins</text>',
    ]

    for tick in [-20, -10, 0, 10, 20]:
        x = x_pos(tick)
        stroke = "#cbd5e1" if tick == 0 else "#e5e7eb"
        dash = ' stroke-dasharray="5 5"' if tick == 0 else ""
        elements.append(
            f'<line x1="{x:.1f}" y1="{top}" x2="{x:.1f}" y2="{top + plot_height}" stroke="{stroke}"{dash} />'
        )
        elements.append(
            f'<text x="{x:.1f}" y="{top + plot_height + 24}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#374151">{tick:+}</text>'
        )

    for i in range(5):
        y_value = y_min + i * (y_max - y_min) / 4
        y = y_pos(y_value)
        elements.append(
            f'<line x1="{left}" y1="{y:.1f}" x2="{left + plot_width}" y2="{y:.1f}" stroke="#e5e7eb" />'
        )
        elements.append(
            f'<text x="{left - 10}" y="{y + 4:.1f}" text-anchor="end" font-family="Arial, sans-serif" font-size="11" fill="#374151">{escape(fmt_value(y_value))}</text>'
        )

    elements.extend(
        [
            f'<line x1="{left}" y1="{top + plot_height}" x2="{left + plot_width}" y2="{top + plot_height}" stroke="#111827" />',
            f'<line x1="{left}" y1="{top}" x2="{left}" y2="{top + plot_height}" stroke="#111827" />',
            f'<text x="{left + plot_width / 2:.1f}" y="{height - 28}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#111827">McDuffie margin over George, percentage points</text>',
            f'<text x="22" y="{top + plot_height / 2:.1f}" transform="rotate(-90 22 {top + plot_height / 2:.1f})" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#111827">{escape(metric["unit"])}</text>',
            f'<text x="{x_pos(0) + 7:.1f}" y="{top + plot_height - 8}" font-family="Arial, sans-serif" font-size="11" fill="#64748b">cutoff</text>',
        ]
    )

    legend_x = left + 8
    legend_y = top + plot_height + 52
    for index, ((model, prompt_variant), group_rows) in enumerate(sorted(grouped.items())):
        color = colors[index % len(colors)]
        dashed = prompt_variant == "masked"
        label = f"{model} ({prompt_variant})"
        if legend_x > width - 250:
            legend_x = left + 8
            legend_y += 18
        dash = ' stroke-dasharray="6 5"' if dashed else ""
        elements.append(
            f'<line x1="{legend_x}" y1="{legend_y - 4}" x2="{legend_x + 24}" y2="{legend_y - 4}" stroke="{color}" stroke-width="2.5"{dash} />'
        )
        elements.append(
            f'<text x="{legend_x + 30}" y="{legend_y}" font-family="Arial, sans-serif" font-size="11" fill="#374151">{escape(label)}</text>'
        )
        legend_x += 42 + len(label) * 6

        ordered = sorted(group_rows, key=lambda row: row["mcduffie_margin_points"])
        for side in [-1, 1]:
            side_rows = [
                row
                for row in ordered
                if row["mcduffie_margin_points"] * side > 0
            ]
            points = [
                (
                    x_pos(float(row["mcduffie_margin_points"])),
                    y_pos(float(row["p50"])),
                )
                for row in side_rows
            ]
            elements.append(svg_polyline(points, color, dashed))

        for row in ordered:
            x = x_pos(float(row["mcduffie_margin_points"]))
            y = y_pos(float(row["p50"]))
            y25 = y_pos(float(row["p25"]))
            y75 = y_pos(float(row["p75"]))
            elements.extend(
                [
                    f'<line x1="{x:.1f}" y1="{y25:.1f}" x2="{x:.1f}" y2="{y75:.1f}" stroke="{color}" stroke-width="1.6" opacity="0.45" />',
                    f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.2" fill="#ffffff" stroke="{color}" stroke-width="2" />',
                ]
            )

    elements.append("</svg>")
    (PLOTS / f"{metric_id}-mcduffie-margin.svg").write_text(
        "\n".join(elements) + "\n", encoding="utf-8"
    )


def write_plots(series_rows: list[dict[str, Any]]) -> None:
    metrics = metric_lookup()
    PLOTS.mkdir(exist_ok=True)
    by_metric = defaultdict(list)
    for row in series_rows:
        by_metric[row["metric_id"]].append(row)
    for metric_id, rows in by_metric.items():
        write_metric_plot(metric_id, rows, metrics[metric_id])


def main() -> None:
    paths = response_paths(sys.argv[1:])
    if not paths:
        raise SystemExit(
            "No response files found. Add JSONL files to "
            "analysis/dc-mayor-2026/responses/ or pass paths explicitly."
        )

    records = []
    for path in paths:
        records.extend(read_response_path(path))

    rows = summarize(records)
    series_rows = build_series(records)
    OUTPUTS.mkdir(exist_ok=True)
    (OUTPUTS / "model-summary.json").write_text(
        json.dumps(rows, indent=2) + "\n", encoding="utf-8"
    )
    write_series(series_rows)
    write_markdown(rows)
    write_agent_rd_summary(records)
    write_plots(series_rows)
    print(f"Wrote {len(rows)} summary rows to {OUTPUTS / 'model-summary.md'}")
    print(f"Wrote {len(series_rows)} plot-series rows to {OUTPUTS / 'forecast-series.csv'}")
    print(f"Wrote paired RD summary to {OUTPUTS / 'agent-rd-summary.md'}")
    print(f"Wrote metric SVG plots to {PLOTS}")


if __name__ == "__main__":
    main()
