"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CheckCircle2, 
  Globe, 
  Package, 
  Truck, 
  BarChart3, 
  MapPin, 
  Calendar, 
  Coins, 
  Languages,
  Clock,
  ArrowRight,
  Info,
  ShieldCheck,
  Zap,
  Box,
  Layout,
  User,
  Compass,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const INDUSTRIES = [
  "Retail", "Wholesale", "Manufacturing", "Logistics", "Distribution", 
  "Electronics", "Apparel & Accessories", "Food & Beverage", "Pharmaceuticals", "Construction"
];

const CURRENCIES = [
  { code: "SLL", name: "Sierra Leonean Leone (Le)" },
  { code: "USD", name: "US Dollar ($)" },
  { code: "GBP", name: "British Pound (£)" },
  { code: "EUR", name: "Euro (€)" },
  { code: "NGN", name: "Nigerian Naira (₦)" }
];

const LANGUAGES = ["English", "French", "Spanish", "Arabic"];

const FISCAL_YEARS = [
  "January - December", "April - March", "July - June", "October - September"
];

const FEATURES = [
  { icon: ShieldCheck, title: "Serial and Batch Tracking", desc: "Track movement from manufacture to sale." },
  { icon: Package, title: "Warehouse Management", desc: "Control stock across multiple locations." },
  { icon: BarChart3, title: "Stock Counts", desc: "Physical inventory reconciliation made easy." },
  { icon: MapPin, title: "Bin Location", desc: "Locate items exactly where they are stored." },
  { icon: Zap, title: "Barcode Generation", desc: "Speed up picking and packing with scans." },
  { icon: Box, title: "Composite Items", desc: "Bundle products for kits and sets." },
  { icon: Layout, title: "Units of Measurement", desc: "Convert units across purchases and sales." },
  { icon: Truck, title: "Picklists", desc: "Streamline the fulfillment process." }
];

export default function SetupOrganizationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    industry: "Retail",
    location: "Sierra Leone",
    province: "",
    address: "",
    currency: "SLL",
    language: "English",
    timezone: "UTC",
    startDate: "2026-05-27",
    fiscalYear: "January - December"
  });

  useEffect(() => {
    if (session?.user?.business?.name) {
      setFormData(prev => ({ ...prev, name: session.user.business.name }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to update organization
    setTimeout(() => {
      setLoading(false);
      setShowWelcomeModal(true);
    }, 1500);
  };

  const handleManualExplore = () => {
    toast.success("Welcome aboard! Enjoy exploring Protech Inventory.");
    router.push("/dashboard");
  };

  const handleStartTour = () => {
    toast.info("Starting your guided tour...");
    // In a real app, this would trigger a tour library like react-joyride
    router.push("/dashboard?tour=true");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      
      {/* Left Column: Form Area */}
      <div className="flex-1 p-8 lg:p-20 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-12">
          
          <div className="space-y-4">
             <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                   <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                   <h1 className="text-sm font-black uppercase tracking-[0.4em] text-indigo-600">Onboarding Node 01</h1>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Configuration</p>
                </div>
             </div>

             <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                  Welcome <span className="text-indigo-600">{session?.user?.name || "User"}</span>
                </h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  Protech Inventory is your end-to-end online order management software.
                </p>
             </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             
             <div className="mb-10">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Set up your organization profile</h3>
                <div className="h-1 w-12 bg-indigo-600 rounded-full mt-4" />
             </div>

             <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* Organizational Details Section */}
                <div className="space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      <span className="text-[10px] font-[1000] uppercase tracking-widest text-slate-400">Organizational Details</span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Organization Name</Label>
                         <Input 
                           value={formData.name} 
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           className="h-14 bg-white rounded-2xl border-slate-100 shadow-sm focus:ring-4 focus:ring-indigo-600/10 font-bold"
                           placeholder="e.g. Tech Enterprise"
                         />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Industry</Label>
                         <Select value={formData.industry} onValueChange={(val) => setFormData({...formData, industry: val})}>
                            <SelectTrigger className="h-14 bg-white rounded-2xl border-slate-100 shadow-sm font-bold">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100">
                               {INDUSTRIES.map(i => <SelectItem key={i} value={i} className="font-bold">{i}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Organization Location</Label>
                         <div className="h-14 bg-white rounded-2xl border-slate-100 shadow-sm flex items-center px-4 gap-3 text-slate-900 font-black">
                            <span className="text-xl">🇸🇱</span> Sierra Leone
                         </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">State/Province</Label>
                         <Input 
                           value={formData.province} 
                           onChange={(e) => setFormData({...formData, province: e.target.value})}
                           className="h-14 bg-white rounded-2xl border-slate-100 shadow-sm focus:ring-4 focus:ring-indigo-600/10 font-bold"
                           placeholder="e.g. Western Area"
                         />
                      </div>
                   </div>

                   <button 
                     type="button"
                     onClick={() => setShowAddress(!showAddress)}
                     className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:underline"
                   >
                      <PlusSquare className="h-4 w-4" /> Add Organization Address
                   </button>
                   
                   <AnimatePresence>
                     {showAddress && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden"
                       >
                         <div className="pt-2">
                            <textarea 
                              className="w-full h-32 bg-white rounded-2xl border-slate-100 shadow-sm p-4 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all"
                              placeholder="Enter full physical address..."
                              value={formData.address}
                              onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                {/* Regional Settings Section */}
                <div className="space-y-8 pt-8 border-t border-slate-100">
                   <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      <span className="text-[10px] font-[1000] uppercase tracking-widest text-slate-400">Regional Settings</span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Currency</Label>
                         <Select value={formData.currency} onValueChange={(val) => setFormData({...formData, currency: val})}>
                            <SelectTrigger className="h-14 bg-white rounded-2xl border-slate-100 shadow-sm font-bold">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100">
                               {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code} className="font-bold">{c.name}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Language</Label>
                         <Select value={formData.language} onValueChange={(val) => setFormData({...formData, language: val})}>
                            <SelectTrigger className="h-14 bg-white rounded-2xl border-slate-100 shadow-sm font-bold">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100">
                               {LANGUAGES.map(l => <SelectItem key={l} value={l} className="font-bold">{l}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Time Zone</Label>
                         <Select value={formData.timezone} onValueChange={(val) => setFormData({...formData, timezone: val})}>
                            <SelectTrigger className="h-14 bg-white rounded-2xl border-slate-100 shadow-sm font-bold">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100">
                               <SelectItem value="UTC" className="font-bold">(UTC+00:00) Casablanca, Monrovia</SelectItem>
                               <SelectItem value="EST" className="font-bold">(UTC-05:00) Eastern Time</SelectItem>
                               <SelectItem value="GMT" className="font-bold">(UTC+00:00) Greenwich Mean Time</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Inventory Start Date</Label>
                         <Input 
                           type="date"
                           value={formData.startDate} 
                           onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                           className="h-14 bg-white rounded-2xl border-slate-100 shadow-sm focus:ring-4 focus:ring-indigo-600/10 font-bold"
                         />
                      </div>
                      <div className="space-y-2 col-span-1 md:col-span-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Fiscal Year</Label>
                         <Select value={formData.fiscalYear} onValueChange={(val) => setFormData({...formData, fiscalYear: val})}>
                            <SelectTrigger className="h-14 bg-white rounded-2xl border-slate-100 shadow-sm font-bold">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100">
                               {FISCAL_YEARS.map(f => <SelectItem key={f} value={f} className="font-bold">{f}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                   </div>

                   <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                      <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Crucial Note</p>
                         <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tighter">
                            The language you select will be the default for email templates, customization, and payment modes even if changed later.
                         </p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-6 pt-10">
                   <div className="flex items-center gap-2 px-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">By continuing, you agree to our</span>
                      <Link href="#" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Privacy Policy</Link>
                   </div>
                   <Button 
                     type="submit" 
                     className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95"
                     disabled={loading}
                   >
                     {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Check out Organization Setup"}
                   </Button>
                </div>
             </form>
          </div>
        </div>
      </div>

      {/* Right Column: Features Sidebar */}
      <div className="w-full lg:w-[450px] bg-slate-900 text-white p-12 lg:p-16 flex flex-col justify-between overflow-y-auto">
         <div className="space-y-16">
            <div className="space-y-8">
               <h2 className="text-2xl font-black tracking-tight uppercase italic leading-tight">Key Features of <br /><span className="text-indigo-400 text-4xl">Protech Inventory!</span></h2>
               <div className="grid grid-cols-1 gap-8">
                  {FEATURES.map((feature, i) => (
                    <div key={i} className="flex gap-5 group">
                       <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                          <feature.icon className="h-6 w-6" />
                       </div>
                       <div>
                          <h4 className="text-[10px] font-[1000] uppercase tracking-[0.2em] text-white mb-1">{feature.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">{feature.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-8 pt-16 border-t border-white/5">
               <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-400 italic">Your Go-To Marketplaces</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">All in One Place!</p>
               </div>
               <div className="grid grid-cols-4 gap-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-white/10 rounded-lg flex items-center justify-center">
                       <Globe className="h-6 w-6" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-8 pt-16 border-t border-white/5">
               <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-400 italic">Reliable Shipping Partners</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Simplify Order Fulfilment</p>
               </div>
               <div className="flex gap-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 w-20 bg-white/10 rounded-lg flex items-center justify-center">
                       <Truck className="h-6 w-6" />
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="mt-20 pt-12 border-t border-white/5 text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Protech Assist Global Marketplace Ecosystem</p>
         </div>
      </div>

      {/* Welcome Board Tour Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-[550px] bg-white rounded-[3rem] border-none p-0 overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)]">
          <div className="relative p-12">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 opacity-60" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2 opacity-40" />
            
            <div className="flex flex-col items-center text-center space-y-8">
               <div className="relative h-28 w-28">
                  <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] rotate-6 opacity-10 animate-pulse" />
                  <div className="relative h-full w-full bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl z-10">
                     <CheckCircle2 className="h-14 w-14 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg z-20">
                     <Zap className="h-5 w-5 fill-current" />
                  </div>
               </div>

               <div className="space-y-4">
                  <h2 className="text-3xl font-[1000] text-slate-900 uppercase tracking-tight italic leading-tight">
                    Welcome aboard <br /> <span className="text-indigo-600">{session?.user?.name || "Explorer"}!</span>
                  </h2>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm mx-auto">
                    Thank you for choosing Protech Inventory. Before you start, we'd love to show you around and help you navigate the app.
                  </p>
               </div>

               <div className="w-full flex flex-col gap-4 pt-4">
                  <Button 
                    onClick={handleStartTour}
                    className="w-full h-18 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95 group"
                  >
                    <Compass className="mr-3 h-5 w-5 group-hover:rotate-45 transition-transform" />
                    Show me around
                  </Button>
                  
                  <button 
                    onClick={handleManualExplore}
                    className="w-full h-14 rounded-2xl border-2 border-slate-100 hover:border-slate-900 text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    No thanks, I'll explore it.
                  </button>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlusSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", props.className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
