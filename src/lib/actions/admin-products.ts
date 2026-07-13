"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { products } from "@/db/schema";
import { productSchema, type ProductInput } from "@/lib/validation/product";

export type ProductActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "Forbidden." } as const;
  return {} as const;
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

// foreign_key_violation — thrown by a hard delete when the product is still
// referenced by an order_items row (orders snapshot name/price precisely so
// deleting or editing a product later can't rewrite past order history).
function isForeignKeyViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23503";
}

export async function createProductAction(input: ProductInput): Promise<ProductActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return { ok: false, message: admin.error };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  try {
    await db.insert(products).values({ ...data, imageUrl: data.imageUrl || null });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, fieldErrors: { sku: ["A product with this SKU already exists."] } };
    }
    throw err;
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true };
}

export async function updateProductAction(productId: string, input: ProductInput): Promise<ProductActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return { ok: false, message: admin.error };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  try {
    await db
      .update(products)
      .set({ ...data, imageUrl: data.imageUrl || null })
      .where(eq(products.id, productId));
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, fieldErrors: { sku: ["A product with this SKU already exists."] } };
    }
    throw err;
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true };
}

export async function setProductActiveAction(productId: string, active: boolean): Promise<ProductActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return { ok: false, message: admin.error };

  await db.update(products).set({ active }).where(eq(products.id, productId));

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteProductAction(productId: string): Promise<ProductActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return { ok: false, message: admin.error };

  try {
    await db.delete(products).where(eq(products.id, productId));
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      return {
        ok: false,
        message: "Can't delete — this product is part of existing orders. Deactivate it instead.",
      };
    }
    throw err;
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true };
}
