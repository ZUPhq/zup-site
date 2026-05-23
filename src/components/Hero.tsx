import LightningModel from "./LightningModel";
import ScrollChip from "./ScrollChip";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <LightningModel />
      <ScrollChip />
    </section>
  );
}
