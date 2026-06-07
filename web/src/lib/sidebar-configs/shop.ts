import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, Wallet, FileText, Truck } from "lucide-react";

export const shopSidebarConfig = [
  {
    label: "Intelligence",
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard, permission: "menu:overview" },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, permission: "menu:intelligence:analytics" },
    ]
  },
  {
    label: "Inventory",
    items: [
      { title: "Products", url: "/dashboard/inventory/products", icon: Package, permission: "menu:inventory" },
      { title: "Categories", url: "/dashboard/inventory/categories", icon: Package, permission: "menu:inventory:categories" },
      { title: "Purchases", url: "/dashboard/purchases", icon: Package, permission: "menu:purchases" },
    ]
  },
  {
    label: "Commerce",
    items: [
      { title: "POS", url: "/dashboard/pos", icon: ShoppingCart, permission: "menu:sales" },
      { title: "Sales History", url: "/dashboard/sales/history", icon: FileText, permission: "menu:sales:history" },
    ]
  },
  {
    label: "Finance",
    items: [
      { title: "Expenses", url: "/dashboard/accounting/expenses", icon: Wallet, permission: "menu:accounting:expenses" },
      { title: "Profit & Loss", url: "/dashboard/accounting/pl", icon: BarChart3, permission: "menu:accounting:pl" },
    ]
  },
  {
    label: "Settings",
    items: [
      { title: "Business Settings", url: "/dashboard/system/settings", icon: Settings, permission: "menu:system:settings" },
    ]
  }
];
