"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  /** e.g. "36", "92%", "$1,240" — the leading number animates, everything
   * else (symbols, commas, suffixes) renders as static text around it. */
  value: string;
  className?: string;
};

const NUMBER_PATTERN = /-?[\d,]*\.?\d+/;

// Animates a stat's leading number counting up from 0 the first time it
// scrolls into view, then leaves the rest of the string (%, $, commas)
// untouched around it.
export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  const match = value.match(NUMBER_PATTERN);
  const target = match ? Number(match[0].replace(/,/g, "")) : null;
  const prefix = match ? value.slice(0, match.index) : "";
  const suffix = match ? value.slice((match.index ?? 0) + match[0].length) : "";
  const decimals = match && match[0].includes(".") ? match[0].split(".")[1].length : 0;
  const hasCommas = match ? match[0].includes(",") : false;

  useEffect(() => {
    if (target === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const format = (n: number) => {
      const fixed = n.toFixed(decimals);
      return hasCommas ? Number(fixed).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) : fixed;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    setDisplay(`${prefix}${format(0)}${suffix}`);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const duration = 900;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setDisplay(`${prefix}${format(target * eased)}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
