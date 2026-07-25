#!/usr/bin/env python3
"""Build src/data/safety-data.json for /safety.

Joins four independent public sources on country:

  1. Gallup Global Safety Report 2025 (2024 field year) — "Do you feel safe
     walking alone at night?" (% yes) and the Law and Order Index (0-100).
     This is UN SDG indicator 16.1.4; Gallup is the only body that measures it
     annually worldwide.
  2. Gallup Global Safety Report 2024 (2023 field year) — same two measures,
     used only to compute year-over-year change.
  3. UNODC intentional homicide rates via Our World in Data — the one crime
     statistic that is comparable across countries, because reporting rates
     for assault/theft/rape track police capacity more than incidence.
  4. U.S. State Department travel advisories (official RSS) — level 1-4 plus
     the date each was last issued.

Nothing here is hand-entered except COUNTRY_ALIASES (name reconciliation) and
the two CONSTANTS blocks, each of which carries its source URL inline.

Requires poppler (`brew install poppler`) for pdftotext.

    uv run scripts/generate-safety-data.py        # or: python3 scripts/...
"""

from __future__ import annotations

import csv
import html
import json
import math
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "safety-data.json"

SOURCES = {
    "gallup2025": "https://www.gallup.com/file/analytics/695138/Gallup_Global-Safety-Report-2025.pdf",
    "gallup2025_mirror": "https://khovar.tj/wp-content/uploads/2025/09/Gallup_Global-Safety-Report-2025.pdf",
    "gallup2024": "https://insightcrime.org/wp-content/uploads/2024/10/Gallup_Global-Safety-Report-2024.pdf",
    "homicide": "https://ourworldindata.org/grapher/homicide-rate-unodc.csv",
    "advisories": "https://travel.state.gov/_res/rss/TAsTWs.xml",
}

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)


# ── Constants that are not machine-readable anywhere ────────────────────────

# Gallup's global "% feel safe walking alone at night" series. Only years the
# 2024 and 2025 reports state numerically in prose are included — the full
# annual series lives in chart images, and interpolating it would invent data.
# Source: Gallup Global Safety Report 2025, pp. 4-5; 2024 report p. 4.
GLOBAL_TREND = [
    {"year": 2006, "pct": 62, "note": "First year Gallup asked the question"},
    {"year": 2014, "pct": 60, "note": "Decade-ago baseline (2024 = +13 points)"},
    {"year": 2020, "pct": 72, "note": "Previous peak"},
    {"year": 2023, "pct": 70, "note": None},
    {"year": 2024, "pct": 73, "note": "Record high since tracking began"},
]

# Non-natural deaths of U.S. citizens abroad, 2002-2022 (n = 15,549).
# Source: "Analysis of the non-natural deaths of US citizens while abroad",
# https://pmc.ncbi.nlm.nih.gov/articles/PMC12782918/
TRAVELER_DEATH_CAUSES = [
    {"cause": "Vehicle accidents", "pct": 29},
    {"cause": "Homicide", "pct": 21},
    {"cause": "Other accidents", "pct": 17},
    {"cause": "Suicide", "pct": 14},
    {"cause": "Drowning", "pct": 13},
    {"cause": "War, terrorism, disaster, other", "pct": 6},
]

# Gallup's global victimization readings (the two non-perception components of
# the Law and Order Index). Source: Global Safety Report 2025, p. 12.
GLOBAL_VICTIMIZATION = {
    "year": 2024,
    "theftPct": 12,
    "assaultPct": 6,
    "assaultMenPct": 7,
    "assaultWomenPct": 5,
}

# Name reconciliation across the four sources. Key = name as it appears in a
# source; value = canonical name (which is the OWID/UNODC spelling).
COUNTRY_ALIASES = {
    # Gallup -> canonical
    "Taiwan (Province of China)": "Taiwan",
    "Hong Kong, S.A.R. of China": "Hong Kong",
    "Republic of Korea": "South Korea",
    "Viet Nam": "Vietnam",
    "Russian Federation": "Russia",
    "Moldova, Republic of": "Moldova",
    "Lao People's Democratic Republic": "Laos",
    "State of Palestine": "Palestine",
    "Democratic Republic of the Congo": "Democratic Republic of Congo",
    "Republic of the Congo": "Congo",
    "Türkiye": "Turkey",
    "Turkiye": "Turkey",
    "Czech Republic": "Czechia",
    "Northern Cyprus": "Northern Cyprus",
    "Bosnia and Herzegovina": "Bosnia and Herzegovina",
    "North Macedonia": "North Macedonia",
    "Cote d'Ivoire": "Cote d'Ivoire",
    "Côte d'Ivoire": "Cote d'Ivoire",
    "Eswatini": "Eswatini",
    "Cabo Verde": "Cape Verde",
    # State Dept -> canonical
    "Mexico Travel Advisory": "Mexico",
    "Burma (Myanmar)": "Myanmar",
    "Burma": "Myanmar",
    "The Gambia": "Gambia",
    "Republic of North Macedonia": "North Macedonia",
    "Israel, the West Bank and Gaza": "Israel",
    "Timor-Leste (East Timor)": "Timor",
    "Cabo Verde (Cape Verde)": "Cape Verde",
    "Congo, Democratic Republic of the": "Democratic Republic of Congo",
    "Congo, Republic of the": "Congo",
    "Korea, Democratic People's Republic of": "North Korea",
    "North Korea (Democratic People's Republic of Korea)": "North Korea",
    "South Korea (Republic of Korea)": "South Korea",
    "Netherlands, The": "Netherlands",
    "Bahamas, The": "Bahamas",
    "Micronesia, Federated States of": "Micronesia (country)",
    "Saint Vincent and The Grenadines": "Saint Vincent and the Grenadines",
    "Cote d Ivoire": "Cote d'Ivoire",
    "Cote d'Ivoire (Ivory Coast)": "Cote d'Ivoire",
    "Kingdom of Denmark": "Denmark",
    "The Kyrgyz Republic": "Kyrgyzstan",
    "Trinidad & Tobago": "Trinidad and Tobago",
    "Antigua & Barbuda": "Antigua and Barbuda",
    "Bosnia & Herzegovina": "Bosnia and Herzegovina",
    "Sao Tome & Principe": "Sao Tome and Principe",
    "Turks & Caicos": "Turks and Caicos Islands",
    "Turks and Caicos Islands (UK)": "Turks and Caicos Islands",
}

# One State Department advisory covers several Gallup rows.
ADVISORY_FANOUT = {
    "Mainland China, Hong Kong & Macau - See Summaries": ["China", "Hong Kong"],
}

# Letter class that survives Türkiye / Côte d'Ivoire in the PDF tables.
L = r"A-Za-zÀ-ÿ"


def canon(name: str) -> str:
    n = " ".join(name.replace(" ", " ").split()).strip(" .,")
    return COUNTRY_ALIASES.get(n, n)


def fetch(url: str, dest: Path) -> Path:
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=180) as r, dest.open("wb") as f:
        shutil.copyfileobj(r, f)
    return dest


def pdf_text(pdf: Path) -> list[str]:
    if not shutil.which("pdftotext"):
        sys.exit("pdftotext not found — install poppler (brew install poppler)")
    out = pdf.with_suffix(".txt")
    subprocess.run(["pdftotext", "-layout", str(pdf), str(out)], check=True,
                   stderr=subprocess.DEVNULL)
    return out.read_text(encoding="utf-8", errors="replace").split("\n")


NOISE = ("country", "safe to", "index score", "copyright", "chart", "the global",
         "walk alone", "law and order", "alone at night", "score")


def _pairs(lines: list[str], pattern: str) -> dict[str, float]:
    """Gallup tables print two country/value columns per physical line."""
    out: dict[str, float] = {}
    rx = re.compile(pattern)
    for ln in lines:
        for m in rx.finditer(ln):
            name = " ".join(m.group(1).split()).strip()
            if len(name) < 3 or name.lower().startswith(NOISE):
                continue
            if any(ch.isdigit() for ch in name):
                continue
            out[canon(name)] = float(m.group(2))
    return out


def _law_order(lines: list[str]) -> dict[str, float]:
    lo = _pairs(lines, rf"([{L}][{L} ,.'()\-]+?)\s{{2,}}(\d{{2,3}})(?=\s|$)")
    return {k: v for k, v in lo.items() if 0 <= v <= 100}


def parse_gallup_2025(lines: list[str]) -> tuple[dict, dict]:
    """2025 report publishes full country tables for BOTH measures."""
    header = "Safe to Walk Alone at Night (% Yes), 2024"
    start = next((i for i, l in enumerate(lines) if header in l), None)
    if start is None:
        sys.exit(f"could not locate walk-alone table header: {header!r}")
    walk = _pairs(lines[start:], rf"([{L}][{L} ,.'()\-]+?)\s{{2,}}(\d{{1,3}})%")
    # The Law and Order table precedes the walk-alone table.
    return walk, _law_order(lines[:start])


def parse_gallup_2024(lines: list[str]) -> dict:
    """2024 report publishes a full country table for the INDEX ONLY.

    Its walk-alone figures appear only as a top-10/bottom-10 chart, so
    year-over-year change is available for the index and not for the
    walk-alone percentage. We do not interpolate the missing one.
    """
    header = "Law and Order Index Scores for 2023"
    hits = [i for i, l in enumerate(lines) if header in l]
    if not hits:
        sys.exit(f"could not locate index table header: {header!r}")
    return _law_order(lines[hits[-1]:])


def parse_homicide(csv_path: Path) -> dict[str, dict[int, float]]:
    series: dict[str, dict[int, float]] = defaultdict(dict)
    with csv_path.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            col = next(k for k in row if k.startswith("Homicide rate"))
            if not row.get("Code"):
                continue  # drop aggregates/regions, keep sovereign entities
            try:
                series[canon(row["Entity"])][int(row["Year"])] = float(row[col])
            except (ValueError, TypeError):
                continue
    return series


def parse_advisories(xml_path: Path) -> dict[str, dict]:
    raw = xml_path.read_text(encoding="utf-8", errors="replace")
    out: dict[str, dict] = {}
    for block in re.findall(r"<item>(.*?)</item>", raw, re.S):
        def field(tag: str) -> str:
            m = re.search(rf"<{tag}>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</{tag}>",
                          block, re.S)
            return html.unescape(m.group(1)).strip() if m else ""

        title = field("title")
        m = re.match(r"(.*?)\s*[-–]\s*Level\s*(\d)\s*:\s*(.*)", title)
        if not m:
            continue
        raw_name = re.sub(r"\s+Travel Advisory$", "", m.group(1).strip())
        pub = field("pubDate")
        dm = re.search(r"(\d{1,2}\s+\w{3}\s+\d{4})", pub)
        entry = {
            "level": int(m.group(2)),
            "label": m.group(3).strip(),
            "issued": dm.group(1) if dm else None,
            "link": field("link") or None,
            "covers": raw_name if raw_name in ADVISORY_FANOUT else None,
        }
        for name in ADVISORY_FANOUT.get(raw_name, [canon(raw_name)]):
            out[name] = entry
    return out


def main() -> None:
    tmp = Path(tempfile.gettempdir()) / "safety-sources"
    tmp.mkdir(exist_ok=True)

    try:
        g25 = fetch(SOURCES["gallup2025"], tmp / "gallup2025.pdf")
        walk24, lo24 = parse_gallup_2025(pdf_text(g25))
    except Exception:
        g25 = fetch(SOURCES["gallup2025_mirror"], tmp / "gallup2025m.pdf")
        walk24, lo24 = parse_gallup_2025(pdf_text(g25))

    g24 = fetch(SOURCES["gallup2024"], tmp / "gallup2024.pdf")
    lo23 = parse_gallup_2024(pdf_text(g24))

    hom = parse_homicide(fetch(SOURCES["homicide"], tmp / "homicide.csv"))
    adv = parse_advisories(fetch(SOURCES["advisories"], tmp / "advisories.xml"))

    print(f"gallup 2024 field year: {len(walk24)} walk / {len(lo24)} index")
    print(f"gallup 2023 field year: {len(lo23)} index (walk-alone not tabled)")
    print(f"homicide series:        {len(hom)} countries")
    print(f"advisories:             {len(adv)} destinations")

    countries = []
    for name in sorted(walk24):
        hs = hom.get(name, {})
        recent = {y: v for y, v in hs.items() if y >= 2015}
        hy = max(recent) if recent else None
        rec = {
            "country": name,
            "feltSafe": walk24[name],
            "lawOrder": lo24.get(name),
            "lawOrderPrev": lo23.get(name),
            "homicide": round(recent[hy], 2) if hy else None,
            "homicideYear": hy,
            "homicideSeries": [
                {"year": y, "rate": round(hs[y], 2)} for y in sorted(hs) if y >= 1995
            ],
            "advisory": adv.get(name),
        }
        countries.append(rec)

    # ── Fit: log10 homicide rate -> % feel safe, over countries with both ──
    fit_rows = [c for c in countries if c["homicide"] is not None]
    xs = [math.log10(c["homicide"] + 0.1) for c in fit_rows]
    ys = [float(c["feltSafe"]) for c in fit_rows]
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    syy = sum((y - my) ** 2 for y in ys)
    slope = sxy / sxx
    intercept = my - slope * mx
    r = sxy / math.sqrt(sxx * syy)

    def rank(v):
        order = sorted(range(len(v)), key=lambda i: v[i])
        out = [0] * len(v)
        for pos, i in enumerate(order):
            out[i] = pos
        return out

    rx, ry = rank(xs), rank(ys)
    mrx, mry = sum(rx) / n, sum(ry) / n
    rho = sum((a - mrx) * (b - mry) for a, b in zip(rx, ry)) / math.sqrt(
        sum((a - mrx) ** 2 for a in rx) * sum((b - mry) ** 2 for b in ry)
    )

    for c in countries:
        if c["homicide"] is None:
            c["predicted"] = None
            c["residual"] = None
        else:
            pred = intercept + slope * math.log10(c["homicide"] + 0.1)
            c["predicted"] = round(pred, 1)
            c["residual"] = round(c["feltSafe"] - pred, 1)

    lvl_counts = Counter(a["level"] for a in adv.values())

    payload = {
        "meta": {
            "generatedBy": "scripts/generate-safety-data.py",
            "fieldYear": 2024,
            "gallupRespondents": 145170,
            "gallupCountries": len(walk24),
            "sources": SOURCES,
            "note": (
                "feltSafe and lawOrder are Gallup World Poll 2024 field year. "
                "homicide is the most recent UNODC year >= 2015, which varies "
                "by country — homicideYear carries it. advisory is live U.S. "
                "State Department RSS at generation time."
            ),
        },
        "fit": {
            "n": n,
            "r": round(r, 4),
            "r2": round(r * r, 4),
            "spearman": round(rho, 4),
            "slope": round(slope, 4),
            "intercept": round(intercept, 4),
            "form": "feltSafe ~ intercept + slope * log10(homicide + 0.1)",
        },
        "globalTrend": GLOBAL_TREND,
        "travelerDeathCauses": TRAVELER_DEATH_CAUSES,
        "globalVictimization": GLOBAL_VICTIMIZATION,
        "advisoryLevelCounts": {str(k): v for k, v in sorted(lvl_counts.items())},
        "countries": countries,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
                   encoding="utf-8")

    matched_h = sum(1 for c in countries if c["homicide"] is not None)
    matched_a = sum(1 for c in countries if c["advisory"] is not None)
    print(f"\nwrote {OUT.relative_to(ROOT)}")
    print(f"  countries:            {len(countries)}")
    print(f"  with homicide >=2015: {matched_h}")
    print(f"  with advisory:        {matched_a}")
    print(f"  fit: r={r:.3f} r2={r*r:.3f} rho={rho:.3f} n={n}")

    # Never truncate silently: name every country that failed to join.
    miss_h = [c["country"] for c in countries if c["homicide"] is None]
    miss_a = [c["country"] for c in countries if c["advisory"] is None]
    if miss_h:
        print(f"\n  NO homicide data ({len(miss_h)}): {', '.join(miss_h)}")
    if miss_a:
        print(f"\n  NO advisory ({len(miss_a)}): {', '.join(miss_a)}")
    unused = sorted(set(adv) - {c["country"] for c in countries})
    if unused:
        print(f"\n  advisories with no Gallup row ({len(unused)}): {', '.join(unused)}")


if __name__ == "__main__":
    main()
