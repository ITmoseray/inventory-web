import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
  isMain?: boolean; // Use this as title in mobile card
  isMeta?: boolean; // Use this as secondary info in mobile card
  isHiddenMobile?: boolean; // Hide this column on mobile
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  rowClassName?: string;
}

export function ResponsiveTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  onRowClick, 
  actions,
  loading,
  emptyState,
  className,
  rowClassName
}: ResponsiveTableProps<T>) {
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const mainColumn = columns.find(c => c.isMain) || columns[0];
  const metaColumns = columns.filter(c => c.isMeta);
  const detailColumns = columns.filter(c => !c.isMain && !c.isMeta && !c.isHiddenMobile);

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop/Tablet Table View */}
      <div className="hidden lg:block overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="h-14 border-slate-100 dark:border-slate-800">
              {columns.map((col, i) => (
                <TableHead key={i} className={cn("font-black text-[10px] uppercase tracking-[0.2em] text-slate-400", col.className)}>
                  {col.header}
                </TableHead>
              ))}
              {actions && <TableHead className="w-[80px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {data.map((item, idx) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "group h-20 border-slate-50 dark:border-slate-800/50 transition-all duration-300 cursor-pointer relative z-0 hover:z-10 hover:bg-blue-50/80 dark:hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200 dark:hover:border-blue-500/30 hover:scale-[1.005]",
                    rowClassName
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col, i) => (
                    <TableCell key={i} className={cn("py-4", col.className)}>
                      {col.accessor(item)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                       {actions(item)}
                    </TableCell>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Mobile/Small Tablet Card View */}
      <div className="lg:hidden space-y-4">
        <AnimatePresence mode="popLayout">
          {data.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "relative overflow-hidden p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:-translate-y-1",
                rowClassName
              )}
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="space-y-1 flex-1">
                   <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                     {mainColumn.accessor(item)}
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {metaColumns.map((col, i) => (
                       <div key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         {col.accessor(item)}
                       </div>
                     ))}
                   </div>
                </div>
                {actions && (
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    {actions(item)}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                {detailColumns.map((col, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      {col.header}
                    </p>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {col.accessor(item)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
