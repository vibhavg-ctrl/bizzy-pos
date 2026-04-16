import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useInventoryStore } from "@/store/inventoryStore";
import { Plus, MapPin, Phone, Store, TrendingUp, Users, Pencil, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Outlet } from "@/types/inventory";

const COLORS = ["#10b981","#0ea5e9","#f59e0b","#a78bfa","#f43f5e"];
const STATS = [
  { revenue:"₹28.4k", orders:156, staff:3 },
  { revenue:"₹19.2k", orders:98,  staff:2 },
  { revenue:"—",       orders:0,   staff:0 },
];

const EMPTY_FORM = { name:"", address:"", phone:"", manager:"", isActive:true };

function OutletDialog({ open, onClose, existing }: { open:boolean; onClose:()=>void; existing:Outlet|null }) {
  const { addOutlet, updateOutlet } = useInventoryStore();
  const [form, setForm] = useState(existing
    ? { name:existing.name, address:existing.address, phone:existing.phone, manager:existing.manager||"", isActive:existing.isActive }
    : EMPTY_FORM);

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = () => {
    if (!form.name.trim()) { toast.error("Outlet name required"); return; }
    if (existing) { updateOutlet(existing.id, form); toast.success("Outlet updated"); }
    else { addOutlet(form); toast.success(`${form.name} added`); }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader><DialogTitle>{existing ? "Edit Outlet" : "Add New Outlet"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold">Outlet Name *</Label>
            <Input value={form.name} onChange={f("name")} placeholder="e.g. South Campus Store" className="h-9 mt-1" />
          </div>
          <div>
            <Label className="text-xs font-semibold">Address</Label>
            <Input value={form.address} onChange={f("address")} placeholder="Full address" className="h-9 mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Phone</Label>
              <Input value={form.phone} onChange={f("phone")} placeholder="555-0100" className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Manager</Label>
              <Input value={form.manager} onChange={f("manager")} placeholder="Manager name" className="h-9 mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
              className={cn("w-9 h-5 rounded-full relative cursor-pointer transition-colors",
                form.isActive ? "bg-primary" : "bg-gray-300")}>
              <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all",
                form.isActive ? "left-4" : "left-0.5")} />
            </div>
            <span className="text-sm font-medium text-foreground">{form.isActive ? "Active" : "Inactive"}</span>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
            <button onClick={save}
              className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:brightness-105 transition-all">
              {existing ? "Save Changes" : "Add Outlet"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Outlets = () => {
  const { outlets, currentOutletId, setCurrentOutlet } = useInventoryStore();
  const [showDialog, setShowDialog] = useState(false);
  const [editOutlet, setEditOutlet] = useState<Outlet | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily:"Syne,sans-serif" }}>Outlets</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{outlets.length} store locations</p>
          </div>
          <button onClick={() => { setEditOutlet(null); setShowDialog(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-105 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add Outlet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {outlets.map((outlet, i) => {
            const color = COLORS[i % COLORS.length];
            const stats = STATS[i] || STATS[0];
            const isCurrent = outlet.id === currentOutletId;
            return (
              <div key={outlet.id}
                className={cn("rounded-2xl border-2 pos-shadow p-5 space-y-4 transition-all bg-white",
                  isCurrent ? "border-primary" : "border-border")}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:`${color}18`, color }}>
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{outlet.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={outlet.isActive ? { background:"#10b98118", color:"#10b981" } : { background:"#f3f4f6", color:"#9ca3af" }}>
                        {outlet.isActive ? "● Active" : "○ Inactive"}
                      </span>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary">Current</span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color }} /><span>{outlet.address}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" style={{ color }} /><span>{outlet.phone}</span></div>
                  {outlet.manager && <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 shrink-0" style={{ color }} /><span>Manager: {outlet.manager}</span></div>}
                </div>

                {outlet.isActive && (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60">
                    {[["Revenue", stats.revenue],["Orders", stats.orders],["Staff", stats.staff]].map(([label, val]) => (
                      <div key={String(label)} className="text-center">
                        <p className="font-black text-sm text-foreground font-mono">{val}</p>
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  {!isCurrent && outlet.isActive && (
                    <button onClick={() => { setCurrentOutlet(outlet.id); toast.success(`Switched to ${outlet.name}`); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-105 transition-all">
                      <Check className="w-3.5 h-3.5" /> Switch to This Outlet
                    </button>
                  )}
                  <button onClick={() => { setEditOutlet(outlet); setShowDialog(true); }}
                    className={cn("flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-border text-muted-foreground hover:bg-secondary transition-colors",
                      !isCurrent && outlet.isActive ? "px-3" : "flex-1")}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <OutletDialog open={showDialog} onClose={() => { setShowDialog(false); setEditOutlet(null); }} existing={editOutlet} />
    </DashboardLayout>
  );
};
export default Outlets;
