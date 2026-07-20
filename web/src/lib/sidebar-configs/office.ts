import { 
  LayoutDashboard, Package, Users, BarChart3, Settings, 
  Wallet, FileText, Truck, ShieldCheck, Activity as ActivityIcon, 
  CreditCard, Book, DollarSign, UserCheck, Clock, 
  TrendingUp, MessageSquare
} from "lucide-react";

export const officeSidebarConfig = [
  {
    label: "Intelligence",
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard, permission: "menu:overview" },
      { title: "Intelligence Hub", url: "/dashboard/registry", icon: ShieldCheck, permission: "menu:intelligence:hub" },
      { title: "AI Assistant", url: "/dashboard/intelligence/chat", icon: MessageSquare, permission: "menu:intelligence:chat" },
      { title: "Analytics", url: "/dashboard/analytics", icon: ActivityIcon, permission: "menu:intelligence:analytics" },
      { title: "Reports", url: "/dashboard/reports", icon: BarChart3, permission: "menu:intelligence:reports" },
    ]
  },
  {
    label: "Assets & Supplies",
    items: [
      {
        title: "Office Inventory",
        url: "/dashboard/inventory",
        icon: Package,
        permission: "menu:inventory",
        items: [
          { title: "Office Assets", url: "/dashboard/inventory/products" },
          { title: "Asset Adjustments", url: "/dashboard/inventory/adjustments" },
          { title: "Asset Categories", url: "/dashboard/inventory/categories" },
          { title: "Stock History", url: "/dashboard/inventory/history" },
        ],
      },
      {
        title: "Procurement",
        url: "/dashboard/purchases",
        icon: Truck,
        permission: "menu:purchases",
        items: [
          { title: "Office Suppliers", url: "/dashboard/purchases/suppliers" },
          { title: "Purchase Orders", url: "/dashboard/purchases" },
        ],
      },
    ]
  },
  {
    label: "Finance & Accounts",
    items: [
      {
        title: "Sales & Invoicing",
        url: "/dashboard/sales",
        icon: FileText,
        permission: "menu:sales",
        items: [
          { title: "Point of Sale", url: "/dashboard/pos" },
          { title: "Quotes & Estimates", url: "/dashboard/sales/quotes" },
          { title: "Invoices", url: "/dashboard/sales/invoices" },
        ],
      },
      {
        title: "Accounting",
        url: "/dashboard/accounting",
        icon: Wallet,
        permission: "menu:accounting",
        items: [
          { title: "Office Expenses", url: "/dashboard/accounting/expenses" },
          { title: "Profit & Loss", url: "/dashboard/accounting/pl" },
          { title: "Cashflow", url: "/dashboard/accounting/cashflow" },
          { title: "Transaction Tags", url: "/dashboard/accounting/tags" },
          { title: "Bank Reconciliation", url: "/dashboard/accounting/reconciliation" },
        ],
      },
      { title: "Plan Billing", url: "/dashboard/billing", icon: CreditCard, permission: "menu:accounting:billing" },
    ]
  },
  {
    label: "Personnel (HR)",
    items: [
      {
        title: "Team / HR",
        url: "/dashboard/staff",
        icon: UserCheck,
        permission: "menu:staff",
        items: [
          { title: "Employees", url: "/dashboard/staff/employees" },
          { title: "Attendance Logs", url: "/dashboard/staff/attendance" },
          { title: "Payroll Manager", url: "/dashboard/staff/payroll" },
        ],
      },
    ]
  },
  {
    label: "Administrative Settings",
    items: [
      {
        title: "System Control",
        url: "/dashboard/system",
        icon: Settings,
        permission: "menu:system",
        items: [
          { title: "Audit Trails", url: "/dashboard/system/logs" },
          { title: "System Broadcasts", url: "/dashboard/system/notifications" },
          { title: "Preferences", url: "/dashboard/system/settings" },
        ],
      },
    ]
  },
  {
    label: "Help & Resources",
    items: [
      { title: "Operations Manual", url: "/dashboard/manual", icon: Book, permission: "menu:support:manual" },
    ]
  }
];
