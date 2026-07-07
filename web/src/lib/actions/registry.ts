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
          include: {
            items: { include: { product: { include: { category: true } } } }
          },
          orderBy: { createdAt: "desc" }
        },
      }
    }),
    prisma.supplier.findMany({
      where: { businessId, deletedAt: null },
      include: {
        purchases: {
          orderBy: { createdAt: "desc" }
        }
      }
    })
  ]);

  const now = new Date();

  // 1. Process Customers
  const customerNodes = customers.map(c => {
    const totalVolume = c.sales.reduce((sum, s) => sum + Number(s.totalAmount?.toString() || 0), 0);
    const lastInteraction = c.sales.length > 0 ? c.sales[0].createdAt : c.createdAt;
    const daysSinceLastPurchase = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);

    // Affinity Logic
    const categoryCounts: Record<string, number> = {};
    c.sales.forEach(s => s.items.forEach(item => {
      const cat = item.product?.category?.name || "Uncategorized";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + item.quantity;
    }));
    const primaryAffinity = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Cluster Status
    let status = "Dormant";
    if (c.sales.length > 5 && daysSinceLastPurchase < 30) status = "High Velocity";
    else if (c.sales.length > 0 && daysSinceLastPurchase > 60) status = "At Risk";

    // Dynamic Reliability Score
    const reliability = Math.min(100, Math.max(0, 85 + (c.sales.length > 5 ? 10 : c.sales.length * 2) - (daysSinceLastPurchase > 30 ? 15 : 0)));

    return {
      id: c.id,
      name: c.name,
      phone: c.phone || null,
      email: c.email || null,
      type: "CUSTOMER",
      totalVolume,
      lastInteraction: lastInteraction.toISOString(),
      daysSinceLastPurchase: Math.round(daysSinceLastPurchase),
      primaryAffinity,
      status,
      totalOrders: c.sales.length,
      reliability
    };
  });

  // 2. Process Suppliers
  const supplierNodes = suppliers.map(s => {
    const totalVolume = s.purchases.reduce((sum, p) => sum + Number(p.totalAmount?.toString() || 0), 0);
    const lastInteraction = s.purchases.length > 0 ? s.purchases[0].createdAt : s.createdAt;
    const daysSinceLastPurchase = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);

    // Cluster Status
    let status = "Dormant";
    if (s.purchases.length > 5 && daysSinceLastPurchase < 30) status = "High Velocity";
    else if (s.purchases.length > 0 && daysSinceLastPurchase > 60) status = "At Risk";

    // Dynamic Reliability Score
    const reliability = Math.min(100, Math.max(0, 90 + (s.purchases.length > 5 ? 10 : s.purchases.length * 2) - (daysSinceLastPurchase > 60 ? 10 : 0)));

    return {
      id: s.id,
      name: s.name,
      phone: s.phone || null,
      email: s.email || null,
      type: "SUPPLIER",
      totalVolume,
      lastInteraction: lastInteraction.toISOString(),
      daysSinceLastPurchase: Math.round(daysSinceLastPurchase),
      primaryAffinity: "Wholesale Supply",
      status,
      totalOrders: s.purchases.length,
      reliability
    };
  });

  // 3. Merge Nodes
  const registryNodes = [...customerNodes, ...supplierNodes];

  // 4. Calculate Stats
  const totalEntities = registryNodes.length;
  const totalTradeVolume = registryNodes.reduce((sum, n) => sum + n.totalVolume, 0);
  const globalReliability = totalEntities > 0
    ? registryNodes.reduce((sum, n) => sum + n.reliability, 0) / totalEntities
    : 100;

  const clusterCounts = registryNodes.reduce((acc, n) => {
    acc[n.status] = (acc[n.status] || 0) + 1;
    return acc;
  }, { "High Velocity": 0, "Dormant": 0, "At Risk": 0 } as Record<string, number>);

  return {
    nodes: registryNodes,
    clusterCounts,
    stats: {
      totalEntities,
      totalTradeVolume,
      globalReliability
    }
  };
}
