"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export function CartButton() {
  const { count } = useCart();

  return (
    <Link href="/cart" className="relative p-1.5 text-plum-dark" aria-label="Cart">
      <ShoppingCart className="size-5.5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-0.5 rounded-full bg-honey px-1.5 py-px text-[10.5px] font-extrabold text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}
