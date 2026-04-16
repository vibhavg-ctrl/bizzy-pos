import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useInventoryStore } from "@/store/inventoryStore";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package, PackagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddProductDialog } from "@/components/AddProductDialog";
import { StockAdjustmentDialog } from "@/components/StockAdjustmentDialog";
import { Product } from "@/types/inventory";

const CAT_META: Record<string, { emoji:string; color:string }> = {
  Beverages:      { emoji:"🥤", color:"#0ea5e9" },
  Dairy:          { emoji:"🥛", color:"#a78bfa" },
  Snacks:         { emoji:"🍿", color:"#f59e0b" },
  Bakery:         { emoji:"🥐", color:"#fb923c" },
  "Frozen Foods": { emoji:"🧊", color:"#38bdf8" },
  Produce:        { emoji:"🥦", color:"#22c55e" },
  Meat:           { emoji:"🥩", color:"#f43f5e" },
  Household:      { emoji:"🧹", color:"#8b5cf6" },
  "Personal Care":{ emoji:"💆", color:"#ec4899" },
};

const Inventory = () => {
  const { products } = useInventoryStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [sort, setSort] = useState<"name"|"stock"|"price">("name");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      return (!search || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(search))
        && (category === "All" || p.category === category);
    })
    .sort((a,b) => sort==="stock" ? a.currentStock-b.currentStock : sort==="price" ? b.sellingPrice-a.sellingPrice : a.name.localeCompare(b.name));

  const outOfStock = products.filter((p) => p.currentStock===0).length;
  const lowStock   = products.filter((p) => p.currentStock>0 && p.currentStock<=p.minStockLevel).length;
  const totalValue = products.reduce((s,p) => s + p.sellingPrice * p.currentStock, 0);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily:"Syne,sans-serif" }}>Inventory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{products.length} products · {categories.length-1} categories</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-105 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:"Inventory Value",  value:`₹${(totalValue/1000).toFixed(1)}k`, icon:"💰", color:"#10b981" },
            { label:"Low Stock Items",  value:lowStock,   icon:"⚠️", color:"#f59e0b" },
            { label:"Out of Stock",     value:outOfStock, icon:"🚫", color:"#f43f5e" },
          ].map(({ label,value,icon,color }) => (
            <div key={label} className="rounded-2xl border border-border p-4 pos-shadow bg-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="font-black text-xl font-mono" style={{ color }}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, SKU, barcode…"
              className="pl-10 h-10 bg-white border-border rounded-xl" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => {
              const meta = CAT_META[cat];
              const isA = category === cat;
              return (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={cn("pill-tab flex items-center gap-1.5", isA ? "pill-tab-active" : "pill-tab-inactive")}
                  style={isA ? { background: meta?.color || "hsl(var(--primary))", color:"white" } : {}}>
                  {meta && <span>{meta.emoji}</span>}{cat}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-secondary ml-auto">
            {(["name","stock","price"] as const).map((s) => (
              <button key={s} onClick={() => setSort(s)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
                  sort===s ? "bg-white text-foreground pos-shadow" : "text-muted-foreground hover:text-foreground")}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border pos-shadow overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {["Product","SKU / Barcode","Category","Cost","Price","Margin","Stock","Status",""].map((h) => (
                    <th key={h} className={cn("px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest",
                      ["Cost","Price","Margin","Stock"].includes(h) ? "text-right" : "text-left")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isOut = p.currentStock===0;
                  const isLow = p.currentStock>0 && p.currentStock<=p.minStockLevel;
                  const margin = ((p.sellingPrice-p.costPrice)/p.sellingPrice*100).toFixed(0);
                  const meta = CAT_META[p.category];
                  const stockPct = Math.min(100, Math.round(p.currentStock / Math.max(p.minStockLevel*3,1)*100));
                  return (
                    <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/25 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{ background: meta ? `${meta.color}18` : "hsl(var(--secondary))" }}>
                            {meta?.emoji || "📦"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.supplier}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-xs font-mono text-foreground">{p.sku}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{p.barcode}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
                          style={{ background: meta ? `${meta.color}15` : "hsl(var(--secondary))", color: meta?.color || "hsl(var(--muted-foreground))" }}>
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-right text-muted-foreground font-mono">₹{p.costPrice}</td>
                      <td className="px-5 py-3 text-sm text-right font-bold text-foreground font-mono">₹{p.sellingPrice}</td>
                      <td className="px-5 py-3 text-xs text-right">
                        <span className={cn("font-mono font-bold",
                          Number(margin)>=30 ? "text-emerald-600" : Number(margin)>=15 ? "text-amber-500" : "text-red-500")}>
                          {margin}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={cn("text-sm font-black font-mono",
                            isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-foreground")}>
                            {p.currentStock}
                          </span>
                          <div className="w-16 h-1.5 rounded-full overflow-hidden bg-gray-100">
                            <div className="h-full rounded-full" style={{ width:`${stockPct}%`, background: isOut?"#f43f5e":isLow?"#f59e0b":"#10b981" }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {isOut ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-lg font-bold bg-red-50 text-red-600">Out of Stock</span>
                        ) : isLow ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-lg font-bold bg-amber-50 text-amber-600">Low Stock</span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-1 rounded-lg font-bold bg-emerald-50 text-emerald-700">In Stock</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => setStockProduct(p)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors mx-auto">
                          <PackagePlus className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length===0 && (
              <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
                <Package className="w-10 h-10 opacity-20" />
                <p className="font-semibold">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddProductDialog open={showAdd} onOpenChange={setShowAdd} />
      <StockAdjustmentDialog open={!!stockProduct} onOpenChange={(o) => !o && setStockProduct(null)} product={stockProduct} />
    </DashboardLayout>
  );
};
export default Inventory;
