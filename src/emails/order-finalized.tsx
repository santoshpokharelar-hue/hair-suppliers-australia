import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "@/emails/layout";

export function OrderFinalizedEmail({
  orderNumber,
  customerName,
  trackingNumber,
}: {
  orderNumber: string;
  customerName: string;
  trackingNumber: string | null;
}) {
  return (
    <EmailLayout preview={`Your order has shipped — ${orderNumber}`}>
      <Heading style={{ fontSize: 20, margin: "0 0 12px" }}>On its way, {customerName}</Heading>
      <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
        Order <b>{orderNumber}</b> has shipped.
        {trackingNumber ? (
          <>
            {" "}
            Tracking number: <b>{trackingNumber}</b>.
          </>
        ) : (
          " We'll follow up with tracking details if a courier number becomes available."
        )}
      </Text>
    </EmailLayout>
  );
}

export default OrderFinalizedEmail;
