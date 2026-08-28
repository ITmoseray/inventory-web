"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Phone, Calendar, ArrowRight, MessageSquare, Users, 
  Sparkles, CheckCircle2, Send, Clock, Shield, Headphones,
  Store, Building2, Stethoscope, ChevronRight, HelpCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CONSULTATION_TOPICS = [
  { id: "retail", label: "Retail & POS", icon: Store },
  { id: "pharmacy", label: "Pharmacy & Clinic", icon: Stethoscope },
  { id: "wholesale", label: "Wholesale & ERP", icon: Building2 },
  { id: "custom", label: "Custom Enterprise", icon: Sparkles },
];

export function ExpertPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"instant" | "callback">("instant");
  const [selectedTopic, setSelectedTopic] = useState("retail");
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackSent, setCallbackSent] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const getWhatsAppUrl = (topicLabel?: string) => {
    const topic = topicLabel || CONSULTATION_TOPICS.find(t => t.id === selectedTopic)?.label || "Enterprise Solutions";
    const text = encodeURIComponent(
      `Hello Protech Assist Executive Team, I am interested in an Executive Consultation for ${topic}. Please connect me with a specialist.`
    );
    return `https://wa.me/23273019699?text=${text}`;
  };

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;

    const topicLabel = CONSULTATION_TOPICS.find(t => t.id === selectedTopic)?.label || "Enterprise Solutions";
    const text = encodeURIComponent(
      `🔔 *VIP Callback Request - Protech Assist OS*\n\n👤 *Name:* ${callbackName || "Valued Client"}\n📞 *Phone:* ${callbackPhone}\n🏢 *Interest:* ${topicLabel}\n\nPlease schedule an executive callback for my business.`
    );
    
    setCallbackSent(true);
    setTimeout(() => {
      window.open(`https://wa.me/23273019699?text=${text}`, "_blank");
      setCallbackSent(false);
      setCallbackName("");
      setCallbackPhone("");
    }, 800);
  };

  return (
    <>
      {/* 1. Minimized Floating Support Pill (Compact & Non-blocking on Mobile) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-40"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-slate-900/95 dark:bg-slate-900/95 hover:bg-slate-900 dark:hover:bg-slate-800 text-white shadow-[0_8px_24px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.45)] border border-indigo-500/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="relative h-7 w-7 sm:h-9 sm:w-9 rounded-full overflow-hidden border-2 border-indigo-400/80 shrink-0">
                <Image
                  src="/images/1000001630.jpg"
                  alt="Executive Advisor"
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
              </div>

              <div className="flex flex-col text-left pr-1">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-tight text-white">Executive Support</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono text-indigo-300 font-medium">Online • Tap to Chat</span>
              </div>

              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-indigo-600/80 flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform shadow-sm">
                <Headphones className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Backdrop Overlay on Mobile for Tap-Outside Dismissal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden"
          />
        )}
      </AnimatePresence>

      {/* 3. Expanded Interactive Executive Consultation Console */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-[410px] max-h-[82vh] overflow-y-auto bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl rounded-t-[2rem] sm:rounded-3xl shadow-2xl border-t sm:border border-indigo-200/80 dark:border-indigo-500/30 custom-scrollbar"
          >
            {/* Mobile Pull Handle */}
            <div className="pt-2 pb-1 sm:hidden">
              <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
            </div>

            {/* Ambient Top Glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/15 via-cyan-500/5 to-transparent pointer-events-none rounded-t-3xl" />

            {/* Header / Dismiss Bar */}
            <div className="relative p-4 sm:p-6 pb-3 sm:pb-4 flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-md shrink-0 bg-slate-100 dark:bg-slate-900">
                  <Image
                    src="/images/1000001630.jpg"
                    alt="Executive Specialist"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full shadow-sm animate-pulse" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-300 text-[9px] font-mono font-bold tracking-wider uppercase border border-indigo-500/20">
                      Certified Specialist
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Live Online
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Executive Advisory
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Protech Assist Enterprise Solutions
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Minimize support widget"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-4 sm:px-6 pt-2.5 flex gap-2 border-b border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => setActiveTab("instant")}
                className={`pb-2.5 text-xs font-bold tracking-wide transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === "instant"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Instant Connect
              </button>
              <button
                onClick={() => setActiveTab("callback")}
                className={`pb-2.5 text-xs font-bold tracking-wide transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === "callback"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Phone className="h-3.5 w-3.5" />
                Request Callback
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 space-y-4">
              
              {/* Consultation Topic Selector */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Select Your Business Sector:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CONSULTATION_TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    const isSelected = selectedTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500/50 text-indigo-900 dark:text-indigo-200 shadow-sm"
                            : "bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-850"
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                        <span className="text-xs font-bold truncate">{topic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab 1: Instant Connect Channels */}
              {activeTab === "instant" && (
                <div className="space-y-2.5">
                  {/* Primary WhatsApp Direct Router */}
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-between shadow-lg shadow-emerald-600/25 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-xl bg-white/20 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 fill-white" />
                      </div>
                      <div className="text-left">
                        <div className="leading-tight font-black">Chat on WhatsApp</div>
                        <div className="text-[10px] text-emerald-100 font-mono font-medium lowercase">wa.me/23273019699</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* Direct Phone Dial */}
                  <a
                    href="tel:073019699"
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold flex items-center justify-between border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Direct Executive Hotline: <strong>073019699</strong></span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold">24/7 Priority</span>
                  </a>

                  {/* Interactive Demo Sandbox Router */}
                  <Link
                    href="/demo"
                    onClick={handleClose}
                    className="w-full p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center justify-between border border-indigo-200/60 dark:border-indigo-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Explore Demo Sandbox Account</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-500" />
                  </Link>
                </div>
              )}

              {/* Tab 2: Request Fast Executive Callback */}
              {activeTab === "callback" && (
                <form onSubmit={handleCallbackSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Your Full Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alie Sesay"
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Phone Number (WhatsApp / Direct):
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 073019699"
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {callbackSent ? "Routing Request..." : "Request Executive Call"}
                  </button>
                </form>
              )}

              {/* Security & SLA Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Encrypted Enterprise Support</span>
                </div>
                <span>Average SLA: &lt; 5 mins</span>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
