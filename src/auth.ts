import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validation/auth";

// Full config, only ever loaded in Node runtimes (API routes, Server Actions)
// — this is where the DB-backed Credentials provider lives. middleware.ts
// uses auth.config.ts directly instead, so it never bundles postgres-js.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;
        // Doesn't distinguish this from "wrong password" in the error the
        // customer sees — same generic message, so disabling an account
        // doesn't announce itself to whoever's trying to sign into it.
        if (user.disabled) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
});
