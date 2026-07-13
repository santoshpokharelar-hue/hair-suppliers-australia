"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-store";
import { formatAUD } from "@/lib/format";
import { lineTotalCents, PRICING_TIERS, tierIndexOf, unitPriceCents } from "@/lib/pricing";

const QUICK_PACKS = [1, 6, 12, 49] as const;

// Only used on the product detail page (not the catalogue card anymore), so
// this is sized to be the visual centrepiece of that page, not a compact
// widget squeezed into a grid card.
export function AddToCartControls({
  productId,
  sku,
  name,
  brand,
  retailPriceCents,
  imageUrl,
}: {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  retailPriceCents: number;
  imageUrl: string | null;
}) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const activeTier = tierIndexOf(qty);

  return (
    <div>
      <div className="mb-5 overflow-hidden rounded-xl border border-line">
        {PRICING_TIERS.map((tier, i) => (
          <div
            key={tier.label}
            className={`flex items-center justify-between px-4 py-3 text-sm ${
              activeTier === i
                ? "bg-honey-soft font-extrabold text-[#7a5a0e]"
                : i % 2
                  ? "bg-[#FCFAF6]"
                  : "bg-white"
            }`}
          >
            <span>
              {tier.label} <span className="text-muted-foreground">({tier.range})</span>
            </span>
            <span className="font-semibold">
              {formatAUD(unitPriceCents(retailPriceCents, tier.min))}/u
              {tier.offPercent ? ` · ${tier.offPercent}% off` : ""}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-line">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-3.5 text-plum-dark"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <Input
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-auto w-14 border-none p-0 text-center text-lg font-bold"
          />
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="p-3.5 text-plum-dark"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button
          type="button"
          className="h-auto flex-1 justify-center py-3.5 text-base"
          onClick={() => {
            addItem({ productId, sku, name, brand, retailPriceCents, imageUrl }, qty);
            toast.success(`Added ${qty} × ${name.split(" ").slice(0, 3).join(" ")}…`);
          }}
        >
          <ShoppingCart className="size-4.5" /> Add · {formatAUD(lineTotalCents(retailPriceCents, qty))}
        </Button>
      </div>
      <div className="mt-3 flex gap-2">
        {QUICK_PACKS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setQty(n)}
            className={`flex-1 rounded-lg border py-2.5 text-sm font-bold ${
              qty === n ? "border-honey bg-honey-soft" : "border-line bg-white"
            }`}
          >
            {n === 49 ? "48+" : `×${n}`}
          </button>
        ))}
      </div>
    </div>
  );
}
