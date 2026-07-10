import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["guest", "business", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "quote_requested",
  "quoted",
  "paid",
  "finalized",
  "cancelled",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: roleEnum("role").notNull().default("guest"),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  businessName: text("business_name"),
  // Optional, free-text. No checksum or ABR verification — a business account
  // doesn't need a valid/registered ABN to sign up and order.
  abn: text("abn"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  street: text("street").notNull(),
  suburb: text("suburb").notNull(),
  state: text("state").notNull(),
  postcode: text("postcode").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  retailPriceCents: integer("retail_price_cents").notNull(),
  stockQty: integer("stock_qty").notNull().default(0),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
});

// Snapshot of a shipping address at the time an order was placed, so later
// address-book edits don't rewrite order history.
export type ShippingAddressSnapshot = {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
};

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  status: orderStatusEnum("status").notNull().default("quote_requested"),
  shippingAddress: jsonb("shipping_address").$type<ShippingAddressSnapshot>().notNull(),

  // Item subtotal only (GST-inclusive), known as soon as the quote is requested and
  // recomputed via pricing.ts whenever items are edited.
  subtotalCents: integer("subtotal_cents").notNull(),

  // Set by admin when sending the quote; null while status = quote_requested.
  freightCents: integer("freight_cents"),
  // True when the admin quotes this order for local pickup instead of courier
  // freight — freightCents is 0 either way, this distinguishes "genuinely free
  // freight" from "customer is picking up".
  isPickup: boolean("is_pickup").notNull().default(false),
  quotedAt: timestamp("quoted_at", { withTimezone: true }),
  // Opaque token for the customer's "review & pay" link; issued alongside freightCents.
  quoteToken: text("quote_token").unique(),
  adminNote: text("admin_note"),
  customerNote: text("customer_note"),

  // subtotalCents + freightCents, set once quoted. GST component of the total
  // (assumes freight is GST-inclusive like item prices — confirm with owner).
  totalCents: integer("total_cents"),
  gstCents: integer("gst_cents"),

  stripePaymentIntentId: text("stripe_payment_intent_id"),
  trackingNumber: text("tracking_number"),

  placedAt: timestamp("placed_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  finalizedAt: timestamp("finalized_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  cancelReason: text("cancel_reason"),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  sku: text("sku").notNull(),
  nameSnapshot: text("name_snapshot").notNull(),
  qty: integer("qty").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  lineTotalCents: integer("line_total_cents").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
