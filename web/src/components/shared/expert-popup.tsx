"use client";

import { useState, useEffect } from "react";
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
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeTab, setActiveTab] = useState<"instant" | "callback">("instant");
  const [selectedTopic, setSelectedTopic] = useState("retail");
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackSent, setCallbackSent] = useState(false);

  useEffect(() => {
    // Show automatically after 8 seconds on initial visit
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setIsOpen(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const handleClose = () => {
    setIsOpen(false);
    setHasInteracted(true);
  };

  const getWhatsAppUrl = (topicLabel?: string) => {
    const topic = topicLabel || CONSULTATION_TOPICS.find(t => t.id === selectedTopic)?.label || "Enterprise Solutions";
    const text = encodeURIComponent(
      `Hello Protech Assist Executive Team, I am interested in an Executive Consultation for ${topic}. Please connect me with a specialist.`
    );
    return `https://wa.me/23234955581?text=${text}`;
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
      window.open(`https://wa.me/23234955581?text=${text}`, "_blank");
      setCallbackSent(false);
      setCallbackName("");
      setCallbackPhone("");
    }, 800);
  };

  return (
    <>
      {/* 1. Minimized Floating Support Button (Visible when popup is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[990]"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-slate-900/95 hover:bg-slate-900 dark:hover:bg-slate-800 text-white shadow-[0_12px_36px_rgba(79,70,229,0.35)] hover:shadow-[0_16px_48px_rgba(79,70,229,0.5)] border border-indigo-500/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-indigo-400/80 shrink-0">
                <Image
                  src="/images/1000001630.jpg"
                  alt="Executive Advisor"
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
              </div>

              <div className="flex flex-col text-left pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold tracking-tight text-white">Executive Support</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[9px] font-mono text-indigo-300 font-medium">Online • Tap to Chat</span>
              </div>

              <div className="h-7 w-7 rounded-full bg-indigo-600/80 flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform shadow-sm">
                <Headphones className="h-3.5 w-3.5" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Expanded Interactive Executive Consultation Console */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.92 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[1000] w-[calc(100vw-2rem)] sm:w-[410px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] border border-indigo-200/80 dark:border-indigo-500/30"
          >
            {/* Ambient Top Glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/15 via-cyan-500/5 to-transparent pointer-events-none rounded-t-3xl" />

            {/* Header / Dismiss Bar */}
            <div className="relative p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3.5">
                <div className="relative h-14 w-14 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-md shrink-0 bg-slate-100 dark:bg-slate-900">
                  <Image
                    src="/images/1000001630.jpg"
                    alt="Executive Specialist"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full shadow-sm animate-pulse" />
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
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Minimize support widget"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 sm:px-6 pt-3 flex gap-2 border-b border-slate-100 dark:border-slate-800/80">
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
            <div className="p-5 sm:p-6 space-y-4">
              
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
                        type="button"
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2 transition-all border ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30"
                            : "bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800"
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-indigo-500"}`} />
                        <span className="truncate">{topic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeTab === "instant" ? (
                /* Instant Connect Mode */
                <div className="space-y-2.5 pt-1">
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md shadow-emerald-600/20 group active:scale-[0.98]"
                  >
                    <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>WhatsApp Executive Call</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-auto mr-4 opacity-80 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <a
                    href="tel:+23234955581"
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50 dark:bg-slate-900/80 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all group active:scale-[0.98]"
                  >
                    <Phone className="h-3.5 w-3.5 text-indigo-500 group-hover:rotate-12 transition-transform" />
                    <span>Direct Hotline (+232 34 955581)</span>
                  </a>

                  <Link
                    href="/demo"
                    onClick={handleClose}
                    className="w-full h-11 rounded-xl border border-indigo-200/70 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all group"
                  >
                    <Calendar className="h-3.5 w-3.5 group-hover:scale-110 transition-transform text-indigo-600 dark:text-indigo-400" />
                    <span>Explore Demo Account</span>
                  </Link>
                </div>
              ) : (
                /* Request VIP Callback Form */
                <form onSubmit={handleCallbackSubmit} className="space-y-2.5 pt-1">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name or Company"
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Phone / WhatsApp Number (+232...)"
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={callbackSent}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-75 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]"
                  >
                    {callbackSent ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        Connecting to Specialist...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-3.5 w-3.5" />
                        Schedule Priority Callback
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* Trust & Verification Badges */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-indigo-500 shrink-0" />
                  <span>Avg. response &lt; 2 mins</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Shield className="h-3 w-3 shrink-0" />
                  <span>256-Bit Encrypted Line</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

