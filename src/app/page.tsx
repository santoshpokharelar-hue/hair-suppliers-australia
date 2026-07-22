import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { auth } from "@/auth";
import { ProductCard } from "@/components/catalogue/product-card";
import { ProductSearch } from "@/components/catalogue/product-search";
import { LifestyleGrid } from "@/components/site/lifestyle-grid";
import { LifestyleMarquee } from "@/components/site/lifestyle-marquee";
import { Button } from "@/components/ui/button";
import { searchProducts } from "@/lib/queries/products";

const HERO_FEATURE = { src: "/lifestyle/women-with-roses.jpg", alt: "", width: 1366, height: 754 };

const HERO_IMAGES = [
  { src: "/lifestyle/group-portrait.jpg", alt: "", width: 1890, height: 1890 },
  { src: "/lifestyle/retro-tv-duo.jpg", alt: "", width: 2400, height: 3600 },
  { src: "/lifestyle/tropical-closeup.jpg", alt: "", width: 2848, height: 4288 },
];

const GRID_IMAGES = [
  { src: "/lifestyle/parent-child-park.jpg", alt: "", width: 544, height: 633 },
  { src: "/lifestyle/three-women-embrace.webp", alt: "", width: 385, height: 348 },
  { src: "/lifestyle/kids-shampoo.webp", alt: "", width: 385, height: 350 },
  { src: "/lifestyle/wavy-hair-roses.jpg", alt: "", width: 547, height: 495 },
  { src: "/lifestyle/products-in-nature.jpg", alt: "", width: 2049, height: 906 },
  { src: "/lifestyle/red-dress-light.jpg", alt: "", width: 720, height: 1070 },
];

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
      <section className="overflow-hidden bg-gradient-to-br from-plum-dark to-plum pt-14 pb-12 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2">
          <div>
            <div className="mb-4 text-xs font-extrabold tracking-[0.2em] text-honey">
              SAME PRODUCTS AS NATURE&apos;S HAIR RETAIL — AT TRADE PRICES
            </div>
            <h1 className="mb-5 text-balance font-display text-4xl font-bold leading-tight lg:text-5xl">
              Stock your salon shelves with the brands your clients already ask for.
            </h1>
            <p className="mb-6 max-w-lg text-[15.5px] leading-relaxed text-honey-soft/90">
              Mielle, Design Essentials, Sunny Isle, Aunt Jackie&apos;s, Kaleidoscope and more —
              the full Nature&apos;s Hair range, packed by the carton and shipped Australia-wide.
              Sign in to unlock four tiers of wholesale pricing.
            </p>
            {!loggedIn && (
              <Button render={<Link href="/login" />} nativeButton={false} variant="secondary">
                <Lock className="size-4" /> Login to see prices
              </Button>
            )}
            <div className="mt-8 flex flex-wrap gap-8">
              {STATS.map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl font-bold text-honey">{n}</div>
                  <div className="text-xs text-honey-soft/80">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-xl shadow-black/30">
            <Image
              src={HERO_FEATURE.src}
              alt={HERO_FEATURE.alt}
              width={HERO_FEATURE.width}
              height={HERO_FEATURE.height}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-11">
          <LifestyleMarquee images={HERO_IMAGES} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-12">
        <div className="mb-6">
          <div className="mb-1.5 text-xs font-extrabold tracking-[0.2em] text-honey">
            THE PEOPLE BEHIND THE PRODUCTS
          </div>
          <h2 className="font-display text-2xl text-plum-dark">Real hair, real routines</h2>
        </div>
        <LifestyleGrid images={GRID_IMAGES} />
      </section>

      <section className="relative isolate flex min-h-[220px] items-center overflow-hidden">
        <Image
          src="/lifestyle/natures-hair-heritage.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-6 py-10">
          <p className="max-w-md text-lg font-semibold leading-snug text-paper lg:text-xl">
            Backed by the team behind Nature&apos;s Hair — Australia&apos;s trusted home for
            textured hair care, now wholesale.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-9">
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
          <div className="grid grid-cols-1 gap-6 pb-5 sm:grid-cols-2 lg:grid-cols-3">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} loggedIn={loggedIn} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
