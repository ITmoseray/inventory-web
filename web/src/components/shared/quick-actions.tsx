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
import { useChatStore } from "@/store/use-chat-store";

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { isChatOpen } = useChatStore();

  // If Staff Chat is open, hide QuickActions so it NEVER blocks messages or input field
  if (isChatOpen) {
    return null;
  }

  const businessTypesString = session?.user?.businessType || "SHOP";
  const types = businessTypesString.split(',').filter(Boolean);
  const mainType = types[0] || "SHOP";

  let actions = [];

  switch (mainType) {
    case "CLINIC":
    case "HOSPITAL":
      actions = [
        { label: "New Consultation", icon: Stethoscope, url: "/dashboard/clinic/consultations", color: "bg-blue-500" },
        { label: "Patients", icon: Users, url: "/dashboard/patients", color: "bg-indigo-500" },
        { label: "Record Expense", icon: DollarSign, url: "/dashboard/accounting/expenses", color: "bg-rose-500" },
      ];
      break;
    case "SCHOOL":
      actions = [
        { label: "Enroll Student", icon: Users, url: "/dashboard/school/students", color: "bg-blue-500" },
        { label: "Fee Collection", icon: DollarSign, url: "/dashboard/school/payments", color: "bg-emerald-500" },
        { label: "Record Expense", icon: DollarSign, url: "/dashboard/accounting/expenses", color: "bg-rose-500" },
      ];
      break;
    case "BAR":
      actions = [
        { label: "New Sale / POS", icon: ShoppingCart, url: "/dashboard/pos", color: "bg-emerald-500" },
        { label: "Table Orders", icon: ShoppingCart, url: "/dashboard/restaurant/tables", color: "bg-orange-500" },
        { label: "Record Expense", icon: DollarSign, url: "/dashboard/accounting/expenses", color: "bg-rose-500" },
      ];
      break;
    case "RESTAURANT":
      actions = [
        { label: "New Sale / POS", icon: ShoppingCart, url: "/dashboard/pos", color: "bg-orange-500" },
        { label: "Kitchen Queue", icon: Clock, url: "/dashboard/restaurant/kitchen", color: "bg-red-500" },
        { label: "Record Expense", icon: DollarSign, url: "/dashboard/accounting/expenses", color: "bg-rose-500" },
      ];
      break;
    case "WAREHOUSE":
      actions = [
        { label: "Add Product", icon: Package, url: "/dashboard/inventory/products", color: "bg-indigo-500" },
        { label: "Receive Stock", icon: ArrowDownCircle, url: "/dashboard/purchases", color: "bg-emerald-500" },
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
    <div className="fixed bottom-20 right-4 sm:bottom-20 sm:right-5 z-30 flex flex-col items-end gap-3 print:hidden" id="quick-actions">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.85 }}
            className="flex flex-col items-end gap-2.5 mb-1"
          >
            {actions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2.5 group cursor-pointer"
                onClick={() => {
                  router.push(action.url);
                  setIsOpen(false);
                }}
              >
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {action.label}
                </span>
                <div className={cn("p-3 sm:p-3.5 rounded-2xl text-white shadow-xl transition-transform hover:scale-110 active:scale-95", action.color)}>
                  <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 w-12 sm:h-13 sm:w-13 rounded-2xl shadow-xl transition-all duration-300 p-0 flex items-center justify-center",
          isOpen 
            ? "bg-slate-900 dark:bg-slate-800 rotate-180 text-white" 
            : "bg-slate-900 dark:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900"
        )}
        title="Quick Actions"
      >
        {isOpen ? <ChevronUp className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}
