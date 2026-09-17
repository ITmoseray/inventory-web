import React from "react";
import { notFound } from "next/navigation";
import { getPublicStorefrontData } from "@/lib/actions/store-builder";
import { StoreThemeWrapper } from "@/components/storefront/StoreThemeWrapper";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { SectionRenderer } from "@/components/storefront/SectionRenderer";
import { StoreCartDrawer } from "@/components/storefront/StoreCartDrawer";
import { StoreCheckoutModal } from "@/components/storefront/StoreCheckoutModal";
import { StoreSection, StoreTheme, StoreNavigation, StoreSettings } from "@/types/store-builder";
import { Store as StoreIcon, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const store = await getPublicStorefrontData(slug);
  if (!store) {
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
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
            <StoreIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Store Unavailable</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The store you are looking for is either in draft mode, undergoing updates, or does not exist.
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
