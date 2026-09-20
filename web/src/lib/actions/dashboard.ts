"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addDays, startOfDay, endOfDay, subDays, startOfMonth } from "date-fns";

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
      overStockCount,
      expiringCount,
      todayOrdersCount,
      yesterdayOrdersCount,
      todayRevenueData,
      yesterdayRevenueData,
      todayDebtPaymentData,
      yesterdayDebtPaymentData,
      staffCount,
      topItems,
      topStaffSales,
      customerCount,
      outstandingCreditData,
      monthlyExpensesData,
      monthlyRevenueData,
      categoryDistributionData,
      lowStockProductsData
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
      prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int as count FROM "Product" 
        WHERE "businessId" = ${businessId} AND "stockQuantity" <= "minStockLevel" AND "type" != 'SERVICE'
      `,
      // Over Stock Count
      prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int as count FROM "Product" 
        WHERE "businessId" = ${businessId} AND "stockQuantity" >= "minStockLevel" * 3 AND "type" != 'SERVICE'
      `,
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
      }),
      // Customer Count
      prisma.customer.count({
        where: { businessId }
      }),
      // Outstanding Credit (Pending Debts)
      prisma.debt.aggregate({
        where: { businessId, status: "PENDING", deletedAt: null },
        _sum: { totalAmount: true, paidAmount: true }
      }),
      // Monthly Expenses
      prisma.expense.aggregate({
        where: { businessId, createdAt: { gte: startOfMonth(today) } },
        _sum: { amount: true }
      }),
      // Monthly Revenue
      prisma.sale.aggregate({
        where: { businessId, paymentStatus: "PAID", createdAt: { gte: startOfMonth(today) } },
        _sum: { totalAmount: true }
      }),
      // Category distribution
      prisma.category.findMany({
        where: { businessId },
        select: {
          id: true,
          name: true,
          _count: { select: { products: true } }
        },
        take: 6
      }),
      // Low stock products
      prisma.product.findMany({
        where: { businessId, type: { not: 'SERVICE' } },
        select: { id: true, name: true, stockQuantity: true, minStockLevel: true },
        orderBy: { stockQuantity: 'asc' },
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
         revenue: Number(item._sum.total?.toString() || 0)
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
        revenue: Number(item._sum.totalAmount?.toString() || 0)
      };
    });

    // 1. Calculate Revenue Sums
    const totalAllTimeRevenue = Number(revenueData._sum.totalAmount?.toString() || 0) + Number(debtPaymentData._sum.amount?.toString() || 0);
    const todayRevenue = Number(todayRevenueData._sum.totalAmount?.toString() || 0) + Number(todayDebtPaymentData._sum.amount?.toString() || 0);
    const yesterdayRevenue = Number(yesterdayRevenueData._sum.totalAmount?.toString() || 0) + Number(yesterdayDebtPaymentData._sum.amount?.toString() || 0);
    const monthlyRevenue = Number(monthlyRevenueData._sum.totalAmount?.toString() || 0);
    const monthlyExpenses = Number(monthlyExpensesData._sum.amount?.toString() || 0);
    const netProfit = monthlyRevenue - monthlyExpenses;
    const profitMargin = monthlyRevenue > 0 ? ((netProfit / monthlyRevenue) * 100).toFixed(1) : "0.0";
    const totalOutstandingCredit = Math.max(0, Number(outstandingCreditData._sum.totalAmount?.toString() || 0) - Number(outstandingCreditData._sum.paidAmount?.toString() || 0));

    // Calculate category percentages
    const totalCategoryProducts = categoryDistributionData.reduce((acc, c) => acc + c._count.products, 0);
    const categoryColors = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#0EA5E9", "#EC4899"];
    const categoryData = categoryDistributionData.map((c, i) => ({
      name: c.name,
      value: totalCategoryProducts > 0 ? Math.round((c._count.products / totalCategoryProducts) * 100) : 0,
      count: c._count.products,
      color: categoryColors[i % categoryColors.length]
    }));

    // 2. Calculate Growth Percentages
    const revenueChange = yesterdayRevenue === 0 
      ? (todayRevenue > 0 ? 100 : 0) 
      : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    const ordersChange = yesterdayOrdersCount === 0 
      ? (todayOrdersCount > 0 ? 100 : 0) 
      : ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount) * 100;

    return {
      revenue: totalAllTimeRevenue,
      monthlyRevenue,
      todayRevenue,
      revenueChange,
      orders: todayOrdersCount, // "Today's Orders" now correctly reflects today's count!
      ordersChange,
      skuCount,
      lowStock: lowStockCount[0]?.count || 0,
      overStock: overStockCount[0]?.count || 0,
      expiringItems: expiringCount,
      activeTransactions: todayOrdersCount, // Using today's active orders
      staffCount,
      customerCount: customerCount || 0,
      outstandingCredit: totalOutstandingCredit,
      monthlyExpenses,
      netProfit,
      profitMargin,
      topProducts,
      topStaff,
      categoryData,
      lowStockProducts: lowStockProductsData
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw error;
  }
}

export async function getOfficeDashboardStats() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const firstOfCurrentMonth = startOfMonth(today);

    const [
      employeeCount,
      activeTodayCount,
      monthlyExpenses,
      departmentStats,
      recentCheckins,
      recentExpenses
    ] = await Promise.all([
      // 1. Total Employees
      prisma.user.count({
        where: { businessId, deletedAt: null }
      }),
      // 2. Active Today (checked in)
      prisma.attendance.count({
        where: {
          businessId,
          clockIn: {
            gte: todayStart,
            lte: todayEnd
          }
        }
      }),
      // 3. Monthly Expenses
      prisma.expense.aggregate({
        where: {
          businessId,
          createdAt: {
            gte: firstOfCurrentMonth
          }
        },
        _sum: {
          amount: true
        }
      }),
      // 4. Department distribution
      prisma.user.groupBy({
        by: ['department'],
        where: { businessId, deletedAt: null, department: { not: null } },
        _count: {
          id: true
        }
      }),
      // 5. Recent Attendance Checkins
      prisma.attendance.findMany({
        where: { businessId },
        orderBy: { clockIn: "desc" },
        take: 5,
        include: {
          user: {
            select: { name: true, email: true, jobTitle: true, department: true, imageUrl: true }
          }
        } as any
      }),
      // 6. Recent Office Expenses
      prisma.expense.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ]);

    const formattedCheckins = (recentCheckins as any[]).map(c => ({
      id: c.id,
      employeeName: c.user?.name || "Unknown",
      email: c.user?.email || "",
      jobTitle: c.user?.jobTitle || "Staff",
      department: c.user?.department || "General",
      employeeImage: c.user?.imageUrl || null,
      clockIn: c.clockIn.toISOString(),
      clockOut: c.clockOut?.toISOString() || null,
      status: c.status
    }));

    const formattedExpenses = (recentExpenses as any[]).map(e => ({
      id: e.id,
      description: e.description || "Office Expense",
      categoryName: e.category || "Operations",
      amount: Number(e.amount.toString()),
      date: e.createdAt.toISOString()
    }));

    const departmentsCount = departmentStats.length;
    const monthlyExpensesTotal = Number(monthlyExpenses._sum.amount?.toString() || 0);

    return {
      employeeCount,
      activeTodayCount,
      monthlyExpenses: monthlyExpensesTotal,
      departmentsCount,
      recentCheckins: formattedCheckins,
      recentExpenses: formattedExpenses,
      departmentDistribution: (departmentStats as any[]).map(d => ({
        name: d.department || "Other",
        value: d._count?.id || 0
      }))
    };
  } catch (error) {
    console.error("Failed to fetch office dashboard stats:", error);
    throw error;
  }
}
