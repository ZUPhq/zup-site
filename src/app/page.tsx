import ShaderBackground from "@/components/ShaderBackground";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <ShaderBackground />
      <main className="relative min-h-screen">
        <Hero />
      </main>
    </>
  );
}
