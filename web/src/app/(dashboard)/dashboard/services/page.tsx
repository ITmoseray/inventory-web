"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Briefcase, DollarSign, Activity, AlertCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServices, fixServiceType } from "@/lib/actions/services";
import { toast } from "sonner";

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadServices() {
    setLoading(true);
    const data = await getServices();
    setServices(data);
    setLoading(false);
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function handleFix(productId: string, name: string) {
    const res = await fixServiceType(productId);
    if (res.success) {
      toast.success(`"${name}" has been marked as a service.`);
      loadServices();
      router.refresh();
    } else {
      toast.error(res.error || "Failed to fix service type");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-[1000] tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            Services
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Manage billable services and record fees.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/services/record" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:text-accent-foreground h-10 px-4 py-2 border-primary/20 text-primary hover:bg-primary/10"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Record Fee
          </Link>
          <Link 
            href="/dashboard/services/new" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 uppercase border-b border-slate-100 dark:border-slate-800 font-black tracking-wider">
              <tr>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Standard Fee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    Loading services...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Briefcase className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="font-medium text-lg text-slate-900 dark:text-white">No services found</p>
                    <p className="text-sm mb-4">You haven't added any services yet.</p>
                    <Link 
                      href="/dashboard/services/new"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      Add Your First Service
                    </Link>
                  </td>
                </tr>
              ) : (
                services.map((service: any) => (
                  <tr key={service.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{service.name}</span>
                        {service.type !== "SERVICE" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            <AlertCircle className="h-2.5 w-2.5" />
                            Needs Fix
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{service.description || "-"}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      Le {Number(service.unitPrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        <Activity className="h-3 w-3" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      {service.type !== "SERVICE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={() => handleFix(service.id, service.name)}
                        >
                          <Wrench className="mr-1.5 h-3 w-3" />
                          Fix Type
                        </Button>
                      )}
                      <Link 
                        href={`/dashboard/services/record?serviceId=${service.id}`}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      >
                        Record Fee
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
