"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Laptop,
  GraduationCap,
  Brain,
  Globe,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Building,
  Check,
  Award,
  Layers,
  Zap,
  MessageCircle,
} from "lucide-react";

export default function PublicServicesPage() {
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    // Read ref parameter or cookie if available
    const params = new URLSearchParams(window.location.search);
    const paramRef = params.get("ref");
    if (paramRef) {
      setRefCode(paramRef);
    } else {
      const match = document.cookie.match(new RegExp("(^| )pa_ref=([^;]+)"));
      if (match) setRefCode(match[2]);
    }
  }, []);

  const registerHref = refCode ? `/register?ref=${refCode}` : "/register";

  const services = [
    {
      id: "enterprise-os",
      badge: "Flagship Software",
      title: "ProTech Enterprise OS (POS & Inventory Management)",
      description:
        "Complete cloud inventory, thermal barcode POS, billing, and accounting suite engineered for supermarkets, retail shops, pharmacies, hospitals, and restaurants across Sierra Leone.",
      icon: Laptop,
      color: "from-emerald-500/10 to-teal-500/5",
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      features: [
        "Thermal POS Receipt Printing & Offline Backup",
        "Barcode Scanning & Automatic Stock Deductions",
        "Expiry Date Alerts & Batch Tracking for Pharmacies",
        "Multi-Store & Multi-Warehouse Synchronization",
        "Daily, Weekly & Monthly Profit & Loss Ledger",
      ],
      ctaText: "Start 14-Day Free Trial",
      ctaHref: registerHref,
    },
    {
      id: "ai-masterclass",
      badge: "High-Demand Masterclass",
      title: "ProTech AI & Prompt Engineering Masterclass",
      description:
        "Practical, industry-aligned training teaching professionals, students, and businesses how to deploy modern AI tools, automation, and ChatGPT/Claude workflows to accelerate growth.",
      icon: Brain,
      color: "from-purple-500/10 to-indigo-500/5",
      iconColor: "text-purple-600 bg-purple-50 border-purple-200",
      features: [
        "Hands-On Prompt Engineering & AI Automation",
        "Real-World Business & Corporate Use Cases",
        "AI for Content, Coding, Finance & Operations",
        "Official ProTech Certification of Completion",
        "Mentorship & Career Opportunity Placement",
      ],
      ctaText: "Inquire & Enroll Today",
      ctaHref: `https://wa.me/23276123456?text=${encodeURIComponent(
        `Hello ProTech Assist! I would like to enroll in the AI & Prompt Engineering Masterclass${
          refCode ? ` (Referral Code: ${refCode})` : ""
        }.`
      )}`,
      isExternal: true,
    },
    {
      id: "software-engineering",
      badge: "Career Accelerator",
      title: "Full-Stack Software Engineering Cohort",
      description:
        "Intensive 12-week software engineering academy covering React, Next.js, Node.js, TypeScript, PostgreSQL, and Cloud Deployment. Build real client applications from scratch.",
      icon: GraduationCap,
      color: "from-blue-500/10 to-cyan-500/5",
      iconColor: "text-blue-600 bg-blue-50 border-blue-200",
      features: [
        "Modern JavaScript, TypeScript & React/Next.js",
        "Backend REST APIs, Node.js & Database Design",
        "Git, GitHub Collaboration & CI/CD Pipelines",
        "Live Production Capstone Projects",
        "Direct Job & Freelance Recommendations",
      ],
      ctaText: "Join Next Academy Cohort",
      ctaHref: `https://wa.me/23276123456?text=${encodeURIComponent(
        `Hello ProTech Assist! I want to apply for the Full-Stack Software Engineering Cohort${
          refCode ? ` (Referral Code: ${refCode})` : ""
        }.`
      )}`,
      isExternal: true,
    },
    {
      id: "custom-development",
      badge: "Enterprise IT",
      title: "Custom Website & Mobile App Development",
      description:
        "Bespoke technology development for corporations, NGOs, hospitals, educational institutions, and fast-growing SMEs needing specialized web portals, iOS & Android apps.",
      icon: Globe,
      color: "from-amber-500/10 to-orange-500/5",
      iconColor: "text-amber-600 bg-amber-50 border-amber-200",
      features: [
        "Responsive, High-Performance Corporate Websites",
        "Cross-Platform Android & iOS Mobile Applications",
        "School, University & Hospital Management Portals",
        "Payment Gateway Integration (Orange Money, Afrimoney)",
        "Dedicated Maintenance & Cybersecurity Support",
      ],
      ctaText: "Request Project Proposal",
      ctaHref: `https://wa.me/23276123456?text=${encodeURIComponent(
        `Hello ProTech Assist! I would like to request a custom software/website project proposal${
          refCode ? ` (Referral Code: ${refCode})` : ""
        }.`
      )}`,
      isExternal: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 bg-white p-1">
              <Image src="/images/logo-192.png" alt="ProTech Logo" width={32} height={32} className="object-contain" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              ProTech<span className="text-emerald-600">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg transition"
            >
              Software Pricing
            </Link>
            <Link
              href="/affiliate/register"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 transition hidden sm:inline-block"
            >
              Partner Program
            </Link>
            <Link
              href={registerHref}
              className="text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 rounded-xl transition shadow-md shadow-emerald-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide shadow-sm">
          <Award className="w-4 h-4 text-emerald-600" /> ProTech Assist SL &bull; Solutions & Tech Academy
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight max-w-4xl mx-auto">
          Technology Solutions & Training <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
            Engineered for African Enterprise
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
          From cutting-edge point-of-sale systems for retail pharmacies to hands-on AI & Full-Stack masterclasses, ProTech Assist SL equips businesses and professionals with top-tier technology.
        </p>

        {refCode && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Partner Referral: <span className="font-mono font-bold text-emerald-700">{refCode}</span>
          </div>
        )}
      </section>

      {/* Services Grid */}
      <section className="py-6 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 flex flex-col justify-between space-y-6 hover:border-emerald-300 transition"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {srv.badge}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${srv.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    {srv.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Key Highlights & Inclusions:
                    </span>
                    <ul className="space-y-2">
                      {srv.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  {srv.isExternal ? (
                    <a
                      href={srv.ctaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      {srv.ctaText}
                    </a>
                  ) : (
                    <Link
                      href={srv.ctaHref}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      {srv.ctaText} <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center border border-slate-200 bg-white p-0.5">
            <Image src="/images/logo-192.png" alt="ProTech Logo" width={22} height={22} className="object-contain" />
          </div>
          <span className="font-extrabold text-slate-900 text-sm">ProTech Assist SL Limited</span>
        </div>
        <p className="text-xs text-slate-500">
          Empowering Businesses Through Technology &bull; Freetown, Sierra Leone
        </p>
      </footer>
    </div>
  );
}
