import { Heading, Link, Text } from "@react-email/components";
import { ItemsTable, type EmailLineItem } from "@/emails/components/items-table";
import { EmailLayout } from "@/emails/layout";
import { formatAUD } from "@/lib/format";
import type { ShippingAddressSnapshot } from "@/db/schema";

export function AdminNewQuoteRequestEmail({
  orderNumber,
  customerName,
  customerEmail,
  shippingAddress,
  customerNote,
  items,
  subtotalCents,
  adminUrl,
}: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddressSnapshot;
  customerNote: string | null;
  items: EmailLineItem[];
  subtotalCents: number;
  adminUrl: string;
}) {
  return (
    <EmailLayout preview={`New quote request ${orderNumber} from ${customerName}`}>
      <Heading style={{ fontSize: 20, margin: "0 0 12px" }}>New quote request — {orderNumber}</Heading>
      <Text style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 4px" }}>
        <b>{customerName}</b> ({customerEmail}) — subtotal {formatAUD(subtotalCents)}
      </Text>
      <Text style={{ fontSize: 13, color: "#8a7d72", margin: "0 0 16px" }}>
        Ships to: {shippingAddress.street}, {shippingAddress.suburb} {shippingAddress.state}{" "}
        {shippingAddress.postcode}
      </Text>
      {customerNote && (
        <Text style={{ fontSize: 13, margin: "0 0 16px", fontStyle: "italic" }}>
          Note from customer: &quot;{customerNote}&quot;
        </Text>
      )}
      <ItemsTable items={items} />
      <Link
        href={adminUrl}
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "10px 18px",
          borderRadius: 8,
          backgroundColor: "#5C2E4E",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Price freight & send quote
      </Link>
    </EmailLayout>
  );
}

export default AdminNewQuoteRequestEmail;
