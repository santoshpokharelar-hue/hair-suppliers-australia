import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getStripeClient } from "@/lib/stripe";

type PayableOrder = {
  id: string;
  orderNumber: string;
  totalCents: number | null;
  subtotalCents: number;
  stripePaymentIntentId: string | null;
};

export type PaymentIntentResult = { ok: true; clientSecret: string } | { ok: false; message: string };

// Reuses an existing PaymentIntent (updating its amount if a re-quote
// changed the total) rather than always minting a new one — keeps the
// customer able to retry without abandoning a prior attempt.
export async function getOrCreatePaymentIntentClientSecret(order: PayableOrder): Promise<PaymentIntentResult> {
  const amount = order.totalCents ?? order.subtotalCents;

  try {
    const stripe = getStripeClient();
    let paymentIntent = null;

    if (order.stripePaymentIntentId) {
      try {
        const existing = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
        if (existing.status === "requires_payment_method" || existing.status === "requires_confirmation") {
          paymentIntent = existing.amount === amount ? existing : await stripe.paymentIntents.update(existing.id, { amount });
        }
      } catch (err) {
        // The saved ID can go stale for reasons that have nothing to do with
        // this attempt failing — e.g. it was created under test-mode keys
        // before a switch to live mode, or the PaymentIntent expired/was
        // deleted on Stripe's side. Fall through to minting a fresh one
        // rather than treating that as a hard failure.
        console.error(`Stale stripePaymentIntentId ${order.stripePaymentIntentId} for order ${order.id}, creating a new one:`, err);
      }
    }

    if (!paymentIntent) {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "aud",
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
      });
      await db.update(orders).set({ stripePaymentIntentId: paymentIntent.id }).where(eq(orders.id, order.id));
    }

    if (!paymentIntent.client_secret) {
      return { ok: false, message: "Couldn't start payment — please try again." };
    }
    return { ok: true, clientSecret: paymentIntent.client_secret };
  } catch (err) {
    console.error("Stripe error creating PaymentIntent:", err);
    return { ok: false, message: "Payments aren't available right now — please try again shortly." };
  }
}
