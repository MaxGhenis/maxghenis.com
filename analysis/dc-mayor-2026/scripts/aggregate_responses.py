#!/usr/bin/env python3
"""Aggregate model forecast JSONL files into RD-style summary tables."""

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
    return sorted(RESPONSES.glob("*.jsonl"))


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
        writer = DictWriter(f, fieldnames=fields)
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
        records.extend(read_jsonl(path))

    rows = summarize(records)
    series_rows = build_series(records)
    OUTPUTS.mkdir(exist_ok=True)
    (OUTPUTS / "model-summary.json").write_text(
        json.dumps(rows, indent=2) + "\n", encoding="utf-8"
    )
    write_series(series_rows)
    write_markdown(rows)
    write_plots(series_rows)
    print(f"Wrote {len(rows)} summary rows to {OUTPUTS / 'model-summary.md'}")
    print(f"Wrote {len(series_rows)} plot-series rows to {OUTPUTS / 'forecast-series.csv'}")
    print(f"Wrote metric SVG plots to {PLOTS}")


if __name__ == "__main__":
    main()
