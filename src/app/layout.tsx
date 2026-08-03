import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart-store";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// The site is reachable at more than one URL (the apex domain, www, and the
// original vercel.app domain all serve identical content with no redirect
// between them) — metadataBase + a canonical tag on every page tells search
// engines which one to actually index, so ranking signals consolidate onto
// one URL instead of splitting across duplicates.
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Hair Suppliers Australia — Wholesale Portal",
  description:
    "Wholesale trade pricing on afro and textured hair care essentials — Mielle, Design Essentials, Sunny Isle, and more. For salons and resellers, Australia-wide.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <footer className="mt-12 border-t border-line px-6 py-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hair Suppliers Australia — wholesale hair care
            supplier for salons and resellers
          </footer>
        </CartProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
