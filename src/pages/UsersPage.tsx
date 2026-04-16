import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useInventoryStore } from "@/store/inventoryStore";
import { ROLE_META, UserRole, StaffUser } from "@/types/inventory";
import { Plus, Shield, Clock, Pencil, Trash2, X, Check, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COLORS = ["#7c3aed","#10b981","#0ea5e9","#f59e0b","#f43f5e","#ec4899","#6b7280","#38bdf8"];
const ALL_ROLES: UserRole[] = ["admin","manager","cashier","inventory_manager","reports_viewer"];

const EMPTY_FORM = {
  name:"", email:"", role:"cashier" as UserRole, outletId:"1",
  terminal:"Terminal 01", pin:"", active:true,
};

function UserDialog({
  open, onClose, existing, outlets,
}: {
  open: boolean; onClose: () => void;
  existing: StaffUser | null;
  outlets: { id:string; name:string }[];
}) {
  const { addStaffUser, updateStaffUser } = useInventoryStore();
  const [form, setForm] = useState(existing ? {
    name: existing.name, email: existing.email, role: existing.role,
    outletId: existing.outletId, terminal: existing.terminal,
    pin: existing.pin || "", active: existing.active,
  } : EMPTY_FORM);
  const [showPin, setShowPin] = useState(false);

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required"); return;
    }
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    if (existing) {
      updateStaffUser(existing.id, { ...form });
      toast.success(`${form.name} updated`);
    } else {
      addStaffUser({ ...form, lastLogin:"Never", color });
      toast.success(`${form.name} added as ${ROLE_META[form.role].label}`);
    }
    onClose();
  };

  const roleM = ROLE_META[form.role];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input value={form.name} onChange={f("name")} placeholder="e.g. Priya Sharma" className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Email *</Label>
              <Input value={form.email} onChange={f("email")} placeholder="priya@bizzy.in" className="h-9 mt-1" />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <Label className="text-xs font-semibold mb-2 block">Access Role *</Label>
            <div className="grid grid-cols-1 gap-2">
              {ALL_ROLES.map((role) => {
                const m = ROLE_META[role];
                const isSelected = form.role === role;
                return (
                  <button key={role} type="button" onClick={() => setForm((p) => ({ ...p, role }))}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-border/60 hover:bg-secondary/40"
                    )}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${m.color}20`, color: m.color }}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{m.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.permissions.map((p) => (
                          <span key={p} className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                            style={{ background: `${m.color}15`, color: m.color }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Outlet</Label>
              <select value={form.outletId} onChange={f("outletId")}
                className="w-full h-9 mt-1 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Terminal</Label>
              <Input value={form.terminal} onChange={f("terminal")} className="h-9 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">PIN (optional)</Label>
              <div className="relative mt-1">
                <Input type={showPin ? "text" : "password"} value={form.pin} onChange={f("pin")}
                  placeholder="4-digit PIN" maxLength={4} className="h-9 pr-9" />
                <button type="button" onClick={() => setShowPin((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col justify-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                  className={cn("w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer",
                    form.active ? "bg-primary" : "bg-gray-300")}>
                  <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all",
                    form.active ? "left-4" : "left-0.5")} />
                </div>
                <span className="text-xs font-semibold text-foreground">{form.active ? "Active" : "Inactive"}</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
            <button onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:brightness-105 transition-all">
              {existing ? "Save Changes" : "Add User"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const UsersPage = () => {
  const { staffUsers, outlets, removeStaffUser, updateStaffUser } = useInventoryStore();
  const [showDialog, setShowDialog] = useState(false);
  const [editUser, setEditUser] = useState<StaffUser | null>(null);
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = staffUsers.filter((u) => filterRole === "all" || u.role === filterRole);
  const outletName = (id: string) => outlets.find((o) => o.id === id)?.name || id;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily:"Syne,sans-serif" }}>Users</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Staff accounts & access control — {staffUsers.length} users</p>
          </div>
          <button onClick={() => { setEditUser(null); setShowDialog(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-105 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        {/* Role filter */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterRole("all")}
            className={cn("pill-tab", filterRole === "all" ? "pill-tab-active bg-foreground text-white" : "pill-tab-inactive")}>All Roles</button>
          {ALL_ROLES.map((role) => {
            const m = ROLE_META[role];
            const isActive = filterRole === role;
            return (
              <button key={role} onClick={() => setFilterRole(role)}
                className={cn("pill-tab", isActive ? "pill-tab-active" : "pill-tab-inactive")}
                style={isActive ? { background: m.color } : {}}>
                {m.label}
              </button>
            );
          })}
        </div>

        {/* User table */}
        <div className="rounded-2xl border border-border pos-shadow overflow-hidden bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {["User","Role","Outlet","Terminal","Last Login","Status",""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const m = ROLE_META[user.role];
                return (
                  <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/25 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                          style={{ background: `${user.color}20`, color: user.color }}>
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 w-fit text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        style={{ background: `${m.color}18`, color: m.color }}>
                        <Shield className="w-3 h-3" />{m.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{outletName(user.outletId)}</td>
                    <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{user.terminal}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />{user.lastLogin}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => updateStaffUser(user.id, { active: !user.active })}
                        className={cn("flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors",
                          user.active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", user.active ? "bg-emerald-500" : "bg-gray-400")} />
                        {user.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditUser(user); setShowDialog(true); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirm === user.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { removeStaffUser(user.id); setDeleteConfirm(null); toast.success(`${user.name} removed`); }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteConfirm(null)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(user.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Role legend */}
        <div className="rounded-2xl border border-border p-4 bg-white pos-shadow">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Role Permissions Summary</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_ROLES.map((role) => {
              const m = ROLE_META[role];
              return (
                <div key={role} className="rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${m.color}20`, color: m.color }}>
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.permissions.map((p) => (
                      <span key={p} className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: `${m.color}12`, color: m.color }}>{p}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <UserDialog
        open={showDialog}
        onClose={() => { setShowDialog(false); setEditUser(null); }}
        existing={editUser}
        outlets={outlets.map((o) => ({ id: o.id, name: o.name }))}
      />
    </DashboardLayout>
  );
};
export default UsersPage;
