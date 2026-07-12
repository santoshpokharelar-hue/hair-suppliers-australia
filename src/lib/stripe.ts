import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { stripeClient?: Stripe };

// Lazy-init, mirroring src/db/index.ts — avoids crashing `next build` when
// STRIPE_SECRET_KEY is unset (e.g. this hasn't been wired up with real keys
// yet). Only throws once something actually tries to call the Stripe API.
export function getStripeClient(): Stripe {
  if (!globalForStripe.stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
    globalForStripe.stripeClient = new Stripe(key);
  }
  return globalForStripe.stripeClient;
}
