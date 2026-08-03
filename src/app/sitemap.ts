import type { MetadataRoute } from "next";
import { listActiveProductIds } from "@/lib/queries/products";
import { getSiteUrl } from "@/lib/site-url";

// Products are added/deactivated live through /admin/products, independent
// of code deploys — a build-time-static sitemap would go stale between
// deploys, so this must be regenerated per-request instead.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const activeProducts = await listActiveProductIds();

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    ...activeProducts.map(({ id }) => ({
      url: `${baseUrl}/products/${id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
