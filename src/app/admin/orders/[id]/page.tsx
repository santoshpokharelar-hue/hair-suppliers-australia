import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OrderDetailActions } from "@/components/admin/order-detail-actions";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { getOrderById } from "@/lib/queries/orders";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-plum">
        <ChevronLeft className="size-4" /> Back to dashboard
      </Link>
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-plum-dark">{order.orderNumber}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Placed{" "}
        {new Date(order.placedAt).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })} by{" "}
        {order.user.name} ({order.user.email})
        {order.user.businessName ? ` — ${order.user.businessName}` : ""}
      </p>

      <div className="mb-4 rounded-xl border border-line bg-card p-4">
        <div className="mb-2 text-xs font-bold tracking-wide text-honey">SHIPPING ADDRESS</div>
        <div className="text-sm">
          {order.shippingAddress.street}, {order.shippingAddress.suburb} {order.shippingAddress.state}{" "}
          {order.shippingAddress.postcode}
        </div>
        {order.customerNote && (
          <div className="mt-3 text-sm">
            <span className="font-semibold">Customer note: </span>
            {order.customerNote}
          </div>
        )}
        {order.trackingNumber && (
          <div className="mt-3 text-sm">
            <span className="font-semibold">Tracking: </span>
            {order.trackingNumber}
          </div>
        )}
      </div>

      <OrderDetailActions order={order} />
    </div>
  );
}
