"use client";

import { useEffect, useRef, useState } from "react";

export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex min-h-dvh items-center justify-center px-6 py-32"
    >
      <h2
        className={`max-w-6xl text-center font-display font-bold leading-[1.05] tracking-tight transition-all duration-1000 ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <span className="mb-6 block text-2xl font-medium tracking-wide text-white/45 md:mb-10 md:text-3xl lg:text-4xl">
          Not your marketing agency.
        </span>
        <span className="block text-5xl md:text-7xl lg:text-8xl xl:text-9xl">
          Your <span className="text-brand-yellow">creative</span> agency.
        </span>
      </h2>
    </section>
  );
}
