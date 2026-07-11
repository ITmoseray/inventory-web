"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function generateConsultationBill(consultationId: string, feeAmount: number, patientId: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const userId = session.user.id;
    const prisma = getTenantPrisma(businessId);

    const sale = await prisma.$transaction(async (tx) => {
      // Create Sale
      const newSale = await tx.sale.create({
        data: {
          invoiceNumber: `MED-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          totalAmount: feeAmount,
          paymentMethod: "CASH", // Default, will be updated when paid
          paymentStatus: "UNPAID",
          status: "PENDING",
          patientId: patientId,
          businessId: businessId,
          userId: userId,
          items: {
            create: [{
              productName: "Doctor Consultation Fee",
              quantity: 1,
              unitPrice: feeAmount,
              total: feeAmount,
              businessId: businessId,
            }]
          },
          statusHistory: {
            create: {
              status: "PENDING",
              note: "Medical bill generated from Consultation",
              userId: userId,
              businessId: businessId,
            }
          }
        }
      });

      // Link to Consultation
      await tx.consultation.update({
        where: { id: consultationId },
        data: { saleId: newSale.id }
      });

      return newSale;
    });

    revalidatePath("/dashboard/clinic/consultations");
    return { success: true, data: sale };
  } catch (error: any) {
    console.error("Failed to generate consultation bill:", error);
    return { success: false, error: error.message };
  }
}

export async function generateLabBill(labTestId: string, feeAmount: number, patientId: string, testName: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const userId = session.user.id;
    const prisma = getTenantPrisma(businessId);

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          invoiceNumber: `LAB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          totalAmount: feeAmount,
          paymentMethod: "CASH",
          paymentStatus: "UNPAID",
          status: "PENDING",
          patientId: patientId,
          businessId: businessId,
          userId: userId,
          items: {
            create: [{
              productName: `Lab Test: ${testName}`,
              quantity: 1,
              unitPrice: feeAmount,
              total: feeAmount,
              businessId: businessId,
            }]
          },
          statusHistory: {
            create: {
              status: "PENDING",
              note: "Medical bill generated from Laboratory",
              userId: userId,
              businessId: businessId,
            }
          }
        }
      });

      // Link to Lab Test
      await tx.labTest.update({
        where: { id: labTestId },
        data: { saleId: newSale.id }
      });

      return newSale;
    });

    revalidatePath("/dashboard/clinic/lab");
    return { success: true, data: sale };
  } catch (error: any) {
    console.error("Failed to generate lab bill:", error);
    return { success: false, error: error.message };
  }
}

export async function getPendingMedicalBills() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const prisma = getTenantPrisma(session.user.businessId);
    
    const bills = await prisma.sale.findMany({
      where: {
        businessId: session.user.businessId,
        paymentStatus: "UNPAID",
        status: "PENDING",
        patientId: { not: null }
      },
      include: {
        patient: true,
        items: true
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, data: bills };
  } catch (error: any) {
    console.error("Failed to fetch pending medical bills:", error);
    return { success: false, error: error.message };
  }
}

export async function payMedicalBill(saleId: string, paymentMethod: string, amountPaid: number, momoRef?: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");

    const prisma = getTenantPrisma(session.user.businessId);

    const sale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        paymentStatus: "PAID",
        paymentMethod: paymentMethod,
        status: "COMPLETED",
        statusHistory: {
          create: {
            status: "COMPLETED",
            note: `Medical bill paid via ${paymentMethod} ${momoRef ? `(Ref: ${momoRef})` : ""}`,
            userId: session.user.id,
            businessId: session.user.businessId,
          }
        }
      },
      include: {
        items: true,
        patient: true,
        business: true
      }
    });

    revalidatePath("/dashboard/pos");
    revalidatePath("/dashboard/sales/orders");
    
    return { success: true, data: sale };
  } catch (error: any) {
    console.error("Failed to pay medical bill:", error);
    return { success: false, error: error.message };
  }
}
