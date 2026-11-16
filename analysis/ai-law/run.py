#!/usr/bin/env python3
"""Ask four Claude models each question from memory, with web search, and with the rule text.

Usage: run.py <questions.json> <results.jsonl> --stage core|search|effort [--cap 140] [--workers 8]
       run.py --probe <results.jsonl>          (one made-up question, search arm, each model)

Reads ANTHROPIC_API_KEY from the environment and prints no secrets. No system prompt and no
fallback model: a refusal is recorded as a refusal, so each row is the named model's own reply.
Every reply is saved in full. A rerun skips cells that already hold an answer.

Stages, run in this order, each a fixed list of calls:
  core    memory arm and text arm at effort "medium", 3 samples per question and model
  search  search arm at effort "medium", 2 samples per question and model
  effort  memory arm at efforts "low" and "high", 1 sample per question and model
Within a stage the questions run in one fixed shuffled order and every model answers a
question before the next question starts, so a stage that the cap cuts short still covers
the same questions for all four models.
"""
import argparse
import datetime
import json
import random
import re
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

import anthropic

MODELS = ["claude-haiku-5-5", "claude-sonnet-5-5", "claude-opus-5-5", "claude-fable-5-2"]
# List prices in US dollars per million tokens (input, output), platform.claude.com/docs/en/about-claude/pricing,
# read November 15, 2026. Haiku 5.5 charges a higher rate on a prompt over 100,000 tokens.
PRICES = {
    "claude-haiku-5-5": (0.10, 0.50),
    "claude-sonnet-5-5": (2.00, 10.00),
    "claude-opus-5-5": (4.00, 20.00),
    "claude-fable-5-2": (8.00, 40.00),
}
HAIKU_LONG_PROMPT = (100_000, 0.50, 2.50)
SEARCH_PRICE = 10.00 / 1000          # per web search
SEARCH_TOOL = {"type": "web_search_20250305", "name": "web_search", "max_uses": 5}
MAX_TOKENS = 16000
MAX_CONTINUATIONS = 3
STAGES = {
    "core": [("memory", "medium", 3), ("text", "medium", 3)],
    "search": [("search", "medium", 2)],
    "effort": [("memory", "low", 1), ("memory", "high", 1)],
}
# A generous guess at one call's cost, reserved against the cap while the call is in flight.
RESERVE = {"memory": 0.08, "text": 0.08, "search": 1.50}
ORDER_SEED = 20261115

FORMAT = ("Reply in this format. First line: \"Answer: <letter>\". "
          "Then one or two sentences explaining why.")
PROBE = {
    "id": "probe", "family": "probe", "boundary": False, "key": "A",
    "facts": ("Fernhollow Devices, a US company, applies for a licence to export a chip from the United States to an end user located in Macau. "
              "The chip has a 'total processing performance' (TPP) of 20,000 and a 'total DRAM bandwidth' of 6,400 GB/s. "
              "The application includes all the information and certifications that paragraph (dd) of supplement no. 2 to 15 CFR part 748 asks for, "
              "and it meets the criteria of no other licensing policy. Treat every figure as exact."),
    "question": "Under the January 15, 2026 BIS rule (91 FR 1684; 15 CFR 742.6(b)(10)(iii)(A)(1)), which licence review policy applies to this application?",
    "options": ["A. Case-by-case review.", "B. A presumption of denial.", "C. A presumption of approval."],
    "rule_text": "",
}


def prompt_for(q, arm):
    parts = []
    if arm == "text":
        parts.append("Rule text:\n" + q["rule_text"].strip())
    parts.append(q["facts"].strip())
    parts.append(q["question"].strip())
    parts.append("Options:\n" + "\n".join(o.strip() for o in q["options"]))
    parts.append(FORMAT)
    return "\n\n".join(parts)


ANSWER = re.compile(r"Answer:\s*[\*\(\[]*\s*([A-F])\b", flags=re.I)


def parse_answer(text, letters):
    """The last 'Answer: <letter>' in the reply, if it names one of the question's options."""
    found = [m.group(1).upper() for m in ANSWER.finditer(text or "")]
    return (found[-1] if found and found[-1] in letters else None), len(found)


def price(model, usage):
    pin, pout = PRICES[model]
    prompt = (usage.get("input_tokens") or 0) + (usage.get("cache_creation_input_tokens") or 0) + (usage.get("cache_read_input_tokens") or 0)
    if model == "claude-haiku-5-5" and prompt > HAIKU_LONG_PROMPT[0]:
        pin, pout = HAIKU_LONG_PROMPT[1:]
    searches = ((usage.get("server_tool_use") or {}).get("web_search_requests") or 0)
    # cache writes cost 1.25x input; cache reads are priced as input here, which overstates them
    tokens = ((usage.get("input_tokens") or 0) + 1.25 * (usage.get("cache_creation_input_tokens") or 0) + (usage.get("cache_read_input_tokens") or 0)) * pin \
        + (usage.get("output_tokens") or 0) * pout
    return tokens / 1e6 + searches * SEARCH_PRICE, prompt, searches


class Budget:
    def __init__(self, cap):
        self.cap, self.spent, self.reserved, self.lock = cap, 0.0, 0.0, threading.Lock()

    def reserve(self, amount):
        with self.lock:
            if self.spent + self.reserved + amount > self.cap:
                return False
            self.reserved += amount
            return True

    def settle(self, amount, cost):
        with self.lock:
            self.reserved -= amount
            self.spent += cost


def ask(client, model, q, arm, effort, sample, stage, budget):
    letters = [o[0] for o in q["options"]]
    row = {"stage": stage, "arm": arm, "effort": effort, "model": model, "id": q["id"], "family": q["family"], "boundary": q["boundary"],
           "sample": sample, "key": q["key"], "started_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")}
    if not budget.reserve(RESERVE[arm]):
        row["skipped"] = "cap"
        return row
    cost = 0.0
    try:
        user = {"role": "user", "content": prompt_for(q, arm)}
        kwargs = {"model": model, "max_tokens": MAX_TOKENS, "output_config": {"effort": effort}}
        if arm == "search":
            kwargs["tools"] = [SEARCH_TOOL]
        blocks, raw_content, usage_total, searches, prompt_tokens, out_tokens = [], [], [], 0, 0, 0
        resp = None
        for turn in range(MAX_CONTINUATIONS + 1):
            messages = [user] if not raw_content else [user, {"role": "assistant", "content": raw_content}]
            resp = client.messages.create(messages=messages, **kwargs)
            d = resp.to_dict()
            c, p, s = price(model, d.get("usage") or {})
            cost += c
            prompt_tokens += p
            searches += s
            out_tokens += (d.get("usage") or {}).get("output_tokens") or 0
            usage_total.append(d.get("usage"))
            blocks += d.get("content") or []
            raw_content += list(resp.content)
            if resp.stop_reason != "pause_turn":
                break
        text = "\n".join(b.get("text", "") for b in blocks if b.get("type") == "text")
        queries = [(b.get("input") or {}).get("query") for b in blocks if b.get("type") == "server_tool_use" and b.get("name") == "web_search"]
        result_urls, tool_errors = [], []
        for b in blocks:
            if b.get("type") == "web_search_tool_result":
                content = b.get("content")
                if isinstance(content, list):
                    result_urls += [r.get("url") for r in content if isinstance(r, dict) and r.get("url")]
                elif isinstance(content, dict):
                    tool_errors.append(content.get("error_code"))
        cited = []
        for b in blocks:
            for cit in (b.get("citations") or []) if b.get("type") == "text" else []:
                if cit.get("url") and cit["url"] not in cited:
                    cited.append(cit["url"])
        answer, n_lines = parse_answer(text, letters)
        row.update({"stop_reason": resp.stop_reason, "served_model": resp.model, "in": prompt_tokens, "out": out_tokens, "searches": searches,
                    "cost": round(cost, 6), "continuations": len(usage_total) - 1, "answer": answer, "answer_lines": n_lines,
                    "correct": answer == q["key"], "text": text, "queries": queries, "result_urls": result_urls, "cited_urls": cited,
                    "tool_errors": tool_errors, "block_types": [b.get("type") for b in blocks], "usage": usage_total})
    except anthropic.RateLimitError as e:
        row["error"] = "rate_limit: " + str(e)[:200]
    except anthropic.APIStatusError as e:
        row["error"] = f"status {e.status_code}: " + str(e)[:300]
    except anthropic.APIConnectionError as e:
        row["error"] = "connection: " + str(e)[:200]
    finally:
        budget.settle(RESERVE[arm], cost)
    if cost and "cost" not in row:
        row["cost"] = round(cost, 6)
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("questions", nargs="?")
    ap.add_argument("out")
    ap.add_argument("--stage", choices=list(STAGES))
    ap.add_argument("--probe", action="store_true")
    ap.add_argument("--cap", type=float, default=140.0, help="list-price ceiling in dollars across every stage in the output file")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--search-tool", default=None, help="probe only: try another web search tool type")
    a = ap.parse_args()
    client = anthropic.Anthropic(max_retries=4, timeout=600.0)
    budget = Budget(a.cap)
    done = set()
    try:
        for line in open(a.out):
            if line.strip():
                r = json.loads(line)
                budget.spent += r.get("cost") or 0
                if r.get("stop_reason") and not r.get("error") and not r.get("skipped"):
                    done.add((r["stage"], r["arm"], r["effort"], r["model"], r["id"], r["sample"]))
    except FileNotFoundError:
        pass
    print(f"already answered: {len(done)} cells; already spent ${budget.spent:.2f} at list price", flush=True)
    if a.probe:
        if a.search_tool:
            SEARCH_TOOL["type"] = a.search_tool
        jobs = [(m, PROBE, "search", "medium", f"probe-{SEARCH_TOOL['type']}") for m in MODELS]
        stage = "probe"
    else:
        questions = json.load(open(a.questions))
        order = list(questions)
        random.Random(ORDER_SEED).shuffle(order)
        stage = a.stage
        jobs = [(m, q, arm, effort, s) for q in order for arm, effort, n in STAGES[stage] for s in range(1, n + 1) for m in MODELS]
    jobs = [j for j in jobs if (stage, j[2], j[3], j[0], j[1]["id"], j[4]) not in done]
    print(f"stage {stage}: {len(jobs)} calls to make", flush=True)
    n = 0
    with open(a.out, "a") as f, ThreadPoolExecutor(max_workers=a.workers) as ex:
        pending = set()
        it = iter(jobs)

        def submit_next():
            for m, q, arm, effort, s in it:
                pending.add(ex.submit(ask, client, m, q, arm, effort, s, stage, budget))
                return True
            return False

        for _ in range(a.workers):
            submit_next()
        while pending:
            fut = next(as_completed(pending))
            pending.discard(fut)
            r = fut.result()
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
            f.flush()
            n += 1
            if n % 100 == 0:
                print(f"  {n} rows, ${budget.spent:.2f} spent", flush=True)
            if a.probe:
                print(json.dumps({k: r.get(k) for k in ("model", "sample", "stop_reason", "in", "out", "searches", "cost", "answer", "continuations", "block_types", "error")}), flush=True)
            submit_next()
    print(f"stage {stage} done: {n} rows written; total ${budget.spent:.2f} at list price", flush=True)


if __name__ == "__main__":
    main()
