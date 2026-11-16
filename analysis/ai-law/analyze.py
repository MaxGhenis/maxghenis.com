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
- Intervals come from a bootstrap that redraws the questions with replacement
  (10,000 draws, seed 20261115) and keeps each question's calls together.

Changed after the run (the version whose hash PREREGISTRATION.md carries is in the git
history of this file's pull request only as that hash; the changes are these):
- The API credit ran out during the search stage. Under the pre-registered rule for a stage
  cut short, the search arm is reported on the questions for which all four models returned
  both samples ("search questions"). Calls on questions only some models finished are left out.
- Every comparison that involves the search arm uses the memory and text calls on those same
  questions, so the three arms are compared like for like.
- The effort stage did not run, so the effort table is empty.
- Added, as exploratory: accuracy when the first "Answer:" letter of a reply is scored
  in place of the last.
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

# ---------- one row per cell: a returned reply; errors and skips are counted apart ----------
cells, problems = {}, collections.Counter()
for r in raw:
    k = (r["stage"], r["arm"], r["effort"], r["model"], r["id"], r["sample"])
    if r.get("stop_reason") and not r.get("error") and not r.get("skipped"):
        if k in cells:
            problems["duplicate_returned_rows"] += 1
        cells[k] = r
planned = {(s, a, e, m, i, n) for (s, a, e), samples in PLANNED.items() for m in MODELS for i in qids for n in range(1, samples + 1)}
missing = planned - set(cells)
for k, r in cells.items():
    q = questions[r["id"]]
    letters = [m.group(1).upper() for m in ANSWER.finditer(r["text"] or "")]
    options = [o[0] for o in q["options"]]
    r["_answer"] = letters[-1] if letters and letters[-1] in options else None
    r["_right"] = r["_answer"] == q["key"]
    r["_first_right"] = bool(letters) and letters[0] == q["key"]
    r["_letters"] = letters

search_count = collections.Counter(i for (s, a, e, m, i, n) in cells if s == "search")
SEARCH_IDS = {i for i in qids if search_count[i] == len(MODELS) * PLANNED[("search", "search", "medium")]}
search_partial = {i: search_count[i] for i in qids if 0 < search_count[i] < len(MODELS) * 2}

integrity = {
    "raw_rows": len(raw),
    "error_rows": sum(bool(r.get("error")) for r in raw),
    "error_kinds": dict(collections.Counter(re.sub(r"[^a-zA-Z ].*", "", (r["error"].split("'message': '")[-1])[:60]).strip() for r in raw if r.get("error"))),
    "skipped_rows": sum(bool(r.get("skipped")) for r in raw),
    "planned_calls": len(planned),
    "returned_calls": len(cells),
    "missing_calls": {f"{s}/{a}/{e}": sum(1 for k in missing if k[:3] == (s, a, e)) for (s, a, e) in PLANNED},
    "unplanned_calls": len(set(cells) - planned),
    "duplicate_returned_rows": problems["duplicate_returned_rows"],
    "refusals": sum(r["stop_reason"] == "refusal" for r in cells.values()),
    "stop_reasons": dict(collections.Counter(r["stop_reason"] for r in cells.values())),
    "served_model_differs": sum(r["served_model"] != r["model"] for r in cells.values()),
    "no_answer_line": sum(r["_answer"] is None for r in cells.values()),
    "more_than_one_letter": sum(len(set(r["_letters"])) > 1 for r in cells.values()),
    "runner_flag_disagrees": sum(r["_right"] != r["correct"] or r["key"] != questions[r["id"]]["key"] for r in cells.values()),
    "search_questions": len(SEARCH_IDS),
    "search_questions_partly_answered": search_partial,
    "search_calls_left_out": sum(search_partial.values()),
    "search_tool_errors": sum(bool(r.get("tool_errors")) for r in cells.values()),
    "continued_calls": sum((r.get("continuations") or 0) > 0 for r in cells.values()),
}
assert integrity["runner_flag_disagrees"] == 0 and integrity["unplanned_calls"] == 0 and integrity["duplicate_returned_rows"] == 0, integrity

STAGE_OF = {"memory": "core", "text": "core", "search": "search"}


def frac(n, d):
    return {"n": n, "of": d, "pct": round(100 * n / d, 1) if d else None}


def rows(arm, models=MODELS, ids=None, effort="medium", stage=None, samples=None):
    stage = stage or STAGE_OF[arm]
    if arm == "search":
        ids = SEARCH_IDS if ids is None else set(ids) & SEARCH_IDS
    return [r for (s, a, e, m, i, n), r in cells.items()
            if s == stage and a == arm and e == effort and m in models and (ids is None or i in ids) and (samples is None or n in samples)]


def accuracy(arm, models=MODELS, ids=None, field="_right", **kw):
    rs = rows(arm, models, ids, **kw)
    return frac(sum(r[field] for r in rs), len(rs))


def interval(values):
    values = sorted(values)
    return [round(values[int(0.025 * len(values))], 1), round(values[int(0.975 * len(values)) - 1], 1)]


def bootstrap(models, arms, ids):
    """95% intervals for each arm's accuracy on `ids` and for the paired differences between arms."""
    ids = sorted(ids, key=qids.index)
    pq = {}
    for arm in arms:
        right, total = collections.Counter(), collections.Counter()
        for r in rows(arm, models, ids):
            right[r["id"]] += r["_right"]
            total[r["id"]] += 1
        pq[arm] = (right, total)
    rng = random.Random(SEED)
    draws = collections.defaultdict(list)
    for _ in range(DRAWS):
        sample = [ids[rng.randrange(len(ids))] for _ in ids]
        acc = {}
        for arm in arms:
            right, total = pq[arm]
            acc[arm] = 100 * sum(right[i] for i in sample) / sum(total[i] for i in sample)
            draws[arm].append(acc[arm])
        for a, b in [("text", "memory"), ("search", "memory"), ("text", "search")]:
            if a in acc and b in acc:
                draws[f"{a}_minus_{b}"].append(acc[a] - acc[b])
    return {k: interval(v) for k, v in draws.items()}


def differences(acc):
    return {f"{a}_minus_{b}": round(acc[a]["pct"] - acc[b]["pct"], 1)
            for a, b in [("text", "memory"), ("search", "memory"), ("text", "search")] if a in acc and b in acc}


BOUNDARY = {i for i in qids if questions[i]["boundary"]}


def block(models):
    out = {}
    # all 100 questions: memory and text
    full = {arm: accuracy(arm, models) for arm in ("memory", "text")}
    out["all_questions"] = {"accuracy": full, "difference_points": differences(full), "interval_95": bootstrap(models, ("memory", "text"), qids),
                            "boundary": {arm: accuracy(arm, models, BOUNDARY) for arm in ("memory", "text")},
                            "other": {arm: accuracy(arm, models, set(qids) - BOUNDARY) for arm in ("memory", "text")}}
    # the search questions: all three arms, like for like
    sub = {arm: accuracy(arm, models, SEARCH_IDS) for arm in ARMS}
    out["search_questions"] = {"accuracy": sub, "difference_points": differences(sub), "interval_95": bootstrap(models, ARMS, SEARCH_IDS),
                               "boundary": {arm: accuracy(arm, models, BOUNDARY & SEARCH_IDS) for arm in ARMS},
                               "other": {arm: accuracy(arm, models, SEARCH_IDS - BOUNDARY) for arm in ARMS}}
    # samples that disagree with one another
    out["samples_disagree"] = {}
    for arm in ARMS:
        answers = collections.defaultdict(list)
        for r in rows(arm, models):
            answers[(r["model"], r["id"])].append(r["_answer"])
        out["samples_disagree"][arm] = frac(sum(len(set(v)) > 1 for v in answers.values()), len(answers))
    out["memory_by_effort"] = {
        "low": accuracy("memory", models, effort="low", stage="effort"),
        "medium_first_sample": accuracy("memory", models, samples={1}),
        "high": accuracy("memory", models, effort="high", stage="effort"),
    }
    s = rows("search", models)
    searched = [r for r in s if (r.get("searches") or 0) > 0]
    unsearched = [r for r in s if not (r.get("searches") or 0) > 0]
    out["search_use"] = {
        "calls_with_a_search": frac(len(searched), len(s)),
        "mean_searches_per_call": round(sum(r.get("searches") or 0 for r in s) / len(s), 2) if s else None,
        "accuracy_when_searched": frac(sum(r["_right"] for r in searched), len(searched)),
        "accuracy_when_not_searched": frac(sum(r["_right"] for r in unsearched), len(unsearched)),
    }
    out["first_letter_scoring"] = {"memory": accuracy("memory", models, field="_first_right"), "text": accuracy("text", models, field="_first_right"),
                                   "search": accuracy("search", models, field="_first_right"),
                                   "replies_with_two_letters": {arm: sum(len(set(r["_letters"])) > 1 for r in rows(arm, models)) for arm in ARMS}}
    every = [r for r in raw if r["model"] in models]
    out["cost_usd"] = {f"{s}/{a}/{e}": round(sum(r.get("cost") or 0 for r in every if (r["stage"], r["arm"], r["effort"]) == (s, a, e)), 2) for (s, a, e) in PLANNED}
    out["mean_tokens"] = {arm: {"input": round(sum(r["in"] for r in rows(arm, models)) / max(1, len(rows(arm, models)))),
                                "output": round(sum(r["out"] for r in rows(arm, models)) / max(1, len(rows(arm, models))))} for arm in ARMS}
    return out


families = list(dict.fromkeys(q["family"] for q in questions.values()))
ids_of = {f: {i for i in qids if questions[i]["family"] == f} for f in families}
summary = {
    "integrity": integrity,
    "search_question_ids": sorted(SEARCH_IDS, key=qids.index),
    "questions_without_search": [i for i in qids if i not in SEARCH_IDS],
    "all_models": block(MODELS),
    "by_model": {m: block([m]) for m in MODELS},
    "by_family": {f: {"questions": len(ids_of[f]), "search_questions": len(ids_of[f] & SEARCH_IDS),
                      "all_questions": {arm: accuracy(arm, MODELS, ids_of[f]) for arm in ("memory", "text")},
                      "search_questions_accuracy": {arm: accuracy(arm, MODELS, ids_of[f] & SEARCH_IDS) for arm in ARMS}} for f in families},
    "by_question": {arm: {i: accuracy(arm, MODELS, {i}) for i in (qids if arm != "search" else sorted(SEARCH_IDS, key=qids.index))} for arm in ARMS},
    "by_model_question_right": {arm: {m: {i: accuracy(arm, [m], {i})["n"] for i in (qids if arm != "search" else sorted(SEARCH_IDS, key=qids.index))} for m in MODELS} for arm in ARMS},
    "total_cost_usd": round(sum(r.get("cost") or 0 for r in raw), 2),
    "tokens": {m: {"input": sum(r["in"] for r in cells.values() if r["model"] == m), "output": sum(r["out"] for r in cells.values() if r["model"] == m),
                   "searches": sum(r.get("searches") or 0 for r in cells.values() if r["model"] == m)} for m in MODELS},
    "calls_utc": {stage: [min(r["started_at"] for r in cells.values() if r["stage"] == stage), max(r["started_at"] for r in cells.values() if r["stage"] == stage)]
                  for stage in ("core", "search") if any(r["stage"] == stage for r in cells.values())},
}
def domain_set(urls):
    found = set()
    for u in urls or []:
        m = re.match(r"https?://([^/]+)/?", u)
        if m:
            found.add(m.group(1).removeprefix("www."))
    return found


# for each site, the number of search-arm calls whose results (or citations) include it
domains, cited = collections.Counter(), collections.Counter()
for r in rows("search"):
    domains.update(domain_set(r.get("result_urls")))
    cited.update(domain_set(r.get("cited_urls")))
summary["search_calls_with_results"] = sum(bool(r.get("result_urls")) for r in rows("search"))
summary["search_calls_with_a_citation"] = sum(bool(r.get("cited_urls")) for r in rows("search"))
summary["search_result_domains"] = dict(domains.most_common(25))
summary["search_cited_domains"] = dict(cited.most_common(25))
summary["cost_per_call_usd"] = {arm: round(sum(r["cost"] for r in rows(arm)) / len(rows(arm)), 4) for arm in ARMS}
summary["wrong_search_replies"] = {"wrong": sum(not r["_right"] for r in rows("search")),
                                   "wrong_without_a_search": sum(not r["_right"] and not (r.get("searches") or 0) for r in rows("search"))}
summary["memory_misses_by_question"] = [{"id": i, "wrong": v["of"] - v["n"], "of": v["of"], "boundary": questions[i]["boundary"],
                                         "wrong_by_model": {m.split("-")[1]: 3 - summary["by_model_question_right"]["memory"][m][i] for m in MODELS}}
                                        for i, v in sorted(summary["by_question"]["memory"].items(), key=lambda kv: kv[1]["n"]) if v["n"] < v["of"]]
summary["search_misses_by_question"] = [{"id": i, "wrong": v["of"] - v["n"], "of": v["of"], "boundary": questions[i]["boundary"],
                                         "wrong_by_model": {m.split("-")[1]: 2 - summary["by_model_question_right"]["search"][m][i] for m in MODELS}}
                                        for i, v in sorted(summary["by_question"]["search"].items(), key=lambda kv: kv[1]["n"]) if v["n"] < v["of"]]
summary["text_misses"] = [{"model": r["model"], "id": r["id"], "sample": r["sample"], "answer": r["_answer"], "key": r["key"]} for r in rows("text") if not r["_right"]]


def show(x):
    return f"{x['n']}/{x['of']} ({x['pct']}%)" if x["of"] else "none"


print("INTEGRITY", json.dumps(integrity))
for label, b in [("ALL FOUR MODELS", summary["all_models"])] + [(m, summary["by_model"][m]) for m in MODELS]:
    print(f"\n== {label}")
    a, s = b["all_questions"], b["search_questions"]
    print(f"  100 questions    memory {show(a['accuracy']['memory'])} CI {a['interval_95']['memory']} | text {show(a['accuracy']['text'])} CI {a['interval_95']['text']}"
          f" | text-memory {a['difference_points']['text_minus_memory']} CI {a['interval_95']['text_minus_memory']}")
    print(f"    boundary       memory {show(a['boundary']['memory'])} | text {show(a['boundary']['text'])}    other  memory {show(a['other']['memory'])} | text {show(a['other']['text'])}")
    print(f"  {len(SEARCH_IDS)} search q.     " + " | ".join(f"{arm} {show(s['accuracy'][arm])} CI {s['interval_95'][arm]}" for arm in ARMS))
    print("    differences    " + " | ".join(f"{k} {v} CI {s['interval_95'][k]}" for k, v in s["difference_points"].items()))
    print("    boundary       " + " | ".join(f"{arm} {show(s['boundary'][arm])}" for arm in ARMS) + "    other  " + " | ".join(f"{arm} {show(s['other'][arm])}" for arm in ARMS))
    print("  samples disagree " + " | ".join(f"{arm} {show(b['samples_disagree'][arm])}" for arm in ARMS))
    u = b["search_use"]
    print(f"  search use       calls with a search {show(u['calls_with_a_search'])} | mean searches {u['mean_searches_per_call']}"
          f" | right when searched {show(u['accuracy_when_searched'])} | right when not {show(u['accuracy_when_not_searched'])}")
    f1 = b["first_letter_scoring"]
    print(f"  first letter     memory {show(f1['memory'])} | search {show(f1['search'])} | text {show(f1['text'])} | replies with two letters {f1['replies_with_two_letters']}")
    print("  cost             " + json.dumps(b["cost_usd"]) + " | mean tokens " + json.dumps(b["mean_tokens"]))
print("\nBY FAMILY (100 questions: memory, text; search questions: memory, search, text)")
for f in families:
    v = summary["by_family"][f]
    print(f"  {f:18s} {v['questions']:2d} q  memory {show(v['all_questions']['memory'])} | text {show(v['all_questions']['text'])}"
          f"   ||  {v['search_questions']:2d} q  " + " | ".join(f"{arm} {show(v['search_questions_accuracy'][arm])}" for arm in ARMS))
print("\nMEMORY MISSES", json.dumps(summary["memory_misses_by_question"]))
print("\nSEARCH MISSES", json.dumps(summary["search_misses_by_question"]))
print("\nTEXT MISSES", json.dumps(summary["text_misses"]))
print("\nRESULT DOMAINS", json.dumps(summary["search_result_domains"]))
print("CITED DOMAINS", json.dumps(summary["search_cited_domains"]))
print("TOTAL COST", summary["total_cost_usd"], "| TOKENS", json.dumps(summary["tokens"]), "| CALLS UTC", summary["calls_utc"])
if "--write" in sys.argv:
    json.dump(summary, open(HERE / "summary.json", "w"), indent=1)
    print("wrote summary.json")
