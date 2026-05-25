import LightningModel from "./LightningModel";
import ScrollChip from "./ScrollChip";
import { HeroScrollProvider } from "@/hooks/useHeroScroll";

export default function Hero() {
  return (
    <HeroScrollProvider rangeVh={1.4}>
      <section className="relative h-[240vh] w-full">
        <div className="sticky top-0 h-dvh w-full overflow-hidden">
          <LightningModel />
          <ScrollChip />
        </div>
      </section>
    </HeroScrollProvider>
  );
}
