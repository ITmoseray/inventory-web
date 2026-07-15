"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getServices, recordServiceFee } from "@/lib/actions/services";
import { getCustomers } from "@/lib/actions/customer";
import { getUsers } from "@/lib/actions/user";
import { Briefcase, ArrowLeft, Loader2, DollarSign, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

function RecordFeeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get("serviceId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    serviceId: initialServiceId || "",
    amount: "",
    paymentMethod: "CASH",
    customerId: "walk-in",
    staffId: "none",
    staffName: ""
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, customersData, staffData] = await Promise.all([
          getServices(),
          getCustomers(),
          getUsers()
        ]);
        setServices(servicesData);
        setCustomers(customersData);
        setStaff(staffData);
        
        // If a service was pre-selected, auto-fill its price
        if (initialServiceId) {
          const s = servicesData.find((x: any) => x.id === initialServiceId);
          if (s) setFormData(prev => ({ ...prev, amount: s.unitPrice.toString() }));
        }
      } catch (error) {
        toast.error("Failed to load services");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [initialServiceId]);

  const handleServiceChange = (val: string) => {
    const s = services.find((x: any) => x.id === val);
    setFormData(prev => ({ 
      ...prev, 
      serviceId: val,
      amount: s ? s.unitPrice.toString() : prev.amount
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceId || !formData.amount) {
      return toast.error("Service and Amount are required.");
    }
    
    setIsSubmitting(true);
    try {
      const res = await recordServiceFee({
        serviceId: formData.serviceId,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        customerId: formData.customerId === "walk-in" ? undefined : formData.customerId,
        staffId: formData.staffId === "none" ? undefined : formData.staffId,
        staffName: formData.staffName.trim() || undefined
      });
      
      if (res.success) {
        toast.success("Fee recorded successfully! Invoice generated.");
        router.push(`/dashboard/sales/history`);
      } else {
        toast.error(res.error || "Failed to record fee");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
      <div className="space-y-4">
        
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Select Service <span className="text-rose-500">*</span></Label>
          <Select value={formData.serviceId} onValueChange={handleServiceChange} required>
            <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-bold">
              <SelectValue placeholder="Choose a service..." />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name} (Le {Number(s.unitPrice).toLocaleString()})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Amount Charged (Le) <span className="text-rose-500">*</span></Label>
            <Input 
              type="number"
              min="0"
              step="0.01"
              className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-bold text-emerald-600 dark:text-emerald-400 text-lg"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Payment Method <span className="text-rose-500">*</span></Label>
            <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({...formData, paymentMethod: v})}>
              <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card / POS</SelectItem>
                <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 block">Customer (Optional)</Label>
            <Select value={formData.customerId} onValueChange={(v) => setFormData({...formData, customerId: v})}>
              <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">Walk-in Customer (None)</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 block">Staff / Employee Assigned (Optional)</Label>
            <Select value={formData.staffId} onValueChange={(v) => setFormData({...formData, staffId: v})}>
              <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not Assigned</SelectItem>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.role?.name || "Staff"})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Manual staff name override */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-500 block">Or Type Staff Name Manually (Optional)</Label>
          <Input
            type="text"
            placeholder="e.g. John Kamara, Ahmed Conteh..."
            className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
            value={formData.staffName}
            onChange={(e) => setFormData({...formData, staffName: e.target.value})}
          />
          <p className="text-[10px] text-slate-400 font-medium">Use this if the staff member is not in the system yet.</p>
        </div>

      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
        <Button 
          type="button" 
          variant="ghost" 
          className="font-bold"
          onClick={() => router.push("/dashboard/services")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.serviceId} className="font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Complete Sale</>}
        </Button>
      </div>
    </form>
  );
}

export default function RecordServiceFeePage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => router.push("/dashboard/services")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-[1000] tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="h-8 w-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            Record Service Fee
          </h1>
          <p className="text-sm text-slate-500 font-medium">Quickly log a completed service and generate a sale record</p>
        </div>
      </div>

      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <RecordFeeForm />
      </Suspense>
    </div>
  );
}
