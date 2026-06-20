"use client";

import Link from "next/link";
import { 
  ArrowLeft, Code2, Globe, Database, Network, Cloud, 
  ExternalLink, Sparkles, Layers, Box, Cpu, ArrowUpRight, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PROJECTS = [
  {
    title: "Protech Inventory OS",
    subtitle: "Enterprise Asset Tracking & Cloud Intelligence",
    desc: "A mission-critical multi-tenant inventory management system built to handle high-velocity sales ledger logs, automated returns logic, customer debt tracking, and real-time statistics counters for businesses across West Africa.",
    stats: [
      { label: "Query Velocity", val: "15ms avg" },
      { label: "Active Tenant Nodes", val: "450+ Units" }
    ],
    tech: ["Next.js 16", "Prisma ORM", "Neon Postgres", "Zod", "NextAuth v5"],
    color: "from-indigo-600 to-indigo-800"
  },
  {
    title: "SLTrendyBeats Platform",
    subtitle: "High-Fidelity Audio Visualization & Music Portal",
    desc: "Sierra Leone's modern music streaming hub. Built with a unified global HTML5 audio thread synchronized to an interactive WaveSurfer.js visualizer and global play queue managed by persistent Zustand client states.",
    stats: [
      { label: "Audio Sync Accuracy", val: "Frame-Perfect" },
      { label: "Playback Speed Control", val: "0.5x - 2.0x" }
    ],
    tech: ["React Client Components", "WaveSurfer.js", "Zustand State", "Tailwind CSS"],
    color: "from-purple-600 to-purple-800"
  },
  {
    title: "Salone Logistics Custom Gateway",
    subtitle: "Cross-Border Cargo Routing & Clearance",
    desc: "A custom customs clearance portal designed for logistics companies in Freetown. Integrates real-time freight status tracking, container routing topology, and automatic customs duty calculations.",
    stats: [
      { label: "Processing Speed", val: "-40% clearance time" },
      { label: "Data Uptime", val: "99.95% Stable" }
    ],
    tech: ["Next.js Server Actions", "PostgreSQL", "Tailwind Grid", "Framer Motion"],
    color: "from-emerald-600 to-emerald-800"
  },
  {
    title: "Nexus Enterprise ERP Suite",
    subtitle: "Automated Multi-Tenant Payroll & Auditing",
    desc: "A secure organizational management suite built for enterprise clients. Incorporates granular user role policies, automatic employee payroll calculation algorithms, and secure PDF invoice ledger generators.",
    stats: [
      { label: "Role Policies", val: "RBAC Compliant" },
      { label: "Staff Audited", val: "12,000+ Profiles" }
    ],
    tech: ["Next.js Inset Shells", "Prisma Transactions", "TypeScript", "PDF Kit"],
    color: "from-rose-600 to-rose-800"
  }
];

const TECH_STACK = [
  { name: "Next.js 16", icon: Layers, desc: "React Framework for static & dynamic Server Actions" },
  { name: "Neon PostgreSQL", icon: Database, desc: "Serverless Postgres with autoscaling database branching" },
  { name: "Tailwind CSS", icon: Code2, desc: "Utility-first CSS for premium layouts & responsiveness" },
  { name: "Zustand Context", icon: Cpu, desc: "Global lightweight state synchronization engine" },
  { name: "Framer Motion", icon: Sparkles, desc: "Hardware-accelerated fluid micro-animations" },
  { name: "TypeScript", icon: Globe, desc: "Strictly typed codebase for bulletproof reliability" }
];

export default function CorporatePortfolioPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
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
    <div className="relative min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-indigo-600/20 selection:text-indigo-400">
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-500/5 to-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Corporate Nav Header */}
      <nav className="relative z-20 w-full px-6 lg:px-20 h-24 flex items-center justify-between border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            <Layers className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tighter leading-none">
              Protech <span className="text-indigo-400 italic">Assist</span>
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-500 mt-1.5">
              Technology Group
            </span>
          </div>
        </Link>
        <Link href="/" className="h-11 px-6 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-slate-950 transition-all">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
      </nav>

      {/* Core Viewport Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 space-y-32">
        
        {/* HERO SECTION */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center max-w-4xl mx-auto space-y-6"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles className="h-3.5 w-3.5" /> Engineering Enterprise Grade Software
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-8xl font-black tracking-tight leading-none uppercase italic">
            Corporate <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Portfolio</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg lg:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
            Discover some of the strategic full-stack software and logistics systems built by Protech Assist for Africa's digital transition.
          </motion.p>
        </motion.div>

        {/* PROJECTS GRID */}
        <div className="space-y-16">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
              <Box className="text-indigo-400 h-6 w-6" /> Selected Client Deployments
            </h2>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">4 Core Nodes</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {PROJECTS.map((proj, i) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                key={i}
                className="group relative rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-10 flex flex-col justify-between space-y-8 hover:border-indigo-500/20 hover:bg-white/[0.03] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent blur-[30px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{proj.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-1">{proj.subtitle}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 group-hover:text-white transition-colors">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed pt-2">{proj.desc}</p>
                </div>

                <div className="space-y-6">
                  {/* Stats Counter Row */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4">
                    {proj.stats.map((s, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-lg font-black text-white">{s.val}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 mt-1">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-2">
                    {proj.tech.map((t, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TECHNICAL CAPABILITIES GRID */}
        <div className="space-y-16">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
              <Cpu className="text-indigo-400 h-6 w-6" /> Engineering Capability Matrix
            </h2>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tech Stack Nodes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECH_STACK.map((tech, i) => (
              <div 
                key={i}
                className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col justify-between space-y-4 hover:border-white/10 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 shadow-inner">
                  <tech.icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-sm uppercase tracking-wider">{tech.name}</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FINAL SOURCING CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative p-12 lg:p-20 rounded-[3rem] bg-gradient-to-br from-indigo-950/50 to-slate-950 border border-indigo-500/20 text-center space-y-8 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[80px] -z-10 pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tight italic">
              Need a Custom <span className="text-indigo-400">Enterprise Node?</span>
            </h2>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              We specialize in engineering scalable platforms, server architectures, and full-stack software applications tailored for the African market.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="mailto:protechassist36@gmail.com" 
              className="h-16 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="h-4 w-4" /> Start Consultation
            </Link>
            <Link 
              href="/" 
              className="h-16 px-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              Back to System
            </Link>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-16 border-t border-white/5 bg-slate-950 text-slate-500 text-center text-xs font-black uppercase tracking-widest">
         © 2026 PROTECH ASSIST (SL) LIMITED. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
