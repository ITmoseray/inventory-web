"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate a sequential SO number: SO-000001, SO-000002, … */
async function generateSoNumber(businessId: string): Promise<string> {
  const count = await prisma.salesOrder.count({ where: { businessId } });
  return `SO-${String(count + 1).padStart(6, "0")}`;
}

function serializeSalesOrder(order: any) {
  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    tax: Number(order.tax),
    orderDate: order.orderDate?.toISOString?.() ?? order.orderDate,
    expectedDate: order.expectedDate?.toISOString?.() ?? order.expectedDate ?? null,
    createdAt: order.createdAt?.toISOString?.() ?? order.createdAt,
    updatedAt: order.updatedAt?.toISOString?.() ?? order.updatedAt,
    deletedAt: order.deletedAt?.toISOString?.() ?? order.deletedAt ?? null,
    items: (order.items ?? []).map((item: any) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    })),
    statusHistory: (order.statusHistory ?? []).map((h: any) => ({
      ...h,
      createdAt: h.createdAt?.toISOString?.() ?? h.createdAt,
    })),
  };
}

// ─── Create ─────────────────────────────────────────────────────────────────

export async function createSalesOrder(data: {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerId?: string;
  deliveryAddress?: string;
  billingAddress?: string;
  paymentTerms?: string;
  deliveryMethod?: string;
  expectedDate?: string;
  notes?: string;
  discount?: number;
  tax?: number;
  status?: "DRAFT" | "PENDING";
  items: {
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}) {
  const session = await auth();
  if (!session?.user?.businessId || !session?.user?.id)
    throw new Error("Unauthorized");

  const businessId = session.user.businessId;
  const userId = session.user.id;

  const subtotal = data.items.reduce((sum, i) => sum + i.total, 0);
  const discount = data.discount ?? 0;
  const tax = data.tax ?? 0;
  const totalAmount = subtotal - discount + tax;
  const soNumber = await generateSoNumber(businessId);
  const status = data.status ?? "DRAFT";

  const order = await prisma.salesOrder.create({
    data: {
      soNumber,
      businessId,
      userId,
      customerId: data.customerId ?? null,
      customerName: data.customerName,
      customerEmail: data.customerEmail ?? null,
      customerPhone: data.customerPhone ?? null,
      deliveryAddress: data.deliveryAddress ?? null,
      billingAddress: data.billingAddress ?? null,
      paymentTerms: data.paymentTerms ?? "Due on Receipt",
      deliveryMethod: data.deliveryMethod ?? null,
      expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
      notes: data.notes ?? null,
      discount,
      tax,
      subtotal,
      totalAmount,
      status,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId ?? null,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          businessId,
        })),
      },
      statusHistory: {
        create: {
          status,
          note: status === "DRAFT" ? "Sales order created as draft" : "Sales order submitted for approval",
          userId,
        },
      },
    },
    include: { items: true, statusHistory: true },
  });

  revalidatePath("/dashboard/sales/orders");
  return serializeSalesOrder(order);
}

// ─── List ────────────────────────────────────────────────────────────────────

export async function getSalesOrders(range?: { start: Date; end: Date }) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const where: any = {
    businessId: session.user.businessId,
    deletedAt: null,
  };

  if (range) {
    where.orderDate = { gte: range.start, lte: range.end };
  }

  const orders = await prisma.salesOrder.findMany({
    where,
    include: {
      items: true,
      customer: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(serializeSalesOrder);
}

// ─── Get by ID ──────────────────────────────────────────────────────────────

export async function getSalesOrderById(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const order = await prisma.salesOrder.findFirst({
    where: { id, businessId: session.user.businessId, deletedAt: null },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, sku: true, stockQuantity: true, unitPrice: true },
          },
        },
      },
      customer: true,
      statusHistory: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) throw new Error("Sales order not found");
  return serializeSalesOrder(order);
}

// ─── Update Status ───────────────────────────────────────────────────────────

const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT:      ["PENDING", "CANCELLED"],
  PENDING:    ["CONFIRMED", "CANCELLED"],
  CONFIRMED:  ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED:    ["DELIVERED", "CANCELLED"],
  DELIVERED:  ["COMPLETED", "CANCELLED"],
  COMPLETED:  [],
  CANCELLED:  [],
};

export async function updateSalesOrderStatus(
  id: string,
  newStatus: string,
  note?: string
) {
  const session = await auth();
  if (!session?.user?.businessId || !session?.user?.id)
    throw new Error("Unauthorized");

  const order = await prisma.salesOrder.findFirst({
    where: { id, businessId: session.user.businessId, deletedAt: null },
  });
  if (!order) throw new Error("Sales order not found");

  const allowed = STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Cannot transition from ${order.status} to ${newStatus}`
    );
  }

  const updated = await prisma.salesOrder.update({
    where: { id },
    data: {
      status: newStatus,
      statusHistory: {
        create: {
          status: newStatus,
          note: note ?? `Status updated to ${newStatus}`,
          userId: session.user.id,
        },
      },
    },
    include: { items: true, statusHistory: true },
  });

  revalidatePath("/dashboard/sales/orders");
  revalidatePath(`/dashboard/sales/orders/${id}`);
  return serializeSalesOrder(updated);
}

// ─── Update (edit) ───────────────────────────────────────────────────────────

export async function updateSalesOrder(
  id: string,
  data: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerId?: string;
    deliveryAddress?: string;
    billingAddress?: string;
    paymentTerms?: string;
    deliveryMethod?: string;
    expectedDate?: string;
    notes?: string;
    discount?: number;
    tax?: number;
    items?: {
      productId?: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
  }
) {
  const session = await auth();
  if (!session?.user?.businessId || !session?.user?.id)
    throw new Error("Unauthorized");

  const order = await prisma.salesOrder.findFirst({
    where: { id, businessId: session.user.businessId, deletedAt: null },
  });
  if (!order) throw new Error("Sales order not found");
  if (!["DRAFT", "PENDING"].includes(order.status)) {
    throw new Error("Only DRAFT or PENDING orders can be edited");
  }

  const businessId = session.user.businessId;
  let updateData: any = {};

  if (data.customerName !== undefined) updateData.customerName = data.customerName;
  if (data.customerEmail !== undefined) updateData.customerEmail = data.customerEmail;
  if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone;
  if (data.customerId !== undefined) updateData.customerId = data.customerId;
  if (data.deliveryAddress !== undefined) updateData.deliveryAddress = data.deliveryAddress;
  if (data.billingAddress !== undefined) updateData.billingAddress = data.billingAddress;
  if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms;
  if (data.deliveryMethod !== undefined) updateData.deliveryMethod = data.deliveryMethod;
  if (data.expectedDate !== undefined) updateData.expectedDate = data.expectedDate ? new Date(data.expectedDate) : null;
  if (data.notes !== undefined) updateData.notes = data.notes;

  if (data.items !== undefined) {
    const subtotal = data.items.reduce((sum, i) => sum + i.total, 0);
    const discount = data.discount ?? Number(order.discount);
    const tax = data.tax ?? Number(order.tax);
    const totalAmount = subtotal - discount + tax;
    updateData.subtotal = subtotal;
    updateData.discount = discount;
    updateData.tax = tax;
    updateData.totalAmount = totalAmount;

    // Replace items
    await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: id } });
    updateData.items = {
      create: data.items.map((item) => ({
        productId: item.productId ?? null,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        businessId,
      })),
    };
  }

  const updated = await prisma.salesOrder.update({
    where: { id },
    data: updateData,
    include: { items: true, statusHistory: true },
  });

  revalidatePath("/dashboard/sales/orders");
  revalidatePath(`/dashboard/sales/orders/${id}`);
  return serializeSalesOrder(updated);
}

// ─── Delete (soft) ───────────────────────────────────────────────────────────

export async function deleteSalesOrder(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const order = await prisma.salesOrder.findFirst({
    where: { id, businessId: session.user.businessId, deletedAt: null },
  });
  if (!order) throw new Error("Sales order not found");
  if (!["DRAFT", "CANCELLED"].includes(order.status)) {
    throw new Error("Only DRAFT or CANCELLED orders can be deleted");
  }

  await prisma.salesOrder.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard/sales/orders");
}

// ─── Convert to Invoice ──────────────────────────────────────────────────────

export async function convertSalesOrderToInvoice(id: string) {
  const session = await auth();
  if (!session?.user?.businessId || !session?.user?.id)
    throw new Error("Unauthorized");

  const businessId = session.user.businessId;
  const userId = session.user.id;

  const order = await prisma.salesOrder.findFirst({
    where: { id, businessId, deletedAt: null },
    include: { items: true },
  });
  if (!order) throw new Error("Sales order not found");
  if (!["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)) {
    throw new Error("Only confirmed/processing/shipped/delivered orders can be converted to invoices");
  }
  if (order.convertedSaleId) {
    throw new Error("This order has already been converted to an invoice");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the Sale (Invoice)
    const invoiceNumber = `INV-SO-${Date.now()}`;
    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        totalAmount: order.totalAmount,
        discount: order.discount,
        paymentMethod: "CASH",
        paymentStatus: "PENDING",
        status: "PENDING",
        businessId,
        userId,
        customerId: order.customerId ?? null,
        items: {
          create: order.items.map((item) => ({
            productId: item.productId ?? null,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            businessId,
          })),
        },
        statusHistory: {
          create: {
            status: "PENDING",
            note: `Converted from Sales Order ${order.soNumber}`,
            userId,
            businessId,
          },
        },
      },
    });

    // 2. Deduct stock for all inventory-linked items
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: item.quantity,
            reason: `Sales Order ${order.soNumber} converted to Invoice ${invoiceNumber}`,
            businessId,
            userId,
          },
        });
      }
    }

    // 3. Mark SO as COMPLETED and record the converted sale ID
    await tx.salesOrder.update({
      where: { id },
      data: {
        status: "COMPLETED",
        convertedSaleId: sale.id,
        statusHistory: {
          create: {
            status: "COMPLETED",
            note: `Converted to Invoice ${invoiceNumber}`,
            userId,
          },
        },
      },
    });

    return { sale, soNumber: order.soNumber, invoiceNumber };
  });

  revalidatePath("/dashboard/sales/orders");
  revalidatePath(`/dashboard/sales/orders/${id}`);
  revalidatePath("/dashboard/sales");
  return result;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getSalesOrderStats() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const businessId = session.user.businessId;
  const where = { businessId, deletedAt: null as null };

  const [total, draft, pending, confirmed, processing, shipped, delivered, completed, cancelled] =
    await Promise.all([
      prisma.salesOrder.count({ where }),
      prisma.salesOrder.count({ where: { ...where, status: "DRAFT" } }),
      prisma.salesOrder.count({ where: { ...where, status: "PENDING" } }),
      prisma.salesOrder.count({ where: { ...where, status: "CONFIRMED" } }),
      prisma.salesOrder.count({ where: { ...where, status: "PROCESSING" } }),
      prisma.salesOrder.count({ where: { ...where, status: "SHIPPED" } }),
      prisma.salesOrder.count({ where: { ...where, status: "DELIVERED" } }),
      prisma.salesOrder.count({ where: { ...where, status: "COMPLETED" } }),
      prisma.salesOrder.count({ where: { ...where, status: "CANCELLED" } }),
    ]);

  const totalValue = await prisma.salesOrder.aggregate({
    where: { ...where, status: { notIn: ["CANCELLED"] } },
    _sum: { totalAmount: true },
  });

  return {
    total,
    draft,
    pending,
    confirmed,
    processing,
    shipped,
    delivered,
    completed,
    cancelled,
    totalValue: Number(totalValue._sum.totalAmount ?? 0),
  };
}
