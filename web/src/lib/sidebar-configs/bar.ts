import { 
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, 
  Wallet, FileText, Truck, ShieldCheck, Activity as ActivityIcon, 
  CreditCard, Book, DollarSign, UserCheck, ClipboardList, Clock, 
  Beer, CalendarCheck, MessageSquare, GlassWater, ChefHat, ReceiptText
} from "lucide-react";

export const barSidebarConfig = [
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
    label: "Bar Operations",
    items: [
      {
        title: "Sales",
        url: "/dashboard/sales",
        icon: ShoppingCart,
        permission: "menu:sales",
        items: [
          { title: "Launch POS", url: "/dashboard/pos" },
          { title: "Open Tabs", url: "/dashboard/sales/orders" },
          { title: "Sales History", url: "/dashboard/sales/history" },
          { title: "Credit Sales", url: "/dashboard/customers/debts" },
          { title: "Returns", url: "/dashboard/sales/returns" },
        ],
      },
      {
        title: "Bar Management",
        url: "/dashboard/restaurant",
        icon: Beer,
        permission: "menu:bar:tables",
        items: [
          { title: "Table Management", url: "/dashboard/restaurant/tables" },
          { title: "Reservations", url: "/dashboard/customers" },
          { title: "Happy Hour", url: "/dashboard/pos?mode=happyhour" },
        ],
      },
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
          { title: "Drinks & Products", url: "/dashboard/inventory/products" },
          { title: "Categories", url: "/dashboard/inventory/categories" },
          { title: "Inventory Adjustments", url: "/dashboard/inventory/adjustments" },
          { title: "Stock Levels", url: "/dashboard/inventory/batches" },
          { title: "Stock History", url: "/dashboard/inventory/history" },
          { title: "Expiry Tracking", url: "/dashboard/inventory/expiry" },
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
          { title: "VIP Customers", url: "/dashboard/customers/profiles" },
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
          { title: "Daily Reconciliation", url: "/dashboard/accounting" },
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
          { title: "Shifts", url: "/dashboard/staff/attendance" },
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
