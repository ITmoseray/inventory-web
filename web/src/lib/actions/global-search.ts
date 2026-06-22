"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function performGlobalSearch(query: string) {
  const session = await auth();
  if (!session?.user?.businessId) {
    throw new Error("Unauthorized");
  }

  const businessId = session.user.businessId;

  if (!query || query.length < 2) {
    return {
      products: [],
      customers: [],
      sales: [],
      expenses: [],
    };
  }

  const searchFilter = { contains: query, mode: "insensitive" as const };

  const [products, customers, sales, expenses] = await Promise.all([
    // Products
    prisma.product.findMany({
      where: {
        businessId,
        deletedAt: null,
        OR: [{ name: searchFilter }, { sku: searchFilter }, { barcode: searchFilter }],
      },
      take: 5,
      select: { id: true, name: true, sku: true, unitPrice: true, stockQuantity: true },
    }),

    // Customers
    prisma.customer.findMany({
      where: {
        businessId,
        deletedAt: null,
        OR: [{ name: searchFilter }, { phone: searchFilter }, { email: searchFilter }],
      },
      take: 5,
      select: { id: true, name: true, phone: true },
    }),

    // Sales (Invoices)
    prisma.sale.findMany({
      where: {
        businessId,
        deletedAt: null,
        invoiceNumber: searchFilter,
      },
      take: 5,
      select: { id: true, invoiceNumber: true, totalAmount: true, createdAt: true },
    }),

    // Expenses
    prisma.expense.findMany({
      where: {
        businessId,
        deletedAt: null,
        OR: [{ description: searchFilter }, { category: searchFilter }],
      },
      take: 5,
      select: { id: true, description: true, amount: true, category: true },
    }),
  ]);

  // We convert Decimals to numbers so it can safely cross the Server-Client boundary
  return {
    products: products.map((p) => ({
      ...p,
      unitPrice: Number(p.unitPrice),
      stockQuantity: Number(p.stockQuantity),
    })),
    customers,
    sales: sales.map((s) => ({
      ...s,
      totalAmount: Number(s.totalAmount),
    })),
    expenses: expenses.map((e) => ({
      ...e,
      amount: Number(e.amount),
    })),
  };
}
