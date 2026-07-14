"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPatientBill(patientId: string, description: string, amount: number) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const userId = session.user.id;
    const prisma = getTenantPrisma(businessId);

    const sale = await prisma.sale.create({
      data: {
        invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        totalAmount: amount,
        paymentMethod: "CASH",
        paymentStatus: "PENDING",
        status: "PENDING",
        patientId: patientId,
        businessId: businessId,
        userId: userId,
        items: {
          create: [{
            productName: description,
            quantity: 1,
            unitPrice: amount,
            total: amount,
            businessId: businessId,
          }]
        },
        statusHistory: {
          create: {
            status: "PENDING",
            note: `Manual patient bill generated: ${description}`,
            userId: userId,
            businessId: businessId,
          }
        }
      }
    });

    revalidatePath(`/dashboard/patients/${patientId}`);
    return { success: true, data: sale };
  } catch (error: any) {
    console.error("Failed to create patient bill:", error);
    return { success: false, error: error.message };
  }
}

export async function payPatientBill(saleId: string, patientId: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");

    const prisma = getTenantPrisma(session.user.businessId);

    const sale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        paymentStatus: "PAID",
        status: "COMPLETED",
        statusHistory: {
          create: {
            status: "COMPLETED",
            note: "Patient bill paid in full",
            userId: session.user.id,
            businessId: session.user.businessId,
          }
        }
      }
    });

    revalidatePath(`/dashboard/patients/${patientId}`);
    return { success: true, data: sale };
  } catch (error: any) {
    console.error("Failed to pay patient bill:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePatientBill(saleId: string, patientId: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const prisma = getTenantPrisma(session.user.businessId);

    // Delete related sale items and status history first (cascade might handle it, but to be safe)
    await prisma.$transaction(async (tx) => {
      await tx.saleItem.deleteMany({ where: { saleId } });
      await tx.saleStatusHistory.deleteMany({ where: { saleId } });
      await tx.sale.delete({ where: { id: saleId } });
    });

    revalidatePath(`/dashboard/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete patient bill:", error);
    return { success: false, error: error.message };
  }
}
