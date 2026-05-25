"use client";

import { useHeroScroll } from "@/hooks/useHeroScroll";

export default function ScrollChip() {
  const { progress } = useHeroScroll();
  const opacity = Math.max(0, 1 - progress * 4);

  const handleClick = () => {
    window.scrollTo({ top: window.innerHeight * 1.4, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Scroll to start"
      className="group absolute left-1/2 z-20 -translate-x-1/2"
      style={{
        bottom: "max(2.5rem, calc(env(safe-area-inset-bottom) + 1.5rem))",
        opacity,
        pointerEvents: opacity < 0.05 ? "none" : "auto",
      }}
    >
      <span
        className="
          relative flex items-center justify-center
          rounded-full px-8 py-4
          bg-white/[0.08]
          backdrop-blur-[40px] backdrop-saturate-200 backdrop-brightness-110
          transition-colors duration-300
          group-hover:bg-white/[0.12]
        "
        style={{
          boxShadow: [
            // Bright top rim — light catching the curved top edge of the glass
            "inset 0 1.5px 0.5px 0 rgba(255, 255, 255, 0.55)",
            // Subtle bottom rim — slight light reflection on the underside
            "inset 0 -1px 0.5px 0 rgba(255, 255, 255, 0.10)",
            // Uniform thin ring — sharp, defined edge of the lens
            "inset 0 0 0 1px rgba(255, 255, 255, 0.22)",
            // Triple-layered drop shadow for depth — close, mid, far
            "0 2px 6px rgba(0, 0, 0, 0.20)",
            "0 6px 20px rgba(0, 0, 0, 0.25)",
            "0 18px 50px rgba(0, 0, 0, 0.40)",
          ].join(", "),
        }}
      >
        {/* Top arc highlight — strong specular, mimics light hitting the curve */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/35 via-white/[0.08] to-transparent"
        />

        {/* Bottom inner shadow — adds thickness/depth to the glass */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 bottom-px h-1/3 rounded-b-full bg-gradient-to-t from-black/15 to-transparent"
        />

        {/* Reflection sweep — two phase-offset gradient sweeps for continuous flow */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          style={{ transform: "translateZ(0)" }}
        >
          <span
            className="absolute inset-y-0 -left-full w-full animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ willChange: "transform" }}
          />
          <span
            className="absolute inset-y-0 -left-full w-full animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ willChange: "transform", animationDelay: "-2s" }}
          />
        </span>

        <span className="relative text-base font-medium text-white">
          Scroll to start
        </span>
      </span>
    </button>
  );
}
