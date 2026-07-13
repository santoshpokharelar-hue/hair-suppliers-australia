"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export type UserActionState = { ok: boolean; message?: string };

export async function setUserDisabledAction(userId: string, disabled: boolean): Promise<UserActionState> {
  const session = await auth();
  if (session?.user?.role !== "admin") return { ok: false, message: "Forbidden." };
  if (session.user.id === userId) {
    return { ok: false, message: "You can't disable your own account." };
  }

  await db.update(users).set({ disabled }).where(eq(users.id, userId));

  revalidatePath("/admin/users");
  return { ok: true };
}
