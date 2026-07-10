import Link from "next/link";
import { Lock, Shield } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

// Placeholder home page for exercising the auth flow in Phase 2. The real
// landing page (hero, lifestyle tiles, product grid, search) is Phase 3.
export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 items-center justify-center bg-paper px-5 py-20">
      <div className="max-w-md text-center">
        <h1 className="font-display text-plum-dark text-3xl font-bold">Hair Suppliers Australia</h1>
        <p className="text-honey mt-1 text-xs font-bold tracking-[0.2em] uppercase">Wholesale Portal</p>

        {session ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm">
              Signed in as <b>{session.user?.email}</b> ({session.user?.role})
            </p>
            {session.user?.role === "admin" && (
              <Button render={<Link href="/admin" />} nativeButton={false} className="w-full justify-center">
                <Shield className="size-4" /> Admin dashboard
              </Button>
            )}
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" className="w-full justify-center">
                Sign out
              </Button>
            </form>
          </div>
        ) : (
          <Button render={<Link href="/login" />} nativeButton={false} className="mt-6 w-full justify-center">
            <Lock className="size-4" /> Login to see prices
          </Button>
        )}
      </div>
    </div>
  );
}
