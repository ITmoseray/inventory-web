"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { 
  AIStoreGenerationInput, 
  StoreSection, 
  StoreTheme, 
  StoreNavigation, 
  StoreSettings,
  StorefrontCustomerCheckoutData,
  CartItem,
  AIProductCopyInput,
  StoreTemplateDTO,
  CreateStoreFromTemplateInput
} from "@/types/store-builder";
import { 
  generateAIStoreConfiguration, 
  executeAIStoreModification,
  analyzeStorePrompt,
  generateProductAICopy,
  generateProductUpsellOffers
} from "@/lib/store-builder/ai-service";
import { generateSoNumber } from "@/lib/actions/sales-order";
import { STARTER_TEMPLATES, getStarterTemplateById } from "@/lib/store-builder/starter-templates";

// ─── HELPER: SERIALIZE DECIMALS ───────────────────────────────────
function serializeStore(store: any) {
  if (!store) return null;
  return JSON.parse(JSON.stringify(store, (key, value) => {
    if (typeof value === "bigint") return value.toString();
    if (value && typeof value === "object" && "d" in value && "e" in value && "s" in value) {
      return Number(value);
    }
    return value;
  }));
}

// ─── HELPER: RESOLVE CURRENT USER STORE ───────────────────────────
export async function resolveStoreForUser(session: any) {
  if (!session?.user?.id) throw new Error("Unauthorized");
  const businessId = session.user.businessId;
  const userId = session.user.id;

  const store = await prisma.store.findFirst({
    where: {
      OR: [
        ...(businessId ? [{ businessId }] : []),
        { ownerId: userId }
      ]
    }
  });
  return store;
}

// ─── HELPER: GENERATE SAMPLE PRODUCTS FOR STANDALONE STORES ────────
function generateSampleProductsForArchetype(archetype: string, storeName: string) {
  switch (archetype) {
    case "fashion":
    case "luxury":
      return [
        { name: "Tailored Premium Blazer", price: 650, category: "Apparel", description: "Structured slim-fit silhouette crafted with luxury breathable fabric.", isFeatured: true, customBadge: "NEW" },
        { name: "Handcrafted Leather Chelsea Boots", price: 780, category: "Footwear", description: "Full-grain leather with cushioned inner sole and durable traction.", isFeatured: true, customBadge: "HOT" },
        { name: "Minimalist Italian Leather Bag", price: 540, category: "Accessories", description: "Timeless day-to-evening aesthetic with gold-tone hardware accents.", isFeatured: true, customBadge: "POPULAR" },
        { name: "Organic Silk Touch Scarf", price: 195, category: "Accessories", description: "Soft, vibrant drape designed for effortless everyday sophistication.", isFeatured: false }
      ];
    case "electronics":
      return [
        { name: "Active Noise-Cancelling Headphones", price: 850, category: "Audio", description: "Studio-grade fidelity with 40-hour wireless playtime and instant pairing.", isFeatured: true, customBadge: "TOP SELLER" },
        { name: "Ultra AMOLED Smart Watch", price: 620, category: "Wearables", description: "Comprehensive biometric tracking, GPS navigation, and waterproof chassis.", isFeatured: true, customBadge: "NEW" },
        { name: "Fast Wireless Charging Hub (3-in-1)", price: 290, category: "Accessories", description: "Simultaneous high-speed power delivery for smartphone, earbuds, and watch.", isFeatured: true },
        { name: "Rugged Braided Fast-Charge Cable", price: 85, category: "Cables", description: "Military-grade reinforcement with 65W Power Delivery support.", isFeatured: false }
      ];
    case "grocery":
    case "supermarket":
      return [
        { name: "Extra Virgin Cold-Pressed Olive Oil", price: 145, category: "Pantry", description: "First cold press olive oil with rich, authentic Mediterranean aroma.", isFeatured: true, customBadge: "FRESH" },
        { name: "Artisan Whole Grain Sourdough", price: 45, category: "Bakery", description: "Naturally fermented sourdough baked fresh every morning.", isFeatured: true },
        { name: "Organic Mountain Honey (500g)", price: 95, category: "Pantry", description: "Pure unfiltered wildflower honey harvested directly from local apiaries.", isFeatured: true, customBadge: "BEST" },
        { name: "Premium Roasted Arabica Coffee Beans", price: 160, category: "Beverages", description: "Single-origin aromatic roast notes of caramel and hazelnut.", isFeatured: false }
      ];
    case "pharmacy":
      return [
        { name: "High-Potency Vitamin C + Zinc (60s)", price: 90, category: "Vitamins", description: "Daily immune fortification formula with enhanced bio-absorption.", isFeatured: true, customBadge: "ESSENTIAL" },
        { name: "Digital Rapid Thermometer", price: 65, category: "Medical Devices", description: "Clinical accuracy with instant 10-second auditory readout.", isFeatured: true },
        { name: "Hydrating Dermatological Cream", price: 120, category: "Skincare", description: "Gentle fragrance-free ceramide barrier restoration for dry skin.", isFeatured: true },
        { name: "First Aid Safety Kit (Home & Car)", price: 180, category: "First Aid", description: "Comprehensive 50-piece medical emergency response pack.", isFeatured: false }
      ];
    default:
      return [
        { name: `${storeName} Signature Collection`, price: 350, category: "Featured", description: "Our bestselling flagship product curated for uncompromising quality.", isFeatured: true, customBadge: "FEATURED" },
        { name: "Essential Daily Edition", price: 220, category: "Popular", description: "Engineered for reliable everyday utility and customer satisfaction.", isFeatured: true, customBadge: "HOT" },
        { name: "Premium Travel & Work Accessory", price: 180, category: "Accessories", description: "Compact, durable construction made for modern mobile lifestyles.", isFeatured: true },
        { name: "Deluxe Starter Pack", price: 490, category: "Bundles", description: "Complete package offering exceptional value and customer favorites.", isFeatured: false, customBadge: "VALUE" }
      ];
  }
}

// ─── 1. GET STORE BY AUTHENTICATED USER / BUSINESS ────────────────
export async function getStoreByBusiness() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const businessId = session.user.businessId;
  const userId = session.user.id;

  const store = await prisma.store.findFirst({
    where: {
      OR: [
        ...(businessId ? [{ businessId }] : []),
        { ownerId: userId }
      ]
    },
    include: {
      pages: {
        orderBy: { createdAt: "asc" }
      },
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              description: true,
              unitPrice: true,
              stockQuantity: true,
              imageUrl: true,
              status: true,
              category: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }]
      }
    }
  });

  return serializeStore(store);
}

export const getCurrentStore = getStoreByBusiness;

// ─── 2. CREATE OR GENERATE STORE WITH AI ──────────────────────────
export async function createOrGenerateStore(input: AIStoreGenerationInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const businessId = session.user.businessId;
  const isEnterprise = input.storeType === "ENTERPRISE_CONNECTED" && !!businessId;

  // 1. Generate full AI configuration
  const aiConfig = await generateAIStoreConfiguration(input);

  // 2. Ensure slug is unique across all stores
  let finalSlug = aiConfig.slug;
  const existingWithSlug = await prisma.store.findFirst({
    where: {
      slug: finalSlug,
      ...(isEnterprise ? { businessId: { not: businessId } } : { ownerId: { not: userId } })
    }
  });
  if (existingWithSlug) {
    finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // 3. Find existing store for this user/business
  const existingStore = await prisma.store.findFirst({
    where: {
      OR: [
        ...(isEnterprise && businessId ? [{ businessId }] : []),
        { ownerId: userId }
      ]
    }
  });

  let store: any;
  if (existingStore) {
    store = await prisma.store.update({
      where: { id: existingStore.id },
      data: {
        name: aiConfig.name,
        slug: finalSlug,
        description: aiConfig.description,
        status: "PUBLISHED",
        publishedAt: new Date(),
        whatsappPhone: input.whatsapp || input.phone || "",
        contactPhone: input.phone || "",
        contactEmail: input.email || session.user.email || "",
        location: input.location || "Freetown, Sierra Leone",
        storeType: isEnterprise ? "ENTERPRISE_CONNECTED" : "STANDALONE",
        businessId: isEnterprise ? businessId : null,
        ownerId: userId,
        themeConfig: aiConfig.theme as any,
        navigation: aiConfig.navigation as any,
        settings: aiConfig.settings as any,
      }
    });
  } else {
    store = await prisma.store.create({
      data: {
        name: aiConfig.name,
        slug: finalSlug,
        description: aiConfig.description,
        status: "PUBLISHED",
        publishedAt: new Date(),
        currency: "SLE",
        whatsappPhone: input.whatsapp || input.phone || "",
        contactPhone: input.phone || "",
        contactEmail: input.email || session.user.email || "",
        location: input.location || "Freetown, Sierra Leone",
        storeType: isEnterprise ? "ENTERPRISE_CONNECTED" : "STANDALONE",
        businessId: isEnterprise ? businessId : null,
        ownerId: userId,
        themeConfig: aiConfig.theme as any,
        navigation: aiConfig.navigation as any,
        settings: aiConfig.settings as any,
      }
    });
  }

  // 4. Upsert Home Page
  const homePage = await prisma.storePage.upsert({
    where: {
      storeId_slug: {
        storeId: store.id,
        slug: "home"
      }
    },
    create: {
      storeId: store.id,
      title: "Home",
      slug: "home",
      isHome: true,
      sections: aiConfig.homeSections as any,
      published: true
    },
    update: {
      sections: aiConfig.homeSections as any,
      published: true
    }
  });

  // 5. Connect or create products
  if (isEnterprise && businessId) {
    // Enterprise flow: Link existing catalog products
    if (input.productIds && input.productIds.length > 0) {
      for (let i = 0; i < input.productIds.length; i++) {
        const pid = input.productIds[i];
        const existingSp = await prisma.storeProduct.findFirst({
          where: { storeId: store.id, productId: pid }
        });
        if (existingSp) {
          await prisma.storeProduct.update({
            where: { id: existingSp.id },
            data: { isVisible: true }
          });
        } else {
          await prisma.storeProduct.create({
            data: {
              storeId: store.id,
              productId: pid,
              isFeatured: i < 4,
              displayOrder: i,
              isVisible: true,
              customBadge: i === 0 ? "FEATURED" : (i === 1 ? "POPULAR" : null)
            }
          });
        }
      }
    } else {
      const availableProducts = await prisma.product.findMany({
        where: { businessId, deletedAt: null, status: "active" },
        take: 12,
        orderBy: { createdAt: "desc" }
      });
      for (let i = 0; i < availableProducts.length; i++) {
        const p = availableProducts[i];
        const existingSp = await prisma.storeProduct.findFirst({
          where: { storeId: store.id, productId: p.id }
        });
        if (!existingSp) {
          await prisma.storeProduct.create({
            data: {
              storeId: store.id,
              productId: p.id,
              isFeatured: i < 4,
              displayOrder: i,
              isVisible: true,
              customBadge: i === 0 ? "FEATURED" : null
            }
          });
        }
      }
    }
  } else {
    // Standalone flow: Add standalone products
    const initialStandalone = (input.standaloneProducts && input.standaloneProducts.length > 0)
      ? input.standaloneProducts
      : generateSampleProductsForArchetype(input.styleArchetype, aiConfig.name);

    for (let i = 0; i < initialStandalone.length; i++) {
      const item = initialStandalone[i];
      await prisma.storeProduct.create({
        data: {
          storeId: store.id,
          productId: null,
          name: item.name,
          price: item.price || 100,
          salePrice: item.salePrice || null,
          description: item.description || null,
          category: item.category || "General",
          sku: item.sku || null,
          images: item.images || (item.imageUrl ? [item.imageUrl] : []),
          stockQuantity: item.stockQuantity != null ? item.stockQuantity : null,
          isFeatured: i < 4,
          displayOrder: i,
          isVisible: true,
          customBadge: item.customBadge || (i === 0 ? "FEATURED" : (i === 1 ? "POPULAR" : null))
        }
      });
    }
  }

  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${store.slug}`);

  return {
    success: true,
    store: serializeStore(store),
    homePage: serializeStore(homePage)
  };
}

// ─── 3. UPDATE STORE CONFIGURATION (THEME, SETTINGS, NAV) ─────────
export async function updateStoreConfig(data: {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  currency?: string;
  whatsappPhone?: string;
  contactPhone?: string;
  contactEmail?: string;
  location?: string;
  themeConfig?: Partial<StoreTheme>;
  navigation?: Partial<StoreNavigation>;
  settings?: Partial<StoreSettings>;
  socialLinks?: any;
}) {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) throw new Error("Store not found");

  // Validate slug uniqueness if changed
  if (data.slug && data.slug !== store.slug) {
    const cleanSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const existing = await prisma.store.findFirst({
      where: { slug: cleanSlug, id: { not: store.id } }
    });
    if (existing) {
      throw new Error("This store URL slug is already taken. Please choose another.");
    }
    data.slug = cleanSlug;
  }

  const updated = await prisma.store.update({
    where: { id: store.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.bannerUrl !== undefined && { bannerUrl: data.bannerUrl }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.whatsappPhone !== undefined && { whatsappPhone: data.whatsappPhone }),
      ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
      ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.themeConfig !== undefined && { themeConfig: data.themeConfig as any }),
      ...(data.navigation !== undefined && { navigation: data.navigation as any }),
      ...(data.settings !== undefined && { settings: data.settings as any }),
      ...(data.socialLinks !== undefined && { socialLinks: data.socialLinks as any }),
    }
  });

  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${updated.slug}`);
  return { success: true, store: serializeStore(updated) };
}

// ─── 4. UPDATE PAGE SECTIONS (VISUAL BUILDER) ─────────────────────
export async function updateStorePageSections(slug: string, sections: StoreSection[]) {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) throw new Error("Store not found");

  const page = await prisma.storePage.update({
    where: {
      storeId_slug: {
        storeId: store.id,
        slug: slug || "home"
      }
    },
    data: {
      sections: sections as any
    }
  });

  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${store.slug}`);
  return { success: true, page: serializeStore(page) };
}

// ─── 5. PUBLISH / UNPUBLISH STORE ─────────────────────────────────
export async function toggleStorePublish(publish: boolean) {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) throw new Error("Store not found");

  const updated = await prisma.store.update({
    where: { id: store.id },
    data: {
      status: publish ? "PUBLISHED" : "DRAFT",
      ...(publish && !store.publishedAt && { publishedAt: new Date() })
    }
  });

  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${store.slug}`);
  return { success: true, status: updated.status };
}

// ─── 6. AI ASSISTANT MODIFICATION ─────────────────────────────────
export async function modifyStoreWithAIAction(command: string) {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) throw new Error("Store not found");

  const homePage = await prisma.storePage.findFirst({
    where: { storeId: store.id, slug: "home" }
  });
  if (!homePage) throw new Error("Home page not found");

  const currentSections = (homePage.sections as unknown as StoreSection[]) || [];

  const result = await executeAIStoreModification(
    {
      name: store.name,
      themeConfig: store.themeConfig as unknown as StoreTheme,
      homeSections: currentSections,
      settings: store.settings
    },
    command
  );

  // Apply updates if returned
  if (result.themeConfig) {
    await prisma.store.update({
      where: { id: store.id },
      data: { themeConfig: result.themeConfig as any }
    });
  }

  if (result.homeSections) {
    await prisma.storePage.update({
      where: { id: homePage.id },
      data: { sections: result.homeSections as any }
    });
  }

  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${store.slug}`);

  return {
    success: true,
    explanation: result.explanation,
    updatedTheme: result.themeConfig,
    updatedSections: result.homeSections
  };
}

// ─── 7. GET CURATED STORE PRODUCTS FOR MANAGEMENT ─────────────────
export async function getStoreCuratedProducts() {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) return [];

  // Standalone Store: return direct standalone StoreProduct items
  if (store.storeType === "STANDALONE" || !store.businessId) {
    const standaloneProducts = await prisma.storeProduct.findMany({
      where: { storeId: store.id },
      orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }]
    });

    return standaloneProducts.map(sp => ({
      id: sp.id,
      storeProductId: sp.id,
      name: sp.name || "Untitled Product",
      sku: sp.sku || "",
      unitPrice: sp.price ? Number(sp.price) : 0,
      salePrice: sp.salePrice ? Number(sp.salePrice) : null,
      stockQuantity: sp.stockQuantity != null ? Number(sp.stockQuantity) : null,
      imageUrl: sp.images && sp.images.length > 0 ? sp.images[0] : null,
      images: sp.images || [],
      category: sp.category || "General",
      status: sp.status || "active",
      description: sp.description || "",
      isListedOnline: sp.isVisible,
      isFeatured: sp.isFeatured,
      customBadge: sp.customBadge || null,
      customPrice: sp.customPrice ? Number(sp.customPrice) : null,
      displayOrder: sp.displayOrder,
      isStandalone: true
    }));
  }

  // Enterprise Store: fetch catalog and overlay store products
  const products = await prisma.product.findMany({
    where: { businessId: store.businessId, deletedAt: null },
    include: {
      category: { select: { id: true, name: true } },
      storeProducts: {
        where: { storeId: store.id }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return products.map(p => {
    const sp = p.storeProducts[0];
    return {
      id: p.id,
      storeProductId: sp?.id,
      name: p.name,
      sku: p.sku,
      unitPrice: Number(p.unitPrice),
      stockQuantity: Number(p.stockQuantity),
      imageUrl: p.imageUrl,
      category: p.category?.name || "Uncategorized",
      status: p.status,
      isListedOnline: !!sp && sp.isVisible,
      isFeatured: !!sp && sp.isFeatured,
      customBadge: sp?.customBadge || null,
      customPrice: sp?.customPrice ? Number(sp.customPrice) : null,
      displayOrder: sp?.displayOrder || 0,
      isStandalone: false
    };
  });
}

// ─── 8. TOGGLE / UPDATE STORE PRODUCT LINK (ENTERPRISE) ───────────
export async function updateStoreProductLink(productId: string, data: {
  isVisible: boolean;
  isFeatured?: boolean;
  customBadge?: string | null;
  customPrice?: number | null;
}) {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) throw new Error("Store not found");

  const existing = await prisma.storeProduct.findFirst({
    where: { storeId: store.id, productId }
  });

  if (existing) {
    await prisma.storeProduct.update({
      where: { id: existing.id },
      data: {
        isVisible: data.isVisible,
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.customBadge !== undefined && { customBadge: data.customBadge }),
        ...(data.customPrice !== undefined && { customPrice: data.customPrice })
      }
    });
  } else {
    await prisma.storeProduct.create({
      data: {
        storeId: store.id,
        productId,
        isVisible: data.isVisible,
        isFeatured: data.isFeatured ?? false,
        customBadge: data.customBadge ?? null,
        customPrice: data.customPrice ?? null
      }
    });
  }

  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${store.slug}`);
  return { success: true };
}

// ─── 8b. STANDALONE PRODUCT CRUD ACTIONS ──────────────────────────
export async function addStandaloneProductAction(data: {
  name: string;
  price: number;
  salePrice?: number;
  description?: string;
  category?: string;
  sku?: string;
  images?: string[];
  stockQuantity?: number;
  variants?: any;
  specifications?: any;
  isFeatured?: boolean;
  customBadge?: string;
}) {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) throw new Error("Store not found");

  const productCount = await prisma.storeProduct.count({ where: { storeId: store.id } });

  const product = await prisma.storeProduct.create({
    data: {
      storeId: store.id,
      productId: null,
      name: data.name.trim(),
      price: data.price,
      salePrice: data.salePrice || null,
      description: data.description || null,
      category: data.category || "General",
      sku: data.sku || null,
      images: data.images || [],
      stockQuantity: data.stockQuantity != null ? data.stockQuantity : null,
      variants: data.variants || null,
      specifications: data.specifications || null,
      isFeatured: !!data.isFeatured,
      customBadge: data.customBadge || null,
      displayOrder: productCount,
      isVisible: true
    }
  });

  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${store.slug}`);
  return { success: true, product: serializeStore(product) };
}

export async function updateStandaloneProductAction(id: string, data: Partial<{
  name: string;
  price: number;
  salePrice?: number;
  description?: string;
  category?: string;
  sku?: string;
  images?: string[];
  stockQuantity?: number;
  variants?: any;
  specifications?: any;
  isFeatured?: boolean;
  customBadge?: string;
  isVisible?: boolean;
}>) {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) throw new Error("Store not found");

  const updated = await prisma.storeProduct.update({
    where: { id, storeId: store.id },
    data: {
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.price != null ? { price: data.price } : {}),
      ...(data.salePrice !== undefined ? { salePrice: data.salePrice } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.sku !== undefined ? { sku: data.sku } : {}),
      ...(data.images !== undefined ? { images: data.images } : {}),
      ...(data.stockQuantity !== undefined ? { stockQuantity: data.stockQuantity } : {}),
      ...(data.variants !== undefined ? { variants: data.variants } : {}),
      ...(data.specifications !== undefined ? { specifications: data.specifications } : {}),
      ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
      ...(data.customBadge !== undefined ? { customBadge: data.customBadge } : {}),
      ...(data.isVisible !== undefined ? { isVisible: data.isVisible } : {})
    }
  });

  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${store.slug}`);
  return { success: true, product: serializeStore(updated) };
}

export async function deleteStandaloneProductAction(id: string) {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) throw new Error("Store not found");

  await prisma.storeProduct.delete({
    where: { id, storeId: store.id }
  });

  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${store.slug}`);
  return { success: true };
}

export async function bulkAddStandaloneProductsAction(products: any[]) {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) throw new Error("Store not found");

  const startOrder = await prisma.storeProduct.count({ where: { storeId: store.id } });

  const created = [];
  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    const p = await prisma.storeProduct.create({
      data: {
        storeId: store.id,
        productId: null,
        name: item.name.trim(),
        price: item.price || 0,
        salePrice: item.salePrice || null,
        description: item.description || null,
        category: item.category || "General",
        sku: item.sku || null,
        images: item.images || (item.imageUrl ? [item.imageUrl] : []),
        stockQuantity: item.stockQuantity != null ? item.stockQuantity : null,
        isFeatured: i < 3,
        displayOrder: startOrder + i,
        isVisible: true
      }
    });
    created.push(p);
  }

  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${store.slug}`);
  return { success: true, count: created.length };
}

// ─── 9. GET PUBLIC STOREFRONT DATA (NO AUTH REQUIRED) ─────────────
export async function getPublicStorefrontData(slug: string) {
  try {
    const session = await auth().catch(() => null);
    const userId = session?.user?.id;
    const userBusinessId = session?.user?.businessId;
    const isSuperAdmin = session?.user?.role === "SUPERADMIN" || (session?.user as any)?.originalRole === "SUPERADMIN";

    const cleanSlug = slug.toLowerCase().trim();
    const store = await prisma.store.findFirst({
      where: { 
        slug: cleanSlug,
        ...(isSuperAdmin
          ? {}
          : userId
          ? {
              OR: [
                { status: "PUBLISHED" },
                ...(userBusinessId ? [{ businessId: userBusinessId }] : []),
                { ownerId: userId }
              ]
            }
          : { status: "PUBLISHED" })
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            currency: true,
            phone: true,
            whatsappPhone: true,
            address: true,
            email: true
          }
        },
        pages: {
          where: { published: true }
        },
        products: {
          where: {
            isVisible: true,
            OR: [
              { productId: null }, // Standalone products
              {
                product: {
                  deletedAt: null,
                  status: "active"
                }
              }
            ]
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                description: true,
                unitPrice: true,
                stockQuantity: true,
                imageUrl: true,
                category: { select: { id: true, name: true } }
              }
            }
          },
          orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }]
        }
      }
    });

    if (!store) return null;

    // Normalize standalone products into unified format
    const normalizedProducts = store.products.map((sp: any) => {
      if (sp.product) return sp;
      return {
        ...sp,
        product: {
          id: sp.id,
          name: sp.name || "Product",
          sku: sp.sku || "",
          description: sp.description || "",
          unitPrice: sp.price ? Number(sp.price) : 0,
          stockQuantity: sp.stockQuantity != null ? Number(sp.stockQuantity) : 99,
          imageUrl: sp.images && sp.images.length > 0 ? sp.images[0] : null,
          category: { id: "std", name: sp.category || "General" }
        }
      };
    });

    // Record visit analytics
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.storeAnalytics.upsert({
        where: {
          storeId_date: {
            storeId: store.id,
            date: today
          }
        },
        create: {
          storeId: store.id,
          date: today,
          visitors: 1,
          pageViews: 1
        },
        update: {
          pageViews: { increment: 1 }
        }
      });
    } catch (analyticsErr) {
      // Non-blocking
    }

    return serializeStore({
      ...store,
      products: normalizedProducts
    });
  } catch (error) {
    console.error("GET PUBLIC STOREFRONT ERROR:", error);
    return null;
  }
}

// ─── 9b. GET STORE DRAFT INFO (FOR COMING SOON SCREEN) ─────────────
export async function getStoreDraftInfo(slug: string) {
  try {
    const cleanSlug = slug.toLowerCase().trim();
    const store = await prisma.store.findFirst({
      where: { slug: cleanSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        logoUrl: true,
        description: true,
        business: {
          select: {
            name: true,
            logoUrl: true,
            phone: true,
            email: true
          }
        }
      }
    });
    return serializeStore(store);
  } catch {
    return null;
  }
}

// ─── 10. SUBMIT STOREFRONT CHECKOUT ORDER (PUBLIC) ────────────────
export async function submitStorefrontOrder(
  slug: string, 
  checkoutData: StorefrontCustomerCheckoutData,
  items: CartItem[]
) {
  try {
    if (!items || items.length === 0) {
      throw new Error("Cannot checkout with an empty cart");
    }

    const store = await prisma.store.findFirst({
      where: { slug: slug.toLowerCase().trim(), status: "PUBLISHED" },
      include: { business: true }
    });

    if (!store) {
      throw new Error("Store is currently unavailable");
    }

    const storeSettings = (store.settings as unknown as StoreSettings) || {};
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = checkoutData.deliveryMethod === "DELIVERY" ? (storeSettings.deliveryFee || 0) : 0;
    const totalAmount = subtotal + deliveryFee;

    // ─── CASE A: STANDALONE STORE ORDER ─────────────────────────────
    if (store.storeType === "STANDALONE" || !store.businessId) {
      const orderCount = await prisma.storeOrder.count({ where: { storeId: store.id } });
      const orderNumber = `ORD-${String(orderCount + 1001).padStart(5, "0")}`;

      const storeOrder = await prisma.storeOrder.create({
        data: {
          orderNumber,
          storeId: store.id,
          customerName: checkoutData.customerName,
          customerPhone: checkoutData.customerPhone,
          customerEmail: checkoutData.customerEmail || null,
          deliveryAddress: checkoutData.deliveryAddress,
          deliveryMethod: checkoutData.deliveryMethod,
          paymentMethod: checkoutData.paymentMethod === "CASH_ON_DELIVERY" ? "CASH_ON_DELIVERY" : "ONLINE",
          notes: checkoutData.orderNotes || null,
          subtotal,
          deliveryFee,
          totalAmount,
          status: "PENDING",
          items: {
            create: items.map(item => ({
              storeProductId: item.productId || null,
              productName: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              total: item.price * item.quantity,
              imageUrl: item.imageUrl || null
            }))
          }
        }
      });

      // Record analytics
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await prisma.storeAnalytics.upsert({
          where: { storeId_date: { storeId: store.id, date: today } },
          create: { storeId: store.id, date: today, ordersCount: 1, revenue: totalAmount },
          update: { ordersCount: { increment: 1 }, revenue: { increment: totalAmount } }
        });
      } catch {}

      // Format WhatsApp message
      const formattedCurrency = store.currency || "SLE";
      let waMessage = `🛍️ *NEW ONLINE ORDER #${orderNumber}*\n`;
      waMessage += `*Store:* ${store.name}\n\n`;
      waMessage += `*Customer:* ${checkoutData.customerName}\n`;
      waMessage += `*Phone:* ${checkoutData.customerPhone}\n`;
      waMessage += `*Delivery Address:* ${checkoutData.deliveryAddress}\n`;
      waMessage += `*Method:* ${checkoutData.deliveryMethod}\n\n`;
      waMessage += `*Items:*\n`;
      items.forEach(i => {
        waMessage += `• ${i.quantity}x ${i.name} — ${formattedCurrency} ${(i.price * i.quantity).toLocaleString()}\n`;
      });
      waMessage += `\n*Subtotal:* ${formattedCurrency} ${subtotal.toLocaleString()}\n`;
      if (deliveryFee > 0) {
        waMessage += `*Delivery Fee:* ${formattedCurrency} ${deliveryFee.toLocaleString()}\n`;
      }
      waMessage += `*Total Payable:* ${formattedCurrency} ${totalAmount.toLocaleString()}\n`;
      waMessage += `*Payment:* ${checkoutData.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Online/Transfer"}\n`;
      if (checkoutData.orderNotes) {
        waMessage += `*Note:* ${checkoutData.orderNotes}\n`;
      }

      const waPhone = (store.whatsappPhone || store.contactPhone || "").replace(/[^0-9]/g, "");
      const whatsappUrl = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}` : null;

      revalidatePath(`/store/${store.slug}`);
      revalidatePath("/dashboard/store-builder");

      return {
        success: true,
        soNumber: orderNumber,
        orderId: storeOrder.id,
        totalAmount,
        whatsappUrl
      };
    }

    // ─── CASE B: ENTERPRISE CONNECTED STORE ORDER ───────────────────
    const businessId = store.businessId;

    let customer = await prisma.customer.findFirst({
      where: {
        businessId,
        deletedAt: null,
        OR: [
          { phone: checkoutData.customerPhone },
          ...(checkoutData.customerEmail ? [{ email: checkoutData.customerEmail }] : [])
        ]
      }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          businessId,
          name: checkoutData.customerName,
          phone: checkoutData.customerPhone,
          email: checkoutData.customerEmail || null,
          address: checkoutData.deliveryAddress
        }
      });
    }

    const adminUser = await prisma.user.findFirst({
      where: { businessId, status: "active" }
    });
    const fallbackUserId = adminUser?.id || store.businessId;

    const soNumber = await generateSoNumber(businessId);

    const order = await prisma.salesOrder.create({
      data: {
        soNumber,
        businessId,
        userId: fallbackUserId,
        customerId: customer.id,
        customerName: checkoutData.customerName,
        customerPhone: checkoutData.customerPhone,
        customerEmail: checkoutData.customerEmail || null,
        deliveryAddress: checkoutData.deliveryAddress,
        deliveryMethod: checkoutData.deliveryMethod,
        paymentTerms: checkoutData.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Online/Mobile",
        notes: `[ONLINE STORE ORDER from /store/${store.slug}] ${checkoutData.orderNotes || ""}`.trim(),
        subtotal,
        tax: 0,
        discount: 0,
        totalAmount,
        status: "PENDING",
        storeId: store.id,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.price * item.quantity,
            businessId
          }))
        },
        statusHistory: {
          create: {
            status: "PENDING",
            note: `Order placed online via ${store.name} storefront.`,
            userId: fallbackUserId
          }
        }
      },
      include: {
        items: true
      }
    });

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.storeAnalytics.upsert({
        where: {
          storeId_date: {
            storeId: store.id,
            date: today
          }
        },
        create: {
          storeId: store.id,
          date: today,
          ordersCount: 1,
          revenue: totalAmount
        },
        update: {
          ordersCount: { increment: 1 },
          revenue: { increment: totalAmount }
        }
      });
    } catch {}

    const formattedCurrency = store.currency || "SLE";
    let waMessage = `🛍️ *NEW ONLINE ORDER #${soNumber}*\n`;
    waMessage += `*Store:* ${store.name}\n\n`;
    waMessage += `*Customer:* ${checkoutData.customerName}\n`;
    waMessage += `*Phone:* ${checkoutData.customerPhone}\n`;
    waMessage += `*Delivery Address:* ${checkoutData.deliveryAddress}\n`;
    waMessage += `*Method:* ${checkoutData.deliveryMethod}\n\n`;
    waMessage += `*Items:*\n`;
    items.forEach(i => {
      waMessage += `• ${i.quantity}x ${i.name} — ${formattedCurrency} ${(i.price * i.quantity).toLocaleString()}\n`;
    });
    waMessage += `\n*Subtotal:* ${formattedCurrency} ${subtotal.toLocaleString()}\n`;
    if (deliveryFee > 0) {
      waMessage += `*Delivery Fee:* ${formattedCurrency} ${deliveryFee.toLocaleString()}\n`;
    }
    waMessage += `*Total Payable:* ${formattedCurrency} ${totalAmount.toLocaleString()}\n`;
    waMessage += `*Payment:* ${checkoutData.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Online/Transfer"}\n`;
    if (checkoutData.orderNotes) {
      waMessage += `*Note:* ${checkoutData.orderNotes}\n`;
    }

    const waPhone = (store.whatsappPhone || store.business?.whatsappPhone || store.business?.phone || "").replace(/[^0-9]/g, "");
    const whatsappUrl = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}` : null;

    revalidatePath(`/store/${store.slug}`);
    revalidatePath("/dashboard/sales/orders");
    revalidatePath("/dashboard/store-builder");

    return {
      success: true,
      soNumber: order.soNumber,
      orderId: order.id,
      totalAmount,
      whatsappUrl
    };
  } catch (error: any) {
    console.error("SUBMIT STOREFRONT ORDER ERROR:", error);
    return { success: false, error: error.message || "Failed to place order" };
  }
}

// ─── 11. GET STORE ORDERS FOR DASHBOARD ───────────────────────────
export async function getStoreOrders() {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) return [];

  // If Standalone: query StoreOrder
  if (store.storeType === "STANDALONE" || !store.businessId) {
    const standaloneOrders = await prisma.storeOrder.findMany({
      where: { storeId: store.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return serializeStore(standaloneOrders.map(o => ({
      id: o.id,
      soNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      deliveryAddress: o.deliveryAddress,
      deliveryMethod: o.deliveryMethod,
      paymentTerms: o.paymentMethod,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items.map(i => ({
        id: i.id,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.total
      }))
    })));
  }

  // Enterprise Connected: query SalesOrder
  const orders = await prisma.salesOrder.findMany({
    where: {
      businessId: store.businessId,
      storeId: { not: null },
      deletedAt: null
    },
    include: {
      items: true
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return serializeStore(orders);
}

// ─── 12. GET STORE ANALYTICS METRICS ──────────────────────────────
export async function getStoreAnalyticsOverview() {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) return null;

  const fullStore = await prisma.store.findUnique({
    where: { id: store.id },
    include: {
      analytics: {
        orderBy: { date: "desc" },
        take: 30
      }
    }
  });

  if (!fullStore) return null;

  const analytics = fullStore.analytics || [];
  const totalVisitors = analytics.reduce((acc, a) => acc + a.visitors, 0);
  const totalPageViews = analytics.reduce((acc, a) => acc + a.pageViews, 0);
  const totalOrders = analytics.reduce((acc, a) => acc + a.ordersCount, 0);
  const totalRevenue = analytics.reduce((acc, a) => acc + Number(a.revenue), 0);

  return {
    storeStatus: fullStore.status,
    storeSlug: fullStore.slug,
    totalVisitors,
    totalPageViews,
    totalOrders,
    totalRevenue,
    recentDaily: serializeStore(analytics.slice(0, 7).reverse())
  };
}

// ─── 13. SUPER ADMIN ECOSYSTEM STORES ─────────────────────────────
export async function getSuperAdminStores() {
  const session = await auth();
  const isSuper = session?.user?.role === "SUPERADMIN" || (session?.user as any)?.originalRole === "SUPERADMIN";
  if (!isSuper) throw new Error("Unauthorized: Super Admin access required");

  const stores = await prisma.store.findMany({
    include: {
      business: {
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          email: true,
          type: true
        }
      },
      _count: {
        select: {
          products: true,
          salesOrders: true,
          standaloneOrders: true
        }
      },
      analytics: {
        orderBy: { date: "desc" },
        take: 7
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return serializeStore(stores);
}

// ─── 14. SUPER ADMIN TOGGLE STORE STATUS ───────────────────────────
export async function superAdminToggleStoreStatus(storeId: string, status: "DRAFT" | "PUBLISHED" | "SUSPENDED") {
  const session = await auth();
  const isSuper = session?.user?.role === "SUPERADMIN" || (session?.user as any)?.originalRole === "SUPERADMIN";
  if (!isSuper) throw new Error("Unauthorized: Super Admin access required");

  const updated = await prisma.store.update({
    where: { id: storeId },
    data: { status }
  });

  revalidatePath("/super-admin/stores");
  revalidatePath(`/store/${updated.slug}`);
  return { success: true, status: updated.status };
}

// ─── 15. DELETE STORE (MERCHANT RESET) ─────────────────────────────
export async function deleteStore() {
  const session = await auth();
  const store = await resolveStoreForUser(session);
  if (!store) throw new Error("Store not found");

  // 1. Delete associated store records
  await prisma.storeProduct.deleteMany({
    where: { storeId: store.id }
  });

  await prisma.storePage.deleteMany({
    where: { storeId: store.id }
  });

  await prisma.storeAnalytics.deleteMany({
    where: { storeId: store.id }
  });

  await prisma.storeOrder.deleteMany({
    where: { storeId: store.id }
  });

  // Dissociate any SalesOrders linked to this store so customer records are preserved
  await prisma.salesOrder.updateMany({
    where: { storeId: store.id },
    data: { storeId: null }
  });

  // 2. Delete the Store itself
  await prisma.store.delete({
    where: { id: store.id }
  });

  revalidatePath("/dashboard/store-builder");
  revalidatePath("/super-admin/stores");
  revalidatePath(`/store/${store.slug}`);

  return { success: true };
}

// ─── 16. SUPER ADMIN DELETE STORE ─────────────────────────────────
export async function superAdminDeleteStore(storeId: string) {
  const session = await auth();
  const isSuper = session?.user?.role === "SUPERADMIN" || (session?.user as any)?.originalRole === "SUPERADMIN";
  if (!isSuper) throw new Error("Unauthorized: Super Admin access required");

  const store = await prisma.store.findUnique({
    where: { id: storeId }
  });
  if (!store) throw new Error("Store not found");

  await prisma.storeProduct.deleteMany({ where: { storeId: store.id } });
  await prisma.storePage.deleteMany({ where: { storeId: store.id } });
  await prisma.storeAnalytics.deleteMany({ where: { storeId: store.id } });
  await prisma.storeOrder.deleteMany({ where: { storeId: store.id } });
  await prisma.salesOrder.updateMany({
    where: { storeId: store.id },
    data: { storeId: null }
  });
  await prisma.store.delete({ where: { id: store.id } });

  revalidatePath("/super-admin/stores");
  revalidatePath(`/store/${store.slug}`);

  return { success: true };
}

// ─── 17. ANALYZE STORE PROMPT (REAL-TIME STAGE 1) ─────────────────
export async function analyzeStorePromptAction(prompt: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let business: any = null;
  let availableProductCount = 0;

  if (session.user.businessId) {
    business = await prisma.business.findUnique({
      where: { id: session.user.businessId }
    });
    availableProductCount = await prisma.product.count({
      where: { businessId: session.user.businessId, deletedAt: null, status: "active" }
    });
  }

  const analysis = await analyzeStorePrompt(prompt, business);

  return {
    success: true,
    analysis,
    availableProductCount,
    businessName: business?.name || analysis.suggestedName,
    isStandalone: !session.user.businessId
  };
}

// ─── 18. ATLAS-STYLE 1-CLICK AI STORE CREATION ─────────────────────
export async function createStoreFromPromptAIAction(prompt: string, forcedStoreType?: "ENTERPRISE_CONNECTED" | "STANDALONE") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const businessId = session.user.businessId;
  const isEnterprise = !!businessId && forcedStoreType !== "STANDALONE";

  let business: any = null;
  let catalogProducts: any[] = [];

  if (isEnterprise && businessId) {
    business = await prisma.business.findUnique({
      where: { id: businessId }
    });
    catalogProducts = await prisma.product.findMany({
      where: { businessId, deletedAt: null, status: "active" },
      take: 12,
      orderBy: { createdAt: "desc" }
    });
  }

  // 1. Analyze prompt
  const analysis = await analyzeStorePrompt(prompt, business);

  // 2. Prepare AI generation input
  const input: AIStoreGenerationInput = {
    businessName: business?.name || analysis.suggestedName,
    businessType: analysis.businessCategory,
    description: analysis.description,
    location: analysis.location,
    phone: business?.phone || "",
    whatsapp: (business as any)?.whatsappPhone || business?.phone || "",
    email: business?.email || session.user.email || "",
    targetCustomers: `Shoppers seeking verified ${analysis.businessCategory.toLowerCase()}`,
    styleArchetype: analysis.styleArchetype,
    productIds: catalogProducts.map(p => p.id),
    storeType: isEnterprise ? "ENTERPRISE_CONNECTED" : "STANDALONE",
    standaloneProducts: isEnterprise ? [] : generateSampleProductsForArchetype(analysis.styleArchetype, analysis.suggestedName)
  };

  // 3. Create and synthesize store
  const result = await createOrGenerateStore(input);

  return {
    ...result,
    analysis,
    connectedProductCount: isEnterprise ? catalogProducts.length : (input.standaloneProducts?.length || 0),
    storeType: isEnterprise ? "ENTERPRISE_CONNECTED" : "STANDALONE"
  };
}

// ─── 19. GENERATE AI PRODUCT COPY (TITLE, BULLETS, SEO) ───────────
export async function generateProductAICopyAction(input: AIProductCopyInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const copy = await generateProductAICopy(input);
  return { success: true, copy };
}

// ─── 20. GET STORE UPSELL RECOMMENDATIONS FOR CART ─────────────────
export async function getStoreUpsellOffersAction(storeSlug: string, cartProductIds: string[]) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      include: {
        products: {
          where: { isVisible: true },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unitPrice: true,
                imageUrl: true,
                stockQuantity: true,
                category: { select: { name: true } }
              }
            }
          },
          take: 10
        }
      }
    });

    if (!store) return { success: false, offers: [] };

    // Map products ensuring standalone products have product object
    const normalizedProducts = store.products.map((sp: any) => {
      if (sp.product) return sp;
      return {
        ...sp,
        product: {
          id: sp.id,
          name: sp.name || "Product",
          unitPrice: sp.price ? Number(sp.price) : 0,
          imageUrl: sp.images && sp.images.length > 0 ? sp.images[0] : null,
          stockQuantity: sp.stockQuantity != null ? Number(sp.stockQuantity) : 99,
          category: { name: sp.category || "General" }
        }
      };
    });

    const offers = generateProductUpsellOffers(normalizedProducts, cartProductIds);
    return { success: true, offers };
  } catch (err: any) {
    console.error("GET STORE UPSELLS ERROR:", err);
    return { success: false, offers: [] };
  }
}

// ─── 21. UPGRADE STANDALONE STORE TO ENTERPRISE OS ────────────────
export async function upgradeStoreToEnterpriseAction(data: {
  businessName: string;
  businessType: string;
  address?: string;
  phone?: string;
  currency?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  if (user.businessId) {
    throw new Error("This account is already connected to an Enterprise OS organization.");
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: userId, storeType: "STANDALONE" },
    include: { products: true }
  });

  if (!store) {
    throw new Error("No standalone store found to upgrade.");
  }

  // 1. Create the new Enterprise OS Business
  const baseSlug = (data.businessName || store.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-");
  const businessSlug = `${baseSlug}-${Math.random().toString(36).substring(7)}`;

  const allowedTypes = ["SHOP", "RESTAURANT", "BAR", "PHARMACY", "SUPERMARKET", "CLINIC", "HOSPITAL", "OFFICE", "SCHOOL"];
  const dbBusinessType = allowedTypes.includes(data.businessType) ? (data.businessType as any) : "SHOP";

  const business = await prisma.business.create({
    data: {
      name: data.businessName || store.name,
      slug: businessSlug,
      type: dbBusinessType,
      phone: data.phone || store.contactPhone || user.phone || "",
      address: data.address || store.location || "Freetown, Sierra Leone",
      email: store.contactEmail || user.email,
      currency: data.currency || store.currency || "SLE",
      status: "ACTIVE",
      plan: "FREE",
      enabledModules: ["POS", "INVENTORY", "CRM", "STORE_BUILDER"],
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  // 2. Create Admin role for the new business
  const allPermissions = await prisma.permission.findMany();
  const adminRole = await prisma.role.create({
    data: {
      name: "ADMIN",
      businessId: business.id,
      permissions: {
        connect: allPermissions.map(p => ({ id: p.id }))
      }
    }
  });

  // 3. Connect User to the Business and Admin Role
  await prisma.user.update({
    where: { id: userId },
    data: {
      businessId: business.id,
      roleId: adminRole.id
    }
  });

  // 4. Migrate Standalone Products to Enterprise OS Products non-destructively
  for (const sp of store.products) {
    if (!sp.productId && sp.name) {
      const newProduct = await prisma.product.create({
        data: {
          businessId: business.id,
          name: sp.name,
          sku: sp.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
          description: sp.description || null,
          unitPrice: sp.price || 0,
          stockQuantity: sp.stockQuantity != null ? sp.stockQuantity : 10,
          imageUrl: sp.images && sp.images.length > 0 ? sp.images[0] : null,
          status: sp.status || "active"
        }
      });

      await prisma.storeProduct.update({
        where: { id: sp.id },
        data: { productId: newProduct.id }
      });
    }
  }

  // 5. Upgrade Store record to ENTERPRISE_CONNECTED
  await prisma.store.update({
    where: { id: store.id },
    data: {
      businessId: business.id,
      storeType: "ENTERPRISE_CONNECTED"
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${store.slug}`);

  return {
    success: true,
    businessId: business.id,
    businessName: business.name
  };
}

// =================================================================
// TEMPLATE GALLERY & SELECTION SYSTEM SERVER ACTIONS
// =================================================================

export async function getStoreTemplatesAction(filter?: {
  category?: string;
  style?: string;
  search?: string;
}) {
  try {
    let dbTemplates: any[] = [];
    try {
      dbTemplates = await prisma.storeTemplate.findMany({
        where: {
          status: "PUBLISHED",
          ...(filter?.category && filter.category !== "All" ? { category: filter.category } : {}),
          ...(filter?.style && filter.style !== "all" ? { style: filter.style } : {}),
          ...(filter?.search ? {
            OR: [
              { name: { contains: filter.search, mode: "insensitive" } },
              { description: { contains: filter.search, mode: "insensitive" } },
              { category: { contains: filter.search, mode: "insensitive" } },
              { tags: { has: filter.search.toLowerCase() } }
            ]
          } : {})
        },
        orderBy: [
          { isFeatured: "desc" },
          { usageCount: "desc" },
          { viewsCount: "desc" }
        ]
      });
    } catch (dbErr) {
      console.warn("DB query for store templates failed or table empty, using starter templates:", dbErr);
    }

    if (!dbTemplates || dbTemplates.length === 0) {
      let templates = [...STARTER_TEMPLATES];
      if (filter?.category && filter.category !== "All") {
        templates = templates.filter(t => t.category.toLowerCase() === filter.category!.toLowerCase());
      }
      if (filter?.style && filter.style !== "all") {
        templates = templates.filter(t => t.style.toLowerCase() === filter.style!.toLowerCase());
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        templates = templates.filter(t => 
          t.name.toLowerCase().includes(q) || 
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags.some(tag => tag.toLowerCase().includes(q))
        );
      }
      return { success: true, templates };
    }

    return { success: true, templates: serializeStore(dbTemplates) as StoreTemplateDTO[] };
  } catch (error: any) {
    console.error("getStoreTemplatesAction error:", error);
    return { success: false, error: error.message || "Failed to load templates", templates: STARTER_TEMPLATES };
  }
}

export async function getStoreTemplateByIdAction(templateId: string) {
  try {
    let template: any = null;
    try {
      template = await prisma.storeTemplate.findFirst({
        where: {
          OR: [
            { templateId },
            { slug: templateId },
            { id: templateId }
          ]
        }
      });
      if (template) {
        prisma.storeTemplate.update({
          where: { id: template.id },
          data: { viewsCount: { increment: 1 } }
        }).catch(() => {});
      }
    } catch (dbErr) {
      console.warn("Template DB lookup error:", dbErr);
    }

    if (!template) {
      template = getStarterTemplateById(templateId);
    }

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    return { success: true, template: serializeStore(template) as StoreTemplateDTO };
  } catch (error: any) {
    console.error("getStoreTemplateByIdAction error:", error);
    return { success: false, error: error.message || "Failed to get template" };
  }
}

export async function createStoreFromTemplateAction(input: CreateStoreFromTemplateInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;
    const businessId = session.user.businessId;
    const isEnterprise = input.storeType === "ENTERPRISE_CONNECTED" && !!businessId;

    // 1. Resolve template
    let template: any = await prisma.storeTemplate.findFirst({
      where: {
        OR: [
          { templateId: input.templateId },
          { slug: input.templateId }
        ]
      }
    });

    if (!template) {
      const fallback = getStarterTemplateById(input.templateId);
      if (!fallback) throw new Error(`Template not found: ${input.templateId}`);
      template = fallback;
    }

    // 2. Compute Theme Configuration
    const baseTheme = (template.themeConfig as StoreTheme) || {};
    const finalTheme: StoreTheme = {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        ...(input.customColors?.primary ? { primary: input.customColors.primary } : {}),
        ...(input.customColors?.secondary ? { secondary: input.customColors.secondary } : {}),
        ...(input.customColors?.accent ? { accent: input.customColors.accent } : {}),
      }
    };

    // 3. Generate clean slug
    let cleanSlug = input.businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!cleanSlug) cleanSlug = `store-${Math.floor(1000 + Math.random() * 9000)}`;

    const existingWithSlug = await prisma.store.findFirst({
      where: {
        slug: cleanSlug,
        ...(isEnterprise ? { businessId: { not: businessId } } : { ownerId: { not: userId } })
      }
    });
    if (existingWithSlug) {
      cleanSlug = `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 4. Adapt Template Sections to the Business Name & Contact
    const rawSections = (template.sections as StoreSection[]) || [];
    const adaptedSections = rawSections.map((sec) => {
      const content = { ...(sec.content || {}) };
      if (sec.type === "hero") {
        if (!content.headline || content.headline.includes("Redefine") || content.headline.includes("Gourmet")) {
          content.headline = `Welcome to ${input.businessName}`;
        }
        if (input.description) {
          content.subheadline = input.description;
        }
      } else if (sec.type === "contact") {
        content.title = `Contact ${input.businessName}`;
        content.phone = input.phone || content.phone || "";
        content.whatsapp = input.whatsapp || input.phone || content.whatsapp || "";
        content.email = input.email || session.user.email || content.email || "";
      } else if (sec.type === "footer") {
        content.aboutText = `${input.businessName} — Your premier destination for quality ${template.category.toLowerCase()}.`;
        content.copyright = `© ${new Date().getFullYear()} ${input.businessName}. Powered by ProTech Assist Enterprise OS.`;
      }
      return {
        ...sec,
        content
      };
    });

    // 5. Find existing store for this user/business to update, or create new
    const existingStore = await prisma.store.findFirst({
      where: {
        OR: [
          ...(isEnterprise && businessId ? [{ businessId }] : []),
          { ownerId: userId }
        ]
      }
    });

    let store: any;
    if (existingStore) {
      store = await prisma.store.update({
        where: { id: existingStore.id },
        data: {
          name: input.businessName,
          slug: cleanSlug,
          description: input.description || template.description,
          templateId: template.templateId,
          status: "PUBLISHED",
          publishedAt: new Date(),
          currency: input.currency || "SLE",
          whatsappPhone: input.whatsapp || input.phone || "",
          contactPhone: input.phone || "",
          contactEmail: input.email || session.user.email || "",
          storeType: isEnterprise ? "ENTERPRISE_CONNECTED" : "STANDALONE",
          businessId: isEnterprise ? businessId : null,
          ownerId: userId,
          themeConfig: finalTheme as any,
          navigation: (template.navigation || {
            header: [
              { id: "nav-1", label: "Home", url: `/store/${cleanSlug}`, isExternal: false },
              { id: "nav-2", label: "Shop All", url: `/store/${cleanSlug}#products`, isExternal: false },
              { id: "nav-3", label: "Contact", url: `/store/${cleanSlug}#contact`, isExternal: false },
            ],
            footer: [
              { id: "f-1", label: "Catalog", url: `/store/${cleanSlug}#products`, isExternal: false },
              { id: "f-2", label: "Contact Us", url: `/store/${cleanSlug}#contact`, isExternal: false },
            ]
          }) as any,
          settings: {
            deliveryFee: 30,
            freeDeliveryThreshold: 300,
            deliveryEstimateDays: "1-2 business days",
            minOrderAmount: 0,
            allowCashOnDelivery: true,
            allowOnlinePayment: false,
            whatsappOrdering: true,
            whatsappNumber: input.whatsapp || input.phone || "",
            supportPhone: input.phone || "",
            supportEmail: input.email || "",
            seo: {
              metaTitle: `${input.businessName} | Official Store`,
              metaDescription: input.description || template.description
            }
          } as any,
        }
      });
    } else {
      store = await prisma.store.create({
        data: {
          name: input.businessName,
          slug: cleanSlug,
          description: input.description || template.description,
          templateId: template.templateId,
          status: "PUBLISHED",
          publishedAt: new Date(),
          currency: input.currency || "SLE",
          whatsappPhone: input.whatsapp || input.phone || "",
          contactPhone: input.phone || "",
          contactEmail: input.email || session.user.email || "",
          storeType: isEnterprise ? "ENTERPRISE_CONNECTED" : "STANDALONE",
          businessId: isEnterprise ? businessId : null,
          ownerId: userId,
          themeConfig: finalTheme as any,
          navigation: (template.navigation || {
            header: [
              { id: "nav-1", label: "Home", url: `/store/${cleanSlug}`, isExternal: false },
              { id: "nav-2", label: "Shop All", url: `/store/${cleanSlug}#products`, isExternal: false },
              { id: "nav-3", label: "Contact", url: `/store/${cleanSlug}#contact`, isExternal: false },
            ],
            footer: [
              { id: "f-1", label: "Catalog", url: `/store/${cleanSlug}#products`, isExternal: false },
              { id: "f-2", label: "Contact Us", url: `/store/${cleanSlug}#contact`, isExternal: false },
            ]
          }) as any,
          settings: {
            deliveryFee: 30,
            freeDeliveryThreshold: 300,
            deliveryEstimateDays: "1-2 business days",
            minOrderAmount: 0,
            allowCashOnDelivery: true,
            allowOnlinePayment: false,
            whatsappOrdering: true,
            whatsappNumber: input.whatsapp || input.phone || "",
            supportPhone: input.phone || "",
            supportEmail: input.email || "",
            seo: {
              metaTitle: `${input.businessName} | Official Store`,
              metaDescription: input.description || template.description
            }
          } as any,
        }
      });
    }

    // 6. Upsert Home Page with Adapted Sections
    await prisma.storePage.upsert({
      where: {
        storeId_slug: {
          storeId: store.id,
          slug: "home"
        }
      },
      create: {
        storeId: store.id,
        title: "Home",
        slug: "home",
        isHome: true,
        sections: adaptedSections as any,
        published: true
      },
      update: {
        sections: adaptedSections as any,
        published: true
      }
    });

    // 7. If STANDALONE and store has no products yet, populate sample products
    const productCount = await prisma.storeProduct.count({ where: { storeId: store.id } });
    if (productCount === 0 && (!isEnterprise || !businessId)) {
      const sampleItems = generateSampleProductsForArchetype(template.style || "general", input.businessName);
      for (const item of sampleItems) {
        await prisma.storeProduct.create({
          data: {
            storeId: store.id,
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description,
            isFeatured: item.isFeatured ?? true,
            customBadge: item.customBadge,
            stockQuantity: 20,
            status: "active",
            isVisible: true
          }
        });
      }
    }

    // 8. Increment template usageCount in DB
    try {
      await prisma.storeTemplate.updateMany({
        where: { templateId: template.templateId },
        data: { usageCount: { increment: 1 } }
      });
    } catch (e) {}

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/store-builder");
    revalidatePath(`/store/${cleanSlug}`);

    return {
      success: true,
      storeId: store.id,
      storeSlug: store.slug
    };
  } catch (error: any) {
    console.error("createStoreFromTemplateAction error:", error);
    return { success: false, error: error.message || "Failed to create store from template" };
  }
}

export async function saveStoreAsTemplateAction(input: {
  storeId: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  style?: string;
  previewImage?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const store = await prisma.store.findUnique({
      where: { id: input.storeId },
      include: { pages: true }
    });

    if (!store) throw new Error("Store not found");
    if (store.ownerId !== session.user.id && store.businessId !== session.user.businessId) {
      throw new Error("You do not have permission to export this store as a template.");
    }

    const homePage = store.pages.find(p => p.isHome || p.slug === "home") || store.pages[0];
    const rawSections = (homePage?.sections as StoreSection[]) || [];

    // Sanitize sections to remove private business details
    const sanitizedSections = rawSections.map((sec) => {
      const content = { ...(sec.content || {}) };
      if (sec.type === "contact") {
        content.phone = "+232 79 000000";
        content.whatsapp = "+232 79 000000";
        content.email = "hello@example.com";
      }
      return { ...sec, content };
    });

    const templateSlug = input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const templateId = `tpl-custom-${templateSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTemplate = await prisma.storeTemplate.create({
      data: {
        templateId,
        name: input.name,
        slug: `${templateSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
        category: input.category,
        description: input.description,
        tags: input.tags.map(t => t.toLowerCase().trim()),
        style: input.style || "modern",
        previewImage: input.previewImage || store.bannerUrl || null,
        thumbnail: input.previewImage || store.logoUrl || null,
        themeConfig: store.themeConfig as any,
        sections: sanitizedSections as any,
        navigation: store.navigation as any,
        status: "PUBLISHED",
        creatorId: session.user.id,
        isFeatured: false,
        supportedFeatures: ["whatsapp_checkout", "responsive_catalog", "ai_customizer"]
      }
    });

    revalidatePath("/dashboard/store-builder");

    return {
      success: true,
      template: serializeStore(newTemplate) as StoreTemplateDTO
    };
  } catch (error: any) {
    console.error("saveStoreAsTemplateAction error:", error);
    return { success: false, error: error.message || "Failed to save store as template" };
  }
}

export async function recordTemplateInteractionAction(templateId: string, type: "view" | "preview" | "select") {
  try {
    if (type === "view" || type === "preview") {
      await prisma.storeTemplate.updateMany({
        where: { templateId },
        data: { viewsCount: { increment: 1 } }
      });
    }
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function seedStoreTemplatesAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let count = 0;
    for (const tpl of STARTER_TEMPLATES) {
      await prisma.storeTemplate.upsert({
        where: { templateId: tpl.templateId },
        create: {
          templateId: tpl.templateId,
          name: tpl.name,
          slug: tpl.slug,
          category: tpl.category,
          description: tpl.description,
          tags: tpl.tags,
          style: tpl.style,
          thumbnail: tpl.thumbnail,
          previewImage: tpl.previewImage,
          themeConfig: tpl.themeConfig as any,
          sections: tpl.sections as any,
          navigation: tpl.navigation as any,
          productLayout: tpl.productLayout as any,
          mobileSettings: tpl.mobileSettings as any,
          supportedFeatures: tpl.supportedFeatures,
          status: tpl.status,
          isFeatured: tpl.isFeatured,
          viewsCount: tpl.viewsCount,
          usageCount: tpl.usageCount,
        },
        update: {
          name: tpl.name,
          category: tpl.category,
          description: tpl.description,
          tags: tpl.tags,
          style: tpl.style,
          thumbnail: tpl.thumbnail,
          previewImage: tpl.previewImage,
          themeConfig: tpl.themeConfig as any,
          sections: tpl.sections as any,
          navigation: tpl.navigation as any,
          productLayout: tpl.productLayout as any,
          mobileSettings: tpl.mobileSettings as any,
          supportedFeatures: tpl.supportedFeatures,
          isFeatured: tpl.isFeatured,
        }
      });
      count++;
    }

    revalidatePath("/dashboard/store-builder");
    return { success: true, count };
  } catch (error: any) {
    console.error("seedStoreTemplatesAction error:", error);
    return { success: false, error: error.message || "Failed to seed templates" };
  }
}

