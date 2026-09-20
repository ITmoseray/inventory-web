"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowRight, Wand2, Shield, ShoppingCart, TrendingUp, Box, Truck, Users, HardHat, 
  GraduationCap, Building2, Check, Heart, Clock, Code2, Laptop, Database, 
  Network, Cloud, Headphones, ExternalLink, Utensils, Quote, Store, PlusSquare,
  ChevronDown, Globe, MessageSquare, BarChart3, Layers, Menu, X, FileText,
  Briefcase, Stethoscope, Play, Phone, Mail, MapPin, ShieldCheck,
  CheckCircle2, AlertTriangle, Activity, Lock, Cpu, DollarSign, RefreshCw, Brain
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { PricingSection } from "@/components/shared/pricing-section";
import { ExpertPopup } from "@/components/shared/expert-popup";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { AnnouncementBanner } from "@/components/shared/announcement-banner";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { InteractivePosSandbox } from "@/components/landing/interactive-pos-sandbox";
import { RoiCalculatorSection } from "@/components/landing/roi-calculator-section";
import { IndustrySolutionTabs } from "@/components/landing/industry-solution-tabs";
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
  { name: "Sierra Leone", code: "sl" },
  { name: "Liberia", code: "lr" },
  { name: "Guinea", code: "gn" },
  { name: "Ghana", code: "gh" },
  { name: "Nigeria", code: "ng" },
  { name: "Kenya", code: "ke" },
  { name: "Rwanda", code: "rw" },
  { name: "South Africa", code: "za" },
  { name: "Egypt", code: "eg" },
  { name: "Morocco", code: "ma" },
];

export default function ProtechCloudHomepage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [heroAiPrompt, setHeroAiPrompt] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [previewFeature, setPreviewFeature] = useState<any | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const hasUsedTrial = !!session?.user?.trialEndDate;
  const isTrialExpired = hasUsedTrial && new Date(session?.user?.trialEndDate || 0) < new Date();

  const ctaText = isTrialExpired || hasUsedTrial ? "Upgrade to Pro" : "Start Free Trial";
  const ctaHref = isTrialExpired || hasUsedTrial ? "/pricing" : "/register";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      <AnnouncementBanner />

      {/* ── 1. GLOBAL NAVIGATION ───────────────────────────────────── */}
      <header className="sticky top-0 w-full z-[100] bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
        <nav className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Tagline */}
          <Link className="flex items-center gap-1.5 sm:gap-3 shrink-0 group min-w-0" href="/">
            <div className="relative h-8 w-8 sm:h-11 sm:w-11 overflow-hidden rounded-xl shadow-md border border-slate-200 dark:border-slate-800 bg-white group-hover:scale-105 transition-transform shrink-0">
              <Image src="/images/PA.png" alt="ProTech Assist Logo" fill sizes="44px" className="object-cover p-0.5 sm:p-1" unoptimized />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-xs sm:text-lg lg:text-xl tracking-tight text-slate-900 dark:text-white leading-tight whitespace-nowrap">
                ProTech Assist
              </span>
              <span className="text-[7px] sm:text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none mt-0.5 whitespace-nowrap">
                Enterprise OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center gap-1 2xl:gap-2.5">
            {[
              { label: "AI Store", href: "#ai-store", isNew: true },
              { label: "Capabilities", href: "#capabilities" },
              { label: "Industries", href: "#solutions" },
              { label: "POS Terminal", href: "#pos-sandbox" },
              { label: "ROI Calculator", href: "#roi-calculator" },
              { label: "Security", href: "#security" },
              { label: "Pricing", href: "#pricing" },
              { label: "Company", href: "#services" },
            ].map((item) => (
              <Link 
                key={item.label} 
                href={item.href} 
                className="px-2.5 2xl:px-3.5 py-1.5 rounded-xl text-xs 2xl:text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                {item.isNew && (
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-600 text-[9px] font-black text-white uppercase tracking-wider shadow-xs">
                    AI
                  </span>
                )}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Globe Icon with Region Dropdown */}
            <div 
              className="relative cursor-pointer group shrink-0"
              onMouseEnter={() => setShowCountryDropdown(true)}
              onMouseLeave={() => setShowCountryDropdown(false)}
            >
              <button 
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="flex items-center gap-1 p-1 sm:px-2.5 sm:py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 transition-all shadow-xs shrink-0"
                title="Select Region"
              >
                <div className="relative h-5 w-5 sm:h-8 sm:w-8 rounded-full overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                  <img src="/images/globe-icon.jpg" alt="Globe" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 pr-0.5">
                  <img src={`https://flagcdn.com/w20/${selectedCountry.code}.png`} width="14" alt={selectedCountry.name} className="rounded-xs hidden sm:inline-block" />
                  <span className="uppercase text-[9px] sm:text-[11px] font-black">{selectedCountry.code}</span>
                  <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60" />
                </div>
              </button>
              
              {showCountryDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-48 sm:w-52 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 p-1.5 animate-in fade-in slide-in-from-top-1">
                  <div className="px-2.5 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Select Operating Region
                  </div>
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setSelectedCountry(c);
                        setShowCountryDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <img src={`https://flagcdn.com/w20/${c.code}.png`} width="16" alt={c.name} className="rounded-xs" />
                        {c.name}
                      </span>
                      {selectedCountry.code === c.code && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Login & CTA */}
            <Link 
              href="/login" 
              className="hidden sm:flex h-10 px-4 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs shrink-0"
            >
              Login
            </Link>

            <Link 
              href={ctaHref} 
              className="hidden sm:flex h-10 px-4 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Stacked Actions: Login directly on top of Start Free Trial */}
            <div className="sm:hidden flex flex-col items-stretch gap-0.5 shrink-0">
              <Link 
                href="/login" 
                className="h-5 px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[8.5px] font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center justify-center text-center shadow-xs leading-none"
              >
                Login
              </Link>
              <Link 
                href={ctaHref} 
                className="h-5 px-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[8px] font-black uppercase tracking-wider shadow-xs flex items-center justify-center text-center whitespace-nowrap leading-none"
              >
                <span>{ctaText}</span>
              </Link>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="xl:hidden p-1 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-4 space-y-2 animate-in slide-in-from-top-2">
            {[
              { label: "AI Store", href: "#ai-store" },
              { label: "Capabilities", href: "#capabilities" },
              { label: "Industries", href: "#solutions" },
              { label: "POS Terminal", href: "#pos-sandbox" },
              { label: "ROI Calculator", href: "#roi-calculator" },
              { label: "Security", href: "#security" },
              { label: "Pricing", href: "#pricing" },
              { label: "Company", href: "#services" },
            ].map((item) => (
              <Link 
                key={item.label} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200"
              >
                Login
              </Link>
              <Link 
                href={ctaHref} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full h-11 flex items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/30"
              >
                {ctaText}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ── 2. HERO SECTION ────────────────────────────────────────── */}
        <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
          {/* Subtle Enterprise Gradient Glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center relative z-10 space-y-6 sm:space-y-8">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50/80 dark:bg-indigo-950/40 backdrop-blur-md text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xs">
              <span>ProTech Assist Enterprise OS • Empowering Businesses Through Technology</span>
            </div>

            {/* Core Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12] max-w-5xl mx-auto">
              Run Your Entire Business <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-400 dark:via-indigo-300 dark:to-purple-400">
                From One Powerful System.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
              ProTech Assist combines enterprise inventory control, ultra-fast point of sale, customer credit ledgers, multi-warehouse tracking, financial profit & loss, and integrated AI intelligence into one unified operating system.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link 
                href={ctaHref}
                className="w-full sm:w-auto h-13 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button 
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full sm:w-auto h-13 px-7 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current opacity-70" />
                <span>Book a Demo</span>
              </button>

              <a 
                href="#pos-sandbox"
                className="w-full sm:w-auto h-13 px-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Try Live POS</span>
              </a>
            </div>

            {/* ProTech AI Store Quick Prompt Banner */}
            <div id="ai-store" className="max-w-2xl mx-auto pt-4 text-left">
              <div className="rounded-3xl p-4 sm:p-5 bg-white dark:bg-slate-900 border border-indigo-500/30 dark:border-indigo-500/40 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white">AI Storefront Builder</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">Instant</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Describe your store. AI designs your catalog with WhatsApp checkout in 30 seconds.</p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = heroAiPrompt.trim();
                    const targetUrl = session?.user
                      ? (trimmed ? `/dashboard/store-builder?prompt=${encodeURIComponent(trimmed)}` : "/dashboard/store-builder")
                      : (trimmed ? `/create-store?prompt=${encodeURIComponent(trimmed)}` : "/create-store");
                    router.push(targetUrl);
                  }}
                  className="mt-3 flex flex-col sm:flex-row items-stretch gap-2"
                >
                  <input
                    type="text"
                    value={heroAiPrompt}
                    onChange={(e) => setHeroAiPrompt(e.target.value)}
                    placeholder="e.g. A boutique selling ladies shoes and dresses in Freetown with WhatsApp delivery..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  >
                    
                    <span>Build Store</span>
                  </button>
                </form>
              </div>
            </div>

            {/* ── REAL PRODUCT DASHBOARD PREVIEW ────────────────────── */}
            <div className="pt-8 max-w-6xl mx-auto">
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-left">
                {/* Simulated Window Top Bar */}
                <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-3 text-xs font-mono text-slate-400 font-bold hidden sm:inline">
                      ProTech Assist Enterprise OS v2.4 • Mission Command
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>All Trade Nodes Online</span>
                  </div>
                </div>

                {/* Dashboard Showcase Grid */}
                <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/40">
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Today's Revenue</span>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">SLE 48,250</div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +14.8% vs yesterday
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Stock Value</span>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">SLE 842,600</div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">1,240 Verified SKUs</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Net Profit Margin</span>
                      <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">32.4%</div>
                      <span className="text-[11px] font-bold text-slate-500">Automated ledger</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">AI Alerts</span>
                      <div className="text-xl sm:text-2xl font-black text-amber-500">3 Low Stock</div>
                      <span className="text-[11px] font-bold text-slate-500">Auto reorder suggested</span>
                    </div>
                  </div>

                  {/* Split Preview: Recent Sales Table + AI Intelligence Box */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Live Transactions Stream</h4>
                        <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">Real-Time</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {[
                          { id: "INV-2026-882", customer: "Dr. Stevens Pharmacy", items: "12x Antibiotics & Syringes", amount: "SLE 3,850", status: "PAID", method: "Orange Money" },
                          { id: "INV-2026-881", customer: "Aberdeen Supermarket", items: "5x Jasmine Rice 25kg", amount: "SLE 2,400", status: "PAID", method: "AfriMoney" },
                          { id: "INV-2026-880", customer: "Kissy Road Electronics", items: "2x 4K OLED Smart TV", amount: "SLE 14,800", status: "CREDIT", method: "Credit 14 Days" },
                        ].map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 dark:text-white block">{tx.customer}</span>
                              <span className="text-slate-400 text-[11px]">{tx.items} • {tx.method}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-slate-900 dark:text-white block">{tx.amount}</span>
                              <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${tx.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                {tx.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 p-5 space-y-4 text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-black text-sm">AI Executive Copilot</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        "Your top-selling SKU <strong>Jasmine Rice 25kg</strong> is selling 2.4x faster than usual. Stock will deplete in 4 days. Reorder 50 bags now to avoid stockout."
                      </p>
                      <div className="pt-2">
                        <button className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors">
                          Generate Purchase Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. 14 CORE CAPABILITIES ────────────────────────────────── */}
        <section id="capabilities" className="py-20 sm:py-28 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                COMPLETE BUSINESS ARCHITECTURE
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Everything Your Business Needs to Scale
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Eliminate disconnected tools and spreadsheets. Enterprise OS replaces up to 8 separate software subscriptions with one unified commercial platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[
                { title: "Inventory Management", desc: "Real-time stock counts, multi-location warehouses, unit conversions, and low-stock alerts.", icon: Box },
                { title: "Point of Sale (POS)", desc: "Lightning-fast retail terminal with barcode scanning, offline sync, and thermal receipts.", icon: ShoppingCart },
                { title: "Sales & Orders", desc: "Track draft orders, confirmed sales, invoices, refunds, and delivery dispatches.", icon: FileText },
                { title: "Customer Credit & Ledgers", desc: "Detailed customer purchasing histories, credit limits, payment terms, and automated reminders.", icon: Users },
                { title: "Suppliers & Purchasing", desc: "Purchase orders, supplier directories, goods receipt notes, and automated replenishment.", icon: Truck },
                { title: "Expenses & Profit/Loss", desc: "Track business operating costs, category tagging, cash flow, and real-time net profit.", icon: TrendingUp },
                { title: "AI Business Assistant", desc: "Proactive commercial intelligence: reorder warnings, sales velocity, and executive summaries.", icon: Brain },
                { title: "Stock Forecasting", desc: "Machine-learning demand prediction to prevent costly overstock and stockouts.", icon: BarChart3 },
                { title: "Multi-Warehouse Control", desc: "Transfer goods between locations with transit tracking and loss reconciliation.", icon: Building2 },
                { title: "Batches & Expiry Dates", desc: "FIFO batch tracking, serial numbers, and automatic expiry date quarantine.", icon: Clock },
                { title: "Financial Reports", desc: "Exportable P&L, balance sheets, tax compliance statements, and revenue analytics.", icon: DollarSign },
                { title: "Audit Trail Logs", desc: "Immutable security logging tracking every price change, sale, stock edit, and staff action.", icon: ShieldCheck },
                { title: "Role-Based Permissions", desc: "Granular access control ensuring cashiers, managers, and accountants see only what they should.", icon: Lock },
                { title: "Omnichannel AI Stores", desc: "Launch an instant online storefront with WhatsApp order integration and synchronized inventory.", icon: Store },
              ].map((cap, i) => (
                <div 
                  key={i} 
                  className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg transition-all duration-300 group space-y-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                    <cap.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">{cap.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. TAILORED INDUSTRY SOLUTIONS ─────────────────────────── */}
        <section id="solutions" className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-800">
          <IndustrySolutionTabs />
        </section>

        {/* ── 5. POS SANDBOX & TERMINAL ──────────────────────────────── */}
        <section id="pos-sandbox" className="py-20 sm:py-28 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
          <InteractivePosSandbox />
        </section>

        {/* ── 6. ROI PROFIT CALCULATOR ───────────────────────────────── */}
        <section id="roi-calculator" className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-800">
          <RoiCalculatorSection />
        </section>

        {/* ── 7. PRICING & TIERS ─────────────────────────────────────── */}
        <section id="pricing" className="py-20 sm:py-28 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
          <PricingSection />
        </section>

        {/* ── 8. TESTIMONIALS & TRUST ────────────────────────────────── */}
        <section id="testimonials" className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-800">
          <TestimonialsSection />
        </section>

        {/* ── 9. ENTERPRISE SECURITY & RELIABILITY ───────────────────── */}
        <section id="security" className="py-20 sm:py-28 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                ENTERPRISE-GRADE ASSURANCE
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Bank-Grade Security & Isolation
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Your business data is confidential, encrypted, and isolated with high-availability infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Tenant Data Isolation", desc: "Every business operates in an isolated tenant schema with zero cross-organization leakage.", icon: Lock },
                { title: "Granular RBAC", desc: "Control precise permissions for cashiers, stock managers, branch supervisors, and auditors.", icon: ShieldCheck },
                { title: "Immutable Audit Trail", desc: "Every inventory adjustment, price change, and voided transaction is permanently timestamped.", icon: FileText },
                { title: "99.9% High Availability", desc: "Built on serverless Postgres with automatic daily backups and real-time offline local cache.", icon: Cloud },
              ].map((sec, i) => (
                <div key={i} className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <sec.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{sec.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{sec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 10. CLOSING CONVERSION CTA ─────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300">
              MISSION CRITICAL BUSINESS OS
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Your Business. Your Data. <br />
              Your Operating System.
            </h2>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
              Join leading retail chains, pharmacies, supermarkets, and distributors across the country running their daily trade on ProTech Assist Enterprise OS.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href={ctaHref} 
                className="w-full sm:w-auto h-14 px-9 rounded-xl bg-white text-slate-950 font-black text-sm uppercase tracking-wider shadow-2xl hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Start Using Enterprise OS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full sm:w-auto h-14 px-8 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Schedule Private Demo</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── 11. FOOTER ─────────────────────────────────────────────── */}
        <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-16 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-xl bg-white p-1">
                  <Image src="/images/PA.png" alt="ProTech Logo" width={40} height={40} className="object-cover" />
                </div>
                <div>
                  <h4 className="font-black text-white text-base">ProTech Assist</h4>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Enterprise OS</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm font-medium">
                Empowering businesses across Sierra Leone and Africa with mission-critical inventory, POS, and financial intelligence.
              </p>
              <div className="space-y-1 text-slate-400 font-medium">
                <p>Email: protechassist36@gmail.com</p>
                <p>Support: +232 73 019699 / 073019699</p>
                <p>Location: Freetown, Sierra Leone</p>
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div>
                <h5 className="font-black uppercase text-white tracking-wider mb-3">Operating Modules</h5>
                <ul className="space-y-2">
                  <li><Link href="#capabilities" className="hover:text-white transition-colors">Inventory OS</Link></li>
                  <li><Link href="#pos-sandbox" className="hover:text-white transition-colors">Retail POS</Link></li>
                  <li><Link href="#ai-store" className="hover:text-white transition-colors">AI Store Builder</Link></li>
                  <li><Link href="#capabilities" className="hover:text-white transition-colors">Customer Ledgers</Link></li>
                </ul>
              </div>

              <div>
                <h5 className="font-black uppercase text-white tracking-wider mb-3">Industries</h5>
                <ul className="space-y-2">
                  <li><Link href="#solutions" className="hover:text-white transition-colors">Supermarkets</Link></li>
                  <li><Link href="#solutions" className="hover:text-white transition-colors">Pharmacies</Link></li>
                  <li><Link href="#solutions" className="hover:text-white transition-colors">Boutiques</Link></li>
                  <li><Link href="#solutions" className="hover:text-white transition-colors">Hardware</Link></li>
                </ul>
              </div>

              <div>
                <h5 className="font-black uppercase text-white tracking-wider mb-3">Company</h5>
                <ul className="space-y-2">
                  <li><Link href="/portfolio" className="hover:text-white transition-colors">Corporate Group</Link></li>
                  <li><Link href="#security" className="hover:text-white transition-colors">Security & SLA</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>

              <div>
                <h5 className="font-black uppercase text-white tracking-wider mb-3">Support</h5>
                <ul className="space-y-2">
                  <li><a href="https://wa.me/23273019699" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp Desk</a></li>
                  <li><button onClick={() => setIsDemoModalOpen(true)} className="hover:text-white transition-colors text-left">Book Demo</button></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">System Login</Link></li>
                  <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-12 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <span>© 2026 ProTech Assist (SL) Limited. All rights reserved.</span>
            <span>Enterprise Business Operating System</span>
          </div>
        </footer>
      </main>

      {/* Demo Booking Modal */}
      <Dialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
              Book Your Enterprise Demo
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-400">
              Speak directly with our technical team to see how Enterprise OS configures for your business.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <a 
              href="https://wa.me/23273019699?text=Hello%20ProTech%20Assist,%20I%20would%20like%20to%20schedule%20a%20live%20demo%20of%20Enterprise%20OS" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase text-emerald-600">Instant WhatsApp</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Chat with an Engineer</div>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-600" />
            </a>

            <a 
              href="mailto:protechassist36@gmail.com?subject=Enterprise%20OS%20Live%20Demo%20Request" 
              className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase text-slate-400">Official Channel</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Schedule via Email</div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <ExpertPopup />
    </div>
  );
}
