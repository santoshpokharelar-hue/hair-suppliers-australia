import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
