import { LayoutDashboard, Users, BookOpen, CreditCard, Wallet, Settings } from "lucide-react";

export const schoolSidebarConfig = [
  { 
    label: "School Hub", 
    items: [
      { title: "Overview", url: "/dashboard/school", icon: LayoutDashboard, permission: "menu:overview" }
    ] 
  },
  { 
    label: "Academics", 
    items: [
      { title: "Students", url: "/dashboard/school/students", icon: Users, permission: "menu:overview" },
      { title: "Courses & Classes", url: "/dashboard/school/courses", icon: BookOpen, permission: "menu:overview" },
      { title: "Daily Attendance", url: "/dashboard/school/attendance", icon: LayoutDashboard, permission: "menu:overview" }
    ] 
  },
  { 
    label: "Financials", 
    items: [
      { title: "Payments & Fees", url: "/dashboard/school/payments", icon: CreditCard, permission: "menu:overview" },
      { title: "Staff Payroll", url: "/dashboard/school/payroll", icon: Wallet, permission: "menu:overview" }
    ] 
  },
  { 
    label: "Settings", 
    items: [
      { title: "Business Settings", url: "/dashboard/system/settings", icon: Settings, permission: "menu:system:settings" }
    ] 
  }
];
