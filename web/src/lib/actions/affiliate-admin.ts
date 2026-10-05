"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  AffiliateStatus,
  CommissionStatus,
  PayoutStatus,
  CommissionType,
  PayoutMethod,
  AttributionModel,
} from "@prisma/client";

/**
 * Super Admin check helper
 */
async function checkSuperAdmin() {
  const session = await auth();
  const isSuper =
    session?.user?.role === "SUPERADMIN" ||
    (session?.user as any)?.originalRole === "SUPERADMIN";
  if (!isSuper) {
    throw new Error("Unauthorized: Super Admin access required");
  }
  return session;
}

/**
 * Super Admin Affiliate Suite Overview Stats
 */
export async function getSuperAdminAffiliateStats() {
  await checkSuperAdmin();

  const [
    totalAffiliates,
    pendingAffiliates,
    approvedAffiliates,
    suspendedAffiliates,
    totalClicks,
    totalConversions,
    pendingPayouts,
    commissions,
    rulesCount,
  ] = await Promise.all([
    prisma.affiliate.count(),
    prisma.affiliate.count({ where: { status: AffiliateStatus.PENDING } }),
    prisma.affiliate.count({ where: { status: AffiliateStatus.APPROVED } }),
    prisma.affiliate.count({ where: { status: AffiliateStatus.SUSPENDED } }),
    prisma.affiliateClick.count(),
    prisma.affiliateConversion.count(),
    prisma.payout.count({ where: { status: PayoutStatus.PENDING } }),
    prisma.commission.findMany({
      select: { amount: true, status: true },
    }),
    prisma.commissionRule.count({ where: { isActive: true } }),
  ]);

  let totalPendingCommission = 0;
  let totalApprovedCommission = 0;
  let totalPaidCommission = 0;

  for (const c of commissions) {
    const amt = Number(c.amount);
    if (c.status === CommissionStatus.PENDING) totalPendingCommission += amt;
    else if (c.status === CommissionStatus.APPROVED) totalApprovedCommission += amt;
    else if (c.status === CommissionStatus.PAID) totalPaidCommission += amt;
  }

  return {
    success: true,
    stats: {
      totalAffiliates,
      pendingAffiliates,
      approvedAffiliates,
      suspendedAffiliates,
      totalClicks,
      totalConversions,
      pendingPayouts,
      totalPendingCommission,
      totalApprovedCommission,
      totalPaidCommission,
      totalCommissionGenerated: totalPendingCommission + totalApprovedCommission + totalPaidCommission,
      rulesCount,
    },
  };
}

/**
 * Get paginated affiliates list for Super Admin
 */
export async function getAdminAffiliatesList(options?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await checkSuperAdmin();

  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (options?.status && options.status !== "ALL") {
    whereClause.status = options.status as AffiliateStatus;
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.trim();
    whereClause.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { affiliateCode: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const [totalCount, affiliates] = await Promise.all([
    prisma.affiliate.count({ where: whereClause }),
    prisma.affiliate.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            clicks: true,
            conversions: true,
            commissions: true,
            payouts: true,
          },
        },
        commissions: {
          select: { amount: true, status: true },
        },
      },
    }),
  ]);

  return {
    success: true,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    affiliates: affiliates.map((a) => {
      let totalEarned = 0;
      let pendingEarned = 0;
      for (const c of a.commissions) {
        const amt = Number(c.amount);
        if (c.status === "PAID" || c.status === "APPROVED") totalEarned += amt;
        if (c.status === "PENDING") pendingEarned += amt;
      }

      return {
        id: a.id,
        affiliateCode: a.affiliateCode,
        fullName: a.fullName,
        email: a.email,
        phone: a.phone,
        whatsappPhone: a.whatsappPhone,
        country: a.country,
        city: a.city,
        status: a.status,
        experienceLevel: a.experienceLevel,
        marketingChannels: a.marketingChannels,
        payoutMethod: a.payoutMethod,
        clicksCount: a._count.clicks,
        conversionsCount: a._count.conversions,
        totalEarned,
        pendingEarned,
        createdAt: a.createdAt,
        approvedAt: a.approvedAt,
      };
    }),
  };
}

/**
 * Get individual affiliate profile details
 */
export async function getAdminAffiliateDetails(affiliateId: string) {
  await checkSuperAdmin();

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    include: {
      user: {
        select: { id: true, name: true, email: true, status: true, lastLoginAt: true },
      },
      links: {
        orderBy: { createdAt: "desc" },
      },
      conversions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { commission: true },
      },
      commissions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      payouts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!affiliate) {
    return { success: false, error: "Affiliate not found" };
  }

  return { success: true, affiliate };
}

/**
 * Update affiliate status (Approve, Reject, Suspend, Reactivate)
 */
export async function updateAdminAffiliateStatus(
  affiliateId: string,
  status: AffiliateStatus,
  rejectionReason?: string
) {
  const session = await checkSuperAdmin();

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
  });
  if (!affiliate) {
    return { success: false, error: "Affiliate not found" };
  }

  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === AffiliateStatus.APPROVED) {
    updateData.approvedAt = new Date();
    updateData.approvedBy = session.user.id;
    updateData.rejectionReason = null;
  } else if (status === AffiliateStatus.REJECTED) {
    updateData.rejectionReason = rejectionReason || "Application did not meet requirements.";
  }

  await prisma.affiliate.update({
    where: { id: affiliateId },
    data: updateData,
  });

  revalidatePath("/super-admin/affiliates");
  return {
    success: true,
    message: `Affiliate ${affiliate.affiliateCode} status changed to ${status}.`,
  };
}

/**
 * Update affiliate custom commission override rate
 */
export async function updateAdminAffiliateRateOverride(
  affiliateId: string,
  rateOverride: number | null
) {
  await checkSuperAdmin();

  await prisma.affiliate.update({
    where: { id: affiliateId },
    data: {
      commissionRateOverride: rateOverride !== null && rateOverride > 0 ? rateOverride : null,
    },
  });

  revalidatePath(`/super-admin/affiliates/${affiliateId}`);
  return { success: true, message: "Affiliate commission override updated." };
}

/**
 * Commission Rules: Get all rules
 */
export async function getCommissionRules() {
  await checkSuperAdmin();

  let rules = await prisma.commissionRule.findMany({
    orderBy: { createdAt: "asc" },
  });

  // If no rules exist, initialize standard ProTech catalog defaults
  if (rules.length === 0) {
    const defaults = [
      {
        productSlug: "default",
        productName: "Default Platform Commission",
        category: "GENERAL",
        type: CommissionType.PERCENTAGE,
        rate: 10,
        description: "Default fallback commission rate for any qualifying transaction.",
      },
      {
        productSlug: "enterprise-os",
        productName: "Enterprise OS Subscription",
        category: "SOFTWARE",
        type: CommissionType.PERCENTAGE,
        rate: 10,
        description: "Commission on ProTech Enterprise OS subscription plans.",
      },
      {
        productSlug: "software-engineering",
        productName: "Software Engineering & Full-Stack Training",
        category: "TRAINING",
        type: CommissionType.PERCENTAGE,
        rate: 15,
        description: "Intensive 6-month full-stack development cohort.",
      },
      {
        productSlug: "ai-masterclass",
        productName: "ProTech AI Masterclass",
        category: "TRAINING",
        type: CommissionType.PERCENTAGE,
        rate: 15,
        description: "Artificial Intelligence, LLM & Prompt Engineering Masterclass.",
      },
      {
        productSlug: "website-dev",
        productName: "Custom Website & Portal Development",
        category: "SERVICES",
        type: CommissionType.PERCENTAGE,
        rate: 8,
        description: "Bespoke corporate website or web application client project.",
      },
      {
        productSlug: "mobile-app-dev",
        productName: "Mobile Application Development",
        category: "SERVICES",
        type: CommissionType.PERCENTAGE,
        rate: 8,
        description: "iOS and Android native or hybrid app build.",
      },
      {
        productSlug: "ms-office-training",
        productName: "Microsoft Office Suite Training",
        category: "TRAINING",
        type: CommissionType.FIXED,
        rate: 100,
        description: "Fixed NLe 100 bonus per student enrolled.",
      },
    ];

    for (const d of defaults) {
      await prisma.commissionRule.create({ data: d });
    }

    rules = await prisma.commissionRule.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  return { success: true, rules };
}

/**
 * Save / Update a Commission Rule
 */
export async function saveCommissionRule(data: {
  id?: string;
  productSlug: string;
  productName: string;
  category?: string;
  type: CommissionType;
  rate: number;
  currency?: string;
  isActive: boolean;
  description?: string;
}) {
  await checkSuperAdmin();

  if (!data.productSlug || !data.productName || data.rate < 0) {
    return { success: false, error: "Invalid rule parameters." };
  }

  const slug = data.productSlug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

  if (data.id) {
    await prisma.commissionRule.update({
      where: { id: data.id },
      data: {
        productSlug: slug,
        productName: data.productName.trim(),
        category: data.category?.trim() || null,
        type: data.type,
        rate: data.rate,
        currency: data.currency || "NLe",
        isActive: data.isActive,
        description: data.description?.trim() || null,
      },
    });
  } else {
    // Check if slug exists
    const existing = await prisma.commissionRule.findUnique({
      where: { productSlug: slug },
    });
    if (existing) {
      return { success: false, error: `A rule with identifier "${slug}" already exists.` };
    }

    await prisma.commissionRule.create({
      data: {
        productSlug: slug,
        productName: data.productName.trim(),
        category: data.category?.trim() || null,
        type: data.type,
        rate: data.rate,
        currency: data.currency || "NLe",
        isActive: data.isActive,
        description: data.description?.trim() || null,
      },
    });
  }

  revalidatePath("/super-admin/affiliates/rules");
  return { success: true, message: "Commission rule saved successfully." };
}

/**
 * Delete a Commission Rule
 */
export async function deleteCommissionRule(ruleId: string) {
  await checkSuperAdmin();

  const rule = await prisma.commissionRule.findUnique({ where: { id: ruleId } });
  if (!rule) {
    return { success: false, error: "Rule not found." };
  }

  if (rule.productSlug === "default") {
    return { success: false, error: "The default platform rule cannot be deleted." };
  }

  await prisma.commissionRule.delete({ where: { id: ruleId } });
  revalidatePath("/super-admin/affiliates/rules");
  return { success: true, message: "Rule deleted successfully." };
}

/**
 * Super Admin Commissions Ledger
 */
export async function getAdminCommissions(options?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await checkSuperAdmin();

  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (options?.status && options.status !== "ALL") {
    whereClause.status = options.status as CommissionStatus;
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.trim();
    whereClause.OR = [
      { affiliate: { fullName: { contains: q, mode: "insensitive" } } },
      { affiliate: { affiliateCode: { contains: q, mode: "insensitive" } } },
      { conversion: { orderId: { contains: q, mode: "insensitive" } } },
      { conversion: { customerEmail: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [totalCount, commissions] = await Promise.all([
    prisma.commission.count({ where: whereClause }),
    prisma.commission.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        affiliate: {
          select: {
            id: true,
            fullName: true,
            affiliateCode: true,
            email: true,
            phone: true,
          },
        },
        conversion: true,
        payout: true,
      },
    }),
  ]);

  return {
    success: true,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    commissions: commissions.map((c) => ({
      id: c.id,
      amount: Number(c.amount),
      currency: c.currency,
      rateType: c.rateType,
      rateApplied: Number(c.rateApplied),
      status: c.status,
      notes: c.notes,
      orderType: c.conversion.orderType,
      orderId: c.conversion.orderId,
      orderAmount: Number(c.conversion.orderAmount),
      customerEmail: c.conversion.customerEmail,
      affiliate: c.affiliate,
      payoutId: c.payoutId,
      payoutStatus: c.payout?.status || null,
      approvedAt: c.approvedAt,
      paidAt: c.paidAt,
      createdAt: c.createdAt,
    })),
  };
}

/**
 * Super Admin verify / approve / reject / reverse a commission
 */
export async function updateAdminCommissionStatus(
  commissionId: string,
  status: CommissionStatus,
  notes?: string
) {
  const session = await checkSuperAdmin();

  const commission = await prisma.commission.findUnique({
    where: { id: commissionId },
  });
  if (!commission) {
    return { success: false, error: "Commission not found" };
  }

  const updateData: any = {
    status,
    notes: notes || commission.notes,
    updatedAt: new Date(),
  };

  if (status === CommissionStatus.APPROVED) {
    updateData.approvedAt = new Date();
    updateData.approvedBy = session.user.id;
  } else if (status === CommissionStatus.PAID) {
    updateData.paidAt = new Date();
  }

  await prisma.commission.update({
    where: { id: commissionId },
    data: updateData,
  });

  revalidatePath("/super-admin/affiliates/commissions");
  return { success: true, message: `Commission status updated to ${status}.` };
}

/**
 * Super Admin Payouts List
 */
export async function getAdminPayouts(options?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  await checkSuperAdmin();

  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (options?.status && options.status !== "ALL") {
    whereClause.status = options.status as PayoutStatus;
  }

  const [totalCount, payouts] = await Promise.all([
    prisma.payout.count({ where: whereClause }),
    prisma.payout.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        affiliate: {
          select: {
            id: true,
            fullName: true,
            affiliateCode: true,
            email: true,
            phone: true,
            payoutMethod: true,
            mobileMoneyNumber: true,
            mobileMoneyName: true,
            bankName: true,
            bankAccountNumber: true,
            bankAccountName: true,
          },
        },
        _count: { select: { commissions: true } },
      },
    }),
  ]);

  return {
    success: true,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    payouts: payouts.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      method: p.method,
      status: p.status,
      accountDetails: p.accountDetails,
      transactionRef: p.transactionRef,
      proofReceiptUrl: p.proofReceiptUrl,
      notes: p.notes,
      commissionsCount: p._count.commissions,
      affiliate: p.affiliate,
      processedBy: p.processedBy,
      processedAt: p.processedAt,
      createdAt: p.createdAt,
    })),
  };
}

/**
 * Record payout completion or failure (Orange Money, Afrimoney, Bank, Cash)
 */
export async function recordAdminPayoutExecution(data: {
  payoutId: string;
  status: PayoutStatus;
  transactionRef?: string;
  proofReceiptUrl?: string;
  notes?: string;
}) {
  const session = await checkSuperAdmin();

  const payout = await prisma.payout.findUnique({
    where: { id: data.payoutId },
    include: { commissions: true },
  });

  if (!payout) {
    return { success: false, error: "Payout request not found" };
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update payout
    await tx.payout.update({
      where: { id: data.payoutId },
      data: {
        status: data.status,
        transactionRef: data.transactionRef?.trim() || null,
        proofReceiptUrl: data.proofReceiptUrl?.trim() || null,
        notes: data.notes?.trim() || null,
        processedBy: session.user.id,
        processedAt: new Date(),
      },
    });

    // 2. If COMPLETED, mark all attached commissions as PAID
    if (data.status === PayoutStatus.COMPLETED) {
      await tx.commission.updateMany({
        where: { payoutId: data.payoutId },
        data: {
          status: CommissionStatus.PAID,
          paidAt: new Date(),
        },
      });
    }

    // 3. If FAILED, release commissions back to approved unlinked
    if (data.status === PayoutStatus.FAILED) {
      await tx.commission.updateMany({
        where: { payoutId: data.payoutId },
        data: {
          payoutId: null,
          status: CommissionStatus.APPROVED,
        },
      });
    }
  });

  revalidatePath("/super-admin/affiliates/payouts");
  return {
    success: true,
    message: `Payout of NLe ${Number(payout.amount)} marked as ${data.status}.`,
  };
}

/**
 * Marketing Materials Management for Super Admin
 */
export async function getAdminMarketingMaterials() {
  await checkSuperAdmin();

  const materials = await prisma.affiliateMarketingMaterial.findMany({
    orderBy: { createdAt: "desc" },
  });

  return { success: true, materials };
}

export async function saveAdminMarketingMaterial(data: {
  id?: string;
  title: string;
  category: string;
  productSlug?: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  textContent?: string;
  dimensions?: string;
  isActive: boolean;
}) {
  try {
    await checkSuperAdmin();

    if (!data.title || !data.category) {
      return { success: false, error: "Title and Category are required." };
    }

    if (data.id) {
      await prisma.affiliateMarketingMaterial.update({
        where: { id: data.id },
        data: {
          title: data.title.trim(),
          category: data.category,
          productSlug: data.productSlug || null,
          description: data.description?.trim() || null,
          fileUrl: data.fileUrl?.trim() || null,
          fileType: data.fileType || "IMAGE",
          textContent: data.textContent?.trim() || null,
          dimensions: data.dimensions?.trim() || null,
          isActive: data.isActive,
        },
      });
    } else {
      await prisma.affiliateMarketingMaterial.create({
        data: {
          title: data.title.trim(),
          category: data.category,
          productSlug: data.productSlug || null,
          description: data.description?.trim() || null,
          fileUrl: data.fileUrl?.trim() || null,
          fileType: data.fileType || "IMAGE",
          textContent: data.textContent?.trim() || null,
          dimensions: data.dimensions?.trim() || null,
          isActive: data.isActive,
        },
      });
    }

    revalidatePath("/super-admin/affiliates/marketing");
    return { success: true, message: "Marketing resource saved." };
  } catch (err: any) {
    console.error("saveAdminMarketingMaterial error:", err);
    return { success: false, error: err?.message ?? "Failed to save marketing resource." };
  }
}

export async function deleteAdminMarketingMaterial(id: string) {
  try {
    await checkSuperAdmin();
    await prisma.affiliateMarketingMaterial.delete({ where: { id } });
    revalidatePath("/super-admin/affiliates/marketing");
    return { success: true, message: "Resource deleted." };
  } catch (err: any) {
    console.error("deleteAdminMarketingMaterial error:", err);
    return { success: false, error: err?.message ?? "Failed to delete resource." };
  }
}

/**
 * Global Affiliate Settings
 */
export async function getAdminAffiliateSettings() {
  await checkSuperAdmin();

  let settings = await prisma.affiliateSettings.findUnique({
    where: { id: "global" },
  });

  if (!settings) {
    settings = await prisma.affiliateSettings.create({
      data: {
        id: "global",
        attributionWindowDays: 30,
        defaultCommissionType: CommissionType.PERCENTAGE,
        defaultCommissionRate: 10.0,
        minPayoutThreshold: 100.0,
        attributionModel: AttributionModel.LAST_TOUCH,
        allowSelfReferrals: false,
        requireApproval: true,
        payoutTermsDays: 14,
        termsContent:
          "Welcome to the ProTech Assist SL Limited Affiliate Program. By participating, you agree to promote ProTech Assist services honestly, without deceptive practices or spamming.",
      },
    });
  }

  return { success: true, settings };
}

export async function updateAdminAffiliateSettings(data: {
  attributionWindowDays: number;
  defaultCommissionType: CommissionType;
  defaultCommissionRate: number;
  minPayoutThreshold: number;
  attributionModel: AttributionModel;
  allowSelfReferrals: boolean;
  requireApproval: boolean;
  payoutTermsDays: number;
  termsContent?: string;
}) {
  await checkSuperAdmin();

  const updated = await prisma.affiliateSettings.upsert({
    where: { id: "global" },
    update: {
      attributionWindowDays: data.attributionWindowDays,
      defaultCommissionType: data.defaultCommissionType,
      defaultCommissionRate: data.defaultCommissionRate,
      minPayoutThreshold: data.minPayoutThreshold,
      attributionModel: data.attributionModel,
      allowSelfReferrals: data.allowSelfReferrals,
      requireApproval: data.requireApproval,
      payoutTermsDays: data.payoutTermsDays,
      termsContent: data.termsContent || null,
    },
    create: {
      id: "global",
      attributionWindowDays: data.attributionWindowDays,
      defaultCommissionType: data.defaultCommissionType,
      defaultCommissionRate: data.defaultCommissionRate,
      minPayoutThreshold: data.minPayoutThreshold,
      attributionModel: data.attributionModel,
      allowSelfReferrals: data.allowSelfReferrals,
      requireApproval: data.requireApproval,
      payoutTermsDays: data.payoutTermsDays,
      termsContent: data.termsContent || null,
    },
  });

  revalidatePath("/super-admin/affiliates/settings");
  return { success: true, settings: updated, message: "Settings updated successfully." };
}
