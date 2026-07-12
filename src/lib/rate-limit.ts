import { headers } from "next/headers";

// In-memory token bucket — resets on cold start and isn't shared across
// serverless instances, so this is a basic best-effort throttle, not a real
// distributed rate limiter. A production deployment with multiple Vercel
// instances would need a shared store (Upstash Redis, etc.) for this to be
// airtight; flagged here rather than silently pretending it's bulletproof.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
