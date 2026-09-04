"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Heart, CheckCircle, Sparkles, LogOut, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

interface LogoutFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

const INDUSTRY_OPTIONS = [
  "Retail & POS",
  "Supermarkets & Grocery",
  "Pharmacies & Healthcare",
  "Bars & Restaurants",
  "Wholesale & Distribution",
  "Schools & Academics",
  "Hardware & Building Materials",
  "Automotive & Spare Parts",
  "Corporate Services & IT",
  "Manufacturing & Production",
  "Other Enterprise",
];

const PRESET_TAGS = [
  "⚡ Super Fast POS",
  "📦 Accurate Stock Tracking",
  "📊 Crystal Clear P&L",
  "🌐 Multi-Warehouse Control",
  "👥 Easy Staff Tracking",
  "📱 Works on Phone & PC",
  "🔒 Reliable & Secure",
  "🚀 Great Support",
];

export function LogoutFeedbackModal({ isOpen, onClose, user }: LogoutFeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState(user?.name || "");
  const [authorRole, setAuthorRole] = useState(user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "Managing Director");
  const [companyName, setCompanyName] = useState(user?.businessName || "");
  const [industry, setIndustry] = useState("Retail & POS");
  const [location, setLocation] = useState("Sierra Leone");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Sync user values if updated
  React.useEffect(() => {
    if (user?.name && !authorName) setAuthorName(user.name);
    if (user?.businessName && !companyName) setCompanyName(user.businessName);
  }, [user]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSkipAndLogout = async () => {
    try {
      const { logoutUserCompletely } = await import("@/lib/utils/logout");
      await logoutUserCompletely(signOut);
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  };

  const handleSubmitAndLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please provide a short sentence about your experience before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim() || user?.name || "Verified Merchant",
          authorRole: authorRole.trim() || "Business Owner",
          companyName: companyName.trim() || user?.businessName || "Protech Client Enterprise",
          content: content.trim(),
          rating,
          industry,
          location: location.trim() || "Sierra Leone",
          tags: selectedTags,
          source: "LOGOUT_FEEDBACK",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmittedSuccess(true);
        toast.success("Thank you! Your review has been received. Logging out...");
        setTimeout(async () => {
          const { logoutUserCompletely } = await import("@/lib/utils/logout");
          await logoutUserCompletely(signOut);
        }, 1200);
      } else {
        toast.error(data.error || "Failed to save feedback.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Could not record review. Logging you out now.");
      setTimeout(async () => {
        const { logoutUserCompletely } = await import("@/lib/utils/logout");
        await logoutUserCompletely(signOut);
      }, 1000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="max-w-xl w-full p-0 overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Glowing Top Banner */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-5 sm:p-6 text-white overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-indigo-100">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                Feedback &amp; Review
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Before you go, how was your experience?
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
                Your feedback helps improve Protech Assist and will be featured on our official homepage!
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Heart className="h-5 w-5 fill-rose-400 text-rose-400" />
            </div>
          </div>
        </div>

        {/* Content Body */}
        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4 flex-1 flex flex-col items-center justify-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 animate-bounce" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Review Submitted!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Thank you for sharing your experience. We are now completing your safe logout...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitAndLogout} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
              {/* Super Responsive Star Rating Selector */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3 shadow-inner">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Rating</span>
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                    {(hoverRating !== null ? hoverRating : rating)}.0 / 5.0 Stars
                  </span>
                </div>
                
                {/* Star Buttons */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-1 select-none">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating !== null ? hoverRating : rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onPointerDown={() => { setRating(star); setHoverRating(null); }}
                        onClick={(e) => { e.preventDefault(); setRating(star); setHoverRating(null); }}
                        className={`h-11 w-11 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer touch-manipulation focus:outline-none ${
                          active 
                            ? "bg-amber-400/15 border-2 border-amber-400 scale-110 shadow-md shadow-amber-400/20" 
                            : "bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:scale-105"
                        }`}
                        aria-label={`${star} Stars`}
                      >
                        <Star
                          className={`h-6 w-6 sm:h-7 sm:w-7 pointer-events-none transition-colors ${
                            active
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Quick Number Pills for Instant Rating */}
                <div className="grid grid-cols-5 gap-1.5 w-full pt-1">
                  {[
                    { val: 1, label: "1★ Poor" },
                    { val: 2, label: "2★ Fair" },
                    { val: 3, label: "3★ Good" },
                    { val: 4, label: "4★ Great" },
                    { val: 5, label: "5★ Best" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onPointerDown={() => { setRating(item.val); setHoverRating(null); }}
                      onClick={(e) => { e.preventDefault(); setRating(item.val); setHoverRating(null); }}
                      className={`py-1.5 px-0.5 rounded-xl text-[10px] font-bold transition-all border text-center cursor-pointer ${
                        rating === item.val
                          ? "bg-amber-400 text-slate-950 border-amber-400 font-extrabold shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Textarea */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Your Review / Testimonial <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  rows={3}
                  placeholder="Share how Protech Assist has helped your business operations, inventory, sales, or accounting..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full resize-none text-sm rounded-xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Quick Feature Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  What did you like most? (Optional)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Author Details (Name, Role, Company) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">Your Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Samuel Koroma"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">Your Role / Title</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Managing Director / CEO"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">Business Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. City Central Supermarket"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">Industry Sector</Label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="h-9 w-full text-xs rounded-xl bg-background border border-input px-3 py-1 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  >
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Verified Client Notice */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  As an active client, your review will be tagged with a <strong>Verified Protech Client</strong> badge!
                </span>
              </div>
            </div>

            {/* Pinned Bottom Action Buttons (Never cut off!) */}
            <div className="shrink-0 p-4 sm:p-5 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkipAndLogout}
                disabled={submitting}
                className="w-full sm:w-auto order-2 sm:order-1 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Skip &amp; Log Out
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto order-1 sm:order-2 h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                    Submit Review &amp; Log Out
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
