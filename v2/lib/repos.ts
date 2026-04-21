// Public GitHub repo metadata. Fetched at build time via the Next fetch
// cache (static-by-default). Fallback to a small baked list if the API
// is down or rate-limited so the site still builds offline.

export type Repo = {
  name: string;
  description: string;
  stars: number;
  language: string | null;
  url: string;
  pushedAt: string;
  archived: boolean;
  fork: boolean;
};

const FALLBACK: Repo[] = [
  { name: "openmessage", description: "Local-first Google Messages + WhatsApp inbox for Mac, web, and MCP.", stars: 13, language: "Go", url: "https://github.com/MaxGhenis/openmessage", pushedAt: "2026-04-01", archived: false, fork: false },
  { name: "rambar", description: "Real-time RAM monitoring dashboard for macOS with per-app breakdown.", stars: 5, language: "Swift", url: "https://github.com/MaxGhenis/rambar", pushedAt: "2026-04-01", archived: false, fork: false },
  { name: "scrollywood", description: "One-click smooth scroll video recording Chrome extension.", stars: 3, language: "JavaScript", url: "https://github.com/MaxGhenis/scrollywood", pushedAt: "2026-04-01", archived: false, fork: false },
  { name: "whatnut", description: "Skeptical evidence-synthesis model of mortality benefit from nut consumption.", stars: 0, language: "Python", url: "https://github.com/MaxGhenis/whatnut", pushedAt: "2026-04-21", archived: false, fork: false },
];

export async function getRepos(): Promise<Repo[]> {
  try {
    const res = await fetch(
      "https://api.github.com/users/MaxGhenis/repos?per_page=100&sort=updated",
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as Array<{
      name: string;
      description: string | null;
      stargazers_count: number;
      language: string | null;
      html_url: string;
      pushed_at: string;
      archived: boolean;
      fork: boolean;
    }>;
    return data
      .filter((r) => !r.fork && !r.archived)
      .map((r) => ({
        name: r.name,
        description: r.description ?? "",
        stars: r.stargazers_count,
        language: r.language,
        url: r.html_url,
        pushedAt: r.pushed_at,
        archived: r.archived,
        fork: r.fork,
      }));
  } catch {
    return FALLBACK;
  }
}

// Curated mapping of which repo goes in which section. Not every repo
// is listed — the rest land in "Other" at the bottom of the Tools page.
export const REPO_SECTIONS: Record<string, "models" | "tools" | "data" | null> = {
  // Models
  "whatnut": "models",
  "policyengine-us": "models",
  "policyengine-uk": "models",
  "policyengine-canada": "models",
  "policyengine-core": "models",
  "policyengine-us-data": "models",
  "policyengine-taxsim": "models",
  "llm-eti": "models",
  "llm-econ-beliefs": "models",
  "eggnest": "models",
  "eggnest-employer": "models",
  "comp-model": "models",
  "marriage": "models",
  "marginal-child": "models",
  "optiqal-ai": "models",
  "tax-withholding-estimator": "models",
  "givewell-cea": "models",
  "mita": "models",
  "ai-economics-lecture": "models",
  "salarize": "models",
  "farness": "models",
  "Tax-Data": "models",
  "Tax-Simulator": "models",
  // Tools
  "terminalgrid": "tools",
  "tmux-claude-code": "tools",
  "claude-plugins": "tools",
  "logpile": "tools",
  ".claude": "tools",
  "plugin-crosswalk": "tools",
  "ccusage": "tools",
  "straude": "tools",
  "mystquarto": "tools",
  "manifold-cli": "tools",
  "opencollective-py": "tools",
  "google-ads-mcp-rw": "tools",
  "8sleep-mcp": "tools",
  "slack-mcp-server": "tools",
  "openmessage": "tools",
  "rambar": "tools",
  "scrollywood": "tools",
  "domigrate": "tools",
  "rtb-api": "tools",
  // Data
  "usage-data": "data",
  "health-data": "data",
};
