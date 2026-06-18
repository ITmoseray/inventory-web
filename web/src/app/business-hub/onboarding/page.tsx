"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Building2, Package, CreditCard, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBusiness } from "@/components/providers/business-provider";
import { createBusiness } from "@/lib/actions/business-registration";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BusinessOnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { setActiveBusinessId } = useBusiness();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", type: "SHOP", description: ""
  });

  const handleCreateBusiness = async () => {
    setLoading(true);
    const result = await createBusiness(formData);
    setLoading(false);
    if (result.success) {
      toast.success("Business created!");
      setActiveBusinessId(result.businessId || null);
      setStep(2);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <header className="mb-12 max-w-2xl mx-auto">
        <Link href="/business-hub" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 mb-4 block">← Back to Gateway</Link>
        <h1 className="text-4xl font-black tracking-tight">Business Setup <span className="text-indigo-600">Onboarding</span></h1>
      </header>

      <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
        {step === 1 && (
            <div className="space-y-6">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Building2 className="text-indigo-600" /> Step 1: Business Profile</h2>
                <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter your business name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" placeholder="business@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+232 XX XXXXXX" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Freetown, Sierra Leone" />
                </div>
                <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select onValueChange={v => setFormData({...formData, type: v})} value={formData.type}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SHOP">Retail Shop</SelectItem>
                            <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                            <SelectItem value="PHARMACY">Pharmacy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Briefly describe your business..." />
                </div>
                <button onClick={handleCreateBusiness} disabled={loading} className="w-full h-14 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                    {loading ? <Loader2 className="animate-spin" /> : <>Next <ArrowRight /></>}
                </button>
            </div>
        )}
        {step === 2 && (
            <div className="space-y-6 text-center">
                <h2 className="text-2xl font-black">Business Created!</h2>
                <p>Now, let's configure your inventory and marketplace settings.</p>
                <button onClick={() => router.push("/business-hub/dashboard")} className="w-full h-14 bg-indigo-600 text-white rounded-xl font-bold">Go to Dashboard</button>
            </div>
        )}
      </div>
    </div>
  );
}
