import React from "react";
import { cn } from "@/lib/utils";
import { LayoutGrid, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategorySidebarProps {
  categories: any[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CategorySidebar({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  isCollapsed = true,
  onToggleCollapse
}: CategorySidebarProps) {
  return (
    <div className={cn(
      "hidden lg:flex flex-col h-full bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-white/10 shrink-0 z-20 shadow-sm transition-all duration-300",
      isCollapsed ? "w-[60px]" : "w-[200px] xl:w-[230px]"
    )}>
      <div className={cn(
        "p-3 border-b border-slate-100 dark:border-white/10 shrink-0 flex items-center",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="min-w-0">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">Categories</h2>
          </div>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? "Expand Categories" : "Collapse Categories"}
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          title="All Items"
          className={cn(
            "w-full flex items-center rounded-xl transition-all duration-200 text-left cursor-pointer",
            isCollapsed ? "justify-center p-2" : "gap-2.5 p-2.5",
            selectedCategory === null 
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20" 
              : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <div className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
            selectedCategory === null ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          )}>
            <LayoutGrid size={14} />
          </div>
          {!isCollapsed && (
            <span className="text-[11px] font-black uppercase tracking-wider truncate">All Items</span>
          )}
        </button>

        {categories?.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            title={cat.name}
            className={cn(
              "w-full flex items-center rounded-xl transition-all duration-200 text-left cursor-pointer",
              isCollapsed ? "justify-center p-2" : "gap-2.5 p-2.5",
              selectedCategory === cat.id 
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20" 
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <div className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
              selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            )}>
              <Package size={14} />
            </div>
            {!isCollapsed && (
              <span className="text-[11px] font-black uppercase tracking-wider truncate">{cat.name}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
