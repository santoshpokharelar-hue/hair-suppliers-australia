import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

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
