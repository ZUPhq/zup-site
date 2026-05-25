"use client";

import { useEffect, useState } from "react";

// Mobile-ish heuristic: touch input + viewport <= 1024px wide. Catches phones
// and small tablets but not desktop laptops in narrow windows.
const MOBILE_QUERY = "(max-width: 1024px) and (pointer: coarse)";

export function useIsMobile() {
  // SSR-safe default: assume mobile so the first paint is the lightweight
  // fallback. After hydration the actual device is detected and desktops
  // upgrade to the full WebGL experience.
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}
