"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createQuoteRequestAction, type QuoteRequestState } from "@/lib/actions/quote";
import { useCart } from "@/lib/cart-store";
import { formatAUD } from "@/lib/format";
import { lineTotalCents } from "@/lib/pricing";

type DefaultAddress = {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
} | null;

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{messages[0]}</p>;
}

export function QuoteRequestForm({ defaultAddress }: { defaultAddress: DefaultAddress }) {
  const { items, subtotalCents, clear } = useCart();
  const [street, setStreet] = useState(defaultAddress?.street ?? "");
  const [suburb, setSuburb] = useState(defaultAddress?.suburb ?? "");
  const [stateVal, setStateVal] = useState(defaultAddress?.state ?? "");
  const [postcode, setPostcode] = useState(defaultAddress?.postcode ?? "");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<QuoteRequestState | null>(null);
  const [pending, startTransition] = useTransition();

  if (result?.ok) {
    return (
      <div className="rounded-2xl border border-line bg-card p-9 text-center">
        <div className="font-display text-xl font-bold text-plum-dark">Quote request submitted</div>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Order <b>{result.orderNumber}</b> is in for review. We&apos;ll price shipping by hand
          and email you a quote to pay once it&apos;s ready.
        </p>
        <Button render={<Link href="/" />} nativeButton={false} className="mt-5">
          Back to catalogue
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-card p-11 text-center text-muted-foreground">
        Your cart is empty.
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="ml-2.5"
        >
          Browse catalogue
        </Button>
      </div>
    );
  }

  function submit() {
    startTransition(async () => {
      const res = await createQuoteRequestAction({
        street,
        suburb,
        state: stateVal,
        postcode,
        customerNote: note,
        items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
      });
      setResult(res);
      if (res.ok) clear();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-2.5 text-xs font-bold tracking-wide text-honey">SHIPPING ADDRESS</div>
        <div className="mb-3">
          <Label htmlFor="street" className="mb-1.5 text-plum-dark">
            Street address <span className="text-destructive">*</span>
          </Label>
          <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} />
          <FieldError messages={result?.fieldErrors?.street} />
        </div>
        <div className="mb-1 grid grid-cols-[100px_1fr] gap-2.5">
          <div>
            <Label htmlFor="postcode" className="mb-1.5 text-plum-dark">
              Postcode <span className="text-destructive">*</span>
            </Label>
            <Input id="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="suburb" className="mb-1.5 text-plum-dark">
              Suburb <span className="text-destructive">*</span>
            </Label>
            <Input id="suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} />
          </div>
        </div>
        <FieldError messages={result?.fieldErrors?.postcode ?? result?.fieldErrors?.suburb} />
        <div className="mb-3 mt-2">
          <Label htmlFor="state" className="mb-1.5 text-plum-dark">
            State <span className="text-destructive">*</span>
          </Label>
          <Input id="state" value={stateVal} onChange={(e) => setStateVal(e.target.value)} />
          <FieldError messages={result?.fieldErrors?.state} />
        </div>
        <div className="mb-4">
          <Label htmlFor="note" className="mb-1.5 text-plum-dark">
            Order note (optional)
          </Label>
          <Textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Delivery instructions, preferred courier, etc."
          />
        </div>
        {result?.message && <p className="mb-3 text-sm font-medium text-destructive">{result.message}</p>}
        <Button onClick={submit} disabled={pending} className="w-full justify-center">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />}
          {pending ? "Submitting…" : "Submit quote request"}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          We ship using our own courier account — freight is priced by hand and emailed to you
          as a quote before you pay anything.
        </p>
      </div>

      <div className="h-fit rounded-xl border border-line bg-card p-4">
        <div className="mb-3 text-xs font-bold tracking-wide text-honey">ORDER SUMMARY</div>
        {items.map((item) => (
          <div key={item.productId} className="mb-2 flex justify-between gap-3 text-sm">
            <span>
              {item.qty} × {item.name}
            </span>
            <span className="shrink-0 font-semibold">
              {formatAUD(lineTotalCents(item.retailPriceCents, item.qty))}
            </span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-line pt-3 font-bold">
          <span>Subtotal</span>
          <span>{formatAUD(subtotalCents)}</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">+ shipping, quoted after review</div>
      </div>
    </div>
  );
}
