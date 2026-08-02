import React, { useState, useMemo } from "react";
import { storage } from "./storage.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  LayoutDashboard, Package, Warehouse, Truck, ShoppingCart, BarChart3,
  Users, Plus, X, Search, ArrowRightLeft, AlertTriangle, Trash2, Pencil,
  ChevronRight, Boxes, TrendingUp, TrendingDown, ClipboardList, ShieldCheck, Zap,
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
  return (
    <div className="flex items-center gap-2.5">
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

export default function InventoryApp() {
  const [role, setRole] = useState("Admin");
  const [tab, setTab] = useState("dashboard");
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
  }, []);

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
    setAudit((a) => [{ id: uid("a"), time: nowStamp(), user: role, action }, ...a].slice(0, 50));
    setToasts((t) => [...t, { id: uid("t"), message: action }].slice(-3));
  };

  const lowStockItems = items.filter((i) => i.qty <= i.reorder);
  const totalStockValue = items.reduce((s, i) => s + i.qty * i.cost, 0);
  const todaySalesTotal = sales.reduce((s, sale) => s + sale.total, 0);

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
    if (role === name) setRole("Admin");
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
    const sale = { id: uid("SL"), customerId, date: nowStamp(), lines, total };
    setSales((arr) => [sale, ...arr]);
    setItems((arr) =>
      arr.map((i) => {
        const line = lines.find((l) => l.itemId === i.id);
        return line ? { ...i, qty: Math.max(0, i.qty - Number(line.qty)) } : i;
      })
    );
    log(`Sale #${sale.id} recorded for ${customerName(customerId)} — ${money(total)}.`);
    setSaleModal(false);
    setReceiptSale(sale);
  }

  const [confirmReset, setConfirmReset] = useState(false);
  function resetAll() {
    setItems(seedItems);
    setSuppliers(seedSuppliers);
    setCustomers(seedCustomers);
    setPurchaseOrders([]);
    setSales([]);
    setPermissions(seedPermissions);
    setRole("Admin");
    setAudit([{ id: uid("a"), time: nowStamp(), user: role, action: "Data reset to starting sample inventory." }]);
    setConfirmReset(false);
  }

  if (!ready) {
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

  return (
    <div className="min-h-screen flex bg-[#F5F6F8] font-[Inter] text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-\\[Manrope\\] { font-family: 'Manrope', sans-serif; }
        .font-\\[Inter\\] { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <aside className="w-64 shrink-0 bg-gradient-to-b from-[#0B1330] to-[#182B57] text-slate-300 flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <BrandMark size={40} withText />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleNav.map((n) => {
            const Icon = n.icon;
            const active = tab === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
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
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-slate-100 text-sm rounded-lg px-2.5 py-2 focus:outline-none"
          >
            {allRoles.map((r) => (
              <option key={r} value={r} className="text-slate-800">
                {r}
              </option>
            ))}
          </select>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="px-8 py-5 flex items-center justify-between bg-white border-b border-slate-200/80">
          <div>
            <h1 className="font-[Manrope] font-extrabold text-lg text-slate-800">
              {NAV.find((n) => n.key === tab)?.label}
            </h1>
            <p className="text-xs text-slate-400">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-3">
            {saveError && (
              <span className="text-xs text-red-500 font-medium">Couldn't save last change — check connection</span>
            )}
            {lowStockItems.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <AlertTriangle size={14} />
                {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} need reordering
              </div>
            )}
          </div>
        </header>
        <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #2563EB, #4F46E5, #F97316)" }} />

        <div className="flex-1 overflow-y-auto p-8">
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

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Package} label="Items tracked" value={items.length} sub={`Across ${warehouses.length} warehouses`} accent="#2563EB" />
        <StatCard icon={AlertTriangle} label="Low stock" value={lowStockItems.length} sub="At or below reorder level" accent="#D97706" />
        <StatCard icon={Boxes} label="Stock value" value={money(totalStockValue)} sub="At current cost price" accent="#0369A1" />
        <StatCard icon={ShoppingCart} label="Sales recorded" value={money(todaySalesTotal)} sub={`${sales.length} transaction${sales.length !== 1 ? "s" : ""} this session`} accent="#7C3AED" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-5">
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

function ItemsView({ items, warehouses, onAdd, onEdit, onDelete, warehouseName }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const categories = ["All", ...new Set(items.map((i) => i.category))];

  const filtered = items.filter(
    (i) =>
      (cat === "All" || i.category === cat) &&
      (i.name.toLowerCase().includes(q.toLowerCase()) || i.sku.toLowerCase().includes(q.toLowerCase()))
  );

  return (
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

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <th className="py-2 font-semibold">Item</th>
            <th className="py-2 font-semibold">SKU</th>
            <th className="py-2 font-semibold">Warehouse</th>
            <th className="py-2 font-semibold">Cost / Price</th>
            <th className="py-2 font-semibold">Qty</th>
            <th className="py-2 font-semibold">Status</th>
            <th className="py-2 font-semibold">Expiry</th>
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
              <td className="text-xs text-slate-400">{i.expiry || "—"}</td>
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
    </Card>
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
        className="grid grid-cols-2 gap-4"
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
        <div className="col-span-2 flex justify-end gap-2 pt-2">
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
      <div className="grid grid-cols-2 gap-6">
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
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-5">
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
            <div key={idx} className="flex items-center gap-2">
              <select className={`${inputCls} flex-1`} value={l.itemId} onChange={(e) => updateLine(idx, { itemId: e.target.value })}>
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

function SalesView({ sales, customers, onNewSale, customerName, onAddCustomer }) {
  const [customerModal, setCustomerModal] = useState(false);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-5">
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
                    <div className="text-sm font-semibold text-slate-700">{customerName(s.customerId)}</div>
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
              <div key={idx} className="flex items-center gap-2">
                <select className={`${inputCls} flex-1`} value={l.itemId} onChange={(e) => updateLine(idx, { itemId: e.target.value, price: items.find(i=>i.id===e.target.value)?.price })}>
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
    <Modal title="Sale complete" onClose={onClose}>
      <div id="receipt-print-area">
        <div className="flex items-center gap-2.5 justify-center mb-4">
          <BrandMark size={30} />
        </div>
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
  const stockData = items.map((i) => ({ name: i.name, value: i.qty * i.cost }));

  const soldQty = useMemo(() => {
    const m = {};
    sales.forEach((s) => s.lines.forEach((l) => { m[l.itemId] = (m[l.itemId] || 0) + Number(l.qty); }));
    return m;
  }, [sales]);

  const movement = items
    .map((i) => ({ ...i, sold: soldQty[i.id] || 0 }))
    .sort((a, b) => b.sold - a.sold);

  const totalCost = items.reduce((s, i) => s + i.qty * i.cost, 0);
  const totalRevenue = sales.reduce((s, sale) => s + sale.total, 0);
  const costOfGoodsSold = sales.reduce(
    (s, sale) => s + sale.lines.reduce((ss, l) => ss + Number(l.qty) * (items.find((i) => i.id === l.itemId)?.cost || 0), 0),
    0
  );
  const profit = totalRevenue - costOfGoodsSold;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
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
      </Card>
    </div>
  );
}

function UsersView({ audit, onReset, permissions, onToggleModule, onAddDepartment, onRemoveDepartment }) {
  const [newDept, setNewDept] = useState("");
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
