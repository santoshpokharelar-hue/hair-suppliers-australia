import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Session/account-specific pages — nothing here is useful to index,
      // and /pay/[token] links shouldn't be crawled at all even though
      // they're already access-controlled by login + ownership.
      disallow: ["/admin", "/api", "/cart", "/orders", "/pay", "/quote"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
