"use server";

import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";

export async function getCurrentSession() {
  const session = await auth();
  if (!session?.user?.businessId || !session?.user?.id) return null;

  const tenantPrisma = getTenantPrisma(session.user.businessId);

  const registerSession = await tenantPrisma.cashRegisterSession.findFirst({
    where: {
      businessId: session.user.businessId,
      userId: session.user.id,
      status: "OPEN",
    },
    orderBy: { openedAt: "desc" }
  });

  if (!registerSession) return null;

  return {
    ...registerSession,
    startingCash: Number(registerSession.startingCash),
    actualEndingCash: registerSession.actualEndingCash ? Number(registerSession.actualEndingCash) : null,
    expectedEndingCash: registerSession.expectedEndingCash ? Number(registerSession.expectedEndingCash) : null,
  };
}

export async function openSession(startingCash: number, notes?: string) {
  const session = await auth();
  if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");

  const tenantPrisma = getTenantPrisma(session.user.businessId);

  // Check if one is already open
  const existing = await tenantPrisma.cashRegisterSession.findFirst({
    where: {
      businessId: session.user.businessId,
      userId: session.user.id,
      status: "OPEN",
    }
  });

  if (existing) {
    throw new Error("You already have an open shift.");
  }

  const newSession = await tenantPrisma.cashRegisterSession.create({
    data: {
      businessId: session.user.businessId,
      userId: session.user.id,
      startingCash,
      notes,
      status: "OPEN",
    }
  });

  return {
    ...newSession,
    startingCash: Number(newSession.startingCash),
    actualEndingCash: newSession.actualEndingCash ? Number(newSession.actualEndingCash) : null,
    expectedEndingCash: newSession.expectedEndingCash ? Number(newSession.expectedEndingCash) : null,
  };
}

export async function closeSession(sessionId: string, actualEndingCash: number, notes?: string) {
  const session = await auth();
  if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");

  const tenantPrisma = getTenantPrisma(session.user.businessId);

  const registerSession = await tenantPrisma.cashRegisterSession.findUnique({
    where: { id: sessionId }
  });

  if (!registerSession || registerSession.businessId !== session.user.businessId) {
    throw new Error("Session not found");
  }

  // Calculate expected cash
  // Expected = Starting + Cash Sales
  const sales = await tenantPrisma.sale.findMany({
    where: {
      businessId: session.user.businessId,
      userId: session.user.id,
      createdAt: { gte: registerSession.openedAt },
      status: "COMPLETED",
    }
  });

  let cashSalesTotal = 0;
  for (const sale of sales) {
    if (sale.paymentMethod === "CASH") {
      cashSalesTotal += Number(sale.totalAmount);
    } else if (sale.paymentMethod === "SPLIT" && sale.splitPayments) {
      const splits = sale.splitPayments as any[];
      splits.forEach(s => {
        if (s.method === "CASH") {
          cashSalesTotal += Number(s.amount);
        }
      });
    }
  }

  const expectedEndingCash = Number(registerSession.startingCash) + cashSalesTotal;

  const updatedSession = await tenantPrisma.cashRegisterSession.update({
    where: { id: sessionId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
      expectedEndingCash,
      actualEndingCash,
      notes,
    }
  });

  return {
    ...updatedSession,
    startingCash: Number(updatedSession.startingCash),
    actualEndingCash: updatedSession.actualEndingCash ? Number(updatedSession.actualEndingCash) : null,
    expectedEndingCash: updatedSession.expectedEndingCash ? Number(updatedSession.expectedEndingCash) : null,
  };
}
