"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Wallet, Banknote, BrainCircuit, Box } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettlementPage() {
  const [selectedMethod, setSelectedMethod] = useState("WALKIN");

  const methods = [
    { id: "WALKIN", label: "WALKIN", icon: Wallet },
    { id: "PAPER", label: "Paper Currency", icon: Banknote },
    { id: "NEURAL", label: "Neural Digital", icon: BrainCircuit },
  ];

  return (
    <div className="p-8 pb-24 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="space-y-1">
        <h1 className="text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Secure Terminal</h1>
        <p className="text-indigo-600 font-black uppercase tracking-[0.3em] text-xs">Global Settlement</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm font-black text-xs uppercase tracking-widest text-slate-600">
          1 Asset Clusters
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-black text-xs uppercase tracking-widest shadow-sm">
          Ready for cryptographic commitment
        </div>
        <Button className="rounded-xl font-black uppercase tracking-widest text-xs">
          <Plus className="mr-2 h-4 w-4" /> New Intelligence Node
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((method) => (
          <button 
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={cn(
              "p-6 rounded-[2rem] border-2 transition-all text-left space-y-4",
              selectedMethod === method.id ? "bg-white border-indigo-600 shadow-xl" : "bg-white border-slate-200 hover:border-indigo-200"
            )}
          >
            <method.icon className={cn("h-8 w-8", selectedMethod === method.id ? "text-indigo-600" : "text-slate-400")} />
            <h3 className="font-black uppercase tracking-widest text-sm">{method.label}</h3>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem]">
          <CardContent className="p-6 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Card</p>
            <Box className="h-10 w-10 text-indigo-600" />
          </CardContent>
        </Card>
        <Card className="rounded-[2rem]">
          <CardContent className="p-6 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement Debt</p>
            <p className="text-3xl font-[1000] tracking-tighter text-rose-600">Le 690</p>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem]">
          <CardContent className="p-6 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolved Balance</p>
            <p className="text-3xl font-[1000] tracking-tighter text-emerald-600">Le 0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
