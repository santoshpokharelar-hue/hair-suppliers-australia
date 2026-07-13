import { ProductsDashboard } from "@/components/admin/products-dashboard";
import { listAllProductsForAdmin } from "@/lib/queries/products";

export default async function AdminProductsPage() {
  const products = await listAllProductsForAdmin();

  return <ProductsDashboard products={products} />;
}
