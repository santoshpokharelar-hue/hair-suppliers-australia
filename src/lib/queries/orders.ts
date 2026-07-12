import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, type OrderStatus } from "@/db/schema";

export async function listAllOrders() {
  return db.query.orders.findMany({
    with: { user: true, items: true },
    orderBy: [desc(orders.placedAt)],
  });
}

export async function getOrderStatusCounts(): Promise<Record<OrderStatus, number>> {
  const rows = await db
    .select({ status: orders.status, count: sql<number>`count(*)::int` })
    .from(orders)
    .groupBy(orders.status);

  const counts: Record<OrderStatus, number> = {
    quote_requested: 0,
    quoted: 0,
    paid: 0,
    finalized: 0,
    cancelled: 0,
  };
  for (const row of rows) counts[row.status] = row.count;
  return counts;
}

export async function getOrderById(id: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { user: true, items: true },
  });
}

export async function getOrderByQuoteToken(token: string) {
  return db.query.orders.findFirst({
    where: eq(orders.quoteToken, token),
    with: { items: true, user: true },
  });
}

export async function getOrdersForUser(userId: string) {
  return db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: { items: true },
    orderBy: [desc(orders.placedAt)],
  });
}
