"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, RefreshCcw, Search, FileText, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function ReconciliationClient({ initialTransactions, expenses, sales }: any) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchTerm, setSearchTerm] = useState("");

  const handleMarkReconciled = (id: string) => {
    // In a real app, this would call a server action to update the status in the DB
    setTransactions(transactions.map((t: any) => 
      t.id === id ? { ...t, status: "RECONCILED" } : t
    ));
    toast.success("Transaction marked as Reconciled!");
  };

  const filteredTransactions = transactions.filter((t: any) => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search bank transactions..." 
            className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="h-12 rounded-2xl flex-1 md:flex-none border-dashed border-2 border-slate-300 dark:border-slate-700">
            <RefreshCcw className="mr-2 h-4 w-4" /> Sync Bank
          </Button>
          <Button className="h-12 rounded-2xl flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 font-black uppercase tracking-wider text-xs">
            <Plus className="mr-2 h-4 w-4" /> Upload CSV
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Bank Statements</h3>
            <span className="text-xs font-bold text-slate-500">{filteredTransactions.length} Pending</span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-950 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <ArrowRightLeft className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">No Transactions</h4>
                  <p className="text-slate-500 text-sm mt-1">Upload a CSV to get started.</p>
                </div>
              ) : (
                filteredTransactions.map((tx: any) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-2xl border transition-all ${
                      tx.status === "RECONCILED" 
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30" 
                        : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black ${
                          tx.type === 'CREDIT' 
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' 
                            : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'
                        }`}>
                          {tx.type === 'CREDIT' ? 'IN' : 'OUT'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{tx.description || "Bank Transfer"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-slate-500">{new Date(tx.date || new Date()).toLocaleDateString()}</span>
                            {tx.reference && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                                REF: {tx.reference}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={`text-lg font-black tracking-tighter ${
                            tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                          }`}>
                            {tx.type === 'CREDIT' ? '+' : '-'} ${parseFloat(tx.amount || 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {tx.status}
                          </p>
                        </div>
                        {tx.status !== "RECONCILED" && (
                          <Button 
                            onClick={() => handleMarkReconciled(tx.id)}
                            variant="ghost" 
                            className="h-10 w-10 p-0 rounded-xl hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-400 transition-colors"
                          >
                            <Check className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar / AI Matching */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">AI Auto-Match</h3>
          <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 text-center space-y-4">
              <div className="h-16 w-16 bg-white/10 backdrop-blur-xl rounded-2xl mx-auto flex items-center justify-center border border-white/10">
                <FileText className="h-8 w-8 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-white font-black text-lg">Smart Reconcile</h4>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Our system will scan your expenses and sales to automatically match them with bank statement rows.
                </p>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-black uppercase tracking-wider text-[11px]">
                Run Auto-Match
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
