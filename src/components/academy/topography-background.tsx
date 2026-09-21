"use client";

import { useEffect, useRef } from "react";

// Faint, slowly-drifting contour-line texture (à la reactbits' Topography),
// dialed way down: thin single-color strokes at low opacity so it reads as
// paper texture behind the content, not a decoration competing with it.
// Scoped to the academy page rather than the site-wide gradient background.

const LINE_COUNT = 14;
const LINE_COLOR = "255, 255, 255"; // white lines read as a faint texture against the dark academy background
const STROKE_OPACITY = 0.06;

type Contour = {
  centerFrac: number;
  amp: number;
  freq: number;
  speed: number;
  phase: number;
};

function buildContours(): Contour[] {
  return Array.from({ length: LINE_COUNT }, (_, i) => ({
    centerFrac: i / (LINE_COUNT - 1),
    amp: 18 + Math.random() * 22,
    freq: 0.0022 + Math.random() * 0.0018,
    speed: (0.00006 + Math.random() * 0.00008) * (i % 2 === 0 ? 1 : -1),
    phase: Math.random() * 1000,
  }));
}

export function TopographyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const contours = buildContours();

    let width = 0;
    let height = 0;

    function resize() {
      width = canvas!.parentElement?.clientWidth ?? window.innerWidth;
      height = canvas!.parentElement?.clientHeight ?? window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function drawLine(c: Contour, t: number) {
      const y0 = height * c.centerFrac;
      const step = Math.max(16, Math.round(width / 120));

      ctx!.beginPath();
      for (let x = 0; x <= width; x += step) {
        const y = y0 + Math.sin(x * c.freq + t * c.speed + c.phase) * c.amp;
        if (x === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.strokeStyle = `rgba(${LINE_COLOR}, ${STROKE_OPACITY})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, width, height);
      for (const c of contours) drawLine(c, t);
    }

    let raf = 0;
    let last = 0;
    let running = !reduceMotion && !document.hidden;

    function frame(t: number) {
      if (!running) return;
      if (t - last >= 40) {
        // ~25fps — this is background texture, not something that needs to
        // be smooth up close.
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
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
    />
  );
}
