"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { sendOrderCancelledEmail } from "@/lib/email";
import { applyOrderItemQtyChange } from "@/lib/order-items-recompute";
import { getOrderById } from "@/lib/queries/orders";

export type OrderActionState = { ok: boolean; message?: string };

const EDITABLE_STATUSES = new Set(["quote_requested", "quoted"]);

async function loadOwnEditableOrder(orderId: string) {
  const session = await auth();
  if (!session?.user) return { error: "You must be signed in." } as const;

  const order = await getOrderById(orderId);
  if (!order || order.userId !== session.user.id) return { error: "Order not found." } as const;
  if (!EDITABLE_STATUSES.has(order.status)) {
    return { error: "This order can no longer be edited — it's already been paid." } as const;
  }
  return { order } as const;
}

export async function updateOrderItemQtyAction(
  orderId: string,
  orderItemId: string,
  qty: number
): Promise<OrderActionState> {
  if (!Number.isInteger(qty) || qty < 1) {
    return { ok: false, message: "Quantity must be at least 1." };
  }
  const check = await loadOwnEditableOrder(orderId);
  if ("error" in check) return { ok: false, message: check.error };

  try {
    await applyOrderItemQtyChange(orderId, orderItemId, qty, check.order.status);
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Couldn't update quantity." };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}

export async function cancelOrderAction(orderId: string): Promise<OrderActionState> {
  const check = await loadOwnEditableOrder(orderId);
  if ("error" in check) return { ok: false, message: check.error };

  await db
    .update(orders)
    .set({ status: "cancelled", cancelledAt: new Date(), cancelReason: "Cancelled by customer" })
    .where(eq(orders.id, orderId));

  const fullOrder = await getOrderById(orderId);
  if (fullOrder) {
    await sendOrderCancelledEmail(fullOrder).catch((err) => console.error("Failed to send email:", err));
  }

  revalidatePath("/orders");
  return { ok: true };
}
