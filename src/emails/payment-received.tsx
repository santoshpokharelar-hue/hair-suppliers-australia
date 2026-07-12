import { Heading, Text } from "@react-email/components";
import { ItemsTable, TotalsRow, type EmailLineItem } from "@/emails/components/items-table";
import { EmailLayout } from "@/emails/layout";
import { formatAUD } from "@/lib/format";

export function PaymentReceivedEmail({
  orderNumber,
  customerName,
  items,
  subtotalCents,
  freightCents,
  isPickup,
  totalCents,
}: {
  orderNumber: string;
  customerName: string;
  items: EmailLineItem[];
  subtotalCents: number;
  freightCents: number;
  isPickup: boolean;
  totalCents: number;
}) {
  return (
    <EmailLayout preview={`Payment received — ${orderNumber}`}>
      <Heading style={{ fontSize: 20, margin: "0 0 12px" }}>Payment received, {customerName}</Heading>
      <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
        Thanks — order <b>{orderNumber}</b> is paid and confirmed. We&apos;ll email you again with
        tracking once it ships.
      </Text>
      <ItemsTable items={items} />
      <TotalsRow label="Subtotal" value={formatAUD(subtotalCents)} />
      <TotalsRow label={isPickup ? "Shipping" : "Freight"} value={isPickup ? "Local pickup" : formatAUD(freightCents)} />
      <TotalsRow label="Total paid (inc. GST)" value={formatAUD(totalCents)} bold />
    </EmailLayout>
  );
}

export default PaymentReceivedEmail;
