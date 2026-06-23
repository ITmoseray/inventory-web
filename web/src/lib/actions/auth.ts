"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { BusinessType } from "@prisma/client";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/mail";
import { getSystemSettings } from "@/lib/actions/system-settings";

export async function registerBusiness(data: any) {
  const { businessName, email, password, businessType, plan, logoUrl, phone } = data;

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = generateVerificationToken();

  // Use a transaction to create both
  const result = await prisma.$transaction(async (tx) => {
    // 1. Check if user already exists (should be done before calling this, but for safety)
    const existingUser = await tx.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("An account already exists for this email address.");

    // 2. Create Business
    // The current logic sets a 7-day trial for FREE plans.
    // To satisfy "prevent users from starting another free trial", 
    // maybe we only set trial if they are truly new?
    // For now, let's keep it as is, as registration is the start of the journey.
    
    const settings = await getSystemSettings().catch(() => ({ defaultTrialDays: 7 }));
    const trialEndDate = plan === 'FREE' ? new Date(Date.now() + settings.defaultTrialDays * 24 * 60 * 60 * 1000) : null;

    const business = await tx.business.create({
      data: {
        name: businessName,
        phone: phone,
        slug: businessName.toLowerCase().replace(/ /g, "-") + "-" + Math.random().toString(36).substring(7),
        type: businessType as BusinessType,
        plan: plan,
        status: plan === 'FREE' ? "PENDING" : "ACTIVE",
        logoUrl: logoUrl,
        enabledModules: ["POS", "INVENTORY"],
        trialStartDate: plan === 'FREE' ? new Date() : null,
        trialEndDate: trialEndDate,
      },
    });

    // 2. Create Default roles for the business
    const [adminRole, managerRole, employeeRole] = await Promise.all([
      tx.role.create({ data: { name: 'ADMIN', businessId: business.id } }),
      tx.role.create({ data: { name: 'MANAGER', businessId: business.id } }),
      tx.role.create({ data: { name: 'EMPLOYEE', businessId: business.id } }),
    ]);

    // 2b. Auto-assign all permissions to ADMIN role
    const allPermissions = await tx.permission.findMany();
    if (allPermissions.length > 0) {
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
        name: "Admin",
        roleId: adminRole.id,
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
  });

  // Send verification email outside the transaction
  await sendVerificationEmail(email, verificationToken);

  return result;
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
