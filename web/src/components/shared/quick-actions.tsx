"use client";

import { 
  Plus, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign,
  ChevronUp,
  FileText,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Stethoscope
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const businessTypesString = session?.user?.businessType || "SHOP";
  const types = businessTypesString.split(',').filter(Boolean);
  const mainType = types[0] || "SHOP";

  let actions = [];

  switch (mainType) {
    case "CLINIC":
    case "HOSPITAL":
      actions = [
        { label: "New Consultation", icon: Stethoscope, url: "/dashboard/clinic/consultations", color: "bg-blue-500" },
        { label: "Add Patient", icon: Users, url: "/dashboard/clinic/patients", color: "bg-indigo-500" },
        { label: "Record Expense", icon: DollarSign, url: "/dashboard/accounting/expenses", color: "bg-rose-500" },
      ];
      break;
    case "SCHOOL":
      actions = [
        { label: "Enroll Student", icon: Users, url: "/dashboard/school/students", color: "bg-blue-500" },
        { label: "Fee Collection", icon: DollarSign, url: "/dashboard/school/fees", color: "bg-emerald-500" },
        { label: "Record Expense", icon: DollarSign, url: "/dashboard/accounting/expenses", color: "bg-rose-500" },
      ];
      break;
    case "RESTAURANT":
    case "BAR":
      actions = [
        { label: "New Order", icon: ShoppingCart, url: "/dashboard/restaurant/pos", color: "bg-orange-500" },
        { label: "Kitchen Queue", icon: Clock, url: "/dashboard/restaurant/kitchen", color: "bg-red-500" },
        { label: "Record Expense", icon: DollarSign, url: "/dashboard/accounting/expenses", color: "bg-rose-500" },
      ];
      break;
    case "WAREHOUSE":
      actions = [
        { label: "Add Product", icon: Package, url: "/dashboard/inventory/products", color: "bg-indigo-500" },
        { label: "Receive Stock", icon: ArrowDownCircle, url: "/dashboard/purchases/orders", color: "bg-emerald-500" },
        { label: "Dispatch Order", icon: ArrowUpCircle, url: "/dashboard/sales/orders/new", color: "bg-blue-500" },
      ];
      break;
    default:
      // SHOP, SUPERMARKET, BOUTIQUE, ELECTRONICS, PHARMACY
      actions = [
        { label: "New Sale", icon: ShoppingCart, url: "/dashboard/pos", color: "bg-emerald-500" },
        { label: "Add Product", icon: Package, url: "/dashboard/inventory/products", color: "bg-indigo-500" },
        { label: "Record Expense", icon: DollarSign, url: "/dashboard/accounting/expenses", color: "bg-rose-500" },
      ];
  }

  return (
    <div className="fixed bottom-24 right-8 z-30 flex flex-col items-end gap-4" id="quick-actions">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col items-end gap-3 mb-2"
          >
            {actions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() => {
                  router.push(action.url);
                  setIsOpen(false);
                }}
              >
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  {action.label}
                </span>
                <div className={cn("p-4 rounded-2xl text-white shadow-2xl transition-transform hover:scale-110 active:scale-95", action.color)}>
                  <action.icon className="h-5 w-5" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-16 w-16 rounded-[2rem] shadow-2xl transition-all duration-500",
          isOpen 
            ? "bg-slate-900 dark:bg-slate-800 rotate-180 text-white" 
            : "bg-slate-900 dark:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900"
        )}
      >
        {isOpen ? <ChevronUp className="h-8 w-8" /> : <Plus className="h-8 w-8" />}
      </Button>
    </div>
  );
}
