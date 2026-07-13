import { z } from "zod";

// Shared by client and server. The Server Action must re-validate with
// this — never trust client-side validation alone.
export const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  retailPriceCents: z.number().int().min(0, "Price can't be negative"),
  stockQty: z.number().int().min(0, "Stock can't be negative"),
  imageUrl: z.string().optional(),
  active: z.boolean(),
});
export type ProductInput = z.infer<typeof productSchema>;
