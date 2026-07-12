import type { ReactNode } from "react";
import type { ShippingAddressSnapshot } from "@/db/schema";
import { AdminNewQuoteRequestEmail } from "@/emails/admin-new-quote-request";
import type { EmailLineItem } from "@/emails/components/items-table";
import { OrderCancelledEmail } from "@/emails/order-cancelled";
import { OrderFinalizedEmail } from "@/emails/order-finalized";
import { PaymentReceivedEmail } from "@/emails/payment-received";
import { QuoteReadyEmail } from "@/emails/quote-ready";
import { QuoteRequestAckEmail } from "@/emails/quote-request-ack";
import { EMAIL_FROM, getResendClient } from "@/lib/resend";
import { getSiteUrl } from "@/lib/site-url";

// Order shape shared by every email helper below — matches what
// getOrderById/getOrderByQuoteToken return (relational query with items+user).
export type EmailOrder = {
  orderNumber: string;
  subtotalCents: number;
  freightCents: number | null;
  totalCents: number | null;
  isPickup: boolean;
  customerNote: string | null;
  trackingNumber: string | null;
  cancelReason: string | null;
  quoteToken: string | null;
  shippingAddress: ShippingAddressSnapshot;
  items: EmailLineItem[];
  user: { name: string; email: string };
};

async function send(to: string, subject: string, react: ReactNode): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.log(`[email:mock] to=${to} subject="${subject}" — RESEND_API_KEY not set, email not actually sent.`);
    return;
  }
  try {
    const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, react });
    if (error) console.error("Failed to send email:", error);
  } catch (err) {
    // A failed email should never fail the order mutation that triggered it.
    console.error("Failed to send email:", err);
  }
}

export async function sendQuoteRequestAckEmail(order: EmailOrder): Promise<void> {
  await send(
    order.user.email,
    `We've received your quote request — ${order.orderNumber}`,
    <QuoteRequestAckEmail orderNumber={order.orderNumber} customerName={order.user.name} items={order.items} />
  );
}

export async function sendAdminNewQuoteRequestEmail(order: EmailOrder): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  await send(
    adminEmail,
    `New quote request ${order.orderNumber}`,
    <AdminNewQuoteRequestEmail
      orderNumber={order.orderNumber}
      customerName={order.user.name}
      customerEmail={order.user.email}
      shippingAddress={order.shippingAddress}
      customerNote={order.customerNote}
      items={order.items}
      subtotalCents={order.subtotalCents}
      adminUrl={`${getSiteUrl()}/admin`}
    />
  );
}

export async function sendQuoteReadyEmail(order: EmailOrder): Promise<void> {
  await send(
    order.user.email,
    `Your quote is ready — ${order.orderNumber}`,
    <QuoteReadyEmail
      orderNumber={order.orderNumber}
      customerName={order.user.name}
      items={order.items}
      subtotalCents={order.subtotalCents}
      freightCents={order.freightCents ?? 0}
      isPickup={order.isPickup}
      totalCents={order.totalCents ?? order.subtotalCents}
      payUrl={`${getSiteUrl()}/pay/${order.quoteToken}`}
    />
  );
}

export async function sendPaymentReceivedEmail(order: EmailOrder): Promise<void> {
  await send(
    order.user.email,
    `Payment received — ${order.orderNumber}`,
    <PaymentReceivedEmail
      orderNumber={order.orderNumber}
      customerName={order.user.name}
      items={order.items}
      subtotalCents={order.subtotalCents}
      freightCents={order.freightCents ?? 0}
      isPickup={order.isPickup}
      totalCents={order.totalCents ?? order.subtotalCents}
    />
  );
}

export async function sendOrderFinalizedEmail(order: EmailOrder): Promise<void> {
  await send(
    order.user.email,
    `Your order has shipped — ${order.orderNumber}`,
    <OrderFinalizedEmail
      orderNumber={order.orderNumber}
      customerName={order.user.name}
      trackingNumber={order.trackingNumber}
    />
  );
}

export async function sendOrderCancelledEmail(order: EmailOrder): Promise<void> {
  await send(
    order.user.email,
    `Order cancelled — ${order.orderNumber}`,
    <OrderCancelledEmail
      orderNumber={order.orderNumber}
      customerName={order.user.name}
      cancelReason={order.cancelReason}
    />
  );
}
