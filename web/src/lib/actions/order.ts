"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getOrders() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const orders = await prisma.sale.findMany({
      where: { businessId: session.user.businessId },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map(o => ({
      ...o,
      totalAmount: o.totalAmount.toNumber(),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
}
