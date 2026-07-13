import { AdminOrdersDashboard } from "@/components/admin/admin-orders-dashboard";
import { expireStaleQuotes } from "@/lib/expire-quotes";
import { listAllOrders } from "@/lib/queries/orders";

export default async function AdminOrdersPage() {
  await expireStaleQuotes();
  const orders = await listAllOrders();

  return <AdminOrdersDashboard orders={orders} />;
}
