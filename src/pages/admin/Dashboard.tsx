"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product { _id: string; name: string; }
interface User    { _id: string; name: string; role: string; }
interface Order   {
  _id: string; status: string; createdAt: string;
  userId: string; totalPrice: number;
  firstName: string; lastName: string; email: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending:   "#f59e0b",
  shipped:   "#3b82f6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};
const DONUT_COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444"];

type DateRange = { from: Date; to: Date };

const QUICK_PRESETS = [
  { label: "Today" },
  { label: "Yesterday" },
  { label: "Last 7 days" },
  { label: "Last 30 days" },
  { label: "This month" },
  { label: "Last month" },
  { label: "This year" },
  { label: "Last year" },
  { label: "Custom range" },
] as const;

type PresetLabel = typeof QUICK_PRESETS[number]["label"];

const DEFAULT_LABEL = "Last 30 days";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
function formatCurrency(n: number) {
  if (n >= 1_000_000) return `Rs${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `Rs${(n / 1000).toFixed(1)}k`;
  return `Rs${n.toFixed(0)}`;
}
function toInputDate(d: Date) {
  return d.toISOString().split("T")[0];
}
function presetToRange(label: PresetLabel): DateRange {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eod   = new Date(today.getTime() + 86_400_000 - 1);
  switch (label) {
    case "Today":       return { from: today, to: eod };
    case "Yesterday": { const y = new Date(today); y.setDate(y.getDate()-1); return { from: y, to: new Date(y.getTime()+86_400_000-1) }; }
    case "Last 7 days": return { from: new Date(today.getTime()-6*86_400_000), to: eod };
    case "Last 30 days":return { from: new Date(today.getTime()-29*86_400_000), to: eod };
    case "This month":  return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: eod };
    case "Last month":  { const f=new Date(today.getFullYear(),today.getMonth()-1,1); const t=new Date(today.getFullYear(),today.getMonth(),0,23,59,59,999); return {from:f,to:t}; }
    case "This year":   return { from: new Date(today.getFullYear(), 0, 1), to: eod };
    case "Last year":   { const f=new Date(today.getFullYear()-1,0,1); const t=new Date(today.getFullYear()-1,11,31,23,59,59,999); return {from:f,to:t}; }
    default:            return { from: today, to: eod };
  }
}
function filterByDateRange(orders: Order[], range: DateRange): Order[] {
  return orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= range.from.getTime() && t <= range.to.getTime();
  });
}
function buildTrend(orders: Order[], range: DateRange) {
  const days = Math.max(1, Math.round((range.to.getTime()-range.from.getTime())/86_400_000)+1);
  const buckets: Record<string,{orders:number;revenue:number}> = {};
  for (let i=0;i<days;i++) {
    const d = new Date(range.from.getTime()+i*86_400_000);
    buckets[d.toISOString().split("T")[0]] = { orders:0, revenue:0 };
  }
  orders.forEach((o) => {
    const key = new Date(o.createdAt).toISOString().split("T")[0];
    if (buckets[key]) { buckets[key].orders+=1; buckets[key].revenue+=o.totalPrice??0; }
  });
  return Object.entries(buckets).map(([date,v]) => ({ date:date.slice(5), orders:v.orders, revenue:Math.round(v.revenue) }));
}

// ─── DateFilterModal ──────────────────────────────────────────────────────────
function DateFilterModal({ onClose, onApply, initial }: {
  onClose: () => void;
  onApply: (range: DateRange, label: string) => void;
  initial: DateRange;
}) {
  const [preset,   setPreset]  = useState<PresetLabel>("Last 30 days");
  const [fromStr,  setFromStr] = useState(toInputDate(initial.from));
  const [toStr,    setToStr]   = useState(toInputDate(initial.to));
  const isCustom = preset === "Custom range";

  function handlePreset(label: PresetLabel) {
    setPreset(label);
    if (label !== "Custom range") {
      const r = presetToRange(label);
      setFromStr(toInputDate(r.from));
      setToStr(toInputDate(r.to));
    }
  }
  function handleApply() {
    const from = new Date(fromStr+"T00:00:00");
    const to   = new Date(toStr+"T23:59:59");
    if (isNaN(from.getTime())||isNaN(to.getTime())||from>to) return;
    onApply({from,to}, preset);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Filter Orders</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-field">
            <label className="modal-label">Date Range Preset</label>
            <select className="modal-select" value={preset} onChange={(e) => handlePreset(e.target.value as PresetLabel)}>
              {QUICK_PRESETS.map((p) => <option key={p.label} value={p.label}>{p.label}</option>)}
            </select>
          </div>
          <div className="modal-dates">
            <div className="modal-field">
              <label className="modal-label">Start Date</label>
              <input type="date" className="modal-date-input" value={fromStr} disabled={!isCustom} onChange={(e) => setFromStr(e.target.value)} />
            </div>
            <div className="modal-field">
              <label className="modal-label">End Date</label>
              <input type="date" className="modal-date-input" value={toStr} disabled={!isCustom} onChange={(e) => setToStr(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn-apply" onClick={handleApply}>Apply Filter</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, delta, positive, accent, icon }: {
  label: string; value: string; sub: string; delta: string;
  positive: boolean; accent: string; icon: React.ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <div className="stat-icon-wrap" style={{ background: accent+"18", color: accent }}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">
        <span className={`stat-delta ${positive ? "delta-up" : "delta-down"}`}>{delta}</span>
        &nbsp;{sub}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status==="pending"   ? "s-pending"   :
    status==="shipped"   ? "s-shipped"   :
    status==="delivered" ? "s-delivered" : "s-cancelled";
  return <span className={`status-badge ${cls}`}>{status}</span>;
}

const Icons = {
  cart:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  dollar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  clock:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  users:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  filter: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  close:  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [users,    setUsers]    = useState<User[]>([]);
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);

  const defaultRange: DateRange = {
    from: new Date(Date.now()-29*86_400_000),
    to:   new Date(),
  };

  const [dateRange,   setDateRange]   = useState<DateRange>(defaultRange);
  const [activeLabel, setActiveLabel] = useState<string>(DEFAULT_LABEL);
  const [isFiltered,  setIsFiltered]  = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [statusFilter,setStatus]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [chartType,   setChartType]   = useState<"line"|"bar">("line");

  // ── Fetch ──
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("skinmuse_superadmin_token") || localStorage.getItem("skinmuse_admin_token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        const [prodRes, userRes, orderRes] = await Promise.all([
          axios.get("https://skinmusebackend-delta.vercel.app/api/products",   { headers }),
          axios.get("https://skinmusebackend-delta.vercel.app/api/auth/users", { headers }),
          axios.get("https://skinmusebackend-delta.vercel.app/api/orders",     { headers }),
        ]);
        const productList: Product[] = Array.isArray(prodRes.data.products) ? prodRes.data.products : Array.isArray(prodRes.data) ? prodRes.data : [];
        const userList: User[]       = Array.isArray(userRes.data.users)    ? userRes.data.users    : Array.isArray(userRes.data) ? userRes.data : [];
        const orderList: Order[]     = Array.isArray(orderRes.data.orders)  ? orderRes.data.orders  : Array.isArray(orderRes.data) ? orderRes.data : [];
        orderList.sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
        setProducts(productList);
        setUsers(user.role==="superAdmin" ? userList : userList.filter((u) => u.role==="customer"));
        setOrders(orderList);
      } catch (err: any) {
        toast({ title:"Error", description: err.response?.data?.message||"Failed to fetch data", variant:"destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // ── Derived ──
  const rangeOrders  = useMemo(() => filterByDateRange(orders, dateRange), [orders, dateRange]);
  const trendData    = useMemo(() => buildTrend(rangeOrders, dateRange),   [rangeOrders, dateRange]);
  const totalOrders  = rangeOrders.length;
  const totalRevenue = rangeOrders.reduce((s,o) => s+(o.totalPrice??0), 0);
  const pendingOrders= rangeOrders.filter((o) => o.status==="pending").length;
  const deliveredOrders = rangeOrders.filter((o) => o.status === "delivered").length;

  const donutData = useMemo(() => {
    const map: Record<string,number> = {};
    rangeOrders.forEach((o) => { map[o.status]=(map[o.status]||0)+1; });
    return Object.entries(map).map(([name,value]) => ({ name, value }));
  }, [rangeOrders]);

  const filteredOrders = useMemo(() => {
    return rangeOrders.filter((o) => {
      if (statusFilter!=="all" && o.status!==statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!o._id.toLowerCase().includes(s) && !`${o.firstName} ${o.lastName}`.toLowerCase().includes(s) && !o.email.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [rangeOrders, statusFilter, search]);

  const uniqueCustomersCount = useMemo(() => new Set(filteredOrders.map(o=>o._id)).size, [filteredOrders]);

  function handleApplyFilter(range: DateRange, label: string) {
    setDateRange(range);
    setActiveLabel(label);
    setIsFiltered(true);
    setShowModal(false);
  }

  function handleClearFilter() {
    setDateRange(defaultRange);
    setActiveLabel(DEFAULT_LABEL);
    setIsFiltered(false);
  }

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#fff" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
          <div className="spinner" />
          <p style={{ color:"#666", fontSize:15, fontFamily:"'DM Sans', sans-serif" }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Render ──
  return (
    <>
      <style>{CSS}</style>
      {showModal && (
        <DateFilterModal initial={dateRange} onClose={() => setShowModal(false)} onApply={handleApplyFilter} />
      )}

      <div className="dash">
        <main className="main">
          {/* Top Bar */}
          <div className="topbar">
            <div className="topbar-left">
              <h1>Dashboard</h1>
              <span>{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>
            </div>
            <div className="topbar-badge">Admin Panel</div>
          </div>

          <div className="content">
            {/* ── Filters ── */}
            <div className="filters">
              <button className="filter-btn date-filter-btn" onClick={() => setShowModal(true)}>
                {Icons.filter}
                <span>{activeLabel}</span>
                <span className="qf-dates">{toInputDate(dateRange.from)} → {toInputDate(dateRange.to)}</span>
              </button>

              {/* Clear Filter Button — shown only when a filter has been applied */}
              {isFiltered && (
                <button className="filter-btn clear-btn" onClick={handleClearFilter}>
                  {Icons.close}
                  <span>Clear filter</span>
                </button>
              )}

              <div className="filter-sep" />

              <span className="filter-label">Status</span>
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <input
                className="search-input"
                placeholder="Search orders or customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* ── Stats ── */}
            <div className="stats-grid">
              <StatCard label="Total Orders"     value={String(totalOrders)}                  delta="+12%"            positive  sub="vs last period" accent="#111111" icon={Icons.cart}   />
              <StatCard label="Revenue"          value={formatCurrency(totalRevenue)}          delta="+8.3%"           positive  sub="vs last period" accent="#22c55e" icon={Icons.dollar} />
              <StatCard label="Pending"          value={String(pendingOrders)}                 delta={`+${pendingOrders}`} positive={false} sub="need action"   accent="#ef4444" icon={Icons.clock}  />
              <StatCard label="Delivered"  value={String(deliveredOrders)}  delta={`+${deliveredOrders}`} positive  sub="completed orders"  accent="#3b82f6" icon={Icons.cart}  />
              <StatCard label="Total Customers"  value={uniqueCustomersCount.toLocaleString()} delta="+24"             positive  sub="placed orders"  accent="#f59e0b" icon={Icons.users}  />
            </div>

            {/* ── Charts ── */}
            <div className="charts-row">
              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Order &amp; Revenue Trend</div>
                    <div className="chart-sub">Daily volume over selected period</div>
                  </div>
                  <div className="chart-tabs">
                    {(["line","bar"] as const).map((t) => (
                      <button key={t} className={`ctab ${chartType===t?"active":""}`} onClick={() => setChartType(t)}>
                        {t.charAt(0).toUpperCase()+t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={230}>
                  {chartType==="line" ? (
                    <LineChart data={trendData} margin={{top:4,right:4,left:-20,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{fill:"#999",fontSize:10}} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis yAxisId="left"  tick={{fill:"#999",fontSize:10}} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{fill:"#999",fontSize:10}} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,color:"#111",fontSize:12}} />
                      <Line yAxisId="left"  type="monotone" dataKey="orders"  stroke="#111111" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                  ) : (
                    <BarChart data={trendData} margin={{top:4,right:4,left:-20,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="date" tick={{fill:"#999",fontSize:10}} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{fill:"#999",fontSize:10}} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,color:"#111",fontSize:12}} />
                      <Bar dataKey="orders"  fill="#111111" radius={[3,3,0,0]} maxBarSize={16} />
                      <Bar dataKey="revenue" fill="#22c55e" radius={[3,3,0,0]} maxBarSize={16} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
                <div className="chart-legend">
                  <span><span className="legend-dot" style={{background:"#111"}} />Orders</span>
                  <span><span className="legend-dot" style={{background:"#22c55e"}} />Revenue</span>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Order Status</div>
                    <div className="chart-sub">Current distribution</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                      {donutData.map((entry,i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name]??DONUT_COLORS[i%DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,color:"#111",fontSize:12}}
                      formatter={(v:number,n:string) => [`${v} orders`, n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-legend">
                  {donutData.map((d,i) => (
                    <span key={d.name}>
                      <span className="legend-sq" style={{background:STATUS_COLORS[d.name]??DONUT_COLORS[i]}} />
                      {d.name} {totalOrders ? Math.round((d.value/totalOrders)*100) : 0}%
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Orders Table ── */}
            <div className="table-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Recent Orders</div>
                  <div className="chart-sub">Showing {filteredOrders.length} order{filteredOrders.length!==1?"s":""}</div>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length===0 ? (
                      <tr><td colSpan={5} className="empty">No orders match your filters</td></tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o._id}>
                          <td><span className="order-id">#{o._id.slice(-6).toUpperCase()}</span></td>
                          <td>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span className="avatar-sm">{getInitials(`${o.firstName} ${o.lastName}`)}</span>
                              <div style={{display:"flex",flexDirection:"column"}}>
                                <span style={{fontWeight:500,fontSize:12}}>{o.firstName} {o.lastName}</span>
                                <span className="muted" style={{fontSize:10}}>{o.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="price">Rs{(o.totalPrice??0).toFixed(2)}</td>
                          <td><StatusBadge status={o.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --white:   #ffffff;
    --off:     #f8f8f7;
    --border:  #e8e8e5;
    --border2: #d0d0cc;
    --text1:   #111111;
    --text2:   #555555;
    --text3:   #999999;
    --black:   #111111;
    --red:     #ef4444;
    --yellow:  #f59e0b;
    --green:   #22c55e;
    --r:       12px;
  }

  body { background: var(--white); font-family: 'DM Sans', sans-serif; color: var(--text1); }

  h1, .chart-title, .stat-label, .stat-value, .filter-label,
  .order-id, .price, .ctab, .status-badge, .topbar-badge, .modal-title
    { font-family: 'Syne', sans-serif; }

  /* Spinner */
  .spinner { width:36px;height:36px;border-radius:50%;border:3px solid #eee;border-top-color:#111;animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* Layout */
  .dash { display:grid; min-height:100vh; background:var(--white); }
  .main { overflow:hidden; }

  /* Top Bar */
  .topbar { display:flex;align-items:center;justify-content:space-between;padding:18px 28px;border-bottom:1.5px solid var(--border);background:var(--white); }
  .topbar-left h1 { font-size:22px;color:var(--black);font-weight:700;letter-spacing:-.4px; }
  .topbar-left span { font-size:12px;color:var(--text3);margin-top:2px;display:block; }
  .topbar-badge { font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;background:var(--black);color:#fff;padding:5px 12px;border-radius:20px; }

  /* Content */
  .content { padding:24px 28px;display:flex;flex-direction:column;gap:20px; }

  /* Filters */
  .filters { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
  .filter-label { font-size:10px;color:var(--text3);font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-family:'Syne',sans-serif; }

  .filter-btn {
    display:inline-flex;align-items:center;gap:7px;
    padding:7px 14px;border-radius:8px;font-size:12px;font-weight:600;
    border:1.5px solid var(--border2);background:var(--white);color:var(--text2);
    cursor:pointer;transition:all .15s;font-family:'Syne',sans-serif;
  }
  .filter-btn:hover { border-color:var(--black);color:var(--black);background:var(--off); }

  .date-filter-btn { border-color:var(--black);background:var(--black);color:#fff; }
  .date-filter-btn:hover { background:#333;border-color:#333;color:#fff; }
  .qf-dates { font-size:10px;color:#aaa;font-family:'DM Sans',sans-serif;font-weight:400; }

  /* Clear Filter Button */
  .clear-btn { border-color:var(--red);color:var(--red);background:#fff5f5; }
  .clear-btn:hover { background:var(--red);color:#fff;border-color:var(--red); }

  .filter-sep { width:1px;height:20px;background:var(--border);flex-shrink:0; }

  .filter-select {
    padding:7px 12px;border-radius:8px;font-size:12px;
    border:1.5px solid var(--border2);background:var(--white);color:var(--text2);
    outline:none;font-family:'DM Sans',sans-serif;cursor:pointer;transition:border-color .15s;
  }
  .filter-select:focus { border-color:var(--black); }

  .search-input {
    background:var(--white);border:1.5px solid var(--border2);color:var(--text1);
    border-radius:8px;padding:7px 12px;font-size:12px;outline:none;
    font-family:'DM Sans',sans-serif;width:220px;transition:border-color .15s;
  }
  .search-input::placeholder { color:var(--text3); }
  .search-input:focus { border-color:var(--black); }

  /* Modal */
  .modal-overlay { position:fixed;inset:0;background:#00000055;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px; }
  .modal-box { background:var(--white);border:1.5px solid var(--border2);border-radius:16px;width:440px;max-width:100%;overflow:hidden; }
  .modal-header { display:flex;align-items:center;justify-content:space-between;padding:18px 22px;background:var(--black);border-bottom:1px solid var(--border); }
  .modal-title { font-size:14px;font-weight:700;color:#fff;letter-spacing:-.1px; }
  .modal-close { background:none;border:none;color:#aaa;font-size:16px;cursor:pointer;line-height:1;transition:color .15s; }
  .modal-close:hover { color:#fff; }
  .modal-body { padding:22px;display:flex;flex-direction:column;gap:18px; }
  .modal-field { display:flex;flex-direction:column;gap:6px; }
  .modal-label { font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em; }
  .modal-select { width:100%;padding:10px 14px;border-radius:10px;font-size:13px;border:1.5px solid var(--border2);background:var(--white);color:var(--text1);outline:none;font-family:'DM Sans',sans-serif;cursor:pointer;transition:border-color .15s; }
  .modal-select:focus { border-color:var(--black); }
  .modal-dates { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
  .modal-date-input { width:100%;padding:10px 12px;border-radius:10px;font-size:13px;border:1.5px solid var(--border2);background:var(--white);color:var(--text1);outline:none;font-family:'DM Sans',sans-serif;transition:border-color .15s; }
  .modal-date-input:not(:disabled):focus { border-color:var(--black); }
  .modal-date-input:disabled { opacity:.4;cursor:not-allowed; }
  .modal-footer { display:flex;justify-content:flex-end;gap:10px;padding:16px 22px;border-top:1px solid var(--border); }
  .modal-btn-cancel { padding:9px 20px;border-radius:10px;font-size:13px;font-weight:600;border:1.5px solid var(--border2);background:transparent;color:var(--text2);cursor:pointer;font-family:'Syne',sans-serif;transition:all .15s; }
  .modal-btn-cancel:hover { background:var(--off);color:var(--text1); }
  .modal-btn-apply { padding:9px 22px;border-radius:10px;font-size:13px;font-weight:700;border:none;background:var(--black);color:#fff;cursor:pointer;font-family:'Syne',sans-serif;transition:background .15s; }
  .modal-btn-apply:hover { background:#333; }

  /* Stats Grid */
  .stats-grid { display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px; }
  .stat-card { background:var(--white);border:1.5px solid var(--border);border-radius:var(--r);padding:18px 20px;transition:border-color .2s,box-shadow .2s; }
  .stat-card:hover { border-color:var(--border2);box-shadow:0 2px 12px rgba(0,0,0,.06); }
  .stat-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:14px; }
  .stat-icon-wrap { width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
  .stat-label { font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.08em;text-transform:uppercase; }
  .stat-value { font-size:28px;font-weight:700;letter-spacing:-1.5px;line-height:1;color:var(--black); }
  .stat-sub { font-size:11px;color:var(--text3);margin-top:7px;display:flex;align-items:center;gap:4px; }
  .stat-delta { font-size:11px;font-weight:700;padding:2px 7px;border-radius:5px; }
  .delta-up   { color:var(--green);background:#dcfce7; }
  .delta-down { color:var(--red);background:#fee2e2; }

  /* Charts */
  .charts-row { display:grid;grid-template-columns:2fr 1fr;gap:14px; }
  .chart-card { background:var(--white);border:1.5px solid var(--border);border-radius:var(--r);padding:20px; }
  .chart-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px; }
  .chart-title { font-size:14px;font-weight:700;letter-spacing:-.2px;color:var(--black); }
  .chart-sub { font-size:11px;color:var(--text3);margin-top:2px; }
  .chart-tabs { display:flex;gap:3px;background:var(--off);border-radius:8px;padding:3px; }
  .ctab { padding:4px 14px;border-radius:6px;font-size:11px;font-weight:700;color:var(--text3);cursor:pointer;border:none;background:transparent;transition:all .15s;font-family:'Syne',sans-serif; }
  .ctab.active { background:var(--white);color:var(--black);border:1.5px solid var(--border2); }
  .chart-legend { display:flex;gap:16px;margin-top:12px;flex-wrap:wrap; }
  .chart-legend span { display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text3);font-family:'Syne',sans-serif; }
  .legend-dot { width:10px;height:3px;border-radius:2px;display:inline-block; }
  .donut-legend { display:flex;flex-wrap:wrap;gap:8px;margin-top:10px; }
  .donut-legend span { display:flex;align-items:center;gap:5px;font-size:10px;color:var(--text2);font-family:'Syne',sans-serif; }
  .legend-sq { width:8px;height:8px;border-radius:2px;display:inline-block;flex-shrink:0; }

  /* Table */
  .table-card { background:var(--white);height:60vh;overflow-y:auto;border:1.5px solid var(--border);border-radius:var(--r);padding:20px; }
  .table-wrap { overflow-x:auto;margin-top:4px; }
  table { width:100%;border-collapse:collapse;font-size:12px; }
  thead th { font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.08em;text-transform:uppercase;text-align:left;padding:0 12px 10px;border-bottom:1.5px solid var(--border);font-family:'Syne',sans-serif;white-space:nowrap; }
  tbody tr { border-bottom:1px solid var(--border);transition:background .1s; }
  tbody tr:last-child { border-bottom:none; }
  tbody tr:hover { background:var(--off); }
  tbody td { padding:11px 12px;color:var(--text1);vertical-align:middle; }
  .order-id { color:var(--black);font-weight:700;font-size:11px;letter-spacing:.02em; }
  .muted { color:var(--text3) !important; }
  .price { font-weight:700;color:var(--black); }
  .avatar-sm { width:28px;height:28px;border-radius:50%;background:var(--off);border:1.5px solid var(--border2);display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:var(--text2);font-family:'Syne',sans-serif;flex-shrink:0; }
  .empty { text-align:center;padding:28px;color:var(--text3);font-size:13px; }

  /* Status badges */
  .status-badge { padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.04em;white-space:nowrap; }
  .s-pending   { background:#fef3c7;color:#92400e;border:1px solid #fcd34d; }
  .s-shipped   { background:#dbeafe;color:#1e40af;border:1px solid #93c5fd; }
  .s-delivered { background:#dcfce7;color:#166534;border:1px solid #86efac; }
  .s-cancelled { background:#fee2e2;color:#991b1b;border:1px solid #fca5a5; }

  /* Responsive */
  @media (max-width:1100px) {
    .stats-grid  { grid-template-columns:repeat(3,minmax(0,1fr)); }
    .charts-row  { grid-template-columns:1fr; }
  }
  @media (max-width:768px) {
    .content  { padding:16px; }
    .topbar   { padding:14px 16px; }
    .stats-grid { grid-template-columns:repeat(2,minmax(0,1fr));gap:10px; }
    .stat-value { font-size:22px; }
    .filters  { gap:6px; }
    .search-input { width:100%; }
    .qf-dates { display:none; }
  }
  @media (max-width:480px) {
    .stats-grid  { grid-template-columns:1fr 1fr;gap:8px; }
    .stat-card   { padding:14px; }
    .stat-value  { font-size:20px; }
    .chart-card  { padding:14px; }
    .table-card  { padding:14px; }
    .modal-dates { grid-template-columns:1fr; }
    .topbar-badge { display:none; }
  }
`;