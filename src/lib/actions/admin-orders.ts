"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { sendOrderCancelledEmail, sendOrderFinalizedEmail, sendQuoteReadyEmail } from "@/lib/email";
import { generateQuoteToken } from "@/lib/order-token";
import { applyOrderItemQtyChange } from "@/lib/order-items-recompute";
import { gstComponentCents } from "@/lib/pricing";
import { getOrderById } from "@/lib/queries/orders";

export type OrderActionState = { ok: boolean; message?: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "Forbidden." } as const;
  return { userId: session.user.id } as const;
}

async function restockOrder(orderId: string): Promise<void> {
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    await db
      .update(products)
      .set({ stockQty: sql`${products.stockQty} + ${item.qty}` })
      .where(eq(products.id, item.productId));
  }
}

export async function sendQuoteAction(
  orderId: string,
  input: { freightCents: number; isPickup: boolean; adminNote?: string }
): Promise<OrderActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return { ok: false, message: admin.error };

  const order = await getOrderById(orderId);
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status !== "quote_requested" && order.status !== "quoted") {
    return { ok: false, message: "This order isn't awaiting a quote." };
  }
  if (!input.isPickup && (!Number.isInteger(input.freightCents) || input.freightCents < 0)) {
    return { ok: false, message: "Enter a valid freight amount." };
  }

  const freightCents = input.isPickup ? 0 : input.freightCents;
  const totalCents = order.subtotalCents + freightCents;
  const gstCents = gstComponentCents(totalCents);

  await db
    .update(orders)
    .set({
      freightCents,
      isPickup: input.isPickup,
      adminNote: input.adminNote || null,
      totalCents,
      gstCents,
      quotedAt: new Date(),
      quoteToken: generateQuoteToken(),
      status: "quoted",
    })
    .where(eq(orders.id, orderId));

  const fullOrder = await getOrderById(orderId);
  if (fullOrder) {
    await sendQuoteReadyEmail(fullOrder).catch((err) => console.error("Failed to send email:", err));
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

export async function declineQuoteAction(orderId: string, reason: string): Promise<OrderActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return { ok: false, message: admin.error };
  if (!reason.trim()) return { ok: false, message: "A decline reason is required." };

  const order = await getOrderById(orderId);
  if (!order || order.status !== "quote_requested") {
    return { ok: false, message: "Only orders awaiting a quote can be declined." };
  }

  await db
    .update(orders)
    .set({ status: "cancelled", cancelledAt: new Date(), cancelReason: reason })
    .where(eq(orders.id, orderId));

  const fullOrder = await getOrderById(orderId);
  if (fullOrder) {
    await sendOrderCancelledEmail(fullOrder).catch((err) => console.error("Failed to send email:", err));
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

export async function adminCancelOrderAction(orderId: string, reason: string): Promise<OrderActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return { ok: false, message: admin.error };
  if (!reason.trim()) return { ok: false, message: "A cancellation reason is required." };

  const order = await getOrderById(orderId);
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status === "finalized" || order.status === "cancelled") {
    return { ok: false, message: "This order can no longer be cancelled." };
  }

  // Stock only ever decremented at `paid` — restock if that already happened.
  if (order.status === "paid") await restockOrder(orderId);

  await db
    .update(orders)
    .set({ status: "cancelled", cancelledAt: new Date(), cancelReason: reason })
    .where(eq(orders.id, orderId));

  const fullOrder = await getOrderById(orderId);
  if (fullOrder) {
    await sendOrderCancelledEmail(fullOrder).catch((err) => console.error("Failed to send email:", err));
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

export async function markFinalizedAction(orderId: string, trackingNumber?: string): Promise<OrderActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return { ok: false, message: admin.error };

  const order = await getOrderById(orderId);
  if (!order || order.status !== "paid") {
    return { ok: false, message: "Only paid orders can be marked finalized." };
  }

  await db
    .update(orders)
    .set({ status: "finalized", finalizedAt: new Date(), trackingNumber: trackingNumber || null })
    .where(eq(orders.id, orderId));

  const fullOrder = await getOrderById(orderId);
  if (fullOrder) {
    await sendOrderFinalizedEmail(fullOrder).catch((err) => console.error("Failed to send email:", err));
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

export async function adminUpdateOrderItemQtyAction(
  orderId: string,
  orderItemId: string,
  qty: number
): Promise<OrderActionState> {
  if (!Number.isInteger(qty) || qty < 1) {
    return { ok: false, message: "Quantity must be at least 1." };
  }
  const admin = await requireAdmin();
  if ("error" in admin) return { ok: false, message: admin.error };

  const order = await getOrderById(orderId);
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status !== "quote_requested" && order.status !== "quoted") {
    return { ok: false, message: "Only quote-stage orders can have their items edited." };
  }

  try {
    await applyOrderItemQtyChange(orderId, orderItemId, qty, order.status);
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Couldn't update quantity." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

export async function deleteOrderAction(orderId: string): Promise<OrderActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return { ok: false, message: admin.error };

  const order = await getOrderById(orderId);
  if (!order) return { ok: false, message: "Order not found." };

  // Stock was decremented at `paid` (and stays decremented through
  // `finalized`) — restore it before the row (and its items) disappear.
  if (order.status === "paid" || order.status === "finalized") await restockOrder(orderId);

  await db.delete(orders).where(eq(orders.id, orderId));

  revalidatePath("/admin");
  return { ok: true };
}
