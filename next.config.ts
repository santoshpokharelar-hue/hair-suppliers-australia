import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB — too small for product image uploads. Matches the
      // 5MB cap enforced in uploadProductImageAction.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
