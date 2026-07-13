import { Package } from "lucide-react";

// Curated tints in the brand palette, keyed off a hash of the product's brand
// so each brand reads consistently across the grid. Fallback for products
// with no imageUrl set yet.
const TINTS = ["#8FA36B", "#8E4E8B", "#C9A03A", "#5D9E4C", "#3E7FA0", "#C05A8E", "#7A4FA3", "#C77B3A"];

function hashTint(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return TINTS[Math.abs(hash) % TINTS.length];
}

export function ProductArt({ brand, imageUrl }: { brand: string; imageUrl?: string | null }) {
  if (imageUrl) {
    return (
      // Plain <img>, not next/image — the upload source is a Supabase Storage
      // URL whose hostname varies per project, so there's no fixed domain to
      // whitelist in next.config.ts's images.remotePatterns.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={brand} className="h-[150px] w-full rounded-t-xl object-cover" />
    );
  }

  const tint = hashTint(brand);
  return (
    <div
      className="flex h-[150px] items-center justify-center rounded-t-xl"
      style={{ background: `linear-gradient(160deg, ${tint}, ${tint}aa)` }}
    >
      <Package className="size-14 text-white/80" strokeWidth={1.25} />
    </div>
  );
}
