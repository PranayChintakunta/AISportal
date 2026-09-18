"use client";

import { useEffect, useRef } from "react";

// Fixed, site-wide ambient background: 9 large, soft-edged gradient wave
// bands, evenly spread top-to-bottom with heavy overlap so they always
// cover the full viewport while still undulating a good amount. Entirely
// self-animating (no pointer input). Mounted once in the root layout so it
// sits behind every route at full strength; pages keep text legible by
// putting it in its own solid-background container rather than by dimming
// this canvas (see events-browse-client for the pattern).

const COLORS = ["47,95,232", "242,169,104", "159,149,199", "79,123,255"]; // brand, orange, purple-dot, brand-mid
const WAVE_COUNT = 9;
const THICKNESS_FRAC = 0.32; // each band's height, as a fraction of viewport height
const BACKDROP = "rgb(250, 247, 238)"; // --color-cream
// Cream scrim painted over the canvas — turning this UP mutes the waves
// (harder to see), turning it down lets them read more strongly. Kept
// separate from each wave's own paint opacity below so the two controls
// don't fight each other.
const SCRIM_OPACITY = 0.62;

type Wave = {
  color: string;
  centerFrac: number;
  amp: number;
  freq: number;
  speed: number;
  phase: number;
  opacity: number;
};

function buildWaves(): Wave[] {
  return Array.from({ length: WAVE_COUNT }, (_, i) => ({
    color: COLORS[i % COLORS.length],
    centerFrac: (i + 0.5) / WAVE_COUNT, // evenly spread, offset so edge bands still overhang top/bottom
    amp: 42 + Math.random() * 38,
    freq: 0.0013 + Math.random() * 0.0011,
    speed: (0.00018 + Math.random() * 0.00024) * (i % 2 === 0 ? 1 : -1),
    phase: Math.random() * 1000,
    opacity: 0.4 + Math.random() * 0.15,
  }));
}

export function GradientWavesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const waves = buildWaves();

    let width = 0;
    let height = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.fillStyle = BACKDROP;
      ctx!.fillRect(0, 0, width, height);
    }
    resize();
    window.addEventListener("resize", resize);

    function drawWave(w: Wave, t: number, parallax: number) {
      const thickness = height * THICKNESS_FRAC;
      const y0 = height * w.centerFrac - thickness / 2 - parallax;
      const step = Math.max(16, Math.round(width / 90));

      ctx!.beginPath();
      for (let x = 0; x <= width; x += step) {
        const y = y0 + Math.sin(x * w.freq + t * w.speed + w.phase) * w.amp;
        if (x === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      for (let x = width; x >= 0; x -= step) {
        const y =
          y0 +
          thickness +
          Math.sin(x * w.freq * 1.15 + t * w.speed * 1.1 + w.phase + 1.7) * w.amp * 0.7;
        ctx!.lineTo(x, y);
      }
      ctx!.closePath();

      const grad = ctx!.createLinearGradient(0, y0 - w.amp, 0, y0 + thickness + w.amp);
      grad.addColorStop(0, `rgba(${w.color}, 0)`);
      grad.addColorStop(0.2, `rgba(${w.color}, ${w.opacity})`);
      grad.addColorStop(0.8, `rgba(${w.color}, ${w.opacity})`);
      grad.addColorStop(1, `rgba(${w.color}, 0)`);
      ctx!.fillStyle = grad;
      ctx!.fill();
    }

    function draw(t: number) {
      // Background is position:fixed (doesn't scroll with the page at all)
      // — nudging the bands by a small fraction of scroll position gives a
      // subtle parallax sense of depth instead of feeling totally inert
      // while the page scrolls past it.
      const parallax = window.scrollY * 0.06;
      ctx!.fillStyle = BACKDROP;
      ctx!.fillRect(0, 0, width, height);
      for (const w of waves) {
        drawWave(w, t, parallax);
      }
    }

    let raf = 0;
    let last = 0;
    let running = !reduceMotion && !document.hidden;

    function frame(t: number) {
      if (!running) return;
      if (t - last >= 32) {
        // ~30fps — plenty smooth for slow ambient drift, cheaper than 60fps.
        last = t;
        draw(t);
      }
      raf = requestAnimationFrame(frame);
    }

    if (reduceMotion) {
      draw(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    function onVisibility() {
      const shouldRun = !reduceMotion && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!shouldRun) {
        running = false;
        cancelAnimationFrame(raf);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ backgroundColor: BACKDROP, opacity: SCRIM_OPACITY }}
      />
    </>
  );
}
