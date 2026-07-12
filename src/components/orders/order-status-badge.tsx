import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/db/schema";

const LABELS: Record<OrderStatus, string> = {
  quote_requested: "Quote requested",
  quoted: "Quoted — awaiting payment",
  paid: "Paid",
  finalized: "Finalized",
  cancelled: "Cancelled",
};

const VARIANTS: Record<OrderStatus, "secondary" | "default" | "outline" | "destructive"> = {
  quote_requested: "secondary",
  quoted: "outline",
  paid: "default",
  finalized: "default",
  cancelled: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
