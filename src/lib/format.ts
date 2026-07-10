// The ONLY place money is formatted for display. Amounts are always integer cents, AUD.
export function formatAUD(cents: number): string {
  return (cents / 100).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
  });
}
