#!/usr/bin/env python3
"""Recount every figure from the raw rows of the larger run.

Usage: analyze.py [--write]     (reads questions.json and results.jsonl here; --write saves summary.json)

Definitions, fixed in PREREGISTRATION.md before the run:
- A call is right when the last "Answer: <letter>" line of its reply names the keyed option.
  This script re-derives that from each row's saved reply and from questions.json, and
  stops if the runner's own flag disagrees.
- A refusal, or a reply with no such line, counts as wrong. A call that never returned is
  left out of every denominator and counted under "missing".
- Accuracy for a cell is right calls over returned calls.
- Intervals come from a bootstrap that redraws the 100 questions with replacement
  (10,000 draws, seed 20261115) and keeps each question's calls together.
"""
import collections
import json
import random
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
MODELS = ["claude-haiku-5-5", "claude-sonnet-5-5", "claude-opus-5-5", "claude-fable-5-2"]
ARMS = ["memory", "search", "text"]
PLANNED = {("core", "memory", "medium"): 3, ("core", "text", "medium"): 3, ("search", "search", "medium"): 2,
           ("effort", "memory", "low"): 1, ("effort", "memory", "high"): 1}
ANSWER = re.compile(r"Answer:\s*[\*\(\[]*\s*([A-F])\b", flags=re.I)
DRAWS, SEED = 10_000, 20261115

questions = {q["id"]: q for q in json.load(open(HERE / "questions.json"))}
qids = list(questions)
raw = [json.loads(line) for line in open(HERE / "results.jsonl") if line.strip()]

# ---------- one row per cell: the last returned reply wins; errors and skips are kept apart ----------
cells, problems = {}, collections.Counter()
for r in raw:
    if r["stage"] == "probe":
        continue
    k = (r["stage"], r["arm"], r["effort"], r["model"], r["id"], r["sample"])
    if r.get("stop_reason") and not r.get("error") and not r.get("skipped"):
        if k in cells:
            problems["duplicate_returned_rows"] += 1
        cells[k] = r
planned = {(s, a, e, m, i, n) for (s, a, e), samples in PLANNED.items() for m in MODELS for i in qids for n in range(1, samples + 1)}
missing = planned - set(cells)
integrity = {
    "raw_rows": len(raw),
    "probe_rows": sum(r["stage"] == "probe" for r in raw),
    "error_rows": sum(bool(r.get("error")) for r in raw),
    "skipped_rows": sum(bool(r.get("skipped")) for r in raw),
    "planned_calls": len(planned),
    "returned_calls": len(cells),
    "missing_calls": len(missing),
    "unplanned_calls": len(set(cells) - planned),
    "duplicate_returned_rows": problems["duplicate_returned_rows"],
    "refusals": sum(r["stop_reason"] == "refusal" for r in cells.values()),
    "stop_reasons": dict(collections.Counter(r["stop_reason"] for r in cells.values())),
    "served_model_differs": sum(r["served_model"] != r["model"] for r in cells.values()),
    "no_answer_line": 0,
    "more_than_one_letter": 0,
    "runner_flag_disagrees": 0,
}
for k, r in cells.items():
    q = questions[r["id"]]
    letters = [m.group(1).upper() for m in ANSWER.finditer(r["text"] or "")]
    answer = letters[-1] if letters and letters[-1] in [o[0] for o in q["options"]] else None
    integrity["no_answer_line"] += answer is None
    integrity["more_than_one_letter"] += len(set(letters)) > 1
    right = answer == q["key"]
    if right != r["correct"] or r["key"] != q["key"]:
        integrity["runner_flag_disagrees"] += 1
    r["_right"] = right
    r["_answer"] = answer
assert integrity["runner_flag_disagrees"] == 0 and integrity["unplanned_calls"] == 0, integrity


def frac(n, d):
    return {"n": n, "of": d, "pct": round(100 * n / d, 1) if d else None}


def rows(stage, arm, effort, models=MODELS, ids=None, samples=None):
    return [r for (s, a, e, m, i, n), r in cells.items()
            if s == stage and a == arm and e == effort and m in models and (ids is None or i in ids) and (samples is None or n in samples)]


STAGE_OF = {"memory": "core", "text": "core", "search": "search"}


def accuracy(arm, models=MODELS, ids=None, effort="medium", stage=None, samples=None):
    rs = rows(stage or STAGE_OF[arm], arm, effort, models, ids, samples)
    return frac(sum(r["_right"] for r in rs), len(rs))


# ---------- bootstrap over questions ----------
def per_question(arm, models, effort="medium", stage=None, samples=None):
    right, total = collections.Counter(), collections.Counter()
    for r in rows(stage or STAGE_OF[arm], arm, effort, models, None, samples):
        right[r["id"]] += r["_right"]
        total[r["id"]] += 1
    return right, total


def interval(values):
    values = sorted(values)
    return [round(values[int(0.025 * len(values))], 1), round(values[int(0.975 * len(values)) - 1], 1)]


def bootstrap(models):
    """95% intervals for each arm's accuracy and for the paired differences between arms."""
    pq = {arm: per_question(arm, models) for arm in ARMS}
    rng = random.Random(SEED)
    draws = collections.defaultdict(list)
    for _ in range(DRAWS):
        sample = [qids[rng.randrange(len(qids))] for _ in qids]
        acc = {}
        for arm in ARMS:
            right, total = pq[arm]
            d = sum(total[i] for i in sample)
            acc[arm] = 100 * sum(right[i] for i in sample) / d if d else float("nan")
            draws[arm].append(acc[arm])
        draws["text_minus_memory"].append(acc["text"] - acc["memory"])
        draws["search_minus_memory"].append(acc["search"] - acc["memory"])
        draws["text_minus_search"].append(acc["text"] - acc["search"])
    return {k: interval(v) for k, v in draws.items()}


def block(models):
    out = {"accuracy": {arm: accuracy(arm, models) for arm in ARMS}, "interval_95": bootstrap(models)}
    a = out["accuracy"]
    out["difference_points"] = {
        "text_minus_memory": round(a["text"]["pct"] - a["memory"]["pct"], 1) if a["text"]["of"] and a["memory"]["of"] else None,
        "search_minus_memory": round(a["search"]["pct"] - a["memory"]["pct"], 1) if a["search"]["of"] and a["memory"]["of"] else None,
        "text_minus_search": round(a["text"]["pct"] - a["search"]["pct"], 1) if a["text"]["of"] and a["search"]["of"] else None,
    }
    boundary = {i for i in qids if questions[i]["boundary"]}
    out["boundary_questions"] = {arm: accuracy(arm, models, boundary) for arm in ARMS}
    out["other_questions"] = {arm: accuracy(arm, models, set(qids) - boundary) for arm in ARMS}
    # samples that disagree with one another
    out["samples_disagree"] = {}
    for arm in ARMS:
        by_pair = collections.defaultdict(set)
        count = collections.Counter()
        for r in rows(STAGE_OF[arm], arm, "medium", models):
            by_pair[(r["model"], r["id"])].add(r["_answer"])
            count[(r["model"], r["id"])] += 1
        full = [p for p in by_pair if count[p] == PLANNED[(STAGE_OF[arm], arm, "medium")]]
        out["samples_disagree"][arm] = frac(sum(len(by_pair[p]) > 1 for p in full), len(full))
    # effort sweep on the memory arm: one sample per level (the first medium sample)
    out["memory_by_effort"] = {
        "low": accuracy("memory", models, effort="low", stage="effort"),
        "medium_first_sample": accuracy("memory", models, samples={1}),
        "high": accuracy("memory", models, effort="high", stage="effort"),
    }
    s = rows("search", "search", "medium", models)
    searched = [r for r in s if (r.get("searches") or 0) > 0]
    out["search_use"] = {
        "calls_with_a_search": frac(len(searched), len(s)),
        "mean_searches_per_call": round(sum(r.get("searches") or 0 for r in s) / len(s), 2) if s else None,
        "accuracy_when_searched": frac(sum(r["_right"] for r in searched), len(searched)),
        "accuracy_when_not_searched": frac(sum(r["_right"] for r in s if r not in searched), len(s) - len(searched)),
    }
    out["cost_usd"] = {
        "memory_medium": round(sum(r["cost"] for r in rows("core", "memory", "medium", models)), 2),
        "text_medium": round(sum(r["cost"] for r in rows("core", "text", "medium", models)), 2),
        "search_medium": round(sum(r["cost"] for r in s), 2),
        "memory_low": round(sum(r["cost"] for r in rows("effort", "memory", "low", models)), 2),
        "memory_high": round(sum(r["cost"] for r in rows("effort", "memory", "high", models)), 2),
    }
    return out


families = list(dict.fromkeys(q["family"] for q in questions.values()))
summary = {
    "integrity": integrity,
    "missing_cells": sorted("|".join(map(str, k)) for k in missing)[:200],
    "all_models": block(MODELS),
    "by_model": {m: block([m]) for m in MODELS},
    "by_family": {f: {arm: accuracy(arm, MODELS, {i for i in qids if questions[i]["family"] == f}) for arm in ARMS} for f in families},
    "by_question": {arm: {i: accuracy(arm, MODELS, {i}) for i in qids} for arm in ARMS},
    "by_model_question": {arm: {m: {i: accuracy(arm, [m], {i})["n"] for i in qids} for m in MODELS} for arm in ARMS},
    "search_domains": {},
    "total_cost_usd": round(sum(r.get("cost") or 0 for r in raw), 2),
    "total_cost_without_probe_usd": round(sum(r.get("cost") or 0 for r in raw if r["stage"] != "probe"), 2),
    "tokens": {m: {"input": sum(r["in"] for r in cells.values() if r["model"] == m), "output": sum(r["out"] for r in cells.values() if r["model"] == m),
                   "searches": sum(r.get("searches") or 0 for r in cells.values() if r["model"] == m)} for m in MODELS},
    "first_and_last_call_utc": [min(r["started_at"] for r in cells.values()), max(r["started_at"] for r in cells.values())] if cells else None,
}
domains = collections.Counter()
for r in rows("search", "search", "medium"):
    for u in set(r.get("result_urls") or []):
        m = re.match(r"https?://([^/]+)/?", u)
        if m:
            domains[m.group(1).removeprefix("www.")] += 1
summary["search_domains"] = dict(domains.most_common(25))
summary["lowest_questions"] = {arm: [{"id": i, **v} for i, v in sorted(summary["by_question"][arm].items(), key=lambda kv: (kv[1]["pct"] if kv[1]["pct"] is not None else 101, kv[0]))[:12]] for arm in ARMS}


def show(x):
    return f"{x['n']}/{x['of']} ({x['pct']}%)" if x["of"] else "none"


print("INTEGRITY", json.dumps(integrity))
for label, b in [("ALL FOUR MODELS", summary["all_models"])] + [(m, summary["by_model"][m]) for m in MODELS]:
    print(f"\n== {label}")
    print("  accuracy     " + " | ".join(f"{arm} {show(b['accuracy'][arm])} CI {b['interval_95'][arm]}" for arm in ARMS))
    print(f"  differences  text-memory {b['difference_points']['text_minus_memory']} CI {b['interval_95']['text_minus_memory']}"
          f" | search-memory {b['difference_points']['search_minus_memory']} CI {b['interval_95']['search_minus_memory']}"
          f" | text-search {b['difference_points']['text_minus_search']} CI {b['interval_95']['text_minus_search']}")
    print("  boundary     " + " | ".join(f"{arm} {show(b['boundary_questions'][arm])}" for arm in ARMS))
    print("  other        " + " | ".join(f"{arm} {show(b['other_questions'][arm])}" for arm in ARMS))
    print("  samples disagree " + " | ".join(f"{arm} {show(b['samples_disagree'][arm])}" for arm in ARMS))
    print("  memory by effort " + " | ".join(f"{k} {show(v)}" for k, v in b["memory_by_effort"].items()))
    u = b["search_use"]
    print(f"  search use   calls with a search {show(u['calls_with_a_search'])} | mean searches {u['mean_searches_per_call']}"
          f" | right when searched {show(u['accuracy_when_searched'])} | right when not {show(u['accuracy_when_not_searched'])}")
    print("  cost         " + json.dumps(b["cost_usd"]))
print("\nBY FAMILY")
for f in families:
    print(f"  {f:18s} " + " | ".join(f"{arm} {show(summary['by_family'][f][arm])}" for arm in ARMS))
for arm in ARMS:
    print(f"\nLOWEST QUESTIONS, {arm}: " + ", ".join(f"{x['id']} {x['n']}/{x['of']}" for x in summary["lowest_questions"][arm]))
print("\nSEARCH DOMAINS", json.dumps(summary["search_domains"]))
print("TOTAL COST", summary["total_cost_usd"], "| without probe", summary["total_cost_without_probe_usd"], "| TOKENS", json.dumps(summary["tokens"]))
if "--write" in sys.argv:
    json.dump(summary, open(HERE / "summary.json", "w"), indent=1)
    print("wrote summary.json")
