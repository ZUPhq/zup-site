"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Module-level state so R3F Canvas children can read the latest progress
// inside `useFrame` without depending on React context crossing the renderer.
export const heroScrollState = { progress: 0 };

type Ctx = { progress: number };
const HeroScrollContext = createContext<Ctx>({ progress: 0 });

type Props = {
  children: ReactNode;
  /** Scrub distance as a fraction of viewport height. */
  rangeVh?: number;
};

export function HeroScrollProvider({ children, rangeVh = 0.8 }: Props) {
  const [progress, setProgress] = useState(0);
  const rafIdRef = useRef(0);

  useEffect(() => {
    const update = () => {
      rafIdRef.current = 0;
      const range = window.innerHeight * rangeVh;
      const p = range > 0 ? Math.max(0, Math.min(1, window.scrollY / range)) : 0;
      heroScrollState.progress = p;
      setProgress(p);
    };
    const onScroll = () => {
      if (rafIdRef.current === 0) {
        rafIdRef.current = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [rangeVh]);

  return (
    <HeroScrollContext.Provider value={{ progress }}>
      {children}
    </HeroScrollContext.Provider>
  );
}

export function useHeroScroll() {
  return useContext(HeroScrollContext);
}
