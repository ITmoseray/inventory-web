import React from "react";
import { cn } from "@/lib/utils";
import { LayoutGrid, Package } from "lucide-react";
import { motion } from "framer-motion";

interface CategorySidebarProps {
  categories: any[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategorySidebar({ categories, selectedCategory, onSelectCategory }: CategorySidebarProps) {
  return (
    <div className="hidden lg:flex flex-col w-[260px] xl:w-[280px] h-full bg-white dark:bg-[#0F172A] border-r border-slate-100 dark:border-white/10 shrink-0 z-20 shadow-sm">
      <div className="p-6 border-b border-slate-100 dark:border-white/10 shrink-0">
         <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Categories</h2>
         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Filter Assets</p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 relative group text-left",
            selectedCategory === null 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
            selectedCategory === null ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
          )}>
            <LayoutGrid size={18} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">All Channels</span>
        </button>

        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 relative group text-left",
              selectedCategory === cat.id 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
              selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
            )}>
              <Package size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider truncate">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
