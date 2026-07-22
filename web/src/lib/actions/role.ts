"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getRoles() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  return await prisma.role.findMany({
    where: { businessId: session.user.businessId },
    include: { permissions: true }
  });
}

export async function getPermissions() {
  const session = await auth();
  const businessType = session?.user?.businessType || "SHOP";

  let permissions = await prisma.permission.findMany({
    orderBy: { key: "asc" }
  });

  // Comprehensive Blacklists
  const clinicBlacklist = ["restaurant", "kitchen", "bar", "tables", "recipes", "reservations", "hotel", "supermarket"];
  const restaurantBlacklist = ["clinic", "hospital", "patients", "prescriptions", "lab", "consultations", "hotel", "supermarket"];
  const pharmacyBlacklist = ["restaurant", "kitchen", "bar", "tables", "recipes", "reservations", "hotel", "supermarket", "clinic:", "consultations", "lab"];
  const standardBlacklist = ["restaurant", "kitchen", "bar", "tables", "recipes", "reservations", "hotel", "clinic", "hospital", "patients", "prescriptions", "lab", "consultations"];

  if (businessType === "CLINIC" || businessType === "HOSPITAL") {
    permissions = permissions.filter(p => !clinicBlacklist.some(term => p.key.includes(term)));
  } else if (businessType === "RESTAURANT" || businessType === "BAR") {
    permissions = permissions.filter(p => !restaurantBlacklist.some(term => p.key.includes(term)));
  } else if (businessType === "PHARMACY") {
    permissions = permissions.filter(p => !pharmacyBlacklist.some(term => p.key.includes(term)));
  } else {
    // Default SHOP, BOUTIQUE, ELECTRONICS, etc.
    permissions = permissions.filter(p => !standardBlacklist.some(term => p.key.includes(term)));
  }

  return permissions;
}

export async function createRole(data: { name: string; permissions: string[] }) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  try {
    return await prisma.role.create({
      data: {
        name: data.name,
        businessId: session.user.businessId,
        permissions: {
          connect: data.permissions.map(id => ({ id }))
        }
      }
    });
  } catch (error) {
    console.error("Error creating role:", error);
    throw new Error("Failed to create role");
  }
}

export async function updateRole(id: string, data: { name: string; permissions: string[] }) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  try {
    return await prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        permissions: {
          set: data.permissions.map(id => ({ id }))
        }
      }
    });
  } catch (error) {
    console.error("Error updating role:", error);
    throw new Error("Failed to update role");
  }
}

export async function deleteRole(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  // Prevent deleting critical system roles
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } }
  });

  if (!role) {
    throw new Error("Role not found.");
  }

  if (role.name === "ADMIN" || role.name === "SUPERADMIN") {
    throw new Error("Cannot delete core system roles.");
  }

  if (role._count.users > 0) {
    throw new Error(`Cannot delete role because it is currently assigned to ${role._count.users} staff member(s). Reassign them first.`);
  }

  await prisma.role.delete({
    where: { id }
  });

  return { success: true };
}
