import { z } from "zod";

// ─── STYLE ARCHETYPES ─────────────────────────────────────────────
export const StoreStyleArchetypes = [
  "modern",
  "luxury",
  "minimal",
  "fashion",
  "african-contemporary",
  "electronics",
  "grocery",
  "pharmacy",
  "restaurant",
  "corporate",
] as const;

export type StoreStyleArchetype = typeof StoreStyleArchetypes[number];

// ─── THEME SCHEMA ────────────────────────────────────────────────
export const StoreThemeSchema = z.object({
  style: z.enum(StoreStyleArchetypes).default("modern"),
  colors: z.object({
    primary: z.string().default("#4F46E5"),
    secondary: z.string().default("#06B6D4"),
    accent: z.string().default("#F59E0B"),
    background: z.string().default("#FFFFFF"),
    surface: z.string().default("#F8FAFC"),
    text: z.string().default("#0F172A"),
    mutedText: z.string().default("#64748B"),
    headerBg: z.string().default("#FFFFFF"),
    footerBg: z.string().default("#0F172A"),
    footerText: z.string().default("#F8FAFC"),
  }),
  fonts: z.object({
    heading: z.string().default("Inter"),
    body: z.string().default("Inter"),
  }),
  borderRadius: z.enum(["none", "sm", "md", "lg", "xl", "full"]).default("lg"),
  headerLayout: z.enum(["standard", "centered", "minimal"]).default("standard"),
  showAnnouncementBar: z.boolean().default(true),
  announcementText: z.string().default("Welcome to our online store! Fast nationwide delivery available."),
  announcementBg: z.string().default("#4F46E5"),
  announcementTextColor: z.string().default("#FFFFFF"),
});

export type StoreTheme = z.infer<typeof StoreThemeSchema>;

export const DEFAULT_STORE_THEME: StoreTheme = {
  style: "modern",
  colors: {
    primary: "#4F46E5",
    secondary: "#06B6D4",
    accent: "#F59E0B",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#0F172A",
    mutedText: "#64748B",
    headerBg: "#FFFFFF",
    footerBg: "#0F172A",
    footerText: "#F8FAFC",
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
  },
  borderRadius: "lg",
  headerLayout: "standard",
  showAnnouncementBar: true,
  announcementText: "Welcome to our online store! Fast nationwide delivery available.",
  announcementBg: "#4F46E5",
  announcementTextColor: "#FFFFFF",
};

export function normalizeStoreTheme(rawTheme?: any): StoreTheme {
  if (!rawTheme || typeof rawTheme !== "object") return DEFAULT_STORE_THEME;
  return {
    ...DEFAULT_STORE_THEME,
    ...rawTheme,
    colors: {
      ...DEFAULT_STORE_THEME.colors,
      ...(rawTheme.colors || {}),
    },
    fonts: {
      ...DEFAULT_STORE_THEME.fonts,
      ...(rawTheme.fonts || {}),
    },
  };
}

// ─── SECTION TYPES ───────────────────────────────────────────────
export const StoreSectionTypes = [
  "hero",
  "product-grid",
  "featured-product",
  "categories",
  "banner",
  "text",
  "image",
  "image-text",
  "testimonials",
  "faq",
  "newsletter",
  "contact",
  "about",
  "promotional-offer",
  "product-carousel",
  "footer",
] as const;

export type StoreSectionType = typeof StoreSectionTypes[number];

export const StoreSectionSchema = z.object({
  id: z.string(),
  type: z.enum(StoreSectionTypes),
  order: z.number().default(0),
  visible: z.boolean().default(true),
  settings: z.record(z.string(), z.any()).default({}),
  content: z.record(z.string(), z.any()).default({}),
});

export type StoreSection = z.infer<typeof StoreSectionSchema>;

// ─── NAVIGATION SCHEMA ───────────────────────────────────────────
export const StoreNavItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
  isExternal: z.boolean().default(false),
});

export type StoreNavItem = z.infer<typeof StoreNavItemSchema>;

export const StoreNavigationSchema = z.object({
  header: z.array(StoreNavItemSchema).default([
    { id: "nav-1", label: "Home", url: "/", isExternal: false },
    { id: "nav-2", label: "Shop", url: "/products", isExternal: false },
    { id: "nav-3", label: "About", url: "/about", isExternal: false },
    { id: "nav-4", label: "Contact", url: "/contact", isExternal: false },
  ]),
  footer: z.array(StoreNavItemSchema).default([
    { id: "f-1", label: "Shop All", url: "/products", isExternal: false },
    { id: "f-2", label: "About Us", url: "/about", isExternal: false },
    { id: "f-3", label: "Contact Us", url: "/contact", isExternal: false },
    { id: "f-4", label: "Delivery Policy", url: "/delivery", isExternal: false },
  ]),
});

export type StoreNavigation = z.infer<typeof StoreNavigationSchema>;

// ─── SETTINGS SCHEMA ─────────────────────────────────────────────
export const StoreSettingsSchema = z.object({
  deliveryFee: z.number().default(0),
  freeDeliveryThreshold: z.number().optional(),
  deliveryEstimateDays: z.string().default("1-2 business days"),
  minOrderAmount: z.number().default(0),
  minOrder: z.number().optional(),
  allowCashOnDelivery: z.boolean().default(true),
  allowOnlinePayment: z.boolean().default(false),
  whatsappOrdering: z.boolean().default(true),
  whatsappNumber: z.string().default(""),
  supportPhone: z.string().default(""),
  supportEmail: z.string().default(""),
  physicalAddress: z.string().default(""),
  announcementText: z.string().optional(),
  announcementEnabled: z.boolean().optional(),
  seo: z.object({
    metaTitle: z.string().default(""),
    metaDescription: z.string().default(""),
    ogImageUrl: z.string().optional(),
  }).default({
    metaTitle: "",
    metaDescription: "",
  }),
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

// ─── STORE PAGE SCHEMA ───────────────────────────────────────────
export const StorePageSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  isHome: z.boolean().default(false),
  sections: z.array(StoreSectionSchema),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  published: z.boolean().default(true),
});

export type StorePageData = z.infer<typeof StorePageSchema>;

// ─── STORE GENERATION SCHEMA (AI CONTRACT) ───────────────────────
export const AIStoreGenerationInputSchema = z.object({
  businessName: z.string().min(2),
  businessType: z.string().default("Retail"),
  description: z.string().min(10),
  location: z.string().default("Freetown, Sierra Leone"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  targetCustomers: z.string().optional(),
  styleArchetype: z.enum(StoreStyleArchetypes).default("modern"),
  productIds: z.array(z.string()).default([]),
});

export type AIStoreGenerationInput = z.infer<typeof AIStoreGenerationInputSchema>;

export const AIStoreGenerationOutputSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  tagline: z.string(),
  theme: StoreThemeSchema,
  navigation: StoreNavigationSchema,
  settings: StoreSettingsSchema,
  homeSections: z.array(StoreSectionSchema),
  aboutContent: z.object({
    story: z.string(),
    mission: z.string(),
    highlights: z.array(z.string()),
  }),
});

export type AIStoreGenerationOutput = z.infer<typeof AIStoreGenerationOutputSchema>;

// ─── CART ITEM & STOREFRONT TYPES ────────────────────────────────
export interface CartItem {
  id: string; // unique item cart key (productId + variant)
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  maxStock: number;
  sku?: string | null;
  unitName?: string;
}

export interface StorefrontCustomerCheckoutData {
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity?: string;
  deliveryMethod: "DELIVERY" | "PICKUP";
  paymentMethod: "CASH_ON_DELIVERY" | "WHATSAPP" | "ONLINE";
  orderNotes?: string;
}
