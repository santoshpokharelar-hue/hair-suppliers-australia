"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Receipt, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/orders", label: "Orders", Icon: Receipt },
  { href: "/admin/users", label: "Users", Icon: Users },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-1 border-b border-line">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm font-bold",
              active
                ? "border-honey text-plum-dark"
                : "border-transparent text-muted-foreground hover:text-plum-dark"
            )}
          >
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
