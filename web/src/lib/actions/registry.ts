"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getRegistryIntelligence() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const businessId = session.user.businessId;

  const [customers, suppliers] = await Promise.all([
    prisma.customer.findMany({
      where: { businessId, deletedAt: null },
      include: {
        sales: {
          select: {
            totalAmount: true,
            status: true,
            createdAt: true,
          }
        },
        debts: {
          select: {
            totalAmount: true,
            paidAmount: true,
          }
        }
      }
    }),
    prisma.supplier.findMany({
      where: { businessId, deletedAt: null },
      include: {
        purchases: {
          select: {
            totalAmount: true,
            status: true,
            createdAt: true,
          }
        }
      }
    })
  ]);

  const registryNodes = [
    ...customers.map(c => {
      const totalVolume = c.sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
      const debtAmount = c.debts.reduce((sum, d) => sum + (Number(d.totalAmount) - Number(d.paidAmount)), 0);
      const lastInteraction = c.sales.length > 0 ? c.sales[0].createdAt : c.createdAt;
      
      // Basic Reliability Score logic
      const reliability = debtAmount > 0 ? Math.max(0, 100 - (debtAmount / (totalVolume || 1)) * 100) : 100;

      return {
        id: c.id,
        type: "CUSTOMER",
        name: c.name,
        email: c.email,
        phone: c.phone,
        reliability,
        totalVolume,
        debtAmount,
        lastInteraction,
        nodeStatus: "VERIFIED",
      };
    }),
    ...suppliers.map(s => {
      const totalVolume = s.purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);
      const lastInteraction = s.purchases.length > 0 ? s.purchases[0].createdAt : s.createdAt;

      return {
        id: s.id,
        type: "SUPPLIER",
        name: s.name,
        email: s.email,
        phone: s.phone,
        reliability: 100, // Suppliers are assumed reliable for now
        totalVolume,
        debtAmount: 0,
        lastInteraction,
        nodeStatus: "VERIFIED",
      };
    })
  ];

  return {
    nodes: registryNodes,
    stats: {
      totalEntities: registryNodes.length,
      globalReliability: registryNodes.reduce((sum, n) => sum + n.reliability, 0) / (registryNodes.length || 1),
      totalTradeVolume: registryNodes.reduce((sum, n) => sum + n.totalVolume, 0),
    }
  };
}
