// The Session/User/JWT interfaces are declared in @auth/core, and next-auth
// only re-exports the types (not the interfaces) — so declaration merging
// has to target @auth/core directly, not "next-auth" / "next-auth/jwt".
import type { DefaultSession } from "@auth/core/types";

type Role = "guest" | "business" | "admin";

declare module "@auth/core/types" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
    id?: string;
  }
}
