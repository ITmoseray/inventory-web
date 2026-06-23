import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { CountUp } from "@/components/shared/count-up";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  delay?: number;
  variant?: "default" | "warning";
}

export function StatCard({ title, value, description, icon: Icon, delay = 0, variant = "default" }: StatCardProps) {
  const isWarning = variant === "warning";
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn(
        "bg-white dark:bg-slate-900/40 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-7 shadow-md dark:shadow-2xl transition-all duration-500 group overflow-hidden relative border",
        isWarning 
          ? "border-amber-500/30 hover:border-amber-500/60" 
          : "border-slate-200/80 dark:border-slate-800/50 hover:border-indigo-500/50"
      )}>
        <div className={cn(
          "absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700",
          isWarning ? "bg-amber-500/5" : "bg-indigo-500/5"
        )} />
        
        <CardHeader className="p-0 pb-4 md:pb-6 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">{title}</CardTitle>
          <div className={cn(
            "p-2.5 md:p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border group-hover:scale-110 group-hover:rotate-6 transition-all duration-500",
            isWarning ? "border-amber-500/20" : "border-slate-100 dark:border-slate-800"
          )}>
             <Icon className={cn("h-4 w-4 md:h-5 md:w-5", isWarning ? "text-amber-500" : "text-indigo-400")} />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight break-words">
            {value}
          </div>
          <div className="mt-4 flex flex-col gap-2">
             <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1.5, delay: delay + 0.3 }}
                  className={cn("h-full rounded-full", isWarning ? "bg-amber-500" : "bg-indigo-500")}
                />
             </div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
