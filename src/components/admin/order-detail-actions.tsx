"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Minus, Plus, Send, ShipIcon, Trash2, XCircle } from "lucide-react";
import {
  adminCancelOrderAction,
  adminUpdateOrderItemQtyAction,
  declineQuoteAction,
  deleteOrderAction,
  markFinalizedAction,
  sendQuoteAction,
} from "@/lib/actions/admin-orders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatAUD } from "@/lib/format";
import type { getOrderById } from "@/lib/queries/orders";

type Order = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;

const EDITABLE_ITEM_STATUSES = new Set(["quote_requested", "quoted"]);

export function OrderDetailActions({ order }: { order: Order }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

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
                  {EDITABLE_ITEM_STATUSES.has(order.status) ? (
                    <div className="ml-auto flex w-fit items-center rounded-lg border border-line">
                      <button
                        type="button"
                        disabled={pending}
                        className="p-1 px-2 text-plum-dark"
                        onClick={() =>
                          startTransition(async () => {
                            const res = await adminUpdateOrderItemQtyAction(order.id, item.id, item.qty - 1);
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
                            const res = await adminUpdateOrderItemQtyAction(order.id, item.id, item.qty + 1);
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

      {error && <p className="mb-3 text-sm font-medium text-destructive">{error}</p>}

      {(order.status === "quote_requested" || order.status === "quoted") && (
        <QuoteForm
          order={order}
          pending={pending}
          onSend={(input) => startTransition(async () => afterMutation(await sendQuoteAction(order.id, input)))}
        />
      )}

      {order.status === "quote_requested" && (
        <ReasonDialog
          triggerLabel="Decline request"
          triggerIcon={<XCircle className="size-3.5" />}
          title="Decline this quote request"
          description="The customer will be emailed with your reason. This cancels the order."
          confirmLabel="Decline & cancel"
          pending={pending}
          onConfirm={(reason) =>
            startTransition(async () => afterMutation(await declineQuoteAction(order.id, reason)))
          }
        />
      )}

      {order.status === "quoted" && (
        <ReasonDialog
          triggerLabel="Cancel order"
          triggerIcon={<XCircle className="size-3.5" />}
          title="Cancel this order"
          description="The customer will be emailed with your reason."
          confirmLabel="Cancel order"
          pending={pending}
          onConfirm={(reason) =>
            startTransition(async () => afterMutation(await adminCancelOrderAction(order.id, reason)))
          }
        />
      )}

      {order.status === "paid" && (
        <FinalizeForm
          pending={pending}
          onFinalize={(tracking) =>
            startTransition(async () => afterMutation(await markFinalizedAction(order.id, tracking)))
          }
        />
      )}

      {order.status === "paid" && (
        <div className="mt-2.5">
          <ReasonDialog
            triggerLabel="Cancel & refund manually"
            triggerIcon={<XCircle className="size-3.5" />}
            title="Cancel this paid order"
            description="Stock will be restocked automatically. You still need to issue the refund in Stripe manually."
            confirmLabel="Cancel order"
            pending={pending}
            onConfirm={(reason) =>
              startTransition(async () => afterMutation(await adminCancelOrderAction(order.id, reason)))
            }
          />
        </div>
      )}

      {order.status === "cancelled" && order.cancelReason && (
        <p className="text-sm text-muted-foreground">
          <b>Cancel reason:</b> {order.cancelReason}
        </p>
      )}

      <Dialog>
        <DialogTrigger
          render={
            <Button variant="ghost" size="sm" disabled={pending} className="mt-6 text-destructive">
              <Trash2 className="size-3.5" /> Delete order permanently
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {order.orderNumber}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This permanently removes the order and its items. This can&apos;t be undone.
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await deleteOrderAction(order.id);
                  if (res.ok) router.push("/admin");
                  else afterMutation(res);
                })
              }
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuoteForm({
  order,
  pending,
  onSend,
}: {
  order: Order;
  pending: boolean;
  onSend: (input: { freightCents: number; isPickup: boolean; adminNote?: string }) => void;
}) {
  const [isPickup, setIsPickup] = useState(order.isPickup);
  const [freightDollars, setFreightDollars] = useState(
    order.freightCents != null ? (order.freightCents / 100).toFixed(2) : ""
  );
  const [adminNote, setAdminNote] = useState(order.adminNote ?? "");

  return (
    <div className="mb-4 rounded-xl border border-line bg-card p-4">
      <div className="mb-3 text-xs font-bold tracking-wide text-honey">
        {order.status === "quoted" ? "RE-QUOTE FREIGHT" : "PRICE FREIGHT & SEND QUOTE"}
      </div>
      <label className="mb-3 flex items-center gap-2 text-sm">
        <Checkbox checked={isPickup} onCheckedChange={(c) => setIsPickup(c === true)} />
        Local pickup ($0 freight)
      </label>
      {!isPickup && (
        <div className="mb-3">
          <Label htmlFor="freight" className="mb-1.5 text-plum-dark">
            Freight (AUD, inc. GST)
          </Label>
          <Input
            id="freight"
            type="number"
            min="0"
            step="0.01"
            value={freightDollars}
            onChange={(e) => setFreightDollars(e.target.value)}
            placeholder="0.00"
          />
        </div>
      )}
      <div className="mb-3">
        <Label htmlFor="adminNote" className="mb-1.5 text-plum-dark">
          Internal note (optional)
        </Label>
        <Textarea id="adminNote" rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
      </div>
      <Button
        disabled={pending}
        onClick={() =>
          onSend({
            freightCents: isPickup ? 0 : Math.round(parseFloat(freightDollars || "0") * 100),
            isPickup,
            adminNote,
          })
        }
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send quote
      </Button>
    </div>
  );
}

function FinalizeForm({
  pending,
  onFinalize,
}: {
  pending: boolean;
  onFinalize: (tracking: string | undefined) => void;
}) {
  const [tracking, setTracking] = useState("");

  return (
    <div className="mb-4 rounded-xl border border-line bg-card p-4">
      <div className="mb-3 text-xs font-bold tracking-wide text-honey">MARK AS SHIPPED</div>
      <div className="mb-3">
        <Label htmlFor="tracking" className="mb-1.5 text-plum-dark">
          Tracking number (optional, any carrier)
        </Label>
        <Input id="tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} />
      </div>
      <Button disabled={pending} onClick={() => onFinalize(tracking || undefined)}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ShipIcon className="size-4" />}
        Mark finalized
      </Button>
    </div>
  );
}

function ReasonDialog({
  triggerLabel,
  triggerIcon,
  title,
  description,
  confirmLabel,
  pending,
  onConfirm,
}: {
  triggerLabel: string;
  triggerIcon: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" disabled={pending}>
            {triggerIcon} {triggerLabel}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (shown to the customer)"
        />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Back</DialogClose>
          <DialogClose
            render={
              <Button variant="destructive" disabled={pending || !reason.trim()} onClick={() => onConfirm(reason)}>
                {confirmLabel}
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
