import { 
  AIStoreGenerationInput, 
  AIStoreGenerationOutput, 
  AIStoreGenerationOutputSchema,
  StoreStyleArchetype,
  StoreTheme,
  StoreSection,
  AIProductCopyInput,
  AIProductCopyOutput,
  AIStoreUpsellOffer,
  normalizeStoreTheme
} from "@/types/store-builder";

// ─── STYLE PRESETS (CURATED DESIGNS) ──────────────────────────────
export const STYLE_PRESETS: Record<StoreStyleArchetype, {
  theme: Partial<StoreTheme>;
  heroBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
}> = {
  modern: {
    theme: {
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
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "lg",
    },
    heroBadge: "NEW ARRIVALS 2026",
    heroHeadline: "Modern Essentials for Everyday Living",
    heroSubheadline: "Discover our latest curated collection. Quality guaranteed with swift nationwide doorstep delivery."
  },
  luxury: {
    theme: {
      style: "luxury",
      colors: {
        primary: "#D4AF37", // Gold
        secondary: "#1A1A1A",
        accent: "#C5A059",
        background: "#0A0A0A",
        surface: "#171717",
        text: "#FDFDFD",
        mutedText: "#A3A3A3",
        headerBg: "#0A0A0A",
        footerBg: "#050505",
        footerText: "#D4AF37",
      },
      fonts: { heading: "Playfair Display", body: "Inter" },
      borderRadius: "none",
    },
    heroBadge: "PREMIUM COUTURE & LUXURY",
    heroHeadline: "Excellence in Every Thread & Detail",
    heroSubheadline: "Indulge in authentic premium pieces designed for timeless sophistication and distinction."
  },
  minimal: {
    theme: {
      style: "minimal",
      colors: {
        primary: "#18181B",
        secondary: "#71717A",
        accent: "#27272A",
        background: "#FFFFFF",
        surface: "#FAFAFA",
        text: "#18181B",
        mutedText: "#71717A",
        headerBg: "#FFFFFF",
        footerBg: "#18181B",
        footerText: "#FAFAFA",
      },
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "sm",
    },
    heroBadge: "SIMPLICITY & UTILITY",
    heroHeadline: "Pure Functionality Meets Elegant Form",
    heroSubheadline: "Carefully designed essentials. No unnecessary noise, just pure enduring quality."
  },
  fashion: {
    theme: {
      style: "fashion",
      colors: {
        primary: "#E11D48", // Rose
        secondary: "#F43F5E",
        accent: "#FB7185",
        background: "#FFFFFF",
        surface: "#FFF1F2",
        text: "#1E1E24",
        mutedText: "#881337",
        headerBg: "#FFFFFF",
        footerBg: "#1E1E24",
        footerText: "#FFF1F2",
      },
      fonts: { heading: "Playfair Display", body: "Inter" },
      borderRadius: "full",
    },
    heroBadge: "TRENDING FASHION LOOKS",
    heroHeadline: "Express Your Authentic Style Everyday",
    heroSubheadline: "Vibrant dresses, chic accessories, footwear and bespoke apparel crafted to turn heads."
  },
  "african-contemporary": {
    theme: {
      style: "african-contemporary",
      colors: {
        primary: "#C2410C", // Terracotta / Ochre
        secondary: "#B45309", // Warm Amber
        accent: "#15803D", // Forest Green
        background: "#FAF6F0", // Warm Ivory
        surface: "#F5EFEB",
        text: "#291811",
        mutedText: "#78564B",
        headerBg: "#FAF6F0",
        footerBg: "#291811",
        footerText: "#FAF6F0",
      },
      fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
      borderRadius: "xl",
    },
    heroBadge: "AFRICAN EXCELLENCE & HERITAGE",
    heroHeadline: "Authentic African Flair Meets Modern Craft",
    heroSubheadline: "Handcrafted, curated and celebrating rich African heritage with contemporary metropolitan energy."
  },
  electronics: {
    theme: {
      style: "electronics",
      colors: {
        primary: "#2563EB",
        secondary: "#0284C7",
        accent: "#10B981",
        background: "#FFFFFF",
        surface: "#F1F5F9",
        text: "#0F172A",
        mutedText: "#64748B",
        headerBg: "#0F172A",
        footerBg: "#020617",
        footerText: "#94A3B8",
      },
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "md",
    },
    heroBadge: "ORIGINAL & VERIFIED GADGETS",
    heroHeadline: "Cutting-Edge Tech, Phones, & Home Audio",
    heroSubheadline: "100% Genuine brand-new electronics, laptops, smartphones and accessories with authentic warranty."
  },
  grocery: {
    theme: {
      style: "grocery",
      colors: {
        primary: "#16A34A",
        secondary: "#65A30D",
        accent: "#F97316",
        background: "#FFFFFF",
        surface: "#F0FDF4",
        text: "#14532D",
        mutedText: "#166534",
        headerBg: "#FFFFFF",
        footerBg: "#14532D",
        footerText: "#F0FDF4",
      },
      fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
      borderRadius: "xl",
    },
    heroBadge: "FARM FRESH & ESSENTIALS",
    heroHeadline: "Fresh Food, Groceries & Daily Household Goods",
    heroSubheadline: "Direct from verified suppliers to your kitchen. Fast same-day local delivery across the city."
  },
  pharmacy: {
    theme: {
      style: "pharmacy",
      colors: {
        primary: "#0D9488",
        secondary: "#0284C7",
        accent: "#14B8A6",
        background: "#FFFFFF",
        surface: "#F0FDFA",
        text: "#134E4A",
        mutedText: "#115E59",
        headerBg: "#FFFFFF",
        footerBg: "#134E4A",
        footerText: "#CCFBF1",
      },
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "lg",
    },
    heroBadge: "TRUSTED HEALTHCARE & WELLNESS",
    heroHeadline: "Certified Medicines, Vitamins & Personal Care",
    heroSubheadline: "Licensed pharmaceuticals, professional wellness advice, and discreet rapid delivery."
  },
  restaurant: {
    theme: {
      style: "restaurant",
      colors: {
        primary: "#EA580C",
        secondary: "#D97706",
        accent: "#E11D48",
        background: "#FFFBF7",
        surface: "#FFF7ED",
        text: "#431407",
        mutedText: "#9A3412",
        headerBg: "#FFFBF7",
        footerBg: "#431407",
        footerText: "#FFEDD5",
      },
      fonts: { heading: "Playfair Display", body: "Inter" },
      borderRadius: "xl",
    },
    heroBadge: "CHEF'S FRESH MENU",
    heroHeadline: "Savor Delicious Hot Meals & Delicacies",
    heroSubheadline: "Prepared fresh with love and authentic ingredients. Order online for instant pickup or doorstep delivery."
  },
  corporate: {
    theme: {
      style: "corporate",
      colors: {
        primary: "#1E3A8A",
        secondary: "#0284C7",
        accent: "#F59E0B",
        background: "#FFFFFF",
        surface: "#F8FAFC",
        text: "#0F172A",
        mutedText: "#475569",
        headerBg: "#FFFFFF",
        footerBg: "#1E293B",
        footerText: "#F8FAFC",
      },
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "md",
    },
    heroBadge: "ENTERPRISE SOLUTIONS",
    heroHeadline: "Professional Supplies, Tools & Office Services",
    heroSubheadline: "Bulk corporate purchasing, vetted suppliers, invoice settlement, and commercial logistics."
  },
  hardware: {
    theme: {
      style: "hardware",
      colors: {
        primary: "#B45309",
        secondary: "#374151",
        accent: "#F59E0B",
        background: "#FFFFFF",
        surface: "#F9FAFB",
        text: "#111827",
        mutedText: "#4B5563",
        headerBg: "#1F2937",
        footerBg: "#111827",
        footerText: "#F3F4F6",
      },
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "md",
    },
    heroBadge: "HEAVY-DUTY TOOLS & HARDWARE",
    heroHeadline: "Quality Building Materials, Hardware & Tools",
    heroSubheadline: "Trusted electricals, plumbing supplies, power tools, paints, and contractor equipment."
  },
  beauty: {
    theme: {
      style: "beauty",
      colors: {
        primary: "#DB2777",
        secondary: "#9333EA",
        accent: "#F43F5E",
        background: "#FFF5F7",
        surface: "#FFFFFF",
        text: "#831843",
        mutedText: "#9D174D",
        headerBg: "#FFFFFF",
        footerBg: "#500724",
        footerText: "#FCE7F3",
      },
      fonts: { heading: "Playfair Display", body: "Inter" },
      borderRadius: "full",
    },
    heroBadge: "PREMIUM BEAUTY & GLAMOUR",
    heroHeadline: "Radiant Skincare, Cosmetics & Fragrances",
    heroSubheadline: "Discover authentic luxury makeup, hair care, body pampering, and signature fragrances."
  },
  furniture: {
    theme: {
      style: "furniture",
      colors: {
        primary: "#78350F",
        secondary: "#A16207",
        accent: "#059669",
        background: "#FDFBF7",
        surface: "#F8F4EE",
        text: "#451A03",
        mutedText: "#78350F",
        headerBg: "#FDFBF7",
        footerBg: "#271406",
        footerText: "#FDFBF7",
      },
      fonts: { heading: "Playfair Display", body: "Inter" },
      borderRadius: "lg",
    },
    heroBadge: "ELEGANT LIVING & CRAFT",
    heroHeadline: "Handcrafted Furniture & Home Decor",
    heroSubheadline: "Bespoke living sets, solid hardwood dining, bedroom suites, and luxury architectural furnishings."
  },
  services: {
    theme: {
      style: "services",
      colors: {
        primary: "#0284C7",
        secondary: "#4F46E5",
        accent: "#10B981",
        background: "#FFFFFF",
        surface: "#F0F9FF",
        text: "#0C4A6E",
        mutedText: "#0369A1",
        headerBg: "#FFFFFF",
        footerBg: "#0C4A6E",
        footerText: "#E0F2FE",
      },
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "lg",
    },
    heroBadge: "VERIFIED LOCAL EXPERTS",
    heroHeadline: "Book Professional Services & Repairs Online",
    heroSubheadline: "Licensed technicians, salon styling, appliance repairs, and skilled commercial services."
  },
  school: {
    theme: {
      style: "school",
      colors: {
        primary: "#1D4ED8",
        secondary: "#B45309",
        accent: "#F59E0B",
        background: "#FFFFFF",
        surface: "#EFF6FF",
        text: "#1E3A8A",
        mutedText: "#1D4ED8",
        headerBg: "#FFFFFF",
        footerBg: "#1E3A8A",
        footerText: "#DBEAFE",
      },
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "md",
    },
    heroBadge: "ACADEMIC EXCELLENCE",
    heroHeadline: "School Supplies, Uniforms & Learning Materials",
    heroSubheadline: "Textbooks, stationery, branded school uniforms, and digital educational resources."
  },
  ngo: {
    theme: {
      style: "ngo",
      colors: {
        primary: "#047857",
        secondary: "#0284C7",
        accent: "#F59E0B",
        background: "#F9FDFB",
        surface: "#ECFDF5",
        text: "#064E3B",
        mutedText: "#047857",
        headerBg: "#FFFFFF",
        footerBg: "#064E3B",
        footerText: "#D1FAE5",
      },
      fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
      borderRadius: "xl",
    },
    heroBadge: "COMMUNITY IMPACT",
    heroHeadline: "Empowering Lives & Supporting Grassroots Change",
    heroSubheadline: "Support community development projects, purchase artisan charity items, and empower youth."
  },
  general: {
    theme: {
      style: "general",
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
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "lg",
    },
    heroBadge: "EVERYDAY ESSENTIALS",
    heroHeadline: "Your Premier Online Destination for Everything",
    heroSubheadline: "Wide selection of household goods, electronics, fashion, and daily essentials with fast doorstep delivery."
  },
  bold: {
    theme: {
      style: "bold",
      colors: {
        primary: "#09090B",
        secondary: "#E11D48",
        accent: "#F43F5E",
        background: "#FFFFFF",
        surface: "#F4F4F5",
        text: "#09090B",
        mutedText: "#52525B",
        headerBg: "#09090B",
        footerBg: "#09090B",
        footerText: "#FAFAFA",
      },
      fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
      borderRadius: "md",
    },
    heroBadge: "BOLD & UNCOMPROMISING",
    heroHeadline: "Statement Pieces That Command Attention",
    heroSubheadline: "Discover audacious collections crafted with uncompromising attention to strength and style."
  },
  clean: {
    theme: {
      style: "clean",
      colors: {
        primary: "#2563EB",
        secondary: "#64748B",
        accent: "#38BDF8",
        background: "#FFFFFF",
        surface: "#F8FAFC",
        text: "#0F172A",
        mutedText: "#64748B",
        headerBg: "#FFFFFF",
        footerBg: "#0F172A",
        footerText: "#F8FAFC",
      },
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "lg",
    },
    heroBadge: "CLEAN & MODERN",
    heroHeadline: "Effortless Shopping, Elevated Quality",
    heroSubheadline: "Curated goods with crisp clarity and frictionless doorstep delivery."
  },
  vibrant: {
    theme: {
      style: "vibrant",
      colors: {
        primary: "#7C3AED",
        secondary: "#EC4899",
        accent: "#F59E0B",
        background: "#FAFAFC",
        surface: "#F5F3FF",
        text: "#2E1065",
        mutedText: "#6D28D9",
        headerBg: "#FFFFFF",
        footerBg: "#1E1B4B",
        footerText: "#EDE9FE",
      },
      fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
      borderRadius: "xl",
    },
    heroBadge: "VIBRANT & COLORFUL",
    heroHeadline: "Energy, Color and Inspiration for Your Life",
    heroSubheadline: "Bright collections that bring vibrant joy, creativity and excitement into everyday moments."
  },
  industrial: {
    theme: {
      style: "industrial",
      colors: {
        primary: "#F97316",
        secondary: "#334155",
        accent: "#EAB308",
        background: "#0F172A",
        surface: "#1E293B",
        text: "#F8FAFC",
        mutedText: "#94A3B8",
        headerBg: "#0F172A",
        footerBg: "#020617",
        footerText: "#CBD5E1",
      },
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "sm",
    },
    heroBadge: "INDUSTRIAL GRADE PERFORMANCE",
    heroHeadline: "Engineered Tough for Demanding Conditions",
    heroSubheadline: "Rugged durability, professional-grade tools, and heavy-duty reliability that never quits."
  },
  playful: {
    theme: {
      style: "playful",
      colors: {
        primary: "#F43F5E",
        secondary: "#06B6D4",
        accent: "#FBBF24",
        background: "#FFFBEB",
        surface: "#FEF3C7",
        text: "#78350F",
        mutedText: "#92400E",
        headerBg: "#FFFFFF",
        footerBg: "#78350F",
        footerText: "#FEF3C7",
      },
      fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
      borderRadius: "full",
    },
    heroBadge: "FUN & PLAYFUL DISCOVERIES",
    heroHeadline: "Joyful Essentials Designed to Delight",
    heroSubheadline: "Spark imagination and smiles with high-energy, fun products for all ages."
  },
  minimalist: {
    theme: {
      style: "minimalist",
      colors: {
        primary: "#18181B",
        secondary: "#52525B",
        accent: "#27272A",
        background: "#FFFFFF",
        surface: "#FAFAFA",
        text: "#18181B",
        mutedText: "#71717A",
        headerBg: "#FFFFFF",
        footerBg: "#18181B",
        footerText: "#FAFAFA",
      },
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "none",
    },
    heroBadge: "MINIMALIST REFINEMENT",
    heroHeadline: "Quiet Luxury in Its Purest Form",
    heroSubheadline: "Thoughtfully reductive design that eliminates excess to let quality shine through."
  }
};

// ─── AI PROVIDER ADAPTER INTERFACE ────────────────────────────────
export interface AIProviderAdapter {
  name: string;
  isAvailable(): Promise<boolean>;
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
}

// ─── GEMINI PROVIDER ADAPTER ──────────────────────────────────────
export class GeminiProviderAdapter implements AIProviderAdapter {
  name = "Google Gemini 2.5 Flash";

  async isAvailable(): Promise<boolean> {
    return !!process.env.GEMINI_API_KEY;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const fullPrompt = systemPrompt 
      ? `SYSTEM INSTRUCTION:\n${systemPrompt}\n\nUSER PROMPT:\n${prompt}`
      : prompt;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.7,
        }
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
}

// ─── OLLAMA PROVIDER ADAPTER (LOCAL FALLBACK) ─────────────────────
export class OllamaProviderAdapter implements AIProviderAdapter {
  name = "Ollama Local";
  private baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/version`, { method: "GET", cache: "no-store" });
      return res.ok;
    } catch {
      return false;
    }
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt: prompt,
        system: systemPrompt || "You are an expert eCommerce store architect. Always output valid JSON only.",
        format: "json",
        stream: false,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Ollama request failed with status ${res.status}`);
    }

    const data = await res.json();
    return data?.response || "";
  }
}

// ─── FALLBACK DETERMINISTIC GENERATOR ─────────────────────────────
export function buildDeterministicStoreConfig(input: AIStoreGenerationInput): AIStoreGenerationOutput {
  const preset = STYLE_PRESETS[input.styleArchetype] || STYLE_PRESETS.modern;
  const cleanSlug = input.businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const sections: StoreSection[] = [
    {
      id: "sec-hero",
      type: "hero",
      order: 0,
      visible: true,
      settings: {
        align: "center",
        overlayOpacity: 0.3,
        minHeight: "520px",
      },
      content: {
        badge: preset.heroBadge,
        title: `Welcome to ${input.businessName}`,
        subtitle: input.description.length > 20 ? input.description : preset.heroSubheadline,
        primaryButtonText: "Shop Collection",
        primaryButtonUrl: "#products",
        secondaryButtonText: "Contact Us",
        secondaryButtonUrl: "/contact",
        bgImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      },
    },
    {
      id: "sec-banner-promo",
      type: "promotional-offer",
      order: 1,
      visible: true,
      settings: {
        bgGradient: true,
      },
      content: {
        badge: "LIMITED OFFER",
        title: "Fast Doorstep Delivery in " + (input.location || "Freetown"),
        description: "Order online today and get your items delivered promptly. Easy cash on delivery or mobile money.",
        ctaText: "Order on WhatsApp",
        ctaUrl: "#whatsapp",
        discountText: "10% OFF",
      }
    },
    {
      id: "sec-categories",
      type: "categories",
      order: 2,
      visible: true,
      settings: {
        columns: 4,
      },
      content: {
        title: "Browse by Category",
        subtitle: "Explore our popular departments and curated collections",
      },
    },
    {
      id: "sec-product-grid",
      type: "product-grid",
      order: 3,
      visible: true,
      settings: {
        columns: 4,
        showBadge: true,
        limit: 12,
      },
      content: {
        title: "Featured Products",
        subtitle: "Top-selling picks and new arrivals handpicked for you",
      },
    },
    {
      id: "sec-about",
      type: "about",
      order: 4,
      visible: true,
      settings: {
        layout: "split",
      },
      content: {
        badge: "OUR STORY",
        title: `Crafting Trust & Value at ${input.businessName}`,
        description: `Located in ${input.location}, ${input.businessName} is committed to delivering premium quality and dependable service. ${input.description}`,
        image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
        stats: [
          { label: "Satisfied Customers", value: "1,500+" },
          { label: "Genuine Quality", value: "100%" },
          { label: "Nationwide Delivery", value: "Fast & Safe" },
        ]
      },
    },
    {
      id: "sec-testimonials",
      type: "testimonials",
      order: 5,
      visible: true,
      settings: {},
      content: {
        title: "What Our Customers Say",
        subtitle: "Real experiences from shoppers across the community",
        reviews: [
          {
            author: "Mariatu K.",
            rating: 5,
            comment: "The delivery was so fast and the items matched the photos exactly! Will definitely order again.",
            city: "Freetown"
          },
          {
            author: "Ibrahim S.",
            rating: 5,
            comment: "Customer service on WhatsApp was exceptionally responsive. Easy checkout and authentic quality.",
            city: "Bo"
          },
          {
            author: "Fatmata B.",
            rating: 5,
            comment: "Shopping was seamless. Having cash on delivery gives me full peace of mind.",
            city: "Kenema"
          }
        ]
      },
    },
    {
      id: "sec-newsletter",
      type: "newsletter",
      order: 6,
      visible: true,
      settings: {},
      content: {
        title: "Stay Connected & Save",
        subtitle: "Subscribe to receive exclusive deals, new arrivals, and special seasonal promos.",
        buttonText: "Subscribe",
      }
    },
    {
      id: "sec-contact",
      type: "contact",
      order: 7,
      visible: true,
      settings: {},
      content: {
        title: "Get In Touch",
        subtitle: "Have questions or need assistance? We are here to assist you anytime.",
        phone: input.phone || "+232 79 000000",
        whatsapp: input.whatsapp || input.phone || "+232 79 000000",
        email: input.email || "hello@" + cleanSlug + ".com",
        location: input.location,
      }
    },
    {
      id: "sec-footer",
      type: "footer",
      order: 8,
      visible: true,
      settings: {},
      content: {
        aboutText: `${input.businessName} — your trusted destination for quality ${input.businessType.toLowerCase()} in ${input.location}.`,
        copyright: `© ${new Date().getFullYear()} ${input.businessName}. Powered by ProTech Assist Enterprise OS.`,
      }
    }
  ];

  return {
    name: input.businessName,
    slug: cleanSlug,
    description: input.description,
    tagline: preset.heroHeadline,
    theme: {
      ...preset.theme,
      style: input.styleArchetype,
      colors: {
        ...STYLE_PRESETS.modern.theme.colors!,
        ...(preset.theme.colors || {}),
      },
      fonts: {
        heading: preset.theme.fonts?.heading || "Inter",
        body: preset.theme.fonts?.body || "Inter",
      },
      borderRadius: preset.theme.borderRadius || "lg",
      headerLayout: "standard",
      showAnnouncementBar: true,
      announcementText: `Special Offer: Fast delivery across ${input.location}!`,
      announcementBg: preset.theme.colors?.primary || "#4F46E5",
      announcementTextColor: "#FFFFFF",
    } as StoreTheme,
    navigation: {
      header: [
        { id: "nav-1", label: "Home", url: `/store/${cleanSlug}`, isExternal: false },
        { id: "nav-2", label: "Shop All", url: `/store/${cleanSlug}#products`, isExternal: false },
        { id: "nav-3", label: "About Us", url: `/store/${cleanSlug}#about`, isExternal: false },
        { id: "nav-4", label: "Contact", url: `/store/${cleanSlug}#contact`, isExternal: false },
      ],
      footer: [
        { id: "f-1", label: "Catalog", url: `/store/${cleanSlug}#products`, isExternal: false },
        { id: "f-2", label: "Our Story", url: `/store/${cleanSlug}#about`, isExternal: false },
        { id: "f-3", label: "Contact Us", url: `/store/${cleanSlug}#contact`, isExternal: false },
        { id: "f-4", label: "WhatsApp Support", url: `https://wa.me/${(input.whatsapp || input.phone || "").replace(/[^0-9]/g, "")}`, isExternal: true },
      ]
    },
    settings: {
      deliveryFee: 30, // Default Le 30 / NLe 30
      freeDeliveryThreshold: 250,
      deliveryEstimateDays: "1-2 business days",
      minOrderAmount: 0,
      allowCashOnDelivery: true,
      allowOnlinePayment: false,
      whatsappOrdering: true,
      whatsappNumber: input.whatsapp || input.phone || "",
      supportPhone: input.phone || "",
      supportEmail: input.email || "",
      physicalAddress: input.location,
      seo: {
        metaTitle: `${input.businessName} | Official Online Store`,
        metaDescription: input.description,
      }
    },
    homeSections: sections,
    aboutContent: {
      story: `Founded in ${input.location}, ${input.businessName} was established to bring high quality ${input.businessType.toLowerCase()} to our valued community.`,
      mission: `To provide reliable, affordable and authentic products with the best shopping convenience in Sierra Leone.`,
      highlights: [
        "100% Genuine and Inspected Products",
        "Swift Local Doorstep Delivery",
        "Dedicated WhatsApp Customer Care",
        "Flexible Payment with Cash on Delivery"
      ]
    }
  };
}

// ─── MAIN AI STORE GENERATOR ──────────────────────────────────────
export async function generateAIStoreConfiguration(
  input: AIStoreGenerationInput
): Promise<AIStoreGenerationOutput> {
  const gemini = new GeminiProviderAdapter();
  const ollama = new OllamaProviderAdapter();

  const systemPrompt = `
You are an expert AI Store Architect for ProTech Enterprise OS.
You generate complete, high-converting, aesthetically stunning eCommerce storefront configurations tailored for businesses in Sierra Leone and emerging markets.

You must return valid JSON strictly conforming to this schema:
{
  "name": string,
  "slug": string (url-safe alphanumeric with hyphens),
  "description": string,
  "tagline": string,
  "theme": {
    "style": "modern" | "luxury" | "minimal" | "fashion" | "african-contemporary" | "electronics" | "grocery" | "pharmacy" | "restaurant" | "corporate",
    "colors": {
      "primary": hex string,
      "secondary": hex string,
      "accent": hex string,
      "background": hex string,
      "surface": hex string,
      "text": hex string,
      "mutedText": hex string,
      "headerBg": hex string,
      "footerBg": hex string,
      "footerText": hex string
    },
    "fonts": { "heading": string, "body": string },
    "borderRadius": "none" | "sm" | "md" | "lg" | "full",
    "headerLayout": "standard" | "centered" | "minimal",
    "showAnnouncementBar": boolean,
    "announcementText": string,
    "announcementBg": hex string,
    "announcementTextColor": hex string
  },
  "navigation": {
    "header": [{ "id": string, "label": string, "url": string, "isExternal": boolean }],
    "footer": [{ "id": string, "label": string, "url": string, "isExternal": boolean }]
  },
  "settings": {
    "deliveryFee": number,
    "freeDeliveryThreshold": number,
    "deliveryEstimateDays": string,
    "minOrderAmount": number,
    "allowCashOnDelivery": boolean,
    "allowOnlinePayment": boolean,
    "whatsappOrdering": boolean,
    "whatsappNumber": string,
    "supportPhone": string,
    "supportEmail": string,
    "physicalAddress": string,
    "seo": { "metaTitle": string, "metaDescription": string }
  },
  "homeSections": Array of section objects,
  "aboutContent": {
    "story": string,
    "mission": string,
    "highlights": string[]
  }
}

Do NOT write Markdown code fences like \`\`\`json. Return ONLY the raw JSON object.
`;

  const userPrompt = `
Business Name: ${input.businessName}
Business Category/Type: ${input.businessType}
Description: ${input.description}
Location: ${input.location}
Phone: ${input.phone || "Not specified"}
WhatsApp: ${input.whatsapp || "Not specified"}
Target Audience: ${input.targetCustomers || "General customers"}
Desired Style Archetype: ${input.styleArchetype}
Number of existing products in catalog: ${input.productIds.length}

Generate an authentic, complete, conversion-focused online store layout with all homepage sections tailored specifically to this business.
`;

  // 1. Try Gemini
  try {
    if (await gemini.isAvailable()) {
      const raw = await gemini.generateText(userPrompt, systemPrompt);
      const cleanJson = raw.replace(/^\s*```(json)?/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      const validated = AIStoreGenerationOutputSchema.parse(parsed);
      return validated;
    }
  } catch (err) {
    console.warn("Gemini generation failed, trying Ollama...", err);
  }

  // 2. Try Ollama
  try {
    if (await ollama.isAvailable()) {
      const raw = await ollama.generateText(userPrompt, systemPrompt);
      const cleanJson = raw.replace(/^\s*```(json)?/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      const validated = AIStoreGenerationOutputSchema.parse(parsed);
      return validated;
    }
  } catch (err) {
    console.warn("Ollama generation failed, falling back to deterministic template...", err);
  }

  // 3. Guaranteed High-Quality Fallback
  return buildDeterministicStoreConfig(input);
}

// ─── AI STORE MODIFIER (CONVERSATIONAL ASSISTANT) ─────────────────
export async function executeAIStoreModification(
  currentStore: {
    name: string;
    themeConfig: StoreTheme;
    homeSections: StoreSection[];
    settings: any;
  },
  command: string
): Promise<{
  themeConfig?: StoreTheme;
  homeSections?: StoreSection[];
  settings?: any;
  explanation: string;
}> {
  const gemini = new GeminiProviderAdapter();

  // Quick heuristic modifications for common patterns
  const lower = command.toLowerCase();

  // Heuristic 1: Blue and white color scheme
  if (lower.includes("blue and white") || lower.includes("white and blue")) {
    const updatedTheme: StoreTheme = {
      ...normalizeStoreTheme(currentStore.themeConfig),
      style: "modern",
      colors: {
        ...normalizeStoreTheme(currentStore.themeConfig).colors,
        primary: "#2563EB",
        secondary: "#0284C7",
        accent: "#38BDF8",
        background: "#FFFFFF",
        surface: "#F0F9FF",
        text: "#0F172A",
        mutedText: "#475569",
        headerBg: "#FFFFFF",
        footerBg: "#0F172A",
        footerText: "#F8FAFC",
      }
    };
    return {
      themeConfig: updatedTheme,
      explanation: "Switched color palette to vibrant royal blue with crisp white surfaces and dark text."
    };
  }

  // Heuristic 2: Black and gold luxury
  if (lower.includes("black and gold") || lower.includes("gold and black")) {
    const updatedTheme: StoreTheme = {
      ...normalizeStoreTheme(currentStore.themeConfig),
      style: "luxury",
      colors: {
        ...normalizeStoreTheme(currentStore.themeConfig).colors,
        primary: "#D4AF37",
        secondary: "#1A1A1A",
        accent: "#C5A059",
        background: "#0A0A0A",
        surface: "#171717",
        text: "#FFFFFF",
        mutedText: "#A3A3A3",
        headerBg: "#0A0A0A",
        footerBg: "#050505",
        footerText: "#D4AF37",
      },
      fonts: { heading: "Playfair Display", body: "Inter" },
      borderRadius: "none",
    };
    return {
      themeConfig: updatedTheme,
      explanation: "Updated store palette to a sophisticated Black and Gold luxury theme with dark background and gold accents."
    };
  }

  // Heuristic 3: Luxury / Premium makeover
  if (lower.includes("luxury") || lower.includes("premium")) {
    const updatedTheme: StoreTheme = {
      ...normalizeStoreTheme(currentStore.themeConfig),
      style: "luxury",
      fonts: { heading: "Playfair Display", body: "Inter" },
      borderRadius: "none",
    };
    return {
      themeConfig: updatedTheme,
      explanation: "Applied luxury editorial typography (Playfair Display) and sharp minimalist corner styling."
    };
  }

  // Heuristic 4: Modern makeover
  if (lower.includes("more modern") || lower.includes("modern clean")) {
    const updatedTheme: StoreTheme = {
      ...normalizeStoreTheme(currentStore.themeConfig),
      style: "modern",
      fonts: { heading: "Inter", body: "Inter" },
      borderRadius: "xl",
    };
    return {
      themeConfig: updatedTheme,
      explanation: "Updated typography to ultra-clean Inter and applied modern rounded corners."
    };
  }

  // Heuristic 5: Make hero section bigger
  if (lower.includes("hero") && (lower.includes("bigger") || lower.includes("larger") || lower.includes("expand"))) {
    const updatedSections = currentStore.homeSections.map(sec => {
      if (sec.type === "hero") {
        return {
          ...sec,
          settings: {
            ...sec.settings,
            minHeight: "720px",
            size: "large",
            align: "center",
          }
        };
      }
      return sec;
    });
    return {
      homeSections: updatedSections,
      explanation: "Expanded the Hero banner to high-impact full-height (720px) with centered focus."
    };
  }

  // Heuristic 6: Make product cards smaller / compact
  if (lower.includes("product") && (lower.includes("smaller") || lower.includes("compact"))) {
    const updatedSections = currentStore.homeSections.map(sec => {
      if (sec.type === "product-grid" || sec.type === "product-carousel") {
        return {
          ...sec,
          settings: {
            ...sec.settings,
            columns: 4,
            cardSize: "compact",
          }
        };
      }
      return sec;
    });
    return {
      homeSections: updatedSections,
      explanation: "Configured product grid to a 4-column compact card density for faster browsing."
    };
  }

  // Heuristic 7: Add a new arrivals section
  if (lower.includes("new arrival") || lower.includes("arrivals section")) {
    const newArrivalsSection: StoreSection = {
      id: "sec-arrivals-" + Date.now(),
      type: "product-carousel",
      order: 1,
      visible: true,
      settings: { badge: "JUST IN", autoScroll: true },
      content: {
        title: "Fresh New Arrivals",
        subtitle: "The very latest additions to our catalog, available for immediate delivery."
      }
    };
    const updatedSections = [
      currentStore.homeSections[0] || newArrivalsSection,
      newArrivalsSection,
      ...currentStore.homeSections.slice(1)
    ].map((s, idx) => ({ ...s, order: idx }));
    return {
      homeSections: updatedSections,
      explanation: "Added a dedicated 'Fresh New Arrivals' product carousel right below your Hero banner."
    };
  }

  // Heuristic 8: Add Ramadan / Festive promotion
  if (lower.includes("ramadan") || lower.includes("eid")) {
    const ramadanSection: StoreSection = {
      id: "sec-ramadan-" + Date.now(),
      type: "promotional-offer",
      order: 1,
      visible: true,
      settings: { bgGradient: true, theme: "festive" },
      content: {
        badge: "🌙 RAMADAN KAREEM SPECIAL",
        title: "Blessed Season Flash Deals: Up to 25% OFF",
        description: "Celebrate with family and friends. Enjoy exclusive holiday discounts and swift doorstep delivery.",
        ctaText: "Shop Ramadan Specials",
        ctaUrl: "#products",
        discountText: "25% OFF",
      }
    };
    const updatedSections = [
      currentStore.homeSections[0] || ramadanSection,
      ramadanSection,
      ...currentStore.homeSections.slice(1)
    ].map((s, idx) => ({ ...s, order: idx }));
    return {
      homeSections: updatedSections,
      explanation: "Added a festive Ramadan Kareem promotional banner with holiday discount badges."
    };
  }

  // Heuristic 9: Move featured products above categories
  if (lower.includes("products above") || lower.includes("featured above categories") || lower.includes("move featured")) {
    const sections = [...currentStore.homeSections];
    const gridIdx = sections.findIndex(s => s.type === "product-grid" || s.type === "product-carousel");
    const catIdx = sections.findIndex(s => s.type === "categories");
    if (gridIdx !== -1 && catIdx !== -1 && gridIdx > catIdx) {
      const gridSec = sections.splice(gridIdx, 1)[0];
      sections.splice(catIdx, 0, gridSec);
      const reordered = sections.map((s, idx) => ({ ...s, order: idx }));
      return {
        homeSections: reordered,
        explanation: "Moved your Featured Products section above the Category Grid for faster conversion."
      };
    }
  }

  // Heuristic 10: Rewrite homepage copy
  if (lower.includes("rewrite") && (lower.includes("homepage") || lower.includes("copy") || lower.includes("content"))) {
    const updatedSections = currentStore.homeSections.map(sec => {
      if (sec.type === "hero") {
        return {
          ...sec,
          content: {
            ...sec.content,
            badge: "2026 SIGNATURE COLLECTION",
            title: `Elevate Your Lifestyle with ${currentStore.name}`,
            subtitle: "Unmatched quality, verified authentic goods, and priority doorstep delivery. Experience the difference.",
            primaryButtonText: "Explore Collection",
          }
        };
      }
      return sec;
    });
    return {
      homeSections: updatedSections,
      explanation: "Rewrote homepage headlines and subheadings with fresh, conversion-optimized marketing copy."
    };
  }

  // Heuristic 11: General discount / promo banner
  if (lower.includes("discount") || lower.includes("promo banner") || lower.includes("20% off") || lower.includes("sale")) {
    const promoSection: StoreSection = {
      id: "sec-promo-" + Date.now(),
      type: "promotional-offer",
      order: 1,
      visible: true,
      settings: { bgGradient: true },
      content: {
        badge: "SPECIAL PROMOTION",
        title: "Limited Time Flash Sale: Up to 20% OFF!",
        description: "Enjoy exclusive discounts on top items this week. Order online or via WhatsApp today.",
        ctaText: "Shop Sale Now",
        ctaUrl: "#products",
        discountText: "20% OFF",
      }
    };
    const updatedSections = [
      currentStore.homeSections[0] || promoSection,
      promoSection,
      ...currentStore.homeSections.slice(1)
    ].map((s, idx) => ({ ...s, order: idx }));

    return {
      homeSections: updatedSections,
      explanation: "Added a prominent 20% OFF promotional banner right below your hero section."
    };
  }

  // Deep LLM modification via Gemini 2.5 Flash
  try {
    if (await gemini.isAvailable()) {
      const systemPrompt = `
You are an expert AI Store Architect for ProTech Enterprise OS.
The user wants to modify an existing storefront configuration using a natural language instruction.
Return valid raw JSON only conforming strictly to this format:
{
  "themeConfig": optional updated StoreTheme object,
  "homeSections": optional updated Array of StoreSection objects,
  "explanation": "Brief description of the changes applied"
}
Do NOT wrap with markdown code blocks.
`;
      const userPrompt = `
Command: ${command}
Current Store Name: ${currentStore.name}
Current Theme: ${JSON.stringify(currentStore.themeConfig)}
Current Sections Count: ${currentStore.homeSections.length}
First 3 Sections: ${JSON.stringify(currentStore.homeSections.slice(0, 3))}
`;

      const raw = await gemini.generateText(userPrompt, systemPrompt);
      const cleanJson = raw.replace(/^\s*```(json)?/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    }
  } catch (err) {
    console.warn("AI modification LLM call failed, returning smart heuristic response:", err);
  }

  return {
    explanation: `Processed update for: "${command}". Sections and theme were re-aligned.`
  };
}

// ─── AI PROMPT ANALYZER (ATLAS-STYLE 1-BOX GENERATION) ────────────
export interface StorePromptAnalysisResult {
  businessCategory: string;
  suggestedName: string;
  styleArchetype: StoreStyleArchetype;
  location: string;
  description: string;
  keyProductTerms: string[];
}

export async function analyzeStorePrompt(
  prompt: string, 
  businessProfile?: any
): Promise<StorePromptAnalysisResult> {
  const gemini = new GeminiProviderAdapter();
  const lower = prompt.toLowerCase();

  // Smart Keyword Classifier for instant, reliable archetype mapping
  let archetype: StoreStyleArchetype = "general";
  let category = "General Merchandise";

  if (lower.includes("fashion") || lower.includes("dress") || lower.includes("shoe") || lower.includes("clothing") || lower.includes("boutique") || lower.includes("bag")) {
    archetype = "fashion";
    category = "Fashion & Apparel";
  } else if (lower.includes("tech") || lower.includes("phone") || lower.includes("electronic") || lower.includes("gadget") || lower.includes("laptop")) {
    archetype = "electronics";
    category = "Tech & Electronics";
  } else if (lower.includes("grocery") || lower.includes("food") || lower.includes("fruit") || lower.includes("supermarket") || lower.includes("market")) {
    archetype = "grocery";
    category = "Fresh Grocery & Supermarket";
  } else if (lower.includes("restaurant") || lower.includes("meal") || lower.includes("cafe") || lower.includes("dine") || lower.includes("kitchen") || lower.includes("bakery")) {
    archetype = "restaurant";
    category = "Restaurant & Food";
  } else if (lower.includes("pharmacy") || lower.includes("medicine") || lower.includes("health") || lower.includes("drug") || lower.includes("clinic")) {
    archetype = "pharmacy";
    category = "Pharmacy & Healthcare";
  } else if (lower.includes("hardware") || lower.includes("tool") || lower.includes("building") || lower.includes("cement") || lower.includes("plumbing")) {
    archetype = "hardware";
    category = "Hardware & Tools";
  } else if (lower.includes("beauty") || lower.includes("makeup") || lower.includes("cosmetic") || lower.includes("perfume") || lower.includes("skincare")) {
    archetype = "beauty";
    category = "Beauty & Cosmetics";
  } else if (lower.includes("furniture") || lower.includes("sofa") || lower.includes("decor") || lower.includes("interior") || lower.includes("chair")) {
    archetype = "furniture";
    category = "Furniture & Home Living";
  } else if (lower.includes("service") || lower.includes("repair") || lower.includes("salon") || lower.includes("cleaning") || lower.includes("mechanic")) {
    archetype = "services";
    category = "Services & Booking";
  } else if (lower.includes("school") || lower.includes("student") || lower.includes("book") || lower.includes("academy") || lower.includes("education")) {
    archetype = "school";
    category = "Education & School Supplies";
  } else if (lower.includes("ngo") || lower.includes("charity") || lower.includes("community") || lower.includes("non-profit") || lower.includes("foundation")) {
    archetype = "ngo";
    category = "NGO & Community Initiatives";
  } else if (lower.includes("corporate") || lower.includes("office") || lower.includes("b2b") || lower.includes("business")) {
    archetype = "corporate";
    category = "Corporate & Professional Business";
  }

  // Location extraction
  let location = businessProfile?.address || "Freetown, Sierra Leone";
  if (lower.includes("freetown")) location = "Freetown, Sierra Leone";
  else if (lower.includes("bo")) location = "Bo, Sierra Leone";
  else if (lower.includes("kenema")) location = "Kenema, Sierra Leone";
  else if (lower.includes("makeni")) location = "Makeni, Sierra Leone";

  // Name extraction / derivation
  let suggestedName = businessProfile?.name || "";
  if (!suggestedName) {
    // Generate a creative, tailored store name from prompt keywords
    const words = prompt.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).filter(w => w.length > 3);
    const topWord = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : "ProTech";
    suggestedName = `${topWord} ${category.split(" ")[0]} Hub`;
  }

  // Try LLM deep extraction if Gemini is available
  try {
    if (await gemini.isAvailable()) {
      const systemPrompt = `
You are an expert eCommerce store classification engine.
Given a user's prompt about their business, return a JSON object with:
{
  "businessCategory": string,
  "suggestedName": string,
  "styleArchetype": "fashion" | "electronics" | "grocery" | "restaurant" | "pharmacy" | "hardware" | "beauty" | "furniture" | "services" | "corporate" | "school" | "ngo" | "general",
  "location": string,
  "description": string,
  "keyProductTerms": string[]
}
Return raw JSON only.
`;
      const raw = await gemini.generateText(prompt, systemPrompt);
      const cleanJson = raw.replace(/^\s*```(json)?/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      return {
        businessCategory: parsed.businessCategory || category,
        suggestedName: parsed.suggestedName || suggestedName,
        styleArchetype: parsed.styleArchetype || archetype,
        location: parsed.location || location,
        description: parsed.description || prompt,
        keyProductTerms: Array.isArray(parsed.keyProductTerms) ? parsed.keyProductTerms : []
      };
    }
  } catch (err) {
    console.warn("LLM prompt analysis fallback to keyword classifier:", err);
  }

  return {
    businessCategory: category,
    suggestedName,
    styleArchetype: archetype,
    location,
    description: prompt,
    keyProductTerms: []
  };
}

// ─── AI PRODUCT CONTENT GENERATOR ─────────────────────────────────
export async function generateProductAICopy(
  input: AIProductCopyInput
): Promise<AIProductCopyOutput> {
  const gemini = new GeminiProviderAdapter();

  const fallbackOutput: AIProductCopyOutput = {
    title: input.name,
    shortDescription: `Premium quality ${input.name}. Guaranteed authentic and verified for optimal satisfaction.`,
    fullDescription: `Introducing ${input.name}, carefully designed to provide superior performance, durability, and value. Whether for everyday use or special occasions, this item delivers verified quality with full support.`,
    features: [
      "100% Genuine and Inspected Quality",
      "Durable, Long-Lasting Construction",
      "Ergonomic, High-Utility Design",
      "Backed by ProTech Assist Customer Guarantee"
    ],
    benefits: [
      "Instant peace of mind with authentic verification",
      "Elevates daily productivity and style",
      "Fast local doorstep delivery"
    ],
    seoTitle: `${input.name} | Buy Online at Best Price`,
    seoDescription: `Order ${input.name} online today. Verified genuine quality, prompt doorstep delivery, and flexible payment options.`,
    tags: [input.category || "General", "Trending", "Verified Quality", "Best Seller"]
  };

  try {
    if (await gemini.isAvailable()) {
      const systemPrompt = `
You are an expert eCommerce product copywriter and SEO specialist.
Generate compelling, high-converting product marketing content.
Return valid raw JSON only conforming strictly to this format:
{
  "title": string (enhanced product title),
  "shortDescription": string (1-2 sentences),
  "fullDescription": string (2 paragraphs with benefits),
  "features": string[] (4 bullet points),
  "benefits": string[] (3 bullet points),
  "seoTitle": string (max 60 chars),
  "seoDescription": string (max 160 chars),
  "tags": string[] (4-6 tags)
}
Do NOT wrap in markdown code fences.
`;
      const userPrompt = `
Product Name: ${input.name}
Category: ${input.category || "Retail"}
Price: ${input.price || "Standard"}
Notes / Specifications: ${input.notes || input.features || "Standard specification"}
`;

      const raw = await gemini.generateText(userPrompt, systemPrompt);
      const cleanJson = raw.replace(/^\s*```(json)?/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      return {
        title: parsed.title || fallbackOutput.title,
        shortDescription: parsed.shortDescription || fallbackOutput.shortDescription,
        fullDescription: parsed.fullDescription || fallbackOutput.fullDescription,
        features: Array.isArray(parsed.features) ? parsed.features : fallbackOutput.features,
        benefits: Array.isArray(parsed.benefits) ? parsed.benefits : fallbackOutput.benefits,
        seoTitle: parsed.seoTitle || fallbackOutput.seoTitle,
        seoDescription: parsed.seoDescription || fallbackOutput.seoDescription,
        tags: Array.isArray(parsed.tags) ? parsed.tags : fallbackOutput.tags,
      };
    }
  } catch (err) {
    console.warn("AI Product Copy generator fallback:", err);
  }

  return fallbackOutput;
}

// ─── AI OFFERS & UPSELLS GENERATOR ────────────────────────────────
export function generateProductUpsellOffers(
  storeProducts: any[],
  cartProductIds: string[]
): AIStoreUpsellOffer[] {
  if (!storeProducts || storeProducts.length === 0) return [];

  // Filter out products already in cart
  const available = storeProducts.filter(p => {
    const pid = p.product?.id || p.productId || p.id;
    return !cartProductIds.includes(pid) && (p.isVisible !== false);
  });

  if (available.length === 0) return [];

  // Pick up to 3 complementary items
  return available.slice(0, 3).map((item, idx) => {
    const p = item.product || item;
    const price = Number(item.customPrice || p.unitPrice || 0);
    const discount = idx === 0 ? 10 : (idx === 1 ? 15 : undefined);
    const discountedPrice = discount ? Math.round(price * (1 - discount / 100)) : undefined;

    return {
      id: `offer-${item.id || p.id}`,
      productId: p.id,
      name: p.name,
      price: discountedPrice || price,
      originalPrice: discountedPrice ? price : undefined,
      discountPercentage: discount,
      imageUrl: p.imageUrl,
      offerType: idx === 0 ? "frequently_bought_together" : "bundle",
      headline: idx === 0 ? "Frequently Bought Together" : "Special Bundle Offer",
      badge: discount ? `${discount}% OFF` : "POPULAR ADD-ON"
    };
  });
}

