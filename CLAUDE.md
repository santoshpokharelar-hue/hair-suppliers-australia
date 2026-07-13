@AGENTS.md

# CLAUDE.md — Hair Suppliers Australia (Wholesale Portal)

## What this project is

A wholesale (B2B/trade) ordering website for **Hair Suppliers Australia** (brand name not final).
It sells the same afro/textured hair-care products as the retail store **Nature's Hair**
(natureshair.com.au) — brands like Mielle, Design Essentials, Sunny Isle, Kaleidoscope,
Aunt Jackie's, Vitale, Creme of Nature, Jamaican Mango & Lime, Shine n Jam, Janet Collection —
but at tiered wholesale prices for salons and resellers.

Core rule of the whole site: **prices are hidden until the user logs in.**

## Tech stack (do not substitute without asking)

- Next.js 15, App Router, TypeScript, React Server Components
- Tailwind CSS + shadcn/ui
- PostgreSQL on Supabase
- Drizzle ORM (schema in `src/db/schema.ts`, migrations via drizzle-kit)
- Auth.js (NextAuth) with credentials/email login; session includes `role`
- Stripe for payments (AUD), Stripe webhooks for payment confirmation
- Resend + React Email for transactional emails
- Deployed on Vercel
- No shipping-carrier API integration (see Resolved) — freight is priced and shipped manually
  by the admin via their own FedEx account; address fields are plain manual entry.

## Roles & access rules (enforce server-side, never client-only)

| Capability | Logged out | Guest | Business | Admin |
|---|---|---|---|---|
| Browse catalogue, search | ✅ | ✅ | ✅ | ✅ |
| See prices | ❌ | ✅ | ✅ | ✅ |
| Add to cart / request shipping quote | ❌ | ✅ | ✅ | ✅ |
| View own orders | ❌ | ✅ | ✅ | ✅ |
| Edit/cancel own order **before status = paid** | ❌ | ✅ | ✅ | ✅ |
| Pay a valid (unexpired) quote | ❌ | ✅ | ✅ | ✅ |
| Edit/cancel own order after paid | ❌ | ❌ | ❌ | ✅ |
| Admin dashboard `/admin` | ❌ | ❌ | ❌ | ✅ |
| Set freight price / send quote / decline | ❌ | ❌ | ❌ | ✅ |
| View/edit/delete ANY order, change status | ❌ | ❌ | ❌ | ✅ |
| Add/edit/deactivate/delete products | ❌ | ❌ | ❌ | ✅ |
| View registered users, enable/disable accounts | ❌ | ❌ | ❌ | ✅ |

- The `/admin` route group must be protected by middleware + server-side role check.
  Non-admin users should get a 404 (not a 403) so the dashboard's existence is hidden.
- Every order mutation API must re-check: (a) session exists, (b) user owns the order or is
  admin, (c) order status allows customer edits if the caller is not admin.
- A disabled user can't sign in (checked in `authorize()`), but an admin can't disable their
  own account — no lockout path. Disabling doesn't delete the account or its order history.

## Signup / login requirements

Two customer account types, one login portal:

**Guest account** — contact form + shipping address:
- full name, email, phone (all required)
- shipping address: street, suburb, state, 4-digit postcode — plain manual entry, format
  validated (4-digit postcode) but no carrier API lookup/auto-fill (see Resolved)

**Business account** — contact form + business details:
- full name, email, phone (required)
- business name (required)
- ABN: optional free-text field, no format validation or ABR verification. A business
  without a registered ABN (e.g. a home/garage salon) can still sign up and order.

**Admin** — seeded account(s) only; no public admin signup. Role can only be granted via DB/seed.

## Pricing model (single source of truth — implement once, server-side)

Each product has one `retailPriceCents`. The per-unit price depends on the **quantity of that
line item**:

| Tier | Quantity | Per-unit price |
|---|---|---|
| Pack of 1 | 1–5 | retail price |
| Pack of 6 | 6–11 | 30% off retail |
| Pack of 12–48 | 12–48 | 45% off retail |
| Bulk 48+ | 49+ | 55% off retail |

```ts
// src/lib/pricing.ts — the ONLY place tier math lives
export function unitPriceCents(retailCents: number, qty: number): number {
  const off = qty >= 49 ? 0.55 : qty >= 12 ? 0.45 : qty >= 6 ? 0.30 : 0;
  return Math.round(retailCents * (1 - off));
}
```

- All money is stored and computed in **integer cents**, AUD.
- The client may display tier tables, but the **server recomputes every line price** whenever
  an order is created or edited. Never trust prices from the client.
- Show the full 4-tier table on each product card so buyers see the incentive to order more.
- Prices are GST-inclusive; tax invoices are required (itemised GST breakdown) — confirmed with
  owner. Show "inc. GST" label.

## Database schema (Drizzle / Postgres)

```
users:        id, role ('guest'|'business'|'admin'), name, email (unique), phone,
              passwordHash, businessName?, abn? (free-text, unverified),
              disabled boolean (admin kill switch, blocks sign-in), createdAt
addresses:    id, userId, street, suburb, state, postcode, isDefault
products:     id, sku (unique, e.g. 'HSA-MIE-001'), name, brand, category,
              retailPriceCents, stockQty, imageUrl, active boolean
orders:       id, orderNumber (e.g. 'HSA-10041'), userId,
              status ('quote_requested'|'quoted'|'paid'|'finalized'|'cancelled'),
              shippingAddress (denormalised snapshot), freightCents?, isPickup boolean,
              quotedAt?, quoteToken?, adminNote?, customerNote?,
              subtotalCents, totalCents?, gstCents?, stripePaymentIntentId?,
              trackingNumber?, placedAt, paidAt?, finalizedAt?, cancelledAt?,
              cancelReason?
order_items:  id, orderId, productId, sku, nameSnapshot, qty,
              unitPriceCents (snapshot at purchase), lineTotalCents
```

Notes:
- Snapshot name/price on order_items so later catalogue changes don't rewrite history.
- `orderNumber` is human-readable and shown in emails; `id` is internal.
- Stock decrements at `paid`, not at quote time. Restock on cancel of a paid order.

## Order lifecycle — QUOTE-THEN-PAY (core business flow)

There is no direct checkout. Shipping/freight is priced manually by the admin per order,
and the customer only pays after receiving the final quote.

```
quote_requested —(admin adds freight price)—> quoted
quoted —(customer pays via Stripe)—> paid
paid —(admin ships)—> finalized

quote_requested | quoted —(customer or admin)—> cancelled
quoted —(customer edits items)—> quote_requested   (freight quote invalidated, re-quote)
quoted —(7 days pass, cron/on-read check)—> quote_requested (quote expired)
paid —(admin only)—> cancelled  (refund handled manually in Stripe)
quote_requested —(admin declines with reason)—> cancelled
```

Rules:
- Customers can edit quantities or cancel their own order at any status **before `paid`**.
  Any item edit while `quoted` clears `freightCents` and reverts status to `quote_requested`.
- Editing recomputes tier pricing per line (an edit can cross a tier threshold — always
  recompute via `pricing.ts`).
- Quotes carry `quotedAt` and expire after 7 days (`QUOTE_EXPIRY_DAYS` in `pricing.ts`);
  expired quotes are not payable.
- Admin dashboard has three top-level sections (`/admin/products`, `/admin/orders`,
  `/admin/users`) sharing one nav under `/admin`; `/admin` itself just redirects to
  `/admin/orders`. The Orders section has tabs: **Quote requests / Quoted (awaiting
  payment) / Paid (current) / Finalized / Cancelled**, with counts. Admin can view, edit,
  quote, re-quote, change status, and hard-delete any order.
- Every status change emails the customer (quote ready with pay link, payment received,
  finalized with tracking, cancelled/declined with reason).

## Search

- Case-insensitive, **substring/contains** match (not exact keyword) across product
  `name`, `brand`, `category`, and `sku`.
- Postgres: `ILIKE '%' || query || '%'` across those columns (or a generated tsvector later).
- Search works logged out too — results just hide prices.

## Quote request & payment flow (replaces classic checkout)

1. **Cart**: line items with live tier pricing. Total row reads
   `Total: $X + shipping (quoted after review)` — never show a fake shipping number.
   Primary CTA: **"Get final quote with shipping"** (no payment fields at this step).
2. **Quote request page**: confirm/enter shipping address (guests default to saved address) —
   plain manual entry (street, suburb, state, 4-digit postcode), no carrier lookup. Optional
   order note. Submitting creates the order with status `quote_requested`, snapshots items +
   address, emails an acknowledgment to the customer and a notification to the admin.
3. **Admin quoting** (dashboard → Quote requests): admin reviews the items and destination
   and manually decides freight — no weight or rate-table logic, it's a judgement call per
   order. Enters `freightCents` (or marks `isPickup` for $0 local pickup) and optionally an
   internal note; clicks "Send quote". Status → `quoted`, `quotedAt` set. Customer receives
   the **quote email**: itemised table + freight (or "Local pickup") + grand total + secure
   "Review & pay" link (tokenised URL, also reachable from My Orders).
4. **Customer pays**: quote review page shows the locked itemised quote. Server verifies
   status is `quoted` and not expired, recomputes item prices, adds `freightCents`, creates
   the Stripe PaymentIntent → Payment Element. Editing items from this page warns that the
   quote will be invalidated and sent back for re-quoting.
5. Stripe webhook (`payment_intent.succeeded`) → status `paid`, stock decremented,
   payment-confirmation email sent (full itemised table: SKU, name, qty, unit price, line
   total, freight, grand total).
6. Admin ships via their own FedEx account → marks `finalized` (optional free-text tracking
   number field, any carrier) → finalized email.

Very large orders are expected — there is no upper cap; the admin simply prices
freight/courier accordingly, or marks the order as local pickup.

## External APIs & env vars

```
DATABASE_URL=
AUTH_SECRET=
STRIPE_SECRET_KEY=          STRIPE_WEBHOOK_SECRET=      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=             EMAIL_FROM=orders@…
```

## Build phases (work in this order; keep each phase shippable)

1. **Scaffold**: Next.js + Tailwind + shadcn/ui + Drizzle + Supabase connection; seed script
   with the ~20 real products (SKUs `HSA-…`, retail prices from Nature's Hair). ✅ done
2. **Auth**: Auth.js credentials, signup flows for guest (with address) and business
   (ABN optional, unverified), role in session, middleware for `/admin`. ✅ done
3. **Catalogue**: landing page, product grid, lifestyle imagery section, search; price-gating
   (tier table only when logged in). ✅ done
4. **Cart & pricing**: cart state, tier math from `pricing.ts`, live per-unit updates. ✅ done
5. **Quote request**: address step (plain manual entry, no carrier lookup), order +
   order_items written to DB as `quote_requested`; admin notification email. ✅ done
6. **Admin quoting**: dashboard tab for quote requests, freight input, send-quote action,
   quote email with tokenised pay link, expiry + edit-invalidation logic. ✅ done
7. **Payment**: quote review page, server-side price recompute + freight, Stripe
   PaymentIntent + webhook → `paid`, stock decrement. ✅ code done — **untested**, no live
   Stripe keys configured (see Resolved).
8. **Emails**: React Email templates (quote request ack, quote ready, payment received,
   finalized, cancelled/declined) via Resend. ✅ code done — **untested**, no live Resend key
   configured; falls back to a console.log no-op locally (see Resolved).
9. **Customer orders page**: list own orders; edit qty / cancel before paid (edits while
   quoted revert to quote_requested). ✅ done
10. **Admin dashboard**: full tabbed order lists (quote requests / quoted / paid / finalized
    / cancelled), edit/status/delete, hidden from non-admins. ✅ done — later extended with
    Products (add/edit/deactivate/delete) and Users (list, enable/disable) sections; see
    Resolved.
11. **Polish**: empty states, loading states, mobile layout, quote-expiry cron, basic rate
    limiting on auth endpoints, error monitoring. ✅ mostly done — quote-expiry is an on-read
    sweep (not a real cron), rate limiting is in-memory/per-instance only, and error
    monitoring is just graceful error boundaries (no Sentry/equivalent — none was configured).
    See Resolved.

## Design reference

- `design-reference/prototype.jsx` is a single-file React prototype of the entire site. It is
  the **source of truth for visual design and UX flows**, not for implementation. Note: the
  prototype models a direct-checkout flow (fixed shipping fee) — the real flow is
  quote-then-pay as described above; port the prototype's screens/visual language, not its
  checkout logic.
- Port from it: colour palette (the `T` theme object: paper #FBF7F0, ink #241722, plum
  #5C2E4E, plum-dark #3D1E33, honey #D99C2B, honey-soft #F6E7C6), serif display / sans body
  type pairing, layout of every screen (landing hero + lifestyle tiles, product cards with the
  4-tier price table and quick-pack buttons ×1/×6/×12/48+, login portal tabs, cart, my-orders
  cards, admin tabbed dashboard).
- Do NOT port: inline styles (use Tailwind + shadcn/ui), in-memory state as a database, mock
  payment, the simulated AusPost postcode-lookup dataset (AusPost integration is cancelled —
  see Resolved), the hardcoded admin credentials, or the fixed-fee checkout flow.
- Put all ported colours/fonts into a single theme/tokens file (branding is not final).

## Conventions

- TypeScript strict mode; Zod schemas for every form and API input, shared client/server.
- Server Actions or route handlers for mutations; no direct DB access from client components.
- Money: integer cents everywhere; format with a single `formatAUD()` helper.
- Dates: store UTC, display Australia/Sydney.
- Commit per phase; each phase must build (`next build`) and pass `tsc --noEmit` before moving on.
- Branding (logo, colours, name) is placeholder — keep all brand tokens in one theme file so
  it's easy to swap when branding is finalised.

## Open questions (ask the owner before assuming)

- Minimum order value or minimum quantities per product?
- Quote expiry window: 7 days assumed — confirm.
- Should freight be GST-inclusive in the quote (assumed yes)?
- Real product photography source (retail store assets?) and final brand name/logo.

## Resolved

- Freight is priced entirely by admin judgement, per order — no weight or rate-table
  logic. Products do not carry a shipping-weight field.
- Local pickup is supported: admin can mark a quote `isPickup` (freightCents = 0) instead
  of entering courier freight.
- ABN verification is cancelled entirely: no checksum validation, no ABR Lookup API call.
  ABN is an optional free-text field on business accounts — an unregistered business
  (e.g. a garage salon) can still sign up and order.
- AusPost integration is cancelled (not just deferred): no Postcode Search API, no
  auto-fill/validation beyond a 4-digit format check. The admin ships manually using their own
  FedEx account. All address fields (guest signup, quote request) are plain manual entry —
  street, suburb, state, 4-digit postcode. `trackingNumber` on `orders` stays a free-text
  field so it can hold a FedEx (or any carrier) number, not an AusPost-specific one.
  `src/lib/auspost.ts` and the postcode-lookup Server Action have been removed.
- Phases 6–11 were all built in one pass, without live Stripe or Resend credentials in the
  environment (`.env.local` only had `DATABASE_URL`/`AUTH_SECRET`/`ADMIN_EMAIL`/
  `ADMIN_PASSWORD` at the time). Concretely:
  - **Stripe**: `src/lib/stripe.ts` lazy-inits (same pattern as `src/db/index.ts`) so
    `next build` doesn't require `STRIPE_SECRET_KEY`. The whole PaymentIntent → Payment
    Element → webhook → `paid` path has never been exercised against a real Stripe account —
    add real test-mode keys and walk a full payment before trusting it in front of a customer.
  - **Resend**: `src/lib/resend.ts` returns `null` when `RESEND_API_KEY` is unset, and every
    send falls back to a `console.log` no-op (same spirit as the old AusPost mock fallback) —
    so the app never crashes locally, but no email template has ever actually been delivered
    or visually checked in an inbox. Add a real key and send at least one of each template
    before trusting the copy/formatting.
  - **Rate limiting** (`src/lib/rate-limit.ts`) is an in-memory per-instance token bucket —
    fine for a single long-running server, but on Vercel's serverless model each instance has
    its own memory, so it's a soft speed bump, not a hard limit. A real deployment wanting
    this enforced would need a shared store (Upstash Redis, etc.).
  - **Error monitoring** is just `app/error.tsx` + `app/global-error.tsx` boundaries — no
    Sentry/equivalent is wired up, since no DSN or service was specified. Errors currently
    only go to server logs.
  - **Quote expiry** (`src/lib/expire-quotes.ts`) is an on-read sweep called from the admin
    dashboard, My Orders, and order-detail pages — not an actual scheduled cron — matching
    the "cron/on-read check" language CLAUDE.md already allowed for this.
  - None of the Phase 6–11 interactive flows (admin send-quote, Stripe checkout, customer
    qty-edit/cancel) have been clicked through in a real browser — no browser automation tool
    was available in that session. Verified by typecheck + build + targeted DB-level checks
    only.
- The admin dashboard was reorganised into three sections after the owner asked for it
  explicitly (not part of the original 11-phase plan): `/admin/products` (add/edit/
  deactivate/hard-delete catalogue items — hard delete is blocked with a friendly message if
  the product is referenced by any existing order, since order_items snapshots reference
  `productId`), `/admin/orders` (the pre-existing order-lifecycle dashboard, unchanged), and
  `/admin/users` (list all registered users, enable/disable their account). `/admin` itself
  just redirects to `/admin/orders`; the navbar still has a single "Admin dashboard" link.
  Added `users.disabled` (boolean, default false) via `drizzle-kit push` — no migration file,
  since this project has used `db:push` exclusively so far, no `drizzle/` migrations folder
  exists. A disabled user's `authorize()` call returns null just like a wrong password would
  (no distinct error message, so disabling doesn't announce itself). Product images are still
  a plain optional `imageUrl` text field (paste a URL) — no file upload was wired up, since
  that would mean picking a storage provider (Vercel Blob is the natural fit) and no one has
  confirmed that's wanted yet.
