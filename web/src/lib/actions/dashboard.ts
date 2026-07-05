"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addDays, startOfDay, endOfDay, subDays } from "date-fns";

export async function getDashboardStats() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const yesterday = subDays(today, 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const [
      revenueData,
      debtPaymentData,
      allTimeOrdersCount,
      skuCount,
      lowStockCount,
      expiringCount,
      todayOrdersCount,
      yesterdayOrdersCount,
      todayRevenueData,
      yesterdayRevenueData,
      todayDebtPaymentData,
      yesterdayDebtPaymentData,
      staffCount,
      topItems,
      topStaffSales
    ] = await Promise.all([
      // Total Revenue (All-time Paid Sales)
      prisma.sale.aggregate({
        where: { 
          businessId,
          paymentStatus: "PAID"
        },
        _sum: {
          totalAmount: true
        }
      }),
      // Total Debt Payments (All-time)
      prisma.debtPayment.aggregate({
        where: { 
          businessId
        },
        _sum: {
          amount: true
        }
      }),
      // Total Paid Orders (All-time)
      prisma.sale.count({
        where: { 
          businessId,
          paymentStatus: "PAID"
        }
      }),
      // SKU Count
      prisma.product.count({
        where: { businessId }
      }),
      // Low Stock Count
      prisma.$queryRawUnsafe<{ count: number }[]>(`
        SELECT COUNT(*)::int as count FROM "Product" 
        WHERE "businessId" = $1 AND "stockQuantity" <= "minStockLevel"
      `, businessId),
      // Expiring Items (within 30 days)
      prisma.batch.count({
        where: {
          businessId,
          expiryDate: {
            not: null,
            lt: addDays(new Date(), 30)
          }
        }
      }),
      // Today's Orders (Sales count created today)
      prisma.sale.count({
        where: {
          businessId,
          createdAt: {
            gte: todayStart,
            lte: todayEnd
          }
        }
      }),
      // Yesterday's Orders (Sales count created yesterday)
      prisma.sale.count({
        where: {
          businessId,
          createdAt: {
            gte: yesterdayStart,
            lte: yesterdayEnd
          }
        }
      }),
      // Today's Sales Revenue (Paid Sales created today)
      prisma.sale.aggregate({
        where: {
          businessId,
          paymentStatus: "PAID",
          createdAt: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      // Yesterday's Sales Revenue (Paid Sales created yesterday)
      prisma.sale.aggregate({
        where: {
          businessId,
          paymentStatus: "PAID",
          createdAt: {
            gte: yesterdayStart,
            lte: yesterdayEnd
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      // Today's Debt Payments
      prisma.debtPayment.aggregate({
        where: {
          businessId,
          createdAt: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        _sum: {
          amount: true
        }
      }),
      // Yesterday's Debt Payments
      prisma.debtPayment.aggregate({
        where: {
          businessId,
          createdAt: {
            gte: yesterdayStart,
            lte: yesterdayEnd
          }
        },
        _sum: {
          amount: true
        }
      }),
      // Staff Count
      prisma.user.count({
        where: { businessId }
      }),
      // Top Products
      prisma.saleItem.groupBy({
        by: ['productId', 'productName'],
        where: { businessId, productId: { not: null } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      // Top Staff Leaderboard
      prisma.sale.groupBy({
        by: ['userId'],
        where: { businessId, paymentStatus: "PAID" },
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5
      })
    ]);

    const productIds = topItems.map(i => i.productId).filter(Boolean) as string[];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true }
    });

    const topProducts = topItems.map(item => {
       const product = products.find(p => p.id === item.productId);
       return {
         id: item.productId,
         name: item.productName || 'Unknown Product',
         category: product?.category?.name || 'General',
         quantitySold: item._sum.quantity || 0,
         revenue: Number(item._sum.total || 0)
       };
     });

    const userIds = topStaffSales.map(s => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, role: true }
    });

    const topStaff = topStaffSales.map(item => {
      const user = users.find(u => u.id === item.userId);
      return {
        id: item.userId,
        name: user?.name || 'Unknown Staff',
        role: user?.role?.name || 'STAFF',
        revenue: Number(item._sum.totalAmount || 0)
      };
    });

    // 1. Calculate Revenue Sums
    const totalAllTimeRevenue = Number(revenueData._sum.totalAmount || 0) + Number(debtPaymentData._sum.amount || 0);
    const todayRevenue = Number(todayRevenueData._sum.totalAmount || 0) + Number(todayDebtPaymentData._sum.amount || 0);
    const yesterdayRevenue = Number(yesterdayRevenueData._sum.totalAmount || 0) + Number(yesterdayDebtPaymentData._sum.amount || 0);

    // 2. Calculate Growth Percentages
    const revenueChange = yesterdayRevenue === 0 
      ? (todayRevenue > 0 ? 100 : 0) 
      : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    const ordersChange = yesterdayOrdersCount === 0 
      ? (todayOrdersCount > 0 ? 100 : 0) 
      : ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount) * 100;

    return {
      revenue: totalAllTimeRevenue,
      revenueChange,
      orders: todayOrdersCount, // "Today's Orders" now correctly reflects today's count!
      ordersChange,
      skuCount: skuCount,
      lowStock: lowStockCount[0]?.count || 0,
      expiringItems: expiringCount,
      activeTransactions: todayOrdersCount, // Using today's active orders
      staffCount: staffCount,
      topProducts: topProducts,
      topStaff: topStaff
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw error;
  }
}
