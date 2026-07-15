"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";

export async function getInvoices() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    
    const prisma = getTenantPrisma(session.user.businessId);
    
    const invoices = await prisma.invoice.findMany({
      where: { deletedAt: null },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

export async function getInvoiceById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    
    const prisma = getTenantPrisma(session.user.businessId);
    
    const invoice = await prisma.invoice.findUnique({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        },
        payments: true,
        business: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
            logoUrl: true
          }
        }
      }
    });
    
    return invoice;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
}

export async function createInvoice(data: {
  customerId?: string;
  issueDate: Date;
  dueDate: Date;
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  items: {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");
    
    const businessId = session.user.businessId;
    const prisma = getTenantPrisma(businessId);
    
    const invoice = await prisma.$transaction(async (tx) => {
      // Create Invoice
      const newInvoice = await tx.invoice.create({
        data: {
          businessId,
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          customerId: data.customerId,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          subTotal: data.subTotal,
          taxRate: data.taxRate,
          taxAmount: data.taxAmount,
          discountAmount: data.discountAmount,
          totalAmount: data.totalAmount,
          balanceDue: data.totalAmount, // Initially, balance due is the full amount
          status: "UNPAID",
          notes: data.notes,
          terms: data.terms,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total
            }))
          }
        }
      });
      
      // Optionally decrement stock if products are linked
      for (const item of data.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
          });
          
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              businessId,
              userId: session.user.id!,
              type: "OUT",
              quantity: item.quantity,
              reason: `Invoice Generated: ${newInvoice.invoiceNumber}`,
            }
          });
        }
      }
      
      return newInvoice;
    });

    await logAudit(businessId, session.user.id, "Create Invoice", `Created Invoice ${invoice.invoiceNumber}`);
    revalidatePath("/dashboard/sales/invoices");
    return { success: true, id: invoice.id };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function deleteInvoice(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    
    const prisma = getTenantPrisma(session.user.businessId);
    
    await prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date(), status: "CANCELLED" }
    });
    
    revalidatePath("/dashboard/sales/invoices");
    return { success: true };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return { success: false };
  }
}

export async function recordInvoicePayment(id: string, amount: number, method: string, ref?: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");
    
    const businessId = session.user.businessId;
    const prisma = getTenantPrisma(businessId);
    
    await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id } });
      if (!invoice) throw new Error("Invoice not found");
      
      const newBalance = Number(invoice.balanceDue) - amount;
      const newStatus = newBalance <= 0 ? "PAID" : "PARTIAL";
      
      await tx.payment.create({
        data: {
          businessId,
          invoiceId: id,
          amount,
          paymentMethod: method,
          paymentRef: ref
        }
      });
      
      await tx.invoice.update({
        where: { id },
        data: {
          balanceDue: newBalance < 0 ? 0 : newBalance,
          status: newStatus
        }
      });
    });
    
    await logAudit(businessId, session.user.id, "Record Invoice Payment", `Recorded payment for invoice ${id}`);
    revalidatePath(`/dashboard/sales/invoices/${id}`);
    revalidatePath("/dashboard/sales/invoices");
    return { success: true };
  } catch (error) {
    console.error("Error recording invoice payment:", error);
    return { success: false, error: "Failed to record payment" };
  }
}
