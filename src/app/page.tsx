import ShaderBackground from "@/components/ShaderBackground";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";

export default function Home() {
  return (
    <>
      <ShaderBackground />
      <main className="relative min-h-screen">
        <Hero />
        <Statement />
      </main>
    </>
  );
}
