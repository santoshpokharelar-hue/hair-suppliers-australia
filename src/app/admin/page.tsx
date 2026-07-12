import { Shield } from "lucide-react";
import { AdminOrdersDashboard } from "@/components/admin/admin-orders-dashboard";
import { expireStaleQuotes } from "@/lib/expire-quotes";
import { listAllOrders } from "@/lib/queries/orders";

// Reachable only because middleware.ts already verified role === "admin" for
// everything under /admin.
export default async function AdminPage() {
  await expireStaleQuotes();
  const orders = await listAllOrders();

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-1 flex items-center gap-2.5">
        <Shield className="size-6 text-plum" />
        <h1 className="font-display text-2xl font-bold text-plum-dark">Admin dashboard</h1>
      </div>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Review quote requests, price freight, and track orders through to fulfilment.
      </p>
      <AdminOrdersDashboard orders={orders} />
    </div>
  );
}
