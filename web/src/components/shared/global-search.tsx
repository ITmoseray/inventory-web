"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Package, Users, FileText, Settings, LayoutDashboard, Calculator, ArrowRightLeft, CreditCard, Loader2 } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { performGlobalSearch } from "@/lib/actions/global-search";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);
  
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (searchQuery.length < 2) {
      setResults(null);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await performGlobalSearch(searchQuery);
        setResults(res);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setResults(null);
    }
  }, [open]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const hasResults = results && (
    results.products.length > 0 || 
    results.customers.length > 0 || 
    results.sales.length > 0 || 
    results.expenses.length > 0
  );

  return (
    <>
      <div 
        className="relative w-auto lg:w-full max-w-md group cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {/* Desktop Input */}
        <div className="hidden lg:flex relative w-full h-11 bg-slate-50 dark:bg-slate-900 rounded-xl border-none pl-12 pr-4 text-sm font-medium items-center text-slate-400 group-hover:ring-2 group-hover:ring-indigo-600/20 transition-all">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          <span className="truncate">Search dashboard or jump to...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 font-mono text-[10px] font-medium text-slate-500 opacity-100 shadow-sm shrink-0">
            /
          </kbd>
        </div>
        {/* Mobile Icon */}
        <div className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
           <Search className="h-5 w-5" />
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command 
          shouldFilter={!searchQuery} // Only filter quick links if there's no query, rely on backend for actual search
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 rounded-xl border-none"
        >
          <CommandInput 
            placeholder="Type a command or search..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isSearching && (
               <div className="flex items-center justify-center py-6 text-sm text-slate-500">
                 <Loader2 className="mr-2 h-4 w-4 animate-spin text-indigo-500" />
                 Searching database...
               </div>
            )}

            {!isSearching && searchQuery.length >= 2 && !hasResults && (
              <CommandEmpty>No database results found for "{searchQuery}".</CommandEmpty>
            )}

            {!isSearching && searchQuery.length < 2 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}

            {/* STATIC QUICK LINKS (Only show if not searching DB) */}
            {(!searchQuery || searchQuery.length < 2) && (
              <>
                <CommandGroup heading="Quick Links">
                  <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                    <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-500" />
                    <span className="font-medium">Dashboard Home</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/pos"))}>
                    <ShoppingCart className="mr-2 h-4 w-4 text-emerald-500" />
                    <span className="font-medium">Point of Sale (POS)</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/inventory"))}>
                    <Package className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="font-medium">Inventory & Products</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/customers"))}>
                    <Users className="mr-2 h-4 w-4 text-rose-500" />
                    <span className="font-medium">Customers Database</span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Operations & Accounting">
                   <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/accounting/expenses"))}>
                    <Calculator className="mr-2 h-4 w-4 text-amber-500" />
                    <span className="font-medium">Manage Expenses</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/inventory/adjustments"))}>
                    <ArrowRightLeft className="mr-2 h-4 w-4 text-cyan-500" />
                    <span className="font-medium">Stock Adjustments</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/customers/debts"))}>
                    <CreditCard className="mr-2 h-4 w-4 text-purple-500" />
                    <span className="font-medium">Customer Debts</span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                  <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/reports"))}>
                    <FileText className="mr-2 h-4 w-4 text-slate-500" />
                    <span className="font-medium">System Reports</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                    <Settings className="mr-2 h-4 w-4 text-slate-500" />
                    <span className="font-medium">Business Settings</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {/* DATABASE SEARCH RESULTS */}
            {results && !isSearching && hasResults && (
              <>
                {results.products.length > 0 && (
                  <CommandGroup heading="Products">
                    {results.products.map((p: any) => (
                      <CommandItem key={p.id} onSelect={() => runCommand(() => router.push(`/dashboard/inventory?search=${p.sku || p.name}`))}>
                        <Package className="mr-2 h-4 w-4 text-blue-500" />
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                           <span className="text-xs text-slate-500">SKU: {p.sku || 'N/A'} • Stock: {p.stockQuantity} • Le {p.unitPrice.toLocaleString()}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.customers.length > 0 && (
                  <CommandGroup heading="Customers">
                    {results.customers.map((c: any) => (
                      <CommandItem key={c.id} onSelect={() => runCommand(() => router.push(`/dashboard/customers?search=${c.name}`))}>
                        <Users className="mr-2 h-4 w-4 text-rose-500" />
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                           <span className="text-xs text-slate-500">{c.phone || 'No phone'}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.sales.length > 0 && (
                  <CommandGroup heading="Sales & Invoices">
                    {results.sales.map((s: any) => (
                      <CommandItem key={s.id} onSelect={() => runCommand(() => router.push(`/dashboard/sales?search=${s.invoiceNumber}`))}>
                        <ShoppingCart className="mr-2 h-4 w-4 text-emerald-500" />
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-900 dark:text-white">{s.invoiceNumber}</span>
                           <span className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString()} • Le {s.totalAmount.toLocaleString()}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.expenses.length > 0 && (
                  <CommandGroup heading="Expenses">
                    {results.expenses.map((e: any) => (
                      <CommandItem key={e.id} onSelect={() => runCommand(() => router.push(`/dashboard/accounting/expenses?search=${e.description}`))}>
                        <Calculator className="mr-2 h-4 w-4 text-amber-500" />
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-900 dark:text-white">{e.description}</span>
                           <span className="text-xs text-slate-500">{e.category} • Le {e.amount.toLocaleString()}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}

          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
