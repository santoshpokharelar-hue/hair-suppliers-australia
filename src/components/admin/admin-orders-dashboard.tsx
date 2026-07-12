"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrderStatus } from "@/db/schema";
import { formatAUD } from "@/lib/format";
import type { listAllOrders } from "@/lib/queries/orders";

type Order = Awaited<ReturnType<typeof listAllOrders>>[number];

const STATUS_TABS: { value: OrderStatus; label: string }[] = [
  { value: "quote_requested", label: "Quote requests" },
  { value: "quoted", label: "Quoted" },
  { value: "paid", label: "Paid" },
  { value: "finalized", label: "Finalized" },
  { value: "cancelled", label: "Cancelled" },
];

export function AdminOrdersDashboard({ orders }: { orders: Order[] }) {
  const [tab, setTab] = useState<OrderStatus>("quote_requested");

  const grouped = useMemo(() => {
    const map: Record<OrderStatus, Order[]> = {
      quote_requested: [],
      quoted: [],
      paid: [],
      finalized: [],
      cancelled: [],
    };
    for (const order of orders) map[order.status].push(order);
    return map;
  }, [orders]);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as OrderStatus)}>
      <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
        {STATUS_TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
            {t.label}
            <Badge variant="secondary" className="ml-0.5">
              {grouped[t.value].length}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      {STATUS_TABS.map((t) => (
        <TabsContent key={t.value} value={t.value} className="mt-4">
          <OrderList orders={grouped[t.value]} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function OrderList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-card p-8 text-center text-sm text-muted-foreground">
        No orders here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/admin/orders/${order.id}`}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-3.5 hover:border-plum"
        >
          <div className="min-w-[140px]">
            <div className="font-display text-sm font-bold text-plum-dark">{order.orderNumber}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(order.placedAt).toLocaleDateString("en-AU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="min-w-[160px] flex-1">
            <div className="text-sm font-semibold">{order.user.businessName || order.user.name}</div>
            <div className="text-xs capitalize text-muted-foreground">{order.user.role} account</div>
          </div>
          <div className="text-xs text-muted-foreground">
            {order.items.length} item{order.items.length === 1 ? "" : "s"}
          </div>
          <div className="w-24 text-right text-sm font-bold">
            {formatAUD(order.totalCents ?? order.subtotalCents)}
          </div>
          <OrderStatusBadge status={order.status} />
        </Link>
      ))}
    </div>
  );
}
