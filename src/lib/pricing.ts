// The ONLY place wholesale tier math lives. Client code may use this to render
// live previews, but the server must recompute every line price at checkout —
// never trust a price submitted from the client.

export type PricingTier = {
  label: string;
  range: string;
  min: number;
  offPercent: number; // 0, 30, 45 or 55
};

export const PRICING_TIERS: readonly PricingTier[] = [
  { label: "Pack of 1", range: "1–5 units", min: 1, offPercent: 0 },
  { label: "Pack of 6", range: "6–11 units", min: 6, offPercent: 30 },
  { label: "Pack of 12–48", range: "12–48 units", min: 12, offPercent: 45 },
  { label: "48+ bulk", range: "49+ units", min: 49, offPercent: 55 },
] as const;

export function tierIndexOf(qty: number): number {
  if (qty >= 49) return 3;
  if (qty >= 12) return 2;
  if (qty >= 6) return 1;
  return 0;
}

export function unitPriceCents(retailCents: number, qty: number): number {
  const off = qty >= 49 ? 0.55 : qty >= 12 ? 0.45 : qty >= 6 ? 0.3 : 0;
  return Math.round(retailCents * (1 - off));
}

export function lineTotalCents(retailCents: number, qty: number): number {
  return unitPriceCents(retailCents, qty) * qty;
}

// Prices are GST-inclusive (AUD). Returns the GST component embedded in a
// GST-inclusive amount, for display on tax invoices. Rounded to the nearest cent.
export function gstComponentCents(inclusiveCents: number): number {
  return Math.round(inclusiveCents / 11);
}

// There is no flat/computed shipping fee — freight is priced manually by admin
// per order (see the quote-then-pay flow in CLAUDE.md) and never shown as a
// number before the customer receives a quote.

export const QUOTE_EXPIRY_DAYS = 7;

export function isQuoteExpired(quotedAt: Date | string | null): boolean {
  if (!quotedAt) return false;
  const quotedAtMs = new Date(quotedAt).getTime();
  const expiryMs = quotedAtMs + QUOTE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() > expiryMs;
}
