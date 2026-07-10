import type { NextAuthConfig } from "next-auth";

// Edge-safe subset of the Auth.js config — used directly by middleware.ts.
// Must NOT import anything that touches the DB (postgres-js isn't
// Edge-Runtime compatible), which is why the Credentials provider itself
// lives only in auth.ts, not here.
export default {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
