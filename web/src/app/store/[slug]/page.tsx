import React from "react";
import { notFound } from "next/navigation";
import { getPublicStorefrontData, getStoreDraftInfo } from "@/lib/actions/store-builder";
import { StoreThemeWrapper } from "@/components/storefront/StoreThemeWrapper";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { SectionRenderer } from "@/components/storefront/SectionRenderer";
import { StoreCartDrawer } from "@/components/storefront/StoreCartDrawer";
import { StoreCheckoutModal } from "@/components/storefront/StoreCheckoutModal";
import { StoreSection, StoreTheme, StoreNavigation, StoreSettings } from "@/types/store-builder";
import { Store as StoreIcon, ShieldAlert, LogIn, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const store = await getPublicStorefrontData(slug);
  if (!store) {
    const draft = await getStoreDraftInfo(slug);
    if (draft) return { title: `${draft.name} | Coming Soon` };
    return { title: "Store Not Found | ProTech Assist" };
  }
  const settings = (store.settings as unknown as StoreSettings) || {};
  return {
    title: settings.seo?.metaTitle || `${store.name} | Official Store`,
    description: settings.seo?.metaDescription || store.description || `Welcome to ${store.name} on ProTech Enterprise OS.`,
  };
}

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;
  const store = await getPublicStorefrontData(slug);

  if (!store) {
    const draftStore = await getStoreDraftInfo(slug);

    if (draftStore) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
              
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Opening Soon
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {draftStore.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {draftStore.description || "This storefront is currently being configured and will open for online orders shortly."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
              <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <StoreIcon className="w-4 h-4 text-indigo-600" />
                Are you the store owner?
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Sign in to your ProTech Enterprise OS account to preview and publish this store with 1 click.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/login?callbackUrl=/dashboard/store-builder"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-transform hover:scale-105"
              >
                <LogIn className="w-3.5 h-3.5" />
                Owner Login &amp; Publish
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-block px-5 py-3 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Return to ProTech
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <StoreIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Store Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The web address &apos;/store/{slug}&apos; does not exist on the platform.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            >
              Return to ProTech Assist
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const theme = (store.themeConfig as unknown as StoreTheme) || {};
  const navigation = (store.navigation as unknown as StoreNavigation) || undefined;
  const settings = (store.settings as unknown as StoreSettings) || {};
  const homePage = store.pages?.find((p: any) => p.slug === "home" || p.isHome) || store.pages?.[0];
  const sections = (homePage?.sections as unknown as StoreSection[]) || [];
  const products = store.products || [];

  return (
    <StoreThemeWrapper theme={theme}>
      {/* Sticky Owner Preview Banner (if in DRAFT mode) */}
      {store.status !== "PUBLISHED" && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2.5 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 z-50 sticky top-0 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-950 animate-ping" />
            <span>Store Preview Mode — Status: {store.status}. Only visible to you.</span>
          </div>
          <Link
            href="/dashboard/store-builder"
            className="px-3.5 py-1 bg-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shrink-0"
          >
            Go to Workspace to Publish
          </Link>
        </div>
      )}
      {/* Header */}
      <StoreHeader
        storeName={store.name}
        storeSlug={store.slug}
        logoUrl={store.logoUrl || store.business?.logoUrl}
        whatsappNumber={store.whatsappPhone || store.business?.whatsappPhone}
        theme={theme}
        navigation={navigation}
      />

      {/* Main Sections */}
      <main className="min-h-[60vh]">
        {sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            theme={theme}
            storeSlug={store.slug}
            storeName={store.name}
            products={products}
            navigation={navigation}
            whatsappNumber={store.whatsappPhone || store.business?.whatsappPhone}
            currency={store.currency || "SLE"}
            contactEmail={store.contactEmail || store.business?.email}
            contactPhone={store.contactPhone || store.business?.phone}
          />
        ))}
      </main>

      {/* Interactive Cart Drawer */}
      <StoreCartDrawer
        theme={theme}
        settings={settings}
        currency={store.currency || "SLE"}
        storeSlug={store.slug}
      />

      {/* Interactive Checkout Modal */}
      <StoreCheckoutModal
        storeSlug={store.slug}
        storeName={store.name}
        theme={theme}
        settings={settings}
        currency={store.currency || "SLE"}
        whatsappPhone={store.whatsappPhone || store.business?.whatsappPhone}
      />
    </StoreThemeWrapper>
  );
}
