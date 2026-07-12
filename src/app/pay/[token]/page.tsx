import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { PaymentForm } from "@/components/payment/payment-form";
import { formatAUD } from "@/lib/format";
import { getOrCreatePaymentIntentClientSecret } from "@/lib/payment";
import { isQuoteExpired } from "@/lib/pricing";
import { getOrderByQuoteToken } from "@/lib/queries/orders";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ redirect_status?: string }>;
}) {
  const { token } = await params;
  const { redirect_status } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const order = await getOrderByQuoteToken(token);
  // Hide existence rather than 403 when the token is wrong or belongs to
  // someone else — same "don't leak what exists" posture as /admin.
  if (!order || (order.userId !== session.user.id && session.user.role !== "admin")) notFound();

  const expired = isQuoteExpired(order.quotedAt);

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-9">
      <h1 className="font-display text-2xl font-bold text-plum-dark">Review & pay</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">Order {order.orderNumber}</p>

      {redirect_status === "succeeded" ? (
        <div className="rounded-2xl border border-line bg-card p-9 text-center">
          <CheckCircle2 className="mx-auto mb-3 size-8 text-success" />
          <div className="font-display text-lg font-bold text-plum-dark">Payment received</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Thanks! We&apos;re confirming this with Stripe now — you&apos;ll get an email receipt
            shortly.
          </p>
        </div>
      ) : order.status === "paid" || order.status === "finalized" ? (
        <div className="rounded-xl border border-dashed border-line bg-card p-8 text-center text-muted-foreground">
          This order has already been paid.
        </div>
      ) : order.status !== "quoted" ? (
        <div className="rounded-xl border border-dashed border-line bg-card p-8 text-center text-muted-foreground">
          This quote is no longer payable.
        </div>
      ) : expired ? (
        <div className="rounded-xl border border-dashed border-line bg-card p-8 text-center text-muted-foreground">
          This quote has expired. Please contact us or submit a new quote request.
        </div>
      ) : (
        <PayableQuote order={order} />
      )}
    </div>
  );
}

async function PayableQuote({ order }: { order: NonNullable<Awaited<ReturnType<typeof getOrderByQuoteToken>>> }) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return (
    <>
      <div className="mb-5 rounded-xl border border-line bg-card p-4">
        {order.items.map((item) => (
          <div key={item.id} className="mb-2 flex justify-between gap-3 text-sm">
            <span>
              {item.qty} × {item.nameSnapshot}
            </span>
            <span className="shrink-0 font-semibold">{formatAUD(item.lineTotalCents)}</span>
          </div>
        ))}
        <div className="mt-3 space-y-1 border-t border-line pt-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatAUD(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{order.isPickup ? "Shipping" : "Freight"}</span>
            <span>{order.isPickup ? "Local pickup" : formatAUD(order.freightCents ?? 0)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total (inc. GST)</span>
            <span>{formatAUD(order.totalCents ?? order.subtotalCents)}</span>
          </div>
        </div>
      </div>

      {!publishableKey ? (
        <div className="rounded-xl border border-dashed border-line bg-card p-6 text-center text-sm text-muted-foreground">
          Online payment isn&apos;t configured yet — reply to your quote email and we&apos;ll take
          payment another way.
        </div>
      ) : (
        <PaymentGate order={order} publishableKey={publishableKey} />
      )}
    </>
  );
}

async function PaymentGate({
  order,
  publishableKey,
}: {
  order: NonNullable<Awaited<ReturnType<typeof getOrderByQuoteToken>>>;
  publishableKey: string;
}) {
  const result = await getOrCreatePaymentIntentClientSecret(order);
  if (!result.ok) {
    return <p className="text-sm font-medium text-destructive">{result.message}</p>;
  }
  return (
    <PaymentForm
      clientSecret={result.clientSecret}
      publishableKey={publishableKey}
      returnPath={`/pay/${order.quoteToken}`}
    />
  );
}
