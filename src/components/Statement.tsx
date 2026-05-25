"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SHARD_COUNT = 8;
const FONT_SIZE_RULE = "clamp(1.5rem, 7vw, 7rem)";

// Pre-compute triangular shards radiating from the chip's center.
const SHARDS = (() => {
  const arr: Array<{
    clipPath: string;
    tx: number;
    ty: number;
    rotate: number;
  }> = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const angle = (i / SHARD_COUNT) * 360;
    const nextAngle = ((i + 1) / SHARD_COUNT) * 360;
    const pt = (deg: number) => {
      const r = ((deg - 90) * Math.PI) / 180;
      const x = 50 + 80 * Math.cos(r);
      const y = 50 + 80 * Math.sin(r);
      return `${x}% ${y}%`;
    };
    const flyDir = (angle + nextAngle) / 2;
    const flyRad = ((flyDir - 90) * Math.PI) / 180;
    const distance = 0.7 + ((i * 7) % 5) * 0.1;
    arr.push({
      clipPath: `polygon(50% 50%, ${pt(angle)}, ${pt(nextAngle)})`,
      tx: Math.cos(flyRad) * distance,
      ty: Math.sin(flyRad) * distance,
      rotate: ((i * 47) % 60) - 30,
    });
  }
  return arr;
})();

function GlassChip({
  children,
  fading,
}: {
  children: ReactNode;
  fading?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex items-center overflow-hidden rounded-full bg-white/[0.07] px-[0.55em] py-[0.1em] backdrop-blur-[40px] backdrop-saturate-200 backdrop-brightness-110 transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{
        boxShadow: [
          "inset 0 1.5px 0.5px 0 rgba(255, 255, 255, 0.60)",
          "inset 0 -1px 0.5px 0 rgba(255, 255, 255, 0.12)",
          "inset 0 0 0 1px rgba(255, 255, 255, 0.25)",
          "inset 0 -8px 16px -8px rgba(0, 0, 0, 0.25)",
          "0 2px 8px rgba(0, 0, 0, 0.25)",
          "0 8px 24px rgba(0, 0, 0, 0.30)",
          "0 24px 60px rgba(0, 0, 0, 0.45)",
        ].join(", "),
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[0.1em] top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/40 via-white/[0.08] to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[0.1em] bottom-0 h-1/3 rounded-b-full bg-gradient-to-t from-black/20 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
        style={{ transform: "translateZ(0)" }}
      >
        <span
          className="animate-shine absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/35 to-transparent"
          style={{ willChange: "transform" }}
        />
        <span
          className="animate-shine absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/35 to-transparent"
          style={{ willChange: "transform", animationDelay: "-2s" }}
        />
      </span>
      <span className="relative text-brand-yellow">{children}</span>
    </span>
  );
}

export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const probeMRef = useRef<HTMLSpanElement>(null);
  const probeCRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const [exploding, setExploding] = useState(false);
  const [showCreative, setShowCreative] = useState(false);
  const [dims, setDims] = useState<{ mW: number; cW: number; h: number } | null>(
    null
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t1 = setTimeout(() => setBreaking(true), 1500);
    const t2 = setTimeout(() => setExploding(true), 1560);
    const t3 = setTimeout(() => setShowCreative(true), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible]);

  // Measure both chip widths offscreen so the wrapper can animate width
  // smoothly during the marketing → creative swap.
  useLayoutEffect(() => {
    const measure = () => {
      if (!probeMRef.current || !probeCRef.current) return;
      const m = probeMRef.current.getBoundingClientRect();
      const c = probeCRef.current.getBoundingClientRect();
      setDims({ mW: m.width, cW: c.width, h: m.height });
    };
    measure();
    // Re-measure once fonts settle (Inter loads async via next/font).
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const currentW = dims
    ? showCreative
      ? dims.cW
      : dims.mW
    : undefined;

  return (
    <section
      ref={ref}
      className="relative flex min-h-dvh items-center justify-center px-6 py-32"
    >
      {/* Off-screen probes — render two chips at the live font size so we can
          measure their natural widths and animate the visible wrapper. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 whitespace-nowrap font-display font-bold leading-[1.05] tracking-tight"
        style={{ fontSize: FONT_SIZE_RULE, left: -99999 }}
      >
        <span ref={probeMRef}>
          <GlassChip>marketing</GlassChip>
        </span>
        <span ref={probeCRef}>
          <GlassChip>creative</GlassChip>
        </span>
      </div>

      <h2
        className={`text-center font-display font-bold leading-[1.05] tracking-tight transition-all duration-1000 ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <span
          className="block whitespace-nowrap"
          style={{ fontSize: FONT_SIZE_RULE }}
        >
          Your{" "}
          <span
            className="relative inline-block align-middle transition-[width] duration-500 ease-out"
            style={{
              width: currentW != null ? `${currentW}px` : "auto",
              height: dims ? `${dims.h}px` : "auto",
            }}
          >
            {/* Marketing chip + its shatter */}
            <span
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                showCreative ? "opacity-0" : "opacity-100"
              }`}
            >
              <span className="relative">
                <GlassChip fading={breaking}>marketing</GlassChip>
                {breaking && !showCreative && (
                  <span className="pointer-events-none absolute inset-0">
                    {SHARDS.map((s, i) => (
                      <span
                        key={i}
                        className="absolute inset-0 transition-all duration-700 ease-out"
                        style={{
                          clipPath: s.clipPath,
                          transform: exploding
                            ? `translate(${s.tx}em, ${s.ty}em) rotate(${s.rotate}deg) scale(0.55)`
                            : "none",
                          opacity: exploding ? 0 : 1,
                        }}
                      >
                        <GlassChip>marketing</GlassChip>
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </span>

            {/* Creative chip — materializes after the shatter */}
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
                showCreative
                  ? "scale-100 opacity-100"
                  : "scale-50 opacity-0"
              }`}
            >
              <GlassChip>creative</GlassChip>
            </span>
          </span>{" "}
          agency.
        </span>
      </h2>
    </section>
  );
}
