import { getServices } from "@/lib/actions/services";
import Link from "next/link";
import { Plus, Briefcase, DollarSign, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ServicesPage() {
  const services = await getServices();

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
          <Button asChild variant="outline" className="font-bold border-primary/20 text-primary hover:bg-primary/10">
            <Link href="/dashboard/services/record">
              <DollarSign className="mr-2 h-4 w-4" />
              Record Fee
            </Link>
          </Button>
          <Button asChild className="font-bold shadow-lg shadow-primary/20">
            <Link href="/dashboard/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Link>
          </Button>
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
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Briefcase className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="font-medium text-lg text-slate-900 dark:text-white">No services found</p>
                    <p className="text-sm mb-4">You haven't added any services yet.</p>
                    <Button asChild variant="outline">
                      <Link href="/dashboard/services/new">Add Your First Service</Link>
                    </Button>
                  </td>
                </tr>
              ) : (
                services.map((service: any) => (
                  <tr key={service.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {service.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {service.description || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      Le {Number(service.unitPrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        <Activity className="h-3 w-3" />
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button asChild variant="ghost" size="sm" className="font-bold">
                        <Link href={`/dashboard/services/record?serviceId=${service.id}`}>
                          Record Fee
                        </Link>
                      </Button>
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
