"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { AffiliateStatus, CommissionStatus, CommissionType } from "@prisma/client";

/**
 * Hash IP address with SHA256 for privacy compliance & duplicate detection
 */
function hashIp(ip?: string): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip.trim()).digest("hex");
}

/**
 * Record an affiliate click event
 */
export async function recordAffiliateClick(params: {
  code: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  landingPage: string;
  visitorId: string;
}) {
  try {
    const rawCode = params.code.trim();

    // 1. Try finding by AffiliateLink code first
    let link = await prisma.affiliateLink.findUnique({
      where: { code: rawCode },
      include: { affiliate: true },
    });

    let affiliate = link?.affiliate;

    // 2. If not found as link code, try finding directly by affiliateCode (e.g. PA-AFF-00001)
    if (!affiliate) {
      affiliate = await prisma.affiliate.findUnique({
        where: { affiliateCode: rawCode.toUpperCase() },
      });
    }

    // Must exist and be APPROVED
    if (!affiliate || affiliate.status !== AffiliateStatus.APPROVED) {
      return { success: false, error: "Invalid or inactive referral code" };
    }

    const ipHash = hashIp(params.ip);

    // 3. Spam throttle: Check if exact same visitorId clicked this affiliate in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentClick = await prisma.affiliateClick.findFirst({
      where: {
        affiliateId: affiliate.id,
        visitorId: params.visitorId,
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    let clickId: string | undefined;

    if (!recentClick) {
      // Create new click record
      const click = await prisma.affiliateClick.create({
        data: {
          affiliateId: affiliate.id,
          linkId: link?.id || null,
          ipHash,
          userAgent: params.userAgent?.substring(0, 500) || null,
          referrer: params.referrer?.substring(0, 500) || null,
          landingPage: params.landingPage,
          visitorId: params.visitorId,
        },
      });
      clickId = click.id;

      // Increment click count on link
      if (link) {
        await prisma.affiliateLink.update({
          where: { id: link.id },
          data: { clicksCount: { increment: 1 } },
        });
      }
    } else {
      clickId = recentClick.id;
    }

    return {
      success: true,
      affiliateCode: affiliate.affiliateCode,
      clickId,
      targetUrl: link?.targetUrl || "/",
    };
  } catch (error) {
    console.error("Failed to record affiliate click:", error);
    return { success: false, error: "Internal tracking error" };
  }
}

/**
 * Record and attribute a conversion event to an affiliate
 */
export async function recordAffiliateConversion(params: {
  referralCode?: string; // e.g. "PA-AFF-00001" or link code
  visitorId?: string;
  customerEmail?: string;
  customerName?: string;
  customerUserId?: string;
  businessId?: string;
  orderType: string; // "SUBSCRIPTION", "COURSE", "SERVICE", "ENTERPRISE_OS"
  orderId: string; // Unique transaction/invoice identifier
  orderAmount: number; // In NLe
  productSlug?: string; // e.g. "enterprise-os", "ai-masterclass"
  currency?: string;
}) {
  try {
    if (!params.orderId || params.orderAmount <= 0) {
      return { success: false, reason: "Invalid order parameters" };
    }

    // 1. Idempotency check: Has this conversion already been recorded?
    const existingConversion = await prisma.affiliateConversion.findFirst({
      where: { orderId: params.orderId },
    });
    if (existingConversion) {
      return { success: false, reason: "Conversion already processed for this orderId." };
    }

    // 2. Fetch global settings
    let settings = await prisma.affiliateSettings.findUnique({
      where: { id: "global" },
    });
    const attributionDays = settings?.attributionWindowDays || 30;
    const allowSelfReferrals = settings?.allowSelfReferrals || false;

    // 3. Locate the Affiliate and Click
    let affiliate: any = null;
    let click: any = null;

    const windowCutoff = new Date(Date.now() - attributionDays * 24 * 60 * 60 * 1000);

    // Try finding by visitorId click first
    if (params.visitorId) {
      click = await prisma.affiliateClick.findFirst({
        where: {
          visitorId: params.visitorId,
          createdAt: { gte: windowCutoff },
        },
        orderBy: { createdAt: "desc" },
        include: { affiliate: true, link: true },
      });
      if (click?.affiliate) {
        affiliate = click.affiliate;
      }
    }

    // If no click by visitorId, try by referralCode directly
    if (!affiliate && params.referralCode) {
      const code = params.referralCode.trim();
      const link = await prisma.affiliateLink.findUnique({
        where: { code },
        include: { affiliate: true },
      });
      if (link?.affiliate) {
        affiliate = link.affiliate;
      } else {
        affiliate = await prisma.affiliate.findUnique({
          where: { affiliateCode: code.toUpperCase() },
        });
      }
    }

    // No valid approved affiliate found
    if (!affiliate || affiliate.status !== AffiliateStatus.APPROVED) {
      return { success: false, reason: "No active affiliate attribution found." };
    }

    // 4. Anti-Fraud: Prevent Self-Referral
    if (!allowSelfReferrals) {
      if (
        (params.customerEmail &&
          params.customerEmail.toLowerCase().trim() === affiliate.email.toLowerCase().trim()) ||
        (params.customerUserId && params.customerUserId === affiliate.userId)
      ) {
        console.warn(`[Anti-Fraud] Self-referral blocked for affiliate ${affiliate.affiliateCode}`);
        return { success: false, reason: "Self-referrals are not permitted under program terms." };
      }
    }

    // 5. Commission Calculation Engine
    let rateType: CommissionType = CommissionType.PERCENTAGE;
    let rateApplied = 10.0; // default 10%

    // Priority 1: Individual Affiliate Override
    if (affiliate.commissionRateOverride !== null && Number(affiliate.commissionRateOverride) > 0) {
      rateApplied = Number(affiliate.commissionRateOverride);
      rateType = CommissionType.PERCENTAGE;
    } else {
      // Priority 2: Product-specific rule
      const targetSlug = params.productSlug?.toLowerCase().trim() || "default";
      let rule = await prisma.commissionRule.findFirst({
        where: { productSlug: targetSlug, isActive: true },
      });

      if (!rule && targetSlug !== "default") {
        rule = await prisma.commissionRule.findFirst({
          where: { productSlug: "default", isActive: true },
        });
      }

      if (rule) {
        rateType = rule.type;
        rateApplied = Number(rule.rate);
      } else if (settings) {
        rateType = settings.defaultCommissionType;
        rateApplied = Number(settings.defaultCommissionRate);
      }
    }

    // Calculate final commission
    let commissionAmount = 0;
    if (rateType === CommissionType.PERCENTAGE) {
      commissionAmount = Math.round(((params.orderAmount * rateApplied) / 100) * 100) / 100;
    } else {
      commissionAmount = Math.min(rateApplied, params.orderAmount);
    }

    // 6. Record Conversion and Commission in Transaction
    const result = await prisma.$transaction(async (tx) => {
      const conversion = await tx.affiliateConversion.create({
        data: {
          affiliateId: affiliate.id,
          clickId: click?.id || null,
          visitorId: params.visitorId || null,
          customerEmail: params.customerEmail?.toLowerCase().trim() || null,
          customerName: params.customerName?.trim() || null,
          customerUserId: params.customerUserId || null,
          businessId: params.businessId || null,
          orderType: params.orderType,
          orderId: params.orderId,
          orderAmount: params.orderAmount,
          currency: params.currency || "NLe",
          status: CommissionStatus.PENDING,
        },
      });

      const commission = await tx.commission.create({
        data: {
          affiliateId: affiliate.id,
          conversionId: conversion.id,
          amount: commissionAmount,
          currency: params.currency || "NLe",
          rateType,
          rateApplied,
          status: CommissionStatus.PENDING,
          notes: `Attributed via ${click ? "tracked link click" : "direct referral code"}. Rate: ${rateApplied}${rateType === CommissionType.PERCENTAGE ? "%" : " NLe"}.`,
        },
      });

      if (click?.linkId) {
        await tx.affiliateLink.update({
          where: { id: click.linkId },
          data: { conversionsCount: { increment: 1 } },
        });
      }

      return { conversion, commission };
    });

    return {
      success: true,
      conversionId: result.conversion.id,
      commissionId: result.commission.id,
      commissionAmount,
      affiliateCode: affiliate.affiliateCode,
    };
  } catch (error) {
    console.error("Failed to process affiliate conversion:", error);
    return { success: false, error: "Internal conversion tracking failure" };
  }
}
