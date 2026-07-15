'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.businessId) {
    throw new Error("Unauthorized");
  }
  return { session, businessId: session.user.businessId };
}

// === INVOICES ===

export async function getInvoices() {
  const { businessId } = await getAuthSession();
  return prisma.schoolInvoice.findMany({
    where: { businessId },
    include: {
      student: true,
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createInvoice(data: {
  studentId: string;
  title: string;
  description?: string;
  totalAmount: number;
  dueDate: string;
}) {
  const { businessId } = await getAuthSession();
  
  try {
    await prisma.schoolInvoice.create({
      data: {
        businessId,
        studentId: data.studentId,
        title: data.title,
        description: data.description,
        totalAmount: data.totalAmount,
        dueDate: new Date(data.dueDate),
        status: 'PENDING'
      }
    });

    revalidatePath('/dashboard/school/payments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === PAYMENTS ===

export async function logPayment(data: {
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
}) {
  const { businessId } = await getAuthSession();
  
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create Payment
      const payment = await tx.schoolPayment.create({
        data: {
          businessId,
          studentId: data.studentId,
          invoiceId: data.invoiceId,
          amount: data.amount,
          paymentDate: new Date(),
          paymentMethod: data.paymentMethod,
          status: 'PAID'
        }
      });

      // 2. Update Invoice Status
      const invoice = await tx.schoolInvoice.findUnique({
        where: { id: data.invoiceId },
        include: { payments: true }
      });

      if (invoice) {
        // Calculate new total paid including this new payment (which is already in the DB, so we can just sum)
        const allPayments = await tx.schoolPayment.aggregate({
          where: { invoiceId: data.invoiceId },
          _sum: { amount: true }
        });
        
        const totalPaid = Number(allPayments._sum.amount || 0);
        const totalAmount = Number(invoice.totalAmount);
        
        let newStatus = 'PENDING';
        if (totalPaid >= totalAmount) {
          newStatus = 'PAID';
        } else if (totalPaid > 0) {
          newStatus = 'PARTIAL';
        }

        await tx.schoolInvoice.update({
          where: { id: data.invoiceId },
          data: { status: newStatus }
        });
      }
    });

    revalidatePath('/dashboard/school/payments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
