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
  Utensils
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { PricingSection } from "@/components/shared/pricing-section";
import { ExpertPopup } from "@/components/shared/expert-popup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProtechCloudHomepage() {
  const containerRef = useRef(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

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
    <div ref={containerRef} className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-indigo-600/10 selection:text-indigo-600 overflow-x-hidden font-sans">
      
      {/* 1. Global Navigation */}
      <nav className="fixed top-0 w-full z-[100] px-6 lg:px-20 h-24 flex items-center bg-white/90 backdrop-blur-xl border-b border-slate-100 transition-all">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg border border-slate-200 group-hover:scale-105 transition-transform">
            <Image src="/images/logo.jpeg" alt="Protech Logo" fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-slate-900 leading-none">
              ENTERPRISE
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 leading-none mt-1">
              Inventory OS
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-10 ml-20">
          {["Features", "Solutions", "Services", "Pricing", "Security"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-600 transition-colors">
              {item}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-6">
          <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-900 hover:text-indigo-600 transition-colors px-4">
            Login
          </Link>
          <Link 
            href="/register" 
            className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-1 flex items-center justify-center"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      <main className="flex-1 pt-24">
        
        {/* 2. Hero Section: Africa's Smartest Platform */}
        <section className="relative py-24 lg:py-40 overflow-hidden">
          {/* Professional Mesh Gradient */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-50 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3" />

          <div className="container px-6 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col"
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 w-fit">
                   Trusted by Businesses Across Sierra Leone
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[0.95] mb-10">
                   Africa's Smartest <span className="text-indigo-600 italic">Business Management</span> Platform.
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-xl text-slate-500 max-w-xl leading-relaxed mb-12 font-medium">
                  Built by Protech Assist (SL) Limited to help retailers, pharmacies, and distributors manage every aspect of their business from one powerful cloud platform.
                </motion.p>
                
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-x-8 gap-y-4 mb-14">
                   {[
                     "Real-Time Tracking", "Point of Sale (POS)", 
                     "Multi-Branch Control", "Customer & Supplier CRM",
                     "Profit & Loss Reporting", "Barcode & Batch Tracking",
                     "Secure Cloud Backup", "Online & Offline Mode"
                   ].map((point, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">{point}</span>
                     </div>
                   ))}
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5">
                  <Link 
                    href="/register" 
                    className="h-18 px-12 text-sm font-black uppercase tracking-[0.2em] bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center group"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button 
                    onClick={() => setIsDemoModalOpen(true)}
                    className="h-18 px-12 text-sm font-black uppercase tracking-[0.2em] border-2 border-slate-200 bg-white hover:border-slate-900 text-slate-900 rounded-2xl transition-all flex items-center justify-center"
                  >
                    Book a Live Demo
                  </button>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="relative hidden lg:block"
              >
                 <div className="relative bg-white rounded-[3rem] border-[16px] border-slate-900 shadow-[0_80px_120px_-30px_rgba(0,0,0,0.3)] overflow-hidden aspect-[16/11] z-20 group">
                    <Image src="/images/1000001630.jpg" alt="Dashboard" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 to-transparent pointer-events-none" />
                 </div>
                 {/* Decorative Elements */}
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600 rounded-full blur-[80px] opacity-20 -z-10" />
                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500 rounded-full blur-[80px] opacity-20 -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Corporate Services: Protech Assist Full Stack */}
        <section id="services" className="py-32 bg-slate-50 relative overflow-hidden">
           <div className="container px-6 mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-24">
                 <div className="max-w-3xl">
                    <div className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.5em] mb-6">More Than Software</div>
                    <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-none">
                       Protech Assist <span className="text-indigo-600 font-light italic">Technology Group</span>
                    </h2>
                    <p className="mt-8 text-xl text-slate-500 font-medium leading-relaxed">
                       We provide complete end-to-end technology solutions for businesses across Sierra Leone and Africa.
                    </p>
                 </div>
                 <Link href="#" className="h-14 px-8 rounded-xl bg-white border border-slate-200 text-slate-900 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:border-slate-900 transition-all">
                    View Corporate Portfolio <ExternalLink className="h-4 w-4" />
                 </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[
                   { title: "Software Engineering", icon: Code2, desc: "Custom-built enterprise software tailored to your unique operational workflows." },
                   { title: "Web & Mobile Ecosystems", icon: Laptop, desc: "High-performance digital presence with world-class UI/UX design." },
                   { title: "Infrastructure & Networking", icon: Network, desc: "Robust computer networking solutions and local hardware maintenance." },
                   { title: "Database Architecture", icon: Database, desc: "Professional management and design for mission-critical data security." },
                   { title: "Cloud Hosting & DevOps", icon: Cloud, desc: "Scalable hosting solutions with 99.9% uptime and automated backups." },
                   { title: "IT Consultancy", icon: Headphones, desc: "Strategic technical support and advisory for digital transformation." },
                 ].map((service, i) => (
                   <motion.div 
                     whileHover={{ y: -5 }}
                     key={i} 
                     className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:shadow-2xl hover:shadow-indigo-600/5 transition-all duration-500 flex flex-col group"
                   >
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                         <service.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{service.title}</h3>
                      <p className="text-slate-500 font-medium leading-relaxed flex-1">{service.desc}</p>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* 4. Core Modules: The Operating System */}
        <section id="features" className="py-32 bg-white">
           <div className="container px-6 mx-auto">
              <div className="text-center max-w-4xl mx-auto mb-24">
                 <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-8 uppercase italic leading-none">
                    Complete Business <br /> <span className="text-indigo-600">Operating System</span>
                 </h2>
                 <p className="text-xl text-slate-500 font-medium">Manage every department from one unified dashboard with real-time intelligence.</p>
              </div>

              <div className="grid lg:grid-cols-4 gap-4">
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
                   <div key={i} className="group p-8 rounded-[2rem] bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-300">
                      <mod.icon className="h-8 w-8 text-slate-400 mb-6 group-hover:text-indigo-600 transition-colors" />
                      <h4 className="text-xl font-black mb-2 text-slate-900 tracking-tight">{mod.title}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{mod.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 5. Industries: Vertical Expertise */}
        <section id="solutions" className="py-32 bg-slate-950 text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
           <div className="container px-6 mx-auto relative z-10">
              <div className="flex flex-col items-center text-center mb-24">
                 <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] mb-6">Vertical Intelligence</div>
                 <h2 className="text-5xl lg:text-7xl font-black tracking-tight leading-none mb-6 italic">Built For Your <span className="text-indigo-500">Industry.</span></h2>
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
                   <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center text-center group hover:bg-white hover:border-white transition-all duration-500">
                      <ind.icon className="h-10 w-10 text-white group-hover:text-indigo-600 mb-6 transition-colors duration-500" />
                      <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-slate-900">{ind.name}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 6. Security: Mission Critical Integrity */}
        <section id="security" className="py-32 bg-white">
           <div className="container px-6 mx-auto">
              <div className="grid lg:grid-cols-2 gap-32 items-center">
                 <div className="relative">
                    <div className="absolute -inset-10 bg-indigo-50 rounded-full blur-[100px] -z-10" />
                    <div className="relative bg-slate-900 rounded-[4rem] p-16 shadow-2xl flex flex-col items-center text-center">
                       <Shield className="h-40 w-40 text-indigo-500 mb-10" />
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">Enterprise Security</h3>
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">99.99% Infrastructure Resilience</p>
                    </div>
                 </div>

                 <div>
                    <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-none mb-12">
                       Data Integrity <br /> <span className="text-indigo-600">Without Compromise.</span>
                    </h2>
                    <div className="space-y-10">
                       {[
                         { title: "Encrypted Data Protection", desc: "Industry-standard AES-256 encryption for all data at rest and in transit." },
                         { title: "Automated Cloud Backup", desc: "Redundant geographic backups ensuring no data is ever lost." },
                         { title: "Multi-User Access Control", desc: "Granular RBAC permissions for managers, cashiers, and admins." },
                         { title: "Audit Logs & Tracking", desc: "Every single business action is logged for complete forensic visibility." },
                       ].map((s, i) => (
                         <div key={i} className="flex gap-6">
                            <div className="h-6 w-6 mt-1 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                               <Check className="h-3 w-3" />
                            </div>
                            <div>
                               <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-2">{s.title}</h4>
                               <p className="text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <PricingSection />

        {/* 6.5. Social Proof & Impact: Real World Results */}
        <section className="py-32 bg-slate-50">
           <div className="container px-6 mx-auto">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                 <div className="space-y-12">
                    <div className="space-y-6">
                       <div className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.5em]">Real-World Impact</div>
                       <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-none">
                          Trusted by <span className="text-indigo-600 italic font-light">Industry Leaders.</span>
                       </h2>
                       <p className="text-xl text-slate-500 font-medium max-w-xl">
                          More than 75% of our customers report lasting operational impacts within the first 30 days of implementation.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {[
                         { value: "1-3 hrs", label: "Saved in order processing daily", icon: Clock, faces: false },
                         { value: "20-30%", label: "Reduction in inventory wastage", icon: TrendingUp, faces: true },
                       ].map((stat, i) => (
                         <div key={i} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className="flex justify-between items-start mb-6">
                               <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                  <stat.icon className="h-6 w-6" />
                               </div>
                               {stat.faces && (
                                 <div className="flex -space-x-2">
                                    {[1,2,3,4].map(f => (
                                      <div key={f} className="h-6 w-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center shadow-sm">
                                         <Users className="h-3 w-3 text-indigo-600" />
                                      </div>
                                    ))}
                                 </div>
                               )}
                            </div>
                            <div className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="relative">
                    <div className="absolute -inset-10 bg-indigo-600/5 rounded-full blur-[100px] -z-10" />
                    <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden group">
                       <Quote className="absolute top-10 right-10 h-32 w-32 text-white/5 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                       
                       <div className="relative z-10 space-y-10">
                          <h3 className="text-3xl lg:text-4xl font-black text-white leading-tight italic tracking-tight">
                             "The multi-branch control changed how we operate. Real-time tracking is a lifesaver for our distribution network."
                          </h3>
                          
                          <div className="flex items-center gap-6">
                             <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-2xl relative">
                                <Image 
                                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&h=300&auto=format&fit=crop" 
                                  alt="Mariatu Bangura" 
                                  fill
                                  className="object-cover"
                                />
                             </div>
                             <div>
                                <p className="text-xl font-black text-white tracking-tight">Mariatu Bangura</p>
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1">CEO, West End Distributors</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* 7. Final Call to Action */}
        <section className="py-32 bg-slate-900 relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/10 blur-[150px] rounded-full" />
           <div className="container px-6 mx-auto text-center relative z-10">
              <h2 className="text-5xl lg:text-9xl font-black text-white tracking-tighter mb-12 leading-none italic">
                 READY TO <span className="text-indigo-500 underline underline-offset-8">TRANSFORM?</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium mb-16 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
                 Join the growing number of businesses using Protech Assist to increase profits and reduce operational losses.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                 <Link 
                   href="/register" 
                   className="h-20 px-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                 >
                   Start Free Trial Today
                 </Link>
                 <button 
                   onClick={() => setIsDemoModalOpen(true)}
                   className="h-20 px-16 rounded-2xl border-4 border-slate-900 bg-white hover:bg-slate-900 hover:text-white text-slate-900 text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                 >
                   Schedule Live Demo
                 </button>
              </div>
           </div>
        </section>

        {/* 8. Modern Footer */}
        <footer className="bg-white pt-32 pb-16">
          <div className="container px-6 mx-auto">
            <div className="grid lg:grid-cols-12 gap-20 mb-32">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-4 mb-10">
                   <div className="relative h-12 w-12 overflow-hidden rounded-xl shadow-xl">
                      <Image src="/images/logo.jpeg" alt="Logo" fill className="object-cover" />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-black text-2xl tracking-tighter text-slate-900 leading-none">PROTECH ASSIST</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mt-1 leading-none">(SL) LIMITED</span>
                   </div>
                </div>
                <p className="text-slate-500 font-medium text-lg leading-relaxed mb-12 max-w-sm italic">
                  Your Business. Our Tech. Better Tomorrow.
                </p>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                      <MessageSquare className="h-4 w-4 text-indigo-600" />
                      protechassist36@gmail.com
                   </div>
                   <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                      <Globe className="h-4 w-4 text-indigo-600" />
                      Freetown, Sierra Leone
                   </div>
                </div>
              </div>
              
              <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-12">
                 {[
                   { title: "Products", links: ["Inventory OS", "POS Terminals", "Warehouse Hub", "Cloud API"] },
                   { title: "Industries", links: ["Retail", "Pharmacy", "Distributors", "NGOs"] },
                   { title: "Company", links: ["Our Mission", "Corporate Services", "Careers", "Security"] },
                   { title: "Legal", links: ["Terms of Service", "Privacy Policy", "SLA Agreement", "Refunds"] }
                 ].map((col, i) => (
                   <div key={i}>
                      <h4 className="font-black text-slate-900 mb-8 uppercase tracking-[0.3em] text-[9px] italic">{col.title}</h4>
                      <ul className="space-y-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         {col.links.map(link => <li key={link}><Link href="#" className="hover:text-indigo-600 transition-colors">{link}</Link></li>)}
                      </ul>
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                  © 2026 PROTECH ASSIST (SL) LIMITED. ALL RIGHTS RESERVED.
               </p>
               <div className="flex gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Link href="#" className="hover:text-slate-900 transition-colors">Documentation</Link>
                  <Link href="#" className="hover:text-slate-900 transition-colors">Server Status</Link>
                  <Link href="#" className="hover:text-slate-900 transition-colors">Global Support</Link>
               </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Demo Booking Modal */}
      <Dialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-[2rem] border-none p-0 overflow-hidden shadow-2xl">
          <div className="relative p-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
            
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">
                Book Your <span className="text-indigo-600">Live Demo</span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium text-base mt-4">
                Experience the power of Enterprise Inventory OS firsthand. Choose your preferred method to connect with our technical specialists.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <a 
                href="https://wa.me/23234955581" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-5 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all group"
              >
                <div className="h-14 w-14 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Instant Response</div>
                  <div className="text-lg font-black text-slate-900 tracking-tight">Book via WhatsApp</div>
                </div>
                <ArrowRight className="ml-auto h-5 w-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </a>

              <a 
                href="mailto:protechassist36@gmail.com?subject=Enterprise%20Inventory%20OS%20Demo%20Request" 
                className="flex items-center gap-5 p-6 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all group"
              >
                <div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                  <Globe className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">Official Channel</div>
                  <div className="text-lg font-black text-slate-900 tracking-tight">Schedule via Email</div>
                </div>
                <ArrowRight className="ml-auto h-5 w-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
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
