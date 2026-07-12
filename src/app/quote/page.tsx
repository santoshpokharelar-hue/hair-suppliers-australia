import { redirect } from "next/navigation";
import { Truck } from "lucide-react";
import { auth } from "@/auth";

// Placeholder — the real quote request flow (shipping address step with
// AusPost lookup, writing the order + order_items as `quote_requested`,
// admin notification email) is Phase 5. This just proves the route is
// reachable only when signed in, matching the cart's CTA target.
export default async function QuotePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-1 flex items-center gap-2.5">
        <Truck className="size-6 text-plum" />
        <h1 className="font-display text-2xl font-bold text-plum-dark">Request a quote</h1>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as {session.user.email}. The shipping address step and quote submission land
        in a later phase — this placeholder just proves the cart&apos;s &quot;Get final quote
        with shipping&quot; button reaches a real, signed-in-only route.
      </p>
    </div>
  );
}
