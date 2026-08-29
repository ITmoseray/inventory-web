import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutGrid, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface CategorySidebarProps {
  categories: any[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategorySidebar({ categories, selectedCategory, onSelectCategory }: CategorySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "hidden lg:flex flex-col h-full bg-white dark:bg-[#0F172A] border-r border-slate-100 dark:border-white/10 shrink-0 z-20 shadow-sm transition-all duration-300 relative",
      isCollapsed ? "w-[72px]" : "w-[220px] xl:w-[260px]"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-slate-100 dark:border-white/10 shrink-0 flex items-center justify-between",
        isCollapsed ? "flex-col gap-2 px-2" : ""
      )}>
        {!isCollapsed ? (
          <div>
            <h2 className="text-base xl:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Categories</h2>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Filter Assets</p>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <LayoutGrid size={16} />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          title={isCollapsed ? "Expand Categories" : "Collapse Categories"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 xl:p-3 space-y-1.5">
        <button
          onClick={() => onSelectCategory(null)}
          title="All Categories"
          className={cn(
            "w-full flex items-center gap-3 p-2.5 xl:p-3 rounded-2xl transition-all duration-200 relative group text-left",
            selectedCategory === null 
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
              : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
            isCollapsed && "justify-center p-2.5"
          )}
        >
          <div className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
            selectedCategory === null ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
          )}>
            <LayoutGrid size={16} />
          </div>
          {!isCollapsed && (
            <span className="text-[11px] xl:text-xs font-black uppercase tracking-wider truncate">All Channels</span>
          )}
        </button>

        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            title={cat.name}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 xl:p-3 rounded-2xl transition-all duration-200 relative group text-left",
              selectedCategory === cat.id 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
              isCollapsed && "justify-center p-2.5"
            )}
          >
            <div className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
              selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
            )}>
              <Package size={16} />
            </div>
            {!isCollapsed && (
              <span className="text-[11px] xl:text-xs font-black uppercase tracking-wider truncate">{cat.name}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
