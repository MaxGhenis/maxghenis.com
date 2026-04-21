import { getRepos, REPO_SECTIONS } from "@/lib/repos";
import { RepoList } from "@/components/repo-list";
import { SectionFrame } from "@/components/section-frame";

export const metadata = { title: "Data" };

export default async function DataPage() {
  const repos = await getRepos();
  const mine = repos.filter((r) => REPO_SECTIONS[r.name] === "data");

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 lg:px-10 py-16">
      <div className="mb-14 max-w-3xl">
        <div className="section-number">§ 04 · data</div>
        <h1 className="mt-2">Personal and applied open datasets.</h1>
        <p className="mt-6 text-[color:var(--mg-text-soft)]">
          Radical transparency as a first-class surface: daily AI coding
          usage aggregates, personal health data, compensation benchmarks.
          Each dataset ships with the code that produced it.
        </p>
      </div>

      <SectionFrame number="§ 04.01" title="Datasets" telemetry={`${mine.length} repos`}>
        <RepoList repos={mine} />
      </SectionFrame>
    </div>
  );
}
