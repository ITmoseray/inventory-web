"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { 
  Search, 
  Sparkles, 
  Eye, 
  ArrowRight, 
  SlidersHorizontal, 
  Zap, 
  Star, 
  Smartphone, 
  MessageCircle, 
  TrendingUp,
  LayoutGrid,
  Filter
} from "lucide-react";
import { 
  StoreTemplateDTO, 
  TemplateCategories, 
  TemplateCategory, 
  TemplateStyles, 
  TemplateStyle 
} from "@/types/store-builder";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { TemplateCustomizeModal } from "./TemplateCustomizeModal";

interface Props {
  initialTemplates: StoreTemplateDTO[];
  hasEnterpriseAccount?: boolean;
  userBusinessName?: string;
  onSelectTemplate?: (template: StoreTemplateDTO) => void;
}

export function TemplateGallery({
  initialTemplates,
  hasEnterpriseAccount = false,
  userBusinessName = "",
  onSelectTemplate,
}: Props) {
  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("All");
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle>("all");
  const [sortBy, setSortBy] = useState<"featured" | "popular" | "name">("featured");

  // Modals state
  const [previewTemplate, setPreviewTemplate] = useState<StoreTemplateDTO | null>(null);
  const [customizeTemplate, setCustomizeTemplate] = useState<StoreTemplateDTO | null>(null);

  // Filtered and Sorted Templates
  const filteredTemplates = useMemo(() => {
    return initialTemplates.filter((t) => {
      // Category filter
      if (selectedCategory !== "All" && t.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Style filter
      if (selectedStyle !== "all" && t.style.toLowerCase() !== selectedStyle.toLowerCase()) {
        return false;
      }
      // Search term
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesCat = t.category.toLowerCase().includes(q);
        const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesCat && !matchesTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "featured") {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.usageCount - a.usageCount;
      }
      if (sortBy === "popular") {
        return b.usageCount - a.usageCount;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [initialTemplates, selectedCategory, selectedStyle, search, sortBy]);

  const handleUseTemplate = (template: StoreTemplateDTO) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    } else {
      setPreviewTemplate(null);
      setCustomizeTemplate(template);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-10 text-white border border-indigo-500/20 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            20+ Commercial-Grade Starter Templates
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Select an Original Store Design
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Every template is crafted for high mobile conversion, WhatsApp ordering, verified product merchandising, and seamless integration with Enterprise OS or Standalone shops.
          </p>
        </div>
        
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="space-y-4">
        {/* Top Controls: Search + Dropdowns */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates by industry, keyword, style (e.g. fashion, tech, luxury, food)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
            />
          </div>

          {/* Style Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-44">
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as TemplateStyle)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm capitalize"
              >
                <option value="all">All Styles</option>
                {TemplateStyles.filter(s => s !== "all").map((style) => (
                  <option key={style} value={style} className="capitalize">
                    {style} Style
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:w-44">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              >
                <option value="featured">Featured First</option>
                <option value="popular">Most Popular</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TemplateCategories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <LayoutGrid className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No templates match your filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try resetting your category or style selection, or search for another keyword.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedStyle("all");
              setSearch("");
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => {
            const primaryColor = template.themeConfig.colors.primary;
            const secondaryColor = template.themeConfig.colors.secondary;
            const accentColor = template.themeConfig.colors.accent;

            return (
              <div
                key={template.templateId}
                className="group relative flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image Container with Hover Actions */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {template.thumbnail ? (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-600">
                      <LayoutGrid className="w-8 h-8" />
                    </div>
                  )}

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    {template.isFeatured && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black shadow-md">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20 capitalize">
                      {template.style}
                    </span>
                  </div>

                  {/* Hover Overlay with Preview & Use CTA */}
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2.5 p-4 z-20">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="w-full max-w-[180px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-lg hover:bg-slate-100 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Live Preview
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full max-w-[180px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-lg hover:opacity-90 transition"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Use Template
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {template.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {template.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  {/* Color Palette & Features */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Palette:</span>
                        <div className="flex items-center -space-x-1">
                          <div 
                            className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 shadow-sm"
                            style={{ backgroundColor: primaryColor }}
                            title={`Primary: ${primaryColor}`}
                          />
                          <div 
                            className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 shadow-sm"
                            style={{ backgroundColor: secondaryColor }}
                            title={`Secondary: ${secondaryColor}`}
                          />
                          <div 
                            className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 shadow-sm"
                            style={{ backgroundColor: accentColor }}
                            title={`Accent: ${accentColor}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        <span>{template.usageCount} stores</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={(t) => handleUseTemplate(t)}
      />

      {/* Customize & Launch Modal */}
      {customizeTemplate && (
        <TemplateCustomizeModal
          template={customizeTemplate}
          isOpen={!!customizeTemplate}
          onClose={() => setCustomizeTemplate(null)}
          hasEnterpriseAccount={hasEnterpriseAccount}
          userBusinessName={userBusinessName}
        />
      )}
    </div>
  );
}
