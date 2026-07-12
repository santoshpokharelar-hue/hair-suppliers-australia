"use server";

import { inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { orderItems, orders, products, type ShippingAddressSnapshot } from "@/db/schema";
import { sendAdminNewQuoteRequestEmail, sendQuoteRequestAckEmail } from "@/lib/email";
import { isUniqueViolation, randomOrderNumber } from "@/lib/order-token";
import { unitPriceCents } from "@/lib/pricing";
import { getOrderById } from "@/lib/queries/orders";
import { quoteRequestSchema, type QuoteRequestInput } from "@/lib/validation/quote";

export type QuoteRequestState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  orderNumber?: string;
};

export async function createQuoteRequestAction(input: QuoteRequestInput): Promise<QuoteRequestState> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, message: "You must be signed in to request a quote." };
  }

  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  // Never trust cart prices/names from the client — look products up fresh
  // and recompute every line via pricing.ts.
  const productIds = data.items.map((i) => i.productId);
  const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));
  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  const lineItems: {
    productId: string;
    sku: string;
    nameSnapshot: string;
    qty: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }[] = [];

  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product || !product.active) {
      return {
        ok: false,
        message: "One of the items in your cart is no longer available — please review your cart.",
      };
    }
    const unitPrice = unitPriceCents(product.retailPriceCents, item.qty);
    lineItems.push({
      productId: product.id,
      sku: product.sku,
      nameSnapshot: product.name,
      qty: item.qty,
      unitPriceCents: unitPrice,
      lineTotalCents: unitPrice * item.qty,
    });
  }
  const subtotalCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);

  const shippingAddress: ShippingAddressSnapshot = {
    street: data.street,
    suburb: data.suburb,
    state: data.state,
    postcode: data.postcode,
  };

  for (let attempt = 0; attempt < 5; attempt++) {
    const orderNumber = randomOrderNumber();
    let orderId: string;
    try {
      orderId = await db.transaction(async (tx) => {
        const [order] = await tx
          .insert(orders)
          .values({
            orderNumber,
            userId: session.user.id,
            shippingAddress,
            subtotalCents,
            customerNote: data.customerNote || null,
          })
          .returning({ id: orders.id });

        await tx.insert(orderItems).values(lineItems.map((item) => ({ ...item, orderId: order.id })));
        return order.id;
      });
    } catch (err) {
      if (isUniqueViolation(err)) continue;
      throw err;
    }

    // Best-effort — a failed email should never fail an order that already
    // committed. sendQuoteRequestAckEmail/sendAdminNewQuoteRequestEmail each
    // swallow their own send errors, but the re-fetch here is wrapped too.
    try {
      const fullOrder = await getOrderById(orderId);
      if (fullOrder) {
        await Promise.all([sendQuoteRequestAckEmail(fullOrder), sendAdminNewQuoteRequestEmail(fullOrder)]);
      }
    } catch (err) {
      console.error("Failed to send quote request emails:", err);
    }

    return { ok: true, orderNumber };
  }

  return { ok: false, message: "Couldn't generate a unique order number — please try again." };
}
