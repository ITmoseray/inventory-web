"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Quote, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  Globe,
  Lock,
  MessageSquare,
  AlertCircle,
  Users,
  MapPin,
  Briefcase,
  Coins,
  Clock,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { registerBusiness, checkUserExists } from "@/lib/actions/auth";
import { getSystemSettings } from "@/lib/actions/system-settings";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/ui/image-uploader";
import { uploadBusinessLogo } from "@/lib/actions/upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SOCIAL_PROOF = [
  {
    quote: "With Protech Inventory, you can actually organize your business and scale without fear.",
    author: "Alpha Sesay",
    role: "Proprietor, Freetown Tech Solutions"
  },
  {
    quote: "The multi-branch control changed how we operate. Real-time tracking is a lifesaver.",
    author: "Aminata Bangura",
    role: "CEO, Eastside Pharmacy"
  }
];

const IMPACT_STATS = [
  { label: "saved in order processing time", value: "1-3 hrs per day", faces: false },
  { label: "reduction in inventory costs", value: "20-30%", faces: true },
  { label: "of manual tasks automated", value: "30-50%", faces: false }
];

const FEATURES = [
  { title: "Track inventory", desc: "Monitor stock, movements, and batches in real-time." },
  { title: "Streamline sales", desc: "Fast POS checkout and automated invoicing." },
  { title: "Oversee locations", desc: "Manage multiple branches from one central dashboard." }
];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [currentProofIndex, setCurrentProofIndex] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: "",
    businessType: "SHOP",
    plan: "FREE",
    logoUrl: "",
    address: "",
    currency: "SLL",
    timezone: "UTC",
  });

  useEffect(() => {
    getSystemSettings()
      .then((settings) => {
        setRegistrationOpen(settings.registrationOpen);
      })
      .catch((err) => {
        console.error("Failed to load registration state", err);
        setRegistrationOpen(true);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentProofIndex((prev) => (prev + 1) % SOCIAL_PROOF.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  if (registrationOpen === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
         <div className="relative h-16 w-16 border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin" />
         <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse">Syncing core registry state...</p>
      </div>
    );
  }

  if (registrationOpen === false) {
    return (
      <div className="flex min-h-screen bg-slate-950 items-center justify-center font-sans p-6 py-12 text-slate-200 relative overflow-y-auto">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
         <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
         
         <div className="max-w-md w-full p-6 sm:p-8 md:p-10 rounded-[2rem] bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-2xl text-center space-y-6 sm:space-y-8 relative overflow-hidden group my-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
            <div className="h-20 w-20 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5 group-hover:scale-105 transition-transform duration-500">
               <Zap className="h-10 w-10 animate-pulse" />
            </div>
            
            <div className="space-y-3">
               <h2 className="text-3xl font-[1000] text-white uppercase italic tracking-tighter">Registration <span className="text-amber-500">Closed</span></h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Invite-Only Mode Active</p>
            </div>
            
            <p className="text-slate-400 font-normal text-sm leading-relaxed">
               New store registrations are currently closed. Please contact the system administrator to get access.
            </p>
            
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-4">
               <a 
                 href="mailto:protechassist36@gmail.com?subject=Enterprise%20Inventory%20OS%20Access%20Request"
                 className="h-12 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center font-bold"
               >
                 Request invite link
               </a>
               <Link 
                 href="/login" 
                 className="h-12 w-full border border-slate-800 hover:bg-white/5 text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center font-bold"
               >
                 Back to Sign In
               </Link>
            </div>
         </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setLoading(true);

    try {
      // Check if email exists first
      const exists = await checkUserExists(formData.email);
      if (exists) {
        setEmailError("An account already exists for this email address. Sign in or use a different email address to sign up.");
        setShowLinkDialog(true);
        setLoading(false);
        return;
      }

      await registerBusiness(formData);
      toast.success("Registration successful! Check your email to verify.", { duration: 15000 });
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white font-sans">
      
      {/* Left Column: Social Proof & Stats */}
      <div className="hidden lg:flex w-[45%] bg-slate-900 text-white relative flex-col justify-between p-12 xl:p-20 overflow-y-auto h-screen sticky top-0">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-4 mb-12 lg:mb-20 group">
             <div className="h-16 w-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-600/40 group-hover:scale-110 transition-transform duration-500">
                <Package className="h-8 w-8" />
             </div>
             <div className="flex flex-col">
                <span className="font-black text-4xl tracking-tighter leading-none">PROTECH <span className="text-indigo-400 italic">ASSIST</span></span>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mt-3 leading-none">ENTERPRISE INVENTORY OS</span>
             </div>
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentProofIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-12"
            >
              <div className="relative">
                <Quote className="h-32 w-32 text-indigo-600/10 absolute -top-16 -left-16" />
                <h2 className="text-5xl lg:text-6xl font-black leading-[0.9] tracking-tight uppercase italic relative z-10 text-white">
                   {SOCIAL_PROOF[currentProofIndex].quote}
                </h2>
              </div>
              
              <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md">

                 <div>
                    <p className="font-black text-2xl tracking-tight text-white">{SOCIAL_PROOF[currentProofIndex].author}</p>
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mt-2">
                      {SOCIAL_PROOF[currentProofIndex].role}
                    </p>
                 </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 space-y-12 mt-12">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-600/20 border border-indigo-600/30">
               <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
               <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-200">
                 Global Intelligence Impact Rate: 75%
               </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {IMPACT_STATS.map((stat, i) => (
                <div key={i} className="flex items-center gap-8 group p-6 rounded-3xl hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/5">
                   <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-indigo-600/30 transition-all group-hover:scale-110 group-hover:rotate-6">
                      {i + 1}
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-center w-full mb-3">
                         <p className="text-4xl font-black tracking-tighter text-white leading-none">{stat.value}</p>
                         {stat.faces && (
                            <div className="flex -space-x-3">
                               {[1,2,3,4,5].map(f => (
                                 <div key={f} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-indigo-600/20 flex items-center justify-center backdrop-blur-sm">
                                    <Users className="h-4 w-4 text-indigo-300" />
                                 </div>
                               ))}
                            </div>
                         )}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-white/10 flex items-center justify-between gap-10 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
             <div className="flex flex-col gap-2">
                <ShieldCheck className="h-6 w-6 text-indigo-400" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">AES-256 SECURE</span>
             </div>
             <div className="flex flex-col gap-2">
                <Zap className="h-6 w-6 text-indigo-400" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">99.9% UPTIME</span>
             </div>
             <div className="flex flex-col gap-2 text-right">
                <Globe className="h-6 w-6 text-indigo-400 ml-auto" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">GLOBAL CLOUD</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex-1 flex flex-col items-center p-8 lg:p-24 bg-slate-50/50 dark:bg-slate-950 min-h-screen relative">
        
        {/* Back Button */}
        <Link href="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
          <Button variant="ghost" className="gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="w-full max-w-md space-y-10 sm:space-y-16 py-12 lg:py-16 my-auto">
          
          <div className="space-y-6">
             <div className="h-1 w-20 bg-indigo-600 rounded-full" />
             <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85]">
                CREATE YOUR <br /> <span className="text-indigo-600">BUSINESS ACCOUNT.</span>
             </h1>
             <p className="text-lg text-slate-500 font-bold tracking-tight">Register your business and get started in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Logo</Label>
              <ImageUploader 
                value={formData.logoUrl} 
                onChange={(url) => setFormData({...formData, logoUrl: url})} 
                uploadAction={uploadBusinessLogo} 
                label="Upload Company Logo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name</Label>
              <div className="relative">
                 <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                 <Input 
                   id="businessName" 
                   placeholder="Enter your business name"
                   value={formData.businessName} 
                   onChange={(e) => setFormData({...formData, businessName: e.target.value})} 
                   required 
                   className="h-14 bg-white dark:bg-slate-900 rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold dark:text-white dark:placeholder:text-slate-500" 
                 />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
              <div className="relative">
                 <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                 <Input 
                   id="email" 
                   type="email" 
                   placeholder="name@company.com"
                   value={formData.email} 
                   onChange={(e) => setFormData({...formData, email: e.target.value})} 
                   required 
                   className={cn(
                     "h-14 bg-white dark:bg-slate-900 rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold dark:text-white dark:placeholder:text-slate-500",
                     emailError && "border-rose-500 focus:ring-rose-600/10"
                   )} 
                 />
                 {emailError && (
                   <div className="mt-2 flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100">
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-rose-700 leading-snug">{emailError}</p>
                   </div>
                 )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</Label>
              <div className="relative">
                 <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                 <Input 
                   id="phone" 
                   type="tel" 
                   placeholder="+232 ..."
                   value={formData.phone} 
                   onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                   required 
                   className="h-14 bg-white dark:bg-slate-900 rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold dark:text-white dark:placeholder:text-slate-500" 
                 />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Address</Label>
              <div className="relative">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                 <Input 
                   id="address" 
                   type="text" 
                   placeholder="123 Business St, City, Country"
                   value={formData.address} 
                   onChange={(e) => setFormData({...formData, address: e.target.value})} 
                   required 
                   className="h-14 bg-white dark:bg-slate-900 rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold dark:text-white dark:placeholder:text-slate-500" 
                 />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Type</Label>
                <div className="relative">
                   <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                   <select 
                     id="businessType" 
                     value={formData.businessType} 
                     onChange={(e) => setFormData({...formData, businessType: e.target.value})} 
                     className="h-14 w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold dark:text-white appearance-none cursor-pointer" 
                   >
                     <option value="SHOP">Retail Shop</option>
                     <option value="PHARMACY">Pharmacy</option>
                     <option value="SUPERMARKET">Supermarket</option>
                     <option value="CLINIC">Clinic</option>
                     <option value="HOSPITAL">Hospital</option>
                     <option value="SCHOOL">School / Educational Institution</option>
                     <option value="BOUTIQUE">Boutique</option>
                     <option value="ELECTRONICS">Electronics</option>
                     <option value="WAREHOUSE">Warehouse</option>
                     <option value="RESTAURANT">Restaurant</option>
                     <option value="BAR">Bar</option>
                     <option value="OFFICE">Corporate Office</option>
                   </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Currency</Label>
                <div className="relative">
                   <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                   <select 
                     id="currency" 
                     value={formData.currency} 
                     onChange={(e) => setFormData({...formData, currency: e.target.value})} 
                     className="h-14 w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold dark:text-white appearance-none cursor-pointer" 
                   >
                     <option value="SLL">SLL (Leone)</option>
                     <option value="USD">USD ($)</option>
                     <option value="EUR">EUR (€)</option>
                     <option value="GBP">GBP (£)</option>
                   </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timezone</Label>
              <div className="relative">
                 <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                 <select 
                   id="timezone" 
                   value={formData.timezone} 
                   onChange={(e) => setFormData({...formData, timezone: e.target.value})} 
                   className="h-14 w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold dark:text-white appearance-none cursor-pointer" 
                 >
                   <option value="UTC">UTC (Universal)</option>
                   <option value="Africa/Freetown">Africa/Freetown (GMT)</option>
                   <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                   <option value="America/New_York">America/New York (EST)</option>
                   <option value="Europe/London">Europe/London (GMT/BST)</option>
                 </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</Label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                 <Input 
                   id="password" 
                   type="password" 
                   placeholder="••••••••"
                   value={formData.password} 
                   onChange={(e) => setFormData({...formData, password: e.target.value})} 
                   required 
                   className="h-14 bg-white dark:bg-slate-900 rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold dark:text-white dark:placeholder:text-slate-500" 
                 />
              </div>
            </div>

            <div className="space-y-6 pt-2">
               <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                     <span className="text-xl">🇸🇱</span>
                     <span className="text-sm font-black text-slate-900 dark:text-white">Sierra Leone</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">US Data Center</span>
               </div>

               <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms} 
                    onCheckedChange={(checked: any) => setAgreedToTerms(checked as boolean)}
                    className="mt-1 rounded-md border-slate-200" 
                  />
                  <Label htmlFor="terms" className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
                    I agree to the <Link href="/terms" target="_blank" className="text-indigo-600 underline underline-offset-4">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="text-indigo-600 underline underline-offset-4">Privacy Policy</Link>.
                  </Label>
               </div>

               <Button 
                 type="submit" 
                 className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                 disabled={loading}
               >
                 {loading ? "Creating System Node..." : "Create Your Account"}
               </Button>
            </div>
          </form>

          <div className="space-y-8">
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                   <span className="bg-slate-50 dark:bg-slate-950 px-4 text-slate-400 dark:text-slate-500">or register with</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <Button 
                  type="button"
                  onClick={() => {
                    if (!agreedToTerms) {
                      toast.error("Please agree to the Terms of Service and Privacy Policy.");
                      return;
                    }
                    if (!formData.businessName.trim() || !formData.phone.trim() || !formData.address.trim()) {
                      toast.error("Please provide your Company Name, Phone, and Address to register with Google.");
                      return;
                    }
                    document.cookie = `registrationData=${encodeURIComponent(JSON.stringify(formData))}; path=/; max-age=3600`;
                    signIn("google", { callbackUrl: "/dashboard" });
                  }}
                  variant="outline" 
                  className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs flex gap-2 dark:text-white dark:hover:bg-slate-900"
                >
                   <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={16} height={16} /> Google
                </Button>
                <Button variant="outline" className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs flex gap-2 dark:text-white dark:hover:bg-slate-900">
                   <Lock className="h-4 w-4 text-slate-400" /> LinkedIn
                </Button>
             </div>

             <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                Already have an account? <Link href="/login" className="text-indigo-600 hover:underline">Log in</Link>
             </p>
          </div>
        </div>
      </div>

      {/* Account Already Exists Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-0 overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)]">
          <div className="relative p-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
            
            <DialogHeader className="mb-8">
               <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-6">
                  <ShieldCheck className="h-8 w-8" />
               </div>
              <DialogTitle className="text-2xl font-[1000] tracking-tight text-slate-900 dark:text-white uppercase italic leading-tight">
                Account Already <span className="text-rose-600">Exists</span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium text-sm mt-4 leading-relaxed">
                We found a <span className="font-black text-slate-900 dark:text-white">Protech account</span> already existing with the email address <span className="text-indigo-600 font-black">{formData.email}</span>.
                <br /><br />
                Do you want to link your Google account with your existing Protech account for faster sign-in?
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
               <Button 
                 onClick={() => router.push(`/login?email=${encodeURIComponent(formData.email)}&link=true`)}
                 className="h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                 Continue to Login
               </Button>
               <Button 
                 variant="outline"
                 onClick={() => setShowLinkDialog(false)}
                 className="h-14 rounded-2xl border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
               >
                 Cancel
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
