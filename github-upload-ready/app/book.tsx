"use client";
import { useEffect, useRef } from "react";

const WORDS = ["Ingredients", "Recipe", "Story", "Emotion"];

// Floating 3D cookbook for the magazine cover, with the four things every recipe carries orbiting it
export default function Book() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Ease the tilt toward the pointer from its current value, and stop the loop once it settles
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const step = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      stage.style.setProperty("--tilt-x", `${cy.toFixed(2)}deg`);
      stage.style.setProperty("--tilt-y", `${cx.toFixed(2)}deg`);
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.01 ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const px = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width));
      const py = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height));
      tx = px * 14;
      ty = -py * 10;
      if (!raf) raf = requestAnimationFrame(step);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} className="bookStage" aria-hidden="true">
      <div className="bookGlow" />
      <div className="bookShadow" />
      <div className="bookScene">
        <div className="bookFloat">
          <div className="book">
            <div className="book__face book__front">
              <span className="book__issue">Issue No. 01</span>
              <span className="book__title">
                The Living <em>Table</em>
              </span>
              <span className="book__thali" />
              <span className="book__sub">Indian Culinary Archive</span>
            </div>
            <div className="book__face book__back" />
            <div className="book__face book__spine">
              <span>The Living Table</span>
            </div>
            <div className="book__face book__pages book__pages--side" />
            <div className="book__face book__pages book__pages--top" />
            <div className="book__face book__pages book__pages--bottom" />
          </div>
        </div>
        <div className="orbit">
          {WORDS.map((w, i) => (
            <span key={w} className={`orbitWord orbitWord--${i + 1}`} style={{ "--i": i } as React.CSSProperties}>
              <span className="orbitWord__pill">{w}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
