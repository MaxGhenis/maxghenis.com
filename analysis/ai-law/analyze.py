#!/usr/bin/env python3
"""Recount every figure from the raw rows of the larger run.

Usage: analyze.py [--write]     (reads questions.json and results.jsonl here; --write saves summary.json)

Definitions, fixed in PREREGISTRATION.md before the run:
- A call is right when the last "Answer: <letter>" line of its reply names the keyed option.
  This script re-derives that from each row's saved reply and from questions.json.
- A refusal, or a reply with no such line, counts as wrong. A call that never returned is
  left out of every denominator and counted under "missing".
- Accuracy for a cell is right calls over returned calls.
- Intervals come from a bootstrap that redraws the questions with replacement
  (10,000 draws, seed 20261115) and keeps each question's calls together.

Changed after the run. analyze_preregistered.py is the version whose hash
PREREGISTRATION.md carries. The changes:
- The API credit ran out during the search stage. The search arm is reported on the
  questions for which all four models returned both samples ("search questions"), by
  analogy with the pre-registered rule for a stage the cap cuts short. Calls on questions
  only some models finished are left out of every accuracy figure and kept in the cost.
- Every comparison that involves the search arm uses the memory and text calls on those same
  questions, so the three arms are compared like for like.
- The effort stage did not run, so nothing is reported for it.
- An answer line must start a line of the reply. The pre-registered script's pattern also
  matched "Answer: B" inside a sentence, which the pre-registration's words ("the last
  Answer: <letter> line") do not cover. One reply differs; it is listed in summary.json.
- Differences are computed from exact counts and then rounded.
- Added: first-letter scoring, thinking and search-use counts, per-call cost, site counts,
  and the results without the questions a reviewer found open to a second reading.
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
ANSWER_LINE = re.compile(r"^[ \t>*_#-]*Answer:\s*[\*\(\[]*\s*([A-F])\b", flags=re.I | re.M)
ANSWER_ANYWHERE = re.compile(r"Answer:\s*[\*\(\[]*\s*([A-F])\b", flags=re.I)   # the pre-registered script's pattern
DRAWS, SEED = 10_000, 20261115
# Questions a review after the run found open to a second reading (see README, "Questions open to a second reading").
OPEN_QUESTIONS = {
    "eu_no_market_date": ["eu-notification-01", "eu-notification-03", "eu-notification-05", "eu-notification-07"],
    "ny_incident_no_new_york_link": ["incident-clock-05", "incident-clock-06", "incident-clock-07", "incident-clock-08"],
    "eccn_4e091_exactly_1e26": ["compute-figures-08"],
    "chip_other_bit_lengths": ["eccn-3a090-07"],
}

questions = {q["id"]: q for q in json.load(open(HERE / "questions.json"))}
qids = list(questions)
raw = [json.loads(line) for line in open(HERE / "results.jsonl") if line.strip()]

# ---------- one row per cell: a returned reply; errors and skips are counted apart ----------
cells, duplicates = {}, 0
for r in raw:
    k = (r["stage"], r["arm"], r["effort"], r["model"], r["id"], r["sample"])
    if r.get("stop_reason") and not r.get("error") and not r.get("skipped"):
        duplicates += k in cells
        cells[k] = r
planned = {(s, a, e, m, i, n) for (s, a, e), samples in PLANNED.items() for m in MODELS for i in qids for n in range(1, samples + 1)}
missing = planned - set(cells)
parser_differs = []
for k, r in cells.items():
    q = questions[r["id"]]
    options = [o[0] for o in q["options"]]
    letters = [m.group(1).upper() for m in ANSWER_LINE.finditer(r["text"] or "")]
    loose = [m.group(1).upper() for m in ANSWER_ANYWHERE.finditer(r["text"] or "")]
    r["_letters"] = letters
    r["_answer"] = letters[-1] if letters and letters[-1] in options else None
    r["_right"] = r["_answer"] == q["key"]
    r["_first_right"] = bool(letters) and letters[0] == q["key"]
    loose_right = bool(loose) and loose[-1] == q["key"]
    assert loose_right == r["correct"] and r["key"] == q["key"], k          # the runner used the loose pattern
    if loose_right != r["_right"]:
        parser_differs.append({"stage": k[0], "model": k[3], "id": k[4], "sample": k[5], "answer_lines": letters,
                               "letters_anywhere": loose, "key": q["key"], "searches": r.get("searches")})

search_count = collections.Counter(i for (s, a, e, m, i, n) in cells if s == "search")
SEARCH_IDS = {i for i in qids if search_count[i] == len(MODELS) * PLANNED[("search", "search", "medium")]}
search_partial = {i: search_count[i] for i in qids if 0 < search_count[i] < len(MODELS) * 2}
OWN = re.compile(r"github\.com/maxghenis|maxghenis\.com|vercel\.app", flags=re.I)

integrity = {
    "raw_rows": len(raw),
    "error_rows": sum(bool(r.get("error")) for r in raw),
    "error_kinds": dict(collections.Counter(re.sub(r"[^a-zA-Z ].*", "", (r["error"].split("'message': '")[-1])[:60]).strip() for r in raw if r.get("error"))),
    "skipped_rows": sum(bool(r.get("skipped")) for r in raw),
    "planned_calls": len(planned),
    "returned_calls": len(cells),
    "missing_calls": {f"{s}/{a}/{e}": sum(1 for k in missing if k[:3] == (s, a, e)) for (s, a, e) in PLANNED},
    "unplanned_calls": len(set(cells) - planned),
    "duplicate_returned_rows": duplicates,
    "refusals": sum(r["stop_reason"] == "refusal" for r in cells.values()),
    "stop_reasons": dict(collections.Counter(r["stop_reason"] for r in cells.values())),
    "served_model_differs": sum(r["served_model"] != r["model"] for r in cells.values()),
    "no_answer_line": sum(r["_answer"] is None for r in cells.values()),
    "more_than_one_letter": sum(len(set(r["_letters"])) > 1 for r in cells.values()),
    "replies_scored_differently_by_the_preregistered_pattern": parser_differs,
    "search_questions": len(SEARCH_IDS),
    "search_questions_partly_answered": search_partial,
    "search_calls_left_out_of_accuracy": sum(search_partial.values()),
    "search_tool_errors": sum(bool(r.get("tool_errors")) for r in cells.values()),
    "continued_calls": sum((r.get("continuations") or 0) > 0 for r in cells.values()),
    "search_rows_that_mention_this_repository_or_site": sum(
        bool(OWN.search(json.dumps([r.get("queries"), r.get("result_urls"), r.get("cited_urls")]))) for r in cells.values() if r["stage"] == "search"),
}
assert integrity["unplanned_calls"] == 0 and integrity["duplicate_returned_rows"] == 0, integrity

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


PAIRS = [("text", "memory"), ("search", "memory"), ("text", "search")]


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
        for a, b in PAIRS:
            if a in acc and b in acc:
                draws[f"{a}_minus_{b}"].append(acc[a] - acc[b])
    return {k: interval(v) for k, v in draws.items()}


def differences(acc):
    """Differences in percentage points, from exact counts."""
    return {f"{a}_minus_{b}": round(100 * (acc[a]["n"] / acc[a]["of"] - acc[b]["n"] / acc[b]["of"]), 1) for a, b in PAIRS if a in acc and b in acc}


BOUNDARY = {i for i in qids if questions[i]["boundary"]}


def mean(values):
    values = list(values)
    return sum(values) / len(values) if values else None


def block(models):
    out = {}
    full = {arm: accuracy(arm, models) for arm in ("memory", "text")}
    out["all_questions"] = {"accuracy": full, "difference_points": differences(full), "interval_95": bootstrap(models, ("memory", "text"), qids),
                            "boundary": {arm: accuracy(arm, models, BOUNDARY) for arm in ("memory", "text")},
                            "other": {arm: accuracy(arm, models, set(qids) - BOUNDARY) for arm in ("memory", "text")}}
    sub = {arm: accuracy(arm, models, SEARCH_IDS) for arm in ARMS}
    out["search_questions"] = {"accuracy": sub, "difference_points": differences(sub), "interval_95": bootstrap(models, ARMS, SEARCH_IDS),
                               "boundary": {arm: accuracy(arm, models, BOUNDARY & SEARCH_IDS) for arm in ARMS},
                               "other": {arm: accuracy(arm, models, SEARCH_IDS - BOUNDARY) for arm in ARMS}}
    out["samples_disagree"] = {}
    for arm in ARMS:
        answers = collections.defaultdict(list)
        for r in rows(arm, models):
            answers[(r["model"], r["id"])].append(r["_answer"])
        out["samples_disagree"][arm] = frac(sum(len(set(v)) > 1 for v in answers.values()), len(answers))
    s = rows("search", models)
    searched = [r for r in s if (r.get("searches") or 0) > 0]
    unsearched = [r for r in s if not (r.get("searches") or 0) > 0]
    out["search_use"] = {
        "calls_with_a_search": frac(len(searched), len(s)),
        "mean_searches_per_call": round(sum(r.get("searches") or 0 for r in s) / len(s), 2) if s else None,
        "accuracy_when_searched": frac(sum(r["_right"] for r in searched), len(searched)),
        "accuracy_when_not_searched": frac(sum(r["_right"] for r in unsearched), len(unsearched)),
        "wrong_replies": sum(not r["_right"] for r in s),
        "wrong_replies_without_a_search": sum(not r["_right"] for r in unsearched),
        "mean_input_tokens_when_searched": round(mean(r["in"] for r in searched)) if searched else None,
        "mean_input_tokens_when_not_searched": round(mean(r["in"] for r in unsearched)) if unsearched else None,
        "mean_cost_when_searched_usd": round(mean(r["cost"] for r in searched), 4) if searched else None,
        "mean_cost_when_not_searched_usd": round(mean(r["cost"] for r in unsearched), 4) if unsearched else None,
    }
    out["first_letter_scoring"] = {arm: accuracy(arm, models, field="_first_right") for arm in ARMS}
    out["replies_with_two_letters"] = {arm: sum(len(set(r["_letters"])) > 1 for r in rows(arm, models)) for arm in ARMS}
    out["replies_with_a_thinking_block"] = {arm: frac(sum("thinking" in (r.get("block_types") or []) for r in rows(arm, models)), len(rows(arm, models))) for arm in ARMS}
    every = [r for r in raw if r["model"] in models]
    cost = {f"{st}/{a}/{e}": sum(r.get("cost") or 0 for r in every if (r["stage"], r["arm"], r["effort"]) == (st, a, e)) for (st, a, e) in PLANNED}
    out["cost_usd"] = {k: round(v, 2) for k, v in cost.items()}
    out["cost_usd"]["total"] = round(sum(cost.values()), 2)
    out["per_call"] = {arm: {"mean_input_tokens": round(mean(r["in"] for r in rows(arm, models))), "mean_output_tokens": round(mean(r["out"] for r in rows(arm, models))),
                             "mean_cost_usd": round(mean(r["cost"] for r in rows(arm, models)), 4)} for arm in ARMS}
    return out


def without(excluded):
    """Pooled accuracy with some questions left out."""
    keep = set(qids) - set(excluded)
    full = {arm: accuracy(arm, MODELS, keep) for arm in ("memory", "text")}
    sub = {arm: accuracy(arm, MODELS, keep & SEARCH_IDS) for arm in ARMS}
    return {"questions_left_out": sorted(excluded, key=qids.index), "all_questions": full, "all_questions_difference": differences(full),
            "search_questions": sub, "search_questions_differences": differences(sub), "search_questions_kept": len(keep & SEARCH_IDS)}


def site(host):
    host = host.removeprefix("www.")
    for group in ("federalregister.gov", "nysenate.gov", "wikipedia.org"):
        if host == group or host.endswith("." + group):
            return group
    return host


def site_set(urls):
    found = set()
    for u in urls or []:
        m = re.match(r"https?://([^/]+)/?", u)
        if m:
            found.add(site(m.group(1).lower()))
    return found


families = list(dict.fromkeys(q["family"] for q in questions.values()))
ids_of = {f: {i for i in qids if questions[i]["family"] == f} for f in families}
option_counts = collections.Counter(len(q["options"]) for q in questions.values())
summary = {
    "integrity": integrity,
    "search_question_ids": sorted(SEARCH_IDS, key=qids.index),
    "questions_without_search": [i for i in qids if i not in SEARCH_IDS],
    "questions_by_number_of_options": {str(k): v for k, v in sorted(option_counts.items())},
    "mean_chance_rate_pct": round(100 * mean(1 / len(q["options"]) for q in questions.values()), 1),
    "all_models": block(MODELS),
    "by_model": {m: block([m]) for m in MODELS},
    "by_family": {f: {"questions": len(ids_of[f]), "search_questions": len(ids_of[f] & SEARCH_IDS),
                      "all_questions": {arm: accuracy(arm, MODELS, ids_of[f]) for arm in ("memory", "text")},
                      "search_questions_accuracy": {arm: accuracy(arm, MODELS, ids_of[f] & SEARCH_IDS) for arm in ARMS}} for f in families},
    "by_question": {arm: {i: accuracy(arm, MODELS, {i}) for i in (qids if arm != "search" else sorted(SEARCH_IDS, key=qids.index))} for arm in ARMS},
    "by_model_question_right": {arm: {m: {i: accuracy(arm, [m], {i})["n"] for i in (qids if arm != "search" else sorted(SEARCH_IDS, key=qids.index))} for m in MODELS} for arm in ARMS},
    "without_open_questions": {**{name: without(ids) for name, ids in OPEN_QUESTIONS.items()},
                               "all_ten": without([i for ids in OPEN_QUESTIONS.values() for i in ids])},
    "total_cost_usd": round(sum(r.get("cost") or 0 for r in raw), 2),
    "search_cost_on_search_questions_usd": round(sum(r["cost"] for r in rows("search")), 2),
    "tokens": {m: {"input": sum(r["in"] for r in cells.values() if r["model"] == m), "output": sum(r["out"] for r in cells.values() if r["model"] == m),
                   "searches": sum(r.get("searches") or 0 for r in cells.values() if r["model"] == m)} for m in MODELS},
    "calls_utc": {stage: [min(r["started_at"] for r in cells.values() if r["stage"] == stage), max(r["started_at"] for r in cells.values() if r["stage"] == stage)]
                  for stage in ("core", "search") if any(r["stage"] == stage for r in cells.values())},
}
# for each site, the number of search-arm calls whose results (or citations) include it
result_sites, cited_sites = collections.Counter(), collections.Counter()
for r in rows("search"):
    result_sites.update(site_set(r.get("result_urls")))
    cited_sites.update(site_set(r.get("cited_urls")))
summary["search_calls_with_results"] = sum(bool(r.get("result_urls")) for r in rows("search"))
summary["search_calls_with_a_citation"] = sum(bool(r.get("cited_urls")) for r in rows("search"))
summary["search_result_sites"] = dict(result_sites.most_common(25))
summary["search_cited_sites"] = dict(cited_sites.most_common(25))
summary["memory_misses_by_question"] = [{"id": i, "wrong": v["of"] - v["n"], "of": v["of"], "boundary": questions[i]["boundary"],
                                         "wrong_by_model": {m.split("-")[1]: 3 - summary["by_model_question_right"]["memory"][m][i] for m in MODELS}}
                                        for i, v in sorted(summary["by_question"]["memory"].items(), key=lambda kv: kv[1]["n"]) if v["n"] < v["of"]]
summary["search_misses"] = [{"model": r["model"], "id": r["id"], "sample": r["sample"], "answer": r["_answer"], "key": r["key"], "searches": r.get("searches")}
                            for r in rows("search") if not r["_right"]]
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
    print("  search use       " + json.dumps(b["search_use"]))
    print("  first letter     " + " | ".join(f"{arm} {show(b['first_letter_scoring'][arm])}" for arm in ARMS) + f" | two letters {b['replies_with_two_letters']}")
    print("  thinking block   " + " | ".join(f"{arm} {show(b['replies_with_a_thinking_block'][arm])}" for arm in ARMS))
    print("  cost             " + json.dumps(b["cost_usd"]) + " | per call " + json.dumps(b["per_call"]))
print("\nBY FAMILY (100 questions: memory, text; search questions: memory, search, text)")
for f in families:
    v = summary["by_family"][f]
    print(f"  {f:18s} {v['questions']:2d} q  memory {show(v['all_questions']['memory'])} | text {show(v['all_questions']['text'])}"
          f"   ||  {v['search_questions']:2d} q  " + " | ".join(f"{arm} {show(v['search_questions_accuracy'][arm])}" for arm in ARMS))
print("\nWITHOUT OPEN QUESTIONS")
for name, w in summary["without_open_questions"].items():
    print(f"  {name:30s} 100q: memory {show(w['all_questions']['memory'])} text {show(w['all_questions']['text'])} diff {w['all_questions_difference']['text_minus_memory']}"
          f" | {w['search_questions_kept']}q: " + " ".join(f"{arm} {show(w['search_questions'][arm])}" for arm in ARMS) + f" diffs {w['search_questions_differences']}")
print("\nMEMORY MISSES", json.dumps(summary["memory_misses_by_question"]))
print("\nSEARCH MISSES", json.dumps(summary["search_misses"]))
print("\nTEXT MISSES", json.dumps(summary["text_misses"]))
print("\nRESULT SITES", json.dumps(summary["search_result_sites"]))
print("CITED SITES", json.dumps(summary["search_cited_sites"]), "| calls with results", summary["search_calls_with_results"], "| with a citation", summary["search_calls_with_a_citation"])
print("OPTIONS", summary["questions_by_number_of_options"], "chance", summary["mean_chance_rate_pct"])
print("TOTAL COST", summary["total_cost_usd"], "| search cost on search questions", summary["search_cost_on_search_questions_usd"], "| CALLS UTC", summary["calls_utc"])
if "--write" in sys.argv:
    json.dump(summary, open(HERE / "summary.json", "w"), indent=1)
    print("wrote summary.json")
