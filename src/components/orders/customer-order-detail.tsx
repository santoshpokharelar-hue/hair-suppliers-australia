"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Minus, Plus, Truck, XCircle } from "lucide-react";
import { cancelOrderAction, updateOrderItemQtyAction } from "@/lib/actions/customer-orders";
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
import { formatAUD } from "@/lib/format";
import { isQuoteExpired } from "@/lib/pricing";
import type { getOrderById } from "@/lib/queries/orders";

type Order = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;

const EDITABLE_STATUSES = new Set(["quote_requested", "quoted"]);

export function CustomerOrderDetail({ order }: { order: Order }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const editable = EDITABLE_STATUSES.has(order.status);

  function afterMutation(res: { ok: boolean; message?: string }) {
    if (!res.ok) {
      setError(res.message || "Something went wrong.");
      return;
    }
    setError("");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 overflow-hidden rounded-xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 text-right font-medium">Qty</th>
              <th className="px-3 py-2 text-right font-medium">Unit</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2">
                  <div className="font-medium">{item.nameSnapshot}</div>
                  <div className="text-xs text-muted-foreground">SKU {item.sku}</div>
                </td>
                <td className="px-3 py-2 text-right">
                  {editable ? (
                    <div className="ml-auto flex w-fit items-center rounded-lg border border-line">
                      <button
                        type="button"
                        disabled={pending}
                        className="p-1 px-2 text-plum-dark"
                        onClick={() =>
                          startTransition(async () => {
                            const res = await updateOrderItemQtyAction(order.id, item.id, item.qty - 1);
                            afterMutation(res);
                          })
                        }
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center font-bold">{item.qty}</span>
                      <button
                        type="button"
                        disabled={pending}
                        className="p-1 px-2 text-plum-dark"
                        onClick={() =>
                          startTransition(async () => {
                            const res = await updateOrderItemQtyAction(order.id, item.id, item.qty + 1);
                            afterMutation(res);
                          })
                        }
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  ) : (
                    item.qty
                  )}
                </td>
                <td className="px-3 py-2 text-right">{formatAUD(item.unitPriceCents)}</td>
                <td className="px-3 py-2 text-right font-semibold">{formatAUD(item.lineTotalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1 border-t border-line bg-paper/60 px-3 py-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatAUD(order.subtotalCents)}</span>
          </div>
          {order.status !== "quote_requested" && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{order.isPickup ? "Shipping" : "Freight"}</span>
                <span className="font-semibold">
                  {order.isPickup ? "Local pickup" : formatAUD(order.freightCents ?? 0)}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-bold">Total (inc. GST)</span>
                <span className="font-bold">{formatAUD(order.totalCents ?? order.subtotalCents)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {editable && (
        <p className="mb-4 text-xs text-muted-foreground">
          Changing a quantity here recalculates pricing{order.status === "quoted" ? " and sends this order back for a fresh shipping quote" : ""}.
        </p>
      )}

      {error && <p className="mb-3 text-sm font-medium text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2.5">
        {order.status === "quoted" && order.quoteToken && !isQuoteExpired(order.quotedAt) && (
          <Button render={<Link href={`/pay/${order.quoteToken}`} />} nativeButton={false}>
            <Truck className="size-4" /> Review & pay
          </Button>
        )}
        {order.status === "quoted" && isQuoteExpired(order.quotedAt) && (
          <p className="text-sm text-muted-foreground">
            This quote has expired — edit an item&apos;s quantity to request a fresh one.
          </p>
        )}

        {editable && (
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="outline" disabled={pending}>
                  <XCircle className="size-4" /> Cancel order
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel {order.orderNumber}?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">This can&apos;t be undone.</p>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Back</DialogClose>
                <DialogClose
                  render={
                    <Button
                      variant="destructive"
                      disabled={pending}
                      onClick={() => startTransition(async () => afterMutation(await cancelOrderAction(order.id)))}
                    >
                      {pending && <Loader2 className="size-4 animate-spin" />} Cancel order
                    </Button>
                  }
                />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {order.status === "cancelled" && order.cancelReason && (
        <p className="mt-4 text-sm text-muted-foreground">
          <b>Cancel reason:</b> {order.cancelReason}
        </p>
      )}
      {order.status === "finalized" && order.trackingNumber && (
        <p className="mt-4 text-sm text-muted-foreground">
          <b>Tracking:</b> {order.trackingNumber}
        </p>
      )}
    </div>
  );
}
