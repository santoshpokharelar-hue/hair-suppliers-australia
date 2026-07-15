"use client";

import { Loader2, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { ProductArt } from "@/components/catalogue/product-art";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import type { products } from "@/db/schema";
import { formatAUD } from "@/lib/format";

type Product = typeof products.$inferSelect;

export function ProductsDashboard({ products: initialProducts }: { products: Product[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialProducts;
    return initialProducts.filter((p) =>
      [p.name, p.brand, p.category, p.sku].some((field) => field.toLowerCase().includes(q))
    );
  }, [initialProducts, query]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {filtered.length === initialProducts.length
            ? `${initialProducts.length} products`
            : `${filtered.length} of ${initialProducts.length} products`}
        </span>
        <ProductFormDialog />
      </div>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, brand, category or SKU…"
          className="pl-9"
        />
      </div>

      {error && <p className="mb-3 text-sm font-medium text-destructive">{error}</p>}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-card p-10 text-center text-sm text-muted-foreground">
          No products match &quot;{query}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-xl border border-line bg-card"
            >
              <ProductArt
                brand={product.brand}
                imageUrl={product.imageUrl}
                className="h-28 rounded-t-xl"
                iconClassName="size-8"
              />
              <div className="flex flex-1 flex-col gap-1.5 p-3">
                <div className="line-clamp-2 text-sm font-semibold leading-snug text-plum-dark">
                  {product.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  SKU {product.sku} · {product.brand}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-plum-dark">{formatAUD(product.retailPriceCents)}</span>
                  <span className="text-muted-foreground">Stock {product.stockQty}</span>
                </div>
                <Badge variant={product.active ? "default" : "secondary"} className="w-fit">
                  {product.active ? "Active" : "Inactive"}
                </Badge>

                <div className="mt-auto flex flex-wrap items-center gap-1 pt-2">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
