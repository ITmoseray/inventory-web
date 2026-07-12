"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { BusinessType } from "@prisma/client";
import { generateVerificationToken, sendVerificationEmail, sendPendingApprovalNotification } from "@/lib/mail";
import { getSystemSettings } from "@/lib/actions/system-settings";
import { getDefaultPermissionsForRole } from "@/lib/actions/user";

export async function registerBusiness(data: any) {
  const { businessName, email, password, businessType, plan, logoUrl, phone, address, currency, timezone, businessEmail } = data;

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
        address: address,
        email: businessEmail || email,
        currency: currency || "SLL",
        timezone: timezone || "UTC",
        slug: businessName.toLowerCase().replace(/ /g, "-") + "-" + Math.random().toString(36).substring(7),
        type: businessType as BusinessType,
        plan: plan,
        status: "ACTIVE",
        logoUrl: logoUrl,
        enabledModules: ["POS", "INVENTORY"],
        trialStartDate: plan === 'FREE' ? new Date() : null,
        trialEndDate: trialEndDate,
      },
    });

    // 2. Create Default roles for the business
    const defaultRolesToCreate = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
    
    if (businessType === 'CLINIC') {
      defaultRolesToCreate.push('DOCTOR', 'NURSE', 'LAB_TECH', 'RECEPTIONIST');
    } else if (businessType === 'PHARMACY') {
      defaultRolesToCreate.push('PHARMACIST', 'CASHIER');
    } else {
      defaultRolesToCreate.push('CASHIER', 'STOCK_KEEPER');
    }

    const allPermissions = await tx.permission.findMany();

    const createdRoles = await Promise.all(
      defaultRolesToCreate.map(name => {
        const defaultKeys = getDefaultPermissionsForRole(name);
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
    const allPermissions = await tx.permission.findMany();
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
        name: "Admin",
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
  });

  // Send verification email outside the transaction
  await sendVerificationEmail(email, verificationToken);

  // Notify Super Admin — fire-and-forget, never blocks registration
  sendPendingApprovalNotification({
    businessName: result.business.name,
    businessType: result.business.type,
    email: email,
    phone: data.phone || null,
    plan: data.plan || 'FREE',
    billingPeriod: 'monthly',
    reason: 'NEW_REGISTRATION',
  }).catch(console.error);

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
