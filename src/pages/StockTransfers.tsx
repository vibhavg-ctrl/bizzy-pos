import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, ArrowRightLeft, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventoryStore } from "@/store/inventoryStore";

type TransferStatus = "pending"|"in_transit"|"received"|"cancelled";
interface StockTransfer {
  id:string; transferNo:string; fromOutlet:string; toOutlet:string;
  items:{productName:string;qty:number}[];
  status:TransferStatus; initiatedDate:string; completedDate?:string;
}

const STATUS_META: Record<TransferStatus,{color:string;bg:string;icon:any;label:string}> = {
  pending:    { color:"#92400e", bg:"#fef3c7", icon:Clock,        label:"Pending"    },
  in_transit: { color:"#075985", bg:"#e0f2fe", icon:Truck,        label:"In Transit" },
  received:   { color:"#065f46", bg:"#d1fae5", icon:CheckCircle2, label:"Received"   },
  cancelled:  { color:"#9f1239", bg:"#fee2e2", icon:XCircle,      label:"Cancelled"  },
};

const mockTransfers: StockTransfer[] = [
  { id:"1", transferNo:"TRF-001", fromOutlet:"Main Street Store", toOutlet:"Mall Branch",
    items:[{productName:"Coca-Cola 500ml",qty:50},{productName:"Lays Classic",qty:30}],
    status:"in_transit", initiatedDate:"2026-04-14" },
  { id:"2", transferNo:"TRF-002", fromOutlet:"Mall Branch", toOutlet:"Main Street Store",
    items:[{productName:"Amul Milk 1L",qty:20}],
    status:"received", initiatedDate:"2026-04-12", completedDate:"2026-04-13" },
  { id:"3", transferNo:"TRF-003", fromOutlet:"Main Street Store", toOutlet:"Airport Kiosk",
    items:[{productName:"Shampoo 200ml",qty:15},{productName:"Orange Juice 1L",qty:10}],
    status:"pending", initiatedDate:"2026-04-15" },
];

const StockTransfers = () => {
  const { outlets } = useInventoryStore();
  const outletNames = outlets.map((o) => o.name);
  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily:"Syne,sans-serif" }}>Stock Transfers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Inter-outlet inventory movements</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-105 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> New Transfer
          </button>
        </div>
        <div className="rounded-2xl border border-border pos-shadow overflow-hidden bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {["Transfer No","Route","Items","Date","Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockTransfers.map((t) => {
                const sm = STATUS_META[t.status];
                const Icon = sm.icon;
                return (
                  <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/25 transition-colors">
                    <td className="px-5 py-4"><p className="text-sm font-mono font-bold text-foreground">{t.transferNo}</p></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">{t.fromOutlet}</span>
                        <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground">{t.toOutlet}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {t.items.map((item,i) => (
                        <p key={i} className="text-xs text-muted-foreground">{item.productName} <span className="font-mono font-bold text-foreground">×{item.qty}</span></p>
                      ))}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-mono text-foreground">{t.initiatedDate}</p>
                      {t.completedDate && <p className="text-[10px] text-muted-foreground">Done: {t.completedDate}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 w-fit text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{ background:sm.bg, color:sm.color }}>
                        <Icon className="w-3 h-3" />{sm.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default StockTransfers;
