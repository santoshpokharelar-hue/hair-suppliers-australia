import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, type OrderStatus } from "@/db/schema";
import { unitPriceCents } from "@/lib/pricing";

// Shared by both the customer-facing and admin-facing qty-edit actions. An
// edit can cross a tier threshold, so it always recomputes from the
// product's CURRENT retail price — never from the order_item's previously
// snapshotted unit price, which already has an old tier discount baked in.
export async function applyOrderItemQtyChange(
  orderId: string,
  orderItemId: string,
  qty: number,
  currentStatus: OrderStatus
): Promise<void> {
  const [item] = await db.select().from(orderItems).where(eq(orderItems.id, orderItemId)).limit(1);
  if (!item || item.orderId !== orderId) throw new Error("Item not found on this order.");

  const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
  if (!product) throw new Error("This product is no longer available.");

  const newUnitPrice = unitPriceCents(product.retailPriceCents, qty);
  const newLineTotal = newUnitPrice * qty;

  await db.transaction(async (tx) => {
    await tx
      .update(orderItems)
      .set({ qty, unitPriceCents: newUnitPrice, lineTotalCents: newLineTotal })
      .where(eq(orderItems.id, orderItemId));

    const allItems = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    const subtotalCents = allItems.reduce((sum, i) => sum + i.lineTotalCents, 0);

    // Editing a quoted order invalidates the freight quote — back to
    // quote_requested so the admin re-prices shipping for the new total.
    const wasQuoted = currentStatus === "quoted";
    await tx
      .update(orders)
      .set({
        subtotalCents,
        ...(wasQuoted
          ? {
              status: "quote_requested" as const,
              freightCents: null,
              totalCents: null,
              gstCents: null,
              quotedAt: null,
              quoteToken: null,
            }
          : {}),
      })
      .where(eq(orders.id, orderId));
  });
}

// Admin-only: manually override a line's unit price instead of the tier
// formula — e.g. a negotiated rate for one customer's quote. Unlike
// applyOrderItemQtyChange, this never touches pricing.ts, so the override
// survives until the qty is next changed (which does recompute via the
// tier formula and would replace it).
export async function applyOrderItemPriceOverride(
  orderId: string,
  orderItemId: string,
  unitPriceCents: number,
  currentStatus: OrderStatus
): Promise<void> {
  const [item] = await db.select().from(orderItems).where(eq(orderItems.id, orderItemId)).limit(1);
  if (!item || item.orderId !== orderId) throw new Error("Item not found on this order.");

  const newLineTotal = unitPriceCents * item.qty;

  await db.transaction(async (tx) => {
    await tx
      .update(orderItems)
      .set({ unitPriceCents, lineTotalCents: newLineTotal })
      .where(eq(orderItems.id, orderItemId));

    const allItems = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    const subtotalCents = allItems.reduce((sum, i) => sum + i.lineTotalCents, 0);

    // Same rule as a qty edit — a price change after the quote was already
    // sent invalidates the total, so it goes back for re-quoting.
    const wasQuoted = currentStatus === "quoted";
    await tx
      .update(orders)
      .set({
        subtotalCents,
        ...(wasQuoted
          ? {
              status: "quote_requested" as const,
              freightCents: null,
              totalCents: null,
              gstCents: null,
              quotedAt: null,
              quoteToken: null,
            }
          : {}),
      })
      .where(eq(orders.id, orderId));
  });
}
