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
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#2563EB] text-white shadow-sm">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Financial Suite &amp; Compliance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Accounting &amp; Finance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enterprise double-entry ledger, P&amp;L analytics, tax remittance, cashflow velocity, and reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/accounting/pl">
            <Button variant="outline" className="h-9 px-3.5 rounded-lg font-medium text-xs border-slate-200 dark:border-slate-800">
              P&amp;L Statement
            </Button>
          </Link>
          <Link href="/dashboard/accounting/cashflow">
            <Button className="h-9 px-4 rounded-lg font-semibold text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              Cash Flow
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACCOUNTING_MODULES.map((mod, i) => (
          <Link key={i} href={mod.href} className="group block">
            <div className="card p-6 h-full flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${mod.iconBg} transition-transform duration-200 group-hover:scale-105`}>
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {mod.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold font-display text-slate-900 dark:text-white group-hover:text-[#2563EB] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-[#2563EB]">
                <span>Open Module</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
