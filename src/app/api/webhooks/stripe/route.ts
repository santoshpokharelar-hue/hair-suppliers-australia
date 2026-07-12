import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { sendPaymentReceivedEmail } from "@/lib/email";
import { getOrderById } from "@/lib/queries/orders";
import { getStripeClient } from "@/lib/stripe";

// Stock decrements here (not at quote time) and status is the authoritative
// source of truth for "paid" — the client-side redirect after confirmPayment
// only shows an optimistic banner, it never flips the order itself.
export async function POST(req: Request): Promise<Response> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set — rejecting webhook.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const body = await req.text();

  let event;
  try {
    event = getStripeClient().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;
    if (orderId) await handlePaymentSucceeded(orderId, paymentIntent.id);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(orderId: string, paymentIntentId: string): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) return;
  // Idempotent — Stripe retries webhooks, and a redirect + webhook can race.
  if (order.status === "paid" || order.status === "finalized") return;

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: "paid", paidAt: new Date(), stripePaymentIntentId: paymentIntentId })
      .where(eq(orders.id, orderId));

    for (const item of order.items) {
      await tx
        .update(products)
        .set({ stockQty: sql`${products.stockQty} - ${item.qty}` })
        .where(eq(products.id, item.productId));
    }
  });

  const fullOrder = await getOrderById(orderId);
  if (fullOrder) {
    await sendPaymentReceivedEmail(fullOrder).catch((err) => console.error("Failed to send email:", err));
  }
}
