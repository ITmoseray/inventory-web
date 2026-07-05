"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Store, 
  PlusSquare, 
  Lock,
  Globe,
  BarChart3,
  Shield,
  Layers,
  ShoppingCart,
  TrendingUp,
  Box,
  Truck,
  Users,
  HardHat,
  GraduationCap,
  Building2,
  Check,
  Star,
  AlertCircle,
  Heart,
  Clock,
  ChevronRight,
  Code2,
  Laptop,
  Database,
  Network,
  Cloud,
  Wrench,
  Palette,
  MessageSquare,
  Search,
  CheckCircle2, 
  Headphones,
  ExternalLink,
  Utensils,
  Quote
  } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { PricingSection } from "@/components/shared/pricing-section";
import { ExpertPopup } from "@/components/shared/expert-popup";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProtechCloudHomepage() {
  const { data: session } = useSession();
  const containerRef = useRef(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const words = ["Enterprise OS.", "Retail Engine.", "Wholesale Hub.", "Logistics Core."];

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length - 1));
        if (currentText.length === 0) {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }, 50); // Fast delete speed
    } else {
      timeout = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length + 1));
        if (currentText.length === currentWord.length) {
          timeout = setTimeout(() => setIsDeleting(true), 2500); // Pause reading time
        }
      }, 100); // Typing speed
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words]);

  const hasUsedTrial = !!session?.user?.trialEndDate;
  const isTrialExpired = hasUsedTrial && new Date(session?.user?.trialEndDate || 0) < new Date();

  const ctaText = isTrialExpired || hasUsedTrial ? "Upgrade Now" : "Start Free Trial";
  const ctaHref = isTrialExpired || hasUsedTrial ? "/pricing" : "/register";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 }
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 selection:bg-indigo-650/10 dark:selection:bg-indigo-600/30 selection:text-indigo-600 dark:selection:text-white overflow-x-hidden font-sans relative">
      
      {/* Intense Neon Background ambient mesh gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 dark:bg-indigo-500/30 rounded-full blur-[140px] -z-20 translate-x-1/3 -translate-y-1/3 pointer-events-none animate-pulse" />
      <div className="absolute top-[400px] left-0 w-[600px] h-[600px] bg-purple-50/50 dark:bg-purple-500/20 rounded-full blur-[130px] -z-20 -translate-x-1/4 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[1200px] right-1/4 w-[700px] h-[700px] bg-fuchsia-50/30 dark:bg-fuchsia-500/20 rounded-full blur-[150px] -z-20 pointer-events-none animate-pulse" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-[200px] left-1/4 w-[600px] h-[600px] bg-emerald-50/30 dark:bg-cyan-500/20 rounded-full blur-[130px] -z-20 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Glowing dot grid pattern backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-70 dark:opacity-[0.12] -z-10 pointer-events-none" />

      {/* 1. Global Navigation */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-[100] transition-all duration-300">
        <nav className="w-full px-6 lg:px-12 h-20 flex items-center bg-white/85 dark:bg-slate-950/70 backdrop-blur-xl border border-slate-200 dark:border-slate-900 rounded-2xl shadow-2xl">
          <Link className="flex items-center gap-3 group" href="/">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 group-hover:scale-105 transition-transform bg-white">
              <Image src="/images/logo.jpeg" alt="Protech Logo" fill sizes="40px" className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white leading-none">
                Protech <span className="text-indigo-600 dark:text-indigo-400 italic">Assist</span>
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 leading-none mt-1.5">
                Enterprise Inventory OS
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 ml-16">
            {["Features", "Solutions", "Services", "Pricing", "Security"].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                {item}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-6">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Login
            </Link>
            <Link 
              href={ctaHref} 
              className="h-10 px-6 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 dark:shadow-indigo-600/20 hover:shadow-slate-900/20 dark:hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center font-bold"
            >
              {ctaText}
            </Link>
          </div>
        </nav>
      </div>

      <main className="flex-1 pt-28 lg:pt-36">
        
        {/* 2. Hero Section: Africa's Smartest Platform */}
        <section className="relative pb-24 lg:pb-40 overflow-hidden">
          <div className="container px-6 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col text-left"
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 dark:border-indigo-500/30 bg-slate-50 dark:bg-indigo-500/10 text-slate-800 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em] mb-8 w-fit backdrop-blur-sm">
                   Trusted by Businesses Across Sierra Leone
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-[1000] tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-8 uppercase dark:drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                   Africa's Most <br /> Advanced <br />
                   <div className="min-h-[2.5em] md:min-h-[1.2em] relative flex flex-wrap items-center">
                       <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-400 bg-clip-text text-transparent italic dark:drop-shadow-[0_0_25px_rgba(168,85,247,0.8)]">
                         {currentText}
                       </span>
                       <span className="text-indigo-600 dark:text-cyan-400 animate-[pulse_0.8s_ease-in-out_infinite] font-mono ml-1 -translate-y-1 inline-block leading-none">_</span>
                   </div>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed mb-10 font-normal">
                  Designed by Protech Assist (SL) Limited to provide mission-critical intelligence for retail, wholesale, and distribution enterprises across the continent.
                </motion.p>
                
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-16">
                  <Link 
                    href={ctaHref} 
                    className="h-16 px-10 text-xs font-black uppercase tracking-[0.2em] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 dark:shadow-[0_0_30px_rgba(99,102,241,0.6)] dark:hover:shadow-[0_0_50px_rgba(99,102,241,0.9)] dark:border dark:border-indigo-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center group font-bold"
                  >
                    {ctaText}
                    <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button 
                    onClick={() => setIsDemoModalOpen(true)}
                    className="h-16 px-10 text-xs font-black uppercase tracking-[0.2em] border border-slate-200 dark:border-cyan-500/50 bg-white dark:bg-cyan-950/30 hover:border-slate-900 dark:hover:border-cyan-400 dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] text-slate-900 dark:text-cyan-50 rounded-xl transition-all flex items-center justify-center font-bold"
                  >
                    Book a Live Demo
                  </button>
                </motion.div>

              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative hidden lg:block"
              >
                 <div className="relative bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-indigo-500/50 shadow-2xl dark:shadow-[0_0_80px_rgba(99,102,241,0.4)] overflow-hidden aspect-[16/11] z-20 group">
                    <Image src="/images/dashboard-preview-2.png" alt="Dashboard" fill className="object-cover transition-transform duration-1000 group-hover:scale-102" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/10 to-transparent pointer-events-none" />
                 </div>
                 {/* Decorative Glowing Rings */}
                 <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                 <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10" />
              </motion.div>
            </div>
            
            {/* Infinite Scrolling Neon Marquee */}
            <div className="mt-24 lg:mt-32 w-full overflow-hidden relative">
               <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-black to-transparent z-10 pointer-events-none" />
               <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-black to-transparent z-10 pointer-events-none" />
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 text-center mb-8">Trusted by industry leaders in</p>
               <motion.div 
                 animate={{ x: ["0%", "-50%"] }} 
                 transition={{ ease: "linear", duration: 120, repeat: Infinity }} 
                 className="flex whitespace-nowrap items-center w-max"
               >
                 {[...Array(2)].map((_, idx) => (
                   <div key={idx} className="flex gap-16 pr-16 items-center">
                      {["Retail", "Supermarkets", "Pharmacies", "Bars & Restaurants", "Wholesale", "Hardware", "Distribution", "Schools", "NGOs", "Manufacturing"].map((brand, i) => (
                        <span key={i} className="text-xl md:text-3xl font-[1000] uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400 dark:from-indigo-400 dark:to-cyan-300 dark:drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                          {brand}
                        </span>
                      ))}
                   </div>
                 ))}
               </motion.div>
            </div>

          </div>
        </section>


        {/* 3. Corporate Services: Protech Assist Full Stack */}
        <section id="services" className="py-24 bg-white dark:bg-slate-950/20 relative overflow-hidden">
           <div className="container px-6 mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
                 <div className="max-w-2xl">
                    <div className="text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">More Than Software</div>
                    <h2 className="text-4xl lg:text-6xl font-[1000] tracking-tight text-slate-900 dark:text-white leading-none uppercase">
                       Protech Assist <span className="text-indigo-600 dark:text-indigo-400 font-light italic">Technology Group</span>
                    </h2>
                    <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                       We provide complete end-to-end technology solutions for businesses across Sierra Leone and Africa.
                    </p>
                 </div>
                 <Link href="/portfolio" className="h-12 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:border-slate-950 dark:hover:border-slate-700 hover:text-black dark:hover:text-white transition-all shadow-lg hover:shadow-indigo-500/5 font-bold">
                    View Corporate Portfolio <ExternalLink className="h-4 w-4" />
                 </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { title: "Software Engineering", icon: Code2, desc: "Custom-built enterprise software tailored to your unique operational workflows." },
                   { title: "Web & Mobile Apps", icon: Laptop, desc: "High-performance digital presence with world-class UI/UX design." },
                   { title: "Infrastructure & Networking", icon: Network, desc: "Robust computer networking solutions and local hardware maintenance." },
                   { title: "Database Architecture", icon: Database, desc: "Professional management and design for mission-critical data security." },
                   { title: "Cloud Hosting & DevOps", icon: Cloud, desc: "Scalable hosting solutions with 99.9% uptime and automated backups." },
                   { title: "IT Consultancy", icon: Headphones, desc: "Strategic technical support and advisory for digital transformation." },
                 ].map((service, i) => (
                   <motion.div 
                     whileHover={{ y: -6 }}
                     key={i} 
                     className="p-8 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/20 dark:hover:border-indigo-500/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all duration-500 flex flex-col group relative overflow-hidden h-72"
                   >
                     <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                         <service.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-black mb-3 text-slate-900 dark:text-white tracking-tight uppercase">{service.title}</h3>
                      <p className="text-slate-550 dark:text-slate-400 font-normal text-sm leading-relaxed flex-1">{service.desc}</p>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* 4. Core Modules: The Operating System */}
        <section id="features" className="py-24 bg-slate-50 dark:bg-slate-950/10">
           <div className="container px-6 mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-20">
                 <h2 className="text-4xl lg:text-6xl font-[1000] text-slate-900 dark:text-white tracking-tight mb-6 uppercase italic leading-none">
                    Complete Business <br /> <span className="text-indigo-600 dark:text-indigo-400">Operating System</span>
                 </h2>
                 <p className="text-lg text-slate-500 dark:text-slate-400 font-normal">Manage every department from one unified dashboard with real-time intelligence.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { title: "Inventory", desc: "Monitor stock, movements, batches, and transfers.", icon: Box },
                   { title: "Sales & POS", desc: "Fast checkout, receipt printing, and analytics.", icon: ShoppingCart },
                   { title: "Purchasing", desc: "Manage suppliers and automate replenishment.", icon: Truck },
                   { title: "CRM & Loyalty", desc: "Track customer credit and loyalty programs.", icon: Users },
                   { title: "Finance", desc: "Full P&L tracking, income, and expenses.", icon: BarChart3 },
                   { title: "Intelligence", desc: "Powerful dashboards with real-time analytics.", icon: TrendingUp },
                   { title: "Multi-Warehouse", desc: "Control multiple branches from one hub.", icon: Globe },
                   { title: "Multi-Unit", desc: "Sell by Piece, Carton, or Case automatically.", icon: Layers },
                 ].map((mod, i) => (
                   <motion.div 
                     whileHover={{ y: -4 }}
                     key={i} 
                     className="group p-8 rounded-3xl bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/20 dark:hover:border-indigo-500/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 hover:shadow-2xl transition-all duration-500"
                   >
                      <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                         <mod.icon className="h-5 w-5" />
                      </div>
                      <h4 className="text-lg font-black mb-3 text-slate-900 dark:text-white tracking-tight uppercase italic">{mod.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">{mod.desc}</p>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* 5. Industries: Vertical Expertise */}
        <section id="solutions" className="py-24 bg-white dark:bg-slate-950 border-y border-slate-200 dark:border-slate-900 relative overflow-hidden">
           <div className="container px-6 mx-auto relative z-10">
              <div className="flex flex-col items-center text-center mb-20">
                 <div className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-550/10 dark:bg-slate-900/50 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-[0.4em] mb-4">Vertical Intelligence</div>
                 <h2 className="text-4xl lg:text-6xl font-[1000] tracking-tight leading-none text-slate-900 dark:text-white mb-4 uppercase">Built For Your <span className="text-indigo-600 dark:text-indigo-400 italic">Industry.</span></h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                 {[
                   { name: "Retail", icon: Store },
                   { name: "Supermarkets", icon: ShoppingCart },
                   { name: "Pharmacies", icon: PlusSquare },
                   { name: "Bars & Restaurants", icon: Utensils },
                   { name: "Wholesale", icon: Box },
                   { name: "Hardware", icon: HardHat },
                   { name: "Distribution", icon: Truck },
                   { name: "Schools", icon: GraduationCap },
                   { name: "NGOs", icon: Heart },
                   { name: "Manufacturing", icon: Building2 },
                 ].map((ind, i) => (
                   <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-500/20 dark:hover:border-indigo-500/30 transition-all duration-300">
                      <ind.icon className="h-8 w-8 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-4 transition-colors duration-300" />
                      <span className="font-black text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{ind.name}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 6. Security: Mission Critical Integrity */}
        <section id="security" className="py-24 bg-slate-50 dark:bg-slate-950/10">
           <div className="container px-6 mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                 <div className="relative flex justify-center">
                    <div className="absolute -inset-10 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
                    
                    {/* Animated Cyber Shield Grid */}
                    <div className="relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 w-full max-w-md shadow-2xl flex flex-col items-center text-center backdrop-blur-sm overflow-hidden group">
                       {/* Background pulse effect */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse animate-duration-5000" />
                       
                       <motion.div
                         animate={{ scale: [1, 1.05, 1] }}
                         transition={{ duration: 4, repeat: Infinity }}
                         className="relative z-10 h-36 w-36 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8"
                       >
                         <Shield className="h-16 w-16" />
                       </motion.div>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-3 relative z-10">Enterprise Security</h3>
                       <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px] relative z-10">99.99% Infrastructure Resilience</p>
                    </div>
                 </div>

                 <div className="flex flex-col">
                    <h2 className="text-4xl lg:text-6xl font-[1000] tracking-tight text-slate-900 dark:text-white leading-none mb-10 uppercase">
                       Data Integrity <br /> <span className="text-indigo-605 dark:text-indigo-400 font-light italic">Without Compromise.</span>
                    </h2>
                    <div className="space-y-8">
                       {[
                         { title: "Encrypted Data Protection", desc: "Industry-standard AES-256 encryption for all data at rest and in transit." },
                         { title: "Automated Cloud Backup", desc: "Redundant geographic backups ensuring no data is ever lost." },
                         { title: "Multi-User Access Control", desc: "Granular RBAC permissions for managers, cashiers, and admins." },
                         { title: "Audit Logs & Tracking", desc: "Every single business action is logged for complete forensic visibility." },
                       ].map((s, i) => (
                         <div key={i} className="flex gap-4">
                            <div className="h-5 w-5 mt-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                               <Check className="h-3 w-3" />
                            </div>
                            <div>
                               <h4 className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-widest mb-1">{s.title}</h4>
                               <p className="text-slate-550 dark:text-slate-400 text-sm font-normal leading-relaxed">{s.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* 6.5. Social Proof & Impact: Real World Results */}
        <section className="py-24 bg-white dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-900">
           <div className="container px-6 mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                 <div className="space-y-10">
                    <div className="space-y-4">
                       <div className="text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em]">Real-World Impact</div>
                       <h2 className="text-4xl lg:text-6xl font-[1000] tracking-tight text-slate-900 dark:text-white leading-none uppercase">
                          Trusted by <span className="text-indigo-605 dark:text-indigo-400 italic">Industry Leaders.</span>
                       </h2>
                       <p className="text-lg text-slate-500 dark:text-slate-400 font-normal max-w-md mt-4">
                          More than 75% of our customers report lasting operational impacts within the first 30 days of implementation.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {[
                         { value: "1-3 hrs", label: "Saved in order processing daily", icon: Clock },
                         { value: "20-30%", label: "Reduction in inventory wastage", icon: TrendingUp },
                       ].map((stat, i) => (
                         <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-xl">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                               <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.label}</div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="relative">
                    <div className="absolute -inset-10 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
                    <div className="bg-slate-900/90 dark:bg-slate-900/60 border border-slate-805 backdrop-blur-sm rounded-3xl p-8 lg:p-12 relative overflow-hidden group">
                       <Quote className="absolute top-6 right-6 h-24 w-24 text-white/5 -rotate-12 transition-transform group-hover:rotate-0 duration-700 pointer-events-none" />
                       
                       <div className="relative z-10 space-y-6">
                          <h3 className="text-xl lg:text-2xl font-black text-slate-200 leading-relaxed italic tracking-tight">
                             "The multi-branch control changed how we operate. Real-time tracking is a lifesaver for our distribution network."
                          </h3>
                          
                          <div className="flex items-center gap-4 pt-4">
                             <div>
                                <p className="text-lg font-black text-white tracking-tight">Aminata Bangura</p>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">CEO, Eastside Pharmacy</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* 7. Final Call to Action */}
        <section className="py-28 bg-slate-900 dark:bg-slate-950 border-t border-slate-800 dark:border-slate-900 relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />
           <div className="container px-6 mx-auto text-center relative z-10">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-[1000] text-white tracking-tight mb-8 uppercase italic leading-none">
                 READY TO <span className="text-indigo-400 underline underline-offset-8">TRANSFORM?</span>
              </h2>
              <p className="text-base lg:text-lg text-slate-400 font-normal mb-12 max-w-xl mx-auto leading-relaxed uppercase tracking-widest">
                 Join the growing number of businesses using Protech Assist to increase profits and reduce operational losses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                 <Link 
                   href={ctaHref} 
                   className="h-16 px-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center font-bold"
                 >
                   {ctaText} Today
                 </Link>
                 <button 
                   onClick={() => setIsDemoModalOpen(true)}
                   className="h-16 px-10 rounded-xl border border-slate-700 dark:border-slate-800 bg-slate-800/40 hover:bg-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900 dark:hover:border-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-[0.3em] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center font-bold"
                 >
                   Schedule Live Demo
                 </button>
              </div>
           </div>
        </section>

        {/* 8. Modern Footer */}
        <footer className="bg-slate-950 border-t border-slate-900 pt-24 pb-12">
          <div className="container px-6 mx-auto">
            <div className="grid lg:grid-cols-12 gap-16 mb-20">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-3 mb-8">
                   <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg border border-slate-800 bg-white">
                      <Image src="/images/logo.jpeg" alt="Logo" fill sizes="40px" className="object-cover" />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-black text-xl tracking-tighter text-white leading-none">PROTECH ASSIST</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 mt-1 leading-none">(SL) LIMITED</span>
                   </div>
                </div>
                <p className="text-slate-400 font-normal text-sm leading-relaxed mb-8 max-w-xs italic">
                  Your Business. Our Tech. Better Tomorrow.
                </p>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-xs font-bold text-slate-350">
                      <MessageSquare className="h-4 w-4 text-indigo-400" />
                      protechassist36@gmail.com
                   </div>
                   <div className="flex items-center gap-3 text-xs font-bold text-slate-355">
                      <Globe className="h-4 w-4 text-indigo-400" />
                      Freetown, Sierra Leone
                   </div>
                </div>
              </div>
              
              <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
                 {[
                   { title: "Products", links: ["Inventory OS", "POS Terminals", "Warehouse Hub", "Cloud API"] },
                   { title: "Industries", links: ["Retail", "Pharmacy", "Distributors", "NGOs"] },
                   { title: "Company", links: ["Our Mission", "Corporate Services", "Careers", "Security"] },
                   { title: "Legal", links: ["Terms of Service", "Privacy Policy", "SLA Agreement", "Refunds"] }
                 ].map((col, i) => (
                   <div key={i}>
                      <h4 className="font-black text-white mb-6 uppercase tracking-[0.25em] text-[10px] italic">{col.title}</h4>
                      <ul className="space-y-4 text-[9px] font-black text-slate-400 hover:text-slate-300 uppercase tracking-widest">
                         {col.links.map(link => <li key={link}><Link href="#" className="hover:text-white transition-colors">{link}</Link></li>)}
                      </ul>
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                  © 2026 PROTECH ASSIST (SL) LIMITED. ALL RIGHTS RESERVED.
               </p>
               <div className="flex gap-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
                  <Link href="#" className="hover:text-white transition-colors">Server Status</Link>
                  <Link href="#" className="hover:text-white transition-colors">Global Support</Link>
               </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Demo Booking Modal */}
      <Dialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-2xl">
          <div className="relative p-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
            
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                Book Your <span className="text-indigo-650 dark:text-indigo-400">Live Demo</span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 font-normal text-sm mt-4 leading-relaxed">
                Experience the power of Enterprise Inventory OS firsthand. Choose your preferred method to connect with our technical specialists.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <a 
                href="https://wa.me/23234955581" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-5 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-all group"
              >
                <div className="h-14 w-14 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-550/20 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">Instant Response</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Book via WhatsApp</div>
                </div>
                <ArrowRight className="ml-auto h-5 w-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </a>

              <a 
                href="mailto:protechassist36@gmail.com?subject=Enterprise%20Inventory%20OS%20Demo%20Request" 
                className="flex items-center gap-5 p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 transition-all group"
              >
                <div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                  <Globe className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400 mb-1">Official Channel</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Schedule via Email</div>
                </div>
                <ArrowRight className="ml-auto h-5 w-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Direct Line: +232 34 955581
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExpertPopup />
    </div>
  );
}
