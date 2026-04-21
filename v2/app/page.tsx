import Link from "next/link";
import { Counter } from "@/components/counter";
import { SectionFrame } from "@/components/section-frame";
import { FEATURED } from "@/content/curated";
import { SITE } from "@/lib/site";

// Live-ish counters. Real numbers where accessible; conservative
// estimates otherwise (the site is an instrument, not a sales page —
// don't inflate).
const COUNTERS = [
  { label: "Jurisdictions simulated", value: 53, delay: 100 },
  { label: "Reform scenarios run", value: 1_200_000, delay: 220 },
  { label: "Open repos published", value: 60, delay: 340 },
  { label: "Lines of Python", value: 480_000, delay: 460 },
];

function today() {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date());
}

export default function Home() {
  const groups = SITE.sections.map((s) => ({
    section: s,
    items: FEATURED.filter((f) => f.section === s.slug),
  }));

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 lg:px-10">
      {/* Telemetry strip */}
      <div className="flex items-center justify-between border-b border-[color:var(--mg-rule)] py-3">
        <span className="telemetry">
          maxghenis.com · v2 · last built {today()}
        </span>
        <span className="telemetry hidden sm:inline">
          An instrument for simulating society
        </span>
      </div>

      {/* Hero */}
      <section className="py-20 md:py-28">
        <h1 className="max-w-4xl text-[2.75rem] leading-[1.04] tracking-[-0.035em] md:text-[4.25rem] md:leading-[1.02]">
          Building democratic infrastructure for simulating society.
        </h1>

        <p className="mt-8 max-w-3xl text-[color:var(--mg-text-soft)] md:text-lg">
          I build microsimulation models and the tools around them —
          PolicyEngine, Cosilico, applied papers, and the agent-era
          infrastructure for turning statutes, surveys, and scientific
          evidence into software policy-makers and households can actually
          use. Everything here is open source.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[color:var(--mg-ink)] pt-6 md:grid-cols-4">
          {COUNTERS.map((c) => (
            <div key={c.label}>
              <div className="text-[2rem] font-semibold leading-none tracking-[-0.02em] text-[color:var(--mg-text)] md:text-[2.5rem]">
                <Counter to={c.value} delay={c.delay} />
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.08em] text-[color:var(--mg-text-muted)]">
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured sections */}
      <div className="space-y-16 pb-20">
        {groups.map((g, idx) => (
          <SectionFrame
            key={g.section.slug}
            number={`§ ${String(idx + 1).padStart(2, "0")}`}
            eyebrow={g.section.blurb}
            title={g.section.title}
            telemetry={
              <Link
                href={`/${g.section.slug}`}
                className="!border-b-0 hover:text-[color:var(--mg-klein)]"
              >
                Index →
              </Link>
            }
          >
            <ul className="divide-y divide-[color:var(--mg-rule)]">
              {g.items.map((item) => {
                const linkClass =
                  "group grid grid-cols-[1fr_auto] items-baseline gap-6 py-5 !border-b-0 hover:bg-[color:var(--mg-rule-soft)] px-2 -mx-2 rounded-sm";
                const inner = (
                  <>
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-lg font-semibold tracking-[-0.015em] text-[color:var(--mg-text)] group-hover:text-[color:var(--mg-klein)]">
                          {item.title}
                        </span>
                        {item.telemetry && (
                          <span className="telemetry hidden sm:inline">
                            {item.telemetry}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 max-w-3xl text-sm text-[color:var(--mg-text-soft)]">
                        {item.description}
                      </p>
                    </div>
                    <span className="telemetry text-[color:var(--mg-text-muted)] group-hover:text-[color:var(--mg-klein)]">
                      {item.external ? "↗" : "→"}
                    </span>
                  </>
                );
                return (
                  <li key={item.slug}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener"
                        className={linkClass}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link href={item.href} className={linkClass}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </SectionFrame>
        ))}
      </div>
    </div>
  );
}
