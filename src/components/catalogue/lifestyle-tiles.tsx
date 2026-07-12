import { Box, Droplet, Scissors, Waves } from "lucide-react";

const TILES: {
  label: string;
  from: string;
  to: string;
  Icon: typeof Scissors;
  tall?: boolean;
}[] = [
  { label: "Salon back-bar", from: "#C98A2D", to: "#8a5a12", Icon: Scissors },
  { label: "Wash-day ritual", from: "#8E4E8B", to: "#4d2450", Icon: Droplet, tall: true },
  { label: "Protective styles", from: "#4C7A5A", to: "#23412c", Icon: Waves, tall: true },
  { label: "Retail shelf-ready", from: "#B0578C", to: "#5c2246", Icon: Box },
];

// Illustrated stand-ins for lifestyle photography — swap for real shots once
// sourced from the Nature's Hair retail store's assets.
export function LifestyleTiles() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TILES.map(({ label, from, to, Icon, tall }) => (
        <div
          key={label}
          className={`relative flex flex-col justify-end overflow-hidden rounded-2xl p-3.5 ${tall ? "min-h-[150px]" : "min-h-[110px]"}`}
          style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
        >
          <Icon className="absolute -right-3 -top-3 size-24 text-white/25" strokeWidth={1.5} />
          <span className="text-sm font-extrabold tracking-wide text-white">{label}</span>
        </div>
      ))}
    </div>
  );
}
