import ScrollChip from "./ScrollChip";

export default function Hero() {
  return (
    <section className="relative h-[200vh] w-full">
      <div className="sticky top-0 h-dvh w-full overflow-hidden">
        <ScrollChip />
      </div>
    </section>
  );
}
