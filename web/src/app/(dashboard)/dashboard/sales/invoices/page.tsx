"use client";

import { FileText, Plus, Search, Filter } from "lucide-react";
import { ModuleHeader } from "@/components/layout/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader 
        title="Invoices" 
        description="Create and share professional invoices for your B2B customers and wholesale orders."
        icon={FileText}
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-1 w-full sm:w-auto items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search invoices by number or customer..." 
              className="pl-9 h-10 w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl">
             <Filter className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
        
        <Button className="w-full sm:w-auto h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
           <Plus className="h-4 w-4 mr-2" />
           Create Invoice
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
         <div className="h-20 w-20 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-indigo-500" />
         </div>
         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Invoices Yet</h3>
         <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
           You haven't generated any professional invoices yet. Click "Create Invoice" to bill your first customer.
         </p>
         <Button className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
           <Plus className="h-4 w-4 mr-2" />
           Create First Invoice
         </Button>
      </div>
    </div>
  );
}
