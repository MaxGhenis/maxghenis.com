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
    "licence-review": "Chip license review (January 2026 rule)",
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
print("\nALL 100 QUESTIONS WITH INTERVALS\n")
print("| Model | From memory (95% interval) | With the rule text (95% interval) | Difference in points (95% interval) |")
print("|---|---|---|---|")
for name, b in GROUPS:
    a = b["all_questions"]
    print(f"| {name} | {cell(a['accuracy']['memory'])}, {ci(a, 'memory')} | {cell(a['accuracy']['text'])}, {ci(a, 'text')} | {a['difference_points']['text_minus_memory']} ({ci(a, 'text_minus_memory')}) |")

print(f"\nTHE {N} SEARCH QUESTIONS: ALL THREE ARMS\n")
print("| Model | From memory | With web search | With the rule text |")
print("|---|---|---|---|")
for name, b in GROUPS:
    a = b["search_questions"]["accuracy"]
    print(f"| {name} | {cell(a['memory'])} | {cell(a['search'])} | {cell(a['text'])} |")
print(f"\nTHE {N} SEARCH QUESTIONS WITH INTERVALS\n")
print("| Model | From memory | With web search | With the rule text | Search minus memory | Text minus search |")
print("|---|---|---|---|---|---|")
for name, b in GROUPS:
    q = b["search_questions"]
    a, d = q["accuracy"], q["difference_points"]
    print(f"| {name} | {cell(a['memory'])}, {ci(q, 'memory')} | {cell(a['search'])}, {ci(q, 'search')} | {cell(a['text'])}, {ci(q, 'text')} | "
          f"{d['search_minus_memory']} ({ci(q, 'search_minus_memory')}) | {d['text_minus_search']} ({ci(q, 'text_minus_search')}) |")
print("  pooled text minus memory on these questions:", S["all_models"]["search_questions"]["difference_points"]["text_minus_memory"], ci(S["all_models"]["search_questions"], "text_minus_memory"))

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
    print(f"  {name}: memory {cell(f1['memory'])} | search {cell(f1['search'])} | text {cell(f1['text'])} | replies with two letters {b['replies_with_two_letters']}")
print("\nREPLIES WITH A THINKING BLOCK\n")
print("| Model | From memory | With web search | With the rule text |")
print("|---|---|---|---|")
for name, b in GROUPS:
    t = b["replies_with_a_thinking_block"]
    print(f"| {name} | {cell(t['memory'])} | {cell(t['search'])} | {cell(t['text'])} |")
print("\nWITHOUT QUESTIONS OPEN TO A SECOND READING (all four models)\n")
print("| Left out | From memory, all questions | With the rule text, all questions | From memory, search questions | With web search | With the rule text, search questions |")
print("|---|---|---|---|---|---|")
for key, w in S["without_open_questions"].items():
    print(f"| {key} ({len(w['questions_left_out'])}) | {cell(w['all_questions']['memory'])} | {cell(w['all_questions']['text'])} | {cell(w['search_questions']['memory'])} | {cell(w['search_questions']['search'])} | {cell(w['search_questions']['text'])} |")

print("\nCOST (US dollars at list price) AND MEAN TOKENS PER CALL\n")
print("| Model | Memory, 3 samples | Rule text, 3 samples | Web search, 2 samples | Total |")
print("|---|---|---|---|---|")
for name, b in GROUPS:
    c = b["cost_usd"]
    print(f"| {name} | {c['core/memory/medium']:.2f} | {c['core/text/medium']:.2f} | {c['search/search/medium']:.2f} | {c['total']:.2f} |")
print("per call, all four:", json.dumps(S["all_models"]["per_call"]))
print("search use, all four:", json.dumps(S["all_models"]["search_use"]))
print(f"\nTotal in results.jsonl: ${S['total_cost_usd']}; calls (UTC): {S['calls_utc']}")
print("\nINTEGRITY", json.dumps(S["integrity"]))
print("\nMEMORY MISSES", json.dumps(S["memory_misses_by_question"]))
print("\nSEARCH MISSES", json.dumps(S["search_misses"]))
print("\nTEXT MISSES", json.dumps(S["text_misses"]))
print("\nRESULT SITES", json.dumps(S["search_result_sites"]))
print("CITED SITES", json.dumps(S["search_cited_sites"]))
