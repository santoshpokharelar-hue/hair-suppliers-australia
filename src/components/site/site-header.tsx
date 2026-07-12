import Link from "next/link";
import { Leaf, LogOut, Package, Shield, User } from "lucide-react";
import { auth } from "@/auth";
import { CartButton } from "@/components/cart/cart-button";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="sticky top-0 z-50">
      <div className="bg-plum-dark px-3 py-1.5 text-center text-xs tracking-wide text-honey-soft">
        TRADE ONLY · Up to 55% off retail on bulk packs · Ships Australia-wide
      </div>
      <header className="flex flex-wrap items-center gap-4 border-b border-line bg-card px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-[50%_50%_50%_6px] bg-gradient-to-br from-plum to-plum-dark">
            <Leaf className="size-5 text-honey" />
          </span>
          <span>
            <span className="block font-display text-lg font-bold leading-none text-plum-dark">
              Hair Suppliers Australia
            </span>
            <span className="mt-0.5 block text-[10px] font-extrabold tracking-[0.2em] text-honey">
              WHOLESALE PORTAL
            </span>
          </span>
        </Link>
        <div className="flex-1" />
        {user?.role === "admin" && (
          <Button render={<Link href="/admin" />} nativeButton={false} variant="ghost" size="sm">
            <Shield className="size-3.5" /> Admin dashboard
          </Button>
        )}
        {user ? (
          <div className="flex items-center gap-3">
            <Button render={<Link href="/orders" />} nativeButton={false} variant="ghost" size="sm">
              <Package className="size-3.5" /> My orders
            </Button>
            <CartButton />
            <div className="text-right">
              <div className="text-sm font-bold leading-tight">{user.name}</div>
              <div className="text-xs capitalize text-muted-foreground">{user.role} account</div>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="size-3.5" /> Sign out
              </Button>
            </form>
          </div>
        ) : (
          <Button render={<Link href="/login" />} nativeButton={false} size="sm">
            <User className="size-3.5" /> Login to order
          </Button>
        )}
      </header>
    </div>
  );
}
