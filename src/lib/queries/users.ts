import { desc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

// Explicit column list — never select passwordHash out to a page/component.
export async function listAllUsers() {
  return db
    .select({
      id: users.id,
      role: users.role,
      name: users.name,
      email: users.email,
      phone: users.phone,
      businessName: users.businessName,
      abn: users.abn,
      disabled: users.disabled,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}
