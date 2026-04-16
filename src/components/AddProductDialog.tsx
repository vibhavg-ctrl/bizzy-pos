import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import { toast } from "sonner";
import { mockCategories } from "@/data/mockData";
import { Upload, Download, X, FileSpreadsheet, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "manual" | "import";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

const SAMPLE_CSV_ROWS = [
  ["name","sku","barcode","category","supplier","costPrice","sellingPrice","gstPercent","currentStock","minStockLevel"],
  ["Coca-Cola 500ml","BEV-003","8901234500001","Beverages","Beverage Corp","25","40","18","100","20"],
  ["Amul Butter 500g","DAI-003","8901234500002","Dairy","Dairy Fresh Ltd","90","120","12","50","10"],
  ["Parle-G 800g","SNK-002","8901234500003","Snacks","Snack World","35","55","5","80","15"],
];

function downloadSampleCSV() {
  const content = SAMPLE_CSV_ROWS.map((r) => r.join(",")).join("\n");
  const blob = new Blob([content], { type:"text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "bizzy_import_sample.csv";
  a.click(); URL.revokeObjectURL(url);
}

const EMPTY_FORM = {
  name:"", sku:"", barcode:"", category:mockCategories[0], supplier:"",
  costPrice:"", sellingPrice:"", gstPercent:"18", currentStock:"", minStockLevel:"10",
};

export function AddProductDialog({ open, onOpenChange }: Props) {
  const { addProduct, importProducts } = useInventoryStore();
  const [tab, setTab] = useState<Tab>("manual");
  const [form, setForm] = useState(EMPTY_FORM);
  const [importRows, setImportRows] = useState<string[][]>([]);
  const [importPreview, setImportPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim())        e.name = "Required";
    if (!form.sku.trim())         e.sku  = "Required";
    if (!form.barcode.trim())     e.barcode = "Required";
    if (!form.sellingPrice)       e.sellingPrice = "Required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    addProduct({
      name: form.name.trim(),
      sku: form.sku.trim(),
      barcode: form.barcode.trim(),
      category: form.category,
      supplier: form.supplier.trim(),
      costPrice: Number(form.costPrice) || 0,
      sellingPrice: Number(form.sellingPrice),
      gstPercent: Number(form.gstPercent) || 0,
      currentStock: Number(form.currentStock) || 0,
      minStockLevel: Number(form.minStockLevel) || 10,
      image: "",
    });
    toast.success(`"${form.name}" added to inventory!`);
    setForm(EMPTY_FORM);
    setErrors({});
    onOpenChange(false);
  };

  const generateBarcode = () =>
    setForm((p) => ({ ...p, barcode: "890" + Math.random().toString().slice(2, 12) }));

  const handleCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.trim().split("\n").map((r) => r.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
      // skip header row
      const dataRows = rows.slice(1).filter((r) => r.length >= 10 && r[0]);
      setImportRows(dataRows);
      setImportPreview(true);
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = () => {
    const products = importRows.map((r) => ({
      name: r[0], sku: r[1], barcode: r[2], category: r[3] || mockCategories[0],
      supplier: r[4] || "",
      costPrice: Number(r[5]) || 0, sellingPrice: Number(r[6]) || 0,
      gstPercent: Number(r[7]) || 0,
      currentStock: Number(r[8]) || 0, minStockLevel: Number(r[9]) || 10,
      image: "",
    }));
    const count = importProducts(products);
    toast.success(`${count} products imported successfully!`);
    setImportRows([]); setImportPreview(false);
    onOpenChange(false);
  };

  const close = () => {
    setForm(EMPTY_FORM); setErrors({}); setImportRows([]); setImportPreview(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Add Product to Inventory</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary mb-2">
          {(["manual","import"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all",
                tab === t ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {t === "manual" ? <><Plus className="w-3.5 h-3.5" /> Manual Entry</> : <><FileSpreadsheet className="w-3.5 h-3.5" /> Import CSV</>}
            </button>
          ))}
        </div>

        {/* ── Manual tab ── */}
        {tab === "manual" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs font-semibold">Product Name <span className="text-red-500">*</span></Label>
                <Input value={form.name} onChange={f("name")} placeholder="e.g. Coca-Cola 500ml"
                  className={cn("h-9 mt-1", errors.name && "border-red-400")} />
                {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold">SKU <span className="text-red-500">*</span></Label>
                <Input value={form.sku} onChange={f("sku")} placeholder="e.g. BEV-003"
                  className={cn("h-9 mt-1", errors.sku && "border-red-400")} />
                {errors.sku && <p className="text-red-500 text-[10px] mt-0.5">{errors.sku}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold">Barcode <span className="text-red-500">*</span></Label>
                <div className="flex gap-2 mt-1">
                  <Input value={form.barcode} onChange={f("barcode")} placeholder="Scan or auto-generate"
                    className={cn("h-9 flex-1", errors.barcode && "border-red-400")} />
                  <button type="button" onClick={generateBarcode}
                    className="px-3 h-9 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors shrink-0">Auto</button>
                </div>
                {errors.barcode && <p className="text-red-500 text-[10px] mt-0.5">{errors.barcode}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold">Category</Label>
                <select value={form.category} onChange={f("category")}
                  className="w-full h-9 mt-1 rounded-lg border border-border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {mockCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Supplier</Label>
                <Input value={form.supplier} onChange={f("supplier")} placeholder="Supplier name" className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Cost Price (₹)</Label>
                <Input type="number" value={form.costPrice} onChange={f("costPrice")} placeholder="0" className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Selling Price (₹) <span className="text-red-500">*</span></Label>
                <Input type="number" value={form.sellingPrice} onChange={f("sellingPrice")} placeholder="0"
                  className={cn("h-9 mt-1", errors.sellingPrice && "border-red-400")} />
                {errors.sellingPrice && <p className="text-red-500 text-[10px] mt-0.5">{errors.sellingPrice}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold">GST %</Label>
                <select value={form.gstPercent} onChange={f("gstPercent")}
                  className="w-full h-9 mt-1 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {[0,5,12,18,28].map((g) => <option key={g} value={g}>{g}%</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Opening Stock</Label>
                <Input type="number" value={form.currentStock} onChange={f("currentStock")} placeholder="0" className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Min Stock Level</Label>
                <Input type="number" value={form.minStockLevel} onChange={f("minStockLevel")} className="h-9 mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button type="button" onClick={close}
                className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
              <button type="submit"
                className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:brightness-105 transition-all shadow-sm">
                Add Product
              </button>
            </div>
          </form>
        )}

        {/* ── Import tab ── */}
        {tab === "import" && !importPreview && (
          <div className="space-y-4">
            {/* Download sample */}
            <div className="rounded-xl border border-border p-4 bg-secondary/40">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Step 1: Download sample sheet</p>
                  <p className="text-xs text-muted-foreground mt-1">Fill in your product data following the column format shown in the sample file.</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {["name","sku","barcode","category","supplier","costPrice","sellingPrice","gstPercent","currentStock","minStockLevel"].map((c) => (
                      <span key={c} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-border text-muted-foreground">{c}</span>
                    ))}
                  </div>
                </div>
                <button onClick={downloadSampleCSV}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-colors shrink-0 ml-4">
                  <Download className="w-3.5 h-3.5" /> Download CSV
                </button>
              </div>
            </div>

            {/* Upload area */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Step 2: Upload your filled CSV</p>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/3 transition-all"
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">Click to upload CSV file</p>
                <p className="text-xs text-muted-foreground mt-1">Supports .csv files. Max 5 MB.</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCSVFile(f); }} />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={close} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* ── Import preview ── */}
        {tab === "import" && importPreview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{importRows.length} products ready to import</p>
              <button onClick={() => setImportPreview(false)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X className="w-3 h-3" /> Change file
              </button>
            </div>
            <div className="rounded-xl border border-border overflow-hidden max-h-56 overflow-y-auto custom-scroll">
              <table className="w-full text-xs">
                <thead className="bg-secondary sticky top-0">
                  <tr>{["Name","SKU","Category","Price","Stock"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {importRows.map((row, i) => (
                    <tr key={i} className="border-t border-border/50 hover:bg-secondary/40">
                      <td className="px-3 py-2 font-medium text-foreground">{row[0]}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{row[1]}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row[3]}</td>
                      <td className="px-3 py-2 font-mono text-foreground">₹{row[6]}</td>
                      <td className="px-3 py-2 text-foreground">{row[8]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button onClick={() => { setImportRows([]); setImportPreview(false); }}
                className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors">Back</button>
              <button onClick={handleImportConfirm}
                className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:brightness-105 transition-all shadow-sm">
                Import {importRows.length} Products
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
