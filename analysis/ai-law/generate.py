#!/usr/bin/env python3
"""Build questions.json: 100 direct questions in nine families, each with a keyed answer
that rules.py computes from the case's numbers.

Usage: generate.py [--check]    (--check rebuilds in memory and compares with questions.json)

The cases below are written by hand to cover each rule's outcomes and its edges. A fixed
seed assigns the made-up company names. Every question in a family shares one option list
in one order, so the keyed letter moves only with the facts. No question states a rule, and
no option explains itself.
"""
import json
import random
import sys
from decimal import Decimal as D
from pathlib import Path

import rules as R

HERE = Path(__file__).parent
EXACT = " Treat every figure as exact."


def ops(mantissa, exponent):
    """An exact operation count, e.g. ops("1.1", 25) is 11 x 10^24."""
    m = D(mantissa)
    n = int(m * 10**exponent)
    assert n == m * 10**exponent
    return n


def show_ops(n):
    s = str(n)
    exponent = len(s) - 1
    digits = s[1:].rstrip("0")
    return f"{s[0]}{'.' + digits if digits else ''} x 10^{exponent}"


def money(n):
    return f"${n:,}"


M = 1_000_000

ROOTS = ["Harrowgate", "Quillon", "Bexmoor", "Tarnwell", "Ospreyvale", "Lindmere", "Marrowby", "Castellane", "Dunsmuir",
         "Elmhollow", "Garrowdale", "Hallowmere", "Kestrelby", "Northwold", "Pellham", "Rookhurst", "Sablewick",
         "Thistledown", "Underhill", "Vantmoor", "Wexcombe", "Yarrowby", "Zennorfield", "Alderwyck", "Brackenridge"]
rng = random.Random(20261115)
MODEL_COMPANIES = [f"{r} {s}" for r in ROOTS for s in ("AI", "Labs", "Systems")]
CHIP_COMPANIES = [f"{r} {s}" for r in ROOTS for s in ("Silicon", "Devices")]
rng.shuffle(MODEL_COMPANIES)
rng.shuffle(CHIP_COMPANIES)

YES_NO = ["A. Yes.", "B. No."]
questions = []


def add(family, law, facts, question, options, key, boundary, params, rule_text):
    n = sum(q["family"] == family for q in questions) + 1
    assert key in [o[0] for o in options]
    questions.append({"id": f"{family}-{n:02d}", "family": family, "law": law, "facts": facts + EXACT, "question": question,
                      "options": options, "key": key, "boundary": boundary, "params": params, "rule_text": rule_text})


LAW = {
    "ca": "California SB 53",
    "ny": "New York's RAISE Act as amended in 2026",
}

# ---------- 1. frontier model (California, New York) ----------
FRONTIER_Q = {
    "ca": "Under California SB 53 (Business and Professions Code section 22757.11), is the model as it now stands a frontier model?",
    "ny": "Under New York's RAISE Act as amended in 2026 (General Business Law section 1420), is the model as it now stands a frontier model?",
}
for law, orig, ft, rl, today in [
    ("ca", ops("7", 25), ops("2", 25), ops("2", 25), "September 14, 2026"),
    ("ca", ops("1", 26), 0, 0, "December 1, 2026"),
    ("ca", ops("6", 25), ops("4", 25), 0, "January 25, 2027"),
    ("ca", ops("9", 25), ops("5", 24), ops("4", 24), "April 6, 2027"),
    ("ca", ops("9", 25), ops("1", 25), ops("1", 24), "July 19, 2026"),
    ("ca", ops("3", 26), 0, 0, "October 27, 2026"),
    ("ca", ops("4", 25), ops("3", 25), ops("2", 25), "February 22, 2027"),
    ("ca", ops("9.9", 25), 0, ops("2", 24), "May 3, 2027"),
    ("ny", ops("1", 26), 0, 0, "January 11, 2027"),
    ("ny", ops("8", 25), ops("1.5", 25), ops("1", 25), "March 30, 2027"),
    ("ny", ops("5", 25), ops("3", 25), ops("2", 25), "June 21, 2027"),
    ("ny", ops("2", 26), 0, 0, "August 9, 2027"),
]:
    co = MODEL_COMPANIES.pop()
    facts = f"{co} trained a foundation model in an original training run that used {show_ops(orig)} integer or floating-point operations."
    if ft and rl:
        facts += f" {co} then fine-tuned that model itself using {show_ops(ft)} operations and ran reinforcement learning on it using a further {show_ops(rl)} operations."
    elif ft:
        facts += f" {co} then fine-tuned that model itself using {show_ops(ft)} operations."
    elif rl:
        facts += f" {co} then ran reinforcement learning on that model itself using {show_ops(rl)} operations."
    else:
        facts += f" {co} has not fine-tuned or otherwise modified the model since."
    facts += f" No one outside {co} has modified the model. Today is {today}."
    add("frontier-model", LAW[law], facts, FRONTIER_Q[law], YES_NO,
        "A" if R.frontier_model(orig, ft, rl) else "B", orig + ft + rl == R.CA_FRONTIER_OPS,
        {"law": law, "original_ops": orig, "finetune_ops": ft, "rl_ops": rl, "today": today}, R.rule_text(f"{law}_frontier_model"))

# ---------- 2. large frontier developer (California, New York) ----------
LARGE_CITE = {
    "ca": "California SB 53 (Business and Professions Code section 22757.11)",
    "ny": "New York's RAISE Act as amended in 2026 (General Business Law section 1420)",
}
for law, model_ops, own, affiliates, current, today in [
    ("ca", ops("4", 26), 500 * M, [], None, "March 9, 2027"),
    ("ca", ops("2", 26), 180 * M, [290 * M, 60 * M], None, "June 1, 2026"),
    ("ca", ops("3", 26), 430 * M, [], 640 * M, "October 5, 2027"),
    ("ca", ops("1.5", 26), 501 * M, [], None, "February 2, 2027"),
    ("ca", ops("9", 25), 900 * M, [], None, "August 17, 2026"),
    ("ca", ops("2.5", 26), 200 * M, [300 * M], None, "May 11, 2027"),
    ("ca", ops("1.2", 26), 620 * M, [], 300 * M, "November 30, 2026"),
    ("ca", ops("1", 26), 800 * M, [], None, "April 20, 2027"),
    ("ny", ops("2", 26), 350 * M, [200 * M], None, "February 15, 2027"),
    ("ny", ops("5", 26), 499 * M, [], 700 * M, "September 13, 2027"),
    ("ny", ops("1.1", 26), 250 * M, [250 * M, 1 * M], None, "March 22, 2027"),
    ("ny", ops("3", 26), 500 * M, [], None, "July 6, 2027"),
]:
    co = MODEL_COMPANIES.pop()
    year = int(today[-4:])
    facts = (f"{co} trained a foundation model using {show_ops(model_ops)} integer or floating-point operations and has not modified it since. "
             f"It has trained no other model and has no other training run under way or planned. "
             f"In calendar year {year - 1}, {co} had annual gross revenues of {money(own)}.")
    if len(affiliates) == 1:
        facts += (f" Its parent company had annual gross revenues of {money(affiliates[0])} that year. The two companies are affiliates of each other, "
                  "each revenue figure is for that company alone, and none of that revenue came from sales between them.")
    elif len(affiliates) == 2:
        facts += (f" That year its parent company had annual gross revenues of {money(affiliates[0])}, and a sister company owned by the same parent had "
                  f"{money(affiliates[1])}. The three companies are affiliates of one another, each revenue figure is for that company alone, and none of that revenue came from sales among them.")
    else:
        facts += f" {co} has no affiliates."
    if current:
        facts += f" So far in {year}, {co} has booked {money(current)}."
    facts += f" Today is {today}."
    add("large-developer", LAW[law], facts, f"As of today, is {co} a large frontier developer under {LARGE_CITE[law]}?", YES_NO,
        "A" if R.large_frontier_developer(model_ops, own, affiliates) else "B",
        own + sum(affiliates) == R.LARGE_DEVELOPER_REVENUE or model_ops == R.CA_FRONTIER_OPS,
        {"law": law, "model_ops": model_ops, "own_revenue": own, "affiliate_revenues": affiliates, "current_year_revenue": current, "today": today},
        R.rule_text(f"{law}_large_developer", f"{law}_frontier_developer", f"{law}_frontier_model"))

# ---------- 3. incident clock (California, New York) ----------
CLOCK_OPTIONS = ["A. Within 24 hours.", "B. Within 72 hours.", "C. Within 15 days.", "D. Within 30 days."]
CLOCK_LETTER = {"24 hours": "A", "72 hours": "B", "15 days": "C"}
CLOCK_CITE = {
    "ca": "California SB 53 (Business and Professions Code section 22757.13)",
    "ny": "New York's RAISE Act as amended in 2026 (General Business Law section 1422)",
}
for law, date, imminent in [
    ("ca", "June 2, 2026", False), ("ca", "August 11, 2026", True), ("ca", "January 19, 2027", False), ("ca", "March 3, 2027", True),
    ("ny", "February 8, 2027", False), ("ny", "April 26, 2027", True), ("ny", "June 14, 2027", False), ("ny", "September 1, 2027", True),
]:
    co = MODEL_COMPANIES.pop()
    facts = f"{co} is a frontier developer under {LAW[law]}. At 9:00 a.m. on {date}, it discovered a critical safety incident involving its frontier model"
    facts += " and determined at once that a critical safety incident had occurred." if law == "ny" else "."
    facts += (" It also determined at once that the incident poses an imminent risk of death or serious physical injury." if imminent
              else " It also determined at once that the incident poses no imminent risk of death or serious physical injury.")
    add("incident-clock", LAW[law], facts, f"What is the shortest deadline that {CLOCK_CITE[law]} sets for {co} to report or disclose this incident?",
        CLOCK_OPTIONS, CLOCK_LETTER[R.incident_deadline(law, imminent)], False,
        {"law": law, "discovered": date, "imminent_risk": imminent}, R.rule_text(f"{law}_incident"))

# ---------- 4. four compute figures ----------
COMPUTE_OPTIONS = [
    "A. None of the four.",
    "B. The EU test only.",
    "C. The EU test and the ECCN 4E091 test, but not California's or New York's.",
    "D. California's, New York's and the EU test, but not the ECCN 4E091 test.",
    "E. All four.",
]
COMPUTE_LETTER = {(False, False, False, False): "A", (False, False, True, False): "B", (False, False, True, True): "C",
                  (True, True, True, False): "D", (True, True, True, True): "E"}
COMPUTE_Q = ("On training compute alone, which of these four tests does the model satisfy: California SB 53's frontier-model compute test, "
             "the amended New York RAISE Act's frontier-model compute test, the EU AI Act's Article 51(2) presumption test, "
             "and the compute test in the heading of US export control entry ECCN 4E091?")
for n in [ops("5", 24), ops("9", 24), ops("1", 25), ops("1.1", 25), ops("2", 25), ops("6", 25), ops("9.9", 25), ops("1", 26),
          ops("1.01", 26), ops("1.5", 26), ops("3", 26), ops("1", 27)]:
    co = MODEL_COMPANIES.pop()
    met = R.compute_figures_met(n)
    facts = (f"{co} trained a general-purpose foundation model in a single training run and has not fine-tuned or otherwise modified it since. "
             f"The cumulative amount of computation used for its training was {show_ops(n)} floating-point operations.")
    add("compute-figures", "California SB 53, New York RAISE Act, EU AI Act, ECCN 4E091", facts, COMPUTE_Q, COMPUTE_OPTIONS,
        COMPUTE_LETTER[(met["ca"], met["ny"], met["eu"], met["4e091"])], n in (R.EU_PRESUMPTION_OPS, R.CA_FRONTIER_OPS),
        {"ops": n}, R.rule_text("ca_frontier_model", "ny_frontier_model", "eu_presumption", "eccn_4e091"))

# ---------- 5. ECCN 3A090 ----------
CHIP_OPTIONS = ["A. 3A090.a.1.", "B. 3A090.a.2.", "C. 3A090.b.1.", "D. 3A090.b.2.", "E. None of these paragraphs."]
CHIP_LETTER = {"a.1": "A", "a.2": "B", "b.1": "C", "b.2": "D", None: "E"}
CHIP_Q = "Which of these paragraphs of ECCN 3A090 (Supplement No. 1 to 15 CFR part 774), if any, covers the chip?"
for spec in [
    {"tpp": 4800, "density": "2.0", "datacenter": True},
    {"tpp": 6000, "density": "1.0", "datacenter": True},
    {"tpp": 2000, "density": "6.4", "datacenter": True},
    {"tpp": 1600, "density": "5.92", "datacenter": True},
    {"tpp": 3000, "density": "2.5", "datacenter": True},
    {"tpp": 2400, "density": "1.6", "datacenter": True},
    {"mactops": 150, "bit_length": 8, "die_area": 800, "datacenter": True},
    {"tpp": 1800, "density": "4.0", "datacenter": True},
    {"tpp": 1600, "density": "3.2", "datacenter": True},
    {"tpp": 2300, "density": "5.9", "datacenter": True},
    {"tpp": 1500, "density": "7.0", "datacenter": True},
    {"tpp": 2200, "density": "3.0", "datacenter": True},
    {"tpp": 4000, "density": "1.5", "datacenter": True},
    {"tpp": 4000, "density": "6.5", "datacenter": False},
    {"tpp": 3000, "density": "2.5", "datacenter": False},
    {"tpp": 5000, "density": "2.0", "datacenter": False},
]:
    co = CHIP_COMPANIES.pop()
    if "mactops" in spec:
        t = R.tpp(spec["mactops"], spec["bit_length"])
        density = D(t) / D(spec["die_area"])
        facts = (f"{co} designs and markets an accelerator chip for use in datacenters. The chip has one processing unit, for which the manufacturer's "
                 f"theoretical peak is {spec['mactops']} MacTOPS at a bit length of {spec['bit_length']}. Its applicable die area is {spec['die_area']} square millimeters.")
    else:
        t, density = spec["tpp"], D(spec["density"])
        numbers = f"a 'total processing performance' (TPP) of {t} and a 'performance density' of {spec['density']}"
        facts = (f"{co} designs and markets an accelerator chip for use in datacenters. The chip has {numbers}." if spec["datacenter"]
                 else f"{co} designs and markets a chip for gaming laptops. The chip is neither designed nor marketed for use in datacenters. It has {numbers}.")
    met = R.eccn_3a090_paragraphs(t, density, spec["datacenter"])
    assert len(met) <= 1, (spec, met)   # no case sits in two paragraphs at once
    add("eccn-3a090", "ECCN 3A090", facts, CHIP_Q, CHIP_OPTIONS, CHIP_LETTER[next(iter(met), None)],
        t in (1600, 2400, 4800) or density in (D("1.6"), D("3.2"), D("5.92")),
        {**spec, "tpp_computed": t, "density_computed": str(density)}, R.rule_text("eccn_3a090"))

# ---------- 6. January 2026 licence review rule ----------
REVIEW_OPTIONS = ["A. Case-by-case review.", "B. A presumption of denial.", "C. A presumption of approval."]
REVIEW_LETTER = {"case-by-case": "A", "presumption of denial": "B"}
REVIEW_Q = "Under the January 15, 2026 BIS rule (91 FR 1684; 15 CFR 742.6(b)(10)(iii)(A)(1)), which licence review policy applies to this application?"
for t, bw, place in [(20500, 6100, "China"), (21000, 5900, "Macau"), (20999, 6499, "China"), (19000, 6500, "China"), (22400, 6200, "China"),
                     (15000, 7000, "Macau"), (20000, 6000, "Macau"), (21100, 6000, "China"), (18000, 4800, "China"), (20900, 6300, "Macau")]:
    co = CHIP_COMPANIES.pop()
    facts = (f"{co}, a US company, applies for a licence to export a chip from the United States to an end user located in {place}. "
             f"The chip has a 'total processing performance' (TPP) of {t:,} and a 'total DRAM bandwidth' of {bw:,} GB/s. "
             "The application includes all the information and certifications that paragraph (dd) of supplement no. 2 to 15 CFR part 748 asks for, "
             "and it meets the criteria of no other licensing policy.")
    if place == "China":
        facts += " China is a destination specified in Country Group D:5."
    add("licence-review", "BIS rule of January 15, 2026", facts, REVIEW_Q, REVIEW_OPTIONS, REVIEW_LETTER[R.bis_review_policy(t, bw)],
        t == R.BIS_REVIEW_TPP or bw == R.BIS_REVIEW_BANDWIDTH, {"tpp": t, "bandwidth": bw, "destination": place}, R.rule_text("bis_review"))

# ---------- 7. Section 232 semiconductor tariff ----------
TARIFF_OPTIONS = ["A. Heading 9903.79.01, which adds a 25% duty.", "B. Heading 9903.79.02, which adds no duty."]
TARIFF_LETTER = {"9903.79.01": "A", "9903.79.02": "B"}
TARIFF_Q = ("Under U.S. note 39 to subchapter III of chapter 99 of the Harmonized Tariff Schedule (the Section 232 semiconductor tariff, "
            "Proclamation 11002), which heading covers this entry?")
EDGES_TPP = {e for b in R.TARIFF_BANDS for e in b["tpp"]}
EDGES_BW = {e for b in R.TARIFF_BANDS for e in b["bandwidth"]}
for t, bw in [(15200, 4700), (20900, 6300), (20900, 6000), (14000, 4700), (17500, 4800), (16000, 5000), (19000, 5500), (15000, 6000),
              (21000, 5900), (21100, 6000), (14001, 4999), (20801, 5801)]:
    co = CHIP_COMPANIES.pop()
    facts = (f"{co} enters for consumption in the United States an article classified in HTSUS subheading 8473.30 that contains a logic integrated circuit. "
             f"The integrated circuit has a 'total processing performance' (TPP) of {t:,} and a 'total DRAM bandwidth' of {bw:,} GB/s. "
             "None of the uses in subdivision (d) of U.S. note 39 applies.")
    add("chip-tariff", "Section 232 semiconductor tariff", facts, TARIFF_Q, TARIFF_OPTIONS, TARIFF_LETTER[R.tariff_heading(t, bw)],
        t in EDGES_TPP or bw in EDGES_BW, {"tpp": t, "bandwidth": bw}, R.rule_text("tariff", extra=R.TARIFF_HEADINGS))

# ---------- 8. EU notification ----------
EU_OPTIONS = ["A. Notify the Commission without delay and in any event within two weeks.", "B. Notify the Commission within one month.",
              "C. Notify the Commission within three months.", "D. No notification on these facts."]
for n in [ops("3", 25), ops("1", 25), ops("1.2", 25), ops("8", 24), ops("5", 26), ops("9.9", 24), ops("1.01", 25), ops("2", 24)]:
    co = MODEL_COMPANIES.pop()
    facts = (f"{co} is the provider of a general-purpose AI model that it has placed on the EU market. The cumulative amount of computation used for its training, "
             f"measured in floating point operations, was {show_ops(n)}. No evaluation has found that the model has high-impact capabilities, "
             "and the Commission has made no decision about the model.")
    add("eu-notification", "EU AI Act", facts,
        f"Considering only the training-compute presumption in Article 51(2) of the EU AI Act, what does Article 52(1) require of {co}?",
        EU_OPTIONS, "A" if R.eu_notification_due(n) else "D", n == R.EU_PRESUMPTION_OPS, {"ops": n},
        R.rule_text("eu_classification", "eu_presumption", "eu_notification"))

# ---------- 9. catastrophic-risk size figures (California) ----------
SIZE_OPTIONS = ["A. Neither figure.", "B. The people figure only.", "C. The property figure only.", "D. Both figures."]
SIZE_LETTER = {(False, False): "A", (True, False): "B", (False, True): "C", (True, True): "D"}
SIZE_Q = ("The catastrophic-risk definition in California SB 53 (Business and Professions Code section 22757.11(c)) uses two size figures for a single incident: "
          "one for people killed or seriously injured, and one for damage to or loss of property. Which of the two does this scenario exceed?")
for people, prop, equity in [(70, 800 * M, 400 * M), (50, 1200 * M, 0), (51, 1000 * M, 0), (40, 900 * M, 300 * M), (120, 2500 * M, 0),
                             (100, 600 * M, 0), (30, 1000 * M, 500 * M), (60, 1001 * M, 0), (50, 1000 * M, 0), (45, 1500 * M, 0)]:
    co = MODEL_COMPANIES.pop()
    facts = (f"{co} is a frontier developer under California SB 53. Its risk assessment models a single incident involving its frontier model. "
             f"In the scenario, {people} people die or are seriously injured, and damage to and loss of property comes to {money(prop)}.")
    facts += (f" Shareholders of {co} also lose {money(equity)} in the value of their equity, which is not part of the property figure just given."
              if equity else " No one's equity loses value.")
    met = R.catastrophic_size_figures(people, prop)
    add("catastrophic-size", "California SB 53", facts, SIZE_Q, SIZE_OPTIONS, SIZE_LETTER[(met["people"], met["property"])],
        people == R.CATASTROPHIC_PEOPLE or prop == R.CATASTROPHIC_PROPERTY, {"people": people, "property_damage": prop, "equity_loss": equity},
        R.rule_text("ca_catastrophic"))

assert len(questions) == 100 and len({q["id"] for q in questions}) == 100
text = json.dumps(questions, indent=1, ensure_ascii=False) + "\n"
if "--check" in sys.argv:
    assert (HERE / "questions.json").read_text() == text, "questions.json differs from what generate.py builds"
    print("questions.json matches generate.py")
else:
    (HERE / "questions.json").write_text(text)
    by_family = {}
    for q in questions:
        f = by_family.setdefault(q["family"], {"n": 0, "boundary": 0, "keys": {}})
        f["n"] += 1
        f["boundary"] += q["boundary"]
        f["keys"][q["key"]] = f["keys"].get(q["key"], 0) + 1
    for name, f in by_family.items():
        print(f"{name:18s} n {f['n']:3d}  boundary {f['boundary']:2d}  keys {dict(sorted(f['keys'].items()))}")
    print("total", len(questions), "boundary", sum(q["boundary"] for q in questions))
