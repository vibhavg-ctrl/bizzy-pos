import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search, Clock, CheckCircle2, XCircle, Truck, Package, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = "all"|"blinkit"|"zepto"|"swiggy"|"bigbasket"|"dunzo";
type OrderStatus = "pending"|"accepted"|"preparing"|"ready"|"dispatched"|"delivered"|"cancelled";
interface OnlineOrder {
  id:string; platform:Platform; orderId:string; customerName:string;
  items:{name:string;qty:number;price:number}[];
  total:number; status:OrderStatus; placedAt:string; deliverySlot:string; riderName?:string;
}

const PLATFORM_META: Record<string,{label:string;color:string;bg:string;emoji:string}> = {
  blinkit:   { label:"Blinkit",         color:"#854d0e", bg:"#fef9c3", emoji:"⚡" },
  zepto:     { label:"Zepto",           color:"#6d28d9", bg:"#ede9fe", emoji:"🟣" },
  swiggy:    { label:"Swiggy",          color:"#9a3412", bg:"#ffedd5", emoji:"🟠" },
  bigbasket: { label:"BigBasket",       color:"#166534", bg:"#dcfce7", emoji:"🛒" },
  dunzo:     { label:"Dunzo",           color:"#075985", bg:"#e0f2fe", emoji:"🔵" },
};

const STATUS_META: Record<OrderStatus,{color:string;bg:string;icon:any;label:string;next?:OrderStatus;nextLabel?:string}> = {
  pending:   { color:"#92400e", bg:"#fef3c7", icon:Clock,        label:"Pending",   next:"accepted",  nextLabel:"Accept" },
  accepted:  { color:"#075985", bg:"#e0f2fe", icon:CheckCircle2, label:"Accepted",  next:"preparing", nextLabel:"Start Prep" },
  preparing: { color:"#9a3412", bg:"#ffedd5", icon:Package,      label:"Preparing", next:"ready",     nextLabel:"Mark Ready" },
  ready:     { color:"#166534", bg:"#dcfce7", icon:Package,      label:"Ready",     next:"dispatched",nextLabel:"Dispatch" },
  dispatched:{ color:"#6d28d9", bg:"#ede9fe", icon:Truck,        label:"Dispatched",next:"delivered", nextLabel:"Delivered" },
  delivered: { color:"#065f46", bg:"#d1fae5", icon:CheckCircle2, label:"Delivered" },
  cancelled: { color:"#9f1239", bg:"#fee2e2", icon:XCircle,      label:"Cancelled" },
};

const mockOrders: OnlineOrder[] = [
  { id:"1", platform:"blinkit", orderId:"BLK-78234", customerName:"Rahul S.", items:[{name:"Amul Milk 1L",qty:2,price:65},{name:"Bread",qty:1,price:45}], total:175, status:"pending", placedAt:"2 min ago", deliverySlot:"10 mins" },
  { id:"2", platform:"zepto",   orderId:"ZPT-45112", customerName:"Priya M.", items:[{name:"Coca-Cola 500ml",qty:3,price:40},{name:"Lays Classic",qty:2,price:30}], total:180, status:"accepted", placedAt:"5 min ago", deliverySlot:"8 mins" },
  { id:"3", platform:"swiggy",  orderId:"SWG-99087", customerName:"Amit K.", items:[{name:"Rice 5kg",qty:1,price:280},{name:"Butter 200g",qty:1,price:60}], total:340, status:"preparing", placedAt:"12 min ago", deliverySlot:"15 mins" },
  { id:"4", platform:"bigbasket",orderId:"BB-33456", customerName:"Sneha R.", items:[{name:"Bananas 1kg",qty:2,price:50},{name:"Orange Juice 1L",qty:1,price:85}], total:185, status:"ready", placedAt:"18 min ago", deliverySlot:"Scheduled", riderName:"Rajesh" },
  { id:"5", platform:"blinkit", orderId:"BLK-78240", customerName:"Deepak V.", items:[{name:"Shampoo 200ml",qty:1,price:150},{name:"Dishwash",qty:1,price:110}], total:260, status:"dispatched", placedAt:"25 min ago", deliverySlot:"10 mins", riderName:"Sunil" },
  { id:"6", platform:"zepto",   orderId:"ZPT-45120", customerName:"Kavita J.", items:[{name:"Frozen Peas 500g",qty:2,price:90}], total:180, status:"delivered", placedAt:"45 min ago", deliverySlot:"10 mins" },
  { id:"7", platform:"dunzo",   orderId:"DNZ-12890", customerName:"Vikram P.", items:[{name:"Chicken Breast 500g",qty:2,price:180}], total:360, status:"cancelled", placedAt:"1 hr ago", deliverySlot:"20 mins" },
];

const OnlineOrders = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("all");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState(mockOrders);

  const platforms: Platform[] = ["all","blinkit","zepto","swiggy","bigbasket","dunzo"];
  const filtered = orders.filter((o) => (selectedPlatform==="all" || o.platform===selectedPlatform) && (!search || o.orderId.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase())));
  const pendingCount = orders.filter((o) => o.status==="pending").length;
  const activeCount  = orders.filter((o) => ["accepted","preparing","ready"].includes(o.status)).length;
  const revenue      = orders.filter((o) => o.status==="delivered").reduce((s,o) => s+o.total,0);

  const updateStatus = (id: string, s: OrderStatus) => setOrders((p) => p.map((o) => o.id===id ? {...o,status:s} : o));

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily:"Syne,sans-serif" }}>Online Orders</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Blinkit · Zepto · Swiggy · BigBasket · Dunzo</p>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount>0 && <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 animate-pulse"><span className="w-2 h-2 rounded-full bg-red-500" />{pendingCount} New</span>}
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">{activeCount} Active</span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">₹{revenue} Delivered</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-white"><RefreshCw className="w-3.5 h-3.5" /> Sync</button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {platforms.map((p) => {
              const meta = PLATFORM_META[p];
              const isA = selectedPlatform===p;
              return (
                <button key={p} onClick={() => setSelectedPlatform(p)}
                  className={cn("pill-tab flex items-center gap-1.5 shrink-0",isA?"pill-tab-active":"pill-tab-inactive")}
                  style={isA ? { background: meta?.color || "hsl(var(--primary))", color:"white" } : {}}>
                  {meta ? <span>{meta.emoji}</span> : null}
                  {p==="all" ? "All Platforms" : meta.label}
                </button>
              );
            })}
          </div>
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders…"
              className="pl-9 h-9 w-52 bg-white border-border rounded-xl text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((order) => {
            const sm = STATUS_META[order.status];
            const pm = PLATFORM_META[order.platform];
            const StatusIcon = sm.icon;
            return (
              <div key={order.id} className="rounded-2xl border border-border pos-shadow overflow-hidden bg-white animate-fade-up">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black px-2.5 py-1 rounded-lg" style={{ background:pm.bg, color:pm.color }}>{pm.emoji} {pm.label}</span>
                    <span className="text-xs font-mono font-bold text-foreground">{order.orderId}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ background:sm.bg, color:sm.color }}>
                    <StatusIcon className="w-3 h-3" />{sm.label}
                  </span>
                </div>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex justify-between">
                    <p className="text-sm font-bold text-foreground">{order.customerName}</p>
                    <p className="text-[11px] text-muted-foreground">{order.placedAt}</p>
                  </div>
                  <div className="space-y-1 border-t border-border/50 pt-2">
                    {order.items.map((item,i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.qty}× {item.name}</span>
                        <span className="font-mono font-medium text-foreground">₹{item.price*item.qty}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground">🕐 {order.deliverySlot}</p>
                      {order.riderName && <p className="text-[10px] text-muted-foreground">🛵 {order.riderName}</p>}
                    </div>
                    <p className="text-lg font-black text-foreground font-mono">₹{order.total}</p>
                  </div>
                </div>
                {order.status!=="delivered" && order.status!=="cancelled" && (
                  <div className="flex gap-2 px-3 py-3 border-t border-border bg-secondary/20">
                    {sm.next && (
                      <button onClick={() => updateStatus(order.id, sm.next!)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-105 transition-all active:scale-95">
                        {sm.nextLabel}
                      </button>
                    )}
                    {order.status==="pending" && (
                      <button onClick={() => updateStatus(order.id,"cancelled")}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all active:scale-95">
                        Reject
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};
export default OnlineOrders;
