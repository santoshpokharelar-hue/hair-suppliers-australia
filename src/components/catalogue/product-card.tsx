import Link from "next/link";
import { Lock } from "lucide-react";
import { ProductArt } from "@/components/catalogue/product-art";
import type { products } from "@/db/schema";
import { formatAUD } from "@/lib/format";

type Product = typeof products.$inferSelect;

// Kept deliberately minimal — image, name, price. Tier pricing, quantity,
// and add-to-cart all live on the product detail page (/products/[id]) so
// the catalogue grid stays scannable instead of every card being a mini
// checkout form.
export function ProductCard({ product, loggedIn }: { product: Product; loggedIn: boolean }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-shadow hover:shadow-md"
    >
      <ProductArt
        brand={product.brand}
        imageUrl={product.imageUrl}
        className="h-80 rounded-t-2xl"
        iconClassName="size-20"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs font-extrabold uppercase tracking-wide text-honey">{product.category}</div>
        <div className="mt-1.5 font-display text-lg font-bold leading-snug text-plum-dark group-hover:underline">
          {product.name}
        </div>
        <div className="mt-4">
          {loggedIn ? (
            <div className="text-xl font-extrabold text-plum-dark">{formatAUD(product.retailPriceCents)}</div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-plum">
              <Lock className="size-4" /> Login to see price
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
