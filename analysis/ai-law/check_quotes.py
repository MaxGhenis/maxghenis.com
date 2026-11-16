#!/usr/bin/env python3
"""Check that every quoted rule text in rules.py appears word for word in its source.

Usage: check_quotes.py <folder of downloaded sources>

The folder holds copies fetched on November 15, 2026 (file name: source):
  ca_bpc_ch25-1.html                     California Bus. & Prof. Code ch. 25.1, leginfo.legislature.ca.gov,
                                         web.archive.org snapshot of October 16, 2026
  ny_S8828.txt                           pdftotext -layout of legislation.nysenate.gov/pdf/bills/2025/S8828
  eu_2024-1689.html                      eur-lex.europa.eu, OJ:L_202401689
  ecfr_title15_part774_2026-11-12.xml    ecfr.gov versioner API, title 15 part 774 as of November 12, 2026
  fr_2026-00789.txt                      federalregister.gov full text, 91 FR 1684
  fr_2026-01052_proclamation11002.txt    pdftotext -layout of govinfo.gov FR-2026-01-20 2026-01052.pdf
The comparison ignores white space, the style of quotation marks and how a superscript is
marked. It exits 1 if any quote is missing.
"""
import html
import re
import sys
from pathlib import Path

import rules as R

SOURCE = {
    "ca_": "ca_bpc_ch25-1.html", "ny_": "ny_S8828.txt", "eu_": "eu_2024-1689.html", "eccn_": "ecfr_title15_part774_2026-11-12.xml",
    "bis_": "fr_2026-00789.txt", "tariff": "fr_2026-01052_proclamation11002.txt",
}


def squash(t):
    t = re.sub(r'<span class="oj-super[^"]*">(.*?)</span>', r"^\1", t, flags=re.S)
    t = re.sub(r"<(sup|SU)>(.*?)</(sup|SU)>", r"^\2", t, flags=re.S | re.I)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    t = re.sub(r"-\n\s*\d+\s+", "", t)          # a word split across numbered lines of a bill print
    t = re.sub(r"\n\s*\d+\s+", " ", t)          # line numbers of a bill print
    t = t.replace("º", "^")                      # the New York print's exponent mark
    t = re.sub("[\"“”‘’`']", "'", t)
    return re.sub(r"\s+", "", t)


folder = Path(sys.argv[1])
cache, missing, n = {}, [], 0
for key, (cite, quotes) in R.QUOTES.items():
    name = next(v for k, v in SOURCE.items() if key.startswith(k))
    if name not in cache:
        cache[name] = squash((folder / name).read_text(encoding="utf-8", errors="replace"))
    for q in quotes:
        n += 1
        if squash(q) not in cache[name]:
            missing.append((key, name, q[:90]))
print(f"{n} quotes checked, {n - len(missing)} found")
for m in missing:
    print("MISSING", m)
sys.exit(1 if missing else 0)
