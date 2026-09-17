"use client";

import React from "react";
import { StoreSection, StoreTheme, StoreNavigation } from "@/types/store-builder";
import { HeroSection } from "./sections/HeroSection";
import { ProductGridSection } from "./sections/ProductGridSection";
import { FeaturedProductSection } from "./sections/FeaturedProductSection";
import { CategoriesSection } from "./sections/CategoriesSection";
import { BannerSection } from "./sections/BannerSection";
import { TextSection } from "./sections/TextSection";
import { ImageSection } from "./sections/ImageSection";
import { ImageTextSection } from "./sections/ImageTextSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { FaqSection } from "./sections/FaqSection";
import { NewsletterSection } from "./sections/NewsletterSection";
import { ContactSection } from "./sections/ContactSection";
import { AboutSection } from "./sections/AboutSection";
import { PromotionalOfferSection } from "./sections/PromotionalOfferSection";
import { ProductCarouselSection } from "./sections/ProductCarouselSection";
import { FooterSection } from "./sections/FooterSection";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
  storeSlug: string;
  storeName: string;
  products?: any[];
  navigation?: StoreNavigation;
  whatsappNumber?: string;
  currency?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export function SectionRenderer({
  section,
  theme,
  storeSlug,
  storeName,
  products = [],
  navigation,
  whatsappNumber,
  currency = "SLE",
  contactEmail,
  contactPhone,
}: Props) {
  if (!section || section.visible === false) return null;

  switch (section.type) {
    case "hero":
      return <HeroSection section={section} theme={theme} storeSlug={storeSlug} whatsappNumber={whatsappNumber} />;
    case "product-grid":
      return <ProductGridSection section={section} theme={theme} storeSlug={storeSlug} products={products} currency={currency} />;
    case "featured-product":
      return <FeaturedProductSection section={section} theme={theme} storeSlug={storeSlug} products={products} currency={currency} whatsappNumber={whatsappNumber} />;
    case "categories":
      return <CategoriesSection section={section} theme={theme} storeSlug={storeSlug} products={products} />;
    case "banner":
      return <BannerSection section={section} theme={theme} storeSlug={storeSlug} />;
    case "text":
      return <TextSection section={section} theme={theme} />;
    case "image":
      return <ImageSection section={section} />;
    case "image-text":
      return <ImageTextSection section={section} theme={theme} />;
    case "testimonials":
      return <TestimonialsSection section={section} theme={theme} />;
    case "faq":
      return <FaqSection section={section} theme={theme} />;
    case "newsletter":
      return <NewsletterSection section={section} theme={theme} />;
    case "contact":
      return <ContactSection section={section} theme={theme} />;
    case "about":
      return <AboutSection section={section} theme={theme} />;
    case "promotional-offer":
      return <PromotionalOfferSection section={section} theme={theme} storeSlug={storeSlug} whatsappNumber={whatsappNumber} />;
    case "product-carousel":
      return <ProductCarouselSection section={section} theme={theme} storeSlug={storeSlug} products={products} currency={currency} />;
    case "footer":
      return (
        <FooterSection
          section={section}
          theme={theme}
          storeName={storeName}
          storeSlug={storeSlug}
          navigation={navigation}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
        />
      );
    default:
      return null;
  }
}
