import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventoryStore } from "@/store/inventoryStore";
import { Product } from "@/types/inventory";
import { toast } from "sonner";
import { Plus, Minus, PackagePlus, PackageMinus } from "lucide-react";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function StockAdjustmentDialog({ open, onOpenChange, product }: StockAdjustmentDialogProps) {
  const { addStock, adjustStock } = useInventoryStore();
  const [mode, setMode] = useState<"add" | "adjust">("add");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("purchase_order");
  const [supplier, setSupplier] = useState("");
  const [invoiceRef, setInvoiceRef] = useState("");

  const handleSubmit = () => {
    if (!product || quantity <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    if (mode === "add") {
      addStock(product.id, quantity, reason, invoiceRef);
      toast.success(`Added ${quantity} units to ${product.name}`);
    } else {
      adjustStock(product.id, quantity, reason);
      toast.success(`Adjusted ${product.name} stock by -${quantity}`);
    }

    setQuantity(0);
    setReason("purchase_order");
    setSupplier("");
    setInvoiceRef("");
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-card-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-wider text-sm">
            Stock Management — {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="text-xs text-muted-foreground font-mono mb-2">
          Current Stock: <span className="text-card-foreground font-bold">{product.currentStock}</span> | 
          Min Level: <span className="text-micros-yellow font-bold">{product.minStockLevel}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setMode("add")}
            className={`micros-btn flex items-center justify-center gap-2 py-3 rounded text-xs ${
              mode === "add" ? "bg-micros-green text-success-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            <PackagePlus className="w-4 h-4" /> ADD STOCK
          </button>
          <button
            onClick={() => setMode("adjust")}
            className={`micros-btn flex items-center justify-center gap-2 py-3 rounded text-xs ${
              mode === "adjust" ? "bg-micros-red text-destructive-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            <PackageMinus className="w-4 h-4" /> REDUCE STOCK
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Quantity</Label>
            <Input
              type="number"
              value={quantity || ""}
              onChange={(e) => setQuantity(Number(e.target.value) || 0)}
              className="bg-input border-border font-mono"
              placeholder="0"
              min={1}
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {mode === "add" ? (
                  <>
                    <SelectItem value="purchase_order">Purchase Order / GRN</SelectItem>
                    <SelectItem value="transfer_in">Transfer In (from outlet)</SelectItem>
                    <SelectItem value="return">Customer Return</SelectItem>
                    <SelectItem value="opening_stock">Opening Stock</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="internal_use">Internal Use</SelectItem>
                    <SelectItem value="theft">Theft / Shrinkage</SelectItem>
                    <SelectItem value="transfer_out">Transfer Out (to outlet)</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {mode === "add" && (
            <div>
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Invoice / PO Reference
              </Label>
              <Input
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                className="bg-input border-border font-mono"
                placeholder="PO-2026-001"
              />
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className={`w-full micros-btn uppercase tracking-wider text-xs font-black h-11 ${
              mode === "add" ? "bg-micros-green hover:bg-micros-green/90 text-success-foreground" : "bg-micros-red hover:bg-micros-red/90 text-destructive-foreground"
            }`}
          >
            {mode === "add" ? `ADD ${quantity} UNITS` : `REMOVE ${quantity} UNITS`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
