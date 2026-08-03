import React, { useState, useMemo } from "react";
import {
  storage, publicStorage, loginUser, logoutUser, subscribeAuth,
  getUserRole, setUserRole, deleteUserRole, listUserRoles, isFirstUser,
} from "./storage.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  LayoutDashboard, Package, Warehouse, Truck, ShoppingCart, BarChart3,
  Users, Plus, X, Search, ArrowRightLeft, AlertTriangle, Trash2, Pencil,
  ChevronRight, Boxes, TrendingUp, TrendingDown, ClipboardList, ShieldCheck, Zap, Menu,
} from "lucide-react";

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
};
const catColor = (c) => CATEGORY_COLORS[c] || "#5B6472";

const uid = (p) => `${p}${Math.random().toString(36).slice(2, 8)}`;
const money = (n) => `${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })} ETB`;
const nowStamp = () => new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const seedPermissions = {
  "Warehouse Manager": ["dashboard", "items", "stock", "purchases"],
  Cashier: ["dashboard", "sales"],
};
const ADMIN_MODULES = ["dashboard", "items", "stock", "purchases", "sales", "reports", "users"];

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "items", label: "Item Catalog", icon: Package },
  { key: "stock", label: "Stock & Warehouses", icon: Warehouse },
  { key: "purchases", label: "Purchases & Suppliers", icon: Truck },
  { key: "sales", label: "Sales & Customers", icon: ShoppingCart },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "users", label: "Users & Roles", icon: Users },
];

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

function Btn({ children, onClick, variant = "primary", type = "button", className = "" }) {
  const styles = {
    primary: "bg-[#2563EB] text-white hover:bg-[#1D4ED8]",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    danger: "bg-transparent text-red-600 hover:bg-red-50",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
  };
  return (
    <button type={type} onClick={onClick} className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-1.5 ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

function LoginScreen({ onLogin, error, loading, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8] font-[Inter] p-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        {onBack && (
          <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600 mb-4">← Back to store</button>
        )}
        <div className="flex flex-col items-center gap-2 mb-6">
          <BrandMark size={44} />
          <div className="text-center mt-1">
            <div className="font-[Manrope] font-extrabold text-slate-800 text-lg leading-none">
              Stockline<span style={{ color: "#F97316" }}>.</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-[0.15em] font-semibold mt-1">ELECTRONICS &amp; APPLIANCES</div>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(email, password);
          }}
          className="flex flex-col gap-4"
        >
          <Field label="Email">
            <input required type="email" autoComplete="username" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <input required type="password" autoComplete="current-password" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Btn type="submit" className="justify-center mt-2">{loading ? "Signing in…" : "Sign in"}</Btn>
        </form>
      </div>
    </div>
  );
}

function PendingAccessScreen({ email, onLogout }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8] font-[Inter] p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <BrandMark size={40} />
        </div>
        <h2 className="font-[Manrope] font-bold text-slate-800">Waiting for access</h2>
        <p className="text-sm text-slate-500 mt-2">
          <span className="font-medium">{email}</span> is signed in but doesn't have a department assigned yet. Ask your Admin to assign one on the "Users & Roles" page.
        </p>
        <Btn variant="ghost" onClick={onLogout} className="mt-5 justify-center w-full">Sign out</Btn>
      </div>
    </div>
  );
}

function Storefront({ onStaffLogin }) {
  const [deals, setDeals] = useState(null);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const result = await publicStorage.get("weekly-deals");
        const parsed = result?.value ? JSON.parse(result.value) : { deals: [] };
        setDeals(parsed.deals || []);
      } catch (err) {
        setError(true);
        setDeals([]);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const byCat = {};
    (deals || []).forEach((d) => {
      byCat[d.category] = byCat[d.category] || [];
      byCat[d.category].push(d);
    });
    return byCat;
  }, [deals]);

  return (
    <div className="min-h-screen bg-[#F5F6F8] font-[Inter] text-slate-800">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <header
        className="px-6 py-10 md:py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(120deg, #0B1330 0%, #1D2E6B 55%, #2563EB 100%)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
          <BrandMark size={40} withText />
          <button
            onClick={onStaffLogin}
            className="text-xs text-slate-300 hover:text-white border border-white/20 rounded-lg px-3 py-1.5 transition-colors"
          >
            Staff sign in
          </button>
        </div>
        <div className="max-w-5xl mx-auto relative z-10 mt-10">
          <h1 className="font-[Manrope] font-extrabold text-white text-2xl md:text-4xl leading-tight">This Week's Deals</h1>
          <p className="text-slate-300 mt-2 max-w-lg">Real markdowns on TVs, fridges, and appliances — refreshed every week.</p>
        </div>
        <Zap size={220} className="absolute -right-10 -bottom-16 opacity-10 text-white rotate-12" fill="white" />
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {deals === null ? (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
            <div className="animate-pulse"><BrandMark size={36} /></div>
            <p className="text-sm">Loading this week's deals…</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">No deals are live right now — check back soon.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, catDeals]) => (
            <div key={category} className="mb-10">
              <h2 className="font-[Manrope] font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: catColor(category) }} />
                {category}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {catDeals.map((d) => {
                  const discounted = d.price * (1 - d.dealPercent / 100);
                  return (
                    <Card key={d.id} className="p-4 relative overflow-hidden">
                      <span className="absolute top-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                        -{d.dealPercent}%
                      </span>
                      <div className="text-sm font-semibold text-slate-700 pr-12">{d.name}</div>
                      {d.dealWeek && <div className="text-[11px] text-slate-400 mt-0.5">{d.dealWeek}</div>}
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-[Manrope] font-extrabold text-lg" style={{ color: "#2563EB" }}>{money(discounted)}</span>
                        <span className="text-xs text-slate-400 line-through">{money(d.price)}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>

      {error && (
        <p className="text-center text-xs text-slate-400 pb-6">Couldn't load the latest deals — showing what's cached.</p>
      )}
    </div>
  );
}

export default function InventoryApp() {
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
  const [permissions, setPermissions] = useState(seedPermissions);
  const [audit, setAudit] = useState([
    { id: uid("a"), time: nowStamp(), user: "Admin", action: "System initialized with starting inventory." },
  ]);

  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);

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

  React.useEffect(() => {
    if (!authUser || role === null) return;
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
  }, [authUser, role]);
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

  const lowStockItems = items.filter((i) => i.qty <= i.reorder);
  const totalStockValue = items.reduce((s, i) => s + i.qty * i.cost, 0);
  const todaySalesTotal = sales.filter((s) => s.status !== "rejected" && s.status !== "pending").reduce((s, sale) => s + sale.total, 0);

  const warehouseName = (id) => warehouses.find((w) => w.id === id)?.name || "—";
  const supplierName = (id) => suppliers.find((s) => s.id === id)?.name || "—";
  const customerName = (id) => customers.find((c) => c.id === id)?.name || "—";

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

  const [itemModal, setItemModal] = useState(null);
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

  function proposeDeal(itemId, percent, weekLabel) {
    setItems((arr) =>
      arr.map((i) => (i.id === itemId ? { ...i, dealStatus: "pending", dealPercent: Number(percent), dealWeek: weekLabel } : i))
    );
    log(`Proposed a ${percent}% deal on "${items.find((i) => i.id === itemId)?.name}" — awaiting Admin approval.`);
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

  React.useEffect(() => {
    if (!ready) return;
    const approvedDeals = items
      .filter((i) => i.dealStatus === "approved")
      .map((i) => ({
        id: i.id, name: i.name, category: i.category, price: i.price,
        dealPercent: i.dealPercent, dealWeek: i.dealWeek, unit: i.unit,
      }));
    publicStorage.set("weekly-deals", JSON.stringify({ deals: approvedDeals, updatedAt: Date.now() }));
  }, [ready, items]);

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

  const [confirmReset, setConfirmReset] = useState(false);
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
          <div className="animate-pulse">
            <BrandMark size={48} />
          </div>
          <p className="text-sm text-slate-400 font-[Inter]">Loading Stockline…</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return showLogin ? (
      <LoginScreen onLogin={handleLogin} error={loginError} loading={loginLoading} onBack={() => setShowLogin(false)} />
    ) : (
      <Storefront onStaffLogin={() => setShowLogin(true)} />
    );
  }

  if (role === null) {
    return <PendingAccessScreen email={authUser.email} onLogout={logoutUser} />;
  }

  return (
    <div className="min-h-screen flex bg-[#F5F6F8] font-[Inter] text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-\\[Manrope\\] { font-family: 'Manrope', sans-serif; }
        .font-\\[Inter\\] { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

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
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 font-semibold">Signed in as</div>
          <div className="text-sm text-slate-100 truncate" title={authUser.email}>{authUser.email}</div>
          <div className="text-xs mt-0.5" style={{ color: "#93C5FD" }}>{role}</div>
          <button
            onClick={logoutUser}
            className="mt-3 w-full text-left text-xs text-slate-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col w-full">
        <header className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3 bg-white border-b border-slate-200/80">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-800 shrink-0">
              <Menu size={22} />
            </button>
            <div className="min-w-0">
              <h1 className="font-[Manrope] font-extrabold text-base sm:text-lg text-slate-800 truncate">
                {NAV.find((n) => n.key === tab)?.label}
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
                <span className="hidden sm:inline">{lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} need reordering</span>
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
      <ToastStack toasts={toasts} dismiss={dismissToast} />
    </div>
  );
}

function Dashboard({ items, lowStockItems, totalStockValue, todaySalesTotal, sales, purchaseOrders, warehouses, audit, role }) {
  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
        style={{ background: "linear-gradient(120deg, #0B1330 0%, #1D2E6B 55%, #2563EB 100%)" }}
      >
        <div className="relative z-10 flex items-center gap-4">
          <BrandMark size={44} />
          <div>
            <h2 className="font-[Manrope] font-extrabold text-white text-lg leading-tight">Welcome back, {role}</h2>
            <p className="text-slate-300 text-sm mt-0.5">Here's how Stockline is tracking today.</p>
          </div>
        </div>
        <Zap size={120} className="absolute -right-4 -bottom-6 opacity-10 text-white rotate-12" fill="white" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Package} label="Items tracked" value={items.length} sub={`Across ${warehouses.length} warehouses`} accent="#2563EB" />
        <StatCard icon={AlertTriangle} label="Low stock" value={lowStockItems.length} sub="At or below reorder level" accent="#D97706" />
        <StatCard icon={Boxes} label="Stock value" value={money(totalStockValue)} sub="At current cost price" accent="#0369A1" />
        <StatCard icon={ShoppingCart} label="Sales recorded" value={money(todaySalesTotal)} sub={`${sales.length} transaction${sales.length !== 1 ? "s" : ""} this session`} accent="#7C3AED" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">Reorder alerts</h3>
            <span className="text-xs text-slate-400">Sorted by urgency</span>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">All items are above their reorder level.</p>
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
          <h3 className="font-[Manrope] font-bold text-sm text-slate-700 mb-4">Recent activity</h3>
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

function ItemsView({ items, warehouses, onAdd, onEdit, onDelete, warehouseName, role, onProposeDeal, onApproveDeal, onRejectDeal, onEndDeal }) {
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
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">Deals awaiting your approval</h3>
          </div>
          <div className="space-y-2">
            {pendingDeals.map((i) => (
              <div key={i.id} className="flex items-center justify-between border border-amber-100 bg-amber-50/50 rounded-lg p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-700">{i.name} — {i.dealPercent}% off{i.dealWeek ? ` (${i.dealWeek})` : ""}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{money(i.price)} → {money(i.price * (1 - i.dealPercent / 100))}</div>
                </div>
                <div className="flex gap-2">
                  <Btn variant="outline" onClick={() => onRejectDeal(i.id)}>Reject</Btn>
                  <Btn onClick={() => onApproveDeal(i.id)}>Approve</Btn>
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
                placeholder="Search by name or SKU"
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
            <Plus size={15} /> Add item
          </Btn>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-2 font-semibold">Item</th>
              <th className="py-2 font-semibold">SKU</th>
              <th className="py-2 font-semibold">Warehouse</th>
              <th className="py-2 font-semibold">Cost / Price</th>
              <th className="py-2 font-semibold">Qty</th>
              <th className="py-2 font-semibold">Status</th>
              <th className="py-2 font-semibold">Weekly deal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: catColor(i.category) }} />
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
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">-{i.dealPercent}% live</span>
                      {role === "Admin" && (
                        <button onClick={() => onEndDeal(i.id)} className="text-[11px] text-slate-400 hover:text-red-600">End</button>
                      )}
                    </div>
                  ) : i.dealStatus === "pending" ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">Pending review</span>
                  ) : (
                    <button onClick={() => setDealModalItem(i)} className="text-[11px] text-blue-700 font-semibold hover:underline">
                      Propose deal
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
                No items match your search.
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
      : { name: "", category: "", sku: "", unit: "pcs", cost: "", price: "", qty: "", reorder: "", warehouseId: warehouses[0]?.id, expiry: "" }
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

function StockView({ items, warehouses, onTransfer, warehouseName }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Btn onClick={onTransfer}><ArrowRightLeft size={15} /> Transfer stock</Btn>
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
                  <div className="text-[11px] text-slate-400">stock value</div>
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
                {wItems.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">No stock at this warehouse.</p>}
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

function PurchasesView({ suppliers, purchaseOrders, onNewPO, supplierName, onAddSupplier }) {
  const [supplierModal, setSupplierModal] = useState(false);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">Purchase orders (Goods Received)</h3>
            <Btn onClick={onNewPO}><Plus size={15} /> New purchase order</Btn>
          </div>
          {purchaseOrders.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center flex flex-col items-center gap-2">
              <Truck size={22} className="text-slate-300" />
              No purchase orders yet.
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
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">Suppliers</h3>
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

function SalesView({ sales, customers, onNewSale, customerName, onAddCustomer, role, onApproveSale, onRejectSale }) {
  const [customerModal, setCustomerModal] = useState(false);
  const pendingSales = sales.filter((s) => s.status === "pending");

  return (
    <div className="space-y-6">
      {role === "Admin" && pendingSales.length > 0 && (
        <Card className="p-5 border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-600" />
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">Sales awaiting your approval</h3>
          </div>
          <div className="space-y-2">
            {pendingSales.map((s) => (
              <div key={s.id} className="flex items-center justify-between border border-amber-100 bg-amber-50/50 rounded-lg p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-700">{customerName(s.customerId)} · {money(s.total)}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{s.id} · {s.date} · {s.lines.length} item(s) · submitted by Cashier</div>
                </div>
                <div className="flex gap-2">
                  <Btn variant="outline" onClick={() => onRejectSale(s.id)}>Reject</Btn>
                  <Btn onClick={() => onApproveSale(s.id)}>Approve</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">Sales history</h3>
            <Btn onClick={onNewSale}><Plus size={15} /> New sale</Btn>
          </div>
          {sales.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center flex flex-col items-center gap-2">
              <ShoppingCart size={22} className="text-slate-300" />
              No sales recorded yet.
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
            <h3 className="font-[Manrope] font-bold text-sm text-slate-700">Customers</h3>
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
      <div id="receipt-print-area">
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

function ReportsView({ items, sales }) {
  const confirmedSales = sales.filter((s) => s.status !== "rejected" && s.status !== "pending");
  const stockData = items.map((i) => ({ name: i.name, value: i.qty * i.cost }));

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Boxes} label="Stock at cost" value={money(totalCost)} accent="#0369A1" />
        <StatCard icon={TrendingUp} label="Revenue (session)" value={money(totalRevenue)} accent="#2563EB" />
        <StatCard icon={profit >= 0 ? TrendingUp : TrendingDown} label="Gross profit" value={money(profit)} accent={profit >= 0 ? "#2563EB" : "#DC2626"} />
      </div>

      <Card className="p-5">
        <h3 className="font-[Manrope] font-bold text-sm text-slate-700 mb-4">Stock value by item</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
            <Tooltip formatter={(v) => money(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {stockData.map((d, idx) => <Cell key={idx} fill={catColor(items[idx]?.category)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <h3 className="font-[Manrope] font-bold text-sm text-slate-700 mb-4">Stock movement — fast vs. slow moving</h3>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-2 font-semibold">Item</th>
              <th className="py-2 font-semibold">Units sold (session)</th>
              <th className="py-2 font-semibold">Remaining stock</th>
              <th className="py-2 font-semibold">Movement</th>
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
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold"><TrendingUp size={13} /> Fast-moving</span>
                  ) : i.sold > 0 ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold">Moderate</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-semibold"><TrendingDown size={13} /> Slow-moving</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function UsersView({ audit, onReset, permissions, onToggleModule, onAddDepartment, onRemoveDepartment, allRoles, userRoles, onAssignRole, onRemoveUserRole }) {
  const [newDept, setNewDept] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignRole, setAssignRole] = useState(allRoles?.[0] || "Admin");
  const departments = Object.keys(permissions);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-[Manrope] font-bold text-sm text-slate-700">Departments & feature access</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 max-w-2xl">
          Admin always has every feature, so the account managing this table can never lock itself out. For every other department, tick the boxes for the features that team should be able to open — everything else stays hidden from them.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold pb-3 pr-4">Department</th>
                {NAV.map((n) => (
                  <th key={n.key} className="text-center text-[11px] uppercase tracking-wider text-slate-400 font-semibold pb-3 px-2">
                    {n.label.split(" ")[0]}
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
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
            placeholder="New department name, e.g. Accountant"
            className={`${inputCls} flex-1 max-w-xs`}
          />
          <Btn type="submit" variant="outline"><Plus size={14} /> Add department</Btn>
        </form>
      </Card>

      <Card className="p-5">
        <h3 className="font-[Manrope] font-bold text-sm text-slate-700 mb-1">Team access</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-2xl">
          First create the person's login in the Firebase console (Authentication → Users → Add user), then assign their email to a department here — that's what they'll see the moment they sign in.
        </p>
        <div className="space-y-2 mb-4">
          {(!userRoles || userRoles.length === 0) && (
            <p className="text-sm text-slate-400">No accounts assigned yet.</p>
          )}
          {userRoles && userRoles.map((u) => (
            <div key={u.email} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2">
              <span className="text-slate-700">{u.email}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">{u.role}</span>
                <button onClick={() => onRemoveUserRole(u.email)} className="p-1 text-slate-400 hover:text-red-600" title={`Remove access for ${u.email}`}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!assignEmail.trim()) return;
            onAssignRole(assignEmail, assignRole);
            setAssignEmail("");
          }}
          className="flex items-center gap-2 flex-wrap"
        >
          <input
            type="email"
            required
            placeholder="person@email.com"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
            className={`${inputCls} flex-1 min-w-[180px]`}
          />
          <select value={assignRole} onChange={(e) => setAssignRole(e.target.value)} className={inputCls}>
            {(allRoles || ["Admin"]).map((r) => <option key={r}>{r}</option>)}
          </select>
          <Btn type="submit" variant="outline"><Plus size={14} /> Assign</Btn>
        </form>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={16} className="text-slate-400" />
          <h3 className="font-[Manrope] font-bold text-sm text-slate-700">Audit trail — who changed what, and when</h3>
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
          <h3 className="font-[Manrope] font-bold text-sm text-slate-700">Data storage</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            Everything you add here is saved automatically and shared with anyone else using this app — it will still be here the next time it's opened.
          </p>
        </div>
        <Btn variant="outline" onClick={onReset}><Trash2 size={14} /> Reset all data</Btn>
      </Card>
    </div>
  );
}
