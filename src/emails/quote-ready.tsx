import { Heading, Link, Text } from "@react-email/components";
import { ItemsTable, TotalsRow, type EmailLineItem } from "@/emails/components/items-table";
import { EmailLayout } from "@/emails/layout";
import { formatAUD } from "@/lib/format";

export function QuoteReadyEmail({
  orderNumber,
  customerName,
  items,
  subtotalCents,
  freightCents,
  isPickup,
  totalCents,
  payUrl,
}: {
  orderNumber: string;
  customerName: string;
  items: EmailLineItem[];
  subtotalCents: number;
  freightCents: number;
  isPickup: boolean;
  totalCents: number;
  payUrl: string;
}) {
  return (
    <EmailLayout preview={`Your quote is ready — ${orderNumber}`}>
      <Heading style={{ fontSize: 20, margin: "0 0 12px" }}>Your quote is ready, {customerName}</Heading>
      <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
        Order <b>{orderNumber}</b> is priced and ready to pay. This quote is valid for 7 days.
      </Text>
      <ItemsTable items={items} />
      <TotalsRow label="Subtotal" value={formatAUD(subtotalCents)} />
      <TotalsRow label={isPickup ? "Shipping" : "Freight"} value={isPickup ? "Local pickup" : formatAUD(freightCents)} />
      <TotalsRow label="Total (inc. GST)" value={formatAUD(totalCents)} bold />
      <Link
        href={payUrl}
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "12px 22px",
          borderRadius: 8,
          backgroundColor: "#D99C2B",
          color: "#241722",
          fontSize: 14,
          fontWeight: 800,
          textDecoration: "none",
        }}
      >
        Review & pay
      </Link>
    </EmailLayout>
  );
}

export default QuoteReadyEmail;
