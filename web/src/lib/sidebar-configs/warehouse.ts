import { 
  LayoutDashboard, Package, Truck, Users, BarChart3, Settings, 
  ClipboardList, MessageSquare, Wallet, UserCheck, CreditCard, 
  Book, DollarSign
} from "lucide-react";

export const warehouseSidebarConfig = [
  {
    label: "Intelligence",
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard, permission: "menu:overview" },
      { title: "AI Assistant", url: "/dashboard/intelligence/chat", icon: MessageSquare, permission: "menu:intelligence:chat" },
      { title: "Stock Alerts", url: "/dashboard/inventory/alerts", icon: ClipboardList, permission: "menu:inventory" },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, permission: "menu:intelligence:analytics" },
      { title: "Reports", url: "/dashboard/reports", icon: BarChart3, permission: "menu:intelligence:reports" },
    ]
  },
  {
    label: "Inventory",
    items: [
      {
        title: "Inventory",
        url: "/dashboard/inventory",
        icon: Package,
        permission: "menu:inventory",
        items: [
          { title: "Stock Overview", url: "/dashboard/inventory/overview" },
          { title: "Products", url: "/dashboard/inventory/products" },
          { title: "Categories", url: "/dashboard/inventory/categories" },
          { title: "Stock Adjustments", url: "/dashboard/inventory/adjustments" },
          { title: "Stock History", url: "/dashboard/inventory/history" },
          { title: "Expiry Tracking", url: "/dashboard/inventory/expiry" },
          { title: "Network Exchange", url: "/dashboard/inventory/network" },
        ],
      },
    ]
  },
  {
    label: "Logistics",
    items: [
      {
        title: "Purchases",
        url: "/dashboard/purchases",
        icon: Truck,
        permission: "menu:purchases",
        items: [
          { title: "Suppliers", url: "/dashboard/purchases/suppliers" },
          { title: "Purchase Orders", url: "/dashboard/purchases" },
          { title: "Returns", url: "/dashboard/purchases/returns" },
        ],
      },
    ]
  },
  {
    label: "Finance",
    items: [
      {
        title: "Accounting",
        url: "/dashboard/accounting",
        icon: Wallet,
        permission: "menu:accounting",
        items: [
          { title: "Expenses", url: "/dashboard/accounting/expenses" },
          { title: "Profit & Loss", url: "/dashboard/accounting/pl" },
          { title: "Cash Flow", url: "/dashboard/accounting/cashflow" },
        ],
      },
      { title: "Billing", url: "/dashboard/billing", icon: CreditCard, permission: "menu:accounting:billing" },
    ]
  },
  {
    label: "Administrative",
    items: [
      {
        title: "Team / HR",
        url: "/dashboard/staff",
        icon: UserCheck,
        permission: "menu:staff",
        items: [
          { title: "Employees", url: "/dashboard/staff/employees" },
          { title: "Attendance", url: "/dashboard/staff/attendance" },
          { title: "Payroll", url: "/dashboard/staff/payroll" },
        ],
      },
      {
        title: "System",
        url: "/dashboard/system",
        icon: Settings,
        permission: "menu:system",
        items: [
          { title: "Audit Logs", url: "/dashboard/system/logs" },
          { title: "Notifications", url: "/dashboard/system/notifications" },
          { title: "Settings", url: "/dashboard/system/settings" },
          { title: "Users & Permissions", url: "/dashboard/staff/roles" },
        ],
      },
    ]
  },
  {
    label: "Support",
    items: [
      { title: "System Manual", url: "/dashboard/manual", icon: Book, permission: "menu:support:manual" },
      { title: "Pricing Plans", url: "/pricing", icon: DollarSign, permission: "menu:support:pricing" },
    ]
  }
];
