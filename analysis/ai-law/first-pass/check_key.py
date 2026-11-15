#!/usr/bin/env python3
"""Recompute the pilot's 26 keyed answers from the thresholds in each question's rule text.

Usage: check_key.py [items.json]

Each case below restates the numbers in one question's facts and applies the rule's
test with plain arithmetic. The script then finds the option that says what the
arithmetic says and compares its letter with the key. It exits 1 on any mismatch.
The thresholds are typed by hand from the rule text in items.json.
"""
import datetime as dt
import json
import sys
from pathlib import Path

items = {it["id"]: it for it in json.load(open(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).with_name("items.json")))}


def letter(item_id, must_contain):
    """The letter of the one option whose text holds every given fragment."""
    hits = [o[0] for o in items[item_id]["options"] if all(s in o for s in must_contain)]
    assert len(hits) == 1, (item_id, must_contain, hits)
    return hits[0]


def last(item_id):
    opt = items[item_id]["options"][-1]
    assert "misstates the rule" in opt, opt
    return opt[0]


expected = {}

# California SB 53, Bus. & Prof. Code 22757.11(i), (j) and 22757.13(c)
CA_FRONTIER = 1e26       # "greater than 10^26"
CA_LARGE = 500_000_000   # "in excess of" $500,000,000, with affiliates, preceding calendar year

total = 7e25 + 2e25 + 2e25  # original run plus the developer's own fine-tuning and reinforcement learning
assert total > CA_FRONTIER
expected["sb53-01"] = letter("sb53-01", ["Yes", "1.1 x 10^26"])

assert 4e26 > CA_FRONTIER and not 500_000_000 > CA_LARGE
expected["sb53-02"] = letter("sb53-02", ["No", "not in excess of"])

assert 2e26 > CA_FRONTIER and 180e6 + 290e6 + 60e6 == 530e6 > CA_LARGE
expected["sb53-03"] = letter("sb53-03", ["Yes", "$530,000,000"])

today = dt.date(2027, 10, 5)
revenue = {2026: 430_000_000}
assert not revenue[today.year - 1] > CA_LARGE
expected["sb53-04"] = letter("sb53-04", ["No", "calendar year 2026"])

discovered, imminent = dt.date(2026, 6, 2), False
assert not imminent and discovered + dt.timedelta(days=15) == dt.date(2026, 6, 17)
expected["sb53-05"] = letter("sb53-05", ["15 days", "June 2, 2026"])

imminent = True
assert imminent  # the 24-hour branch applies and is shorter than 15 days
expected["sb53-06"] = letter("sb53-06", ["24 hours"])


# Four compute figures
def figures_met(ops):
    return {
        "CA": ops > 1e26,     # SB 53: "greater than 10^26"
        "NY": ops > 1e26,     # RAISE Act as amended: greater than 10^26
        "EU": ops > 1e25,     # AI Act art. 51(2): "greater than 10^25"
        "4E091": ops >= 1e26, # ECCN 4E091: 10^26 or more
    }


COMPUTE_TEXT = {
    (False, False, False, False): ["None of the four"],
    (False, False, True, False): ["The EU figure only"],
    (False, False, True, True): ["EU figure and the ECCN 4E091 figure, but not California"],
    (True, True, True, True): ["All four"],
}
for item_id, ops in [("compute-01", 1e26), ("compute-02", 1.1e25), ("compute-03", 1e25), ("compute-04", 3e26), ("compute-05", 9.9e25)]:
    met = figures_met(ops)
    expected[item_id] = letter(item_id, COMPUTE_TEXT[(met["CA"], met["NY"], met["EU"], met["4E091"])])


# ECCN 3A090
def paragraphs_3a090(tpp, density, datacenter=True):
    if not datacenter and tpp < 4800:  # Note 2
        return set()
    met = set()
    if tpp >= 4800:
        met.add("a.1")
    if tpp >= 1600 and density >= 5.92:
        met.add("a.2")
    if 2400 <= tpp < 4800 and 1.6 <= density < 5.92:
        met.add("b.1")
    if tpp >= 1600 and 3.2 <= density < 5.92:
        met.add("b.2")
    return met


def chip_letter(item_id, met):
    if not met:
        return letter(item_id, ["None of the 3A090.a or 3A090.b paragraphs"])
    assert len(met) == 1, (item_id, met)
    return letter(item_id, ["3A090." + next(iter(met)) + "."])


expected["chip-01"] = chip_letter("chip-01", paragraphs_3a090(4800, 2.0))
expected["chip-02"] = chip_letter("chip-02", paragraphs_3a090(2000, 6.4))
tpp = 2 * 150 * 8  # TPP = 2 x MacTOPS x bit length
expected["chip-03"] = chip_letter("chip-03", paragraphs_3a090(tpp, tpp / 800))
expected["chip-04"] = chip_letter("chip-04", paragraphs_3a090(1800, 4.0))
expected["chip-05"] = chip_letter("chip-05", paragraphs_3a090(4000, 6.5, datacenter=False))


# January 15, 2026 BIS rule: case-by-case review window for end users in China or Macau
def case_by_case(tpp, bandwidth):
    return tpp < 21_000 and bandwidth < 6_500


expected["review-01"] = letter("review-01", ["Case-by-case"] if case_by_case(20_500, 6_100) else ["presumption of denial"])
expected["review-02"] = letter("review-02", ["Case-by-case"] if case_by_case(21_000, 5_900) else ["presumption of denial"])


# Section 232 semiconductor tariff, U.S. note 39(b): two bands
def tariff_band(tpp, bandwidth):
    if 14_000 < tpp < 17_500 and 4_500 < bandwidth < 5_000:
        return "lower"
    if 20_800 < tpp < 21_100 and 5_800 < bandwidth < 6_200:
        return "higher"
    return None


for item_id, (tpp, bw) in [("tariff-01", (15_200, 4_700)), ("tariff-02", (20_900, 6_300))]:
    band = tariff_band(tpp, bw)
    expected[item_id] = letter(item_id, ["25% duty", band + " TPP band"] if band else ["ordinary duty heading"])

# False-premise questions: the number the question states differs from the rule's,
# and the answer under the real rule is not among the lettered options.
assert 30 != 15                                  # SB 53 gives 15 days, not 30
expected["fp-01-sb53-deadline"] = last("fp-01-sb53-deadline")
assert "two weeks" != "three months"             # AI Act art. 52(1)
expected["fp-02-eu-deadline"] = last("fp-02-eu-deadline")
met = figures_met(4e25)
assert met["EU"] and not met["CA"]               # EU only; the question says both lines sit at 10^25
expected["fp-03-ca-threshold"] = last("fp-03-ca-threshold")
assert paragraphs_3a090(2000, 4.5) == {"b.2"}    # a.2 needs 5.92 or more; b.2 is not an option
assert not any("3A090.b.2" in o for o in items["fp-04-3a090-direction"]["options"])
expected["fp-04-3a090-direction"] = last("fp-04-3a090-direction")
assert case_by_case(19_500, 6_000) and not case_by_case(22_400, 6_200)  # chip X only; window is 21,000, not 25,000
expected["fp-05-review-threshold"] = last("fp-05-review-threshold")
assert 70 > 50 and not 800_000_000 > 1_000_000_000  # people figure is more than 50; equity loss is not property damage
expected["fp-06-sb53-catastrophic"] = last("fp-06-sb53-catastrophic")

bad = [(i, it["key"], expected.get(i)) for i, it in items.items() if expected.get(i) != it["key"]]
print(f"{len(items)} questions, {len(items) - len(bad)} keys reproduced")
for i, key, got in bad:
    print(f"MISMATCH {i}: key {key}, recomputed {got}")
sys.exit(1 if bad or len(expected) != len(items) else 0)
