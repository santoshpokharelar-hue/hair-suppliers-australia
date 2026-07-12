import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses } from "@/db/schema";

export async function getDefaultAddress(userId: string) {
  const [address] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)))
    .limit(1);
  return address ?? null;
}
