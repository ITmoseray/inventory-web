"use server";

import { prisma as db } from "@/lib/prisma";

export async function getPublicReceipt(saleId: string) {
  try {
    const sale = await db.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        business: true,
        debt: true,
      }
    });

    if (!sale) {
      if (saleId.startsWith("INV")) {
        return { error: "This receipt was generated offline and is currently syncing to the cloud. Please try again in a few minutes." };
      }
      return { error: "This receipt could not be found. It may have been deleted or the link is invalid." };
    }

    const totalAmount = Number(sale.totalAmount?.toString() || 0);
    const amountPaid = sale.paymentMethod === 'CREDIT' && sale.debt 
      ? Number(sale.debt.paidAmount?.toString() || 0)
      : totalAmount;
    const balance = Math.max(0, totalAmount - amountPaid);

    return {
      id: sale.id,
      transactionId: sale.invoiceNumber,
      date: sale.createdAt,
      totalAmount,
      amountPaid,
      balance,
      paymentMethod: sale.paymentMethod,
      paymentStatus: sale.paymentStatus,
      status: sale.status,
      business: {
        name: sale.business.name,
        address: sale.business.address,
        phone: sale.business.phone,
        email: sale.business.email,
        logoUrl: sale.business.logoUrl,
      },
      customer: sale.customer ? {
        name: sale.customer.name,
        phone: sale.customer.phone,
      } : null,
      items: sale.items.map(item => ({
        id: item.id,
        name: item.productName || item.product?.name || "Unknown Item",
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice?.toString() || 0),
        subtotal: Number(item.total?.toString() || 0),
      }))
    };
  } catch (error: any) {
    console.error("Error fetching public receipt:", error);
    return { error: error.message || "An unexpected error occurred while generating the receipt." };
  }
}
