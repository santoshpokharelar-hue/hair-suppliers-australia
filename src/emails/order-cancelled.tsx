import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "@/emails/layout";

export function OrderCancelledEmail({
  orderNumber,
  customerName,
  cancelReason,
}: {
  orderNumber: string;
  customerName: string;
  cancelReason: string | null;
}) {
  return (
    <EmailLayout preview={`Order cancelled — ${orderNumber}`}>
      <Heading style={{ fontSize: 20, margin: "0 0 12px" }}>Order cancelled</Heading>
      <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
        Hi {customerName}, order <b>{orderNumber}</b> has been cancelled.
        {cancelReason ? ` Reason: ${cancelReason}` : ""}
      </Text>
      <Text style={{ fontSize: 13, color: "#8a7d72" }}>
        If this doesn&apos;t look right, just reply to this email and we&apos;ll sort it out.
      </Text>
    </EmailLayout>
  );
}

export default OrderCancelledEmail;
