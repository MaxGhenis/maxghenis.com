import Link from "next/link";
import { getAllPosts } from "@/lib/writing";
import { SectionFrame } from "@/components/section-frame";

export const metadata = { title: "Writing" };

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function WritingPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 lg:px-10 py-16">
      <div className="mb-14 max-w-3xl">
        <div className="section-number">§ 03 · writing</div>
        <h1 className="mt-2">Essays, notes, and the Society in Silico book.</h1>
        <p className="mt-6 text-[color:var(--mg-text-soft)]">
          Policy analysis, agent-era tool-building, and the long history
          of computational models of society. Quantified where possible,
          honest about uncertainty, short on hedging.
        </p>
      </div>

      <SectionFrame number="§ 03.01" title="Posts" telemetry={`${posts.length} posts`}>
        <ul className="divide-y divide-[color:var(--mg-rule)] border-y border-[color:var(--mg-rule)]">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/writing/${p.slug}`}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-6 py-5 !border-b-0 hover:bg-[color:var(--mg-rule-soft)] px-2 -mx-2 rounded-sm"
              >
                <span className="telemetry w-[7.5rem] shrink-0">
                  {formatDate(p.pubDate)}
                </span>
                <div>
                  <div className="text-base font-semibold tracking-[-0.015em] text-[color:var(--mg-text)] group-hover:text-[color:var(--mg-klein)]">
                    {p.title}
                  </div>
                  <p className="mt-1 max-w-3xl text-sm text-[color:var(--mg-text-soft)]">
                    {p.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </SectionFrame>
    </div>
  );
}
