import { Heading, Text } from "@react-email/components";
import { ItemsTable, type EmailLineItem } from "@/emails/components/items-table";
import { EmailLayout } from "@/emails/layout";

export function QuoteRequestAckEmail({
  orderNumber,
  customerName,
  items,
}: {
  orderNumber: string;
  customerName: string;
  items: EmailLineItem[];
}) {
  return (
    <EmailLayout preview={`We've received your quote request — ${orderNumber}`}>
      <Heading style={{ fontSize: 20, margin: "0 0 12px" }}>Thanks, {customerName} — we&apos;ve got it</Heading>
      <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
        Your quote request <b>{orderNumber}</b> is in. We price freight by hand for every order,
        so we&apos;ll review your items and destination, then email you a final quote — with
        shipping included — that you can pay securely online.
      </Text>
      <ItemsTable items={items} />
    </EmailLayout>
  );
}

export default QuoteRequestAckEmail;
