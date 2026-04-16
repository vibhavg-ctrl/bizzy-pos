import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, Truck, BarChart3,
  Store, Users, Settings, Zap, Globe, FileText, ArrowRightLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GROUPS = [
  { key:"main",   label:"Main",       items:[
    { title:"Dashboard",      url:"/",               icon:LayoutDashboard },
    { title:"POS Terminal",   url:"/pos",            icon:ShoppingCart,   badge:"Live" },
    { title:"Inventory",      url:"/inventory",      icon:Package },
  ]},
  { key:"orders", label:"Orders",     items:[
    { title:"Online Orders",    url:"/online-orders",   icon:Globe },
    { title:"Purchase Orders",  url:"/purchase-orders", icon:FileText },
    { title:"Stock Transfers",  url:"/stock-transfers", icon:ArrowRightLeft },
  ]},
  { key:"ops",    label:"Operations", items:[
    { title:"Suppliers", url:"/suppliers", icon:Truck },
    { title:"Reports",   url:"/reports",   icon:BarChart3 },
    { title:"Outlets",   url:"/outlets",   icon:Store },
  ]},
  { key:"admin",  label:"Admin",      items:[
    { title:"Users",    url:"/users",    icon:Users },
    { title:"Settings", url:"/settings", icon:Settings },
  ]},
];

export function AppSidebar() {
  const location = useLocation();
  return (
    <aside className="flex flex-col w-56 shrink-0 border-r border-border bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-display font-black text-sm tracking-tight text-foreground" style={{ fontFamily:"Syne,sans-serif", fontWeight:800 }}>BIZZY</div>
          <div className="text-[9px] font-semibold tracking-widest uppercase text-muted-foreground" style={{ marginTop:"-1px" }}>POS System</div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 py-3 px-2 overflow-auto custom-scroll space-y-4">
        {GROUPS.map((group) => (
          <div key={group.key}>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <NavLink key={item.url} to={item.url} end activeClassName=""
                    className={cn(
                      "relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all",
                      isActive
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.title}</span>
                    {"badge" in item && !isActive && (
                      <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase bg-emerald-100 text-emerald-700">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-secondary">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-xs font-black text-white">R</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">Rajesh Kumar</p>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-ring" />
        </div>
      </div>
    </aside>
  );
}
