"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, Shield, ShoppingCart, TrendingUp, Box, Truck, Users, HardHat, 
  GraduationCap, Building2, Check, Heart, Clock, Code2, Laptop, Database, 
  Network, Cloud, Headphones, ExternalLink, Utensils, Quote, Store, PlusSquare,
  ChevronDown, Globe, MessageSquare, BarChart, Layers, Menu, X, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { PricingSection } from "@/components/shared/pricing-section";
import { ExpertPopup } from "@/components/shared/expert-popup";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// African Countries List
const countries = [
  { name: "Algeria", code: "dz" },
  { name: "Angola", code: "ao" },
  { name: "Benin", code: "bj" },
  { name: "Botswana", code: "bw" },
  { name: "Burkina Faso", code: "bf" },
  { name: "Burundi", code: "bi" },
  { name: "Cabo Verde", code: "cv" },
  { name: "Cameroon", code: "cm" },
  { name: "CAR", code: "cf" },
  { name: "Chad", code: "td" },
  { name: "Comoros", code: "km" },
  { name: "Congo", code: "cg" },
  { name: "DR Congo", code: "cd" },
  { name: "Djibouti", code: "dj" },
  { name: "Egypt", code: "eg" },
  { name: "Equatorial Guinea", code: "gq" },
  { name: "Eritrea", code: "er" },
  { name: "Eswatini", code: "sz" },
  { name: "Ethiopia", code: "et" },
  { name: "Gabon", code: "ga" },
  { name: "Gambia", code: "gm" },
  { name: "Ghana", code: "gh" },
  { name: "Guinea", code: "gn" },
  { name: "Guinea-Bissau", code: "gw" },
  { name: "Ivory Coast", code: "ci" },
  { name: "Kenya", code: "ke" },
  { name: "Lesotho", code: "ls" },
  { name: "Liberia", code: "lr" },
  { name: "Libya", code: "ly" },
  { name: "Madagascar", code: "mg" },
  { name: "Malawi", code: "mw" },
  { name: "Mali", code: "ml" },
  { name: "Mauritania", code: "mr" },
  { name: "Mauritius", code: "mu" },
  { name: "Morocco", code: "ma" },
  { name: "Mozambique", code: "mz" },
  { name: "Namibia", code: "na" },
  { name: "Niger", code: "ne" },
  { name: "Nigeria", code: "ng" },
  { name: "Rwanda", code: "rw" },
  { name: "Sao Tome", code: "st" },
  { name: "Senegal", code: "sn" },
  { name: "Seychelles", code: "sc" },
  { name: "Sierra Leone", code: "sl" },
  { name: "Somalia", code: "so" },
  { name: "South Africa", code: "za" },
  { name: "South Sudan", code: "ss" },
  { name: "Sudan", code: "sd" },
  { name: "Tanzania", code: "tz" },
  { name: "Togo", code: "tg" },
  { name: "Tunisia", code: "tn" },
  { name: "Uganda", code: "ug" },
  { name: "Zambia", code: "zm" },
  { name: "Zimbabwe", code: "zw" },
];

export default function ProtechCloudHomepage() {
  const { data: session } = useSession();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === "sl") || countries[0]);

  const hasUsedTrial = !!session?.user?.trialEndDate;
  const isTrialExpired = hasUsedTrial && new Date(session?.user?.trialEndDate || 0) < new Date();

  const ctaText = isTrialExpired || hasUsedTrial ? "Upgrade Now" : "Start Your Free Trial";
  const ctaHref = isTrialExpired || hasUsedTrial ? "/pricing" : "/register";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* 1. Global Navigation */}
      <header className="fixed top-0 w-full z-[100] bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
        <nav className="container mx-auto px-4 sm:px-6 h-20 lg:h-24 flex items-center justify-between">
          <Link className="flex items-center gap-2 sm:gap-3 shrink-0" href="/">
            <div className="relative h-10 w-10 lg:h-14 lg:w-14 overflow-hidden rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 bg-white shrink-0">
              <Image src="/images/logo.jpeg" alt="Protech Logo" fill sizes="(max-width: 1024px) 40px, 56px" className="object-cover" unoptimized />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg lg:text-2xl tracking-tight text-slate-900 dark:text-white leading-tight">
                Protech Assist
              </span>
              <span className="text-[10px] lg:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mt-0.5 whitespace-nowrap">
                Enterprise Inventory OS
              </span>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-8">
            {["Features", "Solutions", "Services", "Pricing", "Security"].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Globe Icon with Dropdown */}
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setShowCountryDropdown(true)}
              onMouseLeave={() => setShowCountryDropdown(false)}
            >
              <div className="flex items-center gap-1 sm:gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 sm:p-2">
                <div className="relative h-7 w-7 lg:h-10 lg:w-10 rounded-full overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                   <img src="/images/globe-icon.jpg" alt="Globe" className="w-full h-full object-cover" />
                </div>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              
              <div 
                className={`absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200 origin-top-right ${showCountryDropdown ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
              >
                <div className="p-2 max-h-80 overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    Select Region
                    {selectedCountry && (
                      <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <img src={`https://flagcdn.com/w20/${selectedCountry.code}.png`} width="16" alt={selectedCountry.name} className="rounded-sm" />
                        {selectedCountry.code.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {countries.map((country) => (
                    <button 
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors flex items-center gap-3 ${selectedCountry.code === country.code ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}
                    >
                      <img src={`https://flagcdn.com/w20/${country.code}.png`} width="20" alt={country.name} className="shadow-sm rounded-sm" />
                      {country.name}
                      {selectedCountry.code === country.code && <Check className="h-4 w-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/login" className="hidden xl:flex h-9 sm:h-10 lg:h-12 px-4 lg:px-6 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-sm lg:text-lg font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all whitespace-nowrap">
              Login
            </Link>
            <Link 
              href={ctaHref} 
              className="hidden xl:flex h-9 px-3 sm:h-10 sm:px-6 lg:h-12 lg:px-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm lg:text-lg font-semibold shadow-sm transition-all items-center justify-center whitespace-nowrap shrink-0 min-w-max"
            >
              {ctaText}
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="xl:hidden p-1 sm:p-2 -mr-1 sm:-mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6 lg:h-8 lg:w-8" /> : <Menu className="h-6 w-6 lg:h-8 lg:w-8" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {["Features", "Solutions", "Services", "Pricing", "Security"].map((item) => (
                <Link 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                >
                  {item}
                </Link>
              ))}
              
              <div className="flex flex-col gap-3 mt-4">
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full h-12 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href={ctaHref} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full h-12 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-colors"
                >
                  {ctaText}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pt-28">
        
        {/* 2. Hero Section */}
        <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
          <div className="container px-6 mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-medium mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              Trusted by Businesses Across Sierra Leone
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-8 max-w-5xl mx-auto">
               Africa's Most Advanced <br className="hidden md:block" />
               <span className="text-indigo-600 dark:text-indigo-400">Enterprise OS</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Designed by Protech Assist (SL) Limited to provide mission-critical intelligence for retail, wholesale, and distribution enterprises across the continent.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="h-14 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center shrink-0 min-w-max"
              >
                Try It Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsDemoModalOpen(true)}
                className="h-14 px-8 text-base font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-lg shadow-sm transition-all flex items-center justify-center"
              >
                Book a Live Demo
              </button>
            </div>

            {/* Dashboard Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden aspect-[16/10] bg-slate-100 dark:bg-slate-900"
            >
              <Image src="/images/dashboard-preview-2.png" alt="Protech Dashboard" fill className="object-cover" />
            </motion.div>
          </div>
        </section>

        {/* Infinite Scrolling Marquee */}
        <section className="py-12 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 overflow-hidden">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 text-center mb-8">Trusted by industry leaders in</p>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
            <motion.div 
              animate={{ x: ["0%", "-50%"] }} 
              transition={{ ease: "linear", duration: 40, repeat: Infinity }} 
              className="flex whitespace-nowrap items-center w-max"
            >
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex gap-16 pr-16 items-center">
                  {["Retail", "Supermarkets", "Pharmacies", "Bars & Restaurants", "Wholesale", "Hardware", "Distribution", "Schools", "NGOs", "Manufacturing"].map((brand, i) => (
                    <span key={i} className="text-xl md:text-2xl font-bold text-slate-400 dark:text-slate-600">
                      {brand}
                    </span>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 3. Corporate Services */}
        <section id="services" className="py-24 bg-white dark:bg-slate-950">
           <div className="container px-6 mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
                 <div className="max-w-2xl">
                    <div className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">More Than Software</div>
                    <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                       Protech Assist Technology Group
                    </h2>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                       We provide complete end-to-end technology solutions for businesses across Sierra Leone and Africa.
                    </p>
                 </div>
                 <Link href="/portfolio" className="h-12 px-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold flex items-center gap-2 transition-colors">
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
                   <div key={i} className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300">
                      <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                         <service.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{service.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{service.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 4. Core Modules */}
        <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/20 border-y border-slate-200 dark:border-slate-800">
           <div className="container px-6 mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16">
                 <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                    Complete Business Operating System
                 </h2>
                 <p className="text-lg text-slate-600 dark:text-slate-400">Manage every department from one unified dashboard with real-time intelligence.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { title: "Inventory", desc: "Monitor stock, movements, batches, and transfers.", icon: Box, href: "/dashboard/inventory" },
                   { title: "Sales & POS", desc: "Fast checkout, receipt printing, and analytics.", icon: ShoppingCart, href: "/dashboard/pos" },
                   { title: "Purchasing", desc: "Manage suppliers and automate replenishment.", icon: Truck, href: "/dashboard/purchases" },
                   { title: "CRM & Loyalty", desc: "Track customer credit and loyalty programs.", icon: Users, href: "/dashboard/customers" },
                   { title: "Finance", desc: "Full P&L tracking, income, and expenses.", icon: BarChart, href: "/dashboard/accounting" },
                   { title: "Intelligence", desc: "Powerful dashboards with real-time analytics.", icon: BarChart, href: "/dashboard/analytics" },
                   { title: "Multi-Warehouse", desc: "Control multiple branches from one hub.", icon: Globe, href: "/dashboard/system" },
                   { title: "Multi-Unit", desc: "Sell by Piece, Carton, or Case automatically.", icon: Layers, href: "/dashboard/inventory" },
                   { title: "Invoicing", desc: "Create and share professional invoices instantly.", icon: FileText, href: "/dashboard/sales/invoices", isModal: true },
                 ].map((mod, i) => {
                    if (mod.isModal) {
                      return (
                       <div key={i} onClick={() => setShowInvoicesModal(true)} className="group block p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:-translate-y-1 cursor-pointer overflow-hidden relative">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 flex items-center justify-center mb-4 transition-colors relative z-10">
                             <mod.icon className="h-5 w-5" />
                          </div>
                          <h4 className="text-lg font-bold mb-2 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">{mod.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed relative z-10 mb-4">{mod.desc}</p>
                          <div className="relative h-48 -mx-6 -mb-6 mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Image src="/images/invoices.png" alt="Invoices feature preview" fill className="object-cover object-top" unoptimized />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent pointer-events-none" />
                          </div>
                       </div>
                      )
                    }
                    return (
                      <Link href={mod.href} key={i} className="group block p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:-translate-y-1 cursor-pointer">
                         <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 flex items-center justify-center mb-4 transition-colors">
                            <mod.icon className="h-5 w-5" />
                         </div>
                         <h4 className="text-lg font-bold mb-2 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{mod.title}</h4>
                         <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{mod.desc}</p>
                      </Link>
                    );
                 })}
              </div>
           </div>
        </section>

        {/* 5. Industries */}
        <section id="solutions" className="py-24 bg-white dark:bg-slate-950">
           <div className="container px-6 mx-auto">
              <div className="text-center mb-16">
                 <div className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">Vertical Intelligence</div>
                 <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">Built For Your Industry.</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                   <div key={i} className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <ind.icon className="h-8 w-8 text-indigo-500 mb-3" />
                      <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{ind.name}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 6. Security */}
        <section id="security" className="py-24 bg-slate-900 text-white">
           <div className="container px-6 mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                 <div>
                    <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4">
                       Data Integrity <br /> <span className="text-indigo-400">Without Compromise.</span>
                    </h2>
                    <p className="text-lg text-slate-400 mb-8">Enterprise Security with 99.99% Infrastructure Resilience.</p>
                    
                    <div className="space-y-6">
                       {[
                         { title: "Encrypted Data Protection", desc: "Industry-standard AES-256 encryption for all data at rest and in transit." },
                         { title: "Automated Cloud Backup", desc: "Redundant geographic backups ensuring no data is ever lost." },
                         { title: "Multi-User Access Control", desc: "Granular RBAC permissions for managers, cashiers, and admins." },
                         { title: "Audit Logs & Tracking", desc: "Every single business action is logged for complete forensic visibility." },
                       ].map((s, i) => (
                         <div key={i} className="flex gap-4">
                            <div className="h-6 w-6 mt-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                               <Check className="h-4 w-4" />
                            </div>
                            <div>
                               <h4 className="font-bold text-base mb-1">{s.title}</h4>
                               <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="flex justify-center">
                    <div className="relative w-full max-w-md bg-slate-800 rounded-2xl p-10 border border-slate-700 shadow-2xl flex flex-col items-center text-center">
                       <div className="h-24 w-24 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                          <Shield className="h-12 w-12" />
                       </div>
                       <h3 className="text-2xl font-bold mb-2">Enterprise Security</h3>
                       <p className="text-slate-400 text-sm">Your data is safe, secure, and always accessible when you need it.</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Pricing Section */}
        <div className="bg-slate-50 dark:bg-slate-950/20 pt-10">
          <PricingSection selectedCountry={selectedCountry} />
        </div>

        {/* 7. Social Proof */}
        <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
           <div className="container px-6 mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                 <div className="space-y-8">
                    <div>
                       <div className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">Real-World Impact</div>
                       <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                          Trusted by Industry Leaders.
                       </h2>
                       <p className="text-lg text-slate-600 dark:text-slate-400">
                          More than 75% of our customers report lasting operational impacts within the first 30 days of implementation.
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       {[
                         { value: "1-3 hrs", label: "Saved in order processing daily", icon: Clock },
                         { value: "20-30%", label: "Reduction in inventory wastage", icon: TrendingUp },
                       ].map((stat, i) => (
                         <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <stat.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-4" />
                            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-slate-900 rounded-3xl p-10 relative shadow-2xl overflow-hidden">
                    <Quote className="absolute top-6 right-6 h-32 w-32 text-white/5 pointer-events-none" />
                    <div className="relative z-10">
                       <h3 className="text-2xl font-medium text-white leading-relaxed italic mb-8">
                          "The multi-branch control changed how we operate. Real-time tracking is a lifesaver for our distribution network."
                       </h3>
                       <div>
                          <p className="text-lg font-bold text-white">Aminata Bangura</p>
                          <p className="text-sm font-medium text-indigo-400">CEO, Eastside Pharmacy</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* 8. Final CTA */}
        <section className="py-24 bg-indigo-600 text-white text-center">
           <div className="container px-6 mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                 READY TO TRANSFORM?
              </h2>
              <p className="text-lg text-indigo-100 font-medium mb-10 max-w-2xl mx-auto">
                 Join the growing number of businesses using Protech Assist to increase profits and reduce operational losses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link href={ctaHref} className="h-14 px-8 rounded-xl bg-white text-slate-900 font-bold text-lg hover:bg-indigo-50 shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 min-w-max w-fit mx-auto sm:mx-0">
                  {ctaText} Today <ArrowRight className="h-5 w-5" />
                </Link>
                 <button 
                   onClick={() => setIsDemoModalOpen(true)}
                   className="h-14 px-8 rounded-lg border-2 border-indigo-400 hover:bg-indigo-700 text-white text-base font-bold transition-colors flex items-center justify-center shrink-0 min-w-max"
                 >
                   Schedule Live Demo
                 </button>
              </div>
           </div>
        </section>

        {/* 9. Footer */}
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-20 pb-10">
          <div className="container px-6 mx-auto">
            <div className="grid lg:grid-cols-12 gap-12 mb-16">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3 mb-6">
                   <div className="relative h-10 w-10 overflow-hidden rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 bg-white">
                      <Image src="/images/logo.jpeg" alt="Logo" fill sizes="40px" className="object-cover" />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-bold text-lg text-slate-900 dark:text-white leading-tight">PROTECH ASSIST</span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">(SL) LIMITED</span>
                   </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  Your Business. Our Tech. Better Tomorrow.
                </p>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                   <p>Email: protechassist36@gmail.com</p>
                   <p>Location: Freetown, Sierra Leone</p>
                   <p>Phone: +232 34 955581</p>
                </div>
              </div>
              
              <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                 {[
                   { title: "Products", links: ["Inventory OS", "POS Terminals", "Warehouse Hub", "Cloud API"] },
                   { title: "Industries", links: ["Retail", "Pharmacy", "Distributors", "NGOs"] },
                   { title: "Company", links: ["Our Mission", "Corporate Services", "Careers", "Security"] },
                   { title: "Legal", links: ["Terms of Service", "Privacy Policy", "SLA Agreement", "Refunds"] }
                 ].map((col, i) => (
                   <div key={i}>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-4">{col.title}</h4>
                      <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                         {col.links.map(link => <li key={link}><Link href="#" className="hover:text-indigo-600 transition-colors">{link}</Link></li>)}
                      </ul>
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-sm text-slate-500">
                  © 2026 PROTECH ASSIST (SL) LIMITED. ALL RIGHTS RESERVED.
               </p>
               <div className="flex gap-6 text-sm text-slate-500">
                  <Link href="#" className="hover:text-indigo-600 transition-colors">Documentation</Link>
                  <Link href="#" className="hover:text-indigo-600 transition-colors">Server Status</Link>
                  <Link href="#" className="hover:text-indigo-600 transition-colors">Global Support</Link>
               </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Demo Booking Modal */}
      <Dialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Book Your Live Demo
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2">
              Experience the power of Enterprise Inventory OS firsthand. Choose your preferred method to connect.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <a 
              href="https://wa.me/23234955581" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-500 uppercase">Instant Response</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">Book via WhatsApp</div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </a>

            <a 
              href="mailto:protechassist36@gmail.com?subject=Enterprise%20Inventory%20OS%20Demo%20Request" 
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Globe className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-500 uppercase">Official Channel</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">Schedule via Email</div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInvoicesModal} onOpenChange={setShowInvoicesModal}>
        <DialogContent className="sm:max-w-4xl bg-white dark:bg-slate-950 p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
          <div className="relative h-[65vh] w-full bg-slate-900 flex items-end">
            <Image 
              src="/images/invoices.png" 
              alt="Create and share professional invoices instantly" 
              fill 
              className="object-cover object-top opacity-60 mix-blend-screen"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
            <div className="relative z-10 w-full p-8 sm:p-12 flex flex-col items-start gap-4">
              <div className="flex items-center gap-3">
                 <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
                   <FileText className="h-6 w-6 text-white" />
                 </div>
                 <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Professional Invoicing</h2>
              </div>
              <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
                Create, customize, and share professional invoices instantly. Automatically track payments, send reminders, and manage your receivables seamlessly without leaving the platform.
              </p>
              <div className="flex flex-wrap gap-4 mt-4 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    setShowInvoicesModal(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center flex-1 sm:flex-none text-center"
                >
                  Try Now
                </button>
                <button 
                  onClick={() => setShowInvoicesModal(false)} 
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-8 py-3.5 rounded-xl font-bold transition-all flex-1 sm:flex-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExpertPopup />

      {/* Auth Selection Modal */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-2xl bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">Welcome to Protech Assist</DialogTitle>
            <DialogDescription className="text-center pt-2 text-base text-slate-600 dark:text-slate-400">
              To connect to the system, please select an option below:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-6 mb-4 px-2">
            <Link 
              href="/login" 
              className="w-full h-14 flex items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 font-bold text-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              Login to Existing Account
            </Link>
            <Link 
              href="/register" 
              className="w-full h-14 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-md transition-all"
            >
              Create New Account
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
