import type { Repo } from "@/lib/repos";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function RepoList({ repos }: { repos: Repo[] }) {
  return (
    <ul className="divide-y divide-[color:var(--mg-rule)] border-y border-[color:var(--mg-rule)]">
      {repos.map((r) => (
        <li key={r.name}>
          <a
            href={r.url}
            target="_blank"
            rel="noopener"
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-6 py-4 px-2 -mx-2 !border-b-0 hover:bg-[color:var(--mg-rule-soft)] rounded-sm"
          >
            <div className="min-w-0">
              <div className="flex items-baseline gap-3">
                <span className="truncate text-base font-semibold tracking-[-0.015em] text-[color:var(--mg-text)] group-hover:text-[color:var(--mg-klein)]">
                  {r.name}
                </span>
                {r.language && (
                  <span className="telemetry shrink-0 !text-[10px]">
                    {r.language}
                  </span>
                )}
              </div>
              {r.description && (
                <p className="mt-1 max-w-3xl truncate text-sm text-[color:var(--mg-text-soft)]">
                  {r.description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-baseline gap-4 tabular">
              {r.stars > 0 && (
                <span className="telemetry">{r.stars}★</span>
              )}
              <span className="telemetry">{formatDate(r.pushedAt)}</span>
              <span className="telemetry text-[color:var(--mg-text-muted)] group-hover:text-[color:var(--mg-klein)]">
                ↗
              </span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
