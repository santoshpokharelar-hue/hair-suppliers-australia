import React, { useState, useMemo } from "react";
import {
  Search, ShoppingCart, User, Lock, LogOut, Package, Truck, CheckCircle2,
  XCircle, Trash2, Pencil, Plus, Minus, Mail, Shield, Building2, MapPin,
  CreditCard, ChevronLeft, Eye, EyeOff, Leaf
} from "lucide-react";

/* ================= THEME ================= */
const T = {
  paper: "#FBF7F0",
  card: "#FFFFFF",
  ink: "#241722",
  plum: "#5C2E4E",
  plumDark: "#3D1E33",
  honey: "#D99C2B",
  honeySoft: "#F6E7C6",
  sage: "#7A8B6F",
  line: "#E8DFD2",
  red: "#B3402F",
  green: "#3E7A4E",
};
const display = { fontFamily: "'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif" };
const body = { fontFamily: "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif" };

/* ================= DATA ================= */
// Products mirrored from the Nature's Hair retail range (retail price = Pack of 1)
const PRODUCTS = [
  { sku: "HSA-VIT-001", name: "Vitale Olive Oil Heat Protector with Biotin 355ml", cat: "Hair Treatment", retail: 20, stock: 480, art: "spray", tint: "#8FA36B" },
  { sku: "HSA-VIT-002", name: "Vitale Perfect Braids Calm Itch Relief 8oz", cat: "Hair Spray", retail: 22, stock: 360, art: "spray", tint: "#C77B3A" },
  { sku: "HSA-VIT-003", name: "Vitale Olive Oil Silk & Shine Holding Spritz 12oz", cat: "Leave-In", retail: 20, stock: 300, art: "spray", tint: "#A6892F" },
  { sku: "HSA-VIT-004", name: "Vitale Olive Oil Foam Wrap Lotion 237ml", cat: "Hair Styling", retail: 15, stock: 520, art: "bottle", tint: "#7C8F5A" },
  { sku: "HSA-KAL-001", name: "Kaleidoscope Miracle Drops Conditioner 8oz", cat: "Conditioner", retail: 20, stock: 410, art: "bottle", tint: "#8E4E8B" },
  { sku: "HSA-KAL-002", name: "Kaleidoscope Miracle Drops Original 2oz", cat: "Hair Oils & Serums", retail: 20, stock: 640, art: "dropper", tint: "#B0578C" },
  { sku: "HSA-DES-001", name: "Design Essentials Almond & Avocado Honey Curl Foaming Custard 354g", cat: "Curl Styling", retail: 35, stock: 220, art: "jar", tint: "#C9A03A" },
  { sku: "HSA-DES-002", name: "Design Essentials Honey Creme Moisture Retention Masque 7.5oz", cat: "Hair Mask", retail: 28, stock: 250, art: "jar", tint: "#D8A94E" },
  { sku: "HSA-DES-003", name: "Design Essentials Almond & Avocado Sulfate-Free Shampoo 356ml", cat: "Shampoo", retail: 22, stock: 380, art: "bottle", tint: "#6E8F63" },
  { sku: "HSA-DES-004", name: "Design Essentials Moisturising Oil Treatment 4oz", cat: "Hair Oils & Serums", retail: 28, stock: 290, art: "dropper", tint: "#9A7BB5" },
  { sku: "HSA-CON-001", name: "Creme of Nature Pure Honey Moisture & Twist Curling Mousse", cat: "Hair Mousse", retail: 20, stock: 340, art: "spray", tint: "#C98A2D" },
  { sku: "HSA-JML-001", name: "Jamaican Mango & Lime No More Itch Gro Spray 473ml", cat: "Braid Spray", retail: 30, stock: 400, art: "spray", tint: "#5D9E4C" },
  { sku: "HSA-SUN-001", name: "Sunny Isle Jamaican Black Castor Oil & Maintenance Combo", cat: "Gift Sets", retail: 65, stock: 120, art: "duo", tint: "#4E5D3A" },
  { sku: "HSA-SUN-002", name: "Sunny Isle Kids Care Combo", cat: "Kids Hair Care", retail: 65, stock: 110, art: "duo", tint: "#3E7FA0" },
  { sku: "HSA-SUN-003", name: "2x Sunny Isle Jamaican Black Castor Oil 8oz", cat: "Hair Oils & Serums", retail: 38, stock: 260, art: "duo", tint: "#6B4B2A" },
  { sku: "HSA-SNJ-001", name: "Shine n Jam Nourishing Scalp Oil 118ml", cat: "Hair Oils & Serums", retail: 50, stock: 180, art: "dropper", tint: "#C05A8E" },
  { sku: "HSA-AJK-001", name: "Aunt Jackie's Smooth + Swirl Edge Gel Extra Firm Hold 114g", cat: "Hair Gel", retail: 25, stock: 430, art: "jar", tint: "#7A4FA3" },
  { sku: "HSA-AJK-002", name: "Aunt Jackie's Elixir Essentials Collagen & Tea Tree Scalp Oil 59ml", cat: "Hair Oils & Serums", retail: 25, stock: 310, art: "dropper", tint: "#D46A96" },
  { sku: "HSA-JNT-001", name: "Janet Nala Tress 3X Afro Hot Twist Crochet Braid", cat: "Synthetic Braiding Hair", retail: 40, stock: 200, art: "braid", tint: "#2E2430" },
  { sku: "HSA-MIE-001", name: "Mielle Rosemary Mint Strengthening Shampoo & Mask Combo", cat: "Shampoo", retail: 59, stock: 150, art: "duo", tint: "#4C7A5A" },
];

// Pricing tiers — per-unit price by quantity ordered
const TIERS = [
  { label: "Pack of 1", range: "1–5 units", off: 0, min: 1 },
  { label: "Pack of 6", range: "6–11 units", off: 30, min: 6 },
  { label: "Pack of 12–48", range: "12–48 units", off: 45, min: 12 },
  { label: "48+ bulk", range: "49+ units", off: 55, min: 49 },
];
const unitPrice = (retail, qty) =>
  qty >= 49 ? retail * 0.45 : qty >= 12 ? retail * 0.55 : qty >= 6 ? retail * 0.7 : retail;
const tierOf = (qty) => (qty >= 49 ? 3 : qty >= 12 ? 2 : qty >= 6 ? 1 : 0);
const aud = (n) => "$" + n.toFixed(2);

// Simulated Australia Post postcode lookup (stand-in for the AusPost Postcode Search API)
const AUSPOST = {
  "2000": { suburb: "Sydney", state: "NSW" },
  "2150": { suburb: "Parramatta", state: "NSW" },
  "2170": { suburb: "Liverpool", state: "NSW" },
  "2560": { suburb: "Campbelltown", state: "NSW" },
  "2145": { suburb: "Westmead", state: "NSW" },
  "3000": { suburb: "Melbourne", state: "VIC" },
  "3175": { suburb: "Dandenong", state: "VIC" },
  "4000": { suburb: "Brisbane City", state: "QLD" },
  "5000": { suburb: "Adelaide", state: "SA" },
  "6000": { suburb: "Perth", state: "WA" },
  "7000": { suburb: "Hobart", state: "TAS" },
  "0800": { suburb: "Darwin City", state: "NT" },
  "2600": { suburb: "Canberra", state: "ACT" },
};

const seedOrders = [
  {
    id: "HSA-10041", user: "afrostyle@salon.com.au", name: "AfroStyle Salon (Business)",
    items: [{ sku: "HSA-MIE-001", qty: 12 }, { sku: "HSA-SUN-003", qty: 24 }],
    status: "pending", placed: "07 Jul 2026", ship: "12 Beauty Ln, Parramatta NSW 2150",
  },
  {
    id: "HSA-10038", user: "orders@curlbar.com.au", name: "The Curl Bar (Business)",
    items: [{ sku: "HSA-DES-001", qty: 48 }, { sku: "HSA-AJK-001", qty: 6 }],
    status: "finalized", placed: "05 Jul 2026", ship: "88 King St, Melbourne VIC 3000",
  },
  {
    id: "HSA-10032", user: "maya@gmail.com", name: "Maya T (Guest)",
    items: [{ sku: "HSA-KAL-002", qty: 6 }],
    status: "cancelled", placed: "02 Jul 2026", ship: "3/14 Ocean Rd, Brisbane City QLD 4000",
  },
];

/* ================= PRODUCT ART (SVG stand-ins for photography) ================= */
function ProductArt({ art, tint, big }) {
  const h = big ? 200 : 150;
  const cap = T.plumDark;
  const gid = "g-" + tint.replace("#", "");
  return (
    <svg viewBox="0 0 120 140" style={{ width: "100%", height: h, display: "block" }} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tint} stopOpacity="0.95" />
          <stop offset="100%" stopColor={tint} stopOpacity="0.65" />
        </linearGradient>
      </defs>
      {art === "bottle" && (<g>
        <rect x="50" y="14" width="20" height="12" rx="3" fill={cap} />
        <path d="M46 30 h28 v14 c8 6 10 12 10 22 v50 a8 8 0 0 1 -8 8 H44 a8 8 0 0 1 -8 -8 V66 c0-10 2-16 10-22 z" fill={`url(#${gid})`} />
        <rect x="42" y="72" width="36" height="34" rx="4" fill="#fff" opacity="0.85" />
      </g>)}
      {art === "spray" && (<g>
        <path d="M52 12 h22 v10 l8 6 v8 H50 v-14 z" fill={cap} />
        <rect x="46" y="36" width="30" height="10" fill={cap} opacity="0.7" />
        <path d="M44 46 h34 v66 a8 8 0 0 1 -8 8 H52 a8 8 0 0 1 -8 -8 z" fill={`url(#${gid})`} />
        <rect x="48" y="62" width="26" height="32" rx="4" fill="#fff" opacity="0.85" />
      </g>)}
      {art === "jar" && (<g>
        <rect x="34" y="34" width="52" height="16" rx="6" fill={cap} />
        <path d="M36 50 h48 v54 a10 10 0 0 1 -10 10 H46 a10 10 0 0 1 -10 -10 z" fill={`url(#${gid})`} />
        <rect x="42" y="62" width="36" height="26" rx="4" fill="#fff" opacity="0.85" />
      </g>)}
      {art === "dropper" && (<g>
        <rect x="54" y="8" width="12" height="10" rx="3" fill={cap} />
        <rect x="57" y="18" width="6" height="22" fill={cap} opacity="0.6" />
        <path d="M46 40 h28 v10 c6 6 8 12 8 20 v34 a8 8 0 0 1 -8 8 H46 a8 8 0 0 1 -8 -8 V70 c0-8 2-14 8-20 z" fill={`url(#${gid})`} />
        <rect x="46" y="72" width="28" height="24" rx="4" fill="#fff" opacity="0.85" />
      </g>)}
      {art === "duo" && (<g>
        <rect x="30" y="26" width="14" height="8" rx="2" fill={cap} />
        <path d="M28 34 h18 v10 c5 4 6 8 6 14 v46 a6 6 0 0 1 -6 6 H28 a6 6 0 0 1 -6 -6 V58 c0-6 1-10 6-14 z" fill={`url(#${gid})`} />
        <rect x="66" y="40" width="30" height="10" rx="4" fill={cap} />
        <path d="M68 50 h26 v50 a8 8 0 0 1 -8 8 h-10 a8 8 0 0 1 -8 -8 z" fill={tint} opacity="0.7" />
        <rect x="27" y="60" width="16" height="20" rx="3" fill="#fff" opacity="0.85" />
        <rect x="72" y="60" width="18" height="20" rx="3" fill="#fff" opacity="0.85" />
      </g>)}
      {art === "braid" && (<g>
        <path d="M48 16 q22 0 22 22 v70 q0 14 -10 14 t-10-14 z" fill={tint} />
        <path d="M52 16 q-22 0 -22 22 v70 q0 14 10 14 t10-14 z" fill={tint} opacity="0.8" />
        {[30, 46, 62, 78, 94].map((y) => (
          <path key={y} d={`M32 ${y} q28 10 56 0`} stroke="#fff" strokeOpacity="0.35" strokeWidth="3" fill="none" />
        ))}
        <rect x="40" y="20" width="40" height="10" rx="5" fill={T.honey} />
      </g>)}
    </svg>
  );
}

/* ================= SMALL UI ================= */
const Btn = ({ children, onClick, tone = "plum", small, disabled, style }) => {
  const bg = tone === "plum" ? T.plum : tone === "honey" ? T.honey : tone === "ghost" ? "transparent" : tone === "red" ? T.red : T.green;
  const fg = tone === "ghost" ? T.plum : tone === "honey" ? T.ink : "#fff";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...body, background: bg, color: fg, border: tone === "ghost" ? `1.5px solid ${T.plum}` : "none",
      borderRadius: 8, padding: small ? "6px 12px" : "11px 20px", fontWeight: 700,
      fontSize: small ? 12.5 : 14, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1, display: "inline-flex", alignItems: "center", gap: 7, ...style,
    }}>{children}</button>
  );
};
const Field = ({ label, value, onChange, type = "text", placeholder, required, hint }) => (
  <label style={{ display: "block", marginBottom: 12 }}>
    <div style={{ ...body, fontSize: 12, fontWeight: 700, color: T.plumDark, marginBottom: 5, letterSpacing: 0.3 }}>
      {label}{required && <span style={{ color: T.red }}> *</span>}
    </div>
    <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...body, width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${T.line}`, fontSize: 14, background: "#fff", color: T.ink, outline: "none" }} />
    {hint && <div style={{ ...body, fontSize: 11.5, color: "#8a7d72", marginTop: 4 }}>{hint}</div>}
  </label>
);
const StatusPill = ({ s }) => {
  const map = {
    pending: { bg: T.honeySoft, fg: "#8a6410", t: "Current" },
    finalized: { bg: "#DFEEE2", fg: T.green, t: "Finalized" },
    cancelled: { bg: "#F5DDD8", fg: T.red, t: "Cancelled" },
  }[s];
  return <span style={{ ...body, background: map.bg, color: map.fg, fontSize: 11.5, fontWeight: 800, padding: "4px 10px", borderRadius: 99, letterSpacing: 0.4, textTransform: "uppercase" }}>{map.t}</span>;
};

/* ================= APP ================= */
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("shop"); // shop | login | cart | checkout | done | orders | admin
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]); // {sku, qty}
  const [orders, setOrders] = useState(seedOrders);
  const [lastOrder, setLastOrder] = useState(null);
  const [toast, setToast] = useState("");

  const ping = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2400); };

  // Search: case-insensitive, "contains" match across name, category and SKU
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [query]);

  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const cartTotal = cart.reduce((a, c) => {
    const p = PRODUCTS.find((x) => x.sku === c.sku);
    return a + unitPrice(p.retail, c.qty) * c.qty;
  }, 0);

  const addToCart = (sku, qty) => {
    setCart((prev) => {
      const e = prev.find((c) => c.sku === sku);
      return e ? prev.map((c) => (c.sku === sku ? { ...c, qty: c.qty + qty } : c)) : [...prev, { sku, qty }];
    });
    ping(`Added ${qty} × ${PRODUCTS.find((p) => p.sku === sku).name.split(" ").slice(0, 3).join(" ")}…`);
  };
  const setQty = (sku, qty) => setCart((p) => (qty <= 0 ? p.filter((c) => c.sku !== sku) : p.map((c) => (c.sku === sku ? { ...c, qty } : c))));

  const placeOrder = (ship) => {
    const o = {
      id: "HSA-" + (10000 + Math.floor(Math.random() * 89999)),
      user: user.email, name: `${user.type === "business" ? user.businessName : user.name} (${user.type === "business" ? "Business" : "Guest"})`,
      items: cart.map((c) => ({ ...c })), status: "pending",
      placed: new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }),
      ship,
    };
    setOrders((p) => [o, ...p]);
    setLastOrder(o); setCart([]); setView("done");
  };

  const orderTotal = (o) => o.items.reduce((a, i) => {
    const p = PRODUCTS.find((x) => x.sku === i.sku);
    return a + unitPrice(p.retail, i.qty) * i.qty;
  }, 0);

  return (
    <div style={{ ...body, background: T.paper, minHeight: "100vh", color: T.ink }}>
      <TopBar {...{ user, setUser, setView, view, cartCount, ping }} />
      {view === "shop" && <Shop {...{ user, query, setQuery, results, addToCart, setView }} />}
      {view === "login" && <Login onLogin={(u) => { setUser(u); setView(u.type === "admin" ? "admin" : "shop"); ping(u.type === "admin" ? "Signed in as admin" : "Welcome — wholesale pricing unlocked"); }} back={() => setView("shop")} />}
      {view === "cart" && <Cart {...{ cart, setQty, cartTotal, setView, user }} />}
      {view === "checkout" && <Checkout {...{ user, cart, cartTotal, placeOrder, setView }} />}
      {view === "done" && lastOrder && <Confirmation order={lastOrder} total={orderTotal(lastOrder)} user={user} goShop={() => setView("shop")} goOrders={() => setView("orders")} />}
      {view === "orders" && user && <MyOrders {...{ user, orders, setOrders, orderTotal, ping, setView }} />}
      {view === "admin" && user?.type === "admin" && <Admin {...{ orders, setOrders, orderTotal, ping }} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", background: T.ink, color: "#fff", padding: "11px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", zIndex: 90, maxWidth: "90vw" }}>
          {toast}
        </div>
      )}
      <footer style={{ borderTop: `1px solid ${T.line}`, marginTop: 48, padding: "26px 24px", textAlign: "center", color: "#8a7d72", fontSize: 12.5 }}>
        Hair Suppliers Australia — wholesale partner of Nature's Hair retail stores · ABN required for trade accounts · Demo build (branding not final)
      </footer>
    </div>
  );
}

/* ================= TOP BAR ================= */
function TopBar({ user, setUser, setView, view, cartCount, ping }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ background: T.plumDark, color: T.honeySoft, textAlign: "center", fontSize: 12, padding: "7px 12px", letterSpacing: 0.5 }}>
        TRADE ONLY · Up to 55% off retail on bulk packs · Ships Australia-wide via Australia Post eParcel
      </div>
      <header style={{ background: T.card, borderBottom: `1px solid ${T.line}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div onClick={() => setView("shop")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          {/* Placeholder logo — not final */}
          <div style={{ width: 42, height: 42, borderRadius: "50% 50% 50% 6px", background: `linear-gradient(135deg, ${T.plum}, ${T.plumDark})`, display: "grid", placeItems: "center" }}>
            <Leaf size={20} color={T.honey} />
          </div>
          <div>
            <div style={{ ...display, fontSize: 19, fontWeight: 700, color: T.plumDark, lineHeight: 1 }}>Hair Suppliers Australia</div>
            <div style={{ fontSize: 10.5, letterSpacing: 2.2, color: T.honey, fontWeight: 800, marginTop: 2 }}>WHOLESALE PORTAL</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {user && user.type !== "admin" && (
          <Btn tone="ghost" small onClick={() => setView("orders")}><Package size={15} /> My orders</Btn>
        )}
        {user?.type === "admin" && (
          <Btn tone="ghost" small onClick={() => setView("admin")}><Shield size={15} /> Admin dashboard</Btn>
        )}
        {user && user.type !== "admin" && (
          <button onClick={() => setView("cart")} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 6 }}>
            <ShoppingCart size={22} color={T.plumDark} />
            {cartCount > 0 && <span style={{ position: "absolute", top: -2, right: -4, background: T.honey, color: T.ink, fontSize: 10.5, fontWeight: 800, borderRadius: 99, padding: "1px 6px" }}>{cartCount}</span>}
          </button>
        )}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{user.type === "business" ? user.businessName : user.name}</div>
              <div style={{ fontSize: 11, color: "#8a7d72" }}>{user.type === "admin" ? "Administrator" : user.type === "business" ? "Business account" : "Guest account"}</div>
            </div>
            <Btn small tone="ghost" onClick={() => { setUser(null); setView("shop"); ping("Signed out"); }}><LogOut size={14} /> Sign out</Btn>
          </div>
        ) : (
          <Btn onClick={() => setView("login")}><User size={16} /> Login to order</Btn>
        )}
      </header>
    </div>
  );
}

/* ================= SHOP / LANDING ================= */
function Shop({ user, query, setQuery, results, addToCart, setView }) {
  const loggedIn = user && user.type !== "admin";
  return (
    <div>
      {/* Hero */}
      <section style={{ background: `linear-gradient(160deg, ${T.plumDark} 0%, ${T.plum} 70%)`, color: "#fff", padding: "52px 24px 60px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 36, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 3, color: T.honey, fontWeight: 800, marginBottom: 14 }}>SAME PRODUCTS AS NATURE'S HAIR RETAIL — AT TRADE PRICES</div>
            <h1 style={{ ...display, fontSize: "clamp(30px, 4.5vw, 46px)", lineHeight: 1.12, margin: "0 0 16px", fontWeight: 700 }}>
              Stock your salon shelves with the brands your clients already ask for.
            </h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "#EBDDE6", maxWidth: 520, margin: "0 0 22px" }}>
              Mielle, Design Essentials, Sunny Isle, Aunt Jackie's, Kaleidoscope and more — the full Nature's Hair
              range, packed by the carton and shipped Australia-wide. Sign in to unlock four tiers of wholesale pricing.
            </p>
            {!loggedIn && <Btn tone="honey" onClick={() => setView("login")}><Lock size={15} /> Login to see prices</Btn>}
            <div style={{ display: "flex", gap: 26, marginTop: 30, flexWrap: "wrap" }}>
              {[["30%", "off packs of 6"], ["45%", "off 12–48 units"], ["55%", "off 48+ units"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ ...display, fontSize: 30, color: T.honey, fontWeight: 700 }}>{n}</div>
                  <div style={{ fontSize: 12, color: "#D9C4D2", letterSpacing: 0.4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Lifestyle panel — illustrated stand-ins for lifestyle photography */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <LifestyleTile label="Salon back-bar" grad={["#C98A2D", "#8a5a12"]} icon="scissors" />
            <LifestyleTile label="Wash-day ritual" grad={["#8E4E8B", "#4d2450"]} icon="drop" tall />
            <LifestyleTile label="Protective styles" grad={["#4C7A5A", "#23412c"]} icon="braid" tall />
            <LifestyleTile label="Retail shelf-ready" grad={["#B0578C", "#5c2246"]} icon="box" />
          </div>
        </div>
      </section>

      {/* Search + grid */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
          <h2 style={{ ...display, fontSize: 26, color: T.plumDark, margin: 0 }}>Product catalogue</h2>
          <span style={{ fontSize: 12.5, color: "#8a7d72" }}>{results.length} of {PRODUCTS.length} products</span>
        </div>
        <div style={{ position: "relative", maxWidth: 520, margin: "10px 0 26px" }}>
          <Search size={17} color="#9b8d81" style={{ position: "absolute", left: 13, top: 12 }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search anything — try "oil", "MIELLE", or "shampoo"'
            style={{ ...body, width: "100%", boxSizing: "border-box", padding: "11px 14px 11px 40px", borderRadius: 10, border: `1.5px solid ${T.line}`, fontSize: 14, background: "#fff", outline: "none" }} />
        </div>
        {results.length === 0 && (
          <div style={{ background: "#fff", border: `1.5px dashed ${T.line}`, borderRadius: 12, padding: 40, textAlign: "center", color: "#8a7d72" }}>
            No products contain "{query}". Try a shorter word — search matches any part of the name, brand, category or SKU.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18, paddingBottom: 20 }}>
          {results.map((p) => <ProductCard key={p.sku} p={p} loggedIn={loggedIn} addToCart={addToCart} setView={setView} />)}
        </div>
      </section>
    </div>
  );
}

function LifestyleTile({ label, grad, icon, tall }) {
  return (
    <div style={{ background: `linear-gradient(150deg, ${grad[0]}, ${grad[1]})`, borderRadius: 14, minHeight: tall ? 150 : 110, padding: 14, display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", overflow: "hidden" }}>
      <svg viewBox="0 0 100 100" style={{ position: "absolute", right: -12, top: -12, width: 90, opacity: 0.25 }}>
        {icon === "drop" && <path d="M50 10 C70 40 82 55 82 70 a32 32 0 1 1 -64 0 C18 55 30 40 50 10z" fill="#fff" />}
        {icon === "braid" && <g fill="none" stroke="#fff" strokeWidth="7"><path d="M35 5 q30 25 0 50 q-30 25 0 50" /><path d="M65 5 q-30 25 0 50 q30 25 0 50" /></g>}
        {icon === "scissors" && <g fill="#fff"><circle cx="30" cy="75" r="12" /><circle cx="70" cy="75" r="12" /><path d="M30 70 L60 10 h8 L38 72z" /><path d="M70 70 L40 10 h-8 L62 72z" /></g>}
        {icon === "box" && <g fill="#fff"><path d="M50 12 90 32 50 52 10 32z" /><path d="M10 36 50 56 v34 L10 70z" opacity="0.8" /><path d="M90 36 50 56 v34 L90 70z" opacity="0.6" /></g>}
      </svg>
      <div style={{ ...body, color: "#fff", fontWeight: 800, fontSize: 13.5, letterSpacing: 0.3 }}>{label}</div>
    </div>
  );
}

/* ================= PRODUCT CARD ================= */
function ProductCard({ p, loggedIn, addToCart, setView }) {
  const [qty, setQtyLocal] = useState(1);
  const active = tierOf(qty);
  const u = unitPrice(p.retail, qty);
  return (
    <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ background: `linear-gradient(180deg, ${T.honeySoft}33, #fff)`, padding: "14px 10px 4px" }}>
        <ProductArt art={p.art} tint={p.tint} />
      </div>
      <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 10.5, letterSpacing: 1.4, color: T.honey, fontWeight: 800, textTransform: "uppercase" }}>{p.cat}</div>
        <div style={{ ...display, fontSize: 15.5, fontWeight: 700, color: T.plumDark, lineHeight: 1.3, margin: "5px 0 4px", minHeight: 40 }}>{p.name}</div>
        <div style={{ fontSize: 11.5, color: "#9b8d81", marginBottom: 10 }}>SKU {p.sku} · {p.stock} in stock</div>

        {!loggedIn ? (
          <div style={{ marginTop: "auto" }}>
            <div style={{ background: T.paper, border: `1.5px dashed ${T.line}`, borderRadius: 10, padding: "12px 12px", display: "flex", alignItems: "center", gap: 9, color: "#7d6f63", fontSize: 12.5 }}>
              <Lock size={14} color={T.plum} /> Wholesale pricing hidden — login to view
            </div>
            <Btn small tone="ghost" style={{ marginTop: 10, width: "100%", justifyContent: "center" }} onClick={() => setView("login")}>
              <Eye size={14} /> Login to see prices
            </Btn>
          </div>
        ) : (
          <div style={{ marginTop: "auto" }}>
            {/* Tier table */}
            <div style={{ border: `1px solid ${T.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
              {TIERS.map((t, i) => (
                <div key={t.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 10px", fontSize: 12, background: active === i ? T.honeySoft : i % 2 ? "#FCFAF6" : "#fff", fontWeight: active === i ? 800 : 500, color: active === i ? "#7a5a0e" : T.ink }}>
                  <span>{t.label} <span style={{ color: "#a99a8d", fontWeight: 500 }}>({t.range})</span></span>
                  <span>{aud(p.retail * (1 - t.off / 100))}/u{t.off ? ` · ${t.off}% off` : ""}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${T.line}`, borderRadius: 8 }}>
                <button onClick={() => setQtyLocal(Math.max(1, qty - 1))} style={{ border: "none", background: "none", padding: "7px 9px", cursor: "pointer" }}><Minus size={13} /></button>
                <input value={qty} onChange={(e) => setQtyLocal(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 40, textAlign: "center", border: "none", outline: "none", fontSize: 14, fontWeight: 700, ...body }} />
                <button onClick={() => setQtyLocal(qty + 1)} style={{ border: "none", background: "none", padding: "7px 9px", cursor: "pointer" }}><Plus size={13} /></button>
              </div>
              <Btn small onClick={() => addToCart(p.sku, qty)} style={{ flex: 1, justifyContent: "center" }}>
                <ShoppingCart size={14} /> Add · {aud(u * qty)}
              </Btn>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {[1, 6, 12, 49].map((n) => (
                <button key={n} onClick={() => setQtyLocal(n)} style={{ ...body, flex: 1, fontSize: 11, fontWeight: 700, padding: "4px 0", borderRadius: 6, border: `1px solid ${qty === n ? T.honey : T.line}`, background: qty === n ? T.honeySoft : "#fff", cursor: "pointer", color: T.ink }}>
                  {n === 49 ? "48+" : `×${n}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= LOGIN ================= */
function Login({ onLogin, back }) {
  const [tab, setTab] = useState("guest");
  const [f, setF] = useState({ name: "", email: "", phone: "", street: "", suburb: "", state: "", postcode: "", businessName: "", abn: "", adminEmail: "", adminPass: "" });
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const up = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const lookupPostcode = () => {
    const hit = AUSPOST[f.postcode];
    if (hit) { setF((p) => ({ ...p, suburb: hit.suburb, state: hit.state })); setErr(""); }
    else setErr(`Postcode ${f.postcode || "—"} not found in the demo Australia Post dataset (try 2000, 2150, 3000, 4000…). In production this calls the AusPost Postcode Search API.`);
  };

  const submit = () => {
    setErr("");
    if (tab === "guest") {
      if (!f.name || !f.email.includes("@") || !f.phone) return setErr("Please complete the contact form (name, valid email and phone).");
      if (!f.street || !f.suburb || !f.state || !/^\d{4}$/.test(f.postcode)) return setErr("Please complete the shipping address — postcode must be 4 digits.");
      onLogin({ type: "guest", name: f.name, email: f.email, phone: f.phone, address: `${f.street}, ${f.suburb} ${f.state} ${f.postcode}` });
    } else if (tab === "business") {
      if (!f.name || !f.email.includes("@") || !f.phone) return setErr("Please complete the contact form (name, valid email and phone).");
      if (!f.businessName) return setErr("Business name is required.");
      if (!/^\d{11}$/.test(f.abn.replace(/\s/g, ""))) return setErr("ABN must be 11 digits (e.g. 51 824 753 556).");
      onLogin({ type: "business", name: f.name, email: f.email, phone: f.phone, businessName: f.businessName, abn: f.abn });
    } else {
      if (f.adminEmail === "admin@hairsuppliers.com.au" && f.adminPass === "admin123") {
        onLogin({ type: "admin", name: "HSA Admin", email: f.adminEmail });
      } else setErr("Invalid admin credentials.");
    }
  };

  const TabBtn = ({ id, icon, label }) => (
    <button onClick={() => { setTab(id); setErr(""); }} style={{ ...body, flex: 1, padding: "11px 6px", border: "none", borderBottom: `3px solid ${tab === id ? T.honey : "transparent"}`, background: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, color: tab === id ? T.plumDark : "#9b8d81", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      {icon}{label}
    </button>
  );

  return (
    <div style={{ maxWidth: 560, margin: "36px auto", padding: "0 20px" }}>
      <button onClick={back} style={{ ...body, background: "none", border: "none", color: T.plum, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 14, fontSize: 13 }}>
        <ChevronLeft size={16} /> Back to catalogue
      </button>
      <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 30px rgba(61,30,51,0.08)" }}>
        <div style={{ background: T.plumDark, padding: "22px 26px" }}>
          <h2 style={{ ...display, color: "#fff", margin: 0, fontSize: 24 }}>Login portal</h2>
          <p style={{ color: "#D9C4D2", fontSize: 13, margin: "6px 0 0" }}>Prices stay hidden until you sign in. Choose an account type below.</p>
        </div>
        <div style={{ display: "flex", borderBottom: `1px solid ${T.line}` }}>
          <TabBtn id="guest" icon={<User size={15} />} label="Guest" />
          <TabBtn id="business" icon={<Building2 size={15} />} label="Business" />
          <TabBtn id="admin" icon={<Shield size={15} />} label="Admin" />
        </div>
        <div style={{ padding: "22px 26px 26px" }}>
          {tab !== "admin" && (
            <>
              <div style={{ fontSize: 12, letterSpacing: 1.5, fontWeight: 800, color: T.honey, marginBottom: 10 }}>CONTACT FORM</div>
              <Field label="Full name" value={f.name} onChange={up("name")} required placeholder="Jordan Nguyen" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Email" type="email" value={f.email} onChange={up("email")} required placeholder="you@example.com" />
                <Field label="Phone" value={f.phone} onChange={up("phone")} required placeholder="0412 345 678" />
              </div>
            </>
          )}
          {tab === "guest" && (
            <>
              <div style={{ fontSize: 12, letterSpacing: 1.5, fontWeight: 800, color: T.honey, margin: "10px 0" }}>SHIPPING ADDRESS</div>
              <Field label="Street address" value={f.street} onChange={up("street")} required placeholder="12 Beauty Lane" />
              <div style={{ display: "grid", gridTemplateColumns: "110px 1fr auto", gap: 10, alignItems: "end" }}>
                <Field label="Postcode" value={f.postcode} onChange={up("postcode")} required placeholder="2150" />
                <Field label="Suburb" value={f.suburb} onChange={up("suburb")} required placeholder="Auto-fills from postcode" />
                <div style={{ marginBottom: 12 }}>
                  <Btn small tone="honey" onClick={lookupPostcode}><MapPin size={13} /> Look up</Btn>
                </div>
              </div>
              <Field label="State" value={f.state} onChange={up("state")} required placeholder="NSW" hint="Postcode look-up simulates the Australia Post Postcode Search API." />
            </>
          )}
          {tab === "business" && (
            <>
              <div style={{ fontSize: 12, letterSpacing: 1.5, fontWeight: 800, color: T.honey, margin: "10px 0" }}>BUSINESS DETAILS</div>
              <Field label="Business name" value={f.businessName} onChange={up("businessName")} required placeholder="The Curl Bar Pty Ltd" />
              <Field label="ABN" value={f.abn} onChange={up("abn")} required placeholder="51 824 753 556" hint="11 digits — verified against the ABR in production." />
            </>
          )}
          {tab === "admin" && (
            <>
              <Field label="Admin email" value={f.adminEmail} onChange={up("adminEmail")} placeholder="admin@hairsuppliers.com.au" />
              <label style={{ display: "block", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.plumDark, marginBottom: 5 }}>Password</div>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={f.adminPass} onChange={(e) => up("adminPass")(e.target.value)}
                    style={{ ...body, width: "100%", boxSizing: "border-box", padding: "10px 40px 10px 12px", borderRadius: 8, border: `1.5px solid ${T.line}`, fontSize: 14 }} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 8, top: 8, background: "none", border: "none", cursor: "pointer" }}>
                    {showPass ? <EyeOff size={16} color="#9b8d81" /> : <Eye size={16} color="#9b8d81" />}
                  </button>
                </div>
              </label>
              <div style={{ fontSize: 11.5, color: "#8a7d72", background: T.paper, borderRadius: 8, padding: "8px 12px", marginBottom: 4 }}>
                Demo credentials: <b>admin@hairsuppliers.com.au</b> / <b>admin123</b>
              </div>
            </>
          )}
          {err && <div style={{ background: "#F5DDD8", color: T.red, fontSize: 12.5, fontWeight: 600, borderRadius: 8, padding: "9px 12px", margin: "6px 0 12px" }}>{err}</div>}
          <Btn onClick={submit} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
            {tab === "admin" ? <><Shield size={15} /> Sign in as admin</> : <><Lock size={15} /> Sign in & unlock pricing</>}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ================= CART ================= */
function Cart({ cart, setQty, cartTotal, setView, user }) {
  return (
    <div style={{ maxWidth: 780, margin: "32px auto", padding: "0 20px" }}>
      <h2 style={{ ...display, fontSize: 28, color: T.plumDark, margin: "0 0 4px" }}>Your cart</h2>
      <p style={{ fontSize: 13, color: "#8a7d72", margin: "0 0 20px" }}>Per-unit price updates automatically as quantities cross tier thresholds.</p>
      {cart.length === 0 ? (
        <div style={{ background: "#fff", border: `1.5px dashed ${T.line}`, borderRadius: 14, padding: 44, textAlign: "center", color: "#8a7d72" }}>
          Your cart is empty. <Btn small tone="ghost" style={{ marginLeft: 10 }} onClick={() => setView("shop")}>Browse catalogue</Btn>
        </div>
      ) : (
        <>
          {cart.map((c) => {
            const p = PRODUCTS.find((x) => x.sku === c.sku);
            const u = unitPrice(p.retail, c.qty);
            const t = TIERS[tierOf(c.qty)];
            return (
              <div key={c.sku} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 12, padding: 14, display: "flex", gap: 14, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ width: 64, flexShrink: 0 }}><ProductArt art={p.art} tint={p.tint} /></div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#9b8d81" }}>SKU {p.sku} · {t.label}{t.off ? ` (${t.off}% off)` : ""} · {aud(u)}/unit</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${T.line}`, borderRadius: 8 }}>
                  <button onClick={() => setQty(c.sku, c.qty - 1)} style={{ border: "none", background: "none", padding: "7px 10px", cursor: "pointer" }}><Minus size={13} /></button>
                  <span style={{ width: 36, textAlign: "center", fontWeight: 700 }}>{c.qty}</span>
                  <button onClick={() => setQty(c.sku, c.qty + 1)} style={{ border: "none", background: "none", padding: "7px 10px", cursor: "pointer" }}><Plus size={13} /></button>
                </div>
                <div style={{ fontWeight: 800, width: 86, textAlign: "right" }}>{aud(u * c.qty)}</div>
                <button onClick={() => setQty(c.sku, 0)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={17} color={T.red} /></button>
              </div>
            );
          })}
          <div style={{ background: T.plumDark, color: "#fff", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#D9C4D2" }}>Order total (ex. shipping)</div>
              <div style={{ ...display, fontSize: 26, fontWeight: 700 }}>{aud(cartTotal)}</div>
            </div>
            <Btn tone="honey" onClick={() => setView("checkout")}><Truck size={16} /> Continue to checkout</Btn>
          </div>
        </>
      )}
    </div>
  );
}

/* ================= CHECKOUT ================= */
function Checkout({ user, cart, cartTotal, placeOrder, setView }) {
  const guestAddr = user.type === "guest" ? user.address : "";
  const [street, setStreet] = useState(user.type === "guest" ? user.address.split(",")[0] : "");
  const [postcode, setPostcode] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");
  const [usingSaved, setUsingSaved] = useState(user.type === "guest");
  const [card, setCard] = useState({ num: "", exp: "", cvv: "", name: "" });
  const [err, setErr] = useState("");
  const [paying, setPaying] = useState(false);
  const shippingFee = cartTotal >= 300 ? 0 : 18.95;

  const lookup = () => {
    const hit = AUSPOST[postcode];
    if (hit) { setSuburb(hit.suburb); setState(hit.state); setErr(""); }
    else setErr(`Postcode not found in the demo Australia Post dataset (try 2000, 2150, 3000, 4000…).`);
  };

  const pay = () => {
    setErr("");
    const ship = usingSaved ? guestAddr : `${street}, ${suburb} ${state} ${postcode}`;
    if (!usingSaved && (!street || !suburb || !state || !/^\d{4}$/.test(postcode))) return setErr("Complete the shipping address — 4-digit postcode required.");
    if (card.num.replace(/\s/g, "").length < 15 || !card.exp || card.cvv.length < 3 || !card.name) return setErr("Enter valid card details (demo — no real payment is taken).");
    setPaying(true);
    setTimeout(() => placeOrder(ship), 900);
  };

  return (
    <div style={{ maxWidth: 860, margin: "32px auto", padding: "0 20px" }}>
      <button onClick={() => setView("cart")} style={{ ...body, background: "none", border: "none", color: T.plum, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 12, fontSize: 13 }}>
        <ChevronLeft size={16} /> Back to cart
      </button>
      <h2 style={{ ...display, fontSize: 28, color: T.plumDark, margin: "0 0 20px" }}>Checkout</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        <div>
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, padding: 20, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, marginBottom: 12 }}><Truck size={17} color={T.plum} /> Shipping address <span style={{ fontSize: 10.5, background: T.honeySoft, color: "#7a5a0e", borderRadius: 6, padding: "2px 7px", fontWeight: 800 }}>AusPost validated*</span></div>
            {user.type === "guest" && (
              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, marginBottom: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={usingSaved} onChange={(e) => setUsingSaved(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Use my saved address: <b>{guestAddr}</b></span>
              </label>
            )}
            {!usingSaved && (
              <>
                <Field label="Street address" value={street} onChange={setStreet} required placeholder="88 King St" />
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 10, alignItems: "end" }}>
                  <Field label="Postcode" value={postcode} onChange={setPostcode} required placeholder="3000" />
                  <Field label="Suburb" value={suburb} onChange={setSuburb} required />
                  <div style={{ marginBottom: 12 }}><Btn small tone="honey" onClick={lookup}><MapPin size={13} /> Look up</Btn></div>
                </div>
                <Field label="State" value={state} onChange={setState} required placeholder="VIC" />
              </>
            )}
            <div style={{ fontSize: 11, color: "#9b8d81" }}>*Demo simulates the Australia Post Postcode Search API. Production would call the live endpoint with an API key.</div>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, marginBottom: 12 }}><CreditCard size={17} color={T.plum} /> Payment <span style={{ fontSize: 10.5, background: "#E8E4F5", color: "#4b3a86", borderRadius: 6, padding: "2px 7px", fontWeight: 800 }}>Demo only</span></div>
            <Field label="Name on card" value={card.name} onChange={(v) => setCard({ ...card, name: v })} required placeholder="J NGUYEN" />
            <Field label="Card number" value={card.num} onChange={(v) => setCard({ ...card, num: v })} required placeholder="4111 1111 1111 1111" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Expiry" value={card.exp} onChange={(v) => setCard({ ...card, exp: v })} required placeholder="08/28" />
              <Field label="CVV" value={card.cvv} onChange={(v) => setCard({ ...card, cvv: v })} required placeholder="123" />
            </div>
          </div>
        </div>
        <div>
          <div style={{ background: T.plumDark, color: "#fff", borderRadius: 14, padding: 20, position: "sticky", top: 120 }}>
            <div style={{ ...display, fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Order summary</div>
            {cart.map((c) => {
              const p = PRODUCTS.find((x) => x.sku === c.sku);
              const u = unitPrice(p.retail, c.qty);
              return (
                <div key={c.sku} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ color: "#EBDDE6" }}>{c.qty} × {p.name.slice(0, 34)}{p.name.length > 34 ? "…" : ""}<br /><span style={{ fontSize: 11, color: "#C6A9BC" }}>{aud(u)}/u · {TIERS[tierOf(c.qty)].label}</span></span>
                  <b>{aud(u * c.qty)}</b>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "10px 0 4px", color: "#EBDDE6" }}>
              <span>Shipping (AusPost eParcel)</span><b>{shippingFee === 0 ? "FREE over $300" : aud(shippingFee)}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 12, borderTop: `2px solid ${T.honey}` }}>
              <span style={{ fontSize: 13 }}>Total</span>
              <span style={{ ...display, fontSize: 26, fontWeight: 700, color: T.honey }}>{aud(cartTotal + shippingFee)}</span>
            </div>
            {err && <div style={{ background: "#F5DDD8", color: T.red, fontSize: 12.5, fontWeight: 600, borderRadius: 8, padding: "9px 12px", margin: "12px 0 0" }}>{err}</div>}
            <Btn tone="honey" onClick={pay} disabled={paying || cart.length === 0} style={{ width: "100%", justifyContent: "center", marginTop: 14 }}>
              {paying ? "Processing payment…" : <><Lock size={15} /> Pay {aud(cartTotal + shippingFee)}</>}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= CONFIRMATION + EMAIL ================= */
function Confirmation({ order, total, user, goShop, goOrders }) {
  return (
    <div style={{ maxWidth: 640, margin: "36px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <CheckCircle2 size={52} color={T.green} />
        <h2 style={{ ...display, fontSize: 30, color: T.plumDark, margin: "10px 0 6px" }}>Order {order.id} confirmed</h2>
        <p style={{ color: "#8a7d72", fontSize: 14, margin: 0 }}>A confirmation email has been sent to <b>{user.email}</b> (simulated below). You can edit or cancel this order from "My orders" until our team finalizes it.</p>
      </div>
      {/* Simulated confirmation email */}
      <div style={{ border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden", background: "#fff", boxShadow: "0 10px 26px rgba(61,30,51,0.08)" }}>
        <div style={{ background: T.paper, padding: "12px 18px", borderBottom: `1px solid ${T.line}`, display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: "#7d6f63" }}>
          <Mail size={15} color={T.plum} /> <b>From:</b> orders@hairsuppliers.com.au &nbsp; <b>To:</b> {user.email}
        </div>
        <div style={{ padding: "22px 24px" }}>
          <div style={{ ...display, fontSize: 20, fontWeight: 700, color: T.plumDark }}>Thanks for your wholesale order!</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#5b4d52" }}>
            Hi {user.name} — we've received order <b>{order.id}</b> placed on {order.placed}. It's now in the
            <b> current orders</b> queue awaiting review. Once finalized it will be picked, packed and lodged with
            Australia Post eParcel to: <b>{order.ship}</b>.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ textAlign: "left", color: "#9b8d81", fontSize: 11.5 }}>
              <th style={{ padding: "6px 0" }}>SKU</th><th>Item</th><th>Qty</th><th style={{ textAlign: "right" }}>Line</th>
            </tr></thead>
            <tbody>
              {order.items.map((i) => {
                const p = PRODUCTS.find((x) => x.sku === i.sku);
                const u = unitPrice(p.retail, i.qty);
                return (
                  <tr key={i.sku} style={{ borderTop: `1px solid ${T.line}` }}>
                    <td style={{ padding: "8px 6px 8px 0", color: "#9b8d81", fontSize: 11.5 }}>{p.sku}</td>
                    <td style={{ padding: "8px 6px 8px 0" }}>{p.name}</td>
                    <td>{i.qty} @ {aud(u)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{aud(u * i.qty)}</td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: `2px solid ${T.plumDark}` }}>
                <td colSpan={3} style={{ padding: "10px 0", fontWeight: 800 }}>Order total (ex. shipping)</td>
                <td style={{ textAlign: "right", fontWeight: 800, color: T.plum }}>{aud(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 22 }}>
        <Btn tone="ghost" onClick={goShop}>Keep shopping</Btn>
        <Btn onClick={goOrders}><Package size={15} /> View my orders</Btn>
      </div>
    </div>
  );
}

/* ================= MY ORDERS (customer) ================= */
function MyOrders({ user, orders, setOrders, orderTotal, ping, setView }) {
  const mine = orders.filter((o) => o.user === user.email);
  const changeQty = (id, sku, d) => setOrders((prev) => prev.map((o) => {
    if (o.id !== id) return o;
    const items = o.items.map((i) => (i.sku === sku ? { ...i, qty: Math.max(0, i.qty + d) } : i)).filter((i) => i.qty > 0);
    return { ...o, items };
  }).filter((o) => o.items.length > 0));
  const cancel = (id) => { setOrders((p) => p.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o))); ping(`Order ${id} cancelled`); };

  return (
    <div style={{ maxWidth: 780, margin: "32px auto", padding: "0 20px" }}>
      <h2 style={{ ...display, fontSize: 28, color: T.plumDark, margin: "0 0 4px" }}>My orders</h2>
      <p style={{ fontSize: 13, color: "#8a7d72", margin: "0 0 20px" }}>You can change quantities or cancel while an order is still <b>Current</b>. Finalized orders are locked by our team.</p>
      {mine.length === 0 && (
        <div style={{ background: "#fff", border: `1.5px dashed ${T.line}`, borderRadius: 14, padding: 40, textAlign: "center", color: "#8a7d72" }}>
          No orders yet under {user.email}. <Btn small tone="ghost" style={{ marginLeft: 8 }} onClick={() => setView("shop")}>Start an order</Btn>
        </div>
      )}
      {mine.map((o) => {
        const editable = o.status === "pending";
        return (
          <div key={o.id} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <div><b style={{ fontSize: 15 }}>{o.id}</b> <span style={{ fontSize: 12, color: "#9b8d81" }}>· placed {o.placed} · ships to {o.ship}</span></div>
              <StatusPill s={o.status} />
            </div>
            {o.items.map((i) => {
              const p = PRODUCTS.find((x) => x.sku === i.sku);
              const u = unitPrice(p.retail, i.qty);
              return (
                <div key={i.sku} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: `1px solid ${T.line}`, fontSize: 13, flexWrap: "wrap" }}>
                  <span style={{ flex: 1, minWidth: 160 }}>{p.name} <span style={{ color: "#9b8d81", fontSize: 11.5 }}>({p.sku})</span></span>
                  {editable ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button onClick={() => changeQty(o.id, i.sku, -1)} style={{ border: `1px solid ${T.line}`, background: "#fff", borderRadius: 6, cursor: "pointer", padding: "3px 7px" }}><Minus size={11} /></button>
                      <b style={{ width: 30, textAlign: "center" }}>{i.qty}</b>
                      <button onClick={() => changeQty(o.id, i.sku, 1)} style={{ border: `1px solid ${T.line}`, background: "#fff", borderRadius: 6, cursor: "pointer", padding: "3px 7px" }}><Plus size={11} /></button>
                    </span>
                  ) : <b>×{i.qty}</b>}
                  <b style={{ width: 80, textAlign: "right" }}>{aud(u * i.qty)}</b>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
              <b style={{ color: T.plum }}>Total {aud(orderTotal(o))}</b>
              {editable ? (
                <Btn small tone="red" onClick={() => cancel(o.id)}><XCircle size={14} /> Cancel order</Btn>
              ) : <span style={{ fontSize: 12, color: "#9b8d81" }}>{o.status === "finalized" ? "Locked — finalized by admin" : "Cancelled"}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================= ADMIN DASHBOARD ================= */
function Admin({ orders, setOrders, orderTotal, ping }) {
  const [tab, setTab] = useState("pending");
  const groups = { pending: "Current orders", finalized: "Finalized orders", cancelled: "Cancelled orders" };
  const list = orders.filter((o) => o.status === tab);
  const setStatus = (id, s) => { setOrders((p) => p.map((o) => (o.id === id ? { ...o, status: s } : o))); ping(`Order ${id} → ${s}`); };
  const del = (id) => { setOrders((p) => p.filter((o) => o.id !== id)); ping(`Order ${id} deleted`); };
  const changeQty = (id, sku, d) => setOrders((prev) => prev.map((o) => {
    if (o.id !== id) return o;
    const items = o.items.map((i) => (i.sku === sku ? { ...i, qty: Math.max(1, i.qty + d) } : i));
    return { ...o, items };
  }));

  return (
    <div style={{ maxWidth: 920, margin: "32px auto", padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Shield size={22} color={T.plum} />
        <h2 style={{ ...display, fontSize: 28, color: T.plumDark, margin: 0 }}>Admin dashboard</h2>
      </div>
      <p style={{ fontSize: 13, color: "#8a7d72", margin: "4px 0 18px" }}>Visible to administrators only. View, edit, finalize, cancel or delete any order.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {Object.entries(groups).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...body, padding: "9px 16px", borderRadius: 99, border: `1.5px solid ${tab === k ? T.plum : T.line}`, background: tab === k ? T.plum : "#fff", color: tab === k ? "#fff" : T.ink, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            {label} ({orders.filter((o) => o.status === k).length})
          </button>
        ))}
      </div>
      {list.length === 0 && (
        <div style={{ background: "#fff", border: `1.5px dashed ${T.line}`, borderRadius: 14, padding: 40, textAlign: "center", color: "#8a7d72" }}>
          No {groups[tab].toLowerCase()} right now.
        </div>
      )}
      {list.map((o) => (
        <div key={o.id} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <b style={{ fontSize: 15 }}>{o.id}</b> <span style={{ fontSize: 13 }}>— {o.name}</span>
              <div style={{ fontSize: 12, color: "#9b8d81" }}>{o.user} · placed {o.placed} · {o.ship}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusPill s={o.status} />
              <b style={{ color: T.plum }}>{aud(orderTotal(o))}</b>
            </div>
          </div>
          <div style={{ margin: "10px 0" }}>
            {o.items.map((i) => {
              const p = PRODUCTS.find((x) => x.sku === i.sku);
              const u = unitPrice(p.retail, i.qty);
              return (
                <div key={i.sku} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: `1px solid ${T.line}`, fontSize: 13, flexWrap: "wrap" }}>
                  <span style={{ flex: 1, minWidth: 160 }}>{p.name} <span style={{ fontSize: 11.5, color: "#9b8d81" }}>({p.sku})</span></span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={() => changeQty(o.id, i.sku, -1)} style={{ border: `1px solid ${T.line}`, background: "#fff", borderRadius: 6, cursor: "pointer", padding: "3px 7px" }}><Minus size={11} /></button>
                    <b style={{ width: 30, textAlign: "center" }}>{i.qty}</b>
                    <button onClick={() => changeQty(o.id, i.sku, 1)} style={{ border: `1px solid ${T.line}`, background: "#fff", borderRadius: 6, cursor: "pointer", padding: "3px 7px" }}><Plus size={11} /></button>
                  </span>
                  <span style={{ width: 120, textAlign: "right", fontSize: 12, color: "#9b8d81" }}>{aud(u)}/u = <b style={{ color: T.ink }}>{aud(u * i.qty)}</b></span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: `1px solid ${T.line}`, paddingTop: 12 }}>
            {o.status !== "finalized" && <Btn small tone="green" onClick={() => setStatus(o.id, "finalized")}><CheckCircle2 size={14} /> Finalize</Btn>}
            {o.status !== "cancelled" && <Btn small tone="red" onClick={() => setStatus(o.id, "cancelled")}><XCircle size={14} /> Cancel</Btn>}
            {o.status !== "pending" && <Btn small tone="ghost" onClick={() => setStatus(o.id, "pending")}><Pencil size={14} /> Reopen as current</Btn>}
            <div style={{ flex: 1 }} />
            <Btn small tone="ghost" style={{ borderColor: T.red, color: T.red }} onClick={() => del(o.id)}><Trash2 size={14} /> Delete</Btn>
          </div>
        </div>
      ))}
    </div>
  );
}
