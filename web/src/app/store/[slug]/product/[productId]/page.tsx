import React from "react";
import { notFound } from "next/navigation";
import { getPublicStorefrontData } from "@/lib/actions/store-builder";
import { StoreThemeWrapper } from "@/components/storefront/StoreThemeWrapper";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreCartDrawer } from "@/components/storefront/StoreCartDrawer";
import { StoreCheckoutModal } from "@/components/storefront/StoreCheckoutModal";
import { StoreMobileBottomNav } from "@/components/storefront/StoreMobileBottomNav";
import { StoreTheme, StoreNavigation, StoreSettings, normalizeStoreProduct } from "@/types/store-builder";
import { ProductDetailPageClient } from "./ProductDetailPageClient";

interface Props {
  params: Promise<{ slug: string; productId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug, productId } = await params;
  const store = await getPublicStorefrontData(slug);
  if (!store) return { title: "Store Not Found" };

  const storeProduct = store.products?.find((sp: any) => 
    sp.id === productId || 
    sp.productId === productId || 
    sp.product?.id === productId
  );
  const p = storeProduct ? normalizeStoreProduct(storeProduct) : null;

  return {
    title: p ? `${p.name} | ${store.name}` : `Product | ${store.name}`,
    description: p?.description || `Order ${p?.name || 'this item'} online from ${store.name}. Fast delivery available.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug, productId } = await params;
  const store = await getPublicStorefrontData(slug);
  if (!store) notFound();

  const storeProduct = store.products?.find((sp: any) => 
    sp.id === productId || 
    sp.productId === productId || 
    sp.product?.id === productId
  );
  if (!storeProduct) notFound();

  const theme = (store.themeConfig as unknown as StoreTheme) || {};
  const navigation = (store.navigation as unknown as StoreNavigation) || undefined;
  const settings = (store.settings as unknown as StoreSettings) || {};

  return (
    <StoreThemeWrapper theme={theme}>
      <StoreHeader
        storeName={store.name}
        storeSlug={store.slug}
        logoUrl={store.logoUrl || store.business?.logoUrl}
        whatsappNumber={store.whatsappPhone || store.business?.whatsappPhone}
        theme={theme}
        navigation={navigation}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-14 pb-20 md:pb-14">
        <ProductDetailPageClient
          storeProduct={storeProduct}
          store={store}
          theme={theme}
          settings={settings}
        />
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <StoreMobileBottomNav
        storeSlug={store.slug}
        whatsappNumber={store.whatsappPhone || store.business?.whatsappPhone}
        theme={theme}
      />

      <StoreCartDrawer
        theme={theme}
        settings={settings}
        currency={store.currency || "SLE"}
        storeSlug={store.slug}
      />

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
