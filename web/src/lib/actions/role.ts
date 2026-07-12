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

  // Filter out permissions irrelevant to the business type
  if (businessType === "CLINIC" || businessType === "HOSPITAL") {
    permissions = permissions.filter(p => !p.key.includes("restaurant") && !p.key.includes("kitchen") && !p.key.includes("bar") && !p.key.includes("tables"));
  } else if (businessType === "RESTAURANT" || businessType === "BAR") {
    permissions = permissions.filter(p => !p.key.includes("clinic") && !p.key.includes("hospital") && !p.key.includes("patients") && !p.key.includes("prescriptions"));
  } else if (businessType === "PHARMACY") {
    permissions = permissions.filter(p => !p.key.includes("restaurant") && !p.key.includes("kitchen") && !p.key.includes("bar") && !p.key.includes("clinic") && !p.key.includes("patients"));
  } else {
    // Default SHOP, BOUTIQUE, ELECTRONICS, etc.
    permissions = permissions.filter(p => !p.key.includes("restaurant") && !p.key.includes("kitchen") && !p.key.includes("clinic") && !p.key.includes("hospital") && !p.key.includes("patients") && !p.key.includes("prescriptions") && !p.key.includes("bar"));
  }

  return permissions;
}

export async function createRole(data: { name: string; permissions: string[] }) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  return await prisma.role.create({
    data: {
      name: data.name,
      businessId: session.user.businessId,
      permissions: {
        connect: data.permissions.map(id => ({ id }))
      }
    }
  });
}

export async function updateRole(id: string, data: { name: string; permissions: string[] }) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  return await prisma.role.update({
    where: { id },
    data: {
      name: data.name,
      permissions: {
        set: data.permissions.map(id => ({ id }))
      }
    }
  });
}

export async function deleteRole(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  return await prisma.role.delete({
    where: { id }
  });
}
