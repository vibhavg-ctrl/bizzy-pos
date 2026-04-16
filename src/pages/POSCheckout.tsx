import { useState, useRef, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useInventoryStore } from "@/store/inventoryStore";
import { Input } from "@/components/ui/input";
import {
  Barcode, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone,
  SplitSquareHorizontal, Receipt, Printer, CheckCircle2, RotateCcw, X,
  Search, Hash, Tag, User, Pause, ShoppingBag, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { mockCategories } from "@/data/mockData";

type PaymentMethod = "cash" | "card" | "upi" | "split";
type View = "products" | "numpad" | "search";

const CAT_META: Record<string, { emoji: string; from: string; to: string }> = {
  Beverages:     { emoji:"🥤", from:"#0ea5e9", to:"#0284c7" },
  Dairy:         { emoji:"🥛", from:"#a78bfa", to:"#7c3aed" },
  Snacks:        { emoji:"🍿", from:"#f59e0b", to:"#d97706" },
  Bakery:        { emoji:"🥐", from:"#fb923c", to:"#ea580c" },
  "Frozen Foods":{ emoji:"🧊", from:"#38bdf8", to:"#0369a1" },
  Produce:       { emoji:"🥦", from:"#22c55e", to:"#15803d" },
  Meat:          { emoji:"🥩", from:"#f43f5e", to:"#be123c" },
  Household:     { emoji:"🧹", from:"#8b5cf6", to:"#6d28d9" },
  "Personal Care":{ emoji:"💆", from:"#ec4899", to:"#be185d" },
  All:           { emoji:"✨", from:"#10b981", to:"#059669" },
};

const PAYMENT_METHODS = [
  { id:"cash"  as const, label:"Cash",  icon:Banknote,             color:"#10b981", bg:"#10b98118" },
  { id:"card"  as const, label:"Card",  icon:CreditCard,           color:"#0ea5e9", bg:"#0ea5e918" },
  { id:"upi"   as const, label:"UPI",   icon:Smartphone,           color:"#7c3aed", bg:"#7c3aed18" },
  { id:"split" as const, label:"Split", icon:SplitSquareHorizontal,color:"#f59e0b", bg:"#f59e0b18" },
];

function ProductCard({ product, onAdd }: { product: any; onAdd: ()=>void }) {
  const isOut = product.currentStock <= 0;
  const isLow = product.currentStock > 0 && product.currentStock <= product.minStockLevel;
  const meta  = CAT_META[product.category] || { emoji:"📦", from:"#6b7280", to:"#4b5563" };
  const [popped, setPopped] = useState(false);

  const handleClick = () => {
    if (isOut) { toast.error(`${product.name} is out of stock`); return; }
    onAdd();
    setPopped(true);
    setTimeout(() => setPopped(false), 220);
  };

  return (
    <button onClick={handleClick} disabled={isOut}
      className={cn("product-card p-3", popped && "animate-pop", isOut && "opacity-40 cursor-not-allowed")}
      style={isOut ? { background:"#f3f4f6" } : {
        background:`linear-gradient(135deg, ${meta.from}ee, ${meta.to}dd)`,
        boxShadow:`0 3px 12px ${meta.from}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
      }}
    >
      <span className="text-2xl mb-1 block">{meta.emoji}</span>
      <span className="block text-[11px] font-bold text-white leading-tight uppercase tracking-wide line-clamp-2">
        {product.name}
      </span>
      <span className="block text-sm font-black text-white mt-1 font-mono">₹{product.sellingPrice}</span>
      {isLow && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-300" />}
      {isOut && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-50/80 rounded-2xl">
          Out of Stock
        </span>
      )}
    </button>
  );
}

const POSCheckout = () => {
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, checkout } = useInventoryStore();
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchInput,  setSearchInput]  = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPayment,  setSelectedPayment]  = useState<PaymentMethod>("cash");
  const [discount,    setDiscount]    = useState(0);
  const [view,        setView]        = useState<View>("products");
  const [numpadValue, setNumpadValue] = useState("0");
  const [numpadMode,  setNumpadMode]  = useState<"qty"|"discount">("qty");
  const [selectedCartItem, setSelectedCartItem] = useState<string|null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [lastInvoice,  setLastInvoice]  = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { barcodeRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F2") { e.preventDefault(); setView("products"); barcodeRef.current?.focus(); }
      if (e.key === "F3") { e.preventDefault(); setView("search");   setTimeout(() => searchRef.current?.focus(), 50); }
      if (e.key === "F4") { e.preventDefault(); setView("numpad"); }
      if (e.key === "F12" && cart.length > 0) { e.preventDefault(); handleCheckout(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cart]);

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      const product = products.find((p) => p.barcode === barcodeInput.trim());
      if (product) {
        if (product.currentStock <= 0) toast.error(`${product.name} is out of stock!`);
        else { addToCart(product); toast.success(`Added: ${product.name}`, { duration:1500 }); }
      } else toast.error("No product found for this barcode.");
      setBarcodeInput("");
    }
  };

  const displayedProducts = useMemo(() => {
    let list = selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory);
    if (searchInput) list = list.filter((p) =>
      p.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchInput.toLowerCase()) ||
      p.barcode.includes(searchInput)
    );
    return list.slice(0, 35);
  }, [selectedCategory, products, searchInput]);

  const subtotal    = cart.reduce((s,i) => s + i.product.sellingPrice * i.quantity, 0);
  const taxTotal    = cart.reduce((s,i) => s + (i.product.sellingPrice * i.quantity * i.product.gstPercent) / 100, 0);
  const discountAmt = discount > 0 && discount <= 100 ? (subtotal * discount) / 100 : 0;
  const total       = subtotal + taxTotal - discountAmt;
  const change      = cashReceived ? Math.max(0, parseFloat(cashReceived) - total) : 0;

  const handleCheckout = () => {
    if (cart.length === 0) { toast.error("Cart is empty!"); return; }
    const result = checkout();
    if (result.success) {
      setLastInvoice(result.invoiceId);
      setShowSuccess(true);
      setDiscount(0); setCashReceived("");
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleNumpadKey = (key: string) => {
    if (key === "C")  { setNumpadValue("0"); return; }
    if (key === "⌫") { setNumpadValue((v) => v.length <= 1 ? "0" : v.slice(0,-1)); return; }
    if (key === "." && numpadValue.includes(".")) return;
    setNumpadValue((v) => v === "0" && key !== "." ? key : v + key);
  };

  const applyNumpad = () => {
    const val = parseFloat(numpadValue);
    if (isNaN(val)) return;
    if (numpadMode === "discount") { setDiscount(Math.min(val,100)); toast.success(`Discount: ${val}%`); }
    else if (numpadMode === "qty" && selectedCartItem) {
      updateCartQuantity(selectedCartItem, Math.max(1, Math.round(val)));
    }
    setNumpadValue("0");
  };

  const allCategories = ["All", ...mockCategories];

  return (
    <DashboardLayout>
      {/* Success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-spin-in flex flex-col items-center gap-4 p-8 rounded-3xl bg-white border-2 border-primary pos-shadow-md">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-primary">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <p className="font-black text-2xl text-foreground">Payment Complete!</p>
              <p className="text-muted-foreground font-mono mt-1">{lastInvoice}</p>
              {change > 0 && <p className="mt-2 text-lg font-bold text-primary">Change: ₹{change.toFixed(2)}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 h-[calc(100vh-7rem)]">
        {/* ── LEFT: Order panel ── */}
        <div className="w-[360px] flex flex-col rounded-2xl border border-border pos-shadow-md overflow-hidden shrink-0 bg-white">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-secondary/40">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm text-foreground">Current Order</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{cart.length} item{cart.length!==1?"s":""}</span>
              {cart.length > 0 && (
                <button onClick={() => { useInventoryStore.getState().clearCart(); setDiscount(0); }}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Barcode input */}
          <div className="px-4 py-3 border-b border-border">
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input ref={barcodeRef} value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeScan}
                placeholder="Scan barcode or enter code…"
                className="pl-9 h-9 font-mono text-sm bg-secondary/50 border-border focus:border-primary/50 rounded-lg" />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-mono">F2</kbd>
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-auto custom-scroll">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-secondary">
                  <ShoppingBag className="w-8 h-8 opacity-25" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Cart is empty</p>
                  <p className="text-xs mt-0.5">Scan a barcode or tap a product</p>
                </div>
              </div>
            ) : (
              <div className="py-1">
                {cart.map((item, index) => (
                  <div key={item.product.id}
                    onClick={() => setSelectedCartItem(item.product.id === selectedCartItem ? null : item.product.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors animate-slide-in-r border-l-2",
                      selectedCartItem === item.product.id
                        ? "bg-primary/5 border-primary"
                        : "hover:bg-secondary/40 border-transparent"
                    )}
                  >
                    <span className="text-[11px] font-mono text-muted-foreground w-5 shrink-0">{index+1}</span>
                    <span className="text-base shrink-0">{CAT_META[item.product.category]?.emoji || "📦"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{item.product.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">₹{item.product.sellingPrice} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); updateCartQuantity(item.product.id, item.quantity-1); }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-black text-foreground">{item.quantity}</span>
                      <button onClick={(e) => { e.stopPropagation(); updateCartQuantity(item.product.id, item.quantity+1); }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-black text-foreground font-mono w-16 text-right">
                      ₹{(item.product.sellingPrice * item.quantity).toFixed(0)}
                    </p>
                    <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.product.id); }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="border-t border-border bg-secondary/30">
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="font-mono font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">GST</span>
                <span className="font-mono font-semibold text-foreground">₹{taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Discount %</span>
                <div className="flex items-center gap-1.5">
                  <Input type="number" value={discount || ""} min={0} max={100}
                    onChange={(e) => setDiscount(Math.min(100, Number(e.target.value)||0))}
                    className="w-20 h-7 text-right text-xs font-mono bg-white border-border rounded-lg"
                    placeholder="0%" />
                  {discountAmt > 0 && <span className="text-emerald-600 font-mono font-bold text-xs">-₹{discountAmt.toFixed(0)}</span>}
                </div>
              </div>
              {selectedPayment === "cash" && cashReceived && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Change</span>
                  <span className="font-mono font-bold text-emerald-600">₹{change.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="px-4 py-3 flex items-center justify-between border-t border-primary/15 bg-primary/5">
              <span className="font-bold text-sm uppercase tracking-wide text-primary">Total</span>
              <span className="font-black text-2xl font-mono text-primary">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment + actions */}
          <div className="p-3 border-t border-border space-y-2.5 bg-white">
            <div className="grid grid-cols-4 gap-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <button key={pm.id} onClick={() => setSelectedPayment(pm.id)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-150 pos-btn"
                  style={selectedPayment === pm.id ? {
                    background: pm.bg, borderColor: pm.color, color: pm.color,
                  } : { background:"#f9fafb", borderColor:"#e5e7eb", color:"#9ca3af" }}>
                  <pm.icon className="w-4 h-4" />
                  <span className="text-[9px]">{pm.label}</span>
                </button>
              ))}
            </div>

            {selectedPayment === "cash" && (
              <Input type="number" value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="Cash received…"
                className="h-8 text-sm font-mono bg-secondary/50 border-border rounded-lg animate-fade-up" />
            )}

            <button onClick={handleCheckout} disabled={cart.length === 0}
              className="pos-btn w-full rounded-xl flex items-center justify-center gap-2.5 text-sm font-black transition-all"
              style={cart.length > 0 ? {
                background:"hsl(var(--primary))", color:"white",
                boxShadow:"0 4px 14px hsl(158 70% 38% / 0.35)", padding:"14px",
              } : { background:"#f3f4f6", color:"#9ca3af", cursor:"not-allowed", padding:"14px" }}>
              <CheckCircle2 className="w-5 h-5" />
              <span>TENDER ₹{total.toFixed(2)}</span>
              <kbd className="ml-auto text-[10px] opacity-60 font-mono">F12</kbd>
            </button>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label:"Receipt", icon:Receipt,    color:"#0ea5e9" },
                { label:"Print",   icon:Printer,    color:"#7c3aed" },
                { label:"Void",    icon:RotateCcw,  color:"#f43f5e", action:() => { useInventoryStore.getState().clearCart(); setDiscount(0); toast.info("Order voided"); } },
              ].map(({ label, icon:Icon, color, action }) => (
                <button key={label} onClick={action}
                  className="pos-btn flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all border"
                  style={{ background:`${color}10`, color, borderColor:`${color}30` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background=`${color}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background=`${color}10`; }}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Products / Search / Numpad ── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* View tabs + category pills */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-1 rounded-xl bg-white border border-border">
              {[
                { id:"products" as const, label:"Products", icon:ShoppingBag, key:"F2" },
                { id:"search"   as const, label:"Search",   icon:Search,       key:"F3" },
                { id:"numpad"   as const, label:"Numpad",   icon:Hash,         key:"F4" },
              ].map(({ id, label, icon:Icon, key }) => (
                <button key={id} onClick={() => { setView(id); if (id==="search") setTimeout(()=>searchRef.current?.focus(),50); }}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    view===id ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  <Icon className="w-3.5 h-3.5" />{label}
                  <kbd className="text-[9px] opacity-40 font-mono">{key}</kbd>
                </button>
              ))}
            </div>

            <div className="flex-1 flex gap-1.5 overflow-x-auto custom-scroll pb-0.5">
              {allCategories.map((cat) => {
                const meta = CAT_META[cat];
                const isA  = selectedCategory === cat;
                return (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={cn("pill-tab shrink-0 flex items-center gap-1.5", isA ? "pill-tab-active" : "pill-tab-inactive")}
                    style={isA ? { background:`linear-gradient(135deg,${meta.from},${meta.to})` } : {}}>
                    <span>{meta.emoji}</span>
                    <span>{cat === "All" ? "All Items" : cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Products / Search view */}
          {(view === "products" || view === "search") && (
            <>
              {view === "search" && (
                <div className="relative animate-fade-up">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input ref={searchRef} value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products by name, SKU, barcode…"
                    className="pl-10 h-10 bg-white border-border rounded-xl" />
                  {searchInput && (
                    <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex-1 overflow-auto custom-scroll">
                <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product}
                      onAdd={() => { addToCart(product); toast.success(`Added: ${product.name}`, { duration:1200 }); }} />
                  ))}
                  {displayedProducts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                      <Search className="w-10 h-10 opacity-20" />
                      <p className="font-semibold">No products found</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Numpad view */}
          {view === "numpad" && (
            <div className="flex-1 flex gap-4 animate-fade-up">
              <div className="w-56 flex flex-col gap-3">
                <div className="rounded-xl border border-border p-1 space-y-1 bg-white">
                  {[
                    { id:"qty"      as const, label:"Set Quantity", icon:Hash, color:"#0ea5e9" },
                    { id:"discount" as const, label:"Discount %",  icon:Tag,  color:"#10b981" },
                  ].map(({ id, label, icon:Icon, color }) => (
                    <button key={id} onClick={() => setNumpadMode(id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all"
                      style={numpadMode===id ? { background:`${color}15`, color, border:`1px solid ${color}40` } : { color:"#6b7280" }}>
                      <Icon className="w-4 h-4" />{label}
                    </button>
                  ))}
                </div>

                {numpadMode === "qty" && (
                  <div className="rounded-xl border border-border overflow-hidden bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 py-2 border-b border-border">Select Item</p>
                    <div className="max-h-48 overflow-auto custom-scroll">
                      {cart.length === 0 ? (
                        <p className="text-xs text-muted-foreground px-3 py-4 text-center">Cart empty</p>
                      ) : cart.map((item) => (
                        <button key={item.product.id} onClick={() => setSelectedCartItem(item.product.id)}
                          className={cn("w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors",
                            selectedCartItem===item.product.id ? "bg-primary/8 text-primary" : "text-foreground hover:bg-secondary/50")}>
                          <span>{CAT_META[item.product.category]?.emoji || "📦"}</span>
                          <span className="truncate font-medium">{item.product.name}</span>
                          <span className="ml-auto font-bold font-mono shrink-0">×{item.quantity}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-3 max-w-xs">
                <div className="rounded-xl border border-border px-5 py-4 text-right bg-white">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-1">
                    {numpadMode==="discount" ? "Discount %" : "Quantity"}
                  </p>
                  <p className="font-mono font-black text-4xl text-foreground">{numpadValue}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["7","8","9","4","5","6","1","2","3",".","0","⌫"].map((k) => (
                    <button key={k} onClick={() => handleNumpadKey(k)} className="numpad-btn">{k}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleNumpadKey("C")}
                    className="numpad-btn h-11 text-sm rounded-xl text-red-500">Clear</button>
                  <button onClick={applyNumpad}
                    className="h-11 rounded-xl font-bold text-sm transition-all active:scale-95 bg-primary text-white"
                    style={{ boxShadow:"0 4px 12px hsl(158 70% 38% / 0.3)" }}>
                    Apply ✓
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Function bar */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label:"Price Check", color:"#0ea5e9", icon:Search },
              { label:"% Discount",  color:"#10b981", icon:Tag },
              { label:"Hold Order",  color:"#f59e0b", icon:Pause },
              { label:"Customer",    color:"#7c3aed", icon:User },
              { label:"Mgr Override",color:"#f43f5e", icon:Star },
            ].map(({ label, color, icon:Icon }) => (
              <button key={label}
                className="pos-btn flex items-center justify-center gap-1.5 py-3 rounded-xl text-[11px] font-bold transition-all border"
                style={{ background:`${color}10`, color, borderColor:`${color}25` }}
                onMouseEnter={(e) => { e.currentTarget.style.background=`${color}20`; e.currentTarget.style.boxShadow=`0 4px 12px ${color}30`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background=`${color}10`; e.currentTarget.style.boxShadow="none"; }}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default POSCheckout;
