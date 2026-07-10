import { Shield } from "lucide-react";
import { auth } from "@/auth";

// Reachable only because middleware.ts already verified role === "admin" for
// everything under /admin — this page doesn't need to re-check, but session
// data is still read normally by anything nested here.
export default async function AdminPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-1 flex items-center gap-2.5">
        <Shield className="text-plum size-6" />
        <h1 className="font-display text-plum-dark text-2xl font-bold">Admin dashboard</h1>
      </div>
      <p className="text-muted-foreground mt-2 text-sm">
        Signed in as {session?.user?.email}. Full tabbed order lists (quote requests / quoted /
        paid / finalized / cancelled) land in a later phase — this placeholder just proves the
        `/admin` route is locked to the admin role.
      </p>
    </div>
  );
}
