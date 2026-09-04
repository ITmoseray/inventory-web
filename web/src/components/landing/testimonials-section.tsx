"use client";

import React, { useState, useEffect } from "react";
import { 
  Star, Quote, ShieldCheck, Sparkles, MessageSquare, 
  ArrowRight, ChevronRight, CheckCircle2, TrendingUp, Clock, 
  Building2, Users, Award, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitReviewModal } from "@/components/landing/submit-review-modal";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  companyName: string;
  content: string;
  rating: number;
  industry: string;
  location?: string | null;
  avatarUrl?: string | null;
  status: string;
  isVerified: boolean;
  tags?: string[];
}

const CATEGORY_FILTERS = [
  "All",
  "Supermarkets & Retail",
  "Pharmacies & Healthcare",
  "Wholesale & Distribution",
  "Bars & Restaurants",
  "Schools & Academics",
  "Hardware & Construction",
];

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 150,
    avgRating: "4.9",
    satisfactionRate: "99.4%",
  });
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      if (data.success && data.testimonials) {
        setTestimonials(data.testimonials);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error loading testimonials:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredList = testimonials.filter((t) => {
    if (selectedFilter === "All") return true;
    const filterLower = selectedFilter.toLowerCase();
    const indLower = (t.industry || "").toLowerCase();
    if (filterLower.includes("supermarket") && (indLower.includes("supermarket") || indLower.includes("retail") || indLower.includes("pos") || indLower.includes("grocery"))) return true;
    if (filterLower.includes("pharmacy") && (indLower.includes("pharmacy") || indLower.includes("health") || indLower.includes("clinic"))) return true;
    if (filterLower.includes("wholesale") && (indLower.includes("wholesale") || indLower.includes("distribut"))) return true;
    if (filterLower.includes("restaurant") && (indLower.includes("restaurant") || indLower.includes("bar") || indLower.includes("hospitality"))) return true;
    if (filterLower.includes("school") && (indLower.includes("school") || indLower.includes("academic") || indLower.includes("education"))) return true;
    if (filterLower.includes("hardware") && (indLower.includes("hardware") || indLower.includes("construct") || indLower.includes("building"))) return true;
    return indLower.includes(filterLower);
  });

  // Featured testimonial spotlight
  const featuredItem = testimonials.find((t) => t.status === "FEATURED") || testimonials[0];

  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container px-6 mx-auto relative z-10 space-y-16">
        
        {/* Section Header & KPI Rating Banner */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Real-World Client Impact
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Trusted by 150+ Leading <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300">
                Businesses Across West Africa.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Read authentic feedback from supermarkets, pharmacies, wholesale distributors, and retail enterprises powering their daily sales with Protech Assist.
            </p>
          </div>

          {/* Social Proof Star Badge & Share CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]" />
                ))}
                <span className="text-base font-black text-slate-900 dark:text-white ml-2">
                  {stats.avgRating} / 5.0
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Based on <strong className="text-slate-900 dark:text-white font-bold">{stats.totalReviews}+ Verified Client Reviews</strong>
              </p>
            </div>

            <Button
              onClick={() => setIsSubmitModalOpen(true)}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-widest gap-2 shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" /> Share Your Review
            </Button>
          </div>
        </div>

        {/* Industry Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedFilter === cat
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-105"
                  : "bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Spotlight Card */}
        {featuredItem && (
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-black rounded-3xl p-8 sm:p-12 relative shadow-2xl overflow-hidden group border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-700" />
            <Quote className="absolute top-8 right-8 h-32 w-32 text-white/5 pointer-events-none group-hover:text-indigo-500/10 transition-colors duration-700" />
            
            <div className="relative z-10 max-w-4xl space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> Spotlight Client Testimonial
                </span>
                {featuredItem.isVerified && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified Protech Enterprise Client
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium">
                  {featuredItem.industry}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl lg:text-3xl font-medium text-white leading-relaxed italic">
                "{featuredItem.content}"
              </h3>

              <div className="flex items-center gap-4 pt-2">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg border border-white/20">
                  {featuredItem.authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white leading-tight">
                    {featuredItem.authorName}
                  </h4>
                  <p className="text-sm font-medium text-indigo-300 leading-tight">
                    {featuredItem.authorRole} • <strong className="text-white font-bold">{featuredItem.companyName}</strong>
                  </p>
                  {featuredItem.location && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" /> {featuredItem.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid of Verified Client Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredList.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group p-8 rounded-3xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar: Stars + Industry Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= t.rating
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_3px_rgba(251,191,36,0.4)]"
                              : "text-slate-200 dark:text-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {t.industry}
                    </span>
                  </div>

                  {/* Review Quote */}
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                    "{t.content}"
                  </p>

                  {/* Tags */}
                  {t.tags && t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {t.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Author Card Footer */}
                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/70">
                  <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-inner">
                    {t.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {t.authorName}
                      </h4>
                      {t.isVerified && (
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" title="Verified Protech Client" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {t.authorRole} • <strong className="text-slate-700 dark:text-slate-300">{t.companyName}</strong>
                    </p>
                    {t.location && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {t.location}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Submit Review Modal */}
        <SubmitReviewModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onSuccess={fetchTestimonials}
        />

      </div>
    </section>
  );
}
