"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";

export async function getCustomers() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const customers = await prisma.customer.findMany({
      where: { businessId: session.user.businessId },
      include: { sales: { select: { totalAmount: true } } },
      orderBy: { createdAt: "desc" },
    });

    return customers.map(c => {
      const totalSpend = c.sales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
      return {
        ...c,
        sales: undefined, // remove raw sales array from response payload
        totalSpend,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    throw error;
  }
}

export async function createCustomer(data: { name: string; email?: string; phone?: string; address?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const customer = await prisma.customer.create({
      data: {
        ...data,
        businessId: session.user.businessId,
      },
    });

    await logAudit({
      action: `Created Customer: ${customer.name}`,
      entity: "CUSTOMER",
      entityId: customer.id,
      newData: customer
    });

    revalidatePath("/dashboard/customers");
    return {
      ...customer,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Failed to create customer:", error);
    throw error;
  }
}

export async function updateCustomer(id: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const customer = await prisma.customer.update({
      where: { id, businessId: session.user.businessId },
      data,
    });

    await logAudit({
      action: `Updated Customer: ${customer.name}`,
      entity: "CUSTOMER",
      entityId: customer.id,
      newData: customer
    });

    revalidatePath("/dashboard/customers");
    return {
      ...customer,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Failed to update customer:", error);
    throw error;
  }
}

export async function deleteCustomer(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const deletedCustomer = await prisma.customer.delete({
      where: { id, businessId: session.user.businessId },
    });

    await logAudit({
      action: `Deleted Customer: ${deletedCustomer.name}`,
      entity: "CUSTOMER",
      entityId: id
    });

    revalidatePath("/dashboard/customers");
  } catch (error) {
    console.error("Failed to delete customer:", error);
    throw error;
  }
}

export async function importCustomers(rows: { name: string; email?: string; phone?: string; address?: string }[]) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    let created = 0;

    await prisma.$transaction(async (tx) => {
      for (const row of rows) {
        if (!row.name?.trim()) continue;
        await tx.customer.create({
          data: {
            name: row.name.trim(),
            email: row.email?.trim() || null,
            phone: row.phone?.trim() || null,
            address: row.address?.trim() || null,
            businessId,
          },
        });
        created++;
      }
    });

    await logAudit({
      action: `Bulk imported ${created} customers via CSV`,
      entity: "CUSTOMER",
      entityId: businessId,
    });

    revalidatePath("/dashboard/customers");
    return { success: true, count: created };
  } catch (error) {
    console.error("Failed to import customers:", error);
    throw error;
  }
}
