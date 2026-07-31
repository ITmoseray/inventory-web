"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendReferralNotification } from "@/lib/mail";

/**
 * Generate a unique referral code.
 * Format: XXX-XXXXXX (e.g., PRO-8X4K92)
 */
function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const prefix = ["PRO", "PTA", "PASL"][Math.floor(Math.random() * 3)];
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${randomPart}`;
}

/**
 * Get or create a referral code for a business.
 */
export async function getOrCreateReferralCode(businessId: string) {
  try {
    let referralCode = await prisma.referralCode.findUnique({
      where: { businessId },
    });

    if (!referralCode) {
      let isUnique = false;
      let newCode = "";

      // Ensure code uniqueness
      while (!isUnique) {
        newCode = generateCode();
        const existing = await prisma.referralCode.findUnique({
          where: { code: newCode },
        });
        if (!existing) {
          isUnique = true;
        }
      }

      referralCode = await prisma.referralCode.create({
        data: {
          businessId,
          code: newCode,
        },
      });
    }

    return { success: true, code: referralCode.code };
  } catch (error) {
    console.error("Failed to get/create referral code:", error);
    return { success: false, error: "Failed to generate referral code." };
  }
}

/**
 * Process a new referral during registration.
 */
export async function processReferral(code: string, newBusinessId: string) {
  try {
    const referralCode = await prisma.referralCode.findUnique({
      where: { code },
    });

    if (!referralCode) {
      return { success: false, error: "Invalid referral code." };
    }

    // Prevent self-referral
    if (referralCode.businessId === newBusinessId) {
      return { success: false, error: "Cannot refer yourself." };
    }

    // Create the referral record
    await prisma.referral.create({
      data: {
        referrerBusinessId: referralCode.businessId,
        referredBusinessId: newBusinessId,
        codeUsed: code,
        status: "PENDING",
      },
    });

    // Notify the referrer via email (fire-and-forget)
    const referrer = await prisma.business.findUnique({
      where: { id: referralCode.businessId },
      include: { users: { where: { role: { name: "ADMIN" } }, take: 1, include: { role: true } } }
    });
    const referred = await prisma.business.findUnique({ where: { id: newBusinessId }, select: { name: true } });
    if (referrer && referred) {
      const adminUser = referrer.users[0] ?? referrer.users[0]; // first admin user
      if (adminUser?.email) {
        sendReferralNotification({
          toEmail: adminUser.email,
          referrerName: adminUser.name || referrer.name,
          referredBusinessName: referred.name,
          event: "LINK_USED",
        }).catch(console.error);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to process referral:", error);
    return { success: false, error: "Failed to process referral." };
  }
}

/**
 * Get referral statistics for a business.
 */
export async function getReferralStats(businessId: string) {
  try {
    const referrals = await prisma.referral.findMany({
      where: { referrerBusinessId: businessId },
      include: {
        referred: {
          select: { name: true, plan: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = referrals.length;
    const successful = referrals.filter((r) => r.status === "SUCCESSFUL").length;
    const pending = referrals.filter((r) => r.status === "PENDING").length;
    const rewardsEarned = referrals.filter((r) => r.rewardGranted).length;

    return {
      success: true,
      stats: { total, successful, pending, rewardsEarned },
      history: referrals,
    };
  } catch (error) {
    console.error("Failed to get referral stats:", error);
    return { success: false, error: "Failed to load referral statistics." };
  }
}

/**
 * Superadmin function: Get global referral statistics.
 */
export async function getGlobalReferralStats() {
  try {
    const total = await prisma.referral.count();
    const successful = await prisma.referral.count({ where: { status: "SUCCESSFUL" } });
    const pending = await prisma.referral.count({ where: { status: "PENDING" } });

    // For leaderboard, group by referrer
    const topReferrersRaw = await prisma.referral.groupBy({
      by: ["referrerBusinessId"],
      _count: {
        _all: true,
      },
      where: { status: "SUCCESSFUL" },
      orderBy: {
        _count: {
          referrerBusinessId: "desc",
        },
      },
      take: 10,
    });

    const topReferrers = await Promise.all(
      topReferrersRaw.map(async (r) => {
        const business = await prisma.business.findUnique({
          where: { id: r.referrerBusinessId },
          select: { name: true, email: true },
        });
        return {
          businessName: business?.name || "Unknown",
          email: business?.email || "Unknown",
          successfulCount: r._count._all,
        };
      })
    );
    
    // Also get recent referrals for the admin table
    const recentReferrals = await prisma.referral.findMany({
      include: {
        referrer: { select: { name: true, email: true } },
        referred: { select: { name: true, email: true, plan: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      success: true,
      stats: { total, successful, pending },
      topReferrers,
      recentReferrals
    };
  } catch (error) {
    console.error("Failed to get global referral stats:", error);
    return { success: false, error: "Failed to load global referral statistics." };
  }
}

/**
 * Admin action: Manually grant/toggle a reward
 */
export async function toggleReferralReward(referralId: string, grant: boolean) {
  try {
    await prisma.referral.update({
      where: { id: referralId },
      data: {
        rewardGranted: grant,
        rewardDate: grant ? new Date() : null,
      },
    });

    // Notify referrer when reward is granted
    if (grant) {
      const referral = await prisma.referral.findUnique({
        where: { id: referralId },
        include: {
          referrer: { include: { users: { where: { role: { name: "ADMIN" } }, take: 1 } } },
          referred: { select: { name: true } }
        }
      });
      if (referral) {
        const adminUser = referral.referrer.users[0];
        if (adminUser?.email) {
          sendReferralNotification({
            toEmail: adminUser.email,
            referrerName: adminUser.name || referral.referrer.name,
            referredBusinessName: referral.referred.name,
            event: "REWARD_GRANTED",
          }).catch(console.error);
        }
      }
    }
    
    revalidatePath("/admin/referrals");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle reward:", error);
    return { success: false, error: "Failed to update reward status." };
  }
}

/**
 * Check if a pending referral has now met the requirements (paid subscription)
 * This could be called via cron job or when a subscription payment succeeds.
 */
export async function checkReferralQualification(referredBusinessId: string) {
  try {
    const referral = await prisma.referral.findUnique({
      where: { referredBusinessId },
      include: { referred: true }
    });

    if (!referral || referral.status !== "PENDING") {
      return { success: true, message: "No pending referral found for this business." };
    }

    // Check if the referred business has a paid plan
    if (referral.referred.plan !== "FREE") {
      await prisma.referral.update({
        where: { id: referral.id },
        data: { status: "SUCCESSFUL" },
      });
      
      // Optionally trigger reward logic/notification here
      
      return { success: true, updated: true };
    }

    return { success: true, updated: false };
  } catch (error) {
    console.error("Failed to check referral qualification:", error);
    return { success: false, error: "Failed to check qualification." };
  }
}
