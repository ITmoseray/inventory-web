"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { PayoutMethod, AffiliateStatus } from "@prisma/client";

/**
 * Generate the next sequential unique Affiliate Code: PA-AFF-00001, PA-AFF-00002...
 */
async function generateNextAffiliateCode(): Promise<string> {
  const count = await prisma.affiliate.count();
  let candidateNum = count + 1;
  let isUnique = false;
  let code = "";

  while (!isUnique) {
    const padded = String(candidateNum).padStart(5, "0");
    code = `PA-AFF-${padded}`;
    const existing = await prisma.affiliate.findUnique({
      where: { affiliateCode: code },
    });
    if (!existing) {
      isUnique = true;
    } else {
      candidateNum++;
    }
  }

  return code;
}

export interface AffiliateRegistrationInput {
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  whatsappPhone?: string;
  country?: string;
  city?: string;
  marketingChannels?: string[];
  websiteOrSocial?: string;
  preferredMethod?: string;
  experienceLevel?: string;
  notes?: string;
  payoutMethod?: PayoutMethod;
  mobileMoneyNumber?: string;
  mobileMoneyName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankSwiftOrBranch?: string;
  agreedToTerms: boolean;
}

/**
 * Public Affiliate Registration
 */
export async function registerAffiliate(input: AffiliateRegistrationInput) {
  try {
    if (!input.fullName || !input.email || !input.phone) {
      return { success: false, error: "Please fill in all required fields (Name, Email, Phone)." };
    }

    if (!input.agreedToTerms) {
      return { success: false, error: "You must accept the ProTech Assist Affiliate Agreement to proceed." };
    }

    const email = input.email.trim().toLowerCase();

    // Check if affiliate already exists with this email
    const existingAffiliate = await prisma.affiliate.findFirst({
      where: { email },
    });
    if (existingAffiliate) {
      return {
        success: false,
        error: "An affiliate account with this email address already exists. Please log in or contact support.",
      };
    }

    // Check or create User
    let user = await prisma.user.findUnique({
      where: { email },
      include: { affiliate: true },
    });

    if (user?.affiliate) {
      return {
        success: false,
        error: "This user account is already registered as an affiliate.",
      };
    }

    let userId: string;

    if (!user) {
      if (!input.password || input.password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long." };
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      const newUser = await prisma.user.create({
        data: {
          name: input.fullName.trim(),
          email,
          passwordHash,
          phone: input.phone.trim(),
          status: "active",
        },
      });
      userId = newUser.id;
    } else {
      userId = user.id;
    }

    // Generate unique affiliate code
    const affiliateCode = await generateNextAffiliateCode();

    // Create Affiliate Profile
    const affiliate = await prisma.affiliate.create({
      data: {
        userId,
        affiliateCode,
        status: AffiliateStatus.PENDING,
        fullName: input.fullName.trim(),
        email,
        phone: input.phone.trim(),
        whatsappPhone: input.whatsappPhone?.trim() || null,
        country: input.country?.trim() || "Sierra Leone",
        city: input.city?.trim() || null,
        marketingChannels: input.marketingChannels || [],
        websiteOrSocial: input.websiteOrSocial?.trim() || null,
        preferredMethod: input.preferredMethod?.trim() || null,
        experienceLevel: input.experienceLevel?.trim() || null,
        notes: input.notes?.trim() || null,
        payoutMethod: input.payoutMethod || null,
        mobileMoneyNumber: input.mobileMoneyNumber?.trim() || null,
        mobileMoneyName: input.mobileMoneyName?.trim() || null,
        bankName: input.bankName?.trim() || null,
        bankAccountNumber: input.bankAccountNumber?.trim() || null,
        bankAccountName: input.bankAccountName?.trim() || null,
        bankSwiftOrBranch: input.bankSwiftOrBranch?.trim() || null,
        agreedToTerms: true,
        agreedAt: new Date(),
      },
    });

    // Create default primary affiliate link
    await prisma.affiliateLink.create({
      data: {
        affiliateId: affiliate.id,
        code: affiliateCode,
        targetUrl: "/",
        productSlug: "all",
        title: "Default Referral Link",
      },
    });

    return {
      success: true,
      affiliateCode: affiliate.affiliateCode,
      message: "Application submitted successfully! Your account is currently pending review by ProTech Assist.",
    };
  } catch (error: any) {
    console.error("Affiliate Registration Error:", error);
    return {
      success: false,
      error: error.message || "Failed to register affiliate. Please try again.",
    };
  }
}

/**
 * Get authenticated affiliate profile
 */
export async function getAffiliateProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!affiliate) {
    return { success: false, error: "No affiliate profile found for this user." };
  }

  return { success: true, affiliate };
}

/**
 * Get affiliate dashboard statistics & KPIs
 */
export async function getAffiliateDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  });

  if (!affiliate) {
    return { success: false, error: "Affiliate profile not found" };
  }

  // 1. Clicks total & unique visitors
  const totalClicks = await prisma.affiliateClick.count({
    where: { affiliateId: affiliate.id },
  });

  const uniqueVisitorsRaw = await prisma.affiliateClick.findMany({
    where: { affiliateId: affiliate.id },
    distinct: ["visitorId"],
    select: { visitorId: true },
  });
  const uniqueVisitors = uniqueVisitorsRaw.length;

  // 2. Conversions
  const totalConversions = await prisma.affiliateConversion.count({
    where: { affiliateId: affiliate.id },
  });

  const conversionRate = uniqueVisitors > 0
    ? ((totalConversions / uniqueVisitors) * 100).toFixed(1)
    : "0.0";

  // 3. Commissions aggregates
  const commissions = await prisma.commission.findMany({
    where: { affiliateId: affiliate.id },
    select: {
      id: true,
      amount: true,
      status: true,
      payoutId: true,
    },
  });

  let pendingAmount = 0;
  let approvedAmount = 0;
  let paidAmount = 0;
  let availableBalance = 0;

  for (const c of commissions) {
    const amt = Number(c.amount);
    if (c.status === "PENDING") {
      pendingAmount += amt;
    } else if (c.status === "APPROVED") {
      approvedAmount += amt;
      // If not yet claimed in a payout
      if (!c.payoutId) {
        availableBalance += amt;
      }
    } else if (c.status === "PAID") {
      paidAmount += amt;
    }
  }

  // 4. Recent conversions
  const recentConversions = await prisma.affiliateConversion.findMany({
    where: { affiliateId: affiliate.id },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      commission: true,
    },
  });

  // 5. Recent clicks
  const recentClicks = await prisma.affiliateClick.findMany({
    where: { affiliateId: affiliate.id },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      link: {
        select: { code: true, productSlug: true, title: true },
      },
    },
  });

  // 6. Settings (min payout)
  const settings = await prisma.affiliateSettings.findUnique({
    where: { id: "global" },
  });
  const minPayout = settings ? Number(settings.minPayoutThreshold) : 100;

  return {
    success: true,
    affiliate,
    kpis: {
      totalClicks,
      uniqueVisitors,
      totalConversions,
      conversionRate,
      pendingCommission: pendingAmount,
      approvedCommission: approvedAmount,
      paidCommission: paidAmount,
      totalEarnings: approvedAmount + paidAmount,
      availableBalance,
      minPayout,
    },
    recentConversions: recentConversions.map((conv) => ({
      id: conv.id,
      orderType: conv.orderType,
      orderAmount: Number(conv.orderAmount),
      currency: conv.currency,
      status: conv.status,
      commissionAmount: conv.commission ? Number(conv.commission.amount) : 0,
      commissionStatus: conv.commission?.status || conv.status,
      customerMasked: conv.customerEmail
        ? conv.customerEmail.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length))
        : "Customer",
      createdAt: conv.createdAt,
    })),
    recentClicks: recentClicks.map((click) => ({
      id: click.id,
      landingPage: click.landingPage,
      linkCode: click.link?.code || affiliate.affiliateCode,
      product: click.link?.productSlug || "General",
      referrer: click.referrer || "Direct",
      createdAt: click.createdAt,
    })),
  };
}

/**
 * Get all tracking links for the authenticated affiliate
 */
export async function getAffiliateLinks() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  });

  if (!affiliate) {
    return { success: false, error: "Affiliate profile not found" };
  }

  const links = await prisma.affiliateLink.findMany({
    where: { affiliateId: affiliate.id },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    affiliateCode: affiliate.affiliateCode,
    links: links.map((l) => ({
      id: l.id,
      code: l.code,
      targetUrl: l.targetUrl,
      productSlug: l.productSlug,
      title: l.title,
      clicksCount: l.clicksCount,
      conversionsCount: l.conversionsCount,
      isActive: l.isActive,
      createdAt: l.createdAt,
    })),
  };
}

/**
 * Create a custom affiliate tracking link
 */
export async function createAffiliateLink(data: {
  targetUrl: string;
  productSlug?: string;
  title?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  });

  if (!affiliate) {
    return { success: false, error: "Affiliate profile not found" };
  }

  if (affiliate.status !== "APPROVED") {
    return { success: false, error: "Only approved affiliates can create tracking links." };
  }

  // Generate unique suffix
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const code = `${affiliate.affiliateCode}-${data.productSlug ? data.productSlug.substring(0, 8) : "ref"}-${randomSuffix}`;

  const link = await prisma.affiliateLink.create({
    data: {
      affiliateId: affiliate.id,
      code,
      targetUrl: data.targetUrl || "/",
      productSlug: data.productSlug || null,
      title: data.title || "Custom Referral Link",
    },
  });

  revalidatePath("/affiliate/links");
  return { success: true, link };
}

/**
 * Get commissions for the authenticated affiliate
 */
export async function getAffiliateCommissions(options?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  });

  if (!affiliate) {
    return { success: false, error: "Affiliate profile not found" };
  }

  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const whereClause: any = { affiliateId: affiliate.id };
  if (options?.status && options.status !== "ALL") {
    whereClause.status = options.status;
  }

  const [totalCount, commissions] = await Promise.all([
    prisma.commission.count({ where: whereClause }),
    prisma.commission.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
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
      orderAmount: Number(c.conversion.orderAmount),
      customerMasked: c.conversion.customerEmail
        ? c.conversion.customerEmail.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length))
        : "Customer",
      payoutId: c.payoutId,
      payoutStatus: c.payout?.status || null,
      approvedAt: c.approvedAt,
      paidAt: c.paidAt,
      createdAt: c.createdAt,
    })),
  };
}

/**
 * Get payouts history for the authenticated affiliate
 */
export async function getAffiliatePayouts() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  });

  if (!affiliate) {
    return { success: false, error: "Affiliate profile not found" };
  }

  const payouts = await prisma.payout.findMany({
    where: { affiliateId: affiliate.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { commissions: true } },
    },
  });

  return {
    success: true,
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
      processedAt: p.processedAt,
      createdAt: p.createdAt,
    })),
  };
}

/**
 * Request a payout for approved commission balance
 */
export async function requestPayout(data: {
  amount: number;
  method: PayoutMethod;
  accountDetails: Record<string, any>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  });

  if (!affiliate) {
    return { success: false, error: "Affiliate profile not found" };
  }

  if (affiliate.status !== "APPROVED") {
    return { success: false, error: "Only approved affiliates can request payouts." };
  }

  // Check minimum threshold
  const settings = await prisma.affiliateSettings.findUnique({ where: { id: "global" } });
  const minThreshold = settings ? Number(settings.minPayoutThreshold) : 100;

  if (data.amount < minThreshold) {
    return {
      success: false,
      error: `Minimum payout amount is NLe ${minThreshold}. You requested NLe ${data.amount}.`,
    };
  }

  // Find all approved commissions not yet assigned to a payout
  const approvedCommissions = await prisma.commission.findMany({
    where: {
      affiliateId: affiliate.id,
      status: "APPROVED",
      payoutId: null,
    },
    orderBy: { createdAt: "asc" },
  });

  const availableBalance = approvedCommissions.reduce((sum, c) => sum + Number(c.amount), 0);

  if (data.amount > availableBalance) {
    return {
      success: false,
      error: `Requested amount (NLe ${data.amount}) exceeds your available approved balance of NLe ${availableBalance.toFixed(2)}.`,
    };
  }

  // Select commissions to cover this payout
  let accumulated = 0;
  const commissionsToLink: string[] = [];
  for (const comm of approvedCommissions) {
    commissionsToLink.push(comm.id);
    accumulated += Number(comm.amount);
    if (accumulated >= data.amount) break;
  }

  // Create Payout record and link commissions in transaction
  const result = await prisma.$transaction(async (tx) => {
    const payout = await tx.payout.create({
      data: {
        affiliateId: affiliate.id,
        amount: data.amount,
        currency: "NLe",
        method: data.method,
        accountDetails: data.accountDetails,
        status: "PENDING",
      },
    });

    await tx.commission.updateMany({
      where: { id: { in: commissionsToLink } },
      data: { payoutId: payout.id },
    });

    return payout;
  });

  revalidatePath("/affiliate/payouts");
  revalidatePath("/affiliate/dashboard");

  return {
    success: true,
    payoutId: result.id,
    message: `Payout request of NLe ${data.amount} submitted successfully! ProTech finance will review and process via ${data.method.replace("_", " ")}.`,
  };
}

/**
 * Update affiliate payout settings
 */
export async function updateAffiliatePayoutSettings(data: {
  payoutMethod: PayoutMethod;
  mobileMoneyNumber?: string;
  mobileMoneyName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankSwiftOrBranch?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  });

  if (!affiliate) {
    return { success: false, error: "Affiliate profile not found" };
  }

  await prisma.affiliate.update({
    where: { id: affiliate.id },
    data: {
      payoutMethod: data.payoutMethod,
      mobileMoneyNumber: data.mobileMoneyNumber?.trim() || null,
      mobileMoneyName: data.mobileMoneyName?.trim() || null,
      bankName: data.bankName?.trim() || null,
      bankAccountNumber: data.bankAccountNumber?.trim() || null,
      bankAccountName: data.bankAccountName?.trim() || null,
      bankSwiftOrBranch: data.bankSwiftOrBranch?.trim() || null,
    },
  });

  revalidatePath("/affiliate/payouts");
  return { success: true, message: "Payout settings updated successfully." };
}

/**
 * Get active marketing materials for affiliates
 */
export async function getAffiliateMarketingMaterials(category?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const whereClause: any = { isActive: true };
  if (category && category !== "ALL") {
    whereClause.category = category;
  }

  const materials = await prisma.affiliateMarketingMaterial.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return { success: true, materials };
}
