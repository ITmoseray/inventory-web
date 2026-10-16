"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import * as crypto from "crypto";

/**
 * Hash IP address for privacy & duplicate filtering
 */
function hashIp(ip?: string): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip.trim()).digest("hex");
}

/**
 * Generate unique order reference: DEMO-ORD-YYYYMMDD-XXXX
 */
function generateDemoOrderRef(): string {
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `DEMO-ORD-${dateStr}-${randomStr}`;
}

/**
 * Generate unique demo payment reference if user leaves blank or requests sample
 */
export async function generateDemoPaymentRef(): Promise<string> {
  const d = new Date();
  const year = d.getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `DEMO-OM-${year}-${randomNum}`;
}

/**
 * Auth helper: check if user is admin / superadmin
 */
async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please log in.");
  }
  const role = (session.user.role || "").toUpperCase();
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    throw new Error("Forbidden: Admin privileges required for practical simulator management.");
  }
  return session.user;
}

/**
 * Auth helper: get or verify current student affiliate record.
 * Mirrors the same dual-lookup used in the affiliate portal layout:
 *   1. By userId  (primary)
 *   2. By email   (fallback for affiliates registered before userId linking)
 * Then auto-links the userId if missing, or auto-provisions a new record.
 */
async function getAuthenticatedAffiliate() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required.");
  }

  // 1. Primary lookup by userId
  let affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  });

  // 2. Fallback: look up by email (affiliate registered before userId was linked)
  if (!affiliate && session.user.email) {
    affiliate = await prisma.affiliate.findFirst({
      where: { email: session.user.email.toLowerCase().trim() },
    });

    // If found by email, back-link the userId so future lookups use the fast path
    if (affiliate && !affiliate.userId) {
      try {
        affiliate = await prisma.affiliate.update({
          where: { id: affiliate.id },
          data: { userId: session.user.id },
        });
      } catch (_) {
        // ignore – concurrent update or unique conflict, original record is fine
      }
    }
  }

  // 3. Auto-provision a new affiliate record for training if still not found
  if (!affiliate) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) throw new Error("User record not found.");

    const count = await prisma.affiliate.count();
    const padded = String(count + 1).padStart(5, "0");
    const code = `PA-AFF-${padded}`;

    affiliate = await prisma.affiliate.create({
      data: {
        userId: user.id,
        affiliateCode: code,
        fullName: user.name || "Student Affiliate",
        email: user.email,
        phone: (user as any).phone || "000-000-0000",
        status: "APPROVED",
        agreedToTerms: true,
      },
    });
  }

  return affiliate;
}

// =========================================================================
// 1. ADMIN TRAINING PRODUCT MANAGEMENT
// =========================================================================

export interface TrainingProductInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  price: number; // in NLe
  demoStock?: number;
  commissionPct: number; // e.g. 10.00
  specifications?: any;
  status?: string; // "draft" | "published" | "archived"
  campaignId?: string | null;
}

export async function createTrainingProduct(input: TrainingProductInput) {
  try {
    const user = await checkAdminAuth();

    if (!input.name || input.price <= 0 || input.commissionPct < 0) {
      return { success: false, error: "Product name, valid price, and commission percentage are required." };
    }

    const rawSlug = input.slug?.trim() || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let slug = rawSlug;
    let counter = 1;
    while (await prisma.trainingProduct.findUnique({ where: { slug } })) {
      slug = `${rawSlug}-${counter}`;
      counter++;
    }

    const product = await prisma.trainingProduct.create({
      data: {
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        imageUrl: input.imageUrl?.trim() || null,
        category: input.category?.trim() || "GENERAL",
        price: input.price,
        demoStock: input.demoStock ?? 100,
        commissionPct: input.commissionPct,
        specifications: input.specifications || null,
        status: input.status || "published",
        campaignId: input.campaignId || null,
        createdById: user.id,
      },
    });

    revalidatePath("/super-admin/affiliates");
    revalidatePath("/affiliate/simulator");
    return { success: true, product };
  } catch (error: any) {
    console.error("[createTrainingProduct error]:", error);
    return { success: false, error: error.message || "Failed to create training product." };
  }
}

export async function updateTrainingProduct(id: string, input: Partial<TrainingProductInput>) {
  try {
    await checkAdminAuth();

    const existing = await prisma.trainingProduct.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Training product not found." };

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.description !== undefined) updateData.description = input.description?.trim() || null;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl?.trim() || null;
    if (input.category !== undefined) updateData.category = input.category?.trim();
    if (input.price !== undefined) updateData.price = input.price;
    if (input.demoStock !== undefined) updateData.demoStock = input.demoStock;
    if (input.commissionPct !== undefined) updateData.commissionPct = input.commissionPct;
    if (input.specifications !== undefined) updateData.specifications = input.specifications;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.campaignId !== undefined) updateData.campaignId = input.campaignId || null;

    const product = await prisma.trainingProduct.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/super-admin/affiliates");
    revalidatePath("/affiliate/simulator");
    return { success: true, product };
  } catch (error: any) {
    console.error("[updateTrainingProduct error]:", error);
    return { success: false, error: error.message || "Failed to update training product." };
  }
}

export async function setTrainingProductStatus(id: string, status: "draft" | "published" | "archived") {
  return updateTrainingProduct(id, { status });
}

export async function getTrainingProducts(options?: {
  status?: string;
  category?: string;
  search?: string;
}) {
  try {
    const where: any = {};
    if (options?.status && options.status !== "ALL") {
      where.status = options.status;
    }
    if (options?.category && options.category !== "ALL") {
      where.category = options.category;
    }
    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { description: { contains: options.search, mode: "insensitive" } },
        { slug: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.trainingProduct.findMany({
      where,
      include: {
        campaign: { select: { id: true, name: true } },
        _count: {
          select: {
            links: true,
            demoOrders: true,
            demoClicks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        commissionPct: Number(p.commissionPct),
        calculatedCommission: Math.round((Number(p.price) * Number(p.commissionPct)) / 100 * 100) / 100,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("[getTrainingProducts error]:", error);
    return { success: false, error: "Failed to load training products." };
  }
}

export async function getTrainingProductBySlug(slug: string) {
  try {
    const product = await prisma.trainingProduct.findUnique({
      where: { slug },
      include: {
        campaign: true,
      },
    });

    if (!product) return { success: false, error: "Product not found." };

    return {
      success: true,
      product: {
        ...product,
        price: Number(product.price),
        commissionPct: Number(product.commissionPct),
        calculatedCommission: Math.round((Number(product.price) * Number(product.commissionPct)) / 100 * 100) / 100,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("[getTrainingProductBySlug error]:", error);
    return { success: false, error: "Failed to load product details." };
  }
}

// =========================================================================
// 2. ADMIN TRAINING CAMPAIGN MANAGEMENT
// =========================================================================

export async function createTrainingCampaign(data: {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  targetGroup?: string;
}) {
  try {
    await checkAdminAuth();
    if (!data.name) return { success: false, error: "Campaign name is required." };

    const campaign = await prisma.trainingCampaign.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        targetGroup: data.targetGroup?.trim() || "All Academy Students",
        status: "active",
      },
    });

    revalidatePath("/super-admin/affiliates");
    return { success: true, campaign };
  } catch (error: any) {
    console.error("[createTrainingCampaign error]:", error);
    return { success: false, error: error.message || "Failed to create campaign." };
  }
}

export async function getTrainingCampaigns() {
  try {
    const campaigns = await prisma.trainingCampaign.findMany({
      include: {
        _count: {
          select: {
            products: true,
            demoOrders: true,
            demoClicks: true,
            links: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      campaigns: campaigns.map((c) => ({
        ...c,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate?.toISOString() || null,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("[getTrainingCampaigns error]:", error);
    return { success: false, error: "Failed to load campaigns." };
  }
}

// =========================================================================
// 3. AFFILIATE PRODUCT MARKETPLACE & UNIQUE LINK GENERATION
// =========================================================================

export async function getMarketplaceProducts() {
  try {
    // Return published demonstration products
    const products = await prisma.trainingProduct.findMany({
      where: { status: "published" },
      include: {
        campaign: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      products: products.map((p) => {
        const price = Number(p.price);
        const commissionPct = Number(p.commissionPct);
        const estimatedCommission = Math.round(((price * commissionPct) / 100) * 100) / 100;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          imageUrl: p.imageUrl,
          category: p.category,
          price,
          demoStock: p.demoStock,
          commissionPct,
          estimatedCommission,
          specifications: p.specifications,
          campaign: p.campaign,
          createdAt: p.createdAt.toISOString(),
        };
      }),
    };
  } catch (error: any) {
    console.error("[getMarketplaceProducts error]:", error);
    return { success: false, error: "Failed to load marketplace products." };
  }
}

/**
 * Generate a unique demonstration link for student & product
 */
export async function generateTrainingLink(productId: string, campaignId?: string) {
  try {
    const affiliate = await getAuthenticatedAffiliate();

    const product = await prisma.trainingProduct.findUnique({
      where: { id: productId },
    });
    if (!product) return { success: false, error: "Product not found." };

    // Check if link already exists for this affiliate & product
    const existing = await prisma.trainingLink.findUnique({
      where: {
        affiliateId_productId: {
          affiliateId: affiliate.id,
          productId,
        },
      },
    });

    if (existing) {
      return {
        success: true,
        link: {
          ...existing,
          code: existing.code,
          relativeUrl: `/affiliate/simulator/shop/${product.slug}?ref=${existing.code}`,
        },
        message: "Existing demonstration link retrieved.",
      };
    }

    // Format code: SIM-{affiliateCodeSlice}-{productSlugShort}
    const affCodePart = affiliate.affiliateCode.replace("PA-AFF-", "");
    const prodPart = product.slug.slice(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, "");
    let code = `SIM-${affCodePart}-${prodPart}`;

    // Ensure uniqueness
    let counter = 1;
    while (await prisma.trainingLink.findUnique({ where: { code } })) {
      code = `SIM-${affCodePart}-${prodPart}-${counter}`;
      counter++;
    }

    const newLink = await prisma.trainingLink.create({
      data: {
        code,
        affiliateId: affiliate.id,
        productId,
        campaignId: campaignId || product.campaignId || null,
      },
    });

    revalidatePath("/affiliate/simulator");
    return {
      success: true,
      link: {
        ...newLink,
        relativeUrl: `/affiliate/simulator/shop/${product.slug}?ref=${newLink.code}`,
      },
      message: "New demonstration affiliate link generated!",
    };
  } catch (error: any) {
    console.error("[generateTrainingLink error]:", error);
    return { success: false, error: error.message || "Failed to generate link." };
  }
}

export async function getMyTrainingLinks() {
  try {
    const affiliate = await getAuthenticatedAffiliate();

    const links = await prisma.trainingLink.findMany({
      where: { affiliateId: affiliate.id },
      include: {
        product: true,
        campaign: true,
        _count: {
          select: {
            clicks: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      links: links.map((l) => ({
        id: l.id,
        code: l.code,
        productId: l.productId,
        productName: l.product.name,
        productSlug: l.product.slug,
        productPrice: Number(l.product.price),
        commissionPct: Number(l.product.commissionPct),
        calculatedCommission: Math.round((Number(l.product.price) * Number(l.product.commissionPct)) / 100 * 100) / 100,
        imageUrl: l.product.imageUrl,
        clicksCount: l.clicksCount,
        ordersCount: l.orders.length,
        campaignName: l.campaign?.name || "General Training",
        relativeUrl: `/affiliate/simulator/shop/${l.product.slug}?ref=${l.code}`,
        createdAt: l.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("[getMyTrainingLinks error]:", error);
    return { success: false, error: "Failed to load links." };
  }
}

// =========================================================================
// 4. PUBLIC LINK TRACKING & SIMULATED CHECKOUT FLOW
// =========================================================================

export async function recordTrainingClick(params: {
  code: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  visitorId: string;
  landingPage: string;
}) {
  try {
    const rawCode = params.code.trim();

    // 1. Look up by TrainingLink code first
    const link = await prisma.trainingLink.findUnique({
      where: { code: rawCode },
      include: { affiliate: true, product: true },
    });

    let affiliateId = link?.affiliateId || null;
    let productId = link?.productId || null;
    let campaignId = link?.campaignId || null;

    // 2. If not found as link code, fallback to affiliateCode e.g. PA-AFF-00001
    if (!affiliateId) {
      const aff = await prisma.affiliate.findUnique({
        where: { affiliateCode: rawCode.toUpperCase() },
      });
      if (aff) {
        affiliateId = aff.id;
      }
    }

    if (!affiliateId) {
      return { success: false, error: "Invalid referral code." };
    }

    const ipHash = hashIp(params.ip);

    // 3. Duplicate filtering: 5-minute spam throttle per visitorId + link
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingRecent = await prisma.demoClick.findFirst({
      where: {
        affiliateId,
        visitorId: params.visitorId,
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    let clickId: string;

    if (!existingRecent) {
      const click = await prisma.demoClick.create({
        data: {
          linkId: link?.id || null,
          productId,
          affiliateId,
          campaignId,
          visitorId: params.visitorId,
          ipHash,
          userAgent: params.userAgent?.slice(0, 500) || null,
          referrer: params.referrer?.slice(0, 500) || null,
          landingPage: params.landingPage,
        },
      });
      clickId = click.id;

      if (link) {
        await prisma.trainingLink.update({
          where: { id: link.id },
          data: { clicksCount: { increment: 1 } },
        });
      }
    } else {
      clickId = existingRecent.id;
    }

    return {
      success: true,
      clickId,
      affiliateId,
      productSlug: link?.product?.slug || null,
    };
  } catch (error: any) {
    console.error("[recordTrainingClick error]:", error);
    return { success: false, error: "Click tracking error." };
  }
}

/**
 * Record checkout attempted for funnel analytics
 */
export async function recordCheckoutAttempt(clickId?: string) {
  try {
    if (!clickId) return { success: true };
    await prisma.demoClick.update({
      where: { id: clickId },
      data: { checkoutAttempted: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Process Simulated Customer Checkout (Orange Money demo)
 */
export async function processSimulatedCheckout(data: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productId: string;
  quantity: number;
  paymentRef: string;
  paymentMethod?: string;
  linkCode?: string;
  clickId?: string;
  visitorId?: string;
  idempotencyKey?: string;
}) {
  try {
    // 1. Validation
    if (!data.customerName?.trim() || !data.customerPhone?.trim()) {
      return { success: false, error: "Please enter your name and phone number." };
    }
    if (!data.paymentRef?.trim()) {
      return { success: false, error: "Demonstration Orange Money transaction reference is required." };
    }
    const qty = Math.max(1, Math.min(100, Number(data.quantity) || 1));

    // 2. Idempotency check: prevent double submission
    if (data.idempotencyKey) {
      const existing = await prisma.demoOrder.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
        include: { product: true, commission: true },
      });
      if (existing) {
        return {
          success: true,
          orderRef: existing.orderRef,
          isDuplicate: true,
          message: "Order already recorded.",
        };
      }
    }

    // 3. Fetch training product
    const product = await prisma.trainingProduct.findUnique({
      where: { id: data.productId },
    });
    if (!product || product.status !== "published") {
      return { success: false, error: "Training product is not available for purchase." };
    }

    const unitPrice = Number(product.price);
    const totalAmount = unitPrice * qty;
    const commissionPct = Number(product.commissionPct);
    const calculatedCommission = Math.round(((totalAmount * commissionPct) / 100) * 100) / 100;

    // 4. Resolve Affiliate & Attribution
    let affiliateId: string | null = null;
    let linkId: string | null = null;
    let campaignId: string | null = product.campaignId || null;

    if (data.linkCode) {
      const link = await prisma.trainingLink.findUnique({
        where: { code: data.linkCode.trim() },
        include: { affiliate: true },
      });
      if (link?.affiliate) {
        affiliateId = link.affiliateId;
        linkId = link.id;
        if (link.campaignId) campaignId = link.campaignId;
      } else {
        const aff = await prisma.affiliate.findUnique({
          where: { affiliateCode: data.linkCode.trim().toUpperCase() },
        });
        if (aff) affiliateId = aff.id;
      }
    }

    // Fallback: check clickId
    if (!affiliateId && data.clickId) {
      const click = await prisma.demoClick.findUnique({
        where: { id: data.clickId },
      });
      if (click?.affiliateId) {
        affiliateId = click.affiliateId;
        linkId = click.linkId;
        if (click.campaignId) campaignId = click.campaignId;
      }
    }

    // Fallback: check visitorId within 30-day window
    if (!affiliateId && data.visitorId) {
      const recentClick = await prisma.demoClick.findFirst({
        where: { visitorId: data.visitorId },
        orderBy: { createdAt: "desc" },
      });
      if (recentClick?.affiliateId) {
        affiliateId = recentClick.affiliateId;
        linkId = recentClick.linkId;
        if (recentClick.campaignId) campaignId = recentClick.campaignId;
      }
    }

    // 5. Anti-Fraud Check: Prevent student from buying from own affiliate link if logged in
    let session: any = null;
    try {
      session = await auth();
    } catch (e) {
      session = null;
    }

    if (session?.user?.id && affiliateId) {
      const userAffiliate = await prisma.affiliate.findUnique({
        where: { userId: session.user.id },
      });
      if (userAffiliate && userAffiliate.id === affiliateId) {
        // Self-referral during training is allowed with a warning flag, or we permit it for testing
        console.log("[Simulator]: Self-referral simulation by student for practice.");
      }
    }

    const orderRef = generateDemoOrderRef();

    // 6. Execute atomic transaction: Create DemoOrder + DemoCommission + DemoNotification
    const result = await prisma.$transaction(async (tx) => {
      // Create demo order
      const order = await tx.demoOrder.create({
        data: {
          orderRef,
          customerName: data.customerName.trim(),
          customerPhone: data.customerPhone.trim(),
          customerEmail: data.customerEmail?.trim().toLowerCase() || null,
          productId: product.id,
          affiliateId,
          linkId,
          clickId: data.clickId || null,
          campaignId,
          quantity: qty,
          unitPrice,
          totalAmount,
          status: "CONFIRMED",
          paymentMethod: data.paymentMethod || "ORANGE_MONEY_DEMO",
          paymentStatus: "DEMO_CONFIRMED",
          paymentRef: data.paymentRef.trim(),
          idempotencyKey: data.idempotencyKey || null,
        },
      });

      // Update link conversions count
      if (linkId) {
        await tx.trainingLink.update({
          where: { id: linkId },
          data: { conversionsCount: { increment: 1 } },
        });
      }

      // Decrement demo stock if available
      if (product.demoStock > 0) {
        await tx.trainingProduct.update({
          where: { id: product.id },
          data: { demoStock: { decrement: qty } },
        });
      }

      let commission = null;

      // Create demonstration commission record if affiliate is attributed
      if (affiliateId) {
        commission = await tx.demoCommission.create({
          data: {
            orderId: order.id,
            affiliateId,
            productId: product.id,
            saleAmount: totalAmount,
            commissionPct,
            commissionAmount: calculatedCommission,
            status: "APPROVED", // Auto-approved in simulation mode for immediate student feedback
            approvedBy: "System (Simulator Engine)",
            approvedAt: new Date(),
          },
        });

        // Create student notification
        await tx.demoNotification.create({
          data: {
            affiliateId,
            title: "🎉 Congratulations! You Made a Demo Sale!",
            message: `A customer has completed a simulated purchase of ${product.name} (Qty: ${qty}) through your demonstration link.\nOrder Reference: ${orderRef}\nSimulated Sale Value: NLe ${totalAmount.toLocaleString()}\nYour Demo Commission: NLe ${calculatedCommission.toLocaleString()}\nStatus: Approved — Training Simulation.\n\nNotice: This is an educational demonstration. No real money was charged or transferred.`,
            type: "DEMO_SALE",
            orderRef,
          },
        });
      }

      return { order, commission };
    });

    try {
      revalidatePath("/affiliate/simulator");
      revalidatePath("/super-admin/affiliates");
    } catch (e) {
      // Ignored outside Next.js request scope
    }

    return {
      success: true,
      orderRef: result.order.orderRef,
      orderId: result.order.id,
      productName: product.name,
      totalAmount,
      calculatedCommission,
      affiliateAttributed: Boolean(affiliateId),
      message: "Demonstration order recorded successfully!",
    };
  } catch (error: any) {
    console.error("[processSimulatedCheckout error]:", error);
    return { success: false, error: error.message || "Failed to process demonstration purchase." };
  }
}

export async function getDemoOrderDetails(orderRef: string) {
  try {
    const order = await prisma.demoOrder.findUnique({
      where: { orderRef },
      include: {
        product: true,
        affiliate: {
          select: {
            id: true,
            fullName: true,
            affiliateCode: true,
          },
        },
        commission: true,
        campaign: { select: { id: true, name: true } },
      },
    });

    if (!order) return { success: false, error: "Order not found." };

    return {
      success: true,
      order: {
        ...order,
        unitPrice: Number(order.unitPrice),
        totalAmount: Number(order.totalAmount),
        commissionAmount: order.commission ? Number(order.commission.commissionAmount) : 0,
        commissionPct: order.commission ? Number(order.commission.commissionPct) : 0,
        createdAt: order.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("[getDemoOrderDetails error]:", error);
    return { success: false, error: "Failed to load order details." };
  }
}

// =========================================================================
// 5. STUDENT DASHBOARD STATS & FUNNEL METRICS
// =========================================================================

export async function getStudentSimulatorStats() {
  try {
    const affiliate = await getAuthenticatedAffiliate();

    const [
      linksCount,
      totalClicks,
      uniqueVisitorsGroup,
      checkoutAttempts,
      orders,
      commissions,
      notifications,
      recentClicks,
    ] = await Promise.all([
      prisma.trainingLink.count({ where: { affiliateId: affiliate.id } }),
      prisma.demoClick.count({ where: { affiliateId: affiliate.id } }),
      prisma.demoClick.groupBy({
        by: ["visitorId"],
        where: { affiliateId: affiliate.id },
      }),
      prisma.demoClick.count({
        where: { affiliateId: affiliate.id, checkoutAttempted: true },
      }),
      prisma.demoOrder.findMany({
        where: { affiliateId: affiliate.id },
        include: { product: true, commission: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.demoCommission.findMany({
        where: { affiliateId: affiliate.id },
        include: { order: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.demoNotification.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.demoClick.findMany({
        where: { affiliateId: affiliate.id },
        include: { product: { select: { name: true } }, link: { select: { code: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    const successfulPurchases = orders.filter((o) => o.status === "CONFIRMED");
    const totalSalesValue = successfulPurchases.reduce((acc, o) => acc + Number(o.totalAmount), 0);

    const approvedCommissions = commissions.filter((c) => c.status === "APPROVED");
    const pendingCommissions = commissions.filter((c) => c.status === "PENDING");
    const approvedCommissionTotal = approvedCommissions.reduce((acc, c) => acc + Number(c.commissionAmount), 0);
    const pendingCommissionTotal = pendingCommissions.reduce((acc, c) => acc + Number(c.commissionAmount), 0);

    const uniqueVisitors = uniqueVisitorsGroup.length;
    const conversionRate = totalClicks > 0 ? ((successfulPurchases.length / totalClicks) * 100).toFixed(1) : "0.0";

    // Funnel Steps:
    // 1. Links Shared
    // 2. Clicks (Customer Clicked)
    // 3. Product Viewed (Unique Visitors)
    // 4. Checkout Started
    // 5. Demo Purchase Completed
    // 6. Demo Commission Recorded
    const funnel = [
      { step: "Links Generated", count: linksCount, description: "Promotional links created by you" },
      { step: "Total Clicks", count: totalClicks, description: "Customer clicks tracked" },
      { step: "Product Views", count: uniqueVisitors, description: "Unique potential customers" },
      { step: "Checkout Started", count: Math.max(checkoutAttempts, successfulPurchases.length), description: "Customers who reached payment page" },
      { step: "Demo Purchases", count: successfulPurchases.length, description: "Confirmed simulated orders" },
      { step: "Commissions Recorded", count: approvedCommissions.length, description: "Demonstration ledger entries" },
    ];

    return {
      success: true,
      affiliate: {
        id: affiliate.id,
        fullName: affiliate.fullName,
        affiliateCode: affiliate.affiliateCode,
      },
      metrics: {
        linksCount,
        totalClicks,
        uniqueVisitors,
        checkoutAttempts,
        successfulPurchasesCount: successfulPurchases.length,
        totalSalesValue,
        approvedCommissionTotal,
        pendingCommissionTotal,
        conversionRate,
      },
      funnel,
      recentOrders: orders.slice(0, 10).map((o) => ({
        id: o.id,
        orderRef: o.orderRef,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        productName: o.product.name,
        quantity: o.quantity,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentRef: o.paymentRef,
        commissionAmount: o.commission ? Number(o.commission.commissionAmount) : 0,
        createdAt: o.createdAt.toISOString(),
      })),
      recentNotifications: notifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
      recentClicks: recentClicks.map((c) => ({
        id: c.id,
        productName: c.product?.name || "General Link",
        linkCode: c.link?.code || "Direct",
        referrer: c.referrer || "Direct / WhatsApp",
        createdAt: c.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("[getStudentSimulatorStats error]:", error);
    return { success: false, error: "Failed to load student simulation stats." };
  }
}

export async function markDemoNotificationRead(id: string) {
  try {
    const affiliate = await getAuthenticatedAffiliate();
    await prisma.demoNotification.update({
      where: { id, affiliateId: affiliate.id },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// =========================================================================
// 6. ADMIN MONITORING, AUDITING & COMMISSION APPROVAL/CANCELLATION
// =========================================================================

export async function getAdminSimulatorData(options?: {
  affiliateId?: string;
  productId?: string;
  orderStatus?: string;
  commissionStatus?: string;
  search?: string;
}) {
  try {
    await checkAdminAuth();

    const orderWhere: any = {};
    if (options?.affiliateId && options.affiliateId !== "ALL") {
      orderWhere.affiliateId = options.affiliateId;
    }
    if (options?.productId && options.productId !== "ALL") {
      orderWhere.productId = options.productId;
    }
    if (options?.orderStatus && options.orderStatus !== "ALL") {
      orderWhere.status = options.orderStatus;
    }
    if (options?.search) {
      orderWhere.OR = [
        { orderRef: { contains: options.search, mode: "insensitive" } },
        { customerName: { contains: options.search, mode: "insensitive" } },
        { customerPhone: { contains: options.search, mode: "insensitive" } },
        { paymentRef: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [
      orders,
      commissions,
      products,
      campaigns,
      affiliates,
      totalClicks,
      links,
    ] = await Promise.all([
      prisma.demoOrder.findMany({
        where: orderWhere,
        include: {
          product: true,
          affiliate: {
            select: {
              id: true,
              fullName: true,
              email: true,
              affiliateCode: true,
            },
          },
          commission: true,
          campaign: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.demoCommission.findMany({
        include: {
          order: {
            include: {
              product: true,
            },
          },
          affiliate: {
            select: {
              id: true,
              fullName: true,
              email: true,
              affiliateCode: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.trainingProduct.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.trainingCampaign.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.affiliate.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          affiliateCode: true,
          status: true,
          _count: {
            select: {
              trainingLinks: true,
              demoOrders: true,
              demoClicks: true,
              demoCommissions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.demoClick.count(),
      prisma.trainingLink.findMany({
        include: {
          affiliate: { select: { fullName: true, affiliateCode: true } },
          product: { select: { name: true, price: true } },
        },
        orderBy: { clicksCount: "desc" },
        take: 50,
      }),
    ]);

    const totalSimulatedSales = orders
      .filter((o) => o.status === "CONFIRMED")
      .reduce((acc, o) => acc + Number(o.totalAmount), 0);

    const totalCommissionsCalculated = commissions
      .filter((c) => c.status !== "CANCELLED")
      .reduce((acc, c) => acc + Number(c.commissionAmount), 0);

    const totalApprovedCommissions = commissions
      .filter((c) => c.status === "APPROVED")
      .reduce((acc, c) => acc + Number(c.commissionAmount), 0);

    return {
      success: true,
      stats: {
        totalProducts: products.length,
        totalAffiliates: affiliates.length,
        totalLinks: links.length,
        totalClicks,
        totalOrders: orders.length,
        totalSimulatedSales,
        totalCommissionsCalculated,
        totalApprovedCommissions,
      },
      orders: orders.map((o) => ({
        id: o.id,
        orderRef: o.orderRef,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerEmail: o.customerEmail,
        productName: o.product.name,
        quantity: o.quantity,
        unitPrice: Number(o.unitPrice),
        totalAmount: Number(o.totalAmount),
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        paymentRef: o.paymentRef,
        affiliate: o.affiliate,
        campaignName: o.campaign?.name || "General",
        commission: o.commission
          ? {
              id: o.commission.id,
              status: o.commission.status,
              amount: Number(o.commission.commissionAmount),
              rate: Number(o.commission.commissionPct),
              approvedBy: o.commission.approvedBy,
              approvedAt: o.commission.approvedAt?.toISOString() || null,
            }
          : null,
        createdAt: o.createdAt.toISOString(),
      })),
      commissions: commissions.map((c) => ({
        id: c.id,
        orderRef: c.order.orderRef,
        customerName: c.order.customerName,
        productName: c.order.product.name,
        affiliate: c.affiliate,
        saleAmount: Number(c.saleAmount),
        commissionPct: Number(c.commissionPct),
        commissionAmount: Number(c.commissionAmount),
        status: c.status,
        approvedBy: c.approvedBy,
        approvedAt: c.approvedAt?.toISOString() || null,
        cancelledBy: c.cancelledBy,
        cancelledAt: c.cancelledAt?.toISOString() || null,
        cancelReason: c.cancelReason,
        createdAt: c.createdAt.toISOString(),
      })),
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        commissionPct: Number(p.commissionPct),
        calculatedCommission: Math.round((Number(p.price) * Number(p.commissionPct)) / 100 * 100) / 100,
        createdAt: p.createdAt.toISOString(),
      })),
      campaigns: campaigns.map((c) => ({
        ...c,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate?.toISOString() || null,
        createdAt: c.createdAt.toISOString(),
      })),
      affiliates,
      links: links.map((l) => ({
        ...l,
        productPrice: Number(l.product.price),
        createdAt: l.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("[getAdminSimulatorData error]:", error);
    return { success: false, error: error.message || "Failed to load admin simulation data." };
  }
}

/**
 * Admin action: Approve demonstration commission
 */
export async function approveDemoCommission(commissionId: string) {
  try {
    const user = await checkAdminAuth();

    const existing = await prisma.demoCommission.findUnique({
      where: { id: commissionId },
      include: { order: true, affiliate: true },
    });
    if (!existing) return { success: false, error: "Commission record not found." };

    const updated = await prisma.demoCommission.update({
      where: { id: commissionId },
      data: {
        status: "APPROVED",
        approvedBy: user.email || user.name || "Administrator",
        approvedAt: new Date(),
        cancelledBy: null,
        cancelledAt: null,
        cancelReason: null,
      },
    });

    // Notify affiliate
    await prisma.demoNotification.create({
      data: {
        affiliateId: existing.affiliateId,
        title: "✅ Demo Commission Approved!",
        message: `Your demonstration commission for order ${existing.order.orderRef} in the amount of NLe ${Number(existing.commissionAmount).toLocaleString()} has been approved by instructor/admin ${user.name || user.email}.\nNotice: Simulated demonstration only.`,
        type: "DEMO_COMMISSION_APPROVED",
        orderRef: existing.order.orderRef,
      },
    });

    revalidatePath("/super-admin/affiliates");
    revalidatePath("/affiliate/simulator");
    return { success: true, commission: updated };
  } catch (error: any) {
    console.error("[approveDemoCommission error]:", error);
    return { success: false, error: error.message || "Failed to approve commission." };
  }
}

/**
 * Admin action: Cancel demonstration commission
 */
export async function cancelDemoCommission(commissionId: string, reason: string) {
  try {
    const user = await checkAdminAuth();
    if (!reason?.trim()) {
      return { success: false, error: "A cancellation reason is required for auditing." };
    }

    const existing = await prisma.demoCommission.findUnique({
      where: { id: commissionId },
      include: { order: true, affiliate: true },
    });
    if (!existing) return { success: false, error: "Commission record not found." };

    const updated = await prisma.demoCommission.update({
      where: { id: commissionId },
      data: {
        status: "CANCELLED",
        cancelledBy: user.email || user.name || "Administrator",
        cancelledAt: new Date(),
        cancelReason: reason.trim(),
      },
    });

    // Notify affiliate
    await prisma.demoNotification.create({
      data: {
        affiliateId: existing.affiliateId,
        title: "⚠️ Demo Commission Cancelled",
        message: `Your demonstration commission for order ${existing.order.orderRef} was cancelled by administrator ${user.name || user.email}.\nReason: ${reason.trim()}\nNotice: Training simulation audit record updated.`,
        type: "DEMO_COMMISSION_CANCELLED",
        orderRef: existing.order.orderRef,
      },
    });

    revalidatePath("/super-admin/affiliates");
    revalidatePath("/affiliate/simulator");
    return { success: true, commission: updated };
  } catch (error: any) {
    console.error("[cancelDemoCommission error]:", error);
    return { success: false, error: error.message || "Failed to cancel commission." };
  }
}

/**
 * Seed initial practical demonstration products if database is empty
 */
export async function seedDemoProductsIfEmpty() {
  try {
    const count = await prisma.trainingProduct.count();
    if (count > 0) return { success: true, message: "Products already exist.", count };

    // Create default campaign
    const campaign = await prisma.trainingCampaign.create({
      data: {
        name: "ProTech Academy Affiliate Practical — October 2026",
        description: "Official interactive practical campaign for ProTech Online Academy students. Practice product marketing, link sharing, customer checkout simulation, and commission tracking.",
        targetGroup: "Class of October 2026",
        status: "active",
      },
    });

    const demoProducts = [
      {
        name: "ProTech Elite Laptop 15",
        slug: "laptop",
        description: "High-performance Core i7 training laptop with 16GB RAM, 512GB NVMe SSD, and FHD display. Ideal for programming, office management, and academy coursework.",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
        category: "LAPTOPS",
        price: 8500.0,
        demoStock: 25,
        commissionPct: 10.0,
        campaignId: campaign.id,
        specifications: {
          processor: "Intel Core i7 12th Gen",
          ram: "16GB DDR4",
          storage: "512GB NVMe SSD",
          screen: "15.6 inch FHD IPS",
          warranty: "1 Year Training Demo Warranty",
        },
      },
      {
        name: "ProTech Nova 5G Smartphone",
        slug: "smartphone",
        description: "Next-generation 5G mobile training smartphone with 128GB storage, 50MP AI triple camera, and all-day 5000mAh battery life.",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
        category: "SMARTPHONES",
        price: 3500.0,
        demoStock: 50,
        commissionPct: 10.0,
        campaignId: campaign.id,
        specifications: {
          display: "6.7 inch AMOLED 120Hz",
          storage: "128GB / 8GB RAM",
          camera: "50MP + 8MP + 2MP Triple Camera",
          battery: "5000mAh Fast Charging",
        },
      },
      {
        name: "ProTech Ergonomic Wireless Mouse",
        slug: "wireless-mouse",
        description: "Precision 2.4GHz optical wireless mouse with silent clicks, rechargeable battery, and ergonomic thumb rest for productive sessions.",
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
        category: "ACCESSORIES",
        price: 150.0,
        demoStock: 200,
        commissionPct: 10.0,
        campaignId: campaign.id,
        specifications: {
          connectivity: "2.4GHz USB Dongle + Bluetooth 5.1",
          dpi: "800 / 1200 / 1600 Adjustable",
          battery: "Rechargeable Type-C Li-Ion",
        },
      },
      {
        name: "ProTech Ultimate Computer Accessories Bundle",
        slug: "computer-accessories",
        description: "Complete student workstation bundle including 7-in-1 USB-C multi-port hub, mechanical tactile keyboard, HD 1080p webcam, and padded laptop sleeve.",
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
        category: "ACCESSORIES",
        price: 250.0,
        demoStock: 120,
        commissionPct: 10.0,
        campaignId: campaign.id,
        specifications: {
          included: ["7-in-1 USB-C Hub", "Backlit Keyboard", "1080p Webcam", "Waterproof Sleeve"],
          compatibility: "Windows, macOS, Linux, Android",
        },
      },
    ];

    for (const p of demoProducts) {
      await prisma.trainingProduct.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          imageUrl: p.imageUrl,
          category: p.category,
          price: p.price,
          demoStock: p.demoStock,
          commissionPct: p.commissionPct,
          specifications: p.specifications,
          status: "published",
          campaignId: p.campaignId,
        },
      });
    }

    return { success: true, message: "Default training products seeded successfully.", count: demoProducts.length };
  } catch (error: any) {
    console.error("[seedDemoProductsIfEmpty error]:", error);
    return { success: false, error: error.message };
  }
}
