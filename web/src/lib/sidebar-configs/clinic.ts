import { LayoutDashboard, Calendar, ClipboardList, Stethoscope, Users, Settings, Wallet, BarChart3, Pill, FileText, FlaskConical, MessageSquare } from "lucide-react";

export const clinicSidebarConfig = [
  { 
    label: "Intelligence", 
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard, permission: "menu:overview" }, 
      { title: "AI Assistant", url: "/dashboard/intelligence/chat", icon: MessageSquare, permission: "menu:intelligence:chat" },
    ] 
  },
  { 
    label: "Clinic Ops", 
    items: [
      { title: "Overview", url: "/dashboard/clinic/overview", icon: LayoutDashboard, permission: "menu:clinic:overview" },
      { title: "Appointments", url: "/dashboard/clinic/appointments", icon: Calendar, permission: "menu:clinic:appointments" }, 
      { title: "Consultations", url: "/dashboard/clinic/consultations", icon: Stethoscope, permission: "menu:clinic:consultations" }, 
      { title: "Lab Tests", url: "/dashboard/clinic/lab", icon: FlaskConical, permission: "menu:clinic:lab" },
      { title: "Prescriptions", url: "/dashboard/patients/prescriptions", icon: FileText, permission: "menu:prescriptions" }, 
      { title: "Patients", url: "/dashboard/patients", icon: Users, permission: "menu:patients" }
    ] 
  },
  { 
    label: "Inventory", 
    items: [
      { title: "Medications", url: "/dashboard/inventory/products", icon: Pill, permission: "menu:inventory" }, 
      { title: "Suppliers", url: "/dashboard/purchases/suppliers", icon: Users, permission: "menu:purchases:suppliers" }
    ] 
  },
  { 
    label: "Finance", 
    items: [
      { title: "Billing / POS", url: "/dashboard/pos", icon: Wallet, permission: "menu:sales" },
      { title: "Expenses", url: "/dashboard/accounting/expenses", icon: Wallet, permission: "menu:accounting:expenses" }, 
      { title: "Profit & Loss", url: "/dashboard/accounting/pl", icon: BarChart3, permission: "menu:accounting:pl" }
    ] 
  },
  { 
    label: "Settings", 
    items: [
      { title: "Business Settings", url: "/dashboard/system/settings", icon: Settings, permission: "menu:system:settings" }
    ] 
  }
];
