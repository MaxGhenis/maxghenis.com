"""The rules the questions test: each threshold typed by hand from the rule text, the test
it sets, and the words the questions quote.

This file is the answer key's only source. It covers the handful of provisions the
questions ask about and nothing else in these laws. Every string in QUOTES appears word
for word in the source named beside it (straight quotation marks and ^ for a superscript
aside); check_quotes.py tests that against downloaded copies.
"""
from decimal import Decimal as D

# ---------- thresholds ----------
CA_FRONTIER_OPS = 10**26            # "greater than"; Cal. Bus. & Prof. Code 22757.11(i)(1)
NY_FRONTIER_OPS = 10**26            # "greater than"; N.Y. Gen. Bus. Law 1420(9)(a)
EU_PRESUMPTION_OPS = 10**25         # "greater than"; Regulation (EU) 2024/1689 art. 51(2)
ECCN_4E091_OPS = 10**26             # "or more"; ECCN 4E091 heading, 15 CFR part 774 Supp. 1
LARGE_DEVELOPER_REVENUE = 500_000_000   # "in excess of"; 22757.11(j) and N.Y. GBL 1420(10)
CATASTROPHIC_PEOPLE = 50            # "more than"; 22757.11(c)(1)
CATASTROPHIC_PROPERTY = 1_000_000_000   # "more than"; 22757.11(c)(1); equity loss excluded by 22757.16
BIS_REVIEW_TPP = 21_000             # "less than"; 15 CFR 742.6(b)(10)(iii)(A)(1), 91 FR 1684
BIS_REVIEW_BANDWIDTH = 6_500        # "less than", GB/s; same paragraph
TARIFF_BANDS = (                    # every edge strict; HTSUS ch. 99 subch. III U.S. note 39(b)
    {"tpp": (14_000, 17_500), "bandwidth": (4_500, 5_000)},
    {"tpp": (20_800, 21_100), "bandwidth": (5_800, 6_200)},
)


# ---------- tests ----------
def frontier_model(original_ops, finetune_ops=0, rl_ops=0):
    """California and New York use the same words: the count includes the developer's own
    later fine-tuning and reinforcement learning, and must be greater than 10^26."""
    return original_ops + finetune_ops + rl_ops > CA_FRONTIER_OPS


def large_frontier_developer(model_ops, own_revenue, affiliate_revenues=()):
    """A frontier developer whose revenue with affiliates, in the preceding calendar year,
    is in excess of $500,000,000. Revenues passed in are the preceding calendar year's."""
    return frontier_model(model_ops) and own_revenue + sum(affiliate_revenues) > LARGE_DEVELOPER_REVENUE


def incident_deadline(law, imminent_risk):
    """Shortest deadline for a critical safety incident the developer has discovered."""
    if imminent_risk:
        return "24 hours"           # 22757.13(c)(2); GBL 1422(3)(b)
    return {"ca": "15 days", "ny": "72 hours"}[law]   # 22757.13(c)(1); GBL 1422(3)(a)


def compute_figures_met(ops):
    return {
        "ca": ops > CA_FRONTIER_OPS,
        "ny": ops > NY_FRONTIER_OPS,
        "eu": ops > EU_PRESUMPTION_OPS,
        "4e091": ops >= ECCN_4E091_OPS,
    }


def tpp(mactops, bit_length):
    return 2 * mactops * bit_length  # Technical Note 2 to 3A090.a and 3A090.b


def eccn_3a090_paragraphs(tpp_value, density, datacenter):
    """The 3A090.a and 3A090.b paragraphs a chip meets. density is a Decimal."""
    density = D(str(density))
    if not datacenter and not tpp_value >= 4800:   # Note 2 to 3A090.a and 3A090.b
        return set()
    met = set()
    if tpp_value >= 4800:
        met.add("a.1")
    if tpp_value >= 1600 and density >= D("5.92"):
        met.add("a.2")
    if 2400 <= tpp_value < 4800 and D("1.6") <= density < D("5.92"):
        met.add("b.1")
    if tpp_value >= 1600 and D("3.2") <= density < D("5.92"):
        met.add("b.2")
    return met


def bis_review_policy(tpp_value, bandwidth):
    """Export from the United States to an end user located in China or Macau, with the
    paragraph (dd) information supplied and no other licensing policy in play."""
    if tpp_value < BIS_REVIEW_TPP and bandwidth < BIS_REVIEW_BANDWIDTH:
        return "case-by-case"
    return "presumption of denial"


def tariff_heading(tpp_value, bandwidth):
    """An article classifiable in 8471.50, 8471.80 or 8473.30 that is or contains a logic
    integrated circuit, with no subdivision (d) use."""
    for band in TARIFF_BANDS:
        if band["tpp"][0] < tpp_value < band["tpp"][1] and band["bandwidth"][0] < bandwidth < band["bandwidth"][1]:
            return "9903.79.01"     # the duty in the applicable subheading + 25%
    return "9903.79.02"             # the duty in the applicable subheading


def eu_notification_due(ops):
    """Considering only the art. 51(2) presumption: notification within two weeks is due
    when training compute is greater than 10^25."""
    return ops > EU_PRESUMPTION_OPS


def catastrophic_size_figures(people, property_damage):
    """Which of the two size figures a single incident exceeds. Loss of equity value is not
    property damage (22757.16), so callers leave it out of property_damage."""
    return {"people": people > CATASTROPHIC_PEOPLE, "property": property_damage > CATASTROPHIC_PROPERTY}


# ---------- the words the questions quote ----------
QUOTES = {
    "ca_frontier_model": (
        "Cal. Bus. & Prof. Code 22757.11(i)",
        [
            "\"Frontier model\" means a foundation model that was trained using a quantity of computing power greater than 10^26 integer or floating-point operations.",
            "The quantity of computing power described in paragraph (1) shall include computing for the original training run and for any subsequent fine-tuning, reinforcement learning, or other material modifications the developer applies to a preceding foundation model.",
        ],
    ),
    "ca_frontier_developer": (
        "Cal. Bus. & Prof. Code 22757.11(h)",
        ["\"Frontier developer\" means a person who has trained, or initiated the training of, a frontier model, with respect to which the person has used, or intends to use, at least as much computing power to train the frontier model as would meet the technical specifications found in subdivision (i)."],
    ),
    "ca_large_developer": (
        "Cal. Bus. & Prof. Code 22757.11(j)",
        ["\"Large frontier developer\" means a frontier developer that together with its affiliates collectively had annual gross revenues in excess of five hundred million dollars ($500,000,000) in the preceding calendar year."],
    ),
    "ca_incident": (
        "Cal. Bus. & Prof. Code 22757.13(c)",
        [
            "Subject to paragraph (2), a frontier developer shall report any critical safety incident pertaining to one or more of its frontier models to the Office of Emergency Services within 15 days of discovering the critical safety incident.",
            "If a frontier developer discovers that a critical safety incident poses an imminent risk of death or serious physical injury, the frontier developer shall disclose that incident within 24 hours to an authority, including any law enforcement agency or public safety agency with jurisdiction, that is appropriate based on the nature of that incident and as required by law.",
        ],
    ),
    "ca_catastrophic": (
        "Cal. Bus. & Prof. Code 22757.11(c)(1) and 22757.16",
        [
            "\"Catastrophic risk\" means a foreseeable and material risk that a frontier developer's development, storage, use, or deployment of a frontier model will materially contribute to the death of, or serious injury to, more than 50 people or more than one billion dollars ($1,000,000,000) in damage to, or loss of, property arising from a single incident involving a frontier model doing any of the following:",
            "The loss of value of equity does not count as damage to or loss of property for the purposes of this chapter.",
        ],
    ),
    "ny_frontier_model": (
        "N.Y. Gen. Bus. Law 1420(9), as added by chapter 96 of the laws of 2026 (in effect January 1, 2027)",
        [
            "\"Frontier model\" means a foundation model that was trained using a quantity of computing power greater than 10^26 integer or floating-point operations.",
            "The quantity of computing power described in paragraph (a) of this subdivision shall include computing for the original training run and for any subsequent fine-tuning, reinforcement learning, or other material modifications the developer applies to a preceding foundation model.",
        ],
    ),
    "ny_frontier_developer": (
        "N.Y. Gen. Bus. Law 1420(8)",
        ["\"Frontier developer\" means a person who has trained, or initiated the training of, a frontier model, with respect to which the person has used, or intends to use, at least as much computing power to train the frontier model as would meet the technical specifications found in subdivision nine of this section."],
    ),
    "ny_large_developer": (
        "N.Y. Gen. Bus. Law 1420(10)",
        ["\"Large frontier developer\" means a frontier developer that together with its affiliates collectively had annual gross revenues in excess of five hundred million dollars in the preceding calendar year."],
    ),
    "ny_incident": (
        "N.Y. Gen. Bus. Law 1422(3)",
        [
            "Subject to paragraph (b) of this subdivision, a frontier developer shall report any critical safety incident pertaining to one or more of its frontier models to the office within seventy-two hours from a determination that a critical safety incident has occurred or within seventy-two hours of the frontier developer learning facts sufficient to establish a reasonable belief that a critical safety incident has occurred.",
            "If a frontier developer discovers that a critical safety incident poses an imminent risk of death or serious physical injury, the frontier developer shall disclose that incident within twenty-four hours to an authority, including any law enforcement agency or public safety agency with jurisdiction, that is appropriate based on the nature of that incident and as required by law.",
        ],
    ),
    "eu_presumption": (
        "Regulation (EU) 2024/1689 (EU AI Act) art. 51(2)",
        ["A general-purpose AI model shall be presumed to have high impact capabilities pursuant to paragraph 1, point (a), when the cumulative amount of computation used for its training measured in floating point operations is greater than 10^25."],
    ),
    "eu_classification": (
        "Regulation (EU) 2024/1689 (EU AI Act) art. 51(1)(a)",
        ["it has high impact capabilities evaluated on the basis of appropriate technical tools and methodologies, including indicators and benchmarks;"],
    ),
    "eu_notification": (
        "Regulation (EU) 2024/1689 (EU AI Act) art. 52(1)",
        ["Where a general-purpose AI model meets the condition referred to in Article 51(1), point (a), the relevant provider shall notify the Commission without delay and in any event within two weeks after that requirement is met or it becomes known that it will be met."],
    ),
    "eccn_4e091": (
        "ECCN 4E091, Supplement No. 1 to 15 CFR part 774 (heading)",
        ["'Parameters' for an artificial intelligence model trained utilizing 10^26 or more 'operations.'"],
    ),
    "eccn_3a090": (
        "ECCN 3A090, Supplement No. 1 to 15 CFR part 774",
        [
            "a. Integrated circuits having one or more digital processing units having either of the following: a.1. A 'total processing performance' of 4800 or more; or a.2. A 'total processing performance' of 1600 or more and a 'performance density' of 5.92 or more.",
            "b. Integrated circuits having one or more digital processing units having either of the following: b.1. A 'total processing performance' of 2400 or more and less than 4800 and a 'performance density' of 1.6 or more and less than 5.92, or b.2. A 'total processing performance' of 1600 or more and a 'performance density' of 3.2 or more and less than 5.92.",
            "Note 2 to 3A090.a and 3A090.b: 3A090.a and 3A090.b do not apply to items that are not designed or marketed for use in datacenters and do not have a 'total processing performance' of 4800 or more.",
            "'Total processing performance' ('TPP') is 2 × 'MacTOPS' × 'bit length of the operation', aggregated over all processing units on the integrated circuit.",
            "'Performance density' is 'TPP' divided by 'applicable die area'.",
        ],
    ),
    "bis_review": (
        "15 CFR 742.6(b)(10)(iii)(A)(1), as revised by the BIS rule of January 15, 2026 (91 FR 1684)",
        [
            "There is a case-by-case license review policy for license applications for exports of commodities with a TPP (as defined in Technical Note 2 to 3A090.a and 3A090.b) less than 21,000, and a 'total DRAM bandwidth' (as defined in the notes to paragraph (dd)(1) in supplement no. 2 to part 748) less than 6,500 GB/s, when destined to end-users located in China or Macau, provided the applicant provides the additional information described in supplement no. 2 to part 748 under paragraph (dd).",
            "All other applications for exports, reexports, or transfers (in-country) will be reviewed under a presumption of denial to or within Macau or destinations specified in Country Group D:5 or to an entity headquartered in, or whose ultimate parent company is headquartered in, either Macau or a destination specified in Country Group D:5.",
        ],
    ),
    "tariff": (
        "U.S. note 39 to subchapter III of chapter 99 of the HTSUS, as inserted by Proclamation 11002 (91 FR 2443)",
        [
            "To be included within the definition of semiconductor articles, the imported products must be a logic integrated circuit, or an article that contains a logic integrated circuit, that meets the technical parameters of having: (1) a total processing performance greater than 14,000 and less than 17,500, and a total DRAM bandwidth greater than 4,500 GB/s and less than 5,000 GB/s; or (2) a total processing performance greater than 20,800 and less than 21,100, and total DRAM bandwidth greater than 5,800 GB/s and less than 6,200 GB/s.",
            "Heading 9903.79.02 applies to entries of articles that are classifiable under provisions of the HTSUS enumerated in subdivision (b) of this note but that do not meet the technical parameters specified in subdivision (b) of this note.",
        ],
    ),
}

# Facts the tariff rule text states in its own words (checked by a reader against the
# heading table in the proclamation's annex and HTS Revision 23; the table is laid out in
# columns, so these are not word-for-word quotes).
TARIFF_HEADINGS = (
    "Subdivision (b) lists the provisions 8471.50, 8471.80 and 8473.30. "
    "Heading 9903.79.01 (semiconductor articles as provided for in subdivisions (a) and (b)) carries the duty provided in the applicable subheading plus 25%. "
    "Heading 9903.79.02 (articles as provided for in subdivision (c)) carries the duty provided in the applicable subheading."
)


def rule_text(*keys, extra=""):
    parts = []
    for k in keys:
        cite, quotes = QUOTES[k]
        parts.append(cite + ": " + " ".join('"' + q.replace('"', "'") + '"' for q in quotes))
    if extra:
        parts.append(extra)
    return "\n".join(parts)
