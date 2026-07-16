"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getQuotes() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const tenantPrisma = getTenantPrisma(businessId);

    const quotes = await tenantPrisma.quote.findMany({
      where: { businessId },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, quotes: serializeData(quotes) };
  } catch (error: any) {
    console.error("Failed to fetch quotes:", error);
    return { success: false, error: error.message || "Failed to fetch quotes" };
  }
}

export async function createQuote(data: {
  reference: string;
  customerId?: string;
  validUntil?: Date;
  notes?: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const tenantPrisma = getTenantPrisma(businessId);

    if (!data.items || data.items.length === 0) {
      return { success: false, error: "Quote must have at least one item." };
    }

    // Calculate total using plain JS arithmetic
    let totalAmount = 0;
    const quoteItems = data.items.map(item => {
      const amount = Number(item.quantity) * Number(item.unitPrice);
      totalAmount += amount;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: amount,
      };
    });

    const quote = await tenantPrisma.quote.create({
      data: {
        reference: data.reference,
        customerId: data.customerId || null,
        notes: data.notes || null,
        validUntil: data.validUntil || null,
        totalAmount: totalAmount,
        businessId,
        items: {
          create: quoteItems
        }
      },
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    });

    revalidatePath("/dashboard/sales/quotes");
    return { success: true, quote: serializeData(quote) };
  } catch (error: any) {
    console.error("Failed to create quote:", error);
    if (error.code === 'P2002') {
       return { success: false, error: "A quote with this reference already exists." };
    }
    return { success: false, error: error.message || "Failed to create quote" };
  }
}

export async function updateQuoteStatus(id: string, status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CONVERTED") {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const tenantPrisma = getTenantPrisma(session.user.businessId);

    const quote = await tenantPrisma.quote.update({
      where: { id, businessId: session.user.businessId },
      data: { status }
    });

    revalidatePath("/dashboard/sales/quotes");
    return { success: true, quote: serializeData(quote) };
  } catch (error: any) {
    console.error("Failed to update quote status:", error);
    return { success: false, error: error.message || "Failed to update status" };
  }
}
