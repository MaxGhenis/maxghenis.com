// Curated featured items per section. Lists on each section page are
// generated from GitHub at build time; this file controls what surfaces
// on the home page and the ordering/categorization of repos.

export type FeaturedItem = {
  section: "models" | "tools" | "writing" | "data";
  slug: string;
  title: string;
  description: string;
  telemetry?: string;
  href: string;
  external?: boolean;
};

export const FEATURED: FeaturedItem[] = [
  {
    section: "models",
    slug: "whatnut",
    title: "What Nut?",
    description:
      "Skeptical Monte Carlo evidence synthesis of mortality benefit from daily nut consumption, 8 nut types, 10k draws.",
    telemetry: "paper · live · 2026",
    href: "/papers/whatnut",
  },
  {
    section: "models",
    slug: "policyengine",
    title: "PolicyEngine",
    description:
      "Open microsimulation for US, UK, Canada. Reform scoring, distributional impact, personal calculator.",
    telemetry: "founder · 2021 →",
    href: "https://policyengine.org",
    external: true,
  },
  {
    section: "tools",
    slug: "straude",
    title: "Straude",
    description:
      "Strava for AI coding. Track tokens, spend, and streaks across Claude Code and Codex. Global leaderboard.",
    telemetry: "cli · typescript",
    href: "https://github.com/MaxGhenis/straude",
    external: true,
  },
  {
    section: "tools",
    slug: "terminalgrid",
    title: "Terminal Grid",
    description:
      "VS Code extension for keyboard-driven terminal grid management with auto-launch for AI coding tools.",
    telemetry: "extension · typescript",
    href: "https://github.com/MaxGhenis/terminalgrid",
    external: true,
  },
  {
    section: "writing",
    slug: "society-in-silico",
    title: "Society in Silico",
    description:
      "A book on the history of microsimulation — from Orcutt's 1957 vision to democratic policy infrastructure in the agent era.",
    telemetry: "book · in progress",
    href: "/writing/society-in-silico",
  },
  {
    section: "data",
    slug: "usage",
    title: "Agent usage",
    description:
      "Daily Claude Code + Codex usage aggregates. Live dashboard of tokens, sessions, spend.",
    telemetry: "daily · updated nightly",
    href: "/data/usage",
  },
];
