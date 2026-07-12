import { and, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { QUOTE_EXPIRY_DAYS } from "@/lib/pricing";

// No cron infra here — CLAUDE.md explicitly allows "cron/on-read check" for
// quote expiry, so this runs as a cheap sweep at the top of the pages that
// read order status (admin dashboard, my orders, order detail, pay page)
// rather than needing a scheduled job.
export async function expireStaleQuotes(): Promise<void> {
  const cutoff = new Date(Date.now() - QUOTE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await db
    .update(orders)
    .set({
      status: "quote_requested",
      freightCents: null,
      totalCents: null,
      gstCents: null,
      quotedAt: null,
      quoteToken: null,
    })
    .where(and(eq(orders.status, "quoted"), lt(orders.quotedAt, cutoff)));
}
