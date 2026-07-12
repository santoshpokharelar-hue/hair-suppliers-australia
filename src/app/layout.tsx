import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hair Suppliers Australia — Wholesale Portal",
  description:
    "Trade pricing on the Nature's Hair retail range, for salons and resellers. Branding not final.",
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
            Hair Suppliers Australia — wholesale partner of Nature&apos;s Hair retail stores ·
            Demo build (branding not final)
          </footer>
        </CartProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
