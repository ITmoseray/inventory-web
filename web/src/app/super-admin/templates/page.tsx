"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  RefreshCw, 
  Eye, 
  Store as StoreIcon, 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Zap,
  Tag,
  Palette
} from "lucide-react";
import Link from "next/link";
import { 
  StoreTemplateDTO, 
  TemplateCategories, 
  TemplateStyles 
} from "@/types/store-builder";
import { 
  getStoreTemplatesAction, 
  seedStoreTemplatesAction 
} from "@/lib/actions/store-builder";
import { TemplatePreviewModal } from "@/components/store-builder/TemplatePreviewModal";
import { toast } from "sonner";

export default function SuperAdminTemplatesPage() {
  const [templates, setTemplates] = useState<StoreTemplateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState<StoreTemplateDTO | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await getStoreTemplatesAction();
      if (res.success && res.templates) {
        setTemplates(res.templates);
      } else {
        toast.error(res.error || "Failed to load templates");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSeedTemplates = async () => {
    setSeeding(true);
    try {
      const res = await seedStoreTemplatesAction();
      if (res.success) {
        toast.success(`Successfully synchronized ${res.count} factory starter templates to the database!`);
        await fetchTemplates();
      } else {
        toast.error(res.error || "Failed to sync templates");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sync templates");
    } finally {
      setSeeding(false);
    }
  };

  // Metrics calculation
  const totalViews = templates.reduce((acc, t) => acc + (t.viewsCount || 0), 0);
  const totalUsages = templates.reduce((acc, t) => acc + (t.usageCount || 0), 0);
  const featuredCount = templates.filter(t => t.isFeatured).length;

  const filteredTemplates = templates.filter((t) => {
    if (categoryFilter !== "All" && t.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Link
            href="/super-admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Super Admin
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Store Templates Catalog
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage all 20+ commercial starter designs, inspect traffic telemetry, and sync database presets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchTemplates}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleSeedTemplates}
            disabled={seeding}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {seeding ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Syncing 20 Presets...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Sync / Seed 20 Starter Templates
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Templates</p>
            <h3 className="text-2xl font-black text-white mt-1">{templates.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Featured Designs</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{featuredCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Template Previews</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalViews.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Stores Launched</p>
            <h3 className="text-2xl font-black text-indigo-400 mt-1">{totalUsages.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <StoreIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by title, description, tags, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {TemplateCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Table / Catalog List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Template</th>
                <th className="py-3.5 px-4">Category & Style</th>
                <th className="py-3.5 px-4">Color Palette</th>
                <th className="py-3.5 px-4">Sections</th>
                <th className="py-3.5 px-4">Views / Usages</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredTemplates.map((t) => (
                <tr key={t.templateId} className="hover:bg-slate-800/40 transition">
                  {/* Template Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded-lg overflow-hidden bg-slate-800 relative shrink-0 border border-slate-700">
                        {t.thumbnail ? (
                          <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-[9px]">
                            No pic
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{t.name}</span>
                          {t.isFeatured && (
                            <span className="p-0.5 rounded bg-amber-500/20 text-amber-400" title="Featured">
                              <Star className="w-3 h-3 fill-current" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{t.slug}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category & Style */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {t.category}
                      </span>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {t.style} archetype
                      </div>
                    </div>
                  </td>

                  {/* Color Palette */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-4 h-4 rounded-full border border-slate-700" 
                        style={{ backgroundColor: t.themeConfig.colors.primary }}
                        title={`Primary: ${t.themeConfig.colors.primary}`}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-slate-700" 
                        style={{ backgroundColor: t.themeConfig.colors.secondary }}
                        title={`Secondary: ${t.themeConfig.colors.secondary}`}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-slate-700" 
                        style={{ backgroundColor: t.themeConfig.colors.accent }}
                        title={`Accent: ${t.themeConfig.colors.accent}`}
                      />
                    </div>
                  </td>

                  {/* Sections count */}
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="font-mono text-xs">{t.sections.length}</span> blocks
                  </td>

                  {/* Views & Usages */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 font-mono text-[11px]">
                      <div className="text-slate-300 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>{t.viewsCount || 0} views</span>
                      </div>
                      <div className="text-emerald-400 flex items-center gap-1">
                        <StoreIcon className="w-3 h-3" />
                        <span>{t.usageCount || 0} stores</span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === "PUBLISHED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {t.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setPreviewTemplate(t)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white inline-flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={() => {
          setPreviewTemplate(null);
          toast.info("Navigate to Store Builder to launch a store with this template.");
        }}
      />
    </div>
  );
}
