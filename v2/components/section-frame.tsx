import type { ReactNode } from "react";

type SectionFrameProps = {
  number?: string;
  eyebrow?: string;
  title: string;
  telemetry?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionFrame({
  number,
  eyebrow,
  title,
  telemetry,
  children,
  className,
}: SectionFrameProps) {
  return (
    <section className={`border-t border-[color:var(--mg-ink)] pt-6 ${className ?? ""}`}>
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          {(number || eyebrow) && (
            <div className="section-number">
              {number && <span>{number}</span>}
              {number && eyebrow && <span className="mx-2 text-[color:var(--mg-text-faint)]">·</span>}
              {eyebrow}
            </div>
          )}
          <h2 className="!mb-0">{title}</h2>
        </div>
        {telemetry && <span className="telemetry">{telemetry}</span>}
      </header>
      {children}
    </section>
  );
}
