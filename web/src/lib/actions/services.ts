"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getServices() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    
    const prisma = getTenantPrisma(session.user.businessId);
    
    const services = await prisma.product.findMany({
      where: { 
        type: "SERVICE",
        deletedAt: null 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return JSON.parse(JSON.stringify(services));
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

export async function createService(data: { name: string; description: string; price: number }) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    
    const prisma = getTenantPrisma(session.user.businessId);
    
    const service = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        unitPrice: data.price,
        stockQuantity: 0,
        minStockLevel: 0,
        type: "SERVICE",
        businessId: session.user.businessId,
        status: "active",
      }
    });
    
    revalidatePath("/dashboard/services");
    return { success: true, data: JSON.parse(JSON.stringify(service)) };
  } catch (error: any) {
    console.error("Error creating service:", error);
    return { success: false, error: error.message || "Failed to create service" };
  }
}

export async function recordServiceFee(data: { serviceId: string; amount: number; paymentMethod: string; customerId?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");
    
    const prisma = getTenantPrisma(session.user.businessId);
    
    // Generate an invoice number for the sale
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `SRV-${dateStr}-${randomNum}`;
    
    const sale = await prisma.sale.create({
      data: {
        invoiceNumber,
        totalAmount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentStatus: "PAID",
        businessId: session.user.businessId,
        userId: session.user.id,
        ...(data.customerId ? { customerId: data.customerId } : {}),
        items: {
          create: [
            {
              productId: data.serviceId,
              quantity: 1,
              unitPrice: data.amount,
              total: data.amount,
            }
          ]
        }
      }
    });
    
    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/sales/history");
    return { success: true, data: JSON.parse(JSON.stringify(sale)) };
  } catch (error: any) {
    console.error("Error recording service fee:", error);
    return { success: false, error: error.message || "Failed to record fee" };
  }
}
