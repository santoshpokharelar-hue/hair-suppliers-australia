import { z } from "zod";

// Shared by client and server. Server Actions must re-validate with these —
// never trust client-side validation alone.

const email = z.string().min(1, "Email is required").email("Enter a valid email address");
const password = z.string().min(8, "Password must be at least 8 characters");
const name = z.string().min(1, "Full name is required");
const phone = z.string().min(1, "Phone is required");
const postcode = z.string().regex(/^\d{4}$/, "Postcode must be 4 digits");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const guestSignupSchema = z
  .object({
    name,
    email,
    phone,
    password,
    confirmPassword: z.string(),
    street: z.string().min(1, "Street address is required"),
    suburb: z.string().min(1, "Suburb is required"),
    state: z.string().min(1, "State is required"),
    postcode,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type GuestSignupInput = z.infer<typeof guestSignupSchema>;

export const businessSignupSchema = z
  .object({
    name,
    email,
    phone,
    password,
    confirmPassword: z.string(),
    businessName: z.string().min(1, "Business name is required"),
    // Optional, free-text — no checksum or ABR verification (see CLAUDE.md).
    abn: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type BusinessSignupInput = z.infer<typeof businessSignupSchema>;
