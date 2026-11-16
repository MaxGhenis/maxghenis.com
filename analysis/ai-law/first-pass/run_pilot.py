#!/usr/bin/env python3
"""Pilot: ask Claude models AI-law questions three ways, without and with the rule text.

Usage: run_pilot.py <items.json> <out.jsonl> [--cap 20] [--models a,b,c] [--probe]
Reads ANTHROPIC_API_KEY from the environment. Prints no secrets.
No fallbacks: a refusal is recorded as a refusal, so each row is the named model's own answer.
"""
import argparse, json, re, sys, threading, time
from concurrent.futures import ThreadPoolExecutor, as_completed

import anthropic

# List prices per million tokens, from the Anthropic price table cached 2026-11-03 (claude-api skill).
PRICES = {
    "claude-haiku-5-5": (0.10, 0.50),
    "claude-sonnet-5-5": (2.00, 10.00),
    "claude-opus-5-5": (4.00, 20.00),
    "claude-fable-5-2": (8.00, 40.00),
}
EFFORT = "medium"  # same for every model, so tiers are compared at one setting
MAX_TOKENS = 4000
FRAMINGS = ("neutral", "hopes", "suspects")
CONDITIONS = ("no_text", "with_text")

FORMAT = ("Reply in this format. First line: \"Answer: <letter>\". "
          "Then one or two sentences explaining why.")


def prompt_for(item, framing, condition):
    parts = []
    if condition == "with_text":
        parts.append("Rule text:\n" + item["rule_text"].strip())
    parts.append(item["facts"].strip())
    parts.append(item["ask_" + framing].strip())
    parts.append("Options:\n" + "\n".join(o.strip() for o in item["options"]))
    parts.append(FORMAT)
    return "\n\n".join(parts)


def parse_letter(text):
    m = re.search(r"Answer:\s*[\*\(\[]*\s*([A-F])\b", text or "", flags=re.I)
    if m:
        return m.group(1).upper()
    m = re.match(r"\s*[\*\(\[]*([A-F])[\.\)\]:\*\s]", (text or "") + " ")
    return m.group(1).upper() if m else None


class Budget:
    def __init__(self, cap):
        self.cap, self.spent, self.lock = cap, 0.0, threading.Lock()

    def room(self):
        with self.lock:
            return self.spent < self.cap * 0.95

    def add(self, x):
        with self.lock:
            self.spent += x


def ask(client, model, item, framing, condition, budget):
    row = {"model": model, "id": item["id"], "family": item.get("family"), "false_premise": bool(item.get("false_premise")),
           "framing": framing, "condition": condition, "key": item["key"], "last_option": chr(ord("A") + len(item["options"]) - 1)}
    if not budget.room():
        row["skipped"] = "cap"
        return row
    try:
        resp = client.messages.create(
            model=model,
            max_tokens=MAX_TOKENS,
            output_config={"effort": EFFORT},
            messages=[{"role": "user", "content": prompt_for(item, framing, condition)}],
        )
    except anthropic.RateLimitError as e:
        row["error"] = "rate_limit: " + str(e)[:160]
        return row
    except anthropic.APIStatusError as e:
        row["error"] = f"status {e.status_code}: " + str(e)[:200]
        return row
    except anthropic.APIConnectionError as e:
        row["error"] = "connection: " + str(e)[:160]
        return row
    text = "".join(b.text for b in resp.content if b.type == "text")
    pin, pout = PRICES[model]
    cost = (resp.usage.input_tokens * pin + resp.usage.output_tokens * pout) / 1e6
    budget.add(cost)
    letter = parse_letter(text)
    row.update({"stop_reason": resp.stop_reason, "served_model": resp.model, "in": resp.usage.input_tokens, "out": resp.usage.output_tokens,
                "cost": round(cost, 6), "answer": letter, "correct": letter == item["key"], "text": text[:700]})
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("items")
    ap.add_argument("out")
    ap.add_argument("--cap", type=float, default=20.0)
    ap.add_argument("--models", default="claude-haiku-5-5,claude-sonnet-5-5,claude-opus-5-5,claude-fable-5-2")
    ap.add_argument("--probe", action="store_true", help="one call on the first model, to check the request shape")
    ap.add_argument("--workers", type=int, default=6)
    a = ap.parse_args()
    items = json.load(open(a.items))
    models = [m for m in a.models.split(",") if m]
    for m in models:
        assert m in PRICES, m
    client = anthropic.Anthropic(max_retries=3, timeout=180.0)
    budget = Budget(a.cap)
    if a.probe:
        r = ask(client, models[0], items[0], "neutral", "with_text", budget)
        print(json.dumps({k: r.get(k) for k in ("model", "served_model", "stop_reason", "in", "out", "cost", "answer", "correct", "error")}))
        print("text:", (r.get("text") or "")[:240].replace("\n", " / "))
        return
    # resume: cells already answered in the output file are not asked again, and their cost counts toward the cap
    done_cells = set()
    try:
        for line in open(a.out):
            if line.strip():
                r = json.loads(line)
                if r.get("stop_reason") and not r.get("error") and not r.get("skipped"):
                    done_cells.add((r["model"], r["id"], r["condition"], r["framing"]))
                    budget.add(r.get("cost") or 0)
    except FileNotFoundError:
        pass
    if done_cells:
        print(f"resuming: {len(done_cells)} cells already answered, ${budget.spent:.2f} already spent", flush=True)
    t0 = time.time()
    with open(a.out, "a") as f:
        for m in models:
            jobs = [(it, fr, co) for it in items for co in CONDITIONS for fr in FRAMINGS
                    if (m, it["id"], co, fr) not in done_cells]
            done = 0
            with ThreadPoolExecutor(max_workers=a.workers) as ex:
                futs = [ex.submit(ask, client, m, it, fr, co, budget) for it, fr, co in jobs]
                for fut in as_completed(futs):
                    r = fut.result()
                    f.write(json.dumps(r) + "\n")
                    f.flush()
                    done += 1
            print(f"{m}: {done} rows, spent so far ${budget.spent:.2f} (list price), {time.time() - t0:.0f}s", flush=True)
            if not budget.room():
                print("cap reached; later models skipped or cut short", flush=True)
    print(f"DONE total ${budget.spent:.2f} at list price", flush=True)


if __name__ == "__main__":
    main()
