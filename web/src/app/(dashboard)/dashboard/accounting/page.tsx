"use client";

import Link from "next/link";
import { 
  Wallet, DollarSign, Receipt, TrendingUp, ArrowUpRight, 
  Tag, ShieldCheck, Scale, FileText, CheckCircle2, ChevronRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ACCOUNTING_MODULES = [
  {
    title: "Tax Records & NRA Filing",
    description: "Record, track, and reconcile all statutory taxes (15% GST, PAYE payroll deductions, WHT, City Council rates).",
    href: "/dashboard/accounting/taxes",
    icon: Scale,
    badge: "NRA Compliance",
    color: "from-indigo-600 to-violet-600",
    iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
  },
  {
    title: "Expense Management",
    description: "Log operational expenditures, supplier payouts, utilities, rent, and overhead costs.",
    href: "/dashboard/accounting/expenses",
    icon: DollarSign,
    badge: "Outflows",
    color: "from-rose-600 to-pink-600",
    iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
  },
  {
    title: "Profit & Loss Statement",
    description: "Real-time P&L analysis, cost of goods sold (COGS), gross margins, and net operating income.",
    href: "/dashboard/accounting/pl",
    icon: TrendingUp,
    badge: "Financial Health",
    color: "from-emerald-600 to-teal-600",
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
  },
  {
    title: "Cash Flow Statement",
    description: "Monitor daily liquid inflows, customer collections, debt settlements, and cash disbursements.",
    href: "/dashboard/accounting/cashflow",
    icon: Wallet,
    badge: "Liquidity",
    color: "from-blue-600 to-cyan-600",
    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
  },
  {
    title: "Transaction Tags",
    description: "Categorize expenditures and revenue lines into custom accounting tags for granular budgeting.",
    href: "/dashboard/accounting/tags",
    icon: Tag,
    badge: "Classification",
    color: "from-amber-600 to-orange-600",
    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
  },
  {
    title: "Reconciliation & Audit",
    description: "Match physical cash in drawer, POS shifts, and mobile money ledgers against bank statements.",
    href: "/dashboard/accounting/reconciliation",
    icon: ShieldCheck,
    badge: "Audit Ready",
    color: "from-purple-600 to-indigo-600",
    iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
  }
];

export default function AccountingHubPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-10 animate-in fade-in duration-500 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Financial Suite &amp; Compliance
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight uppercase italic">
          Accounting &amp; <span className="text-indigo-600">Financial Hub</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs mt-1">
          Complete double-entry accounting suite, tax remittance ledger, profit analysis, and audit trails.
        </p>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACCOUNTING_MODULES.map((mod, i) => (
          <Link key={i} href={mod.href} className="group block">
            <Card className="h-full rounded-[2.5rem] border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative">
              <CardContent className="p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${mod.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                      <mod.icon className="h-6 w-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Open Module</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
