import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  filterOptions?: string[];
}

export function ChartCard({ title, children, className, delay = 0, filterOptions }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      className="h-full"
    >
      <Card className={cn("p-5 sm:p-6 rounded-2xl border-slate-100 dark:border-white/10 bg-white dark:bg-card shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col", className)}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">{title}</h3>
          
          {filterOptions && filterOptions.length > 0 && (
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              {filterOptions[0]}
              <ChevronDown className="h-3 w-3" />
            </button>
          )}
        </div>
        
        <div className="flex-1 min-h-[250px] w-full relative">
          {children}
        </div>
      </Card>
    </motion.div>
  );
}
