"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Building2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getUserBusinesses, switchBusiness } from "@/lib/actions/business";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface BusinessSwitcherProps {
  currentBusinessId?: string;
  currentBusinessName?: string;
}

export function BusinessSwitcher({ currentBusinessId, currentBusinessName }: BusinessSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [businesses, setBusinesses] = React.useState<any[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    getUserBusinesses().then(setBusinesses).catch(console.error);
  }, []);

  const onSwitch = async (id: string) => {
    if (id === currentBusinessId) {
      setOpen(false);
      return;
    }
    
    const promise = switchBusiness(id);
    toast.promise(promise, {
      loading: "Switching store...",
      success: () => {
        setOpen(false);
        // We use window.location.href to force a full reload and clear any cached states
        window.location.href = "/dashboard";
        return "Store switched successfully";
      },
      error: "Failed to switch store"
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "w-auto md:w-[200px] h-11 inline-flex items-center justify-center md:justify-between rounded-xl",
              "bg-slate-50 border border-slate-100 px-3",
              "hover:bg-white hover:border-indigo-200 transition-all",
              "text-sm font-medium"
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white uppercase">
                {currentBusinessName?.charAt(0) || "B"}
              </div>
              <span className="hidden md:inline truncate text-[10px] font-black uppercase tracking-widest text-slate-600">
                {currentBusinessName || "Select Business"}
              </span>
            </div>
            <ChevronsUpDown className="hidden md:block ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        }
      />
      <PopoverContent className="w-[240px] p-0 rounded-2xl border-slate-100 shadow-2xl overflow-hidden">
        <Command className="bg-white">
          <div className="px-3 py-2 border-b border-slate-50">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Switch Store</p>
          </div>
          <CommandInput placeholder="Search stores..." className="h-10 text-xs border-none focus:ring-0" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-center text-xs text-slate-400">No businesses found.</CommandEmpty>
            <CommandGroup>
              {businesses.map((business) => (
                <CommandItem
                  key={business.id}
                  onSelect={() => onSwitch(business.id)}
                  className="flex items-center justify-between py-3 px-3 cursor-pointer rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 relative">
                        {business.logoUrl ? (
                            <Image src={business.logoUrl} alt={business.name} fill className="object-cover" unoptimized />
                        ) : (
                            <div className="h-full w-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                {business.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{business.name}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{business.type}</span>
                    </div>
                  </div>
                  {currentBusinessId === business.id && (
                    <div className="h-5 w-5 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem
              onSelect={() => router.push("/marketplace")}
              className="py-3 px-3 cursor-pointer rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Globe className="mr-3 h-4 w-4" />
              <span className="text-xs font-bold">Public Marketplace</span>
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
