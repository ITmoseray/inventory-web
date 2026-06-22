"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Building, Save, Globe, Smartphone, Store, ShieldCheck
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getCurrentBusiness, updateBusiness } from "@/lib/actions/business";
import { ImageUploader } from "@/components/ui/image-uploader";
import { uploadBusinessLogo } from "@/lib/actions/upload";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function BusinessSettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    logoUrl: "",
    type: "",
    plan: ""
  });

  useEffect(() => {
    async function loadBusiness() {
      try {
        const business = await getCurrentBusiness();
        if (business) {
          setFormData({
            name: business.name || "",
            phone: business.phone || "",
            logoUrl: business.logoUrl || "",
            type: business.type || "",
            plan: business.plan || ""
          });
        }
      } catch (error) {
        console.error("Failed to load business details", error);
        toast.error("Failed to load business details");
      } finally {
        setInitialLoading(false);
      }
    }
    loadBusiness();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateBusiness({
        name: formData.name,
        phone: formData.phone,
        logoUrl: formData.logoUrl
      });
      
      if (result.success) {
        toast.success("Business profile updated successfully");
        // Force session update so the sidebar/header reflects the new name/logo immediately if supported
        await update();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update business");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update business");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-4 md:p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">Organization Profile</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Manage your enterprise identity</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/system/settings")} className="h-10 rounded-xl">
             Back to Settings
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Business Info Display */}
          <Card className="md:col-span-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-[2rem] overflow-hidden h-fit">
             <div className="h-24 bg-indigo-600 relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-2xl bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center shadow-lg overflow-hidden">
                   {formData.logoUrl ? (
                     <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                   ) : (
                     <Building className="h-10 w-10 text-indigo-600" />
                   )}
                </div>
             </div>
             <CardContent className="pt-14 pb-8 text-center space-y-4">
                <div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{formData.name || "N/A"}</h3>
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 text-[10px] font-black uppercase tracking-widest mt-2 border border-indigo-100 dark:border-indigo-900/50">
                      <Store className="h-3 w-3" />
                      {formData.type || "BUSINESS"}
                   </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-3 text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <Smartphone className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</span>
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{formData.phone || "Not set"}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <ShieldCheck className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Plan</span>
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formData.plan || "N/A"}</span>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Edit Form */}
          <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-[2rem]">
             <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-2">
                   <Globe className="h-5 w-5 text-indigo-500" />
                   <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Business Details</CardTitle>
                </div>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Update your public facing business information</CardDescription>
             </CardHeader>
             <CardContent className="p-8 pt-4">
                <form onSubmit={handleUpdate} className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Name</Label>
                      <Input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold"
                        placeholder="Company Name"
                      />
                   </div>

                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Phone</Label>
                      <Input 
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold"
                        placeholder="+1 234 567 890"
                      />
                   </div>

                   <div className="space-y-2 pt-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Logo</Label>
                      <ImageUploader 
                        value={formData.logoUrl} 
                        onChange={(url) => setFormData({...formData, logoUrl: url})} 
                        uploadAction={uploadBusinessLogo} 
                        label="Upload Organization Logo"
                      />
                   </div>

                   <div className="pt-8 flex items-center justify-end">
                      <Button 
                        type="submit"
                        disabled={loading}
                        className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                      >
                         {loading ? (
                           <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : (
                           <Save className="h-4 w-4" />
                         )}
                         Save Changes
                      </Button>
                   </div>
                </form>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
