"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  User, ShieldCheck, KeyRound, Save, AlertCircle, 
  CheckCircle2, Building, Mail, Shield, UserCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { changePassword } from "@/lib/actions/user";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        current: formData.currentPassword,
        new: formData.newPassword,
      });
      toast.success("Password updated successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-4 md:p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">Account Intelligence</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Manage your identity and security nodes</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* User Profile Info */}
          <Card className="md:col-span-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-[2rem] overflow-hidden">
             <div className="h-24 bg-indigo-600 relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-2xl bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center shadow-lg">
                   <UserCircle className="h-10 w-10 text-indigo-600" />
                </div>
             </div>
             <CardContent className="pt-14 pb-8 text-center space-y-4">
                <div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{session?.user?.name}</h3>
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 text-[10px] font-black uppercase tracking-widest mt-2 border border-indigo-100 dark:border-indigo-900/50">
                      <ShieldCheck className="h-3 w-3" />
                      {session?.user?.role}
                   </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-3 text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Node</span>
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{session?.user?.email}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <Building className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Business Unit</span>
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{session?.user?.businessName}</span>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Security / Password Change */}
          <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-[2rem]">
             <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-2">
                   <KeyRound className="h-5 w-5 text-indigo-500" />
                   <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Security Protocols</CardTitle>
                </div>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Update your access credentials</CardDescription>
             </CardHeader>
             <CardContent className="p-8 pt-4">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Authorization Key</Label>
                      <Input 
                        type="password" 
                        required
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold"
                        placeholder="••••••••"
                      />
                   </div>

                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">New Authorization Key</Label>
                        <Input 
                          type="password" 
                          required
                          value={formData.newPassword}
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                          className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Confirm New Key</Label>
                        <Input 
                          type="password" 
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold"
                          placeholder="••••••••"
                        />
                      </div>
                   </div>

                   <div className="pt-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-slate-400">
                         <AlertCircle className="h-4 w-4" />
                         <span className="text-[9px] font-black uppercase tracking-widest italic leading-tight">Minimum 6 characters required <br/> for secure handshake</span>
                      </div>
                      <Button 
                        disabled={loading}
                        className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                      >
                         {loading ? (
                           <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : (
                           <Save className="h-4 w-4" />
                         )}
                         Update Credentials
                      </Button>
                   </div>
                </form>
             </CardContent>
          </Card>
        </div>

        {/* Status / Activity (Optional) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
           <div className="p-6 rounded-[2rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Shield className="h-6 w-6 text-indigo-400" />
                 </div>
                 <div>
                    <h4 className="text-sm font-black uppercase tracking-widest">Enhanced Identity Protection</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Multi-factor encryption active across all nodes</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic underline underline-offset-4 decoration-2">System Secure</span>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
