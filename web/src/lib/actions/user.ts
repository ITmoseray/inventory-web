"use server";

import { prisma as globalPrisma, getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/mail";
import { canPerformAction } from "@/lib/subscriptions";
import { logAudit } from "./audit";

export async function getUsers() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      console.log("USER DEBUG: No businessId in session", session?.user);
      throw new Error("Unauthorized: No business context detected.");
    }

    const businessId = session.user.businessId;
    
    // Using globalPrisma directly to ensure latest model detection
    const users = await globalPrisma.user.findMany({
      where: { businessId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        role: true
      }
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? null,
      department: u.department ?? null,
      jobTitle: u.jobTitle ?? null,
      specialization: u.specialization ?? null,
      imageUrl: u.imageUrl ?? null,
      isActive: u.status === "active",
      businessId: u.businessId,
      roleId: u.roleId ?? null,
      roleName: u.role?.name || "No Role",
      salary: u.salary?.toNumber() ?? null,
      hourlyRate: u.hourlyRate?.toNumber() ?? null,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      deletedAt: u.deletedAt?.toISOString() ?? null,
    }));
  } catch (error: any) {
    console.error("USER ERROR (getUsers):", error);
    throw new Error(`Failed to fetch user nodes: ${error.message}`);
  }
}

export async function getDefaultPermissionsForRole(roleName: string): Promise<string[]> {
  switch (roleName) {
    case 'DOCTOR': return ['menu:overview', 'menu:clinic:overview', 'menu:clinic:appointments', 'menu:clinic:consultations', 'menu:patients', 'menu:prescriptions', 'menu:clinic:lab'];
    case 'NURSE': return ['menu:overview', 'menu:clinic:overview', 'menu:patients', 'menu:prescriptions', 'menu:clinic:appointments'];
    case 'LAB_TECH': return ['menu:overview', 'menu:clinic:lab', 'menu:inventory'];
    case 'RECEPTIONIST': return ['menu:overview', 'menu:clinic:appointments', 'menu:sales', 'menu:patients'];
    case 'PHARMACIST': return ['menu:overview', 'menu:inventory', 'menu:prescriptions', 'menu:patients', 'menu:sales'];
    case 'CASHIER': return ['menu:overview', 'menu:sales'];
    case 'STOCK_KEEPER': return ['menu:overview', 'menu:inventory', 'menu:purchases:suppliers'];
    default: return ['menu:overview'];
  }
}

export async function getRoles() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const prisma = getTenantPrisma(session.user.businessId);
    const businessType = session.user.businessType || "SHOP";

    let roles = await prisma.role.findMany({
      include: { permissions: true },
      orderBy: { name: "asc" }
    });

    const roleNames = roles.map(r => r.name.toUpperCase());
    const rolesToCreate = [];

    if (businessType === "CLINIC") {
      if (!roleNames.includes("DOCTOR")) rolesToCreate.push("DOCTOR");
      if (!roleNames.includes("NURSE")) rolesToCreate.push("NURSE");
      if (!roleNames.includes("LAB_TECH")) rolesToCreate.push("LAB_TECH");
      if (!roleNames.includes("RECEPTIONIST")) rolesToCreate.push("RECEPTIONIST");
    } else if (businessType === "PHARMACY") {
      if (!roleNames.includes("PHARMACIST")) rolesToCreate.push("PHARMACIST");
      if (!roleNames.includes("CASHIER")) rolesToCreate.push("CASHIER");
    } else {
      if (!roleNames.includes("CASHIER")) rolesToCreate.push("CASHIER");
      if (!roleNames.includes("STOCK_KEEPER")) rolesToCreate.push("STOCK_KEEPER");
    }

    const allPerms = await prisma.permission.findMany();

    if (rolesToCreate.length > 0) {
      await Promise.all(rolesToCreate.map(async (name) => {
        const defaultKeys = await getDefaultPermissionsForRole(name);
        const permIds = allPerms.filter(p => defaultKeys.includes(p.key)).map(p => ({ id: p.id }));

        return prisma.role.create({
          data: {
            name,
            businessId: session.user.businessId,
            permissions: { connect: permIds }
          }
        });
      }));

      roles = await prisma.role.findMany({
        include: { permissions: true },
        orderBy: { name: "asc" }
      });
    }

    // Auto-heal existing roles that have 0 permissions
    let healed = false;
    for (const role of roles) {
      if (role.permissions.length === 0 && role.name.toUpperCase() !== "SUPERADMIN") {
        const defaultKeys = await getDefaultPermissionsForRole(role.name.toUpperCase());
        const permIds = allPerms.filter(p => defaultKeys.includes(p.key)).map(p => ({ id: p.id }));
        if (permIds.length > 0) {
          await prisma.role.update({
            where: { id: role.id },
            data: { permissions: { connect: permIds } }
          });
          healed = true;
        }
      }
    }

    if (healed) {
      roles = await prisma.role.findMany({
        include: { permissions: true },
        orderBy: { name: "asc" }
      });
    }

    return roles;
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    throw error;
  }
}

export async function createUser(data: { 
  name: string; 
  email: string; 
  password: string; 
  roleId: string; 
  specialization?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  imageUrl?: string;
  salary?: number;
  hourlyRate?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized: No business session.");

    const businessId = session.user.businessId;

    // 1. Check Plan Limits
    const business = await globalPrisma.business.findUnique({
      where: { id: businessId },
      select: { 
        plan: true, 
        _count: { select: { users: { where: { deletedAt: null } } } } 
      }
    });

    const userCount = business?._count?.users ?? 0;
    const plan = business?.plan ?? "FREE";

    const check = canPerformAction(plan, "maxStaff", userCount);
    if (!check.allowed) throw new Error(check.message);

    // 2. Validate roleId belongs to this business
    let targetRoleId = data.roleId;
    if (targetRoleId) {
      const roleExists = await globalPrisma.role.findFirst({
        where: { id: targetRoleId, businessId },
        select: { id: true }
      });
      if (!roleExists) {
        // Fall back to first available role for this business
        const fallbackRole = await globalPrisma.role.findFirst({
          where: { businessId },
          select: { id: true }
        });
        if (!fallbackRole) throw new Error("No roles found for this business. Please set up roles first.");
        targetRoleId = fallbackRole.id;
      }
    } else {
      const fallbackRole = await globalPrisma.role.findFirst({
        where: { businessId },
        select: { id: true }
      });
      if (!fallbackRole) throw new Error("No roles found for this business. Please set up roles first.");
      targetRoleId = fallbackRole.id;
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);
    const verificationToken = generateVerificationToken();

    // 4. Create the user
    const user = await globalPrisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        passwordHash,
        roleId: targetRoleId,
        businessId,
        verificationToken,
        specialization: data.specialization || null,
        phone: data.phone || null,
        department: data.department || null,
        jobTitle: data.jobTitle || null,
        imageUrl: data.imageUrl || null,
        salary: data.salary ?? null,
        hourlyRate: data.hourlyRate ?? null,
      },
    });

    // 5. Fire-and-forget non-critical side effects
    logAudit({
      action: "CREATE_USER",
      entity: "USER",
      entityId: user.id,
      newData: { name: user.name, email: user.email }
    }).catch((e) => console.error("logAudit failed:", e));

    sendVerificationEmail(user.email, verificationToken)
      .catch((e) => console.error("sendVerificationEmail failed:", e));

    // Note: No revalidatePath here — the client calls fetchData() on success.
    // 6. Return only plain serializable values (NO Decimal / Date objects)
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name ?? "",
        email: user.email,
        roleId: user.roleId,
        businessId: user.businessId,
        phone: user.phone ?? null,
        department: user.department ?? null,
        jobTitle: user.jobTitle ?? null,
        specialization: user.specialization ?? null,
        salary: user.salary ? Number(user.salary) : null,
        hourlyRate: user.hourlyRate ? Number(user.hourlyRate) : null,
        createdAt: user.createdAt.toISOString(),
      }
    };
  } catch (error: any) {
    console.error("createUser ERROR:", error?.message, error?.code, error?.stack);
    throw new Error(error?.message ?? "Failed to create user. Please try again.");
  }
}


export async function changePassword(data: { current: string; new: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await globalPrisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(data.current, user.passwordHash);
    if (!isMatch) throw new Error("Current password incorrect");

    const newHash = await bcrypt.hash(data.new, 10);

    await globalPrisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Password change failed:", error);
    throw error;
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const prisma = getTenantPrisma(session.user.businessId);

    const user = await prisma.user.update({
      where: { id, businessId: session.user.businessId },
      data,
    });

    await logAudit({
      action: "UPDATE",
      entity: "USER",
      entityId: user.id,
      newData: data
    });

    revalidatePath("/dashboard/settings");
    return {
      ...user,
      salary: user.salary?.toNumber() || null,
      hourlyRate: user.hourlyRate?.toNumber() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      deletedAt: user.deletedAt?.toISOString() || null,
    };
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Prevent self-deletion
    if (session.user.id === id) throw new Error("You cannot delete your own admin account");

    const prisma = getTenantPrisma(session.user.businessId);

    await prisma.user.update({
      where: { id, businessId: session.user.businessId },
      data: { deletedAt: new Date(), status: "inactive" }
    });

    await logAudit({
      action: "DELETE",
      entity: "USER",
      entityId: id,
    });

    revalidatePath("/dashboard/settings");
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error;
  }
}
