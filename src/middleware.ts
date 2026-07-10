import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

// Uses the edge-safe config directly (not the full auth.ts, which pulls in
// postgres-js via the Credentials provider and isn't Edge-Runtime compatible).
// Middleware only reads the JWT session here — it never calls authorize().
const { auth } = NextAuth(authConfig);

// Non-admins get a 404, not a redirect/403, so the dashboard's existence is
// hidden. Rewriting to a path with no matching route makes Next.js render
// its not-found boundary with a real 404 status.
export default auth((req) => {
  const role = req.auth?.user?.role;
  if (role !== "admin") {
    return NextResponse.rewrite(new URL("/admin-route-does-not-exist", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
