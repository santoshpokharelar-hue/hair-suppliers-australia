import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import { CustomerOrderDetail } from "@/components/orders/customer-order-detail";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { expireStaleQuotes } from "@/lib/expire-quotes";
import { getOrderById } from "@/lib/queries/orders";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  await expireStaleQuotes();
  const order = await getOrderById(id);
  if (!order || (order.userId !== session.user.id && session.user.role !== "admin")) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <Link href="/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-plum">
        <ChevronLeft className="size-4" /> Back to my orders
      </Link>
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-plum-dark">{order.orderNumber}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Shipping to {order.shippingAddress.street}, {order.shippingAddress.suburb}{" "}
        {order.shippingAddress.state} {order.shippingAddress.postcode}
      </p>

      <CustomerOrderDetail order={order} />
    </div>
  );
}
