import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import { auth } from "@/auth";
import { AddToCartControls } from "@/components/catalogue/add-to-cart-controls";
import { ProductArt } from "@/components/catalogue/product-art";
import { Button } from "@/components/ui/button";
import { getProductById } from "@/lib/queries/products";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, product] = await Promise.all([auth(), getProductById(id)]);
  if (!product || !product.active) notFound();

  const loggedIn = Boolean(session?.user);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8">
      <Link href="/" className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-plum">
        <ChevronLeft className="size-4" /> Back to catalogue
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <ProductArt
          brand={product.brand}
          imageUrl={product.imageUrl}
          className="h-72 rounded-2xl md:h-[420px]"
          iconClassName="size-20"
        />
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wide text-honey">{product.category}</div>
          <h1 className="mt-1.5 font-display text-2xl font-bold leading-tight text-plum-dark">{product.name}</h1>
          <div className="mt-2 text-sm text-muted-foreground">
            {product.brand} · SKU {product.sku} · {product.stockQty} in stock
          </div>

          <div className="mt-6">
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
              <>
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-line bg-paper px-3 py-3 text-sm text-muted-foreground">
                  <Lock className="size-4 text-plum" /> Wholesale pricing hidden — login to view
                </div>
                <Button
                  render={<Link href="/login" />}
                  nativeButton={false}
                  className="mt-3 w-full justify-center"
                >
                  Login to see prices
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
