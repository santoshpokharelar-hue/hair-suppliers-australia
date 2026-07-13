"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { lineTotalCents } from "@/lib/pricing";

// The cart is pre-order state with no DB table of its own — an order (and its
// order_items snapshot) is only created once the customer submits a quote
// request. Until then it just lives in the browser; prices shown here are
// always recomputed server-side when the quote request is created.
export type CartItem = {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  retailPriceCents: number;
  imageUrl: string | null;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "qty">, qty: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  count: number;
  subtotalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "hsa-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Corrupt or inaccessible storage — start with an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((product: Omit<CartItem, "qty">, qty: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.productId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotalCents = items.reduce(
    (sum, i) => sum + lineTotalCents(i.retailPriceCents, i.qty),
    0
  );

  const value = useMemo(
    () => ({ items, addItem, setQty, removeItem, clear, count, subtotalCents }),
    [items, addItem, setQty, removeItem, clear, count, subtotalCents]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
