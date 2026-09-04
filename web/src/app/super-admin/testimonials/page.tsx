"use client";

import React, { useState, useEffect } from "react";
import { 
  Star, ShieldCheck, CheckCircle2, XCircle, Trash2, ArrowLeft, RefreshCw, 
  Search, Filter, Sparkles, MessageSquare, Building2, User, MapPin, 
  Calendar, Award, Check, AlertCircle, Edit3, Heart, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

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
  status: "PENDING" | "APPROVED" | "FEATURED" | "REJECTED";
  isVerified: boolean;
  source: string;
  tags?: string[];
  createdAt: string;
}

export default function SuperAdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    featured: 0,
    rejected: 0,
    avgRating: "5.0",
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "FEATURED" | "REJECTED">("ALL");

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [editForm, setEditForm] = useState({
    authorName: "",
    authorRole: "",
    companyName: "",
    industry: "",
    location: "",
    content: "",
    rating: 5,
    status: "APPROVED",
    isVerified: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, [activeTab]);

  async function fetchTestimonials() {
    try {
      setLoading(true);
      const url = `/api/super-admin/testimonials?status=${activeTab}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.testimonials || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error(data.error || "Failed to fetch testimonials.");
      }
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      toast.error("Failed to connect to testimonials service.");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string, toggleVerified?: boolean) => {
    try {
      const payload: any = { status: newStatus };
      if (toggleVerified !== undefined) {
        payload.isVerified = toggleVerified;
      }

      const res = await fetch(`/api/super-admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Testimonial updated to ${newStatus}!`);
        fetchTestimonials();
      } else {
        toast.error(data.error || "Failed to update testimonial.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to process action.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this testimonial?")) return;

    try {
      const res = await fetch(`/api/super-admin/testimonials/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Testimonial deleted successfully!");
        fetchTestimonials();
      } else {
        toast.error(data.error || "Failed to delete testimonial.");
      }
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      toast.error("Failed to delete testimonial.");
    }
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingItem(t);
    setEditForm({
      authorName: t.authorName,
      authorRole: t.authorRole,
      companyName: t.companyName,
      industry: t.industry,
      location: t.location || "Sierra Leone",
      content: t.content,
      rating: t.rating,
      status: t.status,
      isVerified: t.isVerified,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/super-admin/testimonials/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Testimonial updated successfully!");
        setEditModalOpen(false);
        fetchTestimonials();
      } else {
        toast.error(data.error || "Failed to save changes.");
      }
    } catch (err) {
      console.error("Error saving edits:", err);
      toast.error("Failed to update testimonial.");
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.authorName.toLowerCase().includes(query) ||
      t.companyName.toLowerCase().includes(query) ||
      t.industry.toLowerCase().includes(query) ||
      t.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] px-4 sm:px-8 lg:px-12 py-8 text-slate-900 dark:text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link href="/super-admin">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
                <Star className="h-5 w-5 fill-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Testimonials &amp; Reviews <span className="text-indigo-600 dark:text-indigo-400">Moderation</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Moderate customer feedback from logouts &amp; landing page. Approved reviews appear live on the homepage.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={fetchTestimonials}
              disabled={loading}
              className="h-10 rounded-xl gap-2 font-bold text-xs uppercase tracking-wider"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Link href="/" target="_blank">
              <Button className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider gap-2 shadow-md">
                <ExternalLink className="h-3.5 w-3.5" /> View Landing Page
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reviews</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 shadow-sm space-y-1 relative overflow-hidden">
            {stats.pending > 0 && (
              <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Pending Review</span>
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.pending}</p>
          </div>
          <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 shadow-sm space-y-1">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Approved</span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
          </div>
          <div className="p-5 rounded-3xl bg-purple-500/5 border border-purple-500/20 shadow-sm space-y-1">
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">Featured ⭐</span>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats.featured}</p>
          </div>
          <div className="p-5 rounded-3xl bg-rose-500/5 border border-rose-500/20 shadow-sm space-y-1">
            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Rejected</span>
            <p className="text-3xl font-black text-rose-600 dark:text-rose-400">{stats.rejected}</p>
          </div>
          <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 shadow-sm space-y-1">
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Avg Rating</span>
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.avgRating}</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800">
            {[
              { id: "ALL", label: "All Reviews", count: stats.total },
              { id: "PENDING", label: "Pending", count: stats.pending, highlight: stats.pending > 0 },
              { id: "APPROVED", label: "Approved", count: stats.approved },
              { id: "FEATURED", label: "Featured", count: stats.featured },
              { id: "REJECTED", label: "Rejected", count: stats.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  tab.highlight 
                    ? "bg-amber-500 text-white font-extrabold animate-pulse" 
                    : "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by author, company, industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-2xl bg-white dark:bg-slate-900 text-xs"
            />
          </div>
        </div>

        {/* Testimonials List */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-indigo-600" />
            <p className="text-sm text-slate-500 font-medium">Loading testimonials from database...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 p-8 space-y-3">
            <div className="h-14 w-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No testimonials found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No reviews match the current status filter "{activeTab}". Testimonials will automatically appear here when merchants log out or submit feedback.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredTestimonials.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-6 rounded-3xl bg-white dark:bg-slate-900/60 border backdrop-blur-md shadow-sm space-y-5 transition-all relative overflow-hidden ${
                    t.status === "PENDING"
                      ? "border-amber-400/60 dark:border-amber-500/40 shadow-amber-500/5"
                      : t.status === "FEATURED"
                      ? "border-purple-400/60 dark:border-purple-500/40 shadow-purple-500/5"
                      : t.status === "REJECTED"
                      ? "border-rose-300 dark:border-rose-900/50 opacity-70"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        t.status === "PENDING"
                          ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700"
                          : t.status === "APPROVED"
                          ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700"
                          : t.status === "FEATURED"
                          ? "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700 font-extrabold"
                          : "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-700"
                      }`}>
                        {t.status === "FEATURED" ? "⭐ FEATURED ON HOMEPAGE" : t.status}
                      </span>

                      {/* Verified Merchant Badge */}
                      {t.isVerified && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-indigo-600 dark:text-indigo-400" /> Verified Merchant
                        </span>
                      )}

                      {/* Source Tag */}
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                        {t.source === "LOGOUT_FEEDBACK" ? "Logout Feedback" : "Landing Page"}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {format(new Date(t.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= t.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 ml-1.5">
                      {t.rating}.0 / 5.0
                    </span>
                  </div>

                  {/* Quote Content */}
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-normal leading-relaxed italic border-l-2 border-indigo-500/40 pl-3">
                    "{t.content}"
                  </p>

                  {/* Tags */}
                  {t.tags && t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {t.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author & Enterprise Info */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                        {t.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {t.authorName}
                        </h4>
                        <p className="text-xs text-slate-500 leading-tight">
                          {t.authorRole} • <span className="font-semibold text-slate-700 dark:text-slate-300">{t.companyName}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">{t.industry}</span>
                          {t.location && <span>• {t.location}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Hub */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {/* Approve Button */}
                    {t.status !== "APPROVED" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(t.id, "APPROVED")}
                        className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                    )}

                    {/* Feature on Homepage Button */}
                    {t.status !== "FEATURED" ? (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(t.id, "FEATURED")}
                        className="h-8 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] uppercase tracking-wider gap-1 shadow-sm"
                      >
                        <Star className="h-3.5 w-3.5 fill-current" /> Feature on Homepage
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(t.id, "APPROVED")}
                        className="h-8 px-3 rounded-xl border-purple-300 text-purple-600 font-bold text-[10px] uppercase tracking-wider gap-1"
                      >
                        Un-Feature
                      </Button>
                    )}

                    {/* Toggle Verified Client */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(t.id, t.status, !t.isVerified)}
                      className={`h-8 px-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider gap-1 ${
                        t.isVerified ? "text-indigo-600 border-indigo-200" : "text-slate-500"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {t.isVerified ? "Verified ✅" : "Make Verified"}
                    </Button>

                    {/* Reject Button */}
                    {t.status !== "REJECTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(t.id, "REJECTED")}
                        className="h-8 px-2.5 rounded-xl border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase tracking-wider gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    )}

                    {/* Edit Details */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(t)}
                      className="h-8 px-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-[10px] uppercase tracking-wider gap-1"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </Button>

                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(t.id)}
                      className="h-8 px-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 ml-auto"
                      title="Permanently Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Edit Modal Dialog */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-xl w-full p-6 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                Edit Testimonial Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Update review content, author identity, and approval status.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Author Name</Label>
                  <Input
                    value={editForm.authorName}
                    onChange={(e) => setEditForm({ ...editForm, authorName: e.target.value })}
                    required
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Role / Title</Label>
                  <Input
                    value={editForm.authorRole}
                    onChange={(e) => setEditForm({ ...editForm, authorRole: e.target.value })}
                    required
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Company Name</Label>
                  <Input
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                    required
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Industry</Label>
                  <Input
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    required
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Review Content</Label>
                <Textarea
                  rows={4}
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  required
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Rating (1-5)</Label>
                  <select
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                    className="h-9 w-full rounded-xl bg-background border border-input px-3 text-xs"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} Stars
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Status</Label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="h-9 w-full rounded-xl bg-background border border-input px-3 text-xs"
                  >
                    <option value="APPROVED">APPROVED (Live)</option>
                    <option value="FEATURED">FEATURED (Homepage Spotlight)</option>
                    <option value="PENDING">PENDING (Hold)</option>
                    <option value="REJECTED">REJECTED (Archived)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditModalOpen(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingEdit}
                  className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
