import { 
  LayoutDashboard, 
  DollarSign, 
  ShoppingCart, 
  Receipt, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  Users, 
  FileSignature, 
  MessageSquare, 
  Crown,
  Building2,
  CalendarCheck
, Store
} from "lucide-react";

export const simpleSalesProfitSidebarConfig = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, permission: "view_dashboard" },
      { title: "AI Store Builder", url: "/dashboard/store-builder", icon: Store, permission: "view_dashboard" },
      { title: "Sales & Income", url: "/dashboard/simple-sales", icon: DollarSign, permission: "view_dashboard" },
      { title: "Stock & Purchases", url: "/dashboard/simple-purchases", icon: ShoppingCart, permission: "view_dashboard" },
      { title: "Expenses", url: "/dashboard/accounting/expenses", icon: Receipt, permission: "view_dashboard" },
      { title: "Profit & Loss", url: "/dashboard/simple-profit-loss", icon: TrendingUp, permission: "view_dashboard" },
      { title: "Reports", url: "/dashboard/simple-reports", icon: BarChart3, permission: "view_dashboard" },
    ]
  },
  {
    label: "Organization",
    items: [
      {
        title: "Team & Staff",
        url: "/dashboard/staff",
        icon: Users,
        permission: "view_dashboard",
        items: [
          { title: "Employees", url: "/dashboard/staff/employees" },
          { title: "Staff Agreements", url: "/dashboard/staff/agreements" },
          { title: "Attendance", url: "/dashboard/staff/attendance" },
        ]
      },
      {
        title: "Settings",
        url: "/dashboard/system/settings/business",
        icon: Settings,
        permission: "view_dashboard",
        items: [
          { title: "Business Settings", url: "/dashboard/system/settings/business" },
          { title: "System Preferences", url: "/dashboard/system/settings" },
        ]
      }
    ]
  }
];
