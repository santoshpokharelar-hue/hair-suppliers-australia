import { cache } from "react";
import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

// Admin catalogue management sees inactive products too — searchProducts()
// below is the customer-facing one and always filters to active only.
export async function listAllProductsForAdmin() {
  return db.select().from(products).orderBy(products.brand, products.name);
}

// Wrapped in React's cache() so generateMetadata() and the page component
// both calling this for the same product in one request share a single
// DB query instead of hitting the database twice per page load.
export const getProductById = cache(async (id: string) => {
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return product ?? null;
});

// IDs only, for the sitemap — no need to pull every column for ~500 rows
// just to build URLs.
export async function listActiveProductIds() {
  return db.select({ id: products.id }).from(products).where(eq(products.active, true));
}

// Case-insensitive substring match across name, brand, category and SKU —
// works for logged-out visitors too, since only price is gated, not search.
export async function searchProducts(query?: string) {
  const q = query?.trim();
  const term = q ? `%${q}%` : undefined;

  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.active, true),
        term
          ? or(
              ilike(products.name, term),
              ilike(products.brand, term),
              ilike(products.category, term),
              ilike(products.sku, term)
            )
          : undefined
      )
    )
    .orderBy(products.brand, products.name);
}
