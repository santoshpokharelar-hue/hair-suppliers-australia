"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { addresses, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  businessSignupSchema,
  guestSignupSchema,
  loginSchema,
} from "@/lib/validation/auth";

export type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const RATE_LIMIT_MESSAGE: FormState = {
  ok: false,
  message: "Too many attempts — please wait a few minutes and try again.",
};

async function emailTaken(email: string): Promise<boolean> {
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  return Boolean(existing);
}

export async function signUpGuestAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const ip = await getClientIp();
  if (!checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)) return RATE_LIMIT_MESSAGE;

  const parsed = guestSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  if (await emailTaken(data.email)) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(data.password);

  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        role: "guest",
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
      })
      .returning({ id: users.id });

    await tx.insert(addresses).values({
      userId: user.id,
      street: data.street,
      suburb: data.suburb,
      state: data.state,
      postcode: data.postcode,
      isDefault: true,
    });
  });

  return completeSignIn(data.email, data.password);
}

export async function signUpBusinessAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const ip = await getClientIp();
  if (!checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)) return RATE_LIMIT_MESSAGE;

  const parsed = businessSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  if (await emailTaken(data.email)) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(data.password);

  await db.insert(users).values({
    role: "business",
    name: data.name,
    email: data.email,
    phone: data.phone,
    passwordHash,
    businessName: data.businessName,
    abn: data.abn || null,
  });

  return completeSignIn(data.email, data.password);
}

export async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const ip = await getClientIp();
  if (!checkRateLimit(`login:${ip}`, 10, 5 * 60 * 1000)) return RATE_LIMIT_MESSAGE;

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  return completeSignIn(parsed.data.email, parsed.data.password);
}

// Signs the user in and redirects on success. next/navigation's redirect()
// throws internally — it must NOT be caught, so it's called outside try/catch.
async function completeSignIn(email: string, password: string): Promise<FormState> {
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, message: "Invalid email or password." };
    }
    throw err;
  }

  redirect("/");
}

export async function signOutAction(): Promise<void> {
  // signOut() performs its own redirect (and correctly clears the session
  // cookie in the process) — don't pair it with a manual redirect() call.
  await signOut({ redirectTo: "/" });
}
