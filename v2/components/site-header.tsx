import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[color:var(--mg-rule)] bg-[color:var(--mg-surface)]/92 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="whitespace-nowrap text-[0.95rem] font-semibold tracking-tight text-[color:var(--mg-text)] !border-b-0"
        >
          Max Ghenis
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {SITE.sections.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="rounded-sm px-3 py-1.5 text-sm font-medium text-[color:var(--mg-text-soft)] !border-b-0 hover:text-[color:var(--mg-text)] hover:bg-[color:var(--mg-rule-soft)] transition-colors"
            >
              {s.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <a
            href={SITE.social.github}
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
            className="flex h-8 w-8 items-center justify-center rounded-sm text-[color:var(--mg-text-muted)] !border-b-0 hover:text-[color:var(--mg-text)] hover:bg-[color:var(--mg-rule-soft)]"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <a
            href={SITE.social.twitter}
            target="_blank"
            rel="noopener"
            aria-label="X (Twitter)"
            className="flex h-8 w-8 items-center justify-center rounded-sm text-[color:var(--mg-text-muted)] !border-b-0 hover:text-[color:var(--mg-text)] hover:bg-[color:var(--mg-rule-soft)]"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={SITE.social.bluesky}
            target="_blank"
            rel="noopener"
            aria-label="Bluesky"
            className="flex h-8 w-8 items-center justify-center rounded-sm text-[color:var(--mg-text-muted)] !border-b-0 hover:text-[color:var(--mg-text)] hover:bg-[color:var(--mg-rule-soft)]"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
