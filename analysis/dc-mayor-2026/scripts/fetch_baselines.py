#!/usr/bin/env python3
"""Fetch primary-source baselines for the D.C. mayor forecast harness."""

from __future__ import annotations

import csv
import datetime as dt
import io
import json
import re
import sys
import zipfile
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "sources.json"
OUTPUTS = ROOT / "outputs"
USER_AGENT = "Mozilla/5.0 (compatible; dc-mayor-forecast/0.1; +https://maxghenis.com)"
METERS_PER_MILE = 1609.344
FATALITY_FIELDS = [
    "FATAL_BICYCLIST",
    "FATAL_DRIVER",
    "FATAL_PEDESTRIAN",
    "FATALPASSENGER",
    "FATALOTHER",
]


def fetch_bytes(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=60) as response:
        return response.read()


def fetch_json(url: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    if params:
        url = f"{url}?{urlencode(params)}"
    return json.loads(fetch_bytes(url).decode("utf-8"))


def metric_source(manifest: dict[str, Any], metric_id: str) -> dict[str, Any]:
    for metric in manifest["metrics"]:
        if metric["id"] == metric_id:
            return metric
    raise KeyError(metric_id)


def parse_number(value: Any) -> float | None:
    if value in ("", None, "(NA)", "(L)", "--"):
        return None
    return float(str(value).replace(",", "").strip())


def fetch_bea_gdp(metric: dict[str, Any]) -> dict[str, Any]:
    archive = zipfile.ZipFile(io.BytesIO(fetch_bytes(metric["download_url"])))
    csv_name = next(
        name
        for name in archive.namelist()
        if name.startswith("SQGDP1__ALL_AREAS") and name.endswith(".csv")
    )
    with archive.open(csv_name) as raw:
        rows = csv.DictReader(io.TextIOWrapper(raw, encoding="utf-8-sig"))
        dc_row = next(
            row
            for row in rows
            if row["GeoFIPS"].strip().strip('"') == "11000"
            and row["LineCode"].strip() == "1"
        )

    quarter_cols = [
        col for col in dc_row if re.fullmatch(r"\d{4}:Q[1-4]", col or "")
    ]
    history = [
        {"period": col, "value": parse_number(dc_row[col])}
        for col in quarter_cols
        if parse_number(dc_row[col]) is not None
    ]
    latest = history[-1]
    year, quarter = latest["period"].split(":")
    prior_period = f"{int(year) - 1}:{quarter}"
    prior = next(item for item in history if item["period"] == prior_period)
    yoy_growth = (latest["value"] / prior["value"] - 1) * 100
    return {
        "label": metric["label"],
        "unit": metric["unit"],
        "source_url": metric["source_url"],
        "download_url": metric["download_url"],
        "latest": latest,
        "year_over_year_percent": round(yoy_growth, 3),
        "history": history[-16:],
    }


def arcgis_features(
    endpoint_url: str,
    out_fields: str,
    where: str = "1=1",
    page_size: int = 2000,
) -> list[dict[str, Any]]:
    features: list[dict[str, Any]] = []
    offset = 0
    while True:
        payload = fetch_json(
            f"{endpoint_url}/query",
            {
                "where": where,
                "outFields": out_fields,
                "returnGeometry": "false",
                "f": "json",
                "resultRecordCount": page_size,
                "resultOffset": offset,
            },
        )
        if "error" in payload:
            raise RuntimeError(payload["error"])
        batch = payload.get("features", [])
        features.extend(feature["attributes"] for feature in batch)
        if len(batch) < page_size or not payload.get("exceededTransferLimit"):
            break
        offset += page_size
    return features


def fetch_bike_lanes(metric: dict[str, Any]) -> dict[str, Any]:
    records = arcgis_features(
        metric["endpoint_url"],
        "LENGTH,TOTALBIKELANES,BIKELANE_PROTECTED,BIKELANE_DUAL_PROTECTED",
    )
    route_meters = sum(parse_number(row.get("LENGTH")) or 0 for row in records)
    lane_meters = sum(
        (parse_number(row.get("LENGTH")) or 0)
        * max(parse_number(row.get("TOTALBIKELANES")) or 1, 1)
        for row in records
    )
    protected_records = [
        row
        for row in records
        if row.get("BIKELANE_PROTECTED") or row.get("BIKELANE_DUAL_PROTECTED")
    ]
    protected_route_meters = sum(
        parse_number(row.get("LENGTH")) or 0 for row in protected_records
    )
    protected_lane_meters = sum(
        (parse_number(row.get("LENGTH")) or 0)
        * max(parse_number(row.get("TOTALBIKELANES")) or 1, 1)
        for row in protected_records
    )
    return {
        "label": metric["label"],
        "unit": metric["unit"],
        "source_url": metric["source_url"],
        "endpoint_url": metric["endpoint_url"],
        "segments": len(records),
        "route_miles": round(route_meters / METERS_PER_MILE, 2),
        "lane_miles": round(lane_meters / METERS_PER_MILE, 2),
        "protected_route_miles": round(protected_route_meters / METERS_PER_MILE, 2),
        "protected_lane_miles": round(protected_lane_meters / METERS_PER_MILE, 2),
    }


def traffic_fatalities_for_year(endpoint_url: str, year: int) -> dict[str, Any]:
    stats = [
        {
            "statisticType": "sum",
            "onStatisticField": field,
            "outStatisticFieldName": field.lower(),
        }
        for field in FATALITY_FIELDS
    ]
    start = f"{year}-01-01 00:00:00"
    end = f"{year + 1}-01-01 00:00:00"
    payload = fetch_json(
        f"{endpoint_url}/query",
        {
            "where": f"REPORTDATE >= TIMESTAMP '{start}' AND REPORTDATE < TIMESTAMP '{end}'",
            "outStatistics": json.dumps(stats),
            "f": "json",
        },
    )
    if "error" in payload:
        raise RuntimeError(payload["error"])
    attrs = payload["features"][0]["attributes"]
    total = sum(parse_number(value) or 0 for value in attrs.values())
    return {
        "year": year,
        "fatalities": int(total),
        "components": {key: int(parse_number(value) or 0) for key, value in attrs.items()},
    }


def fetch_traffic_fatalities(metric: dict[str, Any]) -> dict[str, Any]:
    current_year = dt.date.today().year
    history = [
        traffic_fatalities_for_year(metric["endpoint_url"], year)
        for year in range(2019, current_year)
    ]
    ytd = traffic_fatalities_for_year(metric["endpoint_url"], current_year)
    return {
        "label": metric["label"],
        "unit": metric["unit"],
        "source_url": metric["source_url"],
        "endpoint_url": metric["endpoint_url"],
        "history": history,
        "current_year_to_date": ytd,
    }


def parse_census_state_workbook(file_bytes: bytes, row_label: str) -> dict[str, int]:
    rows = census_workbook_rows(file_bytes)
    for row in rows:
        row_name = str(row[0] or "").strip()
        if row_name == row_label:
            return {
                "total": int(row[1]),
                "one_unit": int(row[2]),
                "two_units": int(row[3]),
                "three_or_four_units": int(row[4]),
                "five_plus_units": int(row[5]),
                "five_plus_structures": int(row[6]),
            }
    raise ValueError(f"Could not find {row_label!r} in Census workbook")


def census_workbook_rows(file_bytes: bytes) -> list[list[Any]]:
    if file_bytes.startswith(b"PK"):
        try:
            import openpyxl
        except ImportError as exc:
            raise SystemExit(
                "Census BPS .xlsx parsing requires openpyxl. Run: uv pip install openpyxl xlrd"
            ) from exc

        workbook = openpyxl.load_workbook(
            io.BytesIO(file_bytes), read_only=True, data_only=True
        )
        sheet = workbook.worksheets[0]
        return [list(row) for row in sheet.iter_rows(values_only=True)]

    try:
        import xlrd
    except ImportError as exc:
        raise SystemExit(
            "Census BPS .xls parsing requires xlrd. Run: uv pip install openpyxl xlrd"
        ) from exc

    workbook = xlrd.open_workbook(file_contents=file_bytes)
    sheet = workbook.sheet_by_index(0)
    return [
        [sheet.cell_value(row_idx, col_idx) for col_idx in range(sheet.ncols)]
        for row_idx in range(sheet.nrows)
    ]


def fetch_census_housing_permits(metric: dict[str, Any]) -> dict[str, Any]:
    annual = []
    for year in range(2019, 2026):
        url = metric["annual_url_template"].format(year=year)
        values = parse_census_state_workbook(
            fetch_bytes(url), "District of Columbia"
        )
        annual.append({"year": year, "url": url, **values})

    page = fetch_bytes(metric["source_url"]).decode("utf-8", errors="ignore")
    monthly_urls = sorted(set(re.findall(r"https://www\.census\.gov/construction/bps/xls/statemonthly_\d{6}\.xls", page)))
    latest_monthly_url = monthly_urls[-1]
    latest_period = re.search(r"statemonthly_(\d{6})\.xls", latest_monthly_url).group(1)
    latest_values = parse_census_state_workbook(
        fetch_bytes(latest_monthly_url), "District of Columbia"
    )

    return {
        "label": metric["label"],
        "requested_label": metric.get("requested_label"),
        "limitation": metric.get("limitation"),
        "unit": metric["unit"],
        "source_url": metric["source_url"],
        "annual": annual,
        "latest_monthly_url": latest_monthly_url,
        "latest_period": latest_period,
        "latest_month": latest_values,
    }


def write_markdown(data: dict[str, Any]) -> None:
    metrics = data["metrics"]
    lines = [
        "# D.C. mayor forecast baselines",
        "",
        f"Generated at: `{data['generated_at']}`",
        "",
        "| Metric | Latest baseline | Source |",
        "|---|---:|---|",
    ]
    gdp = metrics["dc_real_gdp"]
    lines.append(
        f"| D.C. real GDP | {gdp['latest']['value']:,.1f} {gdp['unit']} in {gdp['latest']['period']} | BEA |"
    )
    bike = metrics["bike_lane_miles"]
    lines.append(
        f"| Bike lane stock | {bike['route_miles']:,.2f} route miles; {bike['lane_miles']:,.2f} lane-miles | DC Open Data / DDOT |"
    )
    fatalities = metrics["traffic_fatalities"]["history"][-1]
    lines.append(
        f"| Traffic fatalities | {fatalities['fatalities']:,} in {fatalities['year']} | DC Open Data / DDOT |"
    )
    permits = metrics["housing_permits"]["annual"][-1]
    lines.append(
        f"| Housing permits | {permits['total']:,} units authorized in {permits['year']} | Census BPS |"
    )
    lines.extend(
        [
            "",
            "Note: D.C.-level housing starts are not available in the Census starts release. This uses D.C.-level permit authorizations as the primary-source proxy.",
            "",
        ]
    )
    (OUTPUTS / "baselines.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    manifest = json.loads(SOURCES.read_text(encoding="utf-8"))
    OUTPUTS.mkdir(exist_ok=True)
    data = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "metrics": {
            "dc_real_gdp": fetch_bea_gdp(metric_source(manifest, "dc_real_gdp")),
            "bike_lane_miles": fetch_bike_lanes(metric_source(manifest, "bike_lane_miles")),
            "traffic_fatalities": fetch_traffic_fatalities(
                metric_source(manifest, "traffic_fatalities")
            ),
            "housing_permits": fetch_census_housing_permits(
                metric_source(manifest, "housing_permits")
            ),
        },
    }
    (OUTPUTS / "baselines.json").write_text(
        json.dumps(data, indent=2) + "\n", encoding="utf-8"
    )
    write_markdown(data)
    print(f"Wrote {OUTPUTS / 'baselines.json'}")
    print(f"Wrote {OUTPUTS / 'baselines.md'}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"fetch_baselines.py failed: {exc}", file=sys.stderr)
        raise
