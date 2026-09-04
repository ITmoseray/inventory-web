"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Stethoscope, Utensils, GraduationCap, Truck, 
  Check, ArrowRight, Shield, Zap, Sparkles, Building2
} from "lucide-react";
import Link from "next/link";

interface IndustryItem {
  id: string;
  label: string;
  icon: any;
  title: string;
  badge: string;
  description: string;
  highlights: string[];
  stats: { value: string; label: string }[];
}

const INDUSTRIES: IndustryItem[] = [
  {
    id: "retail",
    label: "Supermarket & Retail",
    icon: ShoppingCart,
    title: "High-Speed Cashier Lanes & Zero-Shrinkage Stock Management",
    badge: "Built For High-Volume Checkouts",
    description: "Designed for modern grocery stores, boutiques, and retail chains. Effortlessly handles fast barcode scanning, automated weighing scales, multi-cashier shifts, and NRA GST fiscal invoices.",
    highlights: [
      "Sub-second barcode scanning & offline cashier redundancy",
      "Automated stock re-order thresholds & supplier PO generation",
      "Cash drawer tracking with blind end-of-shift cash reconciliations",
      "Customer loyalty points & WhatsApp receipt dispatch",
    ],
    stats: [
      { value: "0.2s", label: "Checkout Scan Speed" },
      { value: "99.8%", label: "Stock Accuracy" },
      { value: "100%", label: "NRA Tax Compliant" },
    ],
  },
  {
    id: "pharmacy",
    label: "Pharmacy & Clinic",
    icon: Stethoscope,
    title: "Batch Number Expiry Tracking & Clinical Consultation Hub",
    badge: "Pharmacy Board & Health Standard Compliant",
    description: "Unified pharmaceutical inventory and patient records. Tracks controlled drug batches, shelf expiry alerts 90 days in advance, laboratory consultations, and doctor appointments.",
    highlights: [
      "FEFO (First-Expired-First-Out) automated stock dispensing",
      "Controlled drug registry & prescription auditing",
      "Patient medical histories, lab test results, and dosage tracking",
      "Instant multi-counter sales with generic chemical name search",
    ],
    stats: [
      { value: "90 Days", label: "Early Expiry Alert" },
      { value: "Zero", label: "Expired Stock Loss" },
      { value: "HIPAA", label: "Encrypted Records" },
    ],
  },
  {
    id: "hospitality",
    label: "Restaurant & Lounge",
    icon: Utensils,
    title: "Kitchen Display Systems (KDS) & Table-Side Order Management",
    badge: "Fast-Paced F&B Operations",
    description: "Streamline peak-hour restaurant and bar chaos. Waitstaff take orders on mobile tablets, routing food instantly to the kitchen and drinks to the bar display with split-bill support.",
    highlights: [
      "Interactive digital floor plan with live table occupancy status",
      "Kitchen Display System (KDS) & bar order ticket printing",
      "Ingredient recipe costing & automated liquor bottle depletion",
      "Item modifier options (e.g., 'Extra Pepper', 'No Onions', 'Medium Rare')",
    ],
    stats: [
      { value: "3x Faster", label: "Kitchen Ticket Routing" },
      { value: "1-Tap", label: "Bill Splitting" },
      { value: "100%", label: "Recipe Cost Control" },
    ],
  },
  {
    id: "school",
    label: "Schools & Academics",
    icon: GraduationCap,
    title: "Comprehensive Student Academic & Financial ERP",
    badge: "Primary to University Standard",
    description: "Eliminate administrative headaches. Unified student admissions, tuition fee tracking with instant SMS parent receipts, term grade cards, hostel allocations, and library book loans.",
    highlights: [
      "Student tuition installment plans & automated overdue SMS reminders",
      "Term report card grade generation with customized school crest",
      "Hostel room allocation & dormitory capacity tracking",
      "Staff payroll & teacher attendance monitoring",
    ],
    stats: [
      { value: "95%+", label: "Fee Collection Rate" },
      { value: "1-Click", label: "Term Report Cards" },
      { value: "SMS Hub", label: "Instant Parent Alerts" },
    ],
  },
  {
    id: "wholesale",
    label: "Wholesale & Logistics",
    icon: Truck,
    title: "Multi-Warehouse Pallet Transfers & B2B Debt Ledger",
    badge: "Heavy Enterprise & Supply Chain",
    description: "Control multiple warehouses across Sierra Leone from a single screen. Manage container shipments, tiered B2B wholesale pricing, credit limits, and driver delivery manifests.",
    highlights: [
      "Inter-warehouse stock transfer approvals & transit tracking",
      "Tiered price lists (Retail, Wholesale, VIP Dealer pricing)",
      "Customer credit ledger with aging reports & payment recovery schedules",
      "Bulk container intake & landed cost calculations",
    ],
    stats: [
      { value: "Unlimited", label: "Warehouses & Depots" },
      { value: "Real-time", label: "Inter-branch Sync" },
      { value: "Automated", label: "Landed Costing" },
    ],
  },
];

export function IndustrySolutionTabs() {
  const [activeIndustryId, setActiveIndustryId] = useState("retail");
  const currentIndustry = INDUSTRIES.find((i) => i.id === activeIndustryId) || INDUSTRIES[0];

  return (
    <section id="solutions" className="py-20 lg:py-28 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-widest">
            <Building2 className="h-3.5 w-3.5" />
            Tailored Industry Solutions
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
            Engineered For <span className="text-indigo-600 dark:text-indigo-400">Every Business Sector</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            Protech Assist isn&apos;t a one-size-fits-all tool. Switch industries below to explore custom workflows specialized for your industry.
          </p>
        </div>

        {/* Industry Selector Tabs */}
        <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 max-w-5xl mx-auto custom-scrollbar">
          {INDUSTRIES.map((ind) => {
            const isActive = ind.id === activeIndustryId;
            return (
              <button
                key={ind.id}
                onClick={() => setActiveIndustryId(ind.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-105"
                    : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                <ind.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-indigo-500"}`} />
                <span>{ind.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Industry Showcase Card */}
        <div className="max-w-5xl mx-auto mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndustry.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl p-5 sm:p-8 lg:p-10 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center"
            >
              {/* Left Details (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    {currentIndustry.badge}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    {currentIndustry.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {currentIndustry.description}
                  </p>
                </div>

                {/* Checklist Highlights */}
                <div className="space-y-2.5 pt-2">
                  {currentIndustry.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all hover:gap-3"
                  >
                    Get Started with {currentIndustry.label} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Stats & Highlights (5 cols) */}
              <div className="lg:col-span-5 grid grid-cols-1 gap-3">
                {currentIndustry.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        {stat.label}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                        {stat.value}
                      </span>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Zap className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
