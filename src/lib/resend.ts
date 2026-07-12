import { Resend } from "resend";

const globalForResend = globalThis as unknown as { resendClient?: Resend };

// Mirrors the lazy-init pattern in src/db/index.ts — connecting only on
// first use (never at module import time) keeps `next build` working when
// RESEND_API_KEY is unset. Returns null (rather than throwing) so callers
// can fall back to a console-log no-op in local dev, same spirit as the
// AusPost mock fallback that used to live here before it was removed.
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!globalForResend.resendClient) {
    globalForResend.resendClient = new Resend(apiKey);
  }
  return globalForResend.resendClient;
}

export const EMAIL_FROM = process.env.EMAIL_FROM || "orders@hairsuppliers.com.au";
