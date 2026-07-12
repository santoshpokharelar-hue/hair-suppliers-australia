import Link from "next/link";
import { Lock } from "lucide-react";
import { auth } from "@/auth";
import { LifestyleTiles } from "@/components/catalogue/lifestyle-tiles";
import { ProductCard } from "@/components/catalogue/product-card";
import { ProductSearch } from "@/components/catalogue/product-search";
import { Button } from "@/components/ui/button";
import { searchProducts } from "@/lib/queries/products";

const STATS = [
  ["30%", "off packs of 6"],
  ["45%", "off 12–48 units"],
  ["55%", "off 48+ units"],
] as const;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [session, allProducts] = await Promise.all([auth(), searchProducts(q)]);
  // All logged-in roles (guest, business, admin) see wholesale prices —
  // only logged-out visitors get the lock state.
  const loggedIn = Boolean(session?.user);

  return (
    <div>
      <section className="bg-gradient-to-br from-plum-dark to-plum px-6 py-12 text-white">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-9 lg:grid-cols-2">
          <div>
            <div className="mb-3.5 text-xs font-extrabold tracking-[0.2em] text-honey">
              SAME PRODUCTS AS NATURE&apos;S HAIR RETAIL — AT TRADE PRICES
            </div>
            <h1 className="mb-4 font-display text-4xl font-bold leading-tight lg:text-5xl">
              Stock your salon shelves with the brands your clients already ask for.
            </h1>
            <p className="mb-5 max-w-lg text-[15.5px] leading-relaxed text-honey-soft/90">
              Mielle, Design Essentials, Sunny Isle, Aunt Jackie&apos;s, Kaleidoscope and more —
              the full Nature&apos;s Hair range, packed by the carton and shipped
              Australia-wide. Sign in to unlock four tiers of wholesale pricing.
            </p>
            {!loggedIn && (
              <Button render={<Link href="/login" />} nativeButton={false} variant="secondary">
                <Lock className="size-4" /> Login to see prices
              </Button>
            )}
            <div className="mt-7 flex flex-wrap gap-6">
              {STATS.map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl font-bold text-honey">{n}</div>
                  <div className="text-xs text-honey-soft/80">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <LifestyleTiles />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-8 pt-9">
        <div className="mb-2 flex flex-wrap items-center gap-3.5">
          <h2 className="font-display text-2xl text-plum-dark">Product catalogue</h2>
          <span className="text-xs text-muted-foreground">{allProducts.length} products</span>
        </div>
        <div className="my-6">
          <ProductSearch initialQuery={q} />
        </div>

        {allProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-card p-10 text-center text-muted-foreground">
            No products contain &quot;{q}&quot;. Try a shorter word — search matches any part of
            the name, brand, category or SKU.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-2 lg:grid-cols-3">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} loggedIn={loggedIn} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
