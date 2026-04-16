import { create } from "zustand";
import { Product, CartItem, StockMovement, Outlet, StaffUser } from "@/types/inventory";
import { mockProducts, mockOutlets, mockStaffUsers } from "@/data/mockData";

interface InventoryStore {
  products: Product[];
  cart: CartItem[];
  stockMovements: StockMovement[];
  outlets: Outlet[];
  staffUsers: StaffUser[];
  currentOutletId: string;
  lastSyncTime: Date;

  // Cart
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Stock
  deductStock: (productId: string, quantity: number) => void;
  addStock: (productId: string, quantity: number, reason: string, reference?: string) => void;
  adjustStock: (productId: string, quantity: number, reason: string) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  importProducts: (products: Omit<Product, "id">[]) => number;

  // Outlets
  setCurrentOutlet: (outletId: string) => void;
  addOutlet: (outlet: Omit<Outlet, "id">) => void;
  updateOutlet: (id: string, updates: Partial<Outlet>) => void;

  // Users
  addStaffUser: (user: Omit<StaffUser, "id">) => void;
  updateStaffUser: (id: string, updates: Partial<StaffUser>) => void;
  removeStaffUser: (id: string) => void;

  // Sync simulation
  triggerSync: () => void;
  checkout: () => { success: boolean; invoiceId: string };
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  products: [...mockProducts],
  cart: [],
  stockMovements: [],
  outlets: [...mockOutlets],
  staffUsers: [...mockStaffUsers],
  currentOutletId: "1",
  lastSyncTime: new Date(),

  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((i) => i.product.id === product.id);
      return existing
        ? { cart: state.cart.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) }
        : { cart: [...state.cart, { product, quantity: 1 }] };
    }),

  removeFromCart: (productId) =>
    set((state) => ({ cart: state.cart.filter((i) => i.product.id !== productId) })),

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) { get().removeFromCart(productId); return; }
    set((state) => ({ cart: state.cart.map((i) => i.product.id === productId ? { ...i, quantity } : i) }));
  },

  clearCart: () => set({ cart: [] }),

  deductStock: (productId, quantity) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, currentStock: Math.max(0, p.currentStock - quantity) } : p
      ),
    })),

  addStock: (productId, quantity, reason, reference) =>
    set((state) => {
      const product = state.products.find((p) => p.id === productId);
      const movement: StockMovement = {
        id: `SM-${Date.now()}`,
        productId,
        productName: product?.name || "",
        type: "in",
        quantity,
        reason: `${reason}${reference ? ` (${reference})` : ""}`,
        date: new Date().toISOString(),
      };
      return {
        products: state.products.map((p) =>
          p.id === productId ? { ...p, currentStock: p.currentStock + quantity } : p
        ),
        stockMovements: [movement, ...state.stockMovements],
        lastSyncTime: new Date(),
      };
    }),

  adjustStock: (productId, quantity, reason) =>
    set((state) => {
      const product = state.products.find((p) => p.id === productId);
      const movement: StockMovement = {
        id: `SM-${Date.now()}`,
        productId,
        productName: product?.name || "",
        type: "adjustment",
        quantity: -quantity,
        reason,
        date: new Date().toISOString(),
      };
      return {
        products: state.products.map((p) =>
          p.id === productId ? { ...p, currentStock: Math.max(0, p.currentStock - quantity) } : p
        ),
        stockMovements: [movement, ...state.stockMovements],
        lastSyncTime: new Date(),
      };
    }),

  addProduct: (productData) =>
    set((state) => ({
      products: [
        ...state.products,
        { ...productData, id: `P-${Date.now()}` },
      ],
      lastSyncTime: new Date(),
    })),

  importProducts: (productsData) => {
    const newProducts = productsData.map((p, i) => ({ ...p, id: `P-IMP-${Date.now()}-${i}` }));
    set((state) => ({
      products: [...state.products, ...newProducts],
      lastSyncTime: new Date(),
    }));
    return newProducts.length;
  },

  setCurrentOutlet: (outletId) => set({ currentOutletId: outletId, lastSyncTime: new Date() }),

  addOutlet: (outletData) =>
    set((state) => ({
      outlets: [...state.outlets, { ...outletData, id: `OL-${Date.now()}` }],
      lastSyncTime: new Date(),
    })),

  updateOutlet: (id, updates) =>
    set((state) => ({
      outlets: state.outlets.map((o) => (o.id === id ? { ...o, ...updates } : o)),
      lastSyncTime: new Date(),
    })),

  addStaffUser: (userData) =>
    set((state) => ({
      staffUsers: [...state.staffUsers, { ...userData, id: `U-${Date.now()}` }],
      lastSyncTime: new Date(),
    })),

  updateStaffUser: (id, updates) =>
    set((state) => ({
      staffUsers: state.staffUsers.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      lastSyncTime: new Date(),
    })),

  removeStaffUser: (id) =>
    set((state) => ({
      staffUsers: state.staffUsers.filter((u) => u.id !== id),
      lastSyncTime: new Date(),
    })),

  triggerSync: () => set({ lastSyncTime: new Date() }),

  checkout: () => {
    const { cart, deductStock, clearCart } = get();
    if (cart.length === 0) return { success: false, invoiceId: "" };
    cart.forEach((item) => deductStock(item.product.id, item.quantity));
    const invoiceId = `INV-${Date.now().toString(36).toUpperCase()}`;
    clearCart();
    set({ lastSyncTime: new Date() });
    return { success: true, invoiceId };
  },
}));
