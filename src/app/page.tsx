import ShaderBackground from "@/components/ShaderBackground";
import LightningModel from "@/components/LightningModel";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Portfolio from "@/components/Portfolio";
import { HeroScrollProvider } from "@/hooks/useHeroScroll";

export default function Home() {
  return (
    <>
      <ShaderBackground />
      <HeroScrollProvider rangeVh={1.4} transitVh={0.6}>
        <LightningModel />
        <main className="relative min-h-screen">
          <Hero />
          <Statement />
          <Portfolio />
        </main>
      </HeroScrollProvider>
    </>
  );
}
