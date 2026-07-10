// Seeds the product catalogue from design-reference/prototype.jsx's PRODUCTS
// array (mirrors the Nature's Hair retail range), plus one admin account when
// ADMIN_EMAIL/ADMIN_PASSWORD are set. Run with `npm run db:seed`.
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { hashPassword } from "../lib/password";

config({ path: ".env.local" });

import { db } from "./index";
import { products, users } from "./schema";

type SeedProduct = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  retailCents: number;
  stockQty: number;
};

const SEED_PRODUCTS: SeedProduct[] = [
  { sku: "HSA-VIT-001", name: "Vitale Olive Oil Heat Protector with Biotin 355ml", brand: "Vitale", category: "Hair Treatment", retailCents: 2000, stockQty: 480 },
  { sku: "HSA-VIT-002", name: "Vitale Perfect Braids Calm Itch Relief 8oz", brand: "Vitale", category: "Hair Spray", retailCents: 2200, stockQty: 360 },
  { sku: "HSA-VIT-003", name: "Vitale Olive Oil Silk & Shine Holding Spritz 12oz", brand: "Vitale", category: "Leave-In", retailCents: 2000, stockQty: 300 },
  { sku: "HSA-VIT-004", name: "Vitale Olive Oil Foam Wrap Lotion 237ml", brand: "Vitale", category: "Hair Styling", retailCents: 1500, stockQty: 520 },
  { sku: "HSA-KAL-001", name: "Kaleidoscope Miracle Drops Conditioner 8oz", brand: "Kaleidoscope", category: "Conditioner", retailCents: 2000, stockQty: 410 },
  { sku: "HSA-KAL-002", name: "Kaleidoscope Miracle Drops Original 2oz", brand: "Kaleidoscope", category: "Hair Oils & Serums", retailCents: 2000, stockQty: 640 },
  { sku: "HSA-DES-001", name: "Design Essentials Almond & Avocado Honey Curl Foaming Custard 354g", brand: "Design Essentials", category: "Curl Styling", retailCents: 3500, stockQty: 220 },
  { sku: "HSA-DES-002", name: "Design Essentials Honey Creme Moisture Retention Masque 7.5oz", brand: "Design Essentials", category: "Hair Mask", retailCents: 2800, stockQty: 250 },
  { sku: "HSA-DES-003", name: "Design Essentials Almond & Avocado Sulfate-Free Shampoo 356ml", brand: "Design Essentials", category: "Shampoo", retailCents: 2200, stockQty: 380 },
  { sku: "HSA-DES-004", name: "Design Essentials Moisturising Oil Treatment 4oz", brand: "Design Essentials", category: "Hair Oils & Serums", retailCents: 2800, stockQty: 290 },
  { sku: "HSA-CON-001", name: "Creme of Nature Pure Honey Moisture & Twist Curling Mousse", brand: "Creme of Nature", category: "Hair Mousse", retailCents: 2000, stockQty: 340 },
  { sku: "HSA-JML-001", name: "Jamaican Mango & Lime No More Itch Gro Spray 473ml", brand: "Jamaican Mango & Lime", category: "Braid Spray", retailCents: 3000, stockQty: 400 },
  { sku: "HSA-SUN-001", name: "Sunny Isle Jamaican Black Castor Oil & Maintenance Combo", brand: "Sunny Isle", category: "Gift Sets", retailCents: 6500, stockQty: 120 },
  { sku: "HSA-SUN-002", name: "Sunny Isle Kids Care Combo", brand: "Sunny Isle", category: "Kids Hair Care", retailCents: 6500, stockQty: 110 },
  { sku: "HSA-SUN-003", name: "2x Sunny Isle Jamaican Black Castor Oil 8oz", brand: "Sunny Isle", category: "Hair Oils & Serums", retailCents: 3800, stockQty: 260 },
  { sku: "HSA-SNJ-001", name: "Shine n Jam Nourishing Scalp Oil 118ml", brand: "Shine n Jam", category: "Hair Oils & Serums", retailCents: 5000, stockQty: 180 },
  { sku: "HSA-AJK-001", name: "Aunt Jackie's Smooth + Swirl Edge Gel Extra Firm Hold 114g", brand: "Aunt Jackie's", category: "Hair Gel", retailCents: 2500, stockQty: 430 },
  { sku: "HSA-AJK-002", name: "Aunt Jackie's Elixir Essentials Collagen & Tea Tree Scalp Oil 59ml", brand: "Aunt Jackie's", category: "Hair Oils & Serums", retailCents: 2500, stockQty: 310 },
  { sku: "HSA-JNT-001", name: "Janet Nala Tress 3X Afro Hot Twist Crochet Braid", brand: "Janet Collection", category: "Synthetic Braiding Hair", retailCents: 4000, stockQty: 200 },
  { sku: "HSA-MIE-001", name: "Mielle Rosemary Mint Strengthening Shampoo & Mask Combo", brand: "Mielle", category: "Shampoo", retailCents: 5900, stockQty: 150 },
];

async function seed() {
  for (const p of SEED_PRODUCTS) {
    await db
      .insert(products)
      .values({
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        category: p.category,
        retailPriceCents: p.retailCents,
        stockQty: p.stockQty,
        imageUrl: null,
        active: true,
      })
      .onConflictDoUpdate({
        target: products.sku,
        set: {
          name: sql`excluded.name`,
          brand: sql`excluded.brand`,
          category: sql`excluded.category`,
          retailPriceCents: sql`excluded.retail_price_cents`,
          stockQty: sql`excluded.stock_qty`,
          active: sql`excluded.active`,
        },
      });
  }
  console.log(`Seeded ${SEED_PRODUCTS.length} products.`);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await hashPassword(adminPassword);
    await db
      .insert(users)
      .values({
        role: "admin",
        name: "Admin",
        email: adminEmail,
        phone: "0000000000",
        passwordHash,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { passwordHash: sql`excluded.password_hash`, role: sql`excluded.role` },
      });
    console.log(`Seeded admin account ${adminEmail}.`);
  } else {
    console.log("ADMIN_EMAIL/ADMIN_PASSWORD not set — skipped admin seed.");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
