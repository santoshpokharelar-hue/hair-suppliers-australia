import { randomBytes } from "crypto";

// Opaque token for the customer's "review & pay" link (orders.quoteToken).
// Unguessable on its own, but pay/[token] still requires the caller to be
// signed in as the order's owner — see src/app/pay/[token]/page.tsx.
export function generateQuoteToken(): string {
  return randomBytes(24).toString("base64url");
}

export function randomOrderNumber(): string {
  return `HSA-${10000 + Math.floor(Math.random() * 89999)}`;
}

export function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}
