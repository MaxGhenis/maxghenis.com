import { getRepos, REPO_SECTIONS } from "@/lib/repos";
import { RepoList } from "@/components/repo-list";
import { SectionFrame } from "@/components/section-frame";

export const metadata = { title: "Tools" };

export default async function ToolsPage() {
  const repos = await getRepos();
  const mine = repos.filter((r) => REPO_SECTIONS[r.name] === "tools");

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 lg:px-10 py-16">
      <div className="mb-14 max-w-3xl">
        <div className="section-number">§ 02 · tools</div>
        <h1 className="mt-2">Infrastructure for working with agents and code.</h1>
        <p className="mt-6 text-[color:var(--mg-text-soft)]">
          CLIs, MCP servers, editor extensions, and small utilities I
          build while the work is getting done. Most are single-purpose and
          under a thousand lines.
        </p>
      </div>

      <SectionFrame number="§ 02.01" title="Repositories" telemetry={`${mine.length} repos`}>
        <RepoList repos={mine} />
      </SectionFrame>
    </div>
  );
}
