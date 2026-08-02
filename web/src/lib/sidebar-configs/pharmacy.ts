import { 
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, 
  Pill, Stethoscope, FileText, Wallet, UserCheck, CreditCard, 
  Book, DollarSign, Truck, MessageSquare, TrendingUp
} from "lucide-react";

export const pharmacySidebarConfig = [
  { 
    label: "Intelligence", 
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard, permission: "menu:overview" }, 
      { title: "AI Assistant", url: "/dashboard/intelligence/chat", icon: MessageSquare, permission: "menu:intelligence:chat" },
      { title: "Stock Forecast", url: "/dashboard/intelligence/replenishment", icon: TrendingUp, permission: "menu:intelligence:replenishment" },
      { title: "Low Stock Alerts", url: "/dashboard/inventory/expiry", icon: Pill, permission: "menu:inventory" },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, permission: "menu:intelligence:analytics" },
      { title: "Reports", url: "/dashboard/reports", icon: BarChart3, permission: "menu:intelligence:reports" },
    ] 
  },
  { 
    label: "Pharmacy Ops", 
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
          { title: "Credit Sales", url: "/dashboard/customers/debts" },
          { title: "Returns", url: "/dashboard/sales/returns" },
        ],
      },
      { title: "Prescriptions", url: "/dashboard/patients/prescriptions", icon: FileText, permission: "menu:prescriptions" }, 
      { title: "Patients", url: "/dashboard/patients", icon: Users, permission: "menu:patients" }
    ] 
  },
  { 
    label: "Inventory", 
    items: [
      {
        title: "Medications",
        url: "/dashboard/inventory",
        icon: Pill,
        permission: "menu:inventory",
        items: [
          { title: "Products", url: "/dashboard/inventory/products" },
          { title: "Categories", url: "/dashboard/inventory/categories" },
          { title: "Expiry Tracking", url: "/dashboard/inventory/expiry" },
          { title: "Stock Adjustments", url: "/dashboard/inventory/adjustments" },
          { title: "Controlled Substances", url: "/dashboard/reports/controlled-substances" },
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
        ],
      },
    ] 
  },
  {
    label: "Customers",
    items: [
      {
        title: "Customer / CRM",
        url: "/dashboard/customers",
        icon: Users,
        permission: "menu:customers",
        items: [
          { title: "Customer Registry", url: "/dashboard/customers" },
          { title: "Loyalty Program", url: "/dashboard/customers/loyalty" },
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
