"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise(publishableKey: string) {
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

export function PaymentForm({
  clientSecret,
  publishableKey,
  returnPath,
}: {
  clientSecret: string;
  publishableKey: string;
  returnPath: string;
}) {
  return (
    <Elements stripe={getStripePromise(publishableKey)} options={{ clientSecret }}>
      <CheckoutForm returnPath={returnPath} />
    </Elements>
  );
}

function CheckoutForm({ returnPath }: { returnPath: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}${returnPath}` },
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
      <Button type="submit" disabled={!stripe || submitting} className="mt-4 w-full justify-center">
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitting ? "Processing…" : "Pay now"}
      </Button>
    </form>
  );
}
