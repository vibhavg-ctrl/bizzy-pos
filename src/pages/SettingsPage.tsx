import { DashboardLayout } from "@/components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useInventoryStore } from "@/store/inventoryStore";
import { Store, CreditCard, Bell, Shield, Printer, Globe, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "store" | "billing" | "notifications" | "security" | "printing" | "integrations";

const SECTIONS = [
  { id:"store"         as Section, label:"Store Info",     icon:Store },
  { id:"billing"       as Section, label:"Billing & Tax",  icon:CreditCard },
  { id:"notifications" as Section, label:"Notifications",  icon:Bell },
  { id:"security"      as Section, label:"Security",       icon:Shield },
  { id:"printing"      as Section, label:"Printing",       icon:Printer },
  { id:"integrations"  as Section, label:"Integrations",   icon:Globe },
];

function Toggle({ checked, onChange }: { checked:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div onClick={() => onChange(!checked)}
      className={cn("w-10 h-5.5 rounded-full relative cursor-pointer transition-colors shrink-0", checked ? "bg-primary" : "bg-gray-200")}
      style={{ height:"22px", width:"40px" }}>
      <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all", checked ? "left-5" : "left-0.5")} />
    </div>
  );
}

const SettingsPage = () => {
  const { outlets, currentOutletId } = useInventoryStore();
  const outlet = outlets.find((o) => o.id === currentOutletId) || outlets[0];
  const [active, setActive] = useState<Section>("store");

  const [storeForm, setStoreForm] = useState({
    name: outlet?.name || "Main Street Store",
    address: outlet?.address || "",
    phone: outlet?.phone || "",
    gstin: "29AABCU9603R1ZM",
    email: "store@bizzy.in",
    currency: "INR",
  });

  const [notifs, setNotifs] = useState({
    lowStock: true, newOrder: true, dailySummary: true, syncAlerts: false,
  });

  const [security, setSecurity] = useState({
    requirePin: true, autoLock: true, lockAfter: "5",
    twoFactor: false,
  });

  const [printing, setPrinting] = useState({
    autoPrint: false, printCopies: "1", showGST: true,
    printerName: "Default Printer",
  });

  const save = () => toast.success("Settings saved successfully!");

  const sf = (k: keyof typeof storeForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setStoreForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily:"Syne,sans-serif" }}>Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configure your store preferences and system options</p>
          </div>
          <button onClick={save}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-105 transition-all shadow-sm">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>

        <div className="flex gap-5">
          {/* Sidebar nav */}
          <div className="w-44 shrink-0">
            <div className="rounded-2xl border border-border bg-white pos-shadow overflow-hidden">
              {SECTIONS.map((s) => {
                const isA = active === s.id;
                return (
                  <button key={s.id} onClick={() => setActive(s.id)}
                    className={cn("w-full flex items-center gap-2.5 px-4 py-3 text-xs font-semibold transition-colors border-l-2",
                      isA ? "bg-primary/5 text-primary border-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground border-transparent")}>
                    <s.icon className="w-3.5 h-3.5 shrink-0" />{s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 rounded-2xl border border-border bg-white pos-shadow p-6 space-y-5">

            {active === "store" && (
              <>
                <h2 className="font-bold text-base text-foreground">Store Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label:"Store Name",        key:"name"    as const, placeholder:"Store name" },
                    { label:"Phone",             key:"phone"   as const, placeholder:"555-0100" },
                    { label:"Email",             key:"email"   as const, placeholder:"store@bizzy.in" },
                    { label:"GSTIN",             key:"gstin"   as const, placeholder:"29AABCU0000R1ZM" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <Label className="text-xs font-semibold">{label}</Label>
                      <Input value={storeForm[key]} onChange={sf(key)} placeholder={placeholder} className="h-9 mt-1" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold">Address</Label>
                    <Input value={storeForm.address} onChange={sf("address")} placeholder="Full address" className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Currency</Label>
                    <select value={storeForm.currency} onChange={sf("currency")}
                      className="w-full h-9 mt-1 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {["INR","USD","EUR","GBP"].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {active === "billing" && (
              <>
                <h2 className="font-bold text-base text-foreground">Billing & Tax</h2>
                <div className="space-y-4">
                  {[
                    { label:"Default GST Rate", value:"18%", desc:"Applied when no specific rate is set" },
                    { label:"Tax Inclusive Pricing", value:"No", desc:"Whether displayed prices include tax" },
                    { label:"Round Off Total", value:"Yes", desc:"Round billing total to nearest rupee" },
                    { label:"Print HSN Codes", value:"Yes", desc:"Include HSN codes on invoices" },
                  ].map(({ label, value, desc }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-secondary text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {active === "notifications" && (
              <>
                <h2 className="font-bold text-base text-foreground">Notifications</h2>
                <div className="space-y-4">
                  {[
                    { key:"lowStock"     as const, label:"Low Stock Alerts",  desc:"Alert when product falls below minimum stock level" },
                    { key:"newOrder"     as const, label:"New Online Orders",  desc:"Notify when a new online order arrives" },
                    { key:"dailySummary" as const, label:"Daily Summary",      desc:"End-of-day sales summary notification" },
                    { key:"syncAlerts"   as const, label:"Sync Alerts",        desc:"Notify when real-time sync has issues" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <Toggle checked={notifs[key]} onChange={(v) => setNotifs((p) => ({ ...p, [key]:v }))} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {active === "security" && (
              <>
                <h2 className="font-bold text-base text-foreground">Security</h2>
                <div className="space-y-4">
                  {[
                    { key:"requirePin" as const, label:"Require PIN for POS",   desc:"Staff must enter PIN before using terminal" },
                    { key:"autoLock"   as const, label:"Auto-lock Terminal",     desc:"Lock terminal after period of inactivity" },
                    { key:"twoFactor"  as const, label:"Two-Factor Auth",        desc:"Require 2FA for admin login" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <Toggle checked={security[key]} onChange={(v) => setSecurity((p) => ({ ...p, [key]:v }))} />
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Auto-lock after (minutes)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Inactivity timeout before terminal locks</p>
                    </div>
                    <select value={security.lockAfter} onChange={(e) => setSecurity((p) => ({ ...p, lockAfter:e.target.value }))}
                      className="h-8 w-24 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none">
                      {["1","2","5","10","15","30"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {active === "printing" && (
              <>
                <h2 className="font-bold text-base text-foreground">Printing</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold">Default Printer</Label>
                    <Input value={printing.printerName} onChange={(e) => setPrinting((p) => ({ ...p, printerName:e.target.value }))}
                      placeholder="Printer name" className="h-9 mt-1 max-w-xs" />
                  </div>
                  {[
                    { key:"autoPrint" as const, label:"Auto-print Receipt",  desc:"Automatically print after each successful transaction" },
                    { key:"showGST"   as const, label:"Show GST Breakdown",  desc:"Print GST details on customer receipt" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <Toggle checked={printing[key]} onChange={(v) => setPrinting((p) => ({ ...p, [key]:v }))} />
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Number of Copies</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Copies to print per transaction</p>
                    </div>
                    <select value={printing.printCopies} onChange={(e) => setPrinting((p) => ({ ...p, printCopies:e.target.value }))}
                      className="h-8 w-20 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none">
                      {["1","2","3"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {active === "integrations" && (
              <>
                <h2 className="font-bold text-base text-foreground">Integrations</h2>
                <div className="space-y-3">
                  {[
                    { name:"Blinkit",           status:"Connected",    color:"#facc15", emoji:"⚡" },
                    { name:"Zepto",             status:"Connected",    color:"#a78bfa", emoji:"🟣" },
                    { name:"Swiggy Instamart",  status:"Not Connected",color:"#fb923c", emoji:"🟠" },
                    { name:"BigBasket",         status:"Connected",    color:"#22c55e", emoji:"🛒" },
                    { name:"Tally ERP",         status:"Not Connected",color:"#6b7280", emoji:"📊" },
                    { name:"WhatsApp Business", status:"Not Connected",color:"#25d366", emoji:"💬" },
                  ].map(({ name, status, color, emoji }) => {
                    const isConn = status === "Connected";
                    return (
                      <div key={name} className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                            style={{ background:`${color}18` }}>{emoji}</div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{name}</p>
                            <p className="text-[10px] font-semibold" style={{ color: isConn ? "#10b981" : "#9ca3af" }}>{status}</p>
                          </div>
                        </div>
                        <button className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors",
                          isConn ? "border-red-200 text-red-600 hover:bg-red-50" : "border-primary/30 text-primary hover:bg-primary/5")}>
                          {isConn ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default SettingsPage;
