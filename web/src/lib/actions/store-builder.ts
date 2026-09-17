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
  CartItem
} from "@/types/store-builder";
import { 
  generateAIStoreConfiguration, 
  executeAIStoreModification 
} from "@/lib/store-builder/ai-service";
import { generateSoNumber } from "@/lib/actions/sales-order";

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

// ─── 1. GET STORE BY AUTHENTICATED BUSINESS ───────────────────────
export async function getStoreByBusiness() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const store = await prisma.store.findUnique({
    where: { businessId: session.user.businessId },
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

// ─── 2. CREATE OR GENERATE STORE WITH AI ──────────────────────────
export async function createOrGenerateStore(input: AIStoreGenerationInput) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const businessId = session.user.businessId;

  // 1. Generate full AI configuration
  const aiConfig = await generateAIStoreConfiguration(input);

  // 2. Ensure slug is unique across all stores
  let finalSlug = aiConfig.slug;
  const existingWithSlug = await prisma.store.findFirst({
    where: { slug: finalSlug, businessId: { not: businessId } }
  });
  if (existingWithSlug) {
    finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // 3. Upsert Store Record
  const store = await prisma.store.upsert({
    where: { businessId },
    create: {
      businessId,
      name: aiConfig.name,
      slug: finalSlug,
      description: aiConfig.description,
      status: "DRAFT",
      currency: "SLE",
      whatsappPhone: input.whatsapp || input.phone || "",
      contactPhone: input.phone || "",
      contactEmail: input.email || "",
      themeConfig: aiConfig.theme as any,
      navigation: aiConfig.navigation as any,
      settings: aiConfig.settings as any,
    },
    update: {
      name: aiConfig.name,
      slug: finalSlug,
      description: aiConfig.description,
      whatsappPhone: input.whatsapp || input.phone || "",
      contactPhone: input.phone || "",
      contactEmail: input.email || "",
      themeConfig: aiConfig.theme as any,
      navigation: aiConfig.navigation as any,
      settings: aiConfig.settings as any,
    }
  });

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

  // 5. Connect selected products to store
  if (input.productIds && input.productIds.length > 0) {
    for (let i = 0; i < input.productIds.length; i++) {
      const pid = input.productIds[i];
      await prisma.storeProduct.upsert({
        where: {
          storeId_productId: {
            storeId: store.id,
            productId: pid
          }
        },
        create: {
          storeId: store.id,
          productId: pid,
          isFeatured: i < 4,
          displayOrder: i,
          isVisible: true,
          customBadge: i === 0 ? "FEATURED" : (i === 1 ? "POPULAR" : null)
        },
        update: {
          isVisible: true
        }
      });
    }
  } else {
    // If none specified, auto-link top active products from this business
    const availableProducts = await prisma.product.findMany({
      where: { businessId, deletedAt: null, status: "active" },
      take: 12,
      orderBy: { createdAt: "desc" }
    });
    for (let i = 0; i < availableProducts.length; i++) {
      const p = availableProducts[i];
      await prisma.storeProduct.upsert({
        where: {
          storeId_productId: {
            storeId: store.id,
            productId: p.id
          }
        },
        create: {
          storeId: store.id,
          productId: p.id,
          isFeatured: i < 4,
          displayOrder: i,
          isVisible: true,
          customBadge: i === 0 ? "FEATURED" : null
        },
        update: { isVisible: true }
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
  themeConfig?: StoreTheme;
  navigation?: StoreNavigation;
  settings?: StoreSettings;
  socialLinks?: any;
}) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const businessId = session.user.businessId;

  // Validate slug uniqueness if changed
  if (data.slug) {
    const cleanSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const existing = await prisma.store.findFirst({
      where: { slug: cleanSlug, businessId: { not: businessId } }
    });
    if (existing) {
      throw new Error("This store URL slug is already taken. Please choose another.");
    }
    data.slug = cleanSlug;
  }

  const updated = await prisma.store.update({
    where: { businessId },
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
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const store = await prisma.store.findUnique({
    where: { businessId: session.user.businessId }
  });
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
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const store = await prisma.store.findUnique({
    where: { businessId: session.user.businessId }
  });
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
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const store = await prisma.store.findUnique({
    where: { businessId: session.user.businessId },
    include: {
      pages: { where: { slug: "home" } }
    }
  });
  if (!store) throw new Error("Store not found");

  const homePage = store.pages[0];
  const currentSections = (homePage?.sections as unknown as StoreSection[]) || [];

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

  if (result.homeSections && homePage) {
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
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const businessId = session.user.businessId;

  // Get or find store
  const store = await prisma.store.findUnique({
    where: { businessId }
  });

  // All catalog products
  const products = await prisma.product.findMany({
    where: { businessId, deletedAt: null },
    include: {
      category: { select: { id: true, name: true } },
      storeProducts: {
        where: { storeId: store?.id || "" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return products.map(p => {
    const sp = p.storeProducts[0];
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      unitPrice: Number(p.unitPrice),
      stockQuantity: Number(p.stockQuantity),
      imageUrl: p.imageUrl,
      category: p.category?.name || "Uncategorized",
      status: p.status,
      // Store-specific overrides:
      isListedOnline: !!sp && sp.isVisible,
      isFeatured: !!sp && sp.isFeatured,
      customBadge: sp?.customBadge || null,
      customPrice: sp?.customPrice ? Number(sp.customPrice) : null,
      displayOrder: sp?.displayOrder || 0
    };
  });
}

// ─── 8. TOGGLE / UPDATE STORE PRODUCT LINK ────────────────────────
export async function updateStoreProductLink(productId: string, data: {
  isVisible: boolean;
  isFeatured?: boolean;
  customBadge?: string | null;
  customPrice?: number | null;
}) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const store = await prisma.store.findUnique({
    where: { businessId: session.user.businessId }
  });
  if (!store) throw new Error("Store not found");

  await prisma.storeProduct.upsert({
    where: {
      storeId_productId: {
        storeId: store.id,
        productId
      }
    },
    create: {
      storeId: store.id,
      productId,
      isVisible: data.isVisible,
      isFeatured: data.isFeatured ?? false,
      customBadge: data.customBadge ?? null,
      customPrice: data.customPrice ?? null
    },
    update: {
      isVisible: data.isVisible,
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.customBadge !== undefined && { customBadge: data.customBadge }),
      ...(data.customPrice !== undefined && { customPrice: data.customPrice })
    }
  });

  revalidatePath("/dashboard/store-builder");
  revalidatePath(`/store/${store.slug}`);
  return { success: true };
}

// ─── 9. GET PUBLIC STOREFRONT DATA (NO AUTH REQUIRED) ─────────────
export async function getPublicStorefrontData(slug: string) {
  try {
    const store = await prisma.store.findFirst({
      where: { 
        slug: slug.toLowerCase().trim(),
        status: "PUBLISHED"
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
            product: {
              deletedAt: null,
              status: "active"
            }
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

    return serializeStore(store);
  } catch (error) {
    console.error("GET PUBLIC STOREFRONT ERROR:", error);
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

    const businessId = store.businessId;

    // 1. Find or create Customer record for this business
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

    // 2. Calculate subtotal & delivery fee
    const storeSettings = (store.settings as unknown as StoreSettings) || {};
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = checkoutData.deliveryMethod === "DELIVERY" ? (storeSettings.deliveryFee || 0) : 0;
    const totalAmount = subtotal + deliveryFee;

    // 3. Find a default user for business to associate with order (e.g. business admin)
    const adminUser = await prisma.user.findFirst({
      where: { businessId, status: "active" }
    });
    const fallbackUserId = adminUser?.id || store.businessId;

    // 4. Generate orderly SO Number
    const soNumber = await generateSoNumber(businessId);

    // 5. Create SalesOrder in Enterprise OS
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

    // 6. Record analytics for orders & revenue
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

    // 7. Format WhatsApp message
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

    const waPhone = (store.whatsappPhone || store.business.whatsappPhone || store.business.phone || "").replace(/[^0-9]/g, "");
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
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const businessId = session.user.businessId;

  const orders = await prisma.salesOrder.findMany({
    where: {
      businessId,
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
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const store = await prisma.store.findUnique({
    where: { businessId: session.user.businessId },
    include: {
      analytics: {
        orderBy: { date: "desc" },
        take: 30
      }
    }
  });

  if (!store) return null;

  const analytics = store.analytics || [];
  const totalVisitors = analytics.reduce((acc, a) => acc + a.visitors, 0);
  const totalPageViews = analytics.reduce((acc, a) => acc + a.pageViews, 0);
  const totalOrders = analytics.reduce((acc, a) => acc + a.ordersCount, 0);
  const totalRevenue = analytics.reduce((acc, a) => acc + Number(a.revenue), 0);

  return {
    storeStatus: store.status,
    storeSlug: store.slug,
    totalVisitors,
    totalPageViews,
    totalOrders,
    totalRevenue,
    recentDaily: serializeStore(analytics.slice(0, 7).reverse())
  };
}
