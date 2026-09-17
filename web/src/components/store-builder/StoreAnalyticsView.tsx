"use client";

import React, { useState } from "react";
import { 
  Users, Eye, ShoppingCart, DollarSign, TrendingUp, Share2, 
  ExternalLink, Copy, Check, Sparkles, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Props {
  analytics: {
    storeStatus: string;
    storeSlug: string;
    totalVisitors: number;
    totalPageViews: number;
    totalOrders: number;
    totalRevenue: number;
    recentDaily: {
      date: string;
      visitors: number;
      pageViews: number;
      ordersCount: number;
      revenue: number;
    }[];
  } | null;
  currency?: string;
  storeName?: string;
}

export function StoreAnalyticsView({ analytics, currency = "SLE", storeName = "Your Store" }: Props) {
  const [copied, setCopied] = useState(false);

  if (!analytics) {
    return (
      <div className="p-12 text-center bg-card border rounded-2xl text-muted-foreground">
        <Sparkles className="w-8 h-8 mx-auto text-primary mb-2 opacity-50" />
        <h3 className="text-base font-semibold text-foreground">Analytics initializing</h3>
        <p className="text-xs mt-1">Analytics data will update automatically as shoppers visit your storefront.</p>
      </div>
    );
  }

  const publicUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/store/${analytics.storeSlug}` 
    : `/store/${analytics.storeSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Store link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const conversionRate = analytics.totalVisitors > 0 
    ? ((analytics.totalOrders / analytics.totalVisitors) * 100).toFixed(1) 
    : "0.0";

  const aov = analytics.totalOrders > 0 
    ? (analytics.totalRevenue / analytics.totalOrders).toFixed(0) 
    : "0";

  return (
    <div className="space-y-6">
      {/* Share / Promote Store Banner */}
      <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Public Storefront Link</span>
          <h2 className="text-xl font-extrabold text-foreground mt-0.5">{storeName}</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl font-mono">
            {publicUrl}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-card border hover:bg-muted transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Check out our online store! ${publicUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share on WhatsApp
          </a>
          <Link
            href={`/store/${analytics.storeSlug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Visit Store
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visitors */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Unique Visitors</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">
            {analytics.totalVisitors.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground">Unique devices viewing your store</p>
        </div>

        {/* Page Views */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Page Impressions</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">
            {analytics.totalPageViews.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground">Catalog & product detail visits</p>
        </div>

        {/* Total Orders */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Online Orders</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">
            {analytics.totalOrders.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">Conversion rate: {conversionRate}%</p>
        </div>

        {/* Revenue */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Storefront Revenue</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">
            {currency} {analytics.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground">Avg order value: {currency} {Number(aov).toLocaleString()}</p>
        </div>
      </div>

      {/* Daily Performance Breakdown */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Recent Daily Performance (Last 7 Days)
        </h3>

        {analytics.recentDaily.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">
            No daily traffic recorded yet. Once your store is published, real-time activity trends will display here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Visitors</th>
                  <th className="py-2.5 px-3 text-right">Page Views</th>
                  <th className="py-2.5 px-3 text-right">Orders</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.recentDaily.map(d => (
                  <tr key={d.date} className="hover:bg-muted/20">
                    <td className="py-2.5 px-3 font-medium">{new Date(d.date).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{d.visitors}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{d.pageViews}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">{d.ordersCount}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">{currency} {Number(d.revenue).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
