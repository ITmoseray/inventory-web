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
  ArrowLeft,
  CheckCircle2, 
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
  Eye,
  EyeOff,
  Sparkles,
  Building2,
  Store,
  Pill,
  Hospital,
  GraduationCap,
  Utensils,
  Check,
  Crown,
  ShoppingCart,
  Tag,
  Cpu,
  Wine,
  Megaphone
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
    quote: "With Protech OS, we organized 5 branch stores and scaled operations effortlessly.",
    author: "Alpha Sesay",
    role: "Proprietor, Freetown Tech Solutions"
  },
  {
    quote: "The automated batch expiry and real-time sales tracking transformed how we run our pharmacy.",
    author: "Aminata Bangura",
    role: "CEO, Eastside Pharmacy"
  },
  {
    quote: "From student fees to report cards, Protech School OS keeps our entire institution in sync.",
    author: "Dr. K. Mansaray",
    role: "Principal, Apex International School"
  }
];

const IMPACT_STATS = [
  { label: "Saved in daily operations", value: "1-3 hrs per day", faces: false },
  { label: "Reduction in inventory leakage", value: "25-35%", faces: true },
  { label: "Manual workflow tasks automated", value: "90%+", faces: false }
];

const BUSINESS_TYPES = [
  { id: "SHOP", label: "Retail Shop", icon: Store, desc: "Inventory & POS checkout" },
  { id: "PHARMACY", label: "Pharmacy", icon: Pill, desc: "Batches & expiry tracking" },
  { id: "SUPERMARKET", label: "Supermarket", icon: ShoppingCart, desc: "Bulk stock & fast cashier" },
  { id: "CLINIC", label: "Clinic", icon: Hospital, desc: "Patients, triage & billing" },
  { id: "HOSPITAL", label: "Hospital", icon: Hospital, desc: "Admissions, lab & pharmacy" },
  { id: "SCHOOL", label: "School / College", icon: GraduationCap, desc: "Students, fees & reports", underDevelopment: true },
  { id: "BOUTIQUE", label: "Boutique", icon: Tag, desc: "Variants, sizes & style" },
  { id: "ELECTRONICS", label: "Electronics", icon: Cpu, desc: "Serials & warranty tracking" },
  { id: "WAREHOUSE", label: "Warehouse", icon: Package, desc: "Multi-bin stock transfers" },
  { id: "RESTAURANT", label: "Restaurant", icon: Utensils, desc: "Tables, kitchen tickets" },
  { id: "BAR", label: "Bar / Lounge", icon: Wine, desc: "Tabs & bottle tracking" },
  { id: "OFFICE", label: "Corporate Office", icon: Building2, desc: "Attendance & check-ins", underDevelopment: true },
];

const STEPS = [
  { id: 1, title: "Identity", desc: "Business & Category" },
  { id: 2, title: "Credentials", desc: "Owner & Access" },
  { id: 3, title: "Configuration", desc: "Region & Plan" },
];

const REFERRAL_OPTIONS = [
  { value: "Google Search", label: "Google / Search Engine" },
  { value: "LinkedIn", label: "LinkedIn Post or Advertisement" },
  { value: "Social Media", label: "Facebook / Instagram / TikTok" },
  { value: "Colleague / Friend", label: "Colleague, Friend, or Partner Referral" },
  { value: "Tech Event / Seminar", label: "Tech Event, Seminar, or Industry Expo" },
  { value: "YouTube / Video Demo", label: "YouTube / Online Video Demo" },
  { value: "News / Article / Blog", label: "News Article, Tech Blog, or Press" },
  { value: "Billboard / Print", label: "Billboard, Flyer, or Print Media" },
  { value: "Other", label: "Other (Type custom source below)" },
];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [currentProofIndex, setCurrentProofIndex] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralSource: "",
    customReferralSource: "",
    businessType: "SHOP",
    institutionType: "",
    plan: "FREE",
    logoUrl: "",
    address: "",
    currency: "SLL",
    timezone: "Africa/Freetown",
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

  // Password strength logic
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const getStrengthColor = (score: number) => {
    if (score <= 25) return "bg-rose-500";
    if (score <= 50) return "bg-amber-500";
    if (score <= 75) return "bg-blue-500";
    return "bg-emerald-500";
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return "";
    if (score <= 25) return "Weak";
    if (score <= 50) return "Fair";
    if (score <= 75) return "Good";
    return "Strong";
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.businessName.trim()) {
        toast.error("Please enter your Company or School name.");
        return false;
      }
      if (formData.businessType === "SCHOOL" && !formData.institutionType) {
        toast.error("Please select an institution level for your school.");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.email.trim() || !formData.email.includes("@")) {
        toast.error("Please enter a valid email address.");
        return false;
      }
      if (!formData.phone.trim()) {
        toast.error("Please enter your contact phone number.");
        return false;
      }
      if (!formData.password || formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match. Please re-enter your password correctly.");
        return false;
      }
      return true;
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  if (registrationOpen === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-6">
         <div className="relative h-16 w-16 border-4 border-slate-200 dark:border-slate-900 border-t-indigo-600 rounded-full animate-spin" />
         <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Syncing core registry state...</p>
      </div>
    );
  }

  if (registrationOpen === false) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center font-sans p-6 py-12 text-slate-900 dark:text-slate-200 relative overflow-y-auto">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30 dark:opacity-20 pointer-events-none" />
         
         <div className="max-w-md w-full p-6 sm:p-8 md:p-10 rounded-[2rem] bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-2xl text-center space-y-6 sm:space-y-8 relative overflow-hidden group my-auto">
            <div className="h-20 w-20 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5 group-hover:scale-105 transition-transform duration-500">
               <Zap className="h-10 w-10 animate-pulse" />
            </div>
            
            <div className="space-y-3">
               <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase italic tracking-tighter">Registration <span className="text-amber-500">Closed</span></h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Invite-Only Mode Active</p>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 font-normal text-sm leading-relaxed">
               New store registrations are currently closed. Please contact the system administrator to get access.
            </p>
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
               <a 
                 href="mailto:protechassist36@gmail.com?subject=Enterprise%20Inventory%20OS%20Access%20Request"
                 className="h-12 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center font-bold"
               >
                 Request invite link
               </a>
               <Link 
                 href="/login" 
                 className="h-12 w-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center font-bold"
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

    if (!validateStep(1) || !validateStep(2)) return;

    if (!formData.address.trim()) {
      toast.error("Please provide your business address.");
      return;
    }

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

  const selectedTypeObj = BUSINESS_TYPES.find(b => b.id === formData.businessType) || BUSINESS_TYPES[0];
  const SelectedIcon = selectedTypeObj.icon;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-300">
      
      {/* Left Column: Social Proof & Live Metrics (Dark Hero Sidebar) */}
      <div className="hidden lg:flex w-[42%] bg-slate-900 dark:bg-slate-900/80 text-white border-r border-slate-800 relative flex-col justify-between p-12 xl:p-16 overflow-y-auto h-screen sticky top-0">
        {/* Glowing background spotlights */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-4 mb-12 group">
             <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/40 group-hover:scale-105 transition-transform duration-300">
                <Package className="h-7 w-7 text-white" />
             </div>
             <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter leading-none text-white">PROTECH <span className="text-indigo-400 italic">ASSIST</span></span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2 leading-none">ENTERPRISE INVENTORY OS</span>
             </div>
          </Link>

          {/* Social Proof Carousel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProofIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="relative">
                <Quote className="h-24 w-24 text-indigo-500/10 absolute -top-12 -left-10" />
                <h2 className="text-3xl xl:text-4xl font-black leading-tight tracking-tight uppercase italic relative z-10 text-white">
                   "{SOCIAL_PROOF[currentProofIndex].quote}"
                </h2>
              </div>
              
              <div className="flex items-center gap-5 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
                 <div className="h-10 w-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-black">
                   {SOCIAL_PROOF[currentProofIndex].author.charAt(0)}
                 </div>
                 <div>
                    <p className="font-black text-lg text-white leading-tight">{SOCIAL_PROOF[currentProofIndex].author}</p>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                      {SOCIAL_PROOF[currentProofIndex].role}
                    </p>
                 </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live Workspace Interactive Card Preview */}
        <div className="relative z-10 space-y-8 my-8">
           <div className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                       <SelectedIcon className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-white uppercase tracking-wider">{formData.businessName || "Your Business Name"}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedTypeObj.label} • {formData.currency}</p>
                    </div>
                 </div>
                 <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Config
                 </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                 <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Selected Plan</p>
                    <p className="text-[10px] font-black text-indigo-400 uppercase mt-0.5">{formData.plan === 'FREE' ? '14-Day Trial' : 'Enterprise'}</p>
                 </div>
                 <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Region</p>
                    <p className="text-[10px] font-black text-white uppercase mt-0.5">{formData.timezone.split('/')[1] || 'Freetown'}</p>
                 </div>
                 <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Modules</p>
                    <p className="text-[10px] font-black text-emerald-400 uppercase mt-0.5">POS + AI</p>
                 </div>
              </div>
           </div>

           {/* Metrics List */}
           <div className="grid grid-cols-1 gap-3.5">
              {IMPACT_STATS.map((stat, i) => (
                <div key={i} className="flex items-center gap-5 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                   <div className="h-10 w-10 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-black text-sm">
                      0{i + 1}
                   </div>
                   <div>
                      <p className="text-xl font-black tracking-tight text-white leading-none">{stat.value}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Footer Security Badges */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
           <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span className="text-[9px] font-black uppercase tracking-wider">256-Bit Encrypted</span>
           </div>
           <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span className="text-[9px] font-black uppercase tracking-wider">Instant Setup</span>
           </div>
           <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-400" />
              <span className="text-[9px] font-black uppercase tracking-wider">Cloud Sync</span>
           </div>
        </div>
      </div>

      {/* Right Column: Interactive Multi-Step Registration (Light & Dark Friendly) */}
      <div className="flex-1 flex flex-col items-center justify-between p-6 sm:p-12 lg:p-16 min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-y-auto">
        
        {/* Top Header Navigation */}
        <div className="w-full max-w-xl flex items-center justify-between mb-8">
           <Link href="/">
             <Button variant="ghost" className="gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
               <ArrowLeft className="h-4 w-4" />
               Home
             </Button>
           </Link>
           <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
             Already registered? <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-black">Sign In</Link>
           </p>
        </div>

        <div className="w-full max-w-xl my-auto space-y-8">
          
          {/* Main Title Banner */}
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" />
                Multi-Tenant Enterprise Node Registration
             </div>
             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-[0.9]">
                CREATE YOUR <br />
                <span className="text-indigo-600 dark:text-indigo-500">
                  {formData.businessType === 'SCHOOL' ? 'SCHOOL PORTAL.' : 'BUSINESS ACCOUNT.'}
                </span>
             </h1>
             <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
               Configure your organization workspace in seconds.
             </p>
          </div>

          {/* Wizard Step Navigation Indicator */}
          <div className="grid grid-cols-3 gap-3">
             {STEPS.map((step) => {
               const isActive = currentStep === step.id;
               const isCompleted = currentStep > step.id;
               return (
                 <button
                   key={step.id}
                   type="button"
                   onClick={() => {
                     if (isCompleted || step.id === currentStep) {
                       setCurrentStep(step.id);
                     }
                   }}
                   className={cn(
                     "p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between",
                     isActive ? "bg-white dark:bg-indigo-600/10 border-indigo-600 dark:border-indigo-500/60 shadow-lg shadow-indigo-600/10" :
                     isCompleted ? "bg-slate-100 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300" :
                     "bg-slate-100/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                   )}
                 >
                   <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                        isActive ? "bg-indigo-600 text-white" : isCompleted ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      )}>
                        Step 0{step.id}
                      </span>
                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                   </div>
                   <div className="mt-3">
                      <p className={cn("text-xs font-black uppercase tracking-wider", isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>{step.title}</p>
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{step.desc}</p>
                   </div>
                 </button>
               );
             })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
             <AnimatePresence mode="wait">
                
                {/* STEP 1: BUSINESS IDENTITY */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                     <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none backdrop-blur-xl space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            {formData.businessType === 'SCHOOL' ? 'School Crest / Logo' : 'Company Logo'}
                          </Label>
                          <ImageUploader 
                            value={formData.logoUrl} 
                            onChange={(url) => setFormData({...formData, logoUrl: url})} 
                            uploadAction={uploadBusinessLogo} 
                            label={formData.businessType === 'SCHOOL' ? 'Upload School Crest' : 'Upload Company Logo'}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="businessName" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            {formData.businessType === 'SCHOOL' ? 'School / Institution Name *' : 'Company Name *'}
                          </Label>
                          <div className="relative">
                             <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input 
                               id="businessName" 
                               placeholder={formData.businessType === 'SCHOOL' ? 'e.g. Freetown Academy' : 'e.g. Apex Enterprise Ltd'}
                               value={formData.businessName} 
                               onChange={(e) => setFormData({...formData, businessName: e.target.value})} 
                               required 
                               className="h-14 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                             />
                          </div>
                        </div>

                        {/* Industry / Business Type Grid Selector */}
                        <div className="space-y-3">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Select Industry Type</Label>
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {BUSINESS_TYPES.map((bt: any) => {
                                const Icon = bt.icon;
                                const isSelected = formData.businessType === bt.id;
                                return (
                                  <button
                                    key={bt.id}
                                    type="button"
                                    onClick={() => {
                                      setFormData({...formData, businessType: bt.id});
                                      if (bt.underDevelopment) {
                                        toast.info(`${bt.label} is under active development. Early Access Preview is enabled.`, { duration: 4000 });
                                      }
                                    }}
                                    className={cn(
                                      "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between group relative overflow-hidden",
                                      isSelected 
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30 scale-[1.02]" 
                                        : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/60"
                                    )}
                                  >
                                     <div className="flex justify-between items-start w-full">
                                        <Icon className={cn("h-5 w-5 mb-2", isSelected ? "text-white" : "text-indigo-600 dark:text-indigo-400")} />
                                        {bt.underDevelopment && (
                                           <span className={cn(
                                              "text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                                              isSelected ? "bg-amber-400 text-slate-950" : "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                                           )}>
                                              Dev Preview
                                           </span>
                                        )}
                                     </div>
                                     <div>
                                        <p className="text-[11px] font-black uppercase tracking-wider leading-tight">{bt.label}</p>
                                        <p className={cn("text-[9px] mt-0.5 line-clamp-1 font-medium", isSelected ? "text-indigo-100" : "text-slate-500 dark:text-slate-400")}>{bt.desc}</p>
                                     </div>
                                  </button>
                                );
                              })}
                           </div>

                           {(formData.businessType === 'SCHOOL' || formData.businessType === 'OFFICE') && (
                              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-900 dark:text-amber-300 mt-3">
                                 <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                                 <p className="text-[11px] font-bold leading-tight">
                                    <span className="font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Notice:</span> {selectedTypeObj.label} module is under active development. Access is enabled in Early Access Preview mode until development is fully completed.
                                 </p>
                              </div>
                           )}
                        </div>

                        {/* School Sub-Level */}
                        {formData.businessType === 'SCHOOL' && (
                          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                             <Label htmlFor="institutionType" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Select School Level *</Label>
                             <div className="relative">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <select 
                                  id="institutionType" 
                                  value={formData.institutionType} 
                                  onChange={(e) => setFormData({...formData, institutionType: e.target.value})} 
                                  required
                                  className="h-14 w-full bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-bold appearance-none cursor-pointer" 
                                >
                                  <option value="">Select Level</option>
                                  <option value="PRIMARY_SECONDARY">Primary / Secondary School</option>
                                  <option value="UNIVERSITY_COLLEGE">University / College</option>
                                  <option value="NURSING_MEDICAL">Nursing / Medical Institute</option>
                                  <option value="TRAINING_INSTITUTE">Vocational / Training Institute</option>
                                  <option value="OTHER">Other Educational Institute</option>
                                </select>
                             </div>
                          </div>
                        )}
                     </div>

                     <Button 
                       type="button" 
                       onClick={nextStep}
                       className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                     >
                       Continue to Credentials
                       <ArrowRight className="h-4 w-4" />
                     </Button>
                  </motion.div>
                )}

                {/* STEP 2: CREDENTIALS */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                     <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none backdrop-blur-xl space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Work Email Address *</Label>
                          <div className="relative">
                             <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input 
                               id="email" 
                               type="email" 
                               placeholder="owner@company.com"
                               value={formData.email} 
                               onChange={(e) => setFormData({...formData, email: e.target.value})} 
                               required 
                               className={cn(
                                 "h-14 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500",
                                 emailError && "border-rose-500 focus:ring-rose-500/20"
                               )} 
                             />
                          </div>
                          {emailError && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                               <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                               <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300 leading-snug">{emailError}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Phone Number *</Label>
                          <div className="relative">
                             <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input 
                               id="phone" 
                               type="tel" 
                               placeholder="+232 76 000 000"
                               value={formData.phone} 
                               onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                               required 
                               className="h-14 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                             />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                             <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Password *</Label>
                             {passwordStrength > 0 && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                  Strength: {getStrengthText(passwordStrength)}
                                </span>
                             )}
                          </div>
                          <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input 
                               id="password" 
                               type={showPassword ? "text" : "password"} 
                               placeholder="••••••••"
                               value={formData.password} 
                               onChange={(e) => setFormData({...formData, password: e.target.value})} 
                               required 
                               className="h-14 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm pl-12 pr-12 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                             />
                             <button
                               type="button"
                               onClick={() => setShowPassword(!showPassword)}
                               className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                             >
                               {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                             </button>
                          </div>

                          {/* Password Strength Meter Bar */}
                          {formData.password && (
                            <div className="space-y-1 pt-1">
                               <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full transition-all duration-300", getStrengthColor(passwordStrength))} 
                                    style={{ width: `${passwordStrength}%` }}
                                  />
                               </div>
                            </div>
                          )}
                        </div>

                        {/* Re-enter Password (Confirm Password) */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                             <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Re-enter Password *</Label>
                             {formData.confirmPassword && (
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-widest",
                                  formData.password === formData.confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                )}>
                                  {formData.password === formData.confirmPassword ? "✓ Passwords Match" : "✕ Passwords Do Not Match"}
                                </span>
                             )}
                          </div>
                          <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input 
                               id="confirmPassword" 
                               type={showConfirmPassword ? "text" : "password"} 
                               placeholder="Re-type password to verify"
                               value={formData.confirmPassword} 
                               onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                               required 
                               className={cn(
                                 "h-14 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm pl-12 pr-12 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500",
                                 formData.confirmPassword && formData.password !== formData.confirmPassword && "border-rose-500 focus:ring-rose-500/20",
                                 formData.confirmPassword && formData.password === formData.confirmPassword && "border-emerald-500 focus:ring-emerald-500/20"
                               )} 
                             />
                             <button
                               type="button"
                               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                               className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                             >
                               {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                             </button>
                          </div>
                        </div>

                        {/* How Did You Hear About Us Dropdown & Custom Text Field */}
                        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                          <Label htmlFor="referralSource" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">How did you hear about us?</Label>
                          <div className="relative">
                             <Megaphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <select 
                               id="referralSource" 
                               value={formData.referralSource} 
                               onChange={(e) => setFormData({...formData, referralSource: e.target.value})} 
                               className="h-14 w-full bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-bold appearance-none cursor-pointer" 
                             >
                               <option value="">-- Select Option --</option>
                               {REFERRAL_OPTIONS.map((opt) => (
                                 <option key={opt.value} value={opt.value}>{opt.label}</option>
                               ))}
                             </select>
                          </div>

                          {/* Custom Referral Source Text Input */}
                          {(formData.referralSource === "Other" || formData.referralSource !== "") && (
                             <div className="space-y-1.5 pt-1">
                                <Label htmlFor="customReferralSource" className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                   {formData.referralSource === "Other" ? "Specify Referral Source *" : "Additional Details / Specific Name (Optional)"}
                                </Label>
                                <div className="relative">
                                   <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                   <Input 
                                     id="customReferralSource"
                                     placeholder={formData.referralSource === "Other" ? "Type how you heard about us..." : "e.g. Recommended by Alpha Tech Solutions, specific event, etc."}
                                     value={formData.customReferralSource}
                                     onChange={(e) => setFormData({...formData, customReferralSource: e.target.value})}
                                     className="h-13 bg-slate-50 dark:bg-slate-950/80 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm pl-12 text-slate-900 dark:text-white text-xs font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                   />
                                </div>
                             </div>
                          )}
                        </div>
                     </div>

                     <div className="flex gap-3">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={prevStep}
                          className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 font-black text-xs uppercase tracking-widest px-6"
                        >
                          Back
                        </Button>
                        <Button 
                          type="button" 
                          onClick={nextStep}
                          className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                        >
                          Continue to Configuration
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                     </div>
                  </motion.div>
                )}

                {/* STEP 3: CONFIGURATION & PLAN */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                     <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none backdrop-blur-xl space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Business Physical Address *</Label>
                          <div className="relative">
                             <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input 
                               id="address" 
                               type="text" 
                               placeholder="e.g. 15 Wilkinson Road, Freetown"
                               value={formData.address} 
                               onChange={(e) => setFormData({...formData, address: e.target.value})} 
                               required 
                               className="h-14 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                             />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currency" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Base Currency</Label>
                            <div className="relative">
                               <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                               <select 
                                 id="currency" 
                                 value={formData.currency} 
                                 onChange={(e) => setFormData({...formData, currency: e.target.value})} 
                                 className="h-14 w-full bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-bold appearance-none cursor-pointer" 
                               >
                                 <option value="SLL">SLL (Leone)</option>
                                 <option value="USD">USD ($)</option>
                                 <option value="EUR">EUR (€)</option>
                                 <option value="GBP">GBP (£)</option>
                               </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="timezone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Timezone</Label>
                            <div className="relative">
                               <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                               <select 
                                 id="timezone" 
                                 value={formData.timezone} 
                                 onChange={(e) => setFormData({...formData, timezone: e.target.value})} 
                                 className="h-14 w-full bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm pl-12 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-bold appearance-none cursor-pointer" 
                               >
                                 <option value="Africa/Freetown">Africa/Freetown (GMT)</option>
                                 <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                                 <option value="UTC">UTC (Universal)</option>
                                 <option value="America/New_York">America/New York (EST)</option>
                                 <option value="Europe/London">Europe/London (GMT/BST)</option>
                               </select>
                            </div>
                          </div>
                        </div>

                        {/* Plan Card Selector */}
                        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Select Access Plan</Label>
                           <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => setFormData({...formData, plan: "FREE"})}
                                className={cn(
                                  "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between relative",
                                  formData.plan === "FREE"
                                    ? "bg-indigo-50 dark:bg-indigo-600/10 border-indigo-600 dark:border-indigo-500 text-slate-900 dark:text-white shadow-md shadow-indigo-600/10"
                                    : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                                )}
                              >
                                 <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">14-Day Free Trial</span>
                                    {formData.plan === "FREE" && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                                 </div>
                                 <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Starter Node</p>
                                 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Full access to core POS, Inventory & AI stats.</p>
                              </button>

                              <button
                                type="button"
                                onClick={() => setFormData({...formData, plan: "ENTERPRISE"})}
                                className={cn(
                                  "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between relative",
                                  formData.plan === "ENTERPRISE"
                                    ? "bg-indigo-50 dark:bg-indigo-600/10 border-indigo-600 dark:border-indigo-500 text-slate-900 dark:text-white shadow-md shadow-indigo-600/10"
                                    : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                                )}
                              >
                                 <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                      <Crown className="h-3 w-3" /> Pro Enterprise
                                    </span>
                                    {formData.plan === "ENTERPRISE" && <Check className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                                 </div>
                                 <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Multi-Branch Node</p>
                                 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Unlimited branches, priority sync & custom domains.</p>
                              </button>
                           </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start space-x-3 pt-2">
                           <Checkbox 
                             id="terms" 
                             checked={agreedToTerms} 
                             onCheckedChange={(checked: any) => setAgreedToTerms(checked as boolean)}
                             className="mt-1 rounded-md border-slate-300 dark:border-slate-700 data-[state=checked]:bg-indigo-600" 
                           />
                           <Label htmlFor="terms" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-tighter">
                             I agree to the <Link href="/terms" target="_blank" className="text-indigo-600 dark:text-indigo-400 underline underline-offset-4">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="text-indigo-600 dark:text-indigo-400 underline underline-offset-4">Privacy Policy</Link>.
                           </Label>
                        </div>
                     </div>

                     <div className="flex gap-3">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={prevStep}
                          className="h-16 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 font-black text-xs uppercase tracking-widest px-6"
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={loading}
                          className="flex-1 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                        >
                          {loading ? (
                             <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Provisioning Business Node...</span>
                             </div>
                          ) : (
                             <>
                               <span>Create Your Account</span>
                               <ArrowRight className="h-4 w-4" />
                             </>
                          )}
                        </Button>
                     </div>
                  </motion.div>
                )}

             </AnimatePresence>
          </form>

          {/* Social Auth Separator */}
          <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800/60">
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                   <span className="bg-slate-50 dark:bg-slate-950 px-4 text-slate-400 dark:text-slate-500">or sign up with single sign-on</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <Button 
                  type="button"
                  onClick={() => {
                    if (!agreedToTerms) {
                      toast.error("Please agree to the Terms of Service and Privacy Policy.");
                      return;
                    }
                    if (!formData.businessName.trim() || !formData.phone.trim() || !formData.address.trim()) {
                      toast.error("Please provide your Company Name, Phone, and Address before Google sign-up.");
                      return;
                    }
                    document.cookie = `registrationData=${encodeURIComponent(JSON.stringify(formData))}; path=/; max-age=3600`;
                    signIn("google", { callbackUrl: "/dashboard" });
                  }}
                  variant="outline" 
                  className="h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 font-bold text-xs flex gap-2.5 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                >
                   <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={18} height={18} /> Google Workspace
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 font-bold text-xs flex gap-2.5 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                  onClick={() => toast.info("LinkedIn SSO integration coming soon.")}
                >
                   <Lock className="h-4 w-4 text-slate-400" /> LinkedIn SSO
                </Button>
             </div>
          </div>

        </div>

        <div className="w-full max-w-xl pt-8 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">
             PROTECH ASSIST OS • SECURE ENTERPRISE CLOUD • SIERRA LEONE & GLOBAL
           </p>
        </div>

      </div>

      {/* Account Already Exists Modal */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-2xl text-slate-900 dark:text-slate-100">
          <div className="relative p-8 sm:p-10 space-y-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
            
            <DialogHeader className="space-y-4">
               <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ShieldCheck className="h-7 w-7" />
               </div>
              <DialogTitle className="text-2xl font-[1000] tracking-tight text-slate-900 dark:text-white uppercase italic leading-tight">
                Account Already <span className="text-rose-600 dark:text-rose-500">Exists</span>
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed">
                An account already exists for <span className="text-indigo-600 dark:text-indigo-400 font-black">{formData.email}</span>.
                <br /><br />
                Would you like to log in to your existing account now?
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 pt-2">
               <Button 
                 onClick={() => router.push(`/login?email=${encodeURIComponent(formData.email)}&link=true`)}
                 className="h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl transition-all"
               >
                 Continue to Login
               </Button>
               <Button 
                 variant="outline"
                 onClick={() => setShowLinkDialog(false)}
                 className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 dark:hover:text-white transition-all"
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
