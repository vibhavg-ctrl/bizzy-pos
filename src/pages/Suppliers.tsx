import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { mockSuppliers } from "@/data/mockData";
import { Plus, Phone, Mail, Building2, ExternalLink, Pencil, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const COLORS = ["#10b981","#0ea5e9","#f59e0b","#a78bfa","#f43f5e","#38bdf8"];

const Suppliers = () => {
  const [search, setSearch] = useState("");
  const filtered = mockSuppliers.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.contact.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily:"Syne,sans-serif" }}>Suppliers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{mockSuppliers.length} vendors in your network</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-105 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers…" className="pl-10 h-10 bg-white border-border rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((supplier, i) => {
            const color = COLORS[i % COLORS.length];
            const initials = supplier.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
            return (
              <div key={supplier.id} className="rounded-2xl border border-border pos-shadow p-5 flex flex-col gap-4 bg-white hover:border-border/60 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0"
                    style={{ background:`${color}18`, color }}>{initials}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-foreground truncate">{supplier.name}</h3>
                    <p className="text-xs text-muted-foreground">{supplier.contact}</p>
                  </div>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color }} /><span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color }} /><span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                    <span className="font-mono text-[10px]">{supplier.gstNumber}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground">Payment Terms</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ background:`${color}15`, color }}>{supplier.paymentTerms}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Suppliers;
