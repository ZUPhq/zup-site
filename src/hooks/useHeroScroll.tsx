"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Module-level state so R3F Canvas children can read the latest values
// inside `useFrame` without depending on React context crossing the renderer.
export const heroScrollState = { progress: 0, transit: 0 };

type Ctx = { progress: number; transit: number };
const HeroScrollContext = createContext<Ctx>({ progress: 0, transit: 0 });

type Props = {
  children: ReactNode;
  /** Scrub distance for the logo-assembly phase, in viewport heights. */
  rangeVh?: number;
  /** Scrub distance for the transit-to-navbar phase that follows assembly. */
  transitVh?: number;
};

export function HeroScrollProvider({
  children,
  rangeVh = 1.4,
  transitVh = 0.6,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [transit, setTransit] = useState(0);
  const rafIdRef = useRef(0);

  useEffect(() => {
    const update = () => {
      rafIdRef.current = 0;
      const vh = window.innerHeight;
      const assembleRange = vh * rangeVh;
      const transitRange = vh * transitVh;
      const y = window.scrollY;

      const p =
        assembleRange > 0
          ? Math.max(0, Math.min(1, y / assembleRange))
          : 0;
      const t =
        transitRange > 0
          ? Math.max(0, Math.min(1, (y - assembleRange) / transitRange))
          : 0;

      heroScrollState.progress = p;
      heroScrollState.transit = t;
      setProgress(p);
      setTransit(t);
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
  }, [rangeVh, transitVh]);

  return (
    <HeroScrollContext.Provider value={{ progress, transit }}>
      {children}
    </HeroScrollContext.Provider>
  );
}

export function useHeroScroll() {
  return useContext(HeroScrollContext);
}
