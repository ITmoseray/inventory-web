import { Card } from "@/components/ui/card";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
  change?: number;
}

export function StatCard({ title, value, prefix = "", description, icon: Icon, colorClass, bgClass, delay = 0, href, change }: StatCardProps) {
  let displayValue: any = value;
  if (typeof value === 'object' && value !== null) {
    displayValue = JSON.stringify(value);
  }

  const isPositive = change !== undefined && change >= 0;

  const CardContentWrapper = (
    <Card className={cn(
        "group relative overflow-hidden border-slate-100 dark:border-white/10 bg-white dark:bg-card rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 cursor-pointer flex flex-col h-full",
        href && "cursor-pointer"
    )}>
        <div className="flex items-start gap-4">
          <div className={cn("flex items-center justify-center h-14 w-14 rounded-2xl shrink-0 shadow-inner", bgClass)}>
              <Icon className={cn("h-6 w-6", colorClass)} />
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
             <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-tight">{title}</h3>
             <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
               {prefix}<CountUp value={displayValue} />
             </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
           {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 font-bold text-sm", 
                isPositive 
                  ? "text-emerald-500" 
                  : "text-rose-500"
              )}>
                {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
           )}
           <span className="text-sm font-medium text-slate-400">{description}</span>
        </div>
      </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      className="h-full"
    >
      {href ? <Link href={href} className="block h-full">{CardContentWrapper}</Link> : CardContentWrapper}
    </motion.div>
  );
}

