import React, { useState, useMemo, createContext, useContext } from "react";
import {
  storage, publicStorage, loginUser, logoutUser, subscribeAuth,
  getUserRole, setUserRole, deleteUserRole, listUserRoles, isFirstUser,
  createStaffAccount, sendPasswordReset, changeOwnPassword, sendTelegramAlert,
} from "./storage.js";
import { makeTranslator } from "./translations.js";
import {
  LayoutDashboard, Package, Warehouse, Truck, ShoppingCart, BarChart3,
  Users, Plus, X, Search, ArrowRightLeft, AlertTriangle, Trash2, Pencil,
  ChevronRight, Boxes, TrendingUp, TrendingDown, ClipboardList, ShieldCheck, Zap, Menu, Mail, KeyRound,
  Sparkles, MessageCircle,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Seed data                                                               */
/* ---------------------------------------------------------------------- */

const seedWarehouses = [
  { id: "W1", name: "Main Showroom — Bole", location: "Addis Ababa" },
  { id: "W2", name: "Warehouse — Kality", location: "Addis Ababa" },
];

const seedSuppliers = [
  { id: "S1", name: "Samsung Ethiopia Distributor", phone: "0911 22 33 44", address: "Bole Rd, Addis Ababa" },
  { id: "S2", name: "LG Home Appliances PLC", phone: "0922 55 66 77", address: "Gerji, Addis Ababa" },
  { id: "S3", name: "Hyundai Electronics Import", phone: "0933 88 99 00", address: "Kality, Addis Ababa" },
];

const seedCustomers = [
  { id: "C1", name: "Selam Electronics Retail", phone: "0944 11 22 33" },
  { id: "C2", name: "Walk-in Customer", phone: "—" },
];

const seedItems = [
  { id: "I1", name: "Samsung 55\" 4K Smart TV", category: "Television", sku: "TV-0055", unit: "pcs", cost: 32000, price: 39500, qty: 14, reorder: 5, warehouseId: "W1", expiry: null },
  { id: "I2", name: "LG 43\" LED TV", category: "Television", sku: "TV-0043", unit: "pcs", cost: 18500, price: 23000, qty: 22, reorder: 8, warehouseId: "W1", expiry: null },
  { id: "I3", name: "LG 350L No-Frost Refrigerator", category: "Refrigerator", sku: "RFG-0350", unit: "pcs", cost: 48000, price: 58500, qty: 3, reorder: 4, warehouseId: "W2", expiry: null },
  { id: "I4", name: "Hisense 500L Side-by-Side Fridge", category: "Refrigerator", sku: "RFG-0500", unit: "pcs", cost: 72000, price: 86000, qty: 6, reorder: 3, warehouseId: "W2", expiry: null },
  { id: "I5", name: "Samsung 8kg Front-Load Washer", category: "Washing Machine", sku: "WSH-0008", unit: "pcs", cost: 29500, price: 36000, qty: 9, reorder: 4, warehouseId: "W2", expiry: null },
  { id: "I6", name: "Hyundai 1.5HP Split AC", category: "Air Conditioner", sku: "AC-0150", unit: "pcs", cost: 26000, price: 33500, qty: 5, reorder: 6, warehouseId: "W1", expiry: null },
  { id: "I7", name: "Sona Microwave Oven 25L", category: "Kitchen Appliance", sku: "MWO-0025", unit: "pcs", cost: 4200, price: 5600, qty: 27, reorder: 10, warehouseId: "W1", expiry: null },
  { id: "I8", name: "JBL Bluetooth Party Speaker", category: "Audio", sku: "AUD-0012", unit: "pcs", cost: 6800, price: 8900, qty: 16, reorder: 8, warehouseId: "W1", expiry: null },
];

const CATEGORY_COLORS = {
  Television: "#2563EB",
  Refrigerator: "#06B6D4",
  "Washing Machine": "#7C3AED",
  "Air Conditioner": "#0EA5E9",
  "Kitchen Appliance": "#F59E0B",
  Audio: "#DB2777",
  "Water Dispenser": "#0891B2",
};
const catColor = (c) => CATEGORY_COLORS[c] || "#5B6472";

// Change this to your real Telegram username (without the @) — it's used
// for the "Chat on Telegram" buttons and the floating chat bubble.
const TELEGRAM_HANDLE = "BossElectronicsET";

const uid = (p) => `${p}${Math.random().toString(36).slice(2, 8)}`;
const money = (n) => `${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })} ETB`;
const nowStamp = () => new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

/* ---------------------------------------------------------------------- */
/* Role → visible modules                                                  */
/* ---------------------------------------------------------------------- */

const seedPermissions = {
  "Warehouse Manager": ["dashboard", "items", "stock", "purchases"],
  Cashier: ["dashboard", "sales"],
};
// Admin is fixed and always has every module — it can't be edited or removed,
// so there's always at least one account that can manage permissions.
const ADMIN_MODULES = ["dashboard", "items", "stock", "purchases", "sales", "reports", "users"];

const NAV = [
  { key: "dashboard", label: "Dashboard", labelKey: "nav_dashboard", icon: LayoutDashboard },
  { key: "items", label: "Item Catalog", labelKey: "nav_items", icon: Package },
  { key: "stock", label: "Stock & Warehouses", labelKey: "nav_stock", icon: Warehouse },
  { key: "purchases", label: "Purchases & Suppliers", labelKey: "nav_purchases", icon: Truck },
  { key: "sales", label: "Sales & Customers", labelKey: "nav_sales", icon: ShoppingCart },
  { key: "reports", label: "Reports", labelKey: "nav_reports", icon: BarChart3 },
  { key: "users", label: "Users & Roles", labelKey: "nav_users", icon: Users },
];

/* ---------------------------------------------------------------------- */
/* Language context                                                        */
/* ---------------------------------------------------------------------- */

const LangContext = createContext({ t: (k) => k, lang: "en", setLang: () => {} });
const useLang = () => useContext(LangContext);

function LangToggle({ className = "", light = false }) {
  const { lang, setLang } = useLang();
  const base = light
    ? "border-slate-200"
    : "border-white/20";
  const activeCls = light ? "bg-slate-800 text-white" : "bg-white text-slate-800";
  const inactiveCls = light ? "text-slate-500 hover:bg-slate-100" : "text-slate-300 hover:bg-white/10";
  return (
    <div className={`inline-flex rounded-lg border overflow-hidden text-[11px] font-semibold ${base} ${className}`}>
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 transition-colors ${lang === "en" ? activeCls : inactiveCls}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("am")}
        className={`px-2 py-1 transition-colors ${lang === "am" ? activeCls : inactiveCls}`}
      >
        አማ
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Small UI atoms                                                          */
/* ---------------------------------------------------------------------- */

function BrandMark({ size = 36, withText = false, textClass = "" }) {
  const [logoSrc, setLogoSrc] = useState("/logo.png");
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="flex items-center gap-2.5">
      {!logoFailed ? (
        <img
          src={logoSrc}
          alt="Logo"
          onError={() => {
            if (logoSrc === "/logo.png") setLogoSrc("/logo.jpg");
            else setLogoFailed(true);
          }}
          className="shrink-0 rounded-xl object-cover shadow-sm bg-white"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="shrink-0 rounded-xl flex items-center justify-center shadow-sm"
          style={{
            width: size,
            height: size,
            background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 55%, #F97316 130%)",
          }}
        >
          <Zap size={size * 0.55} className="text-white" fill="white" strokeWidth={1.5} />
        </div>
      )}
      {withText && (
        <div className={textClass}>
          <div className="font-[Manrope] font-extrabold text-white leading-none" style={{ fontSize: size * 0.42 }}>
            Stockline<span style={{ color: "#F97316" }}>.</span>
          </div>
          <div className="text-[10px] text-slate-400 tracking-[0.15em] font-semibold mt-1">ELECTRONICS &amp; APPLIANCES</div>
        </div>
      )}
    </div>
  );
}

/* A small looping animation of a jar tilting and pouring water into a glass
   that fills up, then resets. Pure SVG + CSS, no external assets. */
function WaterJarLoader({ size = 72 }) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <style>{`
        @keyframes sl-tilt { 0%, 15% { transform: rotate(0deg); } 35%, 65% { transform: rotate(-34deg); } 85%, 100% { transform: rotate(0deg); } }
        @keyframes sl-stream { 0%, 30% { opacity: 0; transform: scaleY(0); } 38%, 62% { opacity: 1; transform: scaleY(1); } 70%, 100% { opacity: 0; transform: scaleY(0); } }
        @keyframes sl-drop { 0%, 34% { opacity: 0; transform: translateY(0); } 40% { opacity: 1; } 60% { opacity: 1; transform: translateY(10px); } 66%, 100% { opacity: 0; transform: translateY(14px); } }
        @keyframes sl-fill { 0%, 35% { y: 90.5px; height: 0px; } 68%, 100% { y: 71px; height: 19.5px; } }
        .sl-jar { transform-origin: 78% 85%; animation: sl-tilt 2.6s ease-in-out infinite; }
        .sl-stream { animation: sl-stream 2.6s ease-in-out infinite; transform-origin: top center; }
        .sl-drop { animation: sl-drop 2.6s ease-in-out infinite; }
        .sl-drop:nth-child(2) { animation-delay: 0.12s; }
        .sl-fill { animation: sl-fill 2.6s ease-in-out infinite; }
      `}</style>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* glass */}
        <rect x="52" y="58" width="30" height="34" rx="3" fill="none" stroke="#94A3B8" strokeWidth="2.5" />
        <clipPath id="sl-glass-clip"><rect x="53.5" y="59.5" width="27" height="31" rx="2" /></clipPath>
        <g clipPath="url(#sl-glass-clip)">
          <rect className="sl-fill" x="53.5" y="90.5" width="27" height="0" fill="#2563EB" />
        </g>
        {/* falling water drops */}
        <circle className="sl-drop" cx="58" cy="46" r="2" fill="#2563EB" />
        <circle className="sl-drop" cx="60" cy="46" r="1.6" fill="#60A5FA" />
        {/* jar */}
        <g className="sl-jar">
          <path d="M18 30 Q18 22 26 22 L40 22 Q48 22 48 30 L48 58 Q48 68 38 68 L26 68 Q18 68 18 58 Z" fill="#2563EB" opacity="0.12" stroke="#2563EB" strokeWidth="2.5" />
          <rect x="24" y="14" width="18" height="10" rx="3" fill="#2563EB" />
          {/* pour spout stream */}
          <rect className="sl-stream" x="46" y="40" width="4" height="18" rx="2" fill="#2563EB" />
        </g>
      </svg>
    </div>
  );
}

function StockPulse({ qty, reorder }) {
  const level = qty <= 0 ? "out" : qty <= reorder ? "low" : qty <= reorder * 2 ? "watch" : "ok";
  const cfg = {
    out: { c: "#DC2626", label: "Out of stock" },
    low: { c: "#D97706", label: "Below reorder level" },
    watch: { c: "#CA8A04", label: "Approaching reorder level" },
    ok: { c: "#16A34A", label: "Healthy" },
  }[level];
  return (
    <span className="inline-flex items-center gap-1.5" title={cfg.label}>
      <span className="relative flex h-2 w-2">
        {level !== "ok" && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ backgroundColor: cfg.c }}
          />
        )}
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: cfg.c }} />
      </span>
      <span className="text-[11px] font-mono tracking-tight" style={{ color: cfg.c }}>
        {level === "ok" ? "OK" : level === "watch" ? "WATCH" : level === "low" ? "LOW" : "OUT"}
      </span>
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}>
      {children}
    </div>
  );
}

/* Toast notifications */
function Toast({ toast, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line
  return (
    <div className="flex items-start gap-2.5 bg-[#16202A] text-white text-sm rounded-xl shadow-lg px-4 py-3 min-w-[260px] max-w-sm animate-[toastIn_0.25s_ease-out]">
      <span className="h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#22C55E" }} />
      <span className="leading-snug">{toast.message}</span>
    </div>
  );
}
function ToastStack({ toasts, dismiss }) {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2">
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDone={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">{label}</span>
        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}1A` }}>
          <Icon size={16} style={{ color: accent }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800 font-[Manrope]">{value}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </Card>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-[Manrope] font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-500 text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600";

function Btn({ children, onClick, variant = "primary", type = "button", className = "", disabled = false }) {
  const styles = {
    primary: "bg-[#2563EB] text-white hover:bg-[#1D4ED8]",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    danger: "bg-transparent text-red-600 hover:bg-red-50",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

function LoginScreen({ onLogin, error, loading, onBack }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div
      className="min-h-screen flex items-center justify-center font-[Inter] p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0B1330 0%, #1D2E6B 45%, #2563EB 85%, #4F46E5 100%)" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap');`}</style>

      {/* Decorative glow shapes */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-30 blur-3xl" style={{ background: "#F97316" }} />
      <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "#4F46E5" }} />
      <Zap size={260} className="absolute -right-16 top-1/3 opacity-[0.06] text-white rotate-12" fill="white" />

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative z-10">
        <div className="flex items-center justify-between mb-4">
          {onBack ? (
            <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600">{t("back_to_store")}</button>
          ) : <span />}
          <LangToggle light />
        </div>
        <div className="flex flex-col items-center gap-3 mb-7">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl blur-lg opacity-40" style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }} />
            <div className="relative">
              <BrandMark size={52} />
            </div>
          </div>
          <div className="text-center mt-1">
            <div className="font-[Manrope] font-extrabold text-slate-800 text-xl leading-none">
              Stockline<span style={{ color: "#F97316" }}>.</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-[0.15em] font-semibold mt-1.5">ELECTRONICS &amp; APPLIANCES</div>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(email, password);
          }}
          className="flex flex-col gap-4"
        >
          <Field label={t("email")}>
            <input required type="email" autoComplete="username" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={t("password")}>
            <input required type="password" autoComplete="current-password" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Btn type="submit" className="justify-center mt-2 py-2.5">{loading ? t("signing_in") : t("sign_in")}</Btn>
        </form>
      </div>
    </div>
  );
}

function PendingAccessScreen({ email, onLogout }) {
  const { t } = useLang();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8] font-[Inter] p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-2">
          <LangToggle light />
        </div>
        <div className="flex justify-center mb-4">
          <BrandMark size={40} />
        </div>
        <h2 className="font-[Manrope] font-bold text-slate-800">{t("waiting_for_access")}</h2>
        <p className="text-sm text-slate-500 mt-2">
          <span className="font-medium">{email}</span> {t("waiting_for_access_body")}
        </p>
        <Btn variant="ghost" onClick={onLogout} className="mt-5 justify-center w-full">{t("sign_out")}</Btn>
      </div>
    </div>
  );
}

function Storefront({ onStaffLogin }) {
  const { t } = useLang();
  const [deals, setDeals] = useState(null); // null = loading
  const [error, setError] = useState(false);
  const [activeCat, setActiveCat] = useState("All");
  const [q, setQ] = useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const result = await publicStorage.get("weekly-deals");
        const parsed = result?.value ? JSON.parse(result.value) : { deals: [] };
        // Out-of-stock items are filtered again here as a safety net, in
        // case an older cached snapshot still includes one.
        setDeals((parsed.deals || []).filter((d) => d.qty === undefined || d.qty > 0));
      } catch (err) {
        setError(true);
        setDeals([]);
      }
    })();
  }, []);

  const categories = useMemo(() => ["All", ...new Set((deals || []).map((d) => d.category))], [deals]);
  const visibleDeals = useMemo(
    () =>
      (deals || []).filter(
        (d) => (activeCat === "All" || d.category === activeCat) && d.name.toLowerCase().includes(q.toLowerCase())
      ),
    [deals, activeCat, q]
  );

  return (
    <div className="min-h-screen bg-[#F5F6F8] font-[Inter] text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes sl-twinkle { 0%, 100% { opacity: 0.25; transform: scale(0.8) rotate(0deg); } 50% { opacity: 1; transform: scale(1.15) rotate(12deg); } }
        @keyframes sl-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .sl-sparkle-a { animation: sl-twinkle 2.4s ease-in-out infinite, sl-float 4s ease-in-out infinite; }
        .sl-sparkle-b { animation: sl-twinkle 3.1s ease-in-out infinite 0.4s, sl-float 5s ease-in-out infinite 0.4s; }
        .sl-sparkle-c { animation: sl-twinkle 2.8s ease-in-out infinite 0.9s, sl-float 4.5s ease-in-out infinite 0.9s; }
      `}</style>

      <header
        className="px-6 py-10 md:py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(120deg, #0B1330 0%, #1D2E6B 55%, #2563EB 100%)" }}
      >
        {/* Decorative color blobs */}
        <div className="absolute -top-16 -left-10 h-56 w-56 rounded-full opacity-25 blur-3xl" style={{ background: "#F97316" }} />
        <div className="absolute top-10 right-10 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: "#22D3EE" }} />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full opacity-20 blur-3xl" style={{ background: "#4F46E5" }} />

        {/* Sparkle decorations — twinkling and gently floating */}
        <Sparkles size={22} className="sl-sparkle-a absolute top-24 left-8 text-[#F97316] hidden sm:block" />
        <Sparkles size={16} className="sl-sparkle-b absolute top-16 right-24 text-[#22D3EE] hidden sm:block" />
        <Sparkles size={14} className="sl-sparkle-c absolute bottom-20 left-1/4 text-white hidden md:block" />
        <Sparkles size={18} className="sl-sparkle-b absolute top-1/2 left-16 text-white/70 hidden lg:block" />
        <Sparkles size={12} className="sl-sparkle-a absolute bottom-28 right-16 text-[#FBBF24] hidden sm:block" />

        <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
          <BrandMark size={40} withText />
          <div className="flex items-center gap-2">
            <LangToggle />
            <button
              onClick={onStaffLogin}
              className="text-xs text-slate-300 hover:text-white border border-white/20 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
            >
              {t("staff_sign_in")}
            </button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto relative z-10 mt-10">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-[11px] font-semibold px-3 py-1 rounded-full mb-3">
            <Zap size={12} fill="currentColor" /> LIVE THIS WEEK
          </div>
          <h1 className="font-[Manrope] font-extrabold text-white text-3xl md:text-5xl leading-tight">{t("this_weeks_deals")}</h1>
          <p className="text-slate-300 mt-3 max-w-lg">{t("storefront_tagline")}</p>

          <div className="flex items-center gap-4 sm:gap-6 mt-6 flex-wrap">
            {["Quality guaranteed", "Best prices", "Trusted since day one"].map((tag) => (
              <div key={tag} className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
                {tag}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-8">
            <a
              href="#deals-grid"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-slate-900 shadow-lg hover:brightness-105 transition"
              style={{ background: "linear-gradient(90deg, #FBBF24, #F97316)" }}
            >
              <Sparkles size={16} /> Shop this week's deals
            </a>
            <a
              href={`https://t.me/${TELEGRAM_HANDLE}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white border border-white/25 bg-white/10 hover:bg-white/20 transition"
            >
              <MessageCircle size={16} /> Chat on Telegram
            </a>
          </div>
        </div>
        <Zap size={220} className="absolute -right-10 -bottom-16 opacity-10 text-white rotate-12" fill="white" />
      </header>

      {/* Floating vertical tab */}
      <a
        href="#deals-grid"
        className="hidden sm:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 items-center gap-1.5 text-white text-xs font-bold px-3 py-3 rounded-l-lg shadow-lg hover:pr-4 transition-all"
        style={{ background: "#2563EB", writingMode: "vertical-rl" }}
      >
        <Zap size={14} /> Weekly Deals
      </a>

      {/* Floating chat bubble */}
      <a
        href={`https://t.me/${TELEGRAM_HANDLE}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-30 h-14 w-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
        style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)" }}
        title="Chat with us on Telegram"
      >
        <MessageCircle size={24} className="text-slate-900" fill="white" />
      </a>

      <main id="deals-grid" className="max-w-5xl mx-auto px-6 py-10 scroll-mt-4">
        {deals === null ? (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
            <WaterJarLoader size={64} />
            <p className="text-sm">{t("loading_deals")}</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">{t("no_deals")}</p>
          </div>
        ) : (
          <>
            <div className="relative mb-4 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    activeCat === c
                      ? "bg-[#2563EB] border-[#2563EB] text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {visibleDeals.length === 0 ? (
              <div className="text-center py-16">
                <Search size={28} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 font-medium">No products match "{q}".</p>
              </div>
            ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {visibleDeals.map((d) => {
                const discounted = d.price * (1 - d.dealPercent / 100);
                const savings = d.price - discounted;
                const cc = catColor(d.category);
                const buyText = encodeURIComponent(`Hi! I'm interested in the ${d.name} (${money(discounted)}, -${d.dealPercent}% off) from this week's deals.`);
                return (
                  <Card key={d.id} className="overflow-hidden group cursor-default">
                    <div
                      className="aspect-square relative flex items-center justify-center overflow-hidden"
                      style={{ background: `radial-gradient(ellipse at 50% 35%, ${cc}26, ${cc}08 70%)` }}
                    >
                      {/* Floating "pedestal" shadow beneath the product */}
                      <div
                        className="absolute bottom-[14%] left-1/2 -translate-x-1/2 h-3 w-[55%] rounded-full blur-md"
                        style={{ background: `${cc}55` }}
                      />
                      {d.image ? (
                        <img
                          src={d.image}
                          alt={d.name}
                          className="relative h-[78%] w-[78%] object-contain transition-transform duration-300 group-hover:scale-105"
                          style={{ filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.18))" }}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <Package size={40} style={{ color: cc }} className="relative opacity-40" />
                      )}
                      <span className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[11px] font-extrabold px-2 py-1 rounded-full bg-red-500 text-white shadow-sm z-10">
                        <Zap size={10} fill="white" /> -{d.dealPercent}%
                      </span>
                    </div>
                    <div className="p-3.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: cc }}>{d.category}</div>
                      <div className="text-sm font-semibold text-slate-700 mt-0.5 leading-snug">{d.name}</div>
                      {d.dealWeek && <div className="text-[11px] text-slate-400 mt-1">{d.dealWeek}</div>}
                      <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
                        <span className="font-[Manrope] font-extrabold text-lg" style={{ color: "#2563EB" }}>{money(discounted)}</span>
                        <span className="text-xs text-slate-400 line-through">{money(d.price)}</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 mb-2.5">Save {money(savings)}</div>
                      <a
                        href={`https://t.me/${TELEGRAM_HANDLE}?text=${buyText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-white rounded-lg py-2 hover:brightness-105 transition"
                        style={{ background: "#2563EB" }}
                      >
                        <MessageCircle size={13} /> Buy on Telegram
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>
            )}
          </>
        )}
      </main>

      {error && (
        <p className="text-center text-xs text-slate-400 pb-6">Couldn't load the latest deals — showing what's cached.</p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Main App                                                                */
/* ---------------------------------------------------------------------- */

export default function InventoryApp() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("stockline-lang") || "en";
    } catch (e) {
      return "en";
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem("stockline-lang", lang);
    } catch (e) {
      // ignore (e.g. private browsing)
    }
  }, [lang]);
  const t = useMemo(() => makeTranslator(lang), [lang]);

  const [authChecked, setAuthChecked] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userRoles, setUserRoles] = useState([]);

  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState(seedItems);
  const [warehouses] = useState(seedWarehouses);
  const [suppliers, setSuppliers] = useState(seedSuppliers);
  const [customers, setCustomers] = useState(seedCustomers);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [permissions, setPermissions] = useState(seedPermissions); // { [department]: [moduleKey, ...] } — Admin excluded, always full access
  const [audit, setAudit] = useState([
    { id: uid("a"), time: nowStamp(), user: "Admin", action: "System initialized with starting inventory." },
  ]);

  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Watch sign-in state. The first person ever to sign in becomes Admin
  // automatically; everyone after that needs a department assigned by
  // an Admin on the "Users & Roles" page before they see any data.
  React.useEffect(() => {
    const unsubscribe = subscribeAuth(async (user) => {
      setAuthUser(user);
      setRole(null);
      if (user) {
        let r = await getUserRole(user.email);
        if (!r) {
          const first = await isFirstUser();
          if (first) {
            await setUserRole(user.email, "Admin");
            r = "Admin";
          }
        }
        setRole(r);
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  async function refreshUserRoles() {
    setUserRoles(await listUserRoles());
  }

  async function handleLogin(email, password) {
    setLoginError("");
    setLoginLoading(true);
    try {
      await loginUser(email, password);
    } catch (err) {
      const messages = {
        "auth/invalid-email": "That email address doesn't look right.",
        "auth/user-not-found": "No account with that email. Ask your Admin to create one.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/too-many-requests": "Too many attempts — please wait a moment and try again.",
      };
      setLoginError(messages[err.code] || "Couldn't sign in. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  // Load saved data as soon as we're signed in — in parallel with the role
  // lookup above, not after it, so the two network round trips overlap
  // instead of stacking up (this is what made sign-in feel slow before).
  React.useEffect(() => {
    if (!authUser) return;
    (async () => {
      try {
        const result = await storage.get("inventory-store");
        if (result && result.value) {
          const saved = JSON.parse(result.value);
          if (saved.items) setItems(saved.items);
          if (saved.suppliers) setSuppliers(saved.suppliers);
          if (saved.customers) setCustomers(saved.customers);
          if (saved.purchaseOrders) setPurchaseOrders(saved.purchaseOrders);
          if (saved.sales) setSales(saved.sales);
          if (saved.audit) setAudit(saved.audit);
          if (saved.permissions) setPermissions(saved.permissions);
        }
      } catch (err) {
        // No saved data yet — keep the starting sample inventory.
      } finally {
        setReady(true);
      }
    })();
  }, [authUser]);
  React.useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const payload = JSON.stringify({ items, suppliers, customers, purchaseOrders, sales, audit, permissions });
        const result = await storage.set("inventory-store", payload);
        setSaveError(!result);
      } catch (err) {
        setSaveError(true);
      }
    })();
  }, [ready, items, suppliers, customers, purchaseOrders, sales, audit, permissions]);

  // Admin always has every module, unconditionally, so it can never be locked out.
  const departments = Object.keys(permissions);
  const allRoles = ["Admin", ...departments];
  const modulesFor = (r) => (r === "Admin" ? ADMIN_MODULES : permissions[r] || []);

  const visibleNav = NAV.filter((n) => modulesFor(role).includes(n.key));
  React.useEffect(() => {
    if (!modulesFor(role).includes(tab)) setTab(modulesFor(role)[0] || "dashboard");
  }, [role, permissions]); // eslint-disable-line

  const [toasts, setToasts] = useState([]);
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  const log = (action) => {
    const who = authUser?.email ? `${role} · ${authUser.email}` : role;
    setAudit((a) => [{ id: uid("a"), time: nowStamp(), user: who, action }, ...a].slice(0, 50));
    setToasts((t) => [...t, { id: uid("t"), message: action }].slice(-3));
  };

  React.useEffect(() => {
    if (ready) refreshUserRoles();
  }, [ready]);

  async function assignUserRole(email, roleName) {
    await setUserRole(email, roleName);
    log(`Assigned ${email} to ${roleName}.`);
    refreshUserRoles();
  }
  async function unassignUserRole(email) {
    await deleteUserRole(email);
    log(`Removed access for ${email}.`);
    refreshUserRoles();
  }
  // Creates the Firebase login AND assigns the department in one step, so
  // Admin never has to leave the app or touch the Firebase console.
  async function createAndAssign(email, password, roleName) {
    const result = await createStaffAccount(email, password);
    if (!result.ok) return result;
    await setUserRole(email, roleName);
    log(`Created a new account for ${email} and assigned them to ${roleName}.`);
    refreshUserRoles();
    return result;
  }
  async function resetPasswordFor(email) {
    const result = await sendPasswordReset(email);
    if (result.ok) log(`Sent a password reset email to ${email}.`);
    return result;
  }

  const lowStockItems = items.filter((i) => i.qty <= i.reorder);
  const totalStockValue = items.reduce((s, i) => s + i.qty * i.cost, 0);
  const todaySalesTotal = sales.filter((s) => s.status !== "rejected" && s.status !== "pending").reduce((s, sale) => s + sale.total, 0);

  // Let Admin know about low stock once per session (not on every re-render).
  const lowStockAlertedRef = React.useRef(false);
  React.useEffect(() => {
    if (role !== "Admin" || !ready || lowStockAlertedRef.current || lowStockItems.length === 0) return;
    lowStockAlertedRef.current = true;
    const list = lowStockItems.slice(0, 8).map((i) => `• ${i.name} — ${i.qty} ${i.unit} left`).join("\n");
    sendTelegramAlert(`📦 ${lowStockItems.length} item(s) at or below reorder level\n${list}`);
  }, [role, ready, lowStockItems.length]); // eslint-disable-line

  const warehouseName = (id) => warehouses.find((w) => w.id === id)?.name || "—";
  const supplierName = (id) => suppliers.find((s) => s.id === id)?.name || "—";
  const customerName = (id) => customers.find((c) => c.id === id)?.name || "—";

  /* ---------- Departments & feature permissions (Admin only) ---------- */
  function toggleModule(dept, moduleKey) {
    setPermissions((p) => {
      const current = p[dept] || [];
      const next = current.includes(moduleKey) ? current.filter((m) => m !== moduleKey) : [...current, moduleKey];
      return { ...p, [dept]: next };
    });
    log(`Updated feature access for ${dept}.`);
  }
  function addDepartment(name) {
    const clean = name.trim();
    if (!clean || clean === "Admin" || permissions[clean]) return;
    setPermissions((p) => ({ ...p, [clean]: ["dashboard"] }));
    log(`Created new department "${clean}".`);
  }
  function removeDepartment(name) {
    setPermissions((p) => {
      const next = { ...p };
      delete next[name];
      return next;
    });
    log(`Removed department "${name}".`);
  }

  /* ---------- Item CRUD ---------- */
  const [itemModal, setItemModal] = useState(null); // null | {} (new) | item (edit)
  function saveItem(form) {
    if (form.id) {
      setItems((arr) => arr.map((i) => (i.id === form.id ? { ...form } : i)));
      log(`Updated item "${form.name}" (${form.sku}).`);
    } else {
      const newItem = { ...form, id: uid("I") };
      setItems((arr) => [newItem, ...arr]);
      log(`Added new item "${form.name}" (${form.sku}).`);
    }
    setItemModal(null);
  }
  function deleteItem(id) {
    const it = items.find((i) => i.id === id);
    setItems((arr) => arr.filter((i) => i.id !== id));
    log(`Deleted item "${it?.name}".`);
  }

  /* ---------- Weekly deals (propose → Admin approves before it's public) ---------- */
  function proposeDeal(itemId, percent, weekLabel) {
    const itemName = items.find((i) => i.id === itemId)?.name;
    setItems((arr) =>
      arr.map((i) => (i.id === itemId ? { ...i, dealStatus: "pending", dealPercent: Number(percent), dealWeek: weekLabel } : i))
    );
    log(`Proposed a ${percent}% deal on "${itemName}" — awaiting Admin approval.`);
    sendTelegramAlert(`🏷️ New deal awaiting approval\n${itemName} — ${percent}% off\nOpen Stockline → Item Catalog to review.`);
  }
  function approveDeal(itemId) {
    setItems((arr) => arr.map((i) => (i.id === itemId ? { ...i, dealStatus: "approved" } : i)));
    log(`Approved the deal on "${items.find((i) => i.id === itemId)?.name}" — now live on the storefront.`);
  }
  function rejectDeal(itemId) {
    setItems((arr) => arr.map((i) => (i.id === itemId ? { ...i, dealStatus: "none", dealPercent: 0, dealWeek: "" } : i)));
    log(`Rejected the proposed deal on "${items.find((i) => i.id === itemId)?.name}".`);
  }
  function endDeal(itemId) {
    setItems((arr) => arr.map((i) => (i.id === itemId ? { ...i, dealStatus: "none", dealPercent: 0, dealWeek: "" } : i)));
    log(`Ended the deal on "${items.find((i) => i.id === itemId)?.name}".`);
  }

  // Whenever approved deals change, publish a small public snapshot that
  // the unauthenticated storefront can read (it can't see full inventory).
  React.useEffect(() => {
    if (!ready) return;
    const approvedDeals = items
      .filter((i) => i.dealStatus === "approved" && i.qty > 0)
      .map((i) => ({
        id: i.id, name: i.name, category: i.category, price: i.price,
        dealPercent: i.dealPercent, dealWeek: i.dealWeek, unit: i.unit, image: i.image || "", qty: i.qty,
      }));
    publicStorage.set("weekly-deals", JSON.stringify({ deals: approvedDeals, updatedAt: Date.now() }));
  }, [ready, items]);

  /* ---------- Stock transfer ---------- */
  const [transferModal, setTransferModal] = useState(false);
  function doTransfer({ itemId, toWarehouseId, qty }) {
    setItems((arr) => {
      const src = arr.find((i) => i.id === itemId);
      const remaining = { ...src, qty: src.qty - qty };
      const existingAtDest = arr.find((i) => i.sku === src.sku && i.warehouseId === toWarehouseId);
      let next = arr.map((i) => (i.id === itemId ? remaining : i));
      if (existingAtDest) {
        next = next.map((i) => (i.id === existingAtDest.id ? { ...i, qty: i.qty + qty } : i));
      } else {
        next = [...next, { ...src, id: uid("I"), qty, warehouseId: toWarehouseId }];
      }
      return next;
    });
    log(`Transferred ${qty} units to ${warehouseName(toWarehouseId)}.`);
    setTransferModal(false);
  }

  /* ---------- Purchase orders (GRN receiving increases stock) ---------- */
  const [poModal, setPoModal] = useState(false);
  function createPO({ supplierId, lines }) {
    const po = { id: uid("PO"), supplierId, date: nowStamp(), lines, status: "Received" };
    setPurchaseOrders((arr) => [po, ...arr]);
    setItems((arr) =>
      arr.map((i) => {
        const line = lines.find((l) => l.itemId === i.id);
        return line ? { ...i, qty: i.qty + Number(line.qty), cost: Number(line.cost) } : i;
      })
    );
    log(`Received purchase order from ${supplierName(supplierId)} (${lines.length} item lines).`);
    setPoModal(false);
  }

  /* ---------- Sales (POS) — Cashier sales need Admin approval first ---------- */
  const [saleModal, setSaleModal] = useState(false);
  const [receiptSale, setReceiptSale] = useState(null);
  function createSale({ customerId, lines }) {
    const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
    const needsApproval = role === "Cashier";
    const sale = { id: uid("SL"), customerId, date: nowStamp(), lines, total, status: needsApproval ? "pending" : "approved" };
    setSales((arr) => [sale, ...arr]);
    if (!needsApproval) {
      setItems((arr) =>
        arr.map((i) => {
          const line = lines.find((l) => l.itemId === i.id);
          return line ? { ...i, qty: Math.max(0, i.qty - Number(line.qty)) } : i;
        })
      );
      log(`Sale #${sale.id} recorded for ${customerName(customerId)} — ${money(total)}.`);
    } else {
      log(`Sale #${sale.id} submitted by Cashier for ${customerName(customerId)} — awaiting Admin approval.`);
      sendTelegramAlert(`🛒 New sale awaiting approval\n#${sale.id} — ${customerName(customerId)} — ${money(total)}\nOpen Stockline → Sales to review.`);
    }
    setSaleModal(false);
    setReceiptSale(sale);
  }
  function approveSale(saleId) {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;
    setSales((arr) => arr.map((s) => (s.id === saleId ? { ...s, status: "approved" } : s)));
    setItems((arr) =>
      arr.map((i) => {
        const line = sale.lines.find((l) => l.itemId === i.id);
        return line ? { ...i, qty: Math.max(0, i.qty - Number(line.qty)) } : i;
      })
    );
    log(`Approved sale #${saleId} — stock updated.`);
  }
  function rejectSale(saleId) {
    setSales((arr) => arr.map((s) => (s.id === saleId ? { ...s, status: "rejected" } : s)));
    log(`Rejected sale #${saleId}.`);
  }

  /* ---------- Reset ---------- */
  const [confirmReset, setConfirmReset] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  function resetAll() {
    setItems(seedItems);
    setSuppliers(seedSuppliers);
    setCustomers(seedCustomers);
    setPurchaseOrders([]);
    setSales([]);
    setPermissions(seedPermissions);
    setAudit([{ id: uid("a"), time: nowStamp(), user: role, action: "Data reset to starting sample inventory." }]);
    setConfirmReset(false);
  }

  if (!authChecked || (authUser && role !== null && !ready)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8] font-[Inter]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@500&display=swap');`}</style>
        <div className="flex flex-col items-center gap-4">
          <WaterJarLoader size={64} />
          <p className="text-sm text-slate-400 font-[Inter]">Loading Stockline…</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <LangContext.Provider value={{ t, lang, setLang }}>
        {showLogin ? (
          <LoginScreen onLogin={handleLogin} error={loginError} loading={loginLoading} onBack={() => setShowLogin(false)} />
        ) : (
          <Storefront onStaffLogin={() => setShowLogin(true)} />
        )}
      </LangContext.Provider>
    );
  }

  if (role === null) {
    return (
      <LangContext.Provider value={{ t, lang, setLang }}>
        <PendingAccessScreen email={authUser.email} onLogout={logoutUser} />
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={{ t, lang, setLang }}>
    <div className="min-h-screen flex bg-[#F5F6F8] font-[Inter] text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-\\[Manrope\\] { font-family: 'Manrope', sans-serif; }
        .font-\\[Inter\\] { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-gradient-to-b from-[#0B1330] to-[#182B57] text-slate-300 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="px-5 py-6 border-b border-white/10 flex items-center justify-between">
          <BrandMark size={40} withText />
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-4">
          <LangToggle />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map((n) => {
            const Icon = n.icon;
            const active = tab === n.key;
            return (
              <button
                key={n.key}
                onClick={() => {
                  setTab(n.key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-[#2563EB] text-white" : "hover:bg-white/5 text-slate-300"
                }`}
              >
                <Icon size={16} />
                {t(n.labelKey)}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 font-semibold">{t("signed_in_as")}</div>
          <div className="text-sm text-slate-100 truncate" title={authUser.email}>{authUser.email}</div>
          <div className="text-xs mt-0.5" style={{ color: "#93C5FD" }}>{role}</div>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => setChangePwOpen(true)}
              className="text-left text-xs text-slate-400 hover:text-white transition-colors"
            >
              Change password
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={logoutUser}
              className="text-left text-xs text-slate-400 hover:text-white transition-colors"
            >
              {t("sign_out")}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col w-full">
        <header className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3 bg-white border-b border-slate-200/80">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-800 shrink-0">
              <Menu size={22} />
            </button>
            <div className="min-w-0">
              <h1 className="font-[Manrope] font-extrabold text-base sm:text-lg text-slate-800 truncate">
                {t(NAV.find((n) => n.key === tab)?.labelKey)}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {saveError && (
              <span className="text-xs text-red-500 font-medium hidden sm:inline">Couldn't save last change — check connection</span>
            )}
            {lowStockItems.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap">
                <AlertTriangle size={14} />
                <span className="hidden sm:inline">{lowStockItems.length} {t("need_reordering")}</span>
                <span className="sm:hidden">{lowStockItems.length}</span>
              </div>
            )}
          </div>
        </header>
        <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #2563EB, #4F46E5, #F97316)" }} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {tab === "dashboard" && (
            <Dashboard
              items={items}
              lowStockItems={lowStockItems}
              totalStockValue={totalStockValue}
              todaySalesTotal={todaySalesTotal}
              sales={sales}
              purchaseOrders={purchaseOrders}
              warehouses={warehouses}
              audit={audit}
              role={role}
            />
          )}

          {tab === "items" && (
            <ItemsView
              items={items}
              warehouses={warehouses}
              onAdd={() => setItemModal({})}
              onEdit={(it) => setItemModal(it)}
              onDelete={deleteItem}
              warehouseName={warehouseName}
              role={role}
              onProposeDeal={proposeDeal}
              onApproveDeal={approveDeal}
              onRejectDeal={rejectDeal}
              onEndDeal={endDeal}
            />
          )}

          {tab === "stock" && (
            <StockView
              items={items}
              warehouses={warehouses}
              onTransfer={() => setTransferModal(true)}
              warehouseName={warehouseName}
            />
          )}

          {tab === "purchases" && (
            <PurchasesView
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              onNewPO={() => setPoModal(true)}
              supplierName={supplierName}
              onAddSupplier={(s) => {
                setSuppliers((arr) => [...arr, { ...s, id: uid("S") }]);
                log(`Added new supplier "${s.name}".`);
              }}
            />
          )}

          {tab === "sales" && (
            <SalesView
              sales={sales}
              customers={customers}
              onNewSale={() => setSaleModal(true)}
              customerName={customerName}
              role={role}
              onApproveSale={approveSale}
              onRejectSale={rejectSale}
              onAddCustomer={(c) => {
                setCustomers((arr) => [...arr, { ...c, id: uid("C") }]);
                log(`Added new customer "${c.name}".`);
              }}
            />
          )}

          {tab === "reports" && <ReportsView items={items} sales={sales} />}

          {tab === "users" && (
            <UsersView
              audit={audit}
              onReset={() => setConfirmReset(true)}
              permissions={permissions}
              onToggleModule={toggleModule}
              onAddDepartment={addDepartment}
              onRemoveDepartment={removeDepartment}
              allRoles={allRoles}
              userRoles={userRoles}
              onAssignRole={assignUserRole}
              onRemoveUserRole={unassignUserRole}
              onCreateAndAssign={createAndAssign}
              onResetPassword={resetPasswordFor}
            />
          )}
        </div>
      </main>

      {itemModal !== null && (
        <ItemFormModal
          item={itemModal}
          warehouses={warehouses}
          onClose={() => setItemModal(null)}
          onSave={saveItem}
        />
      )}
      {transferModal && (
        <TransferModal items={items} warehouses={warehouses} onClose={() => setTransferModal(false)} onSubmit={doTransfer} />
      )}
      {poModal && (
        <POModal items={items} suppliers={suppliers} onClose={() => setPoModal(false)} onSubmit={createPO} />
      )}
      {saleModal && (
        <SaleModal items={items} customers={customers} onClose={() => setSaleModal(false)} onSubmit={createSale} />
      )}
      {receiptSale && (
        <ReceiptModal sale={receiptSale} items={items} customerName={customerName} onClose={() => setReceiptSale(null)} />
      )}
      {confirmReset && (
        <Modal title="Reset all data?" onClose={() => setConfirmReset(false)}>
          <p className="text-sm text-slate-600 mb-5">
            This clears every item, supplier, customer, purchase order, sale, and audit entry for everyone using this app, and restores the starting sample inventory. This can't be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Btn>
            <button
              onClick={resetAll}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1.5"
            >
              Reset everything
            </button>
          </div>
        </Modal>
      )}
      {changePwOpen && <ChangePasswordModal onClose={() => setChangePwOpen(false)} />}
      <ToastStack toasts={toasts} dismiss={dismissToast} />
    </div>
    </LangContext.Provider>
  );
}

/* ---------------------------------------------------------------------- */
/* Dashboard                                                                */
/* ---------------------------------------------------------------------- */

function Dashboard({ items, lowStockItems, totalStockValue, todaySalesTotal, sales, purchaseOrders, warehouses, audit, role }) {
  const { t } = useLang();
  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
        style={{ background: "linear-gradient(120deg, #0B1330 0%, #1D2E6B 55%, #2563EB 100%)" }}
      >
        <div className="relative z-10 flex items-center gap-4">
          <BrandMark size={44} />
          <div>
            <h2 className="font-[Manrope] font-extrabold text-white text-lg leading-tight">{t("welcome_back")}, {role}</h2>
            <p className="text-slate-300 text-sm mt-0.5">{t("tracking_today")}</p>
          </div>
        </div>
        <Zap size={120} className="absolute -right-4 -bottom-6 opacity-10 text-white rotate-12" fill="white" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Package} label={t("items_tracked")} value={items.length} sub={t("across_warehouses", { n: warehouses.length })} accent="#2563EB" />
        <StatCard icon={AlertTriangle} label={t("low_stock")} value={lowStockItems.length} sub={t("at_or_below_reorder")} accent="#D97706" />
        <StatCard icon={Boxes} label={t("stock_value")} value={money(totalStockValue)} sub={t("at_current_cost")} accent="#0369A1" />
        <StatCard icon={ShoppingCart} label={t("sales_recorded")} value={money(todaySalesTotal)} sub={`${sales.length} transaction${sales.length !== 1 ? "s" : ""}`} accent="#7C3AED" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">{t("reorder_alerts")}</h3>
            <span className="text-xs text-slate-400">{t("sorted_by_urgency")}</span>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">{t("all_above_reorder")}</p>
          ) : (
            <div className="space-y-2">
              {lowStockItems
                .sort((a, b) => a.qty - b.qty)
                .map((i) => (
                  <div key={i.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: catColor(i.category) }} />
                      <div>
                        <div className="text-sm font-semibold text-slate-700">{i.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{i.sku}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400">Reorder at {i.reorder}</span>
                      <span className="font-mono font-semibold text-sm text-amber-700">{i.qty} {i.unit}</span>
                      <StockPulse qty={i.qty} reorder={i.reorder} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-[Manrope] font-bold text-sm text-slate-700 mb-4">{t("recent_activity")}</h3>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {audit.slice(0, 10).map((a) => (
              <div key={a.id} className="text-xs border-l-2 border-slate-200 pl-3 py-0.5">
                <div className="text-slate-600">{a.action}</div>
                <div className="text-slate-400 font-mono mt-0.5">{a.time} · {a.user}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Items                                                                    */
/* ---------------------------------------------------------------------- */

function ItemsView({ items, warehouses, onAdd, onEdit, onDelete, warehouseName, role, onProposeDeal, onApproveDeal, onRejectDeal, onEndDeal }) {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [dealModalItem, setDealModalItem] = useState(null);
  const categories = ["All", ...new Set(items.map((i) => i.category))];

  const filtered = items.filter(
    (i) =>
      (cat === "All" || i.category === cat) &&
      (i.name.toLowerCase().includes(q.toLowerCase()) || i.sku.toLowerCase().includes(q.toLowerCase()))
  );

  const pendingDeals = items.filter((i) => i.dealStatus === "pending");

  return (
    <div className="space-y-6">
      {role === "Admin" && pendingDeals.length > 0 && (
        <Card className="p-5 border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-600" />
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">{t("deals_awaiting_approval")}</h3>
          </div>
          <div className="space-y-2">
            {pendingDeals.map((i) => (
              <div key={i.id} className="flex items-center justify-between border border-amber-100 bg-amber-50/50 rounded-lg p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-700">{i.name} — {i.dealPercent}% off{i.dealWeek ? ` (${i.dealWeek})` : ""}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{money(i.price)} → {money(i.price * (1 - i.dealPercent / 100))}</div>
                </div>
                <div className="flex gap-2">
                  <Btn variant="outline" onClick={() => onRejectDeal(i.id)}>{t("reject")}</Btn>
                  <Btn onClick={() => onApproveDeal(i.id)}>{t("approve")}</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search_placeholder")}
                className={`${inputCls} pl-8 w-full`}
              />
            </div>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <Btn onClick={onAdd}>
            <Plus size={15} /> {t("add_item")}
          </Btn>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-2 font-semibold">{t("item")}</th>
              <th className="py-2 font-semibold">{t("sku")}</th>
              <th className="py-2 font-semibold">{t("warehouse")}</th>
              <th className="py-2 font-semibold">{t("cost_price")}</th>
              <th className="py-2 font-semibold">{t("qty")}</th>
              <th className="py-2 font-semibold">{t("status")}</th>
              <th className="py-2 font-semibold">{t("weekly_deal")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                      {i.image ? (
                        <img src={i.image} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      ) : (
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: catColor(i.category) }} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-700">{i.name}</div>
                      <div className="text-[11px] text-slate-400">{i.category}</div>
                    </div>
                  </div>
                </td>
                <td className="font-mono text-xs text-slate-500">{i.sku}</td>
                <td className="text-slate-500 text-xs">{warehouseName(i.warehouseId)}</td>
                <td className="font-mono text-xs text-slate-600">{i.cost} / {i.price}</td>
                <td className="font-mono font-semibold text-slate-700">{i.qty} <span className="text-slate-400 font-normal">{i.unit}</span></td>
                <td><StockPulse qty={i.qty} reorder={i.reorder} /></td>
                <td>
                  {i.dealStatus === "approved" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">-{i.dealPercent}% {t("live")}</span>
                      {role === "Admin" && (
                        <button onClick={() => onEndDeal(i.id)} className="text-[11px] text-slate-400 hover:text-red-600">{t("end_deal")}</button>
                      )}
                    </div>
                  ) : i.dealStatus === "pending" ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">{t("pending_review")}</span>
                  ) : (
                    <button onClick={() => setDealModalItem(i)} className="text-[11px] text-blue-700 font-semibold hover:underline">
                      {t("propose_deal")}
                    </button>
                  )}
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(i)} className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded"><Pencil size={13} /></button>
                    <button onClick={() => onDelete(i.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-slate-400 text-sm">
                <Search size={22} className="mx-auto mb-2 text-slate-300" />
                {t("no_items_found")}
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>

      {dealModalItem && (
        <DealModal
          item={dealModalItem}
          onClose={() => setDealModalItem(null)}
          onSubmit={(percent, week) => {
            onProposeDeal(dealModalItem.id, percent, week);
            setDealModalItem(null);
          }}
        />
      )}
    </div>
  );
}

function DealModal({ item, onClose, onSubmit }) {
  const [percent, setPercent] = useState(10);
  const [week, setWeek] = useState("");
  return (
    <Modal title={`Propose a deal — ${item.name}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(Number(percent), week);
        }}
        className="flex flex-col gap-4"
      >
        <Field label="Discount percentage">
          <input required type="number" min={1} max={90} className={`${inputCls} font-mono`} value={percent} onChange={(e) => setPercent(e.target.value)} />
        </Field>
        <Field label="Week label (e.g. Aug 3–9)">
          <input required className={inputCls} value={week} onChange={(e) => setWeek(e.target.value)} placeholder="This week" />
        </Field>
        <p className="text-xs text-slate-500">
          {money(item.price)} → <span className="font-semibold text-emerald-700">{money(item.price * (1 - Number(percent || 0) / 100))}</span>
        </p>
        <p className="text-[11px] text-slate-400">This will need Admin approval before it appears on the public storefront.</p>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit">Submit for approval</Btn>
        </div>
      </form>
    </Modal>
  );
}

function ItemFormModal({ item, warehouses, onClose, onSave }) {
  const [form, setForm] = useState(
    item.id
      ? item
      : { name: "", category: "", sku: "", unit: "pcs", cost: "", price: "", qty: "", reorder: "", warehouseId: warehouses[0]?.id, expiry: "", image: "" }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Modal title={item.id ? "Edit item" : "Add item"} onClose={onClose} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ ...form, cost: Number(form.cost), price: Number(form.price), qty: Number(form.qty), reorder: Number(form.reorder) });
        }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="sm:col-span-2 flex items-center gap-4">
          <div className="h-20 w-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {form.image ? (
              <img src={form.image} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <Package size={26} className="text-slate-300" />
            )}
          </div>
          <div className="flex-1">
            <Field label="Photo link (paste an image URL)">
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                className={inputCls}
                value={form.image || ""}
                onChange={(e) => set("image", e.target.value)}
              />
            </Field>
            <p className="text-[11px] text-slate-400 mt-1">Tip: upload the photo to Google Photos, Imgur, or your product's page and paste the direct image link here.</p>
          </div>
        </div>
        <Field label="Item name"><input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Category"><input required className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} /></Field>
        <Field label="SKU / Barcode"><input required className={`${inputCls} font-mono`} value={form.sku} onChange={(e) => set("sku", e.target.value)} /></Field>
        <Field label="Unit of measure">
          <select className={inputCls} value={form.unit} onChange={(e) => set("unit", e.target.value)}>
            {["pcs", "kg", "g", "litre", "carton", "box", "dozen"].map((u) => <option key={u}>{u}</option>)}
          </select>
        </Field>
        <Field label="Cost price (ETB)"><input required type="number" step="0.01" className={`${inputCls} font-mono`} value={form.cost} onChange={(e) => set("cost", e.target.value)} /></Field>
        <Field label="Selling price (ETB)"><input required type="number" step="0.01" className={`${inputCls} font-mono`} value={form.price} onChange={(e) => set("price", e.target.value)} /></Field>
        <Field label="Quantity in stock"><input required type="number" className={`${inputCls} font-mono`} value={form.qty} onChange={(e) => set("qty", e.target.value)} /></Field>
        <Field label="Reorder level"><input required type="number" className={`${inputCls} font-mono`} value={form.reorder} onChange={(e) => set("reorder", e.target.value)} /></Field>
        <Field label="Warehouse">
          <select className={inputCls} value={form.warehouseId} onChange={(e) => set("warehouseId", e.target.value)}>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </Field>
        <Field label="Expiry date (optional)"><input type="date" className={inputCls} value={form.expiry || ""} onChange={(e) => set("expiry", e.target.value)} /></Field>
        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit">{item.id ? "Save changes" : "Add item"}</Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Stock & Warehouses                                                       */
/* ---------------------------------------------------------------------- */

function StockView({ items, warehouses, onTransfer, warehouseName }) {
  const { t } = useLang();
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Btn onClick={onTransfer}><ArrowRightLeft size={15} /> {t("transfer_stock")}</Btn>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((w) => {
          const wItems = items.filter((i) => i.warehouseId === w.id);
          const value = wItems.reduce((s, i) => s + i.qty * i.cost, 0);
          return (
            <Card key={w.id} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-[Manrope] font-bold text-sm text-slate-700">{w.name}</h3>
                  <p className="text-xs text-slate-400">{w.location}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-700">{money(value)}</div>
                  <div className="text-[11px] text-slate-400">{t("stock_value_label")}</div>
                </div>
              </div>
              <div className="space-y-1.5 mt-3">
                {wItems.map((i) => (
                  <div key={i.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-600">{i.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500">{i.qty} {i.unit}</span>
                      <StockPulse qty={i.qty} reorder={i.reorder} />
                    </div>
                  </div>
                ))}
                {wItems.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">{t("no_stock_here")}</p>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TransferModal({ items, warehouses, onClose, onSubmit }) {
  const [itemId, setItemId] = useState(items[0]?.id);
  const selected = items.find((i) => i.id === itemId);
  const [toWarehouseId, setToWarehouseId] = useState(warehouses.find((w) => w.id !== selected?.warehouseId)?.id);
  const [qty, setQty] = useState(1);
  const destOptions = warehouses.filter((w) => w.id !== selected?.warehouseId);

  return (
    <Modal title="Transfer stock between warehouses" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (Number(qty) > 0 && Number(qty) <= selected.qty) onSubmit({ itemId, toWarehouseId, qty: Number(qty) });
        }}
        className="flex flex-col gap-4"
      >
        <Field label="Item">
          <select className={inputCls} value={itemId} onChange={(e) => { setItemId(e.target.value); }}>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name} — {i.qty} {i.unit} at {warehouses.find(w=>w.id===i.warehouseId)?.name}</option>)}
          </select>
        </Field>
        <Field label="Destination warehouse">
          <select className={inputCls} value={toWarehouseId} onChange={(e) => setToWarehouseId(e.target.value)}>
            {destOptions.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </Field>
        <Field label={`Quantity to transfer (max ${selected?.qty ?? 0})`}>
          <input type="number" min={1} max={selected?.qty} className={`${inputCls} font-mono`} value={qty} onChange={(e) => setQty(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit">Confirm transfer</Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Purchases & Suppliers                                                    */
/* ---------------------------------------------------------------------- */

function PurchasesView({ suppliers, purchaseOrders, onNewPO, supplierName, onAddSupplier }) {
  const { t } = useLang();
  const [supplierModal, setSupplierModal] = useState(false);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">{t("purchase_orders")}</h3>
            <Btn onClick={onNewPO}><Plus size={15} /> {t("new_purchase_order")}</Btn>
          </div>
          {purchaseOrders.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center flex flex-col items-center gap-2">
              <Truck size={22} className="text-slate-300" />
              {t("no_purchase_orders")}
            </p>
          ) : (
            <div className="space-y-2">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{supplierName(po.supplierId)}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">{po.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mb-2">{po.id} · {po.date}</div>
                  <div className="text-xs text-slate-500">{po.lines.length} item line(s) received</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">{t("suppliers")}</h3>
            <button onClick={() => setSupplierModal(true)} className="text-blue-700 hover:bg-blue-50 rounded p-1"><Plus size={16} /></button>
          </div>
          <div className="space-y-3">
            {suppliers.map((s) => (
              <div key={s.id} className="text-sm border-b border-slate-50 pb-2 last:border-0">
                <div className="font-medium text-slate-700">{s.name}</div>
                <div className="text-xs text-slate-400">{s.phone} · {s.address}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {supplierModal && (
        <SimpleFormModal
          title="Add supplier"
          fields={[{ key: "name", label: "Supplier name" }, { key: "phone", label: "Phone" }, { key: "address", label: "Address" }]}
          onClose={() => setSupplierModal(false)}
          onSubmit={(v) => { onAddSupplier(v); setSupplierModal(false); }}
        />
      )}
    </div>
  );
}

function POModal({ items, suppliers, onClose, onSubmit }) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id);
  const [lines, setLines] = useState([{ itemId: items[0]?.id, qty: 1, cost: items[0]?.cost || 0 }]);

  const updateLine = (idx, patch) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const addLine = () => setLines((ls) => [...ls, { itemId: items[0]?.id, qty: 1, cost: items[0]?.cost || 0 }]);
  const removeLine = (idx) => setLines((ls) => ls.filter((_, i) => i !== idx));

  return (
    <Modal title="New purchase order / goods received" onClose={onClose} wide>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ supplierId, lines }); }} className="flex flex-col gap-4">
        <Field label="Supplier">
          <select className={inputCls} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>

        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-500">Items received</span>
          {lines.map((l, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2">
              <select className={`${inputCls} flex-1 min-w-[140px]`} value={l.itemId} onChange={(e) => updateLine(idx, { itemId: e.target.value })}>
                {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <input type="number" min={1} className={`${inputCls} w-24 font-mono`} value={l.qty} onChange={(e) => updateLine(idx, { qty: e.target.value })} placeholder="Qty" />
              <input type="number" min={0} step="0.01" className={`${inputCls} w-28 font-mono`} value={l.cost} onChange={(e) => updateLine(idx, { cost: e.target.value })} placeholder="Unit cost" />
              <button type="button" onClick={() => removeLine(idx)} className="p-2 text-slate-400 hover:text-red-600"><X size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={addLine} className="text-xs text-blue-700 font-semibold flex items-center gap-1"><Plus size={13} /> Add line</button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit">Receive goods</Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Sales & Customers                                                        */
/* ---------------------------------------------------------------------- */

function SalesView({ sales, customers, onNewSale, customerName, onAddCustomer, role, onApproveSale, onRejectSale }) {
  const { t } = useLang();
  const [customerModal, setCustomerModal] = useState(false);
  const pendingSales = sales.filter((s) => s.status === "pending");

  return (
    <div className="space-y-6">
      {role === "Admin" && pendingSales.length > 0 && (
        <Card className="p-5 border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-600" />
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">{t("sales_awaiting_approval")}</h3>
          </div>
          <div className="space-y-2">
            {pendingSales.map((s) => (
              <div key={s.id} className="flex items-center justify-between border border-amber-100 bg-amber-50/50 rounded-lg p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-700">{customerName(s.customerId)} · {money(s.total)}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{s.id} · {s.date} · {s.lines.length} item(s) · submitted by Cashier</div>
                </div>
                <div className="flex gap-2">
                  <Btn variant="outline" onClick={() => onRejectSale(s.id)}>{t("reject")}</Btn>
                  <Btn onClick={() => onApproveSale(s.id)}>{t("approve")}</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">{t("sales_history")}</h3>
            <Btn onClick={onNewSale}><Plus size={15} /> {t("new_sale")}</Btn>
          </div>
          {sales.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center flex flex-col items-center gap-2">
              <ShoppingCart size={22} className="text-slate-300" />
              {t("no_sales_yet")}
            </p>
          ) : (
            <div className="space-y-2">
              {sales.map((s) => (
                <div key={s.id} className="flex items-center justify-between border border-slate-100 rounded-lg p-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      {customerName(s.customerId)}
                      {s.status === "pending" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">PENDING</span>}
                      {s.status === "rejected" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">REJECTED</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{s.id} · {s.date} · {s.lines.length} item(s)</div>
                  </div>
                  <div className="font-mono font-bold text-slate-700">{money(s.total)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">{t("customers")}</h3>
            <button onClick={() => setCustomerModal(true)} className="text-blue-700 hover:bg-blue-50 rounded p-1"><Plus size={16} /></button>
          </div>
          <div className="space-y-3">
            {customers.map((c) => (
              <div key={c.id} className="text-sm border-b border-slate-50 pb-2 last:border-0">
                <div className="font-medium text-slate-700">{c.name}</div>
                <div className="text-xs text-slate-400">{c.phone}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {customerModal && (
        <SimpleFormModal
          title="Add customer"
          fields={[{ key: "name", label: "Customer name" }, { key: "phone", label: "Phone" }]}
          onClose={() => setCustomerModal(false)}
          onSubmit={(v) => { onAddCustomer(v); setCustomerModal(false); }}
        />
      )}
    </div>
  );
}

function SaleModal({ items, customers, onClose, onSubmit }) {
  const inStock = items.filter((i) => i.qty > 0);
  const [customerId, setCustomerId] = useState(customers[0]?.id);
  const [lines, setLines] = useState([{ itemId: inStock[0]?.id, qty: 1, price: inStock[0]?.price || 0 }]);

  const updateLine = (idx, patch) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const addLine = () => setLines((ls) => [...ls, { itemId: inStock[0]?.id, qty: 1, price: inStock[0]?.price || 0 }]);
  const removeLine = (idx) => setLines((ls) => ls.filter((_, i) => i !== idx));
  const total = lines.reduce((s, l) => s + Number(l.qty || 0) * Number(l.price || 0), 0);

  return (
    <Modal title="New sale" onClose={onClose} wide>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ customerId, lines }); }} className="flex flex-col gap-4">
        <Field label="Customer">
          <select className={inputCls} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>

        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-500">Items sold</span>
          {lines.map((l, idx) => {
            const maxQty = items.find((i) => i.id === l.itemId)?.qty ?? 0;
            return (
              <div key={idx} className="flex flex-wrap items-center gap-2">
                <select className={`${inputCls} flex-1 min-w-[140px]`} value={l.itemId} onChange={(e) => updateLine(idx, { itemId: e.target.value, price: items.find(i=>i.id===e.target.value)?.price })}>
                  {inStock.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.qty} available)</option>)}
                </select>
                <input type="number" min={1} max={maxQty} className={`${inputCls} w-20 font-mono`} value={l.qty} onChange={(e) => updateLine(idx, { qty: e.target.value })} />
                <input type="number" min={0} step="0.01" className={`${inputCls} w-28 font-mono`} value={l.price} onChange={(e) => updateLine(idx, { price: e.target.value })} />
                <button type="button" onClick={() => removeLine(idx)} className="p-2 text-slate-400 hover:text-red-600"><X size={14} /></button>
              </div>
            );
          })}
          <button type="button" onClick={addLine} className="text-xs text-blue-700 font-semibold flex items-center gap-1"><Plus size={13} /> Add line</button>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-500">Total</span>
          <span className="font-[Manrope] font-bold text-lg text-slate-800">{money(total)}</span>
        </div>

        <div className="flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit">Complete sale</Btn>
        </div>
      </form>
    </Modal>
  );
}

function ReceiptModal({ sale, items, customerName, onClose }) {
  const itemName = (id) => items.find((i) => i.id === id)?.name || "Item";
  return (
    <Modal title={sale.status === "pending" ? "Sale submitted" : "Sale complete"} onClose={onClose}>
      <div id="print-area">
        <div className="flex items-center gap-2.5 justify-center mb-4">
          <BrandMark size={30} />
        </div>
        {sale.status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2 mb-4 text-center font-medium">
            Waiting for Admin approval — stock won't update until it's approved.
          </div>
        )}
        <div className="text-center mb-4">
          <div className="text-xs text-slate-400 font-mono">{sale.id} · {sale.date}</div>
          <div className="text-sm text-slate-600 mt-0.5">Sold to <span className="font-semibold">{customerName(sale.customerId)}</span></div>
        </div>
        <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
          {sale.lines.map((l, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{itemName(l.itemId)} <span className="text-slate-400">× {l.qty}</span></span>
              <span className="font-mono text-slate-700">{money(l.qty * l.price)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between">
          <span className="font-[Manrope] font-bold text-slate-700">Total</span>
          <span className="font-[Manrope] font-extrabold text-lg" style={{ color: "#2563EB" }}>{money(sale.total)}</span>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-4">Thank you for shopping with Stockline.</p>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Btn variant="ghost" onClick={onClose}>Close</Btn>
        <Btn onClick={() => window.print()}>Print receipt</Btn>
      </div>
    </Modal>
  );
}

function ChangePasswordModal({ onClose }) {
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (pw1.length < 6) return setError("Password should be at least 6 characters.");
    if (pw1 !== pw2) return setError("Passwords don't match.");
    setBusy(true);
    const result = await changeOwnPassword(pw1);
    setBusy(false);
    if (result.ok) setSuccess(true);
    else setError(result.message);
  }

  return (
    <Modal title="Change your password" onClose={onClose}>
      {success ? (
        <div className="text-center py-2">
          <p className="text-sm text-slate-600 mb-4">Your password has been updated.</p>
          <Btn onClick={onClose} className="justify-center w-full">Done</Btn>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="New password">
            <input required type="text" minLength={6} className={`${inputCls} font-mono`} value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="At least 6 characters" />
          </Field>
          <Field label="Confirm new password">
            <input required type="text" minLength={6} className={`${inputCls} font-mono`} value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </Field>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn type="submit" disabled={busy}>{busy ? "Saving…" : "Save password"}</Btn>
          </div>
        </form>
      )}
    </Modal>
  );
}

function SimpleFormModal({ title, fields, onClose, onSubmit }) {
  const [form, setForm] = useState(Object.fromEntries(fields.map((f) => [f.key, ""])));
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="flex flex-col gap-4">
        {fields.map((f) => (
          <Field key={f.key} label={f.label}>
            <input required className={inputCls} value={form[f.key]} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} />
          </Field>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit">Save</Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Reports                                                                   */
/* ---------------------------------------------------------------------- */

function ReportsView({ items, sales }) {
  const { t } = useLang();
  const confirmedSales = sales.filter((s) => s.status !== "rejected" && s.status !== "pending");
  const stockData = items
    .map((i) => ({ name: i.name, value: i.qty * i.cost, qty: i.qty, unit: i.unit, category: i.category }))
    .sort((a, b) => b.value - a.value);

  const soldQty = useMemo(() => {
    const m = {};
    confirmedSales.forEach((s) => s.lines.forEach((l) => { m[l.itemId] = (m[l.itemId] || 0) + Number(l.qty); }));
    return m;
  }, [confirmedSales]);

  const movement = items
    .map((i) => ({ ...i, sold: soldQty[i.id] || 0 }))
    .sort((a, b) => b.sold - a.sold);

  const totalCost = items.reduce((s, i) => s + i.qty * i.cost, 0);
  const totalRevenue = confirmedSales.reduce((s, sale) => s + sale.total, 0);
  const costOfGoodsSold = confirmedSales.reduce(
    (s, sale) => s + sale.lines.reduce((ss, l) => ss + Number(l.qty) * (items.find((i) => i.id === l.itemId)?.cost || 0), 0),
    0
  );
  const profit = totalRevenue - costOfGoodsSold;

  function shareToTelegram() {
    const lines = [
      `📊 Stockline Report — ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
      "",
      `Stock at cost: ${money(totalCost)}`,
      `Revenue (session): ${money(totalRevenue)}`,
      `Gross profit: ${money(profit)}`,
      "",
      "Top stock value by item:",
      ...stockData.slice(0, 5).map((s, idx) => `${idx + 1}. ${s.name} — ${money(s.value)}`),
      "",
      "Fastest-moving items:",
      ...movement.filter((i) => i.sold > 0).slice(0, 5).map((i, idx) => `${idx + 1}. ${i.name} — ${i.sold} sold`),
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://t.me/share/url?url=&text=${text}`, "_blank");
  }

  function exportCsv() {
    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [
      ["Item", "Category", "Qty on hand", "Cost price", "Selling price", "Stock value", "Units sold (session)"],
      ...movement.map((i) => [i.name, i.category, i.qty, i.cost, i.price, i.qty * i.cost, i.sold]),
      [],
      ["Summary"],
      ["Stock at cost", totalCost],
      ["Revenue (session)", totalRevenue],
      ["Gross profit", profit],
    ];
    const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stockline-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 flex-wrap">
        <Btn variant="outline" onClick={exportCsv}>Export CSV</Btn>
        <Btn variant="outline" onClick={shareToTelegram}>Share to Telegram</Btn>
        <Btn variant="outline" onClick={() => window.print()}>{t("print_report")}</Btn>
      </div>
      <div id="print-area" className="space-y-6">
      <p className="text-xs text-slate-400">Stockline report — generated {new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Boxes} label={t("stock_at_cost")} value={money(totalCost)} accent="#0369A1" />
        <StatCard icon={TrendingUp} label={t("revenue_session")} value={money(totalRevenue)} accent="#2563EB" />
        <StatCard icon={profit >= 0 ? TrendingUp : TrendingDown} label={t("gross_profit")} value={money(profit)} accent={profit >= 0 ? "#2563EB" : "#DC2626"} />
      </div>

      <Card className="p-5">
        <h3 className="font-[Manrope] font-bold text-sm text-slate-700 mb-4">{t("stock_value_by_item")}</h3>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-2 font-semibold">{t("item")}</th>
              <th className="py-2 font-semibold">Category</th>
              <th className="py-2 font-semibold">{t("qty")}</th>
              <th className="py-2 font-semibold">Stock value</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((s, idx) => (
              <tr key={idx} className="border-b border-slate-50">
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: catColor(s.category) }} />
                    <span className="text-slate-700 font-medium">{s.name}</span>
                  </div>
                </td>
                <td className="text-slate-500 text-xs">{s.category}</td>
                <td className="font-mono text-slate-600">{s.qty} {s.unit}</td>
                <td className="font-mono font-semibold text-slate-700">{money(s.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-[Manrope] font-bold text-sm text-slate-700 mb-4">{t("stock_movement")}</h3>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-2 font-semibold">{t("item")}</th>
              <th className="py-2 font-semibold">{t("units_sold_session")}</th>
              <th className="py-2 font-semibold">{t("remaining_stock")}</th>
              <th className="py-2 font-semibold">{t("movement")}</th>
            </tr>
          </thead>
          <tbody>
            {movement.map((i) => (
              <tr key={i.id} className="border-b border-slate-50">
                <td className="py-2.5 text-slate-700 font-medium">{i.name}</td>
                <td className="font-mono text-slate-600">{i.sold}</td>
                <td className="font-mono text-slate-600">{i.qty} {i.unit}</td>
                <td>
                  {i.sold >= 3 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold"><TrendingUp size={13} /> {t("fast_moving")}</span>
                  ) : i.sold > 0 ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold">{t("moderate")}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-semibold"><TrendingDown size={13} /> {t("slow_moving")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Users & Roles / Audit trail                                              */
/* ---------------------------------------------------------------------- */

function CreateAccountForm({ allRoles, onCreateAndAssign, onAssignRole }) {
  const [mode, setMode] = useState("create"); // "create" | "assign"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(allRoles?.[0] || "Admin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.trim()) return;
    setBusy(true);
    if (mode === "create") {
      const result = await onCreateAndAssign(email, password, role);
      if (result.ok) {
        setSuccess(`Account created for ${email}.`);
        setEmail("");
        setPassword("");
      } else {
        setError(result.message || "Couldn't create the account.");
      }
    } else {
      await onAssignRole(email, role);
      setSuccess(`${email} assigned to ${role}.`);
      setEmail("");
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-3 bg-slate-100 rounded-lg p-1 w-fit text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`px-3 py-1.5 rounded-md transition-colors ${mode === "create" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
        >
          Create new account
        </button>
        <button
          type="button"
          onClick={() => setMode("assign")}
          className={`px-3 py-1.5 rounded-md transition-colors ${mode === "assign" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
        >
          Assign existing account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 flex-wrap">
        <Field label="Email">
          <input
            type="email"
            required
            placeholder="person@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputCls} min-w-[180px]`}
          />
        </Field>
        {mode === "create" && (
          <Field label="Password">
            <input
              type="text"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls} min-w-[160px] font-mono`}
            />
          </Field>
        )}
        <Field label="Department">
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
            {(allRoles || ["Admin"]).map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Btn type="submit" variant="outline" disabled={busy}>
          {mode === "create" ? <KeyRound size={14} /> : <Plus size={14} />}
          {busy ? "Working…" : mode === "create" ? "Create & assign" : "Assign"}
        </Btn>
      </form>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {success && <p className="text-xs text-emerald-600 mt-2">{success}</p>}
    </div>
  );
}

function UsersView({ audit, onReset, permissions, onToggleModule, onAddDepartment, onRemoveDepartment, allRoles, userRoles, onAssignRole, onRemoveUserRole, onCreateAndAssign, onResetPassword }) {
  const { t } = useLang();
  const [newDept, setNewDept] = useState("");
  const departments = Object.keys(permissions);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-[Manrope] font-bold text-sm text-slate-700">{t("departments_features")}</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 max-w-2xl">
          {t("departments_desc")}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold pb-3 pr-4">{t("department")}</th>
                {NAV.map((n) => (
                  <th key={n.key} className="text-center text-[11px] uppercase tracking-wider text-slate-400 font-semibold pb-3 px-2">
                    {t(n.labelKey).split(" ")[0]}
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* Admin row — fixed, not editable */}
              <tr className="bg-blue-50/50">
                <td className="py-2.5 pr-4 rounded-l-lg">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#2563EB]" />
                    <span className="font-semibold text-slate-700">Admin</span>
                  </div>
                </td>
                {NAV.map((n) => (
                  <td key={n.key} className="text-center px-2">
                    <span className="inline-block h-4 w-4 rounded bg-[#2563EB]" title="Always enabled" />
                  </td>
                ))}
                <td className="rounded-r-lg"></td>
              </tr>

              {departments.map((dept) => (
                <tr key={dept} className="border-t border-slate-50">
                  <td className="py-2.5 pr-4 font-medium text-slate-700">{dept}</td>
                  {NAV.map((n) => {
                    const checked = (permissions[dept] || []).includes(n.key);
                    return (
                      <td key={n.key} className="text-center px-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleModule(dept, n.key)}
                          className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/40 cursor-pointer"
                        />
                      </td>
                    );
                  })}
                  <td>
                    <button
                      onClick={() => onRemoveDepartment(dept)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title={`Remove ${dept}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}

              {departments.length === 0 && (
                <tr>
                  <td colSpan={NAV.length + 2} className="text-center py-6 text-slate-400 text-sm">
                    No departments yet besides Admin — add one below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAddDepartment(newDept);
            setNewDept("");
          }}
          className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100"
        >
          <input
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            placeholder={t("new_department_placeholder")}
            className={`${inputCls} flex-1 max-w-xs`}
          />
          <Btn type="submit" variant="outline"><Plus size={14} /> {t("add_department")}</Btn>
        </form>
      </Card>

      <Card className="p-5">
        <h3 className="font-[Manrope] font-bold text-sm text-slate-700 mb-1">{t("team_access")}</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-2xl">
          Create a login and assign a department in one step — no need to visit the Firebase console.
        </p>
        <div className="space-y-2 mb-4">
          {(!userRoles || userRoles.length === 0) && (
            <p className="text-sm text-slate-400">{t("no_accounts_assigned")}</p>
          )}
          {userRoles && userRoles.map((u) => (
            <div key={u.email} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2">
              <span className="text-slate-700">{u.email}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">{u.role}</span>
                <button onClick={() => onResetPassword(u.email)} className="p-1 text-slate-400 hover:text-blue-700" title={`Send password reset to ${u.email}`}>
                  <Mail size={13} />
                </button>
                <button onClick={() => onRemoveUserRole(u.email)} className="p-1 text-slate-400 hover:text-red-600" title={`Remove access for ${u.email}`}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <CreateAccountForm allRoles={allRoles} onCreateAndAssign={onCreateAndAssign} onAssignRole={onAssignRole} />
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={16} className="text-slate-400" />
          <h3 className="font-[Manrope] font-bold text-sm text-slate-700">{t("audit_trail")}</h3>
        </div>
        <div className="space-y-0">
          {audit.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 text-sm">
              <div className="flex items-center gap-2">
                <ChevronRight size={13} className="text-slate-300" />
                <span className="text-slate-600">{a.action}</span>
              </div>
              <div className="text-xs text-slate-400 font-mono whitespace-nowrap ml-4">{a.time} · {a.user}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 flex items-center justify-between">
        <div>
          <h3 className="font-[Manrope] font-bold text-sm text-slate-700">{t("data_storage")}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            {t("data_storage_desc")}
          </p>
        </div>
        <Btn variant="outline" onClick={onReset}><Trash2 size={14} /> {t("reset_all_data")}</Btn>
      </Card>
    </div>
  );
}
