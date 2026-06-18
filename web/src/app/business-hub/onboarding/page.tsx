"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Building2, Package, CreditCard } from "lucide-react";

export default function BusinessOnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <header className="mb-12">
        <Link href="/business-hub" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 mb-4 block">← Back to Gateway</Link>
        <h1 className="text-4xl font-black tracking-tight">Business Setup <span className="text-indigo-600">Onboarding</span></h1>
        <p className="text-slate-500 font-medium mt-2">Let's get your business live in 3 steps.</p>
      </header>

      {/* Progress */}
      <div className="flex gap-4 mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      {/* Onboarding Steps */}
      <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm max-w-2xl">
        {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Building2 className="text-indigo-600" /> Step 1: Business Profile</h2>
                <input className="w-full p-4 rounded-xl border border-slate-200 mb-4" placeholder="Business Name" />
                <input className="w-full p-4 rounded-xl border border-slate-200 mb-4" placeholder="Business Location (e.g., Freetown)" />
                <button onClick={() => setStep(2)} className="w-full h-14 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2">Next <ArrowRight /></button>
            </motion.div>
        )}
        {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Package className="text-indigo-600" /> Step 2: Add First Product</h2>
                <input className="w-full p-4 rounded-xl border border-slate-200 mb-4" placeholder="Product Name" />
                <input className="w-full p-4 rounded-xl border border-slate-200 mb-4" placeholder="Price (SLL)" />
                <button onClick={() => setStep(3)} className="w-full h-14 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2">Next <ArrowRight /></button>
            </motion.div>
        )}
        {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><CreditCard className="text-indigo-600" /> Step 3: Enable Payments</h2>
                <p className="text-slate-500 mb-6">Link your bank account or mobile money to start receiving payments instantly.</p>
                <Link href="/business-hub" className="w-full h-14 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">Go Live <ArrowRight /></Link>
            </motion.div>
        )}
      </div>
    </div>
  );
}
