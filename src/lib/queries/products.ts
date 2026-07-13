import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

// Admin catalogue management sees inactive products too — searchProducts()
// below is the customer-facing one and always filters to active only.
export async function listAllProductsForAdmin() {
  return db.select().from(products).orderBy(products.brand, products.name);
}

export async function getProductById(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return product ?? null;
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
