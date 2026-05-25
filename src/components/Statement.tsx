"use client";

import { useEffect, useRef, useState } from "react";

const FONT_SIZE_RULE = "clamp(1.5rem, 7vw, 7rem)";

const BEATS = [
  "Bold ideas, crafted.",
  "Built to be noticed.",
  "Made to outlast trends.",
];

// "creative" rendered inline so its baseline lines up naturally with the
// surrounding "Your" / "agency". A yellow handdrawn underline with an outer
// glow sweeps in from left when the section enters the viewport.
function BrushedCreative({ drawIn }: { drawIn: boolean }) {
  return (
    <span className="relative inline-block whitespace-nowrap px-[0.05em]">
      creative
      <svg
        aria-hidden
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-[0.02em] h-[0.18em] w-full"
        style={{
          transform: drawIn ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left center",
          transition: "transform 800ms cubic-bezier(0.22, 1, 0.36, 1)",
          filter:
            "drop-shadow(0 0 6px rgba(255, 213, 0, 0.7)) drop-shadow(0 0 14px rgba(255, 213, 0, 0.45))",
        }}
      >
        <path
          d="M 2 8 Q 30 3 70 5 T 130 6 T 196 8 Q 202 11 196 15 Q 130 17 70 14 T 2 12 Q -2 10 2 8 Z"
          fill="#ffd500"
        />
      </svg>
    </span>
  );
}

// Per-beat opacity, staggered as the scroll progress moves through the
// section. Beats start revealing at 25% scroll, last finishes by ~70%.
function beatOpacity(index: number, progress: number): number {
  const start = 0.25 + index * 0.15;
  const end = start + 0.15;
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Threshold 0.5: section is 200vh tall, so 50% visible = 100vh in viewport,
    // which is exactly the moment the section's top hits the top of the
    // viewport and the sticky child engages. Matches the instant the 3D logo
    // lands at the navbar.
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Scroll progress through the section, drives manifesto-beat reveals.
  useEffect(() => {
    let rafId = 0;
    const update = () => {
      rafId = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalScroll = el.offsetHeight - window.innerHeight;
      const currentScroll = Math.max(0, -rect.top);
      const p =
        totalScroll > 0 ? Math.min(1, currentScroll / totalScroll) : 0;
      setScrollProgress(p);
    };
    const onScroll = () => {
      if (rafId === 0) rafId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full"
      style={{ height: "200vh" }}
    >
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center px-6">
        <h2
          className={`text-center font-display font-bold leading-[1.05] tracking-tight transition-all duration-1000 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span
            className="block whitespace-nowrap"
            style={{ fontSize: FONT_SIZE_RULE }}
          >
            Your <BrushedCreative drawIn={visible} /> agency.
          </span>
        </h2>

        {/* Manifesto beats — fade up one by one as scroll advances. */}
        <div className="mt-10 flex flex-col items-start gap-3 sm:mt-14 sm:gap-4">
          {BEATS.map((beat, i) => {
            const op = beatOpacity(i, scrollProgress);
            return (
              <p
                key={beat}
                className="font-display text-lg font-medium leading-snug text-white/85 sm:text-xl md:text-2xl"
                style={{
                  opacity: op,
                  transform: `translateY(${(1 - op) * 12}px)`,
                  transition:
                    "opacity 400ms ease-out, transform 400ms ease-out",
                }}
              >
                <span
                  aria-hidden
                  className="mr-3 inline-block text-brand-yellow"
                >
                  —
                </span>
                {beat}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}
