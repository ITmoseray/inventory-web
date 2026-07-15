"use server";

import { prisma } from "@/lib/prisma";

export async function getPublicInvoice(saleId: string) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        business: {
          select: {
            name: true,
            logoUrl: true,
            address: true,
            phone: true,
            email: true,
            currency: true,
          }
        },
        customer: {
          select: { name: true, phone: true, email: true }
        },
        staff: {
          select: { name: true, jobTitle: true, phone: true }
        },
        items: {
          include: {
            product: {
              select: { name: true, description: true, type: true }
            }
          }
        }
      }
    });

    if (!sale) return null;

    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    console.error("Error fetching public invoice:", error);
    return null;
  }
}
