import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { expireStaleQuotes } from "@/lib/expire-quotes";
import { formatAUD } from "@/lib/format";
import { getOrdersForUser } from "@/lib/queries/orders";

export default async function MyOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await expireStaleQuotes();
  const orders = await getOrdersForUser(session.user.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <h1 className="font-display text-2xl font-bold text-plum-dark">My orders</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">Track your quotes and past orders.</p>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-card p-10 text-center text-muted-foreground">
          You haven&apos;t placed any orders yet.
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="ml-2.5"
          >
            Browse catalogue
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-3.5 hover:border-plum"
            >
              <div className="min-w-[120px]">
                <div className="font-display text-sm font-bold text-plum-dark">{order.orderNumber}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(order.placedAt).toLocaleDateString("en-AU", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="flex-1 text-xs text-muted-foreground">
                {order.items.length} item{order.items.length === 1 ? "" : "s"}
              </div>
              <div className="w-24 text-right text-sm font-bold">
                {formatAUD(order.totalCents ?? order.subtotalCents)}
              </div>
              <OrderStatusBadge status={order.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
