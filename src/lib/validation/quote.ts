import { z } from "zod";

// Shared by client and server. The Server Action must re-validate with this —
// never trust client-side validation alone.

export const quoteItemSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().min(1, "Quantity must be at least 1"),
});

export const quoteRequestSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  suburb: z.string().min(1, "Suburb is required"),
  state: z.string().min(1, "State is required"),
  postcode: z.string().regex(/^\d{4}$/, "Postcode must be 4 digits"),
  customerNote: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, "Your cart is empty"),
});
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
