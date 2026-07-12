import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CartView } from "@/components/cart/cart-view";

export default async function CartPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-9">
      <h1 className="font-display text-2xl font-bold text-plum-dark">Your cart</h1>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">
        Per-unit price updates automatically as quantities cross tier thresholds.
      </p>
      <CartView />
    </div>
  );
}
