import { Product, Sale, Supplier, Outlet, StaffUser } from "@/types/inventory";

export const mockOutlets: Outlet[] = [
  { id:"1", name:"Main Street Store",  address:"123 Main St, Downtown",   phone:"555-0101", isActive:true,  manager:"Rajesh Kumar" },
  { id:"2", name:"Mall Branch",         address:"456 Mall Rd, Level 2",    phone:"555-0102", isActive:true,  manager:"Priya Sharma" },
  { id:"3", name:"Airport Kiosk",       address:"Terminal 1, Gate B",      phone:"555-0103", isActive:false, manager:"—" },
];

export const mockCategories = [
  "Beverages","Dairy","Snacks","Bakery","Frozen Foods","Produce","Meat","Household","Personal Care",
];

export const mockProducts: Product[] = [
  { id:"1",  name:"Coca-Cola 500ml",        sku:"BEV-001", barcode:"8901234567890", category:"Beverages",    supplier:"Beverage Corp",   costPrice:25,  sellingPrice:40,  gstPercent:18, currentStock:150, minStockLevel:30, image:"" },
  { id:"2",  name:"Amul Milk 1L",           sku:"DAI-001", barcode:"8901234567891", category:"Dairy",        supplier:"Dairy Fresh Ltd", costPrice:50,  sellingPrice:65,  gstPercent:5,  currentStock:80,  minStockLevel:20, image:"" },
  { id:"3",  name:"Lays Classic 100g",      sku:"SNK-001", barcode:"8901234567892", category:"Snacks",       supplier:"Snack World",     costPrice:15,  sellingPrice:30,  gstPercent:12, currentStock:200, minStockLevel:50, image:"" },
  { id:"4",  name:"Whole Wheat Bread",      sku:"BAK-001", barcode:"8901234567893", category:"Bakery",       supplier:"Golden Bakery",   costPrice:30,  sellingPrice:45,  gstPercent:0,  currentStock:40,  minStockLevel:15, image:"" },
  { id:"5",  name:"Frozen Peas 500g",       sku:"FRZ-001", barcode:"8901234567894", category:"Frozen Foods", supplier:"Fresh Freeze Inc",costPrice:60,  sellingPrice:90,  gstPercent:5,  currentStock:5,   minStockLevel:10, image:"" },
  { id:"6",  name:"Bananas 1kg",            sku:"PRD-001", barcode:"8901234567895", category:"Produce",      supplier:"Farm Direct",     costPrice:30,  sellingPrice:50,  gstPercent:0,  currentStock:60,  minStockLevel:20, image:"" },
  { id:"7",  name:"Chicken Breast 500g",    sku:"MET-001", barcode:"8901234567896", category:"Meat",         supplier:"Prime Meats",     costPrice:120, sellingPrice:180, gstPercent:0,  currentStock:25,  minStockLevel:10, image:"" },
  { id:"8",  name:"Dishwash Liquid 500ml",  sku:"HOU-001", barcode:"8901234567897", category:"Household",    supplier:"Clean Home Co",   costPrice:70,  sellingPrice:110, gstPercent:18, currentStock:3,   minStockLevel:10, image:"" },
  { id:"9",  name:"Shampoo 200ml",          sku:"PER-001", barcode:"8901234567898", category:"Personal Care",supplier:"Beauty Plus",      costPrice:90,  sellingPrice:150, gstPercent:18, currentStock:45,  minStockLevel:15, image:"" },
  { id:"10", name:"Orange Juice 1L",        sku:"BEV-002", barcode:"8901234567899", category:"Beverages",    supplier:"Beverage Corp",   costPrice:55,  sellingPrice:85,  gstPercent:12, currentStock:8,   minStockLevel:15, image:"" },
  { id:"11", name:"Butter 200g",            sku:"DAI-002", barcode:"8901234567900", category:"Dairy",        supplier:"Dairy Fresh Ltd", costPrice:45,  sellingPrice:60,  gstPercent:12, currentStock:35,  minStockLevel:10, image:"" },
  { id:"12", name:"Rice 5kg",               sku:"GRC-001", barcode:"8901234567901", category:"Produce",      supplier:"Farm Direct",     costPrice:200, sellingPrice:280, gstPercent:5,  currentStock:70,  minStockLevel:20, image:"" },
];

export const mockSuppliers: Supplier[] = [
  { id:"1", name:"Beverage Corp",    contact:"John Smith",    phone:"555-1001", email:"john@beveragecorp.com",   gstNumber:"29AABCU9603R1ZM", paymentTerms:"Net 30" },
  { id:"2", name:"Dairy Fresh Ltd",  contact:"Sarah Johnson", phone:"555-1002", email:"sarah@dairyfresh.com",    gstNumber:"29AABCU9604R1ZM", paymentTerms:"Net 15" },
  { id:"3", name:"Snack World",      contact:"Mike Chen",     phone:"555-1003", email:"mike@snackworld.com",     gstNumber:"29AABCU9605R1ZM", paymentTerms:"Net 30" },
  { id:"4", name:"Golden Bakery",    contact:"Lisa Brown",    phone:"555-1004", email:"lisa@goldenbakery.com",   gstNumber:"29AABCU9606R1ZM", paymentTerms:"COD"    },
  { id:"5", name:"Farm Direct",      contact:"Tom Wilson",    phone:"555-1005", email:"tom@farmdirect.com",      gstNumber:"29AABCU9607R1ZM", paymentTerms:"Net 7"  },
];

export const mockRecentSales: Sale[] = [
  { id:"INV-001", date:"2026-04-16T09:15:00", items:5, total:450,  paymentMethod:"Cash", cashier:"Alice",   outletId:"1" },
  { id:"INV-002", date:"2026-04-16T09:45:00", items:3, total:280,  paymentMethod:"Card", cashier:"Bob",     outletId:"1" },
  { id:"INV-003", date:"2026-04-16T10:20:00", items:8, total:1200, paymentMethod:"UPI",  cashier:"Alice",   outletId:"2" },
  { id:"INV-004", date:"2026-04-16T11:05:00", items:2, total:150,  paymentMethod:"Cash", cashier:"Charlie", outletId:"1" },
  { id:"INV-005", date:"2026-04-16T11:30:00", items:6, total:820,  paymentMethod:"Card", cashier:"Bob",     outletId:"2" },
];

export const mockDailySalesData = [
  { day:"Mon", sales:12500 },{ day:"Tue", sales:15200 },{ day:"Wed", sales:11800 },
  { day:"Thu", sales:18400 },{ day:"Fri", sales:22100 },{ day:"Sat", sales:28500 },{ day:"Sun", sales:19800 },
];

export const mockCategorySales = [
  { name:"Beverages",value:28 },{ name:"Dairy",value:18 },{ name:"Snacks",value:22 },
  { name:"Produce",value:15 },  { name:"Household",value:10 },{ name:"Other",value:7 },
];

export const mockStaffUsers: StaffUser[] = [
  { id:"1", name:"Rajesh Kumar",  email:"rajesh@bizzy.in",  role:"admin",              outletId:"1", terminal:"Terminal 01", lastLogin:"Today, 9:00 AM",  active:true,  color:"#7c3aed" },
  { id:"2", name:"Priya Sharma",  email:"priya@bizzy.in",   role:"manager",            outletId:"2", terminal:"Terminal 02", lastLogin:"Today, 8:30 AM",  active:true,  color:"#10b981" },
  { id:"3", name:"Alice Mathew",  email:"alice@bizzy.in",   role:"cashier",            outletId:"1", terminal:"Terminal 03", lastLogin:"Today, 8:55 AM",  active:true,  color:"#0ea5e9" },
  { id:"4", name:"Bob Fernandez", email:"bob@bizzy.in",     role:"cashier",            outletId:"1", terminal:"Terminal 04", lastLogin:"Yesterday",        active:true,  color:"#f59e0b" },
  { id:"5", name:"Charlie Singh", email:"charlie@bizzy.in", role:"inventory_manager",  outletId:"2", terminal:"Terminal 05", lastLogin:"2 days ago",       active:false, color:"#6b7280" },
  { id:"6", name:"Diana Patel",   email:"diana@bizzy.in",   role:"reports_viewer",     outletId:"1", terminal:"Terminal 06", lastLogin:"3 days ago",       active:true,  color:"#ec4899" },
];
