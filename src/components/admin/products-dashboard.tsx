"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteProductAction, setProductActiveAction } from "@/lib/actions/admin-products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import type { products } from "@/db/schema";
import { formatAUD } from "@/lib/format";

type Product = typeof products.$inferSelect;

export function ProductsDashboard({ products: initialProducts }: { products: Product[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{initialProducts.length} products</span>
        <ProductFormDialog />
      </div>

      {error && <p className="mb-3 text-sm font-medium text-destructive">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">Brand</th>
              <th className="px-3 py-2 text-right font-medium">Price</th>
              <th className="px-3 py-2 text-right font-medium">Stock</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {initialProducts.map((product) => (
              <tr key={product.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    SKU {product.sku} · {product.category}
                  </div>
                </td>
                <td className="px-3 py-2">{product.brand}</td>
                <td className="px-3 py-2 text-right">{formatAUD(product.retailPriceCents)}</td>
                <td className="px-3 py-2 text-right">{product.stockQty}</td>
                <td className="px-3 py-2">
                  <Badge variant={product.active ? "default" : "secondary"}>
                    {product.active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1.5">
                    <ProductFormDialog product={product} />
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await setProductActiveAction(product.id, !product.active);
                          if (!res.ok) setError(res.message || "Something went wrong.");
                        })
                      }
                    >
                      {product.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Dialog>
                      <DialogTrigger
                        render={
                          <Button variant="ghost" size="sm" disabled={pending} className="text-destructive">
                            <Trash2 className="size-3.5" />
                          </Button>
                        }
                      />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete {product.sku}?</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                          This can&apos;t be undone. If this product is part of any existing order,
                          deletion will be blocked — deactivate it instead.
                        </p>
                        <DialogFooter>
                          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                          <DialogClose
                            render={
                              <Button
                                variant="destructive"
                                disabled={pending}
                                onClick={() =>
                                  startTransition(async () => {
                                    const res = await deleteProductAction(product.id);
                                    if (!res.ok) setError(res.message || "Something went wrong.");
                                  })
                                }
                              >
                                {pending && <Loader2 className="size-4 animate-spin" />} Delete
                              </Button>
                            }
                          />
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
