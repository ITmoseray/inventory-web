"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { BusinessType } from "@prisma/client";
import { generateVerificationToken, sendVerificationEmail, sendPendingApprovalNotification } from "@/lib/mail";
import { getSystemSettings } from "@/lib/actions/system-settings";
import { getDefaultPermissionsForRole } from "@/lib/actions/user";
import { processReferral, getOrCreateReferralCode } from "@/lib/actions/referral";

export async function registerBusiness(data: any) {
  const { 
    businessName, 
    email, 
    password, 
    businessType, 
    businessManagementMode, 
    institutionType, 
    plan, 
    logoUrl, 
    phone, 
    address, 
    currency, 
    timezone, 
    businessEmail, 
    referralSource, 
    customReferralSource,
    referralCode,
    affiliateRef,
    affiliateClickId,
    ownerName,
    ownerPhone,
    businessPhone,
    billing,
    requestedBillingPeriod
  } = data;

  // Resolve affiliate attribution
  const effectiveAffiliateRef = affiliateRef || (referralCode?.startsWith("PA-") ? referralCode : null);
  const effectiveAffiliateClickId = affiliateClickId || null;

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = generateVerificationToken();

  try {
    // Use a transaction with 30s timeout to allow Neon DB connection latency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if user already exists (should be done before calling this, but for safety)
    const existingUser = await tx.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("An account already exists for this email address.");

    // 2. Create Business
    // The current logic sets a 30-day trial for FREE plans.
    // To satisfy "prevent users from starting another free trial", 
    // maybe we only set trial if they are truly new?
    // For now, let's keep it as is, as registration is the start of the journey.
    
    const allowedTypes = ["SHOP", "RESTAURANT", "BAR", "PHARMACY", "SUPERMARKET", "CLINIC", "HOSPITAL", "OFFICE", "SCHOOL"];
    const dbBusinessType = allowedTypes.includes(businessType) ? (businessType as BusinessType) : BusinessType.SHOP;

    const allowedPlans = ["FREE", "BASIC", "STANDARD", "BUSINESS", "ENTERPRISE"];
    const dbPlan = allowedPlans.includes(plan) ? plan : "BASIC";

    // Adapt enabled modules based on business type and subscription tier
    const modulesByType: Record<string, string[]> = {
      SHOP: ["POS", "INVENTORY", "SALES", "PURCHASES", "CUSTOMERS", "SUPPLIERS", "REPORTS"],
      SUPERMARKET: ["POS", "INVENTORY", "SALES", "PURCHASES", "CUSTOMERS", "SUPPLIERS", "REPORTS", "BARCODE"],
      PHARMACY: ["POS", "INVENTORY", "PHARMACY", "BATCHES", "EXPIRY", "PURCHASES", "SUPPLIERS", "REPORTS"],
      CLINIC: ["CLINIC", "PATIENTS", "CONSULTATIONS", "APPOINTMENTS", "LAB", "BILLING", "REPORTS"],
      HOSPITAL: ["HOSPITAL", "CLINIC", "PATIENTS", "CONSULTATIONS", "APPOINTMENTS", "LAB", "PHARMACY", "BILLING", "REPORTS"],
      RESTAURANT: ["RESTAURANT", "POS", "TABLES", "KITCHEN", "INVENTORY", "SALES", "REPORTS"],
      BAR: ["BAR", "POS", "TABS", "INVENTORY", "SALES", "REPORTS"],
      SCHOOL: ["SCHOOL", "STUDENTS", "ACADEMICS", "ATTENDANCE", "FEES", "PAYROLL", "REPORTS"],
      OFFICE: ["OFFICE", "EXPENSES", "INVOICES", "CRM", "ATTENDANCE", "PAYROLL", "REPORTS"],
    };

    const baseModules = modulesByType[dbBusinessType] || ["POS", "INVENTORY", "SALES", "REPORTS"];
    const extraModules: string[] = [];
    if (dbPlan === "STANDARD" || dbPlan === "ENTERPRISE") {
      extraModules.push("ANALYTICS", "INTELLIGENCE");
    }
    if (dbPlan === "ENTERPRISE") {
      extraModules.push("MULTI_BRANCH", "AUDIT_LOGS");
    }
    const businessModules = Array.from(new Set([...baseModules, ...extraModules]));

    const business = await tx.business.create({
      data: {
        name: businessName,
        phone: phone || businessPhone || ownerPhone || null,
        address: address,
        email: businessEmail || email,
        currency: currency || "SLL",
        timezone: timezone || "UTC",
        referralSource: referralSource || null,
        customReferralSource: customReferralSource || null,
        affiliateRef: effectiveAffiliateRef || null,
        affiliateClickId: effectiveAffiliateClickId || null,
        slug: businessName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") + "-" + Math.random().toString(36).substring(7),
        type: dbBusinessType,
        businessManagementMode: businessManagementMode === "SIMPLE_SALES_PROFIT" ? "SIMPLE_SALES_PROFIT" : "FULL_INVENTORY",
        institutionType: institutionType || null,
        plan: dbPlan,
        status: "ACTIVE",
        subscriptionStatus: "ACTIVE",
        logoUrl: logoUrl || null,
        enabledModules: businessModules,
        trialStartDate: null,
        trialEndDate: null,
        requestedBillingPeriod: billing || requestedBillingPeriod || "monthly",
      },
    });

    // 2. Create Default roles for the business
    const defaultRolesToCreate = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
    
    if (businessType === 'CLINIC' || businessType === 'HOSPITAL') {
      defaultRolesToCreate.push('DOCTOR', 'NURSE', 'LAB_TECH', 'RECEPTIONIST');
    } else if (businessType === 'PHARMACY') {
      defaultRolesToCreate.push('PHARMACIST', 'CASHIER');
    } else if (businessType === 'RESTAURANT' || businessType === 'BAR') {
      defaultRolesToCreate.push('WAITER', 'CHEF', 'CASHIER');
    } else if (businessType === 'SCHOOL') {
      defaultRolesToCreate.push('TEACHER', 'ACCOUNTANT', 'LIBRARIAN');
    } else {
      defaultRolesToCreate.push('CASHIER', 'STOCK_KEEPER');
    }

    const allPermissions = await tx.permission.findMany();

    const createdRoles = await Promise.all(
      defaultRolesToCreate.map(async (name) => {
        const defaultKeys = await getDefaultPermissionsForRole(name);
        const permIds = allPermissions.filter(p => defaultKeys.includes(p.key)).map(p => ({ id: p.id }));
        
        return tx.role.create({ 
          data: { 
            name, 
            businessId: business.id,
            permissions: { connect: permIds }
          } 
        });
      })
    );

    const adminRole = createdRoles.find(r => r.name === 'ADMIN');

    // 2b. Auto-assign all permissions to ADMIN role
    if (adminRole && allPermissions.length > 0) {
      await tx.role.update({
        where: { id: adminRole.id },
        data: {
          permissions: {
            connect: allPermissions.map(p => ({ id: p.id }))
          }
        }
      });
    }

    // 3. Create Admin User with verification token
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        name: ownerName || data.name || "Admin",
        phone: ownerPhone || phone || null,
        roleId: adminRole ? adminRole.id : createdRoles[0].id,
        businessId: business.id,
        verificationToken,
      },
    });

    return { 
      business: {
        ...business,
        createdAt: business.createdAt.toISOString(),
        updatedAt: business.updatedAt.toISOString(),
        trialStartDate: business.trialStartDate?.toISOString() || null,
        trialEndDate: business.trialEndDate?.toISOString() || null,
      }, 
      user: {
        ...user,
        salary: user.salary?.toNumber() || null,
        hourlyRate: user.hourlyRate?.toNumber() || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      } 
    };
  }, { timeout: 30000, maxWait: 10000 });

  // Send verification email outside the transaction
  await sendVerificationEmail(email, verificationToken);

    // Notify Super Admin — fire-and-forget, never blocks registration
    sendPendingApprovalNotification({
      businessName: result.business.name,
      businessType: result.business.type,
      email: email,
      phone: phone || businessPhone || ownerPhone || null,
      plan: result.business.plan || 'BASIC',
      billingPeriod: billing || requestedBillingPeriod || 'monthly',
      reason: 'NEW_REGISTRATION',
    }).catch(console.error);

    // Process Business Referral if code provided (non-affiliate)
    if (data.referralCode && !data.referralCode.startsWith("PA-")) {
      processReferral(data.referralCode, result.business.id).catch(console.error);
    }

    // Auto-generate referral code for the new business (fire-and-forget)
    getOrCreateReferralCode(result.business.id).catch(console.error);

    return result;
  } catch (error: any) {
    console.error("Registration error:", error);
    // If it's a Prisma unique constraint violation (e.g. duplicate email or slug)
    if (error.code === 'P2002') {
      return { error: "An account or business with this name/email already exists." };
    }
    return { error: error.message || "Registration failed due to a server error." };
  }
}

export async function checkUserExists(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true }
  });
  return !!user;
}

export async function getBusinessContext(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, logoUrl: true, trialEndDate: true, plan: true },
  });
  return {
    name: business?.name || "Global Admin",
    logoUrl: business?.logoUrl || null,
    trialEndDate: business?.trialEndDate,
    plan: business?.plan
  };
}

export async function getBusinessTrialStatus(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { trialEndDate: true, plan: true },
  });

  if (!business) return { canTrial: false, status: 'NO_PLAN' };

  const now = new Date();
  const trialExpired = business.trialEndDate && business.trialEndDate < now;
  
  if (business.plan !== 'FREE') return { canTrial: false, status: 'ACTIVE_SUBSCRIPTION' };
  if (trialExpired) return { canTrial: false, status: 'TRIAL_EXPIRED' };
  
  return { canTrial: true, status: 'ACTIVE_TRIAL' };
}
