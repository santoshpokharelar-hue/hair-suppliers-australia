"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { ProductArt } from "@/components/catalogue/product-art";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-store";
import { formatAUD } from "@/lib/format";
import { lineTotalCents, PRICING_TIERS, tierIndexOf, unitPriceCents } from "@/lib/pricing";

export function CartView() {
  const { items, setQty, removeItem, subtotalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-card p-11 text-center text-muted-foreground">
        Your cart is empty.
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="ml-2.5"
        >
          Browse catalogue
        </Button>
      </div>
    );
  }

  return (
    <>
      {items.map((item) => {
        const tier = PRICING_TIERS[tierIndexOf(item.qty)];
        const unit = unitPriceCents(item.retailPriceCents, item.qty);
        return (
          <div
            key={item.productId}
            className="mb-2.5 flex flex-wrap items-center gap-3.5 rounded-xl border border-line bg-card p-3.5"
          >
            <div className="w-16 shrink-0 overflow-hidden rounded-lg">
              <ProductArt brand={item.brand} />
            </div>
            <div className="min-w-[180px] flex-1">
              <div className="text-sm font-bold">{item.name}</div>
              <div className="text-xs text-muted-foreground">
                SKU {item.sku} · {tier.label}
                {tier.offPercent ? ` (${tier.offPercent}% off)` : ""} · {formatAUD(unit)}/unit
              </div>
            </div>
            <div className="flex items-center rounded-lg border border-line">
              <button
                type="button"
                onClick={() => setQty(item.productId, item.qty - 1)}
                className="p-1.5 px-2.5 text-plum-dark"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" />
              </button>
              <Input
                value={item.qty}
                onChange={(e) => setQty(item.productId, Math.max(1, parseInt(e.target.value) || 1))}
                className="h-auto w-10 border-none p-0 text-center text-sm font-bold"
              />
              <button
                type="button"
                onClick={() => setQty(item.productId, item.qty + 1)}
                className="p-1.5 px-2.5 text-plum-dark"
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <div className="w-24 text-right text-base font-extrabold">
              {formatAUD(lineTotalCents(item.retailPriceCents, item.qty))}
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-destructive"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="size-4.5" />
            </button>
          </div>
        );
      })}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-plum-dark px-5 py-4 text-white">
        <div>
          <div className="text-xs text-honey-soft/80">Total (excl. shipping)</div>
          <div className="font-display text-2xl font-bold">
            {formatAUD(subtotalCents)}{" "}
            <span className="text-sm font-normal text-honey-soft/80">
              + shipping (quoted after review)
            </span>
          </div>
        </div>
        <Button render={<Link href="/quote" />} nativeButton={false} variant="secondary">
          <Truck className="size-4" /> Get final quote with shipping
        </Button>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShoppingBag className="size-3.5" /> Per-unit price updates automatically as quantities
        cross tier thresholds.
      </div>
    </>
  );
}
