export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  supplier: string;
  costPrice: number;
  sellingPrice: number;
  gstPercent: number;
  currentStock: number;
  minStockLevel: number;
  image: string;
  outletId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  date: string;
  items: number;
  total: number;
  paymentMethod: string;
  cashier: string;
  outletId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  gstNumber: string;
  paymentTerms: string;
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  manager?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  date: string;
}

export type UserRole = "admin" | "manager" | "cashier" | "inventory_manager" | "reports_viewer";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  outletId: string;
  terminal: string;
  lastLogin: string;
  active: boolean;
  pin?: string;
  color: string;
}

export const ROLE_META: Record<UserRole, { label: string; desc: string; color: string; permissions: string[] }> = {
  admin: {
    label: "Admin",
    desc: "Full system access",
    color: "#7c3aed",
    permissions: ["All permissions"],
  },
  manager: {
    label: "Manager",
    desc: "Store operations & reports",
    color: "#10b981",
    permissions: ["POS", "Inventory", "Reports", "Users (view)", "Overrides"],
  },
  cashier: {
    label: "Cashier",
    desc: "POS checkout only",
    color: "#0ea5e9",
    permissions: ["POS Terminal", "Online Orders (view)"],
  },
  inventory_manager: {
    label: "Inventory Manager",
    desc: "Stock & purchase orders",
    color: "#f59e0b",
    permissions: ["Inventory", "Purchase Orders", "Suppliers", "Stock Transfers"],
  },
  reports_viewer: {
    label: "Reports Viewer",
    desc: "Read-only reports access",
    color: "#6b7280",
    permissions: ["Dashboard (view)", "Reports (view)"],
  },
};
