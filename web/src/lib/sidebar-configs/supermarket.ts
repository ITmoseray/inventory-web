import { 
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, 
  Wallet, FileText, Truck, ShieldCheck, Activity as ActivityIcon, 
  CreditCard, Book, DollarSign, UserCheck, ClipboardList, 
  Tag, TrendingUp, MessageSquare
} from "lucide-react";

export const supermarketSidebarConfig = [
  {
    label: "Intelligence",
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard, permission: "menu:overview" },
      { title: "Intelligence Hub", url: "/dashboard/registry", icon: ShieldCheck, permission: "menu:intelligence:hub" },
      { title: "AI Assistant", url: "/dashboard/intelligence/chat", icon: MessageSquare, permission: "menu:intelligence:chat" },
      { title: "Stock Forecast", url: "/dashboard/intelligence/replenishment", icon: TrendingUp, permission: "menu:intelligence:replenishment" },
      { title: "Analytics", url: "/dashboard/analytics", icon: ActivityIcon, permission: "menu:intelligence:analytics" },
      { title: "Reports", url: "/dashboard/reports", icon: BarChart3, permission: "menu:intelligence:reports" },
    ]
  },
  {
    label: "Supply Chain",
    items: [
      {
        title: "Inventory",
        url: "/dashboard/inventory",
        icon: Package,
        permission: "menu:inventory",
        items: [
          { title: "Stock Overview", url: "/dashboard/inventory/overview" },
          { title: "Products", url: "/dashboard/inventory/products" },
          { title: "Barcode Studio", url: "/dashboard/inventory/barcode" },
          { title: "Categories", url: "/dashboard/inventory/categories" },
          { title: "Batches", url: "/dashboard/inventory/batches" },
          { title: "Expiry Tracking", url: "/dashboard/inventory/expiry" },
          { title: "Stock Adjustments", url: "/dashboard/inventory/adjustments" },
          { title: "Stock History", url: "/dashboard/inventory/history" },
          { title: "Network Exchange", url: "/dashboard/inventory/network" },
        ],
      },
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
    label: "Commerce",
    items: [
      {
        title: "Sales",
        url: "/dashboard/sales",
        icon: ShoppingCart,
        permission: "menu:sales",
        items: [
          { title: "Launch POS", url: "/dashboard/pos" },
          { title: "Sales History", url: "/dashboard/sales/history" },
          { title: "Invoices", url: "/dashboard/sales/invoices" },
          { title: "Sales Orders", url: "/dashboard/sales/orders" },
          { title: "Credit Sales", url: "/dashboard/customers/debts" },
          { title: "Returns", url: "/dashboard/sales/returns" },
        ],
      },
    ],
  },
  {
    label: "Relationships",
    items: [
      {
        title: "Customers / CRM",
        url: "/dashboard/customers",
        icon: Users,
        permission: "menu:customers",
        items: [
          { title: "Customer Registry", url: "/dashboard/customers" },
          { title: "Loyalty Program", url: "/dashboard/customers/loyalty" },
          { title: "Purchase Profiles", url: "/dashboard/customers/profiles" },
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
          { title: "Tax Records & Filing", url: "/dashboard/accounting/taxes" },
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
          { title: "Receipt Layout", url: "/dashboard/system/settings/business?tab=receipt" },
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
