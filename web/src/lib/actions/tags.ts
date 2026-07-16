"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getTags() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const tenantPrisma = getTenantPrisma(session.user.businessId);
    const tags = await tenantPrisma.transactionTag.findMany({
      where: { businessId: session.user.businessId },
      orderBy: { name: "asc" },
    });

    return { success: true, tags: serializeData(tags) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch tags" };
  }
}

export async function createTag(data: { name: string; color: string }) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const tenantPrisma = getTenantPrisma(session.user.businessId);
    const tag = await tenantPrisma.transactionTag.create({
      data: {
        name: data.name.trim(),
        color: data.color,
        businessId: session.user.businessId,
      },
    });

    revalidatePath("/dashboard/accounting/tags");
    return { success: true, tag: serializeData(tag) };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "A tag with this name already exists." };
    }
    return { success: false, error: error.message || "Failed to create tag" };
  }
}

export async function deleteTag(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const tenantPrisma = getTenantPrisma(session.user.businessId);
    await tenantPrisma.transactionTag.delete({
      where: { id, businessId: session.user.businessId },
    });

    revalidatePath("/dashboard/accounting/tags");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete tag" };
  }
}

export async function applyTagToExpense(expenseId: string, tagId: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const tenantPrisma = getTenantPrisma(session.user.businessId);
    await tenantPrisma.expense.update({
      where: { id: expenseId, businessId: session.user.businessId },
      data: {
        tags: {
          connect: { id: tagId },
        },
      },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to apply tag" };
  }
}

export async function removeTagFromExpense(expenseId: string, tagId: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const tenantPrisma = getTenantPrisma(session.user.businessId);
    await tenantPrisma.expense.update({
      where: { id: expenseId, businessId: session.user.businessId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to remove tag" };
  }
}
