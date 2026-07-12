import Link from "next/link";
import { Eye, Lock } from "lucide-react";
import { ProductArt } from "@/components/catalogue/product-art";
import { Button } from "@/components/ui/button";
import type { products } from "@/db/schema";
import { formatAUD } from "@/lib/format";
import { PRICING_TIERS, unitPriceCents } from "@/lib/pricing";

type Product = typeof products.$inferSelect;

export function ProductCard({ product, loggedIn }: { product: Product; loggedIn: boolean }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-card">
      <ProductArt brand={product.brand} />
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[10.5px] font-extrabold uppercase tracking-wide text-honey">
          {product.category}
        </div>
        <div className="mt-1 min-h-10 font-display text-[15.5px] font-bold leading-tight text-plum-dark">
          {product.name}
        </div>
        <div className="mb-2.5 mt-1 text-xs text-muted-foreground">
          SKU {product.sku} · {product.stockQty} in stock
        </div>

        <div className="mt-auto">
          {loggedIn ? (
            <div className="overflow-hidden rounded-lg border border-line">
              {PRICING_TIERS.map((tier, i) => (
                <div
                  key={tier.label}
                  className={`flex justify-between px-2.5 py-1.5 text-xs ${i % 2 ? "bg-[#FCFAF6]" : "bg-white"}`}
                >
                  <span>
                    {tier.label}{" "}
                    <span className="text-muted-foreground">({tier.range})</span>
                  </span>
                  <span className="font-semibold">
                    {formatAUD(unitPriceCents(product.retailPriceCents, tier.min))}/u
                    {tier.offPercent ? ` · ${tier.offPercent}% off` : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-line bg-paper px-3 py-3 text-xs text-muted-foreground">
                <Lock className="size-3.5 text-plum" /> Wholesale pricing hidden — login to view
              </div>
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                variant="ghost"
                size="sm"
                className="mt-2.5 w-full justify-center"
              >
                <Eye className="size-3.5" /> Login to see prices
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
