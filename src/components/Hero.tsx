import LightningModel from "./LightningModel";
import ScrollChip from "./ScrollChip";

export default function Hero() {
  return (
    <section className="relative h-dvh w-full overflow-hidden">
      <LightningModel />
      <ScrollChip />
    </section>
  );
}
