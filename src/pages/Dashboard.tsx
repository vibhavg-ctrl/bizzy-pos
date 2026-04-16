import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { mockDailySalesData, mockCategorySales, mockRecentSales } from "@/data/mockData";
import { useInventoryStore } from "@/store/inventoryStore";
import { cn } from "@/lib/utils";

const CHART_COLORS = ["#10b981","#0ea5e9","#f59e0b","#a78bfa","#f43f5e","#38bdf8"];
const PAY_ICONS: Record<string,string> = { Cash:"💵", Card:"💳", UPI:"📱" };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl border border-border bg-white shadow-md text-xs">
      <p className="font-bold mb-1 text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>₹{p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { products, lastSyncTime } = useInventoryStore();
  const lowStock = products.filter((p) => p.currentStock <= p.minStockLevel);
  const [syncLabel, setSyncLabel] = useState("Just synced");

  useEffect(() => {
    const update = () => {
      const secs = Math.floor((Date.now() - lastSyncTime.getTime()) / 1000);
      if (secs < 5) setSyncLabel("Just synced");
      else if (secs < 60) setSyncLabel(`Synced ${secs}s ago`);
      else setSyncLabel(`Synced ${Math.floor(secs/60)}m ago`);
    };
    update();
    const t = setInterval(update, 5000);
    return () => clearInterval(t);
  }, [lastSyncTime]);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily:"Syne,sans-serif" }}>Good morning! 👋</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Here's what's happening at your store today.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="sync-dot w-2 h-2 rounded-full bg-emerald-500" />
            {syncLabel}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Today's Revenue" value="₹28,450" change="+12.5% vs yesterday" changeType="positive"
            icon={<DollarSign className="w-5 h-5" />} accent="#10b981" sublabel="156 transactions" />
          <StatCard title="Orders Today" value="156" change="+8 from yesterday" changeType="positive"
            icon={<ShoppingBag className="w-5 h-5" />} accent="#0ea5e9" sublabel="Avg ₹182 / order" />
          <StatCard title="Avg Order Value" value="₹182" change="-2.3% vs yesterday" changeType="negative"
            icon={<TrendingUp className="w-5 h-5" />} accent="#f59e0b" sublabel="Target: ₹200" />
          <StatCard title="Low Stock Items" value={lowStock.length.toString()} change="Needs restocking" changeType="negative"
            icon={<AlertTriangle className="w-5 h-5" />} accent="#f43f5e" sublabel={`of ${products.length} products`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-border p-5 pos-shadow bg-white">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-sm text-foreground">Weekly Sales</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Revenue trend this week</p>
              </div>
              <span className="font-mono text-sm font-black text-foreground">
                ₹{mockDailySalesData.reduce((s,d) => s+d.sales,0).toLocaleString()}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mockDailySalesData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 18% 90%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fill="url(#salesGrad)"
                  dot={{ fill:"#10b981", r:3 }} activeDot={{ r:5, fill:"#10b981" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border p-5 pos-shadow bg-white">
            <h3 className="font-bold text-sm text-foreground mb-1">Category Mix</h3>
            <p className="text-xs text-muted-foreground mb-4">Sales distribution today</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={mockCategorySales} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value">
                  {mockCategorySales.map((_,i) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background:"white", border:"1px solid hsl(210 18% 88%)", borderRadius:"12px", fontSize:"11px" }}
                  formatter={(v:number) => [`${v}%`,"Share"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1.5 mt-3">
              {mockCategorySales.map((cat,i) => (
                <div key={cat.name} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background:CHART_COLORS[i%CHART_COLORS.length] }} />
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-auto font-semibold text-foreground">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border p-5 pos-shadow bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-foreground">Recent Transactions</h3>
              <button className="text-xs text-primary flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-0.5">
              {mockRecentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-secondary">{PAY_ICONS[sale.paymentMethod]||"💰"}</div>
                    <div>
                      <p className="text-xs font-bold text-foreground font-mono">{sale.id}</p>
                      <p className="text-[10px] text-muted-foreground">{sale.items} items · {sale.cashier} · {sale.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-foreground font-mono">₹{sale.total}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(sale.date).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border p-5 pos-shadow bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground">Low Stock Alerts</h3>
                {lowStock.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">{lowStock.length}</span>
                )}
              </div>
              <button className="text-xs text-primary flex items-center gap-1">Reorder <ArrowRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-0.5">
              {lowStock.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
                  <div className="text-3xl">✅</div>
                  <p className="text-sm font-semibold">All items well stocked!</p>
                </div>
              ) : lowStock.slice(0,6).map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-secondary">
                      {product.currentStock===0 ? "❌" : "⚠️"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{product.sku} · Min: {product.minStockLevel}</p>
                    </div>
                  </div>
                  <p className={cn("font-black text-sm font-mono", product.currentStock===0 ? "text-red-500" : "text-amber-500")}>
                    {product.currentStock} left
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Dashboard;
