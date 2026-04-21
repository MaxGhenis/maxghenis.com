import { getRepos, REPO_SECTIONS } from "@/lib/repos";
import { RepoList } from "@/components/repo-list";
import { SectionFrame } from "@/components/section-frame";

export const metadata = { title: "Models" };

export default async function ModelsPage() {
  const repos = await getRepos();
  const mine = repos.filter((r) => REPO_SECTIONS[r.name] === "models");

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 lg:px-10 py-16">
      <div className="mb-14 max-w-3xl">
        <div className="section-number">§ 01 · models</div>
        <h1 className="mt-2">Microsimulation models, applied papers, and live calculators.</h1>
        <p className="mt-6 text-[color:var(--mg-text-soft)]">
          Policy reforms scored against representative microdata. Papers
          that propagate uncertainty end-to-end from raw sources through
          published numbers. Personal calculators for tax, benefits, and
          life decisions. All open source.
        </p>
      </div>

      <SectionFrame number="§ 01.01" title="Featured">
        <div className="grid gap-8 md:grid-cols-2">
          <a
            href="/papers/whatnut"
            className="group block rounded-sm border border-[color:var(--mg-rule)] p-6 !border-b hover:border-[color:var(--mg-klein)] transition-colors"
          >
            <div className="telemetry mb-3">paper · 2026 · live</div>
            <h3 className="!mb-2 group-hover:text-[color:var(--mg-klein)]">What Nut?</h3>
            <p className="text-sm text-[color:var(--mg-text-soft)]">
              Skeptical Monte Carlo evidence synthesis of the mortality benefit from daily
              nut consumption, 8 nut types, 10k draws, full audit trail from USDA +
              CDC + retail through to ICERs.
            </p>
          </a>
          <a
            href="https://policyengine.org"
            target="_blank"
            rel="noopener"
            className="group block rounded-sm border border-[color:var(--mg-rule)] p-6 !border-b hover:border-[color:var(--mg-klein)] transition-colors"
          >
            <div className="telemetry mb-3">founder · 2021 →</div>
            <h3 className="!mb-2 group-hover:text-[color:var(--mg-klein)]">PolicyEngine ↗</h3>
            <p className="text-sm text-[color:var(--mg-text-soft)]">
              Open microsimulation for the US, UK, and Canada. Reform scoring,
              distributional impact, and a personal calculator grounded in
              representative microdata.
            </p>
          </a>
        </div>
      </SectionFrame>

      <SectionFrame
        number="§ 01.02"
        title="Repositories"
        telemetry={`${mine.length} repos`}
        className="mt-16"
      >
        <RepoList repos={mine} />
      </SectionFrame>
    </div>
  );
}
