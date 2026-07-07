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
      }
    });

    if (!sale) return null;

    return {
      id: sale.id,
      transactionId: sale.transactionId,
      date: sale.createdAt,
      totalAmount: Number(sale.totalAmount?.toString() || 0),
      amountPaid: Number(sale.amountPaid?.toString() || 0),
      balance: Number(sale.balance?.toString() || 0),
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
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice?.toString() || 0),
        subtotal: Number(item.subtotal?.toString() || 0),
      }))
    };
  } catch (error) {
    console.error("Error fetching public receipt:", error);
    return null;
  }
}
