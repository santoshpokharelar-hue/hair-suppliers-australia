"use client";

import { ImageUp, Loader2, Pencil, Plus } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import {
  createProductAction,
  updateProductAction,
  uploadProductImageAction,
  type ProductActionState,
} from "@/lib/actions/admin-products";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { products } from "@/db/schema";

type Product = typeof products.$inferSelect;

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{messages[0]}</p>;
}

export function ProductFormDialog({ product }: { product?: Product }) {
  const isEdit = Boolean(product);
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState(product?.sku ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [priceDollars, setPriceDollars] = useState(
    product ? (product.retailPriceCents / 100).toFixed(2) : ""
  );
  const [stockQty, setStockQty] = useState(product ? String(product.stockQty) : "0");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [result, setResult] = useState<ProductActionState | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError("");
    startUpload(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const res = await uploadProductImageAction(formData);
      if (res.ok) {
        setImageUrl(res.url);
      } else {
        setUploadError(res.message);
      }
    });
  }

  function submit() {
    const input = {
      sku: sku.trim(),
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim(),
      retailPriceCents: Math.round(parseFloat(priceDollars || "0") * 100),
      stockQty: parseInt(stockQty || "0", 10),
      imageUrl: imageUrl.trim(),
      active,
    };
    startTransition(async () => {
      const res = isEdit ? await updateProductAction(product!.id, input) : await createProductAction(input);
      setResult(res);
      if (res.ok) {
        setOpen(false);
        setResult(null);
        if (!isEdit) {
          setSku("");
          setName("");
          setBrand("");
          setCategory("");
          setPriceDollars("");
          setStockQty("0");
          setImageUrl("");
          setActive(true);
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="sm">
              <Pencil className="size-3.5" /> Edit
            </Button>
          ) : (
            <Button>
              <Plus className="size-4" /> Add product
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${product!.sku}` : "Add product"}</DialogTitle>
        </DialogHeader>

        <div className="mb-3">
          <Label htmlFor="sku" className="mb-1.5 text-plum-dark">
            SKU
          </Label>
          <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="HSA-BRD-001" />
          <FieldError messages={result?.fieldErrors?.sku} />
        </div>
        <div className="mb-3">
          <Label htmlFor="name" className="mb-1.5 text-plum-dark">
            Name
          </Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          <FieldError messages={result?.fieldErrors?.name} />
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2.5">
          <div>
            <Label htmlFor="brand" className="mb-1.5 text-plum-dark">
              Brand
            </Label>
            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
            <FieldError messages={result?.fieldErrors?.brand} />
          </div>
          <div>
            <Label htmlFor="category" className="mb-1.5 text-plum-dark">
              Category
            </Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <FieldError messages={result?.fieldErrors?.category} />
          </div>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2.5">
          <div>
            <Label htmlFor="price" className="mb-1.5 text-plum-dark">
              Retail price (AUD)
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={priceDollars}
              onChange={(e) => setPriceDollars(e.target.value)}
              placeholder="0.00"
            />
            <FieldError messages={result?.fieldErrors?.retailPriceCents} />
          </div>
          <div>
            <Label htmlFor="stock" className="mb-1.5 text-plum-dark">
              Stock qty
            </Label>
            <Input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
            />
            <FieldError messages={result?.fieldErrors?.stockQty} />
          </div>
        </div>
        <div className="mb-3">
          <Label className="mb-1.5 text-plum-dark">Photo (optional)</Label>
          <div className="flex items-center gap-3">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-paper">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, no fixed hostname to whitelist for next/image
                <img src={imageUrl} alt="" className="size-full object-cover" />
              ) : (
                <ImageUp className="size-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelected}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading && <Loader2 className="size-3.5 animate-spin" />}
                {uploading ? "Uploading…" : imageUrl ? "Replace photo" : "Upload photo"}
              </Button>
              <div className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WEBP · up to 5MB</div>
              {uploadError && <p className="mt-1 text-xs text-destructive">{uploadError}</p>}
            </div>
          </div>
        </div>
        <label className="mb-1 flex items-center gap-2 text-sm">
          <Checkbox checked={active} onCheckedChange={(c) => setActive(c === true)} />
          Active (visible in the catalogue)
        </label>

        {result?.message && <p className="mt-2 text-sm font-medium text-destructive">{result.message}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || uploading}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Add product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
