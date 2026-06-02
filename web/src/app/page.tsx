"use client";

import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  CheckCircle2, 
  Store, 
  Utensils, 
  PlusSquare, 
  LayoutDashboard,
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
  Cpu,
  Check,
  Star,
  ExternalLink,
  AlertCircle,
  Heart,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

export default function ProtechCloudHomepage() {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("retail");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

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
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-indigo-600/10 selection:text-indigo-600 overflow-x-hidden font-sans">
      
      {/* 1. Navigation Bar */}
      <nav className="fixed top-0 w-full z-[100] px-6 lg:px-20 h-20 flex items-center bg-white/80 backdrop-blur-2xl border-b border-slate-100 transition-all">
        <Link className="flex items-center gap-2 group" href="/">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg shadow-sm border border-slate-200">
            <Image src="/images/logo.jpeg" alt="Protech Logo" fill className="object-cover" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Protech <span className="text-indigo-600">Inventory Cloud</span>
          </span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-10 ml-16">
          {["Features", "Solutions", "Pricing", "Resources", "Company"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              {item}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-900 hover:text-indigo-600 px-4 transition-colors">
            Login
          </Link>
          <Link 
            href="/register" 
            className="h-11 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      <main className="flex-1 pt-20">
        
        {/* 2. Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-48 overflow-hidden bg-slate-50/50">
          <div className="container px-6 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col text-left"
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-6 w-fit">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                  Trusted by 10,000+ Businesses
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-[1000] tracking-tight text-slate-900 leading-[1.1] mb-8">
                  All-in-One <span className="text-indigo-600 italic">Inventory Management</span> Platform for African Businesses
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-lg lg:text-xl text-slate-600 max-w-xl leading-relaxed mb-12 font-medium">
                  Manage inventory, sales, purchases, suppliers, customers, warehouses, and business operations from a single cloud platform.
                </motion.p>
                
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/register" 
                    className="h-16 px-10 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center group"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href="#" 
                    className="h-16 px-10 text-base font-bold border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl transition-all flex items-center justify-center"
                  >
                    Book a Demo
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="relative hidden lg:block"
              >
                 {/* Floating Dashboard Elements */}
                 <div className="absolute inset-0 bg-indigo-600/10 blur-[100px] -z-10 rounded-full" />
                 
                 <div className="bg-white rounded-[2.5rem] border-[12px] border-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] overflow-hidden aspect-[16/11] relative z-20 group">
                    <Image src="/images/dashboard-preview-2.png" alt="Dashboard" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    
                    {/* UI Floating Cards */}
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                      className="absolute top-10 -left-10 p-5 bg-white rounded-2xl shadow-2xl border border-slate-100 z-30"
                    >
                       <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp className="h-4 w-4 text-emerald-600" /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Profit</span>
                       </div>
                       <div className="text-xl font-black text-slate-900">+34.2%</div>
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-10 -right-10 p-5 bg-slate-900 rounded-2xl shadow-2xl z-30 text-white"
                    >
                       <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-rose-500/20 rounded-lg"><Zap className="h-4 w-4 text-rose-500" /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Low Stock</span>
                       </div>
                       <div className="text-xl font-black italic">12 Items Alert</div>
                    </motion.div>
                 </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Products Section */}
        <section id="features" className="py-32 bg-white relative">
          <div className="container px-6 mx-auto">
            <div className="flex flex-col items-center text-center mb-24">
              <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6">Designed for Complete Operational Excellence</h2>
              <p className="text-slate-500 font-medium max-w-2xl text-lg italic">Explore the core modules that power the world's most successful inventory operations.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { title: "Inventory Management", icon: Package, color: "bg-blue-50 text-blue-600", desc: "Real-time tracking of SKUs, stock levels, and automated reorder points.", url: "/dashboard/inventory/products" },
                 { title: "Point of Sale (POS)", icon: ShoppingCart, color: "bg-indigo-50 text-indigo-600", desc: "Omnichannel selling with offline support and intuitive checkout.", url: "/dashboard/pos" },
                 { title: "Purchase Management", icon: Truck, color: "bg-emerald-50 text-emerald-600", desc: "Automate purchase orders and manage stock inflow effortlessly.", url: "/dashboard/purchases" },
                 { title: "Warehouse Management", icon: Layers, color: "bg-amber-50 text-amber-600", desc: "Optimize multi-location storage and internal stock transfers.", url: "/dashboard/inventory/warehouses" },
                 { title: "Customer Management", icon: Users, color: "bg-rose-50 text-rose-600", desc: "Build loyalty with purchase history and credit management.", url: "/dashboard/customers" },
                 { title: "Supplier Management", icon: Building2, color: "bg-teal-50 text-teal-600", desc: "Track performance, costs, and relationships from one hub.", url: "/dashboard/purchases/suppliers" },
                 { title: "Reports & Analytics", icon: BarChart3, color: "bg-violet-50 text-violet-600", desc: "High-intelligence insights into profit, loss, and demand trends.", url: "/dashboard/analytics" },
                 { title: "AI Business Assistant", icon: Cpu, color: "bg-slate-900 text-white", desc: "Predictive algorithms that forecast inventory needs automatically.", url: "/dashboard" },
               ].map((item, i) => (
                 <motion.div 
                   whileHover={{ y: -8 }}
                   key={i} 
                   className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full"
                 >
                    <div className={cn("p-5 rounded-2xl w-fit mb-8 transition-transform group-hover:scale-110 group-hover:rotate-6", item.color)}>
                       <item.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{item.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">{item.desc}</p>
                    <Link href={item.url} className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 uppercase tracking-widest hover:gap-3 transition-all">
                       Learn More <ArrowRight className="h-4 w-4" />
                    </Link>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>

        {/* 4. Platform Benefits Section */}
        <section className="py-32 bg-slate-950 text-white overflow-hidden relative">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
           <div className="container px-6 mx-auto relative z-10">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                 <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-primary blur opacity-25 rounded-[3rem]" />
                    <div className="relative bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden aspect-square flex items-center justify-center p-8">
                       <Image src="/images/dashboard-preview-1.png" alt="Control Center" fill className="object-cover opacity-60" />
                       <div className="relative z-20 text-center">
                          <div className="h-32 w-32 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/40 border-4 border-white/20">
                             <ShieldCheck className="h-16 w-16" />
                          </div>
                          <h4 className="text-4xl font-black tracking-tight mb-4 uppercase italic">Global Resilience</h4>
                          <p className="text-slate-400 font-bold max-w-sm mx-auto uppercase tracking-widest text-xs">A unified architecture for decentralized business control.</p>
                       </div>
                    </div>
                 </div>

                 <div>
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-12 leading-tight">
                       One Platform for <span className="text-indigo-500 italic">Complete Control.</span>
                    </h2>
                    
                    <div className="grid sm:grid-cols-2 gap-8">
                       {[
                         { title: "Real-time Tracking", icon: Zap },
                         { title: "Multi-Branch Control", icon: Globe },
                         { title: "Barcode Scanning", icon: Package },
                         { title: "Low Stock Alerts", icon: AlertCircle },
                         { title: "Expiry Tracking", icon: Clock },
                         { title: "Batch Tracking", icon: Layers },
                         { title: "Cross-Platform Access", icon: Smartphone },
                         { title: "Secure Cloud Backup", icon: Lock },
                       ].map((f, i) => (
                         <div key={i} className="flex items-center gap-4 group">
                            <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-300">
                               <f.icon className="h-5 w-5 text-indigo-400 group-hover:text-white" />
                            </div>
                            <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{f.title}</span>
                         </div>
                       ))}
                    </div>

                    <div className="mt-16 pt-10 border-t border-white/10">
                       <p className="text-slate-400 font-medium leading-relaxed italic">
                         "We've eliminated inventory shrinkage by 95% across all 4 branches since implementing Protech. It's the only platform that truly understands the African business workflow."
                       </p>
                       <div className="mt-6 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-slate-800" />
                          <div>
                             <div className="font-black text-xs uppercase tracking-widest text-white">Chief Logistics Officer</div>
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">MegaRetail Group</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* 5. Industries Section */}
        <section id="solutions" className="py-32 bg-white">
           <div className="container px-6 mx-auto text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase italic mb-4">Vertical Intelligence</h2>
              <p className="text-slate-500 font-medium">Custom-engineered configurations for specialized industrial nodes.</p>
           </div>
           
           <div className="container px-6 mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {[
                   { name: "Retail Stores", icon: Store },
                   { name: "Pharmacies", icon: PlusSquare },
                   { name: "Supermarkets", icon: ShoppingCart },
                   { name: "Wholesale", icon: Box },
                   { name: "Hardware", icon: HardHat },
                   { name: "Distribution", icon: Truck },
                   { name: "Schools", icon: GraduationCap },
                   { name: "NGOs", icon: Heart },
                 ].map((ind, i) => (
                   <motion.div 
                     whileHover={{ scale: 1.02 }}
                     key={i} 
                     className="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center group cursor-pointer hover:bg-slate-900 transition-all duration-500"
                   >
                      <div className="p-4 bg-white rounded-2xl mb-6 shadow-sm group-hover:bg-indigo-600 transition-colors duration-500">
                         <ind.icon className="h-8 w-8 text-indigo-600 group-hover:text-white" />
                      </div>
                      <span className="font-black text-xs uppercase tracking-widest text-slate-900 group-hover:text-white">{ind.name}</span>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* 6. Testimonials Section */}
        <section className="py-32 bg-indigo-600 relative overflow-hidden">
           <div className="container px-6 mx-auto relative z-10">
              <div className="flex flex-col items-center text-center mb-20">
                 <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter italic">Human Capital Feedback</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                 {[
                   { quote: "The data fidelity we now have is unprecedented. Protech is a game changer.", author: "Steven S.", company: "Strategic Logistics" },
                   { quote: "Customer credit tracking is finally handled correctly. Zero debt leakage.", author: "Mariama B.", company: "Unity Pharmacies" },
                   { quote: "Finally, a cloud solution that works perfectly in low-connectivity areas.", author: "Ahmed K.", company: "Freetown Supermarket" },
                 ].map((t, i) => (
                   <div key={i} className="p-12 rounded-[3rem] bg-white/10 backdrop-blur-xl border border-white/20 text-white flex flex-col h-full">
                      <div className="flex gap-1 mb-8">
                         {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-white" />)}
                      </div>
                      <p className="text-xl font-bold leading-relaxed flex-1 italic mb-10">"{t.quote}"</p>
                      <div>
                         <div className="font-black uppercase tracking-widest text-sm">{t.author}</div>
                         <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">{t.company}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 7. Security Section */}
        <section className="py-32 bg-white">
           <div className="container px-6 mx-auto">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                 <div>
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 mb-10 leading-tight">
                       Enterprise <span className="text-indigo-600">Security</span> You Can Trust.
                    </h2>
                    <div className="space-y-6">
                       {[
                         { title: "End-to-End Encryption", desc: "Your sensitive business data is encrypted at rest and in transit." },
                         { title: "Automated Multi-Zone Backups", desc: "Geographically redundant backups every 15 minutes." },
                         { title: "Role-Based Access (RBAC)", desc: "Granular permissions for owners, managers, and cashiers." },
                         { title: "Secure Cloud Infrastructure", desc: "Running on world-class high-availability tier-4 datacenters." },
                         { title: "24/7 Forensic Monitoring", desc: "Real-time threat detection and audit log analysis." },
                       ].map((s, i) => (
                         <div key={i} className="flex gap-5 group">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                               <Check className="h-5 w-5" />
                            </div>
                            <div>
                               <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">{s.title}</h4>
                               <p className="text-sm text-slate-500 font-medium">{s.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="relative">
                    <div className="absolute inset-0 bg-slate-50 rounded-[4rem] -rotate-6 scale-95" />
                    <div className="relative bg-slate-900 p-12 md:p-20 rounded-[4rem] shadow-2xl flex flex-col items-center text-center overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full" />
                       <Shield className="h-32 w-32 text-indigo-500 mb-10 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                       <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-4 italic">Neural Security Protocol</h3>
                       <div className="flex gap-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                          {/* Mock Security Badges */}
                          <div className="px-4 py-2 border border-white/20 rounded-xl text-[10px] font-black text-white uppercase">ISO 27001</div>
                          <div className="px-4 py-2 border border-white/20 rounded-xl text-[10px] font-black text-white uppercase">GDPR Ready</div>
                          <div className="px-4 py-2 border border-white/20 rounded-xl text-[10px] font-black text-white uppercase">SOC 2 Type II</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* 8. Mobile App Section */}
        <section className="py-32 bg-slate-50 overflow-hidden">
           <div className="container px-6 mx-auto">
              <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden">
                 <div className="absolute -bottom-20 -right-20 h-96 w-96 bg-indigo-600/20 rounded-full blur-[100px]" />
                 <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="relative z-10">
                       <h2 className="text-4xl lg:text-7xl font-black text-white tracking-tight mb-8 leading-tight italic uppercase">
                          Manage Your Business Anywhere.
                       </h2>
                       <p className="text-slate-400 text-lg font-medium mb-12 max-w-md">
                          Stay in control even when you're offline. Download the mobile ecosystem to sync your entire operation with your pocket.
                       </p>
                       <div className="flex flex-col sm:flex-row gap-5">
                          <Link href="#" className="h-16 px-8 rounded-2xl bg-white text-slate-900 flex items-center gap-4 hover:bg-slate-100 transition-all shadow-xl shadow-black/20">
                             <div className="h-8 w-8 relative"><Image src="/next.svg" alt="App Store" fill className="invert" /></div>
                             <div className="text-left">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Coming soon on</div>
                                <div className="text-lg font-black leading-none tracking-tight">App Store</div>
                             </div>
                          </Link>
                          <Link href="#" className="h-16 px-8 rounded-2xl bg-slate-800 text-white flex items-center gap-4 hover:bg-slate-700 transition-all border border-white/10 shadow-xl shadow-black/20">
                             <div className="h-8 w-8 relative"><Image src="/vercel.svg" alt="Play Store" fill className="invert" /></div>
                             <div className="text-left">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none mb-1">Available soon on</div>
                                <div className="text-lg font-black leading-none tracking-tight">Google Play</div>
                             </div>
                          </Link>
                       </div>
                    </div>
                    
                    <div className="relative flex justify-center lg:justify-end h-[500px]">
                       <motion.div 
                         initial={{ y: 100 }}
                         whileInView={{ y: 0 }}
                         transition={{ duration: 1 }}
                         className="relative z-20 w-[240px] h-[480px] bg-slate-800 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden"
                       >
                          <div className="absolute top-0 w-full h-6 bg-slate-800 z-30 flex justify-center items-center"><div className="h-1.5 w-16 bg-slate-700 rounded-full" /></div>
                          <Image src="/images/dashboard-preview-2.png" alt="Mobile App" fill className="object-cover" />
                       </motion.div>
                       
                       <motion.div 
                         initial={{ y: 200 }}
                         whileInView={{ y: 50 }}
                         transition={{ duration: 1.2 }}
                         className="absolute right-24 z-10 w-[220px] h-[440px] bg-slate-800 rounded-[2.5rem] border-4 border-slate-700 shadow-2xl overflow-hidden opacity-50"
                       >
                          <Image src="/images/dashboard-preview-1.png" alt="Mobile App 2" fill className="object-cover" />
                       </motion.div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* 9. Final Call-to-Action Section */}
        <section className="py-32 bg-white relative overflow-hidden">
           <div className="container px-6 mx-auto text-center relative z-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto"
              >
                 <h2 className="text-5xl lg:text-8xl font-[1000] tracking-tighter text-slate-900 leading-none mb-12 uppercase italic">
                    Ready to <span className="text-indigo-600">Transform</span> Your Business?
                 </h2>
                 <p className="text-xl text-slate-500 font-medium mb-16 max-w-2xl mx-auto leading-relaxed">
                    Join thousands of visionary entrepreneurs across the continent who are scaling with Protech. Start your 14-day trial today.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link 
                      href="/register" 
                      className="h-20 px-12 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                      Start Free Trial
                    </Link>
                    <Link 
                      href="#" 
                      className="h-20 px-12 rounded-[2rem] border-4 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 text-xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                      Schedule Demo
                    </Link>
                 </div>
              </motion.div>
           </div>
           
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-50/50 -z-10 blur-3xl opacity-50 rounded-full" />
        </section>

        {/* 10. Footer */}
        <footer className="bg-slate-950 text-white pt-24 pb-12 transition-colors">
          <div className="container px-6 mx-auto">
            <div className="grid lg:grid-cols-12 gap-16 mb-24">
              <div className="lg:col-span-5">
                <Link className="flex items-center gap-3 mb-10 group" href="/">
                   <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 shadow-xl">
                      <Image src="/images/logo.jpeg" alt="Logo" fill className="object-cover" />
                   </div>
                   <span className="font-[1000] text-3xl text-white tracking-tighter italic">PROTECH</span>
                </Link>
                <p className="text-slate-400 font-medium text-lg leading-relaxed mb-12 max-w-sm">
                  The mission-critical digital infrastructure for Africa's most ambitious commercial entities.
                </p>
                <div className="flex gap-6">
                   {["Twitter", "LinkedIn", "Instagram", "Facebook"].map((soc) => (
                     <Link key={soc} href="#" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">
                        {soc}
                     </Link>
                   ))}
                </div>
              </div>
              
              <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-12">
                 {[
                   { title: "Company", links: ["About Us", "Impact", "Careers", "Newsroom"] },
                   { title: "Products", links: ["Inventory", "POS Terminal", "Warehouse", "API"] },
                   { title: "Resources", links: ["Help Center", "Blog", "Status", "Developer"] },
                   { title: "Support", links: ["Contact Us", "Training", "Sales", "Security"] }
                 ].map((col, i) => (
                   <div key={i}>
                      <h4 className="font-black text-white mb-8 uppercase tracking-[0.3em] text-[10px] italic">{col.title}</h4>
                      <ul className="space-y-5 text-sm font-bold text-slate-400">
                         {col.links.map(link => <li key={link}><Link href="#" className="hover:text-indigo-400 transition-colors uppercase tracking-widest text-[10px]">{link}</Link></li>)}
                      </ul>
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">All Cloud Systems Operational</span>
               </div>
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 Protech Assist SL Limited. Global Intelligence Cluster.</p>
               <div className="flex gap-10 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  <Link href="#" className="hover:text-white transition-colors">Legal</Link>
                  <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                  <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
               </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
