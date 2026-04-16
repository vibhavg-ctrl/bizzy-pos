import { Bell, Clock, Store, Wifi, ChevronDown, RefreshCw, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useInventoryStore } from "@/store/inventoryStore";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "/":                { title:"Dashboard",        sub:"System overview & analytics" },
  "/pos":             { title:"POS Terminal",      sub:"Live checkout" },
  "/inventory":       { title:"Inventory",         sub:"Product & stock management" },
  "/online-orders":   { title:"Online Orders",     sub:"Delivery & fulfilment" },
  "/purchase-orders": { title:"Purchase Orders",   sub:"Vendor order management" },
  "/stock-transfers": { title:"Stock Transfers",   sub:"Inter-outlet movements" },
  "/suppliers":       { title:"Suppliers",         sub:"Vendor directory" },
  "/reports":         { title:"Reports",           sub:"Analytics & exports" },
  "/outlets":         { title:"Outlets",           sub:"Store management" },
  "/users":           { title:"Users",             sub:"Staff & access control" },
  "/settings":        { title:"Settings",          sub:"System configuration" },
};

export function TopBar() {
  const [time, setTime] = useState(new Date());
  const [outletOpen, setOutletOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const { outlets, currentOutletId, setCurrentOutlet, lastSyncTime, triggerSync } = useInventoryStore();
  const currentOutlet = outlets.find((o) => o.id === currentOutletId) || outlets[0];
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || { title:"Bizzy POS", sub:"" };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOutletOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      triggerSync();
      setSyncing(false);
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2000);
    }, 800);
  };

  const timeStr = time.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
  const dateStr = time.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" });
  const syncAgo  = Math.floor((Date.now() - lastSyncTime.getTime()) / 1000);
  const syncLabel = syncAgo < 5 ? "Just synced" : syncAgo < 60 ? `${syncAgo}s ago` : `${Math.floor(syncAgo/60)}m ago`;

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-6 shrink-0"
      style={{ boxShadow:"0 1px 0 hsl(210 18% 88%)" }}>
      <div>
        <h1 className="font-bold text-sm text-foreground leading-tight">{page.title}</h1>
        <p className="text-[11px] text-muted-foreground">{page.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Outlet switcher */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setOutletOpen((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              outletOpen
                ? "bg-primary/8 border-primary/30 text-primary"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-border/80"
            )}
          >
            <Store className="w-3.5 h-3.5" />
            <span>{currentOutlet?.name || "Select outlet"}</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform", outletOpen && "rotate-180")} />
          </button>

          {outletOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl border border-border bg-white shadow-lg z-50 overflow-hidden animate-fade-up">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Switch Outlet</p>
              </div>
              {outlets.map((outlet) => (
                <button
                  key={outlet.id}
                  onClick={() => { setCurrentOutlet(outlet.id); setOutletOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                    outlet.id === currentOutletId
                      ? "bg-primary/8 text-primary"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    outlet.isActive ? "bg-emerald-500" : "bg-gray-300"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs truncate">{outlet.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{outlet.address}</p>
                  </div>
                  {outlet.id === currentOutletId && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sync button */}
        <button onClick={handleSync}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
            justSynced
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-secondary border-border text-muted-foreground hover:text-foreground"
          )}>
          {syncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : justSynced ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>{justSynced ? "Synced!" : syncLabel}</span>
          {!syncing && !justSynced && <span className="sync-dot w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        </button>

        {/* Online indicator */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
          <Wifi className="w-3.5 h-3.5" />
          Online
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white bg-red-500" />
        </button>

        {/* Clock */}
        <div className="flex flex-col items-end">
          <span className="font-mono text-xs font-bold text-foreground">{timeStr}</span>
          <span className="text-[10px] text-muted-foreground">{dateStr}</span>
        </div>
      </div>
    </header>
  );
}
