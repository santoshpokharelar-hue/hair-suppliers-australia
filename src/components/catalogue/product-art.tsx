import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

// Curated tints in the brand palette, keyed off a hash of the product's brand
// so each brand reads consistently across the grid. Fallback for products
// with no imageUrl set yet.
const TINTS = ["#8FA36B", "#8E4E8B", "#C9A03A", "#5D9E4C", "#3E7FA0", "#C05A8E", "#7A4FA3", "#C77B3A"];

function hashTint(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return TINTS[Math.abs(hash) % TINTS.length];
}

// className controls size/rounding — callers size this differently (small
// cart thumbnail, large catalogue card, hero-sized product page image).
export function ProductArt({
  brand,
  imageUrl,
  className,
  iconClassName,
}: {
  brand: string;
  imageUrl?: string | null;
  className?: string;
  iconClassName?: string;
}) {
  if (imageUrl) {
    return (
      // Plain <img>, not next/image — the upload source is a Supabase Storage
      // URL whose hostname varies per project, so there's no fixed domain to
      // whitelist in next.config.ts's images.remotePatterns.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={brand} className={cn("w-full object-cover", className)} />
    );
  }

  const tint = hashTint(brand);
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={{ background: `linear-gradient(160deg, ${tint}, ${tint}aa)` }}
    >
      <Package className={cn("size-14 text-white/80", iconClassName)} strokeWidth={1.25} />
    </div>
  );
}
