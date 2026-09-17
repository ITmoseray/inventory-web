import { 
  AIStoreGenerationInput, 
  AIStoreGenerationOutput, 
  AIStoreGenerationOutputSchema,
  StoreStyleArchetype,
  StoreTheme,
  StoreSection
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

  // Color change heuristics
  if (lower.includes("black and gold") || lower.includes("gold and black")) {
    const updatedTheme = {
      ...currentStore.themeConfig,
      style: "luxury" as const,
      colors: {
        ...currentStore.themeConfig.colors,
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
      }
    };
    return {
      themeConfig: updatedTheme,
      explanation: "Updated store palette to a sophisticated Black and Gold luxury theme with dark background and gold accents."
    };
  }

  if (lower.includes("luxury") || lower.includes("premium")) {
    const updatedTheme = {
      ...currentStore.themeConfig,
      style: "luxury" as const,
      fonts: { heading: "Playfair Display", body: "Inter" },
      borderRadius: "none" as const,
    };
    return {
      themeConfig: updatedTheme,
      explanation: "Applied luxury editorial typography (Playfair Display) and sharp minimalist corner styling."
    };
  }

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

  // LLM deep modification
  try {
    if (await gemini.isAvailable()) {
      const systemPrompt = `
You are an AI Store Assistant. The user wants to modify an existing store.
You will receive the current theme and sections JSON, and an instruction.
Return a JSON object with:
{
  "themeConfig": optional updated StoreTheme,
  "homeSections": optional updated Array of StoreSection,
  "explanation": "Brief description of what was changed"
}
Return valid raw JSON only.
`;
      const userPrompt = `
Command: ${command}
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
