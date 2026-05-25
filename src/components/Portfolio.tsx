"use client";

import { useEffect, useRef, useState } from "react";

type Project = {
  name: string;
  year: number;
  category: string;
};

const PROJECTS: Project[] = [
  { name: "Aurora", year: 2024, category: "Branding" },
  { name: "Pulse", year: 2024, category: "Identity" },
  { name: "Echo", year: 2023, category: "Campaign" },
  { name: "Forge", year: 2023, category: "Web" },
];

// Linear crossfade with centers spread evenly across the scroll range.
function projectOpacity(index: number, total: number, progress: number) {
  if (total === 1) return 1;
  const center = index / (total - 1);
  const spacing = 1 / (total - 1);
  const distance = Math.abs(progress - center);
  if (distance >= spacing) return 0;
  return 1 - distance / spacing;
}

export default function Portfolio() {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

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
      setProgress(p);
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
      // (N + 1) viewport heights so each project gets ~100vh of scroll while
      // the sticky child stays pinned.
      style={{ height: `${(PROJECTS.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-dvh w-full overflow-hidden">
        {PROJECTS.map((proj, i) => {
          const opacity = projectOpacity(i, PROJECTS.length, progress);
          if (opacity <= 0.001) return null;
          // Card breathes in slightly as it fades in, settles out as it fades out.
          const scale = 0.96 + opacity * 0.04;
          return (
            <div
              key={proj.name}
              className="absolute inset-0 flex items-center justify-center px-6 sm:px-10 md:px-16"
              style={{
                opacity,
                transform: `scale(${scale})`,
                transformOrigin: "center center",
              }}
            >
              <ProjectCard
                index={i + 1}
                total={PROJECTS.length}
                project={proj}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProjectCard({
  index,
  total,
  project,
}: {
  index: number;
  total: number;
  project: Project;
}) {
  return (
    <article
      className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white/[0.06] backdrop-blur-[40px] backdrop-saturate-200 backdrop-brightness-110 md:rounded-[2.5rem]"
      style={{
        aspectRatio: "5 / 3",
        boxShadow: [
          // Liquid Glass rim + specular treatment
          "inset 0 1.5px 0.5px 0 rgba(255, 255, 255, 0.55)",
          "inset 0 -1px 0.5px 0 rgba(255, 255, 255, 0.10)",
          "inset 0 0 0 1px rgba(255, 255, 255, 0.18)",
          "inset 0 -40px 80px -40px rgba(0, 0, 0, 0.35)",
          // Multi-layer drop shadow — close, medium, far
          "0 4px 16px rgba(0, 0, 0, 0.30)",
          "0 16px 48px rgba(0, 0, 0, 0.35)",
          "0 48px 120px rgba(0, 0, 0, 0.50)",
        ].join(", "),
      }}
    >
      {/* Top specular highlight — light catching the curve */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-1/2 rounded-t-[1.6rem] bg-gradient-to-b from-white/25 via-white/[0.04] to-transparent md:rounded-t-[2.1rem]"
      />
      {/* Bottom inset shadow — implies thickness */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-1/4 rounded-b-[1.6rem] bg-gradient-to-t from-black/25 to-transparent md:rounded-b-[2.1rem]"
      />
      {/* Sweeping shine */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem] md:rounded-[2.5rem]"
        style={{ transform: "translateZ(0)" }}
      >
        <span
          className="animate-shine absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          style={{ willChange: "transform" }}
        />
      </span>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-8 sm:p-10 md:p-14 lg:p-16">
        <header className="flex items-start justify-between">
          <span className="font-mono text-xs tracking-[0.25em] text-brand-yellow sm:text-sm">
            {String(index).padStart(2, "0")} /{" "}
            <span className="text-white/45">
              {String(total).padStart(2, "0")}
            </span>
          </span>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/55 sm:text-xs">
            {project.category}
          </span>
        </header>

        <h3 className="font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          {project.name}
        </h3>

        <footer className="flex items-end justify-between">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/55 sm:text-xs">
            {project.year}
          </span>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/45 sm:text-xs">
            Case study →
          </span>
        </footer>
      </div>
    </article>
  );
}
