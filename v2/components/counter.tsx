"use client";

import { useEffect, useRef, useState } from "react";

type CounterProps = {
  to: number;
  duration?: number;
  format?: (n: number) => string;
  delay?: number;
};

const EASE = (t: number) => 1 - Math.pow(1 - t, 3);

export function Counter({
  to,
  duration = 1600,
  format = (n) => n.toLocaleString("en-US"),
  delay = 0,
}: CounterProps) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let raf = 0;
    const t0 = performance.now() + delay;
    const tick = (t: number) => {
      const elapsed = t - t0;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(1, elapsed / duration);
      setValue(Math.round(EASE(progress) * to));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, delay]);

  return <span className="tabular">{format(value)}</span>;
}
