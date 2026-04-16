import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, FileCheck, Truck, Clock, CheckCircle2, XCircle, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useInventoryStore } from "@/store/inventoryStore";

type POStatus = "draft"|"sent"|"partial"|"received"|"cancelled";
interface PurchaseOrder {
  id:string; poNumber:string; supplier:string;
  items:{productId:string;productName:string;orderedQty:number;receivedQty:number;unitCost:number}[];
  status:POStatus; createdDate:string; expectedDate:string; total:number;
}

const STATUS_META: Record<POStatus,{color:string;bg:string;icon:any;label:string}> = {
  draft:     { color:"#9ca3af", bg:"#f3f4f6",  icon:Clock,        label:"Draft"     },
  sent:      { color:"#0ea5e9", bg:"#e0f2fe",  icon:Truck,        label:"Sent"      },
  partial:   { color:"#f59e0b", bg:"#fef3c7",  icon:PackageCheck, label:"Partial"   },
  received:  { color:"#10b981", bg:"#d1fae5",  icon:CheckCircle2, label:"Received"  },
  cancelled: { color:"#f43f5e", bg:"#fee2e2",  icon:XCircle,      label:"Cancelled" },
};

const mockPOs: PurchaseOrder[] = [
  { id:"1", poNumber:"PO-2026-001", supplier:"Beverage Corp",
    items:[{productId:"1",productName:"Coca-Cola 500ml",orderedQty:200,receivedQty:0,unitCost:25},
           {productId:"10",productName:"Orange Juice 1L",orderedQty:100,receivedQty:0,unitCost:55}],
    status:"sent", createdDate:"2026-04-10", expectedDate:"2026-04-16", total:10500 },
  { id:"2", poNumber:"PO-2026-002", supplier:"Dairy Fresh Ltd",
    items:[{productId:"2",productName:"Amul Milk 1L",orderedQty:150,receivedQty:100,unitCost:50},
           {productId:"11",productName:"Butter 200g",orderedQty:80,receivedQty:80,unitCost:45}],
    status:"partial", createdDate:"2026-04-08", expectedDate:"2026-04-14", total:11100 },
  { id:"3", poNumber:"PO-2026-003", supplier:"Snack World",
    items:[{productId:"3",productName:"Lays Classic 100g",orderedQty:300,receivedQty:300,unitCost:15}],
    status:"received", createdDate:"2026-04-05", expectedDate:"2026-04-12", total:4500 },
  { id:"4", poNumber:"PO-2026-004", supplier:"Farm Direct",
    items:[{productId:"6",productName:"Bananas 1kg",orderedQty:100,receivedQty:0,unitCost:30}],
    status:"draft", createdDate:"2026-04-15", expectedDate:"2026-04-20", total:3000 },
];

const PurchaseOrders = () => {
  const [pos, setPOs] = useState(mockPOs);
  const { addStock } = useInventoryStore();

  const receive = (poId: string) => {
    setPOs((prev) => prev.map((po) => {
      if (po.id !== poId) return po;
      const updated = po.items.map((item) => {
        const rem = item.orderedQty - item.receivedQty;
        if (rem > 0) addStock(item.productId, rem, "purchase_order", po.poNumber);
        return { ...item, receivedQty: item.orderedQty };
      });
      return { ...po, items:updated, status:"received" };
    }));
    toast.success("Goods received & stock updated!");
  };

  const sent    = pos.filter((p) => p.status==="sent").reduce((s,p) => s+p.total,0);
  const pending = pos.filter((p) => ["sent","partial"].includes(p.status)).length;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily:"Syne,sans-serif" }}>Purchase Orders</h1>
            <p className="text-sm text-muted-foreground mt-0.5">GRN & Supplier Purchase Management</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl font-mono bg-sky-50 text-sky-700 border border-sky-200">
              {pending} Pending · ₹{sent.toLocaleString()} Outstanding
            </span>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-105 transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Create PO
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-border pos-shadow overflow-hidden bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {["PO Number","Supplier","Items","Total","Expected","Status",""].map((h) => (
                  <th key={h} className={cn("px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest",h==="Total"?"text-right":"text-left")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => {
                const sm = STATUS_META[po.status];
                const Icon = sm.icon;
                const canReceive = po.status==="sent" || po.status==="partial";
                return (
                  <tr key={po.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/25 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-mono font-bold text-foreground">{po.poNumber}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Created {po.createdDate}</p>
                    </td>
                    <td className="px-5 py-4"><p className="text-sm font-semibold text-foreground">{po.supplier}</p></td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {po.items.map((item,i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{item.productName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold"
                              style={item.receivedQty>=item.orderedQty ? {background:"#d1fae5",color:"#065f46"} : {background:"#fef3c7",color:"#92400e"}}>
                              {item.receivedQty}/{item.orderedQty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right"><p className="text-sm font-black font-mono text-foreground">₹{po.total.toLocaleString()}</p></td>
                    <td className="px-5 py-4"><p className="text-xs font-mono text-foreground">{po.expectedDate}</p></td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 w-fit text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        style={{ background:sm.bg, color:sm.color }}>
                        <Icon className="w-3 h-3" />{sm.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {canReceive && (
                        <button onClick={() => receive(po.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-105 transition-all">
                          <FileCheck className="w-3.5 h-3.5" /> Receive GRN
                        </button>
                      )}
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
export default PurchaseOrders;
