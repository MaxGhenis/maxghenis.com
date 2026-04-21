import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[color:var(--mg-rule)] bg-[color:var(--mg-surface)]">
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-12 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-lg font-semibold tracking-tight">Max Ghenis</div>
            <p className="mt-2 max-w-sm text-sm text-[color:var(--mg-text-muted)]">
              {SITE.tagline}
            </p>
          </div>

          <div>
            <h4 className="section-number mb-3">Sections</h4>
            <ul className="space-y-1.5 text-sm">
              {SITE.sections.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/${s.slug}`}
                    className="text-[color:var(--mg-text-soft)] !border-b-0 hover:text-[color:var(--mg-klein)]"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="section-number mb-3">Elsewhere</h4>
            <ul className="space-y-1.5 text-sm">
              <li>
                <a href={SITE.social.github} target="_blank" rel="noopener" className="text-[color:var(--mg-text-soft)] !border-b-0 hover:text-[color:var(--mg-klein)]">GitHub</a>
              </li>
              <li>
                <a href={SITE.social.twitter} target="_blank" rel="noopener" className="text-[color:var(--mg-text-soft)] !border-b-0 hover:text-[color:var(--mg-klein)]">X</a>
              </li>
              <li>
                <a href={SITE.social.linkedin} target="_blank" rel="noopener" className="text-[color:var(--mg-text-soft)] !border-b-0 hover:text-[color:var(--mg-klein)]">LinkedIn</a>
              </li>
              <li>
                <a href={SITE.social.bluesky} target="_blank" rel="noopener" className="text-[color:var(--mg-text-soft)] !border-b-0 hover:text-[color:var(--mg-klein)]">Bluesky</a>
              </li>
              <li>
                <a href={`mailto:${SITE.social.email}`} className="text-[color:var(--mg-text-soft)] !border-b-0 hover:text-[color:var(--mg-klein)]">Email</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-[color:var(--mg-rule)] pt-4 text-xs">
          <span className="telemetry">
            © {new Date().getFullYear()} · Max Ghenis · Open source
          </span>
          <a
            href="https://github.com/MaxGhenis/maxghenis.com"
            target="_blank"
            rel="noopener"
            className="telemetry !border-b-0 hover:text-[color:var(--mg-text)]"
          >
            View source
          </a>
        </div>
      </div>
    </footer>
  );
}
