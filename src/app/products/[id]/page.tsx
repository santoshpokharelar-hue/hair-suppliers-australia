import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import { auth } from "@/auth";
import { AddToCartControls } from "@/components/catalogue/add-to-cart-controls";
import { ProductArt } from "@/components/catalogue/product-art";
import { Button } from "@/components/ui/button";
import { formatAUD } from "@/lib/format";
import { getProductById } from "@/lib/queries/products";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, product] = await Promise.all([auth(), getProductById(id)]);
  if (!product || !product.active) notFound();

  const loggedIn = Boolean(session?.user);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-plum">
        <ChevronLeft className="size-4" /> Back to catalogue
      </Link>
      <div className="grid items-stretch gap-10 md:grid-cols-2">
        <ProductArt
          brand={product.brand}
          imageUrl={product.imageUrl}
          className="h-80 rounded-2xl md:h-full md:min-h-[560px]"
          iconClassName="size-28"
        />
        <div className="flex flex-col">
          <div className="text-xs font-extrabold uppercase tracking-wide text-honey">{product.category}</div>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-plum-dark">{product.name}</h1>
          <div className="mt-3 text-sm text-muted-foreground">
            {product.brand} · SKU {product.sku} · {product.stockQty} in stock
          </div>

          {loggedIn && (
            <div className="mt-6 font-display text-4xl font-bold text-plum-dark">
              {formatAUD(product.retailPriceCents)}
              <span className="ml-2 text-base font-normal text-muted-foreground">/ unit, inc. GST</span>
            </div>
          )}

          <div className="mt-8 flex-1">
            {loggedIn ? (
              <AddToCartControls
                productId={product.id}
                sku={product.sku}
                name={product.name}
                brand={product.brand}
                retailPriceCents={product.retailPriceCents}
                imageUrl={product.imageUrl}
              />
            ) : (
              <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-line bg-paper p-8">
                <div className="flex items-center gap-2.5 text-base text-muted-foreground">
                  <Lock className="size-5 text-plum" /> Wholesale pricing hidden — login to view
                </div>
                <p className="text-sm text-muted-foreground">
                  Sign in as a guest or business account to see tiered pricing (up to 55% off
                  retail) and add this to your quote.
                </p>
                <Button render={<Link href="/login" />} nativeButton={false} className="w-full justify-center py-3">
                  Login to see prices
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
