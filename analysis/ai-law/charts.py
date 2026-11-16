#!/usr/bin/env python3
"""Draw the post's charts from summary.json (run analyze.py --write first).

Usage: charts.py [out_dir]     (default: ../../public/images)

Each chart is a dot plot of accuracy: one row per group, one marker per arm (memory,
search, rule text), told apart by colour and shape, with the three percentages printed
on the row. Every plotted value comes from summary.json. Each chart is written twice:
a wide layout and a narrow one for phones.
"""
import json
import math
import sys
from pathlib import Path

HERE = Path(__file__).parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parent.parent / "public" / "images"
S = json.load(open(HERE / "summary.json"))

SURFACE, INK, INK2, GRID = "#fcfcfb", "#0b0b0b", "#52514e", "#e1e0d9"
ARMS = [("memory", "From memory", "#2a78d6"), ("search", "With web search", "#eb6834"), ("text", "With the rule text", "#1baf7a")]
FONT = "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
NAMES = {"claude-haiku-5-5": "Haiku 5.5", "claude-sonnet-5-5": "Sonnet 5.5", "claude-opus-5-5": "Opus 5.5", "claude-fable-5-2": "Fable 5.2"}
FAMILIES = {
    "frontier-model": "Frontier model (California, New York)",
    "large-developer": "Large frontier developer (California, New York)",
    "incident-clock": "Incident reporting deadline (California, New York)",
    "compute-figures": "Four compute tests (California, New York, EU, ECCN 4E091)",
    "eccn-3a090": "Chip export paragraphs (ECCN 3A090)",
    "licence-review": "Chip license review (January 2026 rule)",
    "chip-tariff": "Chip tariff (Section 232)",
    "eu-notification": "EU notification (AI Act art. 52)",
    "catastrophic-size": "Catastrophic-risk size figures (California)",
}


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def pct(v):
    return f"{v['pct']:.1f}" if v["of"] else "–"


class Chart:
    def __init__(self, width, narrow, lo):
        self.w, self.narrow, self.lo, self.parts, self.y = width, narrow, lo, [], 0
        self.x0 = 20 if narrow else 336
        self.x1 = width - 22 if narrow else width - 178

    def x(self, p):
        return self.x0 + (p - self.lo) / (100 - self.lo) * (self.x1 - self.x0)

    def text(self, x, y, s, size=13, fill=INK, anchor="start", weight=None):
        w = f' font-weight="{weight}"' if weight else ""
        self.parts.append(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}"{w}>{esc(s)}</text>')

    def marker(self, arm, cx, cy):
        colour = next(c for a, _, c in ARMS if a == arm)
        ring = f'fill="{colour}" stroke="{SURFACE}" stroke-width="2"'
        if arm == "memory":
            self.parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="5.5" {ring}/>')
        elif arm == "search":
            self.parts.append(f'<path d="M{cx:.1f} {cy - 7.5:.1f} L{cx + 7.5:.1f} {cy:.1f} L{cx:.1f} {cy + 7.5:.1f} L{cx - 7.5:.1f} {cy:.1f} Z" {ring}/>')
        else:
            self.parts.append(f'<rect x="{cx - 5.5:.1f}" y="{cy - 5.5:.1f}" width="11" height="11" rx="1.5" {ring}/>')

    def header(self, title_lines, subtitle_lines):
        y = 26
        for line in title_lines:
            self.text(16, y, line, size=16, weight=600)
            y += 21
        for line in subtitle_lines:
            self.text(16, y - 1, line, size=13, fill=INK2)
            y += 18
        if self.narrow:
            self.text(16, y - 1, "Figures on each row: % memory · search · text", size=12, fill=INK2)
            y += 18
        y += 8
        x = 24
        for arm, label, _ in ARMS:
            if self.narrow and x > 24 and x + 30 + 6.7 * len(label) > self.w:
                x, y = 24, y + 24
            self.marker(arm, x, y - 4)
            self.text(x + 13, y, label)
            x += 13 + 6.7 * len(label) + 30
        self.y = y + 22

    def panel(self, heading, rows):
        """rows: list of (label, {arm: {"n", "of", "pct"}})."""
        y = self.y
        if heading:
            self.text(16, y + 14, heading, size=13, weight=600)
            y += 26
        if not self.narrow:
            self.text(self.x1 + 24, y + 4, "% memory · search · text", size=12, fill=INK2)
        y += 14
        row_h = 52 if self.narrow else 34
        top, bottom = y, y + row_h * len(rows)
        ticks = [t for t in range(int(self.lo), 101, 5)]
        for t in ticks:
            self.parts.append(f'<line x1="{self.x(t):.1f}" x2="{self.x(t):.1f}" y1="{top}" y2="{bottom}" stroke="{GRID}"/>')
            self.text(self.x(t), bottom + 16, f"{t}%", size=12, fill=INK2, anchor="middle")
        for k, (label, v) in enumerate(rows):
            values = " · ".join(pct(v[a]) for a, _, _ in ARMS)
            if self.narrow:
                self.text(16, top + row_h * k + 18, label)
                self.text(self.w - 16, top + row_h * k + 18, values, fill=INK2, anchor="end", size=12)
                cy = top + row_h * k + 36
            else:
                cy = top + row_h * k + row_h / 2
                self.text(self.x0 - 16, cy + 4.5, label, anchor="end")
                self.text(self.x1 + 24, cy + 4.5, values, fill=INK2)
            have = [(a, v[a]["pct"]) for a, _, _ in ARMS if v[a]["of"]]
            tip = "; ".join(f"{name.lower()}: {v[a]['n']} of {v[a]['of']} ({v[a]['pct']}%)" for a, name, _ in ARMS if v[a]["of"])
            self.parts.append(f"<g><title>{esc(label)}: {esc(tip)}</title>")
            if have:
                self.parts.append(f'<line x1="{self.x(min(p for _, p in have)):.1f}" x2="{self.x(max(p for _, p in have)):.1f}" y1="{cy:.1f}" y2="{cy:.1f}" stroke="{INK2}" stroke-width="1.5"/>')
            for a, p in have:
                self.marker(a, self.x(p), cy)
            self.parts.append("</g>")
        self.y = bottom + 38

    def save(self, name, label):
        h = int(self.y - 8)
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {h}" width="{self.w}" height="{h}" font-family="{FONT}" role="img" aria-label="{esc(label)}">\n'
               f'<rect width="100%" height="100%" fill="{SURFACE}"/>\n' + "\n".join(self.parts) + "\n</svg>\n")
        OUT.mkdir(parents=True, exist_ok=True)
        (OUT / name).write_text(svg)
        print("wrote", OUT / name, f"{self.w}x{h}")
        return h


def floor_for(groups):
    low = min(v[a]["pct"] for _, rows in groups for _, v in rows for a, _, _ in ARMS if v[a]["of"])
    return max(0, 5 * math.floor((low - 1) / 5))


def narrow_label(s, narrow):
    return s.replace(" questions)", ")").replace("Figure exactly on a threshold", "Figure on a threshold").replace("Every other question", "Other questions") if narrow else s


def draw(name, label, title, subtitle, groups):
    lo = floor_for(groups)
    sizes = {}
    for narrow, width, suffix in [(False, 760, ""), (True, 400, "-mobile")]:
        c = Chart(width, narrow, lo)
        c.header(title[1] if narrow else title[0], subtitle[1] if narrow else subtitle[0])
        for heading, rows in groups:
            c.panel(heading, [(narrow_label(lab, narrow), v) for lab, v in rows])
        sizes[suffix] = (width, c.save(f"{name}{suffix}.svg", label))
    return sizes


A = S["all_models"]["search_questions"]
Q = {q["id"]: q for q in json.load(open(HERE / "questions.json"))}
SEARCH = S["search_question_ids"]
n_boundary = sum(Q[i]["boundary"] for i in SEARCH)
models = list(NAMES)
sizes = {}
sizes["accuracy"] = draw(
    "ai-law-accuracy",
    f"Share of right answers for four Claude models from memory, with web search and with the rule text, on the {len(SEARCH)} questions all three versions ran on, "
    "and for questions with a figure exactly on a threshold against the rest",
    (["Replies that match the answer key"], ["Replies that match", "the answer key"]),
    ([f"Share of replies, on the {len(SEARCH)} questions that all three versions ran on"],
     ["Share of replies, on the", f"{len(SEARCH)} questions all three versions ran on"]),
    [("By model", [(NAMES[m], S["by_model"][m]["search_questions"]["accuracy"]) for m in models] + [("All four models", A["accuracy"])]),
     ("By kind of question, all four models", [(f"Figure exactly on a threshold ({n_boundary} questions)", A["boundary"]),
                                               (f"Every other question ({len(SEARCH) - n_boundary} questions)", A["other"])])],
)
order = sorted(FAMILIES, key=lambda f: (S["by_family"][f]["search_questions_accuracy"]["memory"]["pct"], f))
sizes["families"] = draw(
    "ai-law-families",
    f"Share of right answers by rule, four Claude models pooled, from memory, with web search and with the rule text, on the {len(SEARCH)} questions all three versions ran on",
    (["Replies that match the answer key, by rule"], ["Replies that match", "the answer key, by rule"]),
    ([f"Share of replies, four models pooled, on the {len(SEARCH)} questions that all three versions ran on"],
     ["Four models pooled, on the", f"{len(SEARCH)} questions all three versions ran on"]),
    [(None, [(f"{FAMILIES[f].split(' (')[0]} ({S['by_family'][f]['search_questions']} questions)", S["by_family"][f]["search_questions_accuracy"]) for f in order])],
)
json.dump(sizes, open(HERE / "chart_sizes.json", "w"))
