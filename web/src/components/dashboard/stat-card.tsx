import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CountUp } from "@/components/shared/count-up";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: number | string | any;
  prefix?: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  delay?: number;
  href?: string;
  change?: number; // Add dynamic growth change parameter
}

export function StatCard({ title, value, prefix = "", description, icon: Icon, colorClass, bgClass, delay = 0, href, change }: StatCardProps) {
  // Defensive check for React Error #31
  let displayValue: any = value;
  if (typeof value === 'object' && value !== null) {
    console.error(`DEBUG: StatCard '${title}' received unexpected object:`, value);
    displayValue = JSON.stringify(value);
  }

  const CardContentWrapper = (
    <Card className={cn(
        "group relative overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer flex flex-col h-full",
        href && "cursor-pointer"
    )}>
        <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between space-y-0 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
             <div className={cn("p-2 rounded-md", bgClass)}>
                 <Icon className={cn("h-4 w-4", colorClass)} />
             </div>
             <CardTitle className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{title}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 flex flex-col justify-end">
          <div className="flex items-baseline gap-1.5 mb-1">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
              {prefix}<CountUp value={displayValue} />
            </div>
          </div>
          
          <div className="mt-2 flex items-center justify-between">
             <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{description}</span>
             {change !== undefined && (
                <div className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-bold", 
                  change >= 0 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                )}>
                  {change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`}
                </div>
             )}
          </div>
        </CardContent>
      </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="h-full"
    >
      {href ? <Link href={href} className="block h-full">{CardContentWrapper}</Link> : CardContentWrapper}
    </motion.div>
  );
}

