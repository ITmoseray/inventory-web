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
import { Star, Heart, CheckCircle2, Sparkles, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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

export function SubmitReviewModal({ isOpen, onClose, onSuccess }: SubmitReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("Business Owner / CEO");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Retail & POS");
  const [location, setLocation] = useState("Sierra Leone");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim() || !companyName.trim()) {
      toast.error("Please fill in your name, business name, and review content.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim(),
          authorRole: authorRole.trim() || "Business Owner",
          companyName: companyName.trim(),
          content: content.trim(),
          rating,
          industry,
          location: location.trim() || "Sierra Leone",
          tags: selectedTags,
          source: "LANDING_PAGE",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmittedSuccess(true);
        toast.success("Thank you! Your review has been submitted for moderation.");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setSubmittedSuccess(false);
          setContent("");
          setAuthorName("");
          setCompanyName("");
          setSelectedTags([]);
          onClose();
        }, 2200);
      } else {
        toast.error(data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("An error occurred while submitting your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="max-w-xl w-full p-0 overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl">
        {/* Glowing Top Banner */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-indigo-100">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                Share Your Experience
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                How has Protech Assist impacted your business?
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
                Join our verified clients and help other business owners discover our modern enterprise tools.
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Heart className="h-6 w-6 fill-rose-400 text-rose-400" />
            </div>
          </div>
        </div>

        {/* Content Body */}
        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Review Received!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Thank you for your valuable feedback! Our team will review and feature it on our homepage.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {/* Star Rating Selector */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Rating</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating !== null ? hoverRating : rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          active
                            ? "text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                {rating === 5 && "⭐ 5.0 - Exceptional Performance & Support"}
                {rating === 4 && "👍 4.0 - Very Good Experience"}
                {rating === 3 && "👌 3.0 - Good System"}
                {rating === 2 && "⚠️ 2.0 - Needs Some Polish"}
                {rating === 1 && "🛑 1.0 - Needs Significant Fixes"}
              </span>
            </div>

            {/* Review Textarea */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Your Testimonial <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                rows={3}
                placeholder="Describe how Protech Assist helped your inventory management, cashier speed, accounting, or branch control..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full resize-none text-sm rounded-xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Quick Feature Tags */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Key Highlights (Optional)
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

            {/* Author Details (Name, Role, Company, Location) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500 uppercase">
                  Your Full Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Mariatu Sesay"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500 uppercase">Your Role / Designation</Label>
                <Input
                  type="text"
                  placeholder="e.g. Managing Director / CEO"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500 uppercase">
                  Business Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Crown Pharmacy &amp; Supermart"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
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

            {/* Location & Verification */}
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">City &amp; Country</Label>
              <Input
                type="text"
                placeholder="e.g. Freetown, Sierra Leone"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={submitting}
                className="text-xs font-bold text-slate-500"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-indigo-600/20"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Review
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
