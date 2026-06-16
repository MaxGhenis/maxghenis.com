#!/usr/bin/env python3
"""Export aggregated D.C. mayor forecasts for the Astro site."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
SERIES = ROOT / "outputs" / "forecast-series.json"
DEST = REPO / "src" / "data" / "dc-mayor-forecast-series.json"


def site_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "metricId": row["metric_id"],
        "model": row["model"],
        "promptVariant": row["prompt_variant"],
        "mcduffieMargin": row["mcduffie_margin_points"],
        "georgeMargin": row["george_margin_points"],
        "candidate": row["candidate"],
        "n": row["n"],
        "p05": row["p05"],
        "p25": row["p25"],
        "p50": row["p50"],
        "p75": row["p75"],
        "p95": row["p95"],
    }


def main() -> None:
    rows = json.loads(SERIES.read_text(encoding="utf-8"))
    DEST.parent.mkdir(parents=True, exist_ok=True)
    DEST.write_text(
        json.dumps([site_row(row) for row in rows], indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(rows)} rows to {DEST}")


if __name__ == "__main__":
    main()
