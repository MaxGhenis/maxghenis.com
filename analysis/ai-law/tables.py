#!/usr/bin/env python3
"""Print the markdown tables the post and the README use, straight from summary.json.

Usage: tables.py
"""
import json
from pathlib import Path

S = json.load(open(Path(__file__).parent / "summary.json"))
NAMES = {"claude-haiku-5-5": "Haiku 5.5", "claude-sonnet-5-5": "Sonnet 5.5", "claude-opus-5-5": "Opus 5.5", "claude-fable-5-2": "Fable 5.2"}
ARMS = ["memory", "search", "text"]
FAMILIES = {
    "frontier-model": "Frontier model (California, New York)",
    "large-developer": "Large frontier developer (California, New York)",
    "incident-clock": "Incident reporting deadline (California, New York)",
    "compute-figures": "Four compute tests",
    "eccn-3a090": "Chip export paragraphs (ECCN 3A090)",
    "licence-review": "Chip licence review (January 2026 rule)",
    "chip-tariff": "Chip tariff (Section 232)",
    "eu-notification": "EU notification (AI Act art. 52)",
    "catastrophic-size": "Catastrophic-risk size figures (California)",
}
N = S["integrity"]["search_questions"]
GROUPS = [(NAMES[m], S["by_model"][m]) for m in NAMES] + [("All four", S["all_models"])]


def cell(v):
    return f"{v['pct']}% ({v['n']:,} of {v['of']:,})" if v["of"] else "none"


def ci(b, key):
    lo, hi = b["interval_95"][key]
    return f"{lo} to {hi}"


print("ALL 100 QUESTIONS: MEMORY AND RULE TEXT\n")
print("| Model | From memory | With the rule text | Difference in points (95% interval) |")
print("|---|---|---|---|")
for name, b in GROUPS:
    a = b["all_questions"]
    print(f"| {name} | {cell(a['accuracy']['memory'])} | {cell(a['accuracy']['text'])} | {a['difference_points']['text_minus_memory']} ({ci(a, 'text_minus_memory')}) |")
print("\nintervals for accuracy, 100 questions:")
for name, b in GROUPS:
    print(f"  {name}: memory {ci(b['all_questions'], 'memory')} | text {ci(b['all_questions'], 'text')}")

print(f"\nTHE {N} SEARCH QUESTIONS: ALL THREE ARMS\n")
print("| Model | From memory | With web search | With the rule text |")
print("|---|---|---|---|")
for name, b in GROUPS:
    a = b["search_questions"]["accuracy"]
    print(f"| {name} | {cell(a['memory'])} | {cell(a['search'])} | {cell(a['text'])} |")
print(f"\ndifferences on the {N} search questions, points (95% interval):")
for name, b in GROUPS:
    s = b["search_questions"]
    print(f"  {name}: " + " | ".join(f"{k} {v} ({ci(s, k)})" for k, v in s["difference_points"].items()) + f" | search accuracy interval {ci(s, 'search')}")

print("\nBOUNDARY AND OTHER QUESTIONS\n")
print("| Questions | From memory | With web search | With the rule text |")
print("|---|---|---|---|")
a = S["all_models"]
print(f"| All 100: a figure exactly on a threshold (26) | {cell(a['all_questions']['boundary']['memory'])} | not run on all | {cell(a['all_questions']['boundary']['text'])} |")
print(f"| All 100: the other 74 | {cell(a['all_questions']['other']['memory'])} | not run on all | {cell(a['all_questions']['other']['text'])} |")
print(f"| Search questions: on a threshold | " + " | ".join(cell(a['search_questions']['boundary'][arm]) for arm in ARMS) + " |")
print(f"| Search questions: the others | " + " | ".join(cell(a['search_questions']['other'][arm]) for arm in ARMS) + " |")
for name, b in GROUPS[:-1]:
    print(f"  {name}: 100q boundary memory {cell(b['all_questions']['boundary']['memory'])}, other memory {cell(b['all_questions']['other']['memory'])}")

print("\nBY RULE\n")
print(f"| Rule | Questions | From memory | With the rule text | Search questions | From memory | With web search | With the rule text |")
print("|---|---|---|---|---|---|---|---|")
for f, name in sorted(FAMILIES.items(), key=lambda kv: S["by_family"][kv[0]]["all_questions"]["memory"]["pct"]):
    v = S["by_family"][f]
    print(f"| {name} | {v['questions']} | {cell(v['all_questions']['memory'])} | {cell(v['all_questions']['text'])} | {v['search_questions']} | "
          + " | ".join(cell(v['search_questions_accuracy'][arm]) for arm in ARMS) + " |")

print("\nSAMPLES THAT DISAGREE (model-question pairs)\n")
for name, b in GROUPS:
    print(f"  {name}: " + " | ".join(f"{arm} {cell(b['samples_disagree'][arm])}" for arm in ARMS))

print("\nSEARCH USE\n")
print("| Model | Calls with a search | Searches per call | Right when it searched | Right when it did not |")
print("|---|---|---|---|---|")
for name, b in GROUPS:
    u = b["search_use"]
    print(f"| {name} | {cell(u['calls_with_a_search'])} | {u['mean_searches_per_call']} | {cell(u['accuracy_when_searched'])} | {cell(u['accuracy_when_not_searched'])} |")

print("\nFIRST LETTER SCORED INSTEAD OF LAST (exploratory)\n")
for name, b in GROUPS:
    f1 = b["first_letter_scoring"]
    print(f"  {name}: memory {cell(f1['memory'])} | search {cell(f1['search'])} | text {cell(f1['text'])} | replies with two letters {f1['replies_with_two_letters']}")

print("\nCOST (US dollars at list price) AND MEAN TOKENS PER CALL\n")
print("| Model | Memory, 3 samples | Rule text, 3 samples | Web search, 2 samples | Total |")
print("|---|---|---|---|---|")
for name, b in GROUPS:
    c = b["cost_usd"]
    print(f"| {name} | {c['core/memory/medium']:.2f} | {c['core/text/medium']:.2f} | {c['search/search/medium']:.2f} | {sum(c.values()):.2f} |")
print("mean tokens, all four:", json.dumps(S["all_models"]["mean_tokens"]))
print(f"\nTotal in results.jsonl: ${S['total_cost_usd']}; calls (UTC): {S['calls_utc']}")
print("\nINTEGRITY", json.dumps(S["integrity"]))
print("\nMEMORY MISSES", json.dumps(S["memory_misses_by_question"]))
print("\nSEARCH MISSES", json.dumps(S["search_misses_by_question"]))
print("\nTEXT MISSES", json.dumps(S["text_misses"]))
print("\nRESULT DOMAINS", json.dumps(S["search_result_domains"]))
print("CITED DOMAINS", json.dumps(S["search_cited_domains"]))
