"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// =========================================================================
// HELPER: USER & TENANT RESOLUTION
// =========================================================================

async function getRequiredSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  return session;
}

async function getRequiredSuperAdmin() {
  const session = await getRequiredSession();
  const isSuper =
    session.user.role === "SUPERADMIN" ||
    (session.user as any)?.originalRole === "SUPERADMIN";
  if (!isSuper) {
    throw new Error("Unauthorized: Super Admin access required");
  }
  return session;
}

// Generate unique sequential reference codes
function generateTrackingCode(prefix: string = "PAAN"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${randomPart}`;
}

function generateLedgerRef(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `LEDGER-${dateStr}-${randomHex}`;
}

function generateOfflineRef(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `OFFLINE-${dateStr}-${randomHex}`;
}

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `PAAN-ORD-${dateStr}-${randomHex}`;
}

// =========================================================================
// 1. MERCHANT PROFILE & REGISTRATION
// =========================================================================

export async function getPaanMerchantProfile() {
  try {
    const session = await getRequiredSession();
    const businessId = session.user.businessId;

    if (!businessId) {
      return { success: false, error: "No associated business found for this user." };
    }

    const merchant = await (prisma as any).paanMerchantProfile.findUnique({
      where: { businessId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            type: true,
            currency: true,
            phone: true,
            email: true,
            address: true,
          },
        },
      },
    });

    return { success: true, merchant };
  } catch (error: any) {
    console.error("getPaanMerchantProfile Error:", error);
    return { success: false, error: error.message || "Failed to load merchant profile" };
  }
}

export async function registerPaanMerchant(data: {
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  commissionAgreement?: string;
}) {
  try {
    const session = await getRequiredSession();
    const businessId = session.user.businessId;

    if (!businessId) {
      return { success: false, error: "You must have an active business to join PAAN." };
    }

    const existing = await (prisma as any).paanMerchantProfile.findUnique({
      where: { businessId },
    });

    if (existing) {
      return { success: true, merchant: existing, message: "Merchant profile already exists." };
    }

    const merchant = await (prisma as any).paanMerchantProfile.create({
      data: {
        businessId,
        status: "APPROVED", // Auto-approved for established registered businesses, reviewable by Super Admin
        contactPersonName: data.contactPersonName.trim(),
        contactPersonPhone: data.contactPersonPhone.trim(),
        contactPersonEmail: data.contactPersonEmail.trim().toLowerCase(),
        commissionAgreement: data.commissionAgreement?.trim() || "Standard PAAN Network Agreement (70% Affiliate / 30% Platform)",
        agreedToPaanTerms: true,
        approvedAt: new Date(),
        approvedBy: session.user.id,
      },
    });

    revalidatePath("/dashboard/paan");
    return { success: true, merchant, message: "Welcome to PAAN! Your merchant profile is now active." };
  } catch (error: any) {
    console.error("registerPaanMerchant Error:", error);
    return { success: false, error: error.message || "Failed to register merchant" };
  }
}

export async function getPaanMerchantStats() {
  try {
    const session = await getRequiredSession();
    const businessId = session.user.businessId;

    if (!businessId) {
      return { success: false, error: "Business ID required" };
    }

    const merchant = await (prisma as any).paanMerchantProfile.findUnique({
      where: { businessId },
      include: {
        campaigns: {
          select: {
            id: true,
            status: true,
            totalClicks: true,
            totalConversions: true,
            totalRevenueGenerated: true,
          },
        },
        offlineAttributions: {
          select: {
            id: true,
            saleAmount: true,
            totalCommission: true,
            affiliateEarning: true,
            platformRevenue: true,
            merchantRetention: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!merchant) {
      return { success: false, notRegistered: true };
    }

    const activeCampaigns = merchant.campaigns.filter((c: any) => c.status === "ACTIVE").length;
    const totalCampaigns = merchant.campaigns.length;

    let totalAttributedRevenue = 0;
    let totalCommissionsOwed = 0;
    let totalAffiliatePaid = 0;
    let totalMerchantRetention = 0;

    for (const attr of merchant.offlineAttributions) {
      if (attr.verificationStatus === "CONFIRMED") {
        totalAttributedRevenue += Number(attr.saleAmount);
        totalCommissionsOwed += Number(attr.totalCommission);
        totalAffiliatePaid += Number(attr.affiliateEarning);
        totalMerchantRetention += Number(attr.merchantRetention);
      }
    }

    // Include online orders if any
    const onlineOrders = await (prisma as any).paanMarketplaceOrder.findMany({
      where: { merchantId: merchant.id, orderStatus: { in: ["CONFIRMED", "DELIVERED"] } },
      select: { subtotal: true, commissionTotal: true, affiliateShare: true, merchantShare: true },
    });

    for (const ord of onlineOrders) {
      totalAttributedRevenue += Number(ord.subtotal);
      totalCommissionsOwed += Number(ord.commissionTotal);
      totalAffiliatePaid += Number(ord.affiliateShare);
      totalMerchantRetention += Number(ord.merchantShare);
    }

    // Active promoters count
    const totalPromoters = await (prisma as any).paanReferralLink.count({
      where: { campaign: { merchantId: merchant.id } },
    });

    return {
      success: true,
      stats: {
        totalCampaigns,
        activeCampaigns,
        totalPromoters,
        totalAttributedRevenue,
        totalCommissionsOwed,
        totalAffiliatePaid,
        totalMerchantRetention,
        totalSettled: Number(merchant.totalSettled || 0),
        outstandingBalance: Math.max(0, totalCommissionsOwed - Number(merchant.totalSettled || 0)),
      },
      merchant,
    };
  } catch (error: any) {
    console.error("getPaanMerchantStats Error:", error);
    return { success: false, error: error.message || "Failed to load stats" };
  }
}

// =========================================================================
// 2. CAMPAIGN MANAGEMENT
// =========================================================================

export async function createPaanCampaign(data: {
  title: string;
  description: string;
  category: string;
  type?: "OPEN" | "APPLICATION" | "PRIVATE" | "SELECTED";
  commissionType?: "PERCENTAGE" | "FIXED";
  totalCommissionRate: number;
  affiliateSharePct?: number; // e.g. 70
  platformSharePct?: number;  // e.g. 30
  startDate?: string;
  endDate?: string;
  termsConditions?: string;
  bannerUrl?: string;
  targetUrl?: string;
  productIds?: string[];
}) {
  try {
    const session = await getRequiredSession();
    const businessId = session.user.businessId;

    if (!businessId) {
      return { success: false, error: "Business ID required" };
    }

    let merchant = await (prisma as any).paanMerchantProfile.findUnique({
      where: { businessId },
    });

    if (!merchant) {
      return { success: false, error: "Please register your business as a PAAN merchant first." };
    }

    if (!data.title || !data.description || data.totalCommissionRate <= 0) {
      return { success: false, error: "Please provide campaign title, description, and valid commission rate." };
    }

    const affiliateShare = data.affiliateSharePct ?? 70.0;
    const platformShare = data.platformSharePct ?? 30.0;

    if (Math.round(affiliateShare + platformShare) !== 100) {
      return { success: false, error: "Affiliate share and Platform share must total 100%." };
    }

    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).substring(2, 7)}`;

    const campaign = await (prisma as any).paanCampaign.create({
      data: {
        merchantId: merchant.id,
        title: data.title.trim(),
        slug,
        description: data.description.trim(),
        category: data.category || "General",
        type: data.type || "OPEN",
        status: "ACTIVE",
        commissionType: data.commissionType || "PERCENTAGE",
        totalCommissionRate: data.totalCommissionRate,
        affiliateSharePct: affiliateShare,
        platformSharePct: platformShare,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        termsConditions: data.termsConditions?.trim() || null,
        bannerUrl: data.bannerUrl?.trim() || null,
        targetUrl: data.targetUrl?.trim() || `/marketplace?campaign=${slug}`,
        products: data.productIds && data.productIds.length > 0 ? {
          create: data.productIds.map(productId => ({ productId })),
        } : undefined,
      },
    });

    revalidatePath("/dashboard/paan/campaigns");
    revalidatePath("/marketplace");
    revalidatePath("/affiliate/campaigns");

    return { success: true, campaign, message: "Campaign published successfully to the PAAN Network!" };
  } catch (error: any) {
    console.error("createPaanCampaign Error:", error);
    return { success: false, error: error.message || "Failed to create campaign" };
  }
}

export async function getPaanMerchantCampaigns() {
  try {
    const session = await getRequiredSession();
    const businessId = session.user.businessId;

    if (!businessId) {
      return { success: false, campaigns: [] };
    }

    const merchant = await (prisma as any).paanMerchantProfile.findUnique({
      where: { businessId },
    });

    if (!merchant) {
      return { success: false, campaigns: [] };
    }

    const campaigns = await (prisma as any).paanCampaign.findMany({
      where: { merchantId: merchant.id },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, unitPrice: true, imageUrl: true },
            },
          },
        },
        _count: {
          select: {
            referralLinks: true,
            applications: true,
            offlineAttributions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, campaigns };
  } catch (error: any) {
    console.error("getPaanMerchantCampaigns Error:", error);
    return { success: false, error: error.message || "Failed to fetch campaigns" };
  }
}

export async function updatePaanCampaignStatus(campaignId: string, status: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED") {
  try {
    const session = await getRequiredSession();
    const businessId = session.user.businessId;

    const campaign = await (prisma as any).paanCampaign.findUnique({
      where: { id: campaignId },
      include: { merchant: true },
    });

    if (!campaign || campaign.merchant.businessId !== businessId) {
      return { success: false, error: "Campaign not found or unauthorized" };
    }

    await (prisma as any).paanCampaign.update({
      where: { id: campaignId },
      data: { status, updatedAt: new Date() },
    });

    revalidatePath("/dashboard/paan/campaigns");
    revalidatePath("/marketplace");
    return { success: true, message: `Campaign status updated to ${status}.` };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update campaign status" };
  }
}

export async function getPaanMerchantProducts() {
  try {
    const session = await getRequiredSession();
    const businessId = session.user.businessId;

    if (!businessId) return { success: false, products: [] };

    const products = await prisma.product.findMany({
      where: { businessId, deletedAt: null },
      select: {
        id: true,
        name: true,
        unitPrice: true,
        stockQuantity: true,
        imageUrl: true,
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.unitPrice),
        stock: Number(p.stockQuantity),
        imageUrl: p.imageUrl,
        category: p.category?.name || "General",
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load products" };
  }
}

// =========================================================================
// 3. PUBLIC MARKETPLACE & CAMPAIGN DISCOVERY
// =========================================================================

export async function getPublicPaanCampaigns(options?: {
  category?: string;
  search?: string;
  limit?: number;
}) {
  try {
    const where: any = {
      status: "ACTIVE",
    };

    if (options?.category && options.category !== "ALL") {
      where.category = options.category;
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { merchant: { business: { name: { contains: q, mode: "insensitive" } } } },
      ];
    }

    const campaigns = await (prisma as any).paanCampaign.findMany({
      where,
      include: {
        merchant: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                phone: true,
                whatsappPhone: true,
                address: true,
                city: true,
              },
            },
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unitPrice: true,
                imageUrl: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
    });

    return {
      success: true,
      campaigns: campaigns.map((c: any) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        category: c.category,
        type: c.type,
        commissionType: c.commissionType,
        totalCommissionRate: Number(c.totalCommissionRate),
        affiliateSharePct: Number(c.affiliateSharePct),
        platformSharePct: Number(c.platformSharePct),
        // Calculate the actual affiliate commission payout rate
        affiliateEffectiveRate: (Number(c.totalCommissionRate) * Number(c.affiliateSharePct)) / 100,
        bannerUrl: c.bannerUrl,
        merchantName: c.merchant.business.name,
        merchantLogo: c.merchant.business.logoUrl,
        merchantPhone: c.merchant.business.whatsappPhone || c.merchant.business.phone,
        merchantAddress: c.merchant.business.address,
        productsCount: c.products.length,
        products: c.products.map((p: any) => ({
          id: p.product.id,
          name: p.product.name,
          price: Number(p.product.unitPrice),
          imageUrl: p.product.imageUrl,
          description: p.product.description,
        })),
        createdAt: c.createdAt,
      })),
    };
  } catch (error: any) {
    console.error("getPublicPaanCampaigns Error:", error);
    return { success: false, campaigns: [], error: error.message };
  }
}

export async function getPaanCampaignBySlug(slug: string) {
  try {
    const campaign = await (prisma as any).paanCampaign.findUnique({
      where: { slug },
      include: {
        merchant: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                phone: true,
                whatsappPhone: true,
                address: true,
                city: true,
                email: true,
              },
            },
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unitPrice: true,
                imageUrl: true,
                description: true,
                stockQuantity: true,
              },
            },
          },
        },
        marketingAssets: true,
      },
    });

    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }

    return { success: true, campaign };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =========================================================================
// 4. AFFILIATE CAMPAIGN PARTICIPATION & LINK GENERATION
// =========================================================================

export async function joinOrApplyPaanCampaign(campaignId: string, notes?: string) {
  try {
    const session = await getRequiredSession();
    
    // Resolve affiliate profile
    const affiliate = await prisma.affiliate.findFirst({
      where: { userId: session.user.id },
    });

    if (!affiliate) {
      return { success: false, error: "Please complete your affiliate registration first." };
    }

    if (affiliate.status !== "APPROVED") {
      return { success: false, error: "Your affiliate account is currently pending administrator approval." };
    }

    const campaign = await (prisma as any).paanCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.status !== "ACTIVE") {
      return { success: false, error: "Campaign is currently not accepting promoters." };
    }

    // Check if already applied or joined
    const existingLink = await (prisma as any).paanReferralLink.findUnique({
      where: {
        campaignId_affiliateId: {
          campaignId,
          affiliateId: affiliate.id,
        },
      },
    });

    if (existingLink) {
      return {
        success: true,
        alreadyJoined: true,
        trackingCode: existingLink.trackingCode,
        message: "You are already registered for this campaign.",
      };
    }

    if (campaign.type === "APPLICATION") {
      // Create pending application
      const app = await (prisma as any).paanCampaignApplication.upsert({
        where: {
          campaignId_affiliateId: {
            campaignId,
            affiliateId: affiliate.id,
          },
        },
        update: { notes: notes || null },
        create: {
          campaignId,
          affiliateId: affiliate.id,
          status: "PENDING",
          notes: notes || null,
        },
      });

      return {
        success: true,
        requiresApproval: true,
        message: "Application submitted! The merchant will review your profile shortly.",
      };
    }

    // For OPEN campaigns, immediately generate tracking code and link
    const trackingCode = generateTrackingCode("PAAN");

    const link = await (prisma as any).paanReferralLink.create({
      data: {
        campaignId,
        affiliateId: affiliate.id,
        trackingCode,
        isActive: true,
      },
    });

    revalidatePath("/affiliate/campaigns");
    revalidatePath("/affiliate/links");

    return {
      success: true,
      trackingCode: link.trackingCode,
      message: "Success! You are now an active promoter for this campaign. Your unique links are ready.",
    };
  } catch (error: any) {
    console.error("joinOrApplyPaanCampaign Error:", error);
    return { success: false, error: error.message || "Failed to join campaign" };
  }
}

export async function getPaanAffiliateCampaigns() {
  try {
    const session = await getRequiredSession();
    const affiliate = await prisma.affiliate.findFirst({
      where: { userId: session.user.id },
    });

    if (!affiliate) return { success: false, links: [], applications: [] };

    const [links, applications] = await Promise.all([
      (prisma as any).paanReferralLink.findMany({
        where: { affiliateId: affiliate.id },
        include: {
          campaign: {
            include: {
              merchant: {
                include: {
                  business: { select: { name: true, logoUrl: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      (prisma as any).paanCampaignApplication.findMany({
        where: { affiliateId: affiliate.id },
        include: {
          campaign: {
            include: {
              merchant: {
                include: {
                  business: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      }),
    ]);

    return { success: true, links, applications, affiliateCode: affiliate.affiliateCode };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =========================================================================
// 5. SIERRA LEONE OFFLINE PHYSICAL SALES ATTRIBUTION MODULE
// =========================================================================

/**
 * Fast cashier lookup: verifies referral code entered at POS/counter
 */
export async function verifyPaanReferralCode(code: string) {
  try {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: "Please enter a code" };
    }

    // 1. Try finding by campaign-specific referral link tracking code (e.g. PAAN-ABC123)
    let link = await (prisma as any).paanReferralLink.findUnique({
      where: { trackingCode: cleanCode },
      include: {
        affiliate: {
          select: { id: true, affiliateCode: true, fullName: true, phone: true, paanCategory: true, isAcademyGraduate: true },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            commissionType: true,
            totalCommissionRate: true,
            affiliateSharePct: true,
            platformSharePct: true,
            merchantId: true,
          },
        },
      },
    });

    if (link) {
      return {
        success: true,
        matchType: "CAMPAIGN_LINK",
        affiliate: link.affiliate,
        campaign: link.campaign,
        trackingCode: link.trackingCode,
      };
    }

    // 2. Try finding by general Affiliate ID (e.g. PA-AFF-00001)
    const affiliate = await prisma.affiliate.findUnique({
      where: { affiliateCode: cleanCode },
      select: { id: true, affiliateCode: true, fullName: true, phone: true, status: true, paanCategory: true, isAcademyGraduate: true },
    });

    if (affiliate && affiliate.status === "APPROVED") {
      return {
        success: true,
        matchType: "GENERAL_AFFILIATE",
        affiliate,
        trackingCode: affiliate.affiliateCode,
      };
    }

    return { success: false, error: "Invalid referral code. No active affiliate found." };
  } catch (error: any) {
    return { success: false, error: error.message || "Lookup error" };
  }
}

/**
 * Cashier or Merchant records a walk-in physical sale attributed to an affiliate
 */
export async function recordPaanOfflineSale(data: {
  referralCode: string;
  campaignId?: string;
  receiptNumber?: string;
  customerName?: string;
  customerPhone?: string;
  saleAmount: number;
  notes?: string;
}) {
  try {
    const session = await getRequiredSession();
    const businessId = session.user.businessId;

    if (!businessId) {
      return { success: false, error: "Merchant authentication required" };
    }

    const merchant = await (prisma as any).paanMerchantProfile.findUnique({
      where: { businessId },
    });

    if (!merchant || merchant.status !== "APPROVED") {
      return { success: false, error: "Active merchant profile required" };
    }

    if (!data.saleAmount || data.saleAmount <= 0) {
      return { success: false, error: "Valid sale amount is required" };
    }

    // Verify the code
    const verification = await verifyPaanReferralCode(data.referralCode);
    if (!verification.success || !verification.affiliate) {
      return { success: false, error: verification.error || "Invalid referral code" };
    }

    const affiliateId = verification.affiliate.id;

    // Resolve campaign
    let campaign: any = null;
    let totalCommRate = 10.0;
    let isPercentage = true;
    let affiliateSharePct = 70.0;
    let platformSharePct = 30.0;

    if (verification.campaign) {
      campaign = verification.campaign;
      totalCommRate = Number(campaign.totalCommissionRate);
      isPercentage = campaign.commissionType === "PERCENTAGE";
      affiliateSharePct = Number(campaign.affiliateSharePct);
      platformSharePct = Number(campaign.platformSharePct);
    } else if (data.campaignId) {
      campaign = await (prisma as any).paanCampaign.findUnique({
        where: { id: data.campaignId },
      });
      if (campaign) {
        totalCommRate = Number(campaign.totalCommissionRate);
        isPercentage = campaign.commissionType === "PERCENTAGE";
        affiliateSharePct = Number(campaign.affiliateSharePct);
        platformSharePct = Number(campaign.platformSharePct);
      }
    }

    // Commission Calculations
    const saleAmount = Number(data.saleAmount);
    let totalCommission = 0;
    if (isPercentage) {
      totalCommission = Math.round(((saleAmount * totalCommRate) / 100) * 100) / 100;
    } else {
      totalCommission = Math.min(totalCommRate, saleAmount);
    }

    const affiliateEarning = Math.round(((totalCommission * affiliateSharePct) / 100) * 100) / 100;
    const platformRevenue = Math.round((totalCommission - affiliateEarning) * 100) / 100;
    const merchantRetention = Math.round((saleAmount - totalCommission) * 100) / 100;

    const attributionRef = generateOfflineRef();
    const ledgerTxRef = generateLedgerRef();

    // Atomic execution with financial ledger entry
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Offline Attribution record
      const attribution = await tx.paanOfflineAttribution.create({
        data: {
          attributionRef,
          merchantId: merchant.id,
          campaignId: campaign?.id || null,
          affiliateId,
          receiptNumber: data.receiptNumber?.trim() || null,
          customerName: data.customerName?.trim() || null,
          customerPhone: data.customerPhone?.trim() || null,
          saleAmount,
          totalCommission,
          affiliateEarning,
          platformRevenue,
          merchantRetention,
          currency: "NLe",
          verificationStatus: "CONFIRMED",
          verifiedBy: session.user.id,
          verifiedAt: new Date(),
          notes: data.notes?.trim() || null,
        },
      });

      // 2. Update Affiliate Wallet (Pending Balance until verified or auto-cleared)
      let wallet = await tx.paanAffiliateWallet.findUnique({
        where: { affiliateId },
      });

      const currentPending = wallet ? Number(wallet.pendingBalance) : 0;
      const currentEarned = wallet ? Number(wallet.totalEarned) : 0;

      if (!wallet) {
        wallet = await tx.paanAffiliateWallet.create({
          data: {
            affiliateId,
            pendingBalance: affiliateEarning,
            availableBalance: 0,
            totalWithdrawn: 0,
            totalEarned: affiliateEarning,
            currency: "NLe",
          },
        });
      } else {
        wallet = await tx.paanAffiliateWallet.update({
          where: { affiliateId },
          data: {
            pendingBalance: currentPending + affiliateEarning,
            totalEarned: currentEarned + affiliateEarning,
          },
        });
      }

      // 3. Write Immutable Double-Entry Ledger Entry
      await tx.paanFinancialLedger.create({
        data: {
          transactionRef: ledgerTxRef,
          entryType: "COMMISSION_ACCRUAL",
          affiliateId,
          merchantId: merchant.id,
          adminUserId: session.user.id,
          amount: affiliateEarning,
          currency: "NLe",
          direction: "CREDIT",
          balanceBefore: currentPending,
          balanceAfter: currentPending + affiliateEarning,
          referenceType: "OFFLINE_SALE",
          referenceId: attribution.id,
          description: `Offline sale verified at physical counter. Receipt: ${data.receiptNumber || "N/A"}. Total sale: NLe ${saleAmount}, Split: Affiliate NLe ${affiliateEarning}, ProTech NLe ${platformRevenue}.`,
        },
      });

      // 4. Update Merchant Totals
      await tx.paanMerchantProfile.update({
        where: { id: merchant.id },
        data: {
          totalSalesAttributed: { increment: saleAmount },
          totalCommissionsOwed: { increment: totalCommission },
        },
      });

      // 5. Update Campaign Conversions
      if (campaign?.id) {
        await tx.paanCampaign.update({
          where: { id: campaign.id },
          data: {
            totalConversions: { increment: 1 },
            totalRevenueGenerated: { increment: saleAmount },
          },
        });
      }

      return attribution;
    });

    revalidatePath("/dashboard/paan");
    revalidatePath("/dashboard/paan/offline");
    revalidatePath("/affiliate/dashboard");

    return {
      success: true,
      attributionRef: result.attributionRef,
      affiliateName: verification.affiliate.fullName,
      saleAmount,
      totalCommission,
      affiliateEarning,
      platformRevenue,
      merchantRetention,
      message: `Physical sale of NLe ${saleAmount} successfully attributed to ${verification.affiliate.fullName}! Ledger entry recorded.`,
    };
  } catch (error: any) {
    console.error("recordPaanOfflineSale Error:", error);
    return { success: false, error: error.message || "Failed to record offline sale" };
  }
}

export async function getPaanMerchantOfflineAttributions(options?: { limit?: number }) {
  try {
    const session = await getRequiredSession();
    const businessId = session.user.businessId;

    if (!businessId) return { success: false, attributions: [] };

    const merchant = await (prisma as any).paanMerchantProfile.findUnique({
      where: { businessId },
    });

    if (!merchant) return { success: false, attributions: [] };

    const attributions = await (prisma as any).paanOfflineAttribution.findMany({
      where: { merchantId: merchant.id },
      include: {
        affiliate: {
          select: { fullName: true, affiliateCode: true, phone: true },
        },
        campaign: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
    });

    return { success: true, attributions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =========================================================================
// 6. FINANCIAL LEDGER & WALLET WORKFLOWS
// =========================================================================

export async function getPaanAffiliateWallet() {
  try {
    const session = await getRequiredSession();
    const affiliate = await prisma.affiliate.findFirst({
      where: { userId: session.user.id },
    });

    if (!affiliate) return { success: false, wallet: null, ledger: [] };

    let wallet = await (prisma as any).paanAffiliateWallet.findUnique({
      where: { affiliateId: affiliate.id },
    });

    if (!wallet) {
      wallet = await (prisma as any).paanAffiliateWallet.create({
        data: {
          affiliateId: affiliate.id,
          pendingBalance: 0,
          availableBalance: 0,
          totalWithdrawn: 0,
          totalEarned: 0,
        },
      });
    }

    const ledger = await (prisma as any).paanFinancialLedger.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      success: true,
      wallet: {
        pendingBalance: Number(wallet.pendingBalance),
        availableBalance: Number(wallet.availableBalance),
        totalWithdrawn: Number(wallet.totalWithdrawn),
        totalEarned: Number(wallet.totalEarned),
        currency: wallet.currency,
      },
      ledger,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Super Admin or Merchant approves pending commission into available balance
 */
export async function approvePaanCommissionAccrual(attributionId: string) {
  try {
    const session = await getRequiredSuperAdmin();

    const attribution = await (prisma as any).paanOfflineAttribution.findUnique({
      where: { id: attributionId },
      include: { affiliate: true, merchant: true },
    });

    if (!attribution || attribution.verificationStatus !== "CONFIRMED") {
      return { success: false, error: "Attribution not found or not in confirmed state." };
    }

    const affiliateId = attribution.affiliateId;
    const amount = Number(attribution.affiliateEarning);

    await prisma.$transaction(async (tx: any) => {
      const wallet = await tx.paanAffiliateWallet.findUnique({
        where: { affiliateId },
      });

      const currentPending = wallet ? Number(wallet.pendingBalance) : 0;
      const currentAvailable = wallet ? Number(wallet.availableBalance) : 0;

      // Move from pending to available
      await tx.paanAffiliateWallet.update({
        where: { affiliateId },
        data: {
          pendingBalance: Math.max(0, currentPending - amount),
          availableBalance: currentAvailable + amount,
        },
      });

      // Write Ledger Transaction
      await tx.paanFinancialLedger.create({
        data: {
          transactionRef: generateLedgerRef(),
          entryType: "COMMISSION_APPROVAL",
          affiliateId,
          merchantId: attribution.merchantId,
          adminUserId: session.user.id,
          amount,
          currency: "NLe",
          direction: "CREDIT",
          balanceBefore: currentAvailable,
          balanceAfter: currentAvailable + amount,
          referenceType: "OFFLINE_SALE",
          referenceId: attribution.id,
          description: `Commission approved by Super Admin. Moved NLe ${amount} from Pending to Available balance for affiliate ${attribution.affiliate.affiliateCode}.`,
        },
      });
    });

    revalidatePath("/super-admin/paan");
    revalidatePath("/affiliate/wallet");

    return { success: true, message: `Commission of NLe ${amount} approved into available balance!` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =========================================================================
// 7. PROTECH ONLINE ACADEMY LEARNING CENTRE
// =========================================================================

export async function getPaanAcademyCurriculum() {
  try {
    const session = await getRequiredSession();
    const affiliate = await prisma.affiliate.findFirst({
      where: { userId: session.user.id },
    });

    // Ensure lessons are seeded if empty
    let lessons = await (prisma as any).paanAcademyLesson.findMany({
      orderBy: [{ lessonNumber: "asc" }, { orderIndex: "asc" }],
      include: {
        progress: affiliate ? { where: { affiliateId: affiliate.id } } : false,
      },
    });

    if (lessons.length === 0) {
      await seedPaanAcademyCurriculum();
      lessons = await (prisma as any).paanAcademyLesson.findMany({
        orderBy: [{ lessonNumber: "asc" }, { orderIndex: "asc" }],
        include: {
          progress: affiliate ? { where: { affiliateId: affiliate.id } } : false,
        },
      });
    }

    const totalLessons = lessons.length;
    const completedCount = lessons.filter((l: any) => l.progress && l.progress.length > 0 && l.progress[0].completed).length;
    const completionPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      success: true,
      lessons: lessons.map((l: any) => ({
        id: l.id,
        moduleTitle: l.moduleTitle,
        lessonNumber: l.lessonNumber,
        title: l.title,
        slug: l.slug,
        content: l.content,
        videoUrl: l.videoUrl,
        keyTakeaways: l.keyTakeaways,
        isCompleted: l.progress && l.progress.length > 0 && l.progress[0].completed,
      })),
      stats: {
        totalLessons,
        completedCount,
        completionPercentage,
        isCertified: completionPercentage === 100,
      },
    };
  } catch (error: any) {
    console.error("getPaanAcademyCurriculum Error:", error);
    return { success: false, lessons: [], error: error.message };
  }
}

export async function completePaanAcademyLesson(lessonId: string) {
  try {
    const session = await getRequiredSession();
    const affiliate = await prisma.affiliate.findFirst({
      where: { userId: session.user.id },
    });

    if (!affiliate) {
      return { success: false, error: "Affiliate profile required" };
    }

    await (prisma as any).paanAcademyProgress.upsert({
      where: {
        affiliateId_lessonId: {
          affiliateId: affiliate.id,
          lessonId,
        },
      },
      update: { completed: true, completedAt: new Date() },
      create: {
        affiliateId: affiliate.id,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    // Check if all lessons are now complete
    const totalLessons = await (prisma as any).paanAcademyLesson.count();
    const completedCount = await (prisma as any).paanAcademyProgress.count({
      where: { affiliateId: affiliate.id, completed: true },
    });

    if (completedCount >= totalLessons) {
      await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: {
          isAcademyGraduate: true,
          paanCategory: "ACADEMY_STUDENT" as any,
          academyCohort: "Certified Graduate - 2026",
        },
      });
    }

    revalidatePath("/affiliate/academy");
    return { success: true, allComplete: completedCount >= totalLessons };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function seedPaanAcademyCurriculum() {
  const existing = await (prisma as any).paanAcademyLesson.count();
  if (existing > 0) return;

  const curriculum = [
    {
      moduleTitle: "Module 1: Foundations of the PAAN Network",
      lessonNumber: 1,
      title: "Understanding the Sierra Leone Multi-Merchant Opportunity",
      slug: "paan-ecosystem-overview",
      content: `Welcome to the **ProTech Assist Affiliate Network (PAAN)**!

In Sierra Leone, thousands of businesses — from supermarkets along Wilkinson Road to electronics shops on Rawdon Street, pharmacy chains in Bo, and fashion boutiques in Makeni — want more customers, but cannot afford expensive traditional billboard or TV advertising.

At the same time, young entrepreneurs, students, and digital creators have high-reach social networks (WhatsApp, TikTok, Facebook) but lack physical products to sell.

**PAAN connects these two worlds.** As an accredited PAAN marketer, you never need to buy inventory, rent a shop, or manage deliveries. You simply:
1. Discover high-converting merchant offers on PAAN.
2. Share your trackable digital links or provide your unique **Offline Referral Code**.
3. When customers buy online or walk into the shop, you earn an agreed cash commission split directly to your Orange Money or Afrimoney wallet!`,
      keyTakeaways: [
        "PAAN is Sierra Leone's central business-to-marketer bridge.",
        "Zero capital or inventory required to start earning.",
        "Earn from both online e-commerce orders and physical walk-in store sales.",
      ],
      orderIndex: 1,
    },
    {
      moduleTitle: "Module 2: WhatsApp Selling Mastery",
      lessonNumber: 2,
      title: "Turning Your WhatsApp Status & Groups into Daily Income",
      slug: "whatsapp-marketing-playbook",
      content: `WhatsApp is the number-one commercial communication tool across Sierra Leone. Here is the verified 4-step framework used by top earners:

### 1. The Curiosity Hook on Status
Never just post a generic flyer with no context. Instead, post a clear video or crisp photo followed by a question:
> *"Who has been looking for genuine original Samsung chargers in Freetown with warranty? A shop in town is doing a 15% discount today! Drop a message if you want the location and promo code."*

### 2. Direct DM Consultative Selling
When someone replies, don't just dump a link. Act as their shopping advisor:
> *"Hello bro, the shop is located at Garrison Street. If you go yourself, tell the cashier code **PAAN-ELEC-01** so they apply your discount and register your 1-year guarantee. Or I can send you the order link right here."*

### 3. Voice Notes Build Instant Trust
In Sierra Leone, a warm 20-second Krio voice note converts 5x higher than a long paragraph of text. Explain the merchant's legitimacy and return policy.`,
      keyTakeaways: [
        "Curiosity questions on WhatsApp Status outperform static flyers.",
        "Use friendly consultative DM conversations.",
        "Short Krio voice notes build high trust and credibility.",
      ],
      orderIndex: 2,
    },
    {
      moduleTitle: "Module 3: Physical Walk-in Sales (Offline Attribution)",
      lessonNumber: 3,
      title: "How to Guarantee Commission on In-Store Walk-In Purchases",
      slug: "offline-walkin-attribution",
      content: `Many customers in Sierra Leone prefer to touch and inspect items before paying cash in physical shops.

### How the PAAN Offline Engine Protects You:
1. Every PAAN affiliate has a permanent **Offline Referral Code** (e.g. \`PA-AFF-00001\`).
2. When speaking with a prospect, instruct them:
   > *"When you reach the shop, give the cashier my discount code: **PA-AFF-00001**. It registers your receipt and guarantees you get customer support."*
3. The merchant/cashier enters your code in their PAAN Terminal at checkout.
4. The system validates your name instantly, records the receipt number, and credits your wallet balance automatically!
5. Always follow up with your customer after their visit: *"Hope you enjoyed your experience at the shop today!"*`,
      keyTakeaways: [
        "Your Offline Referral Code works at any participating physical store.",
        "Cashiers enter your code during checkout to record the attribution.",
        "Double-check that the customer presents your code to the merchant.",
      ],
      orderIndex: 3,
    },
    {
      moduleTitle: "Module 4: Professional Ethics & Anti-Fraud Rules",
      lessonNumber: 4,
      title: "PAAN Code of Conduct & Commission Protection",
      slug: "ethics-anti-fraud-policy",
      content: `ProTech Assist SL Limited maintains strict standards to protect merchants, affiliates, and customers:

- **No False Claims**: Never misrepresent product specifications, fake warranties, or claim affiliations the merchant hasn't authorized.
- **No Self-Referral Exploitation**: You cannot create dummy accounts to buy products at personal commission discounts unless explicitly permitted.
- **Respect Customer Privacy**: Never publish customer phone numbers or transaction receipts publicly.
- **Prompt Dispute Notification**: If a physical shop cashier fails to record your code, submit the receipt number via PAAN Support within 48 hours for administrator reconciliation.`,
      keyTakeaways: [
        "High ethical standards ensure long-term earning relationships with top merchants.",
        "Zero tolerance for fraudulent clicks or fake orders.",
        "Use the support dispute channel for any uncredited walk-in purchases.",
      ],
      orderIndex: 4,
    },
  ];

  for (const item of curriculum) {
    await (prisma as any).paanAcademyLesson.create({ data: item });
  }
}

// =========================================================================
// 8. MARKETING ASSET HUB
// =========================================================================

export async function uploadPaanMarketingAsset(data: {
  campaignId?: string;
  title: string;
  assetType: "BANNER" | "PHOTO" | "VIDEO" | "CAPTION" | "SCRIPT";
  fileUrl?: string;
  textContent?: string;
}) {
  try {
    const session = await getRequiredSession();
    const businessId = session.user.businessId;

    if (!businessId) return { success: false, error: "Merchant required" };

    const merchant = await (prisma as any).paanMerchantProfile.findUnique({
      where: { businessId },
    });

    if (!merchant) return { success: false, error: "Merchant profile required" };

    const asset = await (prisma as any).paanMarketingAsset.create({
      data: {
        merchantId: merchant.id,
        campaignId: data.campaignId || null,
        title: data.title.trim(),
        assetType: data.assetType,
        fileUrl: data.fileUrl?.trim() || null,
        textContent: data.textContent?.trim() || null,
      },
    });

    revalidatePath("/dashboard/paan/marketing");
    revalidatePath("/affiliate/marketing");
    return { success: true, asset, message: "Marketing material uploaded for affiliates!" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPaanCampaignAssets(campaignId?: string) {
  try {
    const where: any = {};
    if (campaignId) where.campaignId = campaignId;

    const assets = await (prisma as any).paanMarketingAsset.findMany({
      where,
      include: {
        merchant: {
          include: { business: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, assets };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =========================================================================
// 9. SUPER ADMIN PAAN NETWORK OVERVIEW & SETTLEMENTS
// =========================================================================

export async function getSuperAdminPaanOverview() {
  try {
    await getRequiredSuperAdmin();

    const [
      totalMerchants,
      pendingMerchants,
      totalCampaigns,
      activeCampaigns,
      totalAffiliates,
      offlineAttributions,
      ledgerEntries,
      pendingPayouts,
    ] = await Promise.all([
      (prisma as any).paanMerchantProfile.count(),
      (prisma as any).paanMerchantProfile.count({ where: { status: "PENDING" } }),
      (prisma as any).paanCampaign.count(),
      (prisma as any).paanCampaign.count({ where: { status: "ACTIVE" } }),
      prisma.affiliate.count(),
      (prisma as any).paanOfflineAttribution.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          merchant: { include: { business: { select: { name: true } } } },
          affiliate: { select: { fullName: true, affiliateCode: true } },
          campaign: { select: { title: true } },
        },
      }),
      (prisma as any).paanFinancialLedger.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          affiliate: { select: { fullName: true, affiliateCode: true } },
          merchant: { include: { business: { select: { name: true } } } },
        },
      }),
      prisma.payout.findMany({
        where: { status: "PENDING" },
        include: {
          affiliate: { select: { fullName: true, affiliateCode: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Financial aggregates
    let totalGMV = 0;
    let totalAffiliateCommissions = 0;
    let totalPlatformRevenue = 0;

    for (const attr of offlineAttributions) {
      if (attr.verificationStatus === "CONFIRMED") {
        totalGMV += Number(attr.saleAmount);
        totalAffiliateCommissions += Number(attr.affiliateEarning);
        totalPlatformRevenue += Number(attr.platformRevenue);
      }
    }

    return {
      success: true,
      stats: {
        totalMerchants,
        pendingMerchants,
        totalCampaigns,
        activeCampaigns,
        totalAffiliates,
        totalGMV,
        totalAffiliateCommissions,
        totalPlatformRevenue,
        pendingPayoutsCount: pendingPayouts.length,
      },
      offlineAttributions,
      ledgerEntries,
      pendingPayouts,
    };
  } catch (error: any) {
    console.error("getSuperAdminPaanOverview Error:", error);
    return { success: false, error: error.message };
  }
}
