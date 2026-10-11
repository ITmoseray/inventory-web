import { format } from "date-fns";
import type { EnterpriseReportResult } from "@/lib/actions/enterprise-report";

/**
 * Enterprise Multi-Sheet Excel Export for Business Administrators.
 * Generates structured, professional .xlsx workbooks with proper column widths
 * and mathematical tables for executive accounting, taxation, and auditing.
 */

// Helper to format currency values safely for numeric cells
function num(val: number | undefined | null): number {
  if (typeof val !== "number" || isNaN(val)) return 0;
  return Math.round(val * 100) / 100;
}

export async function exportMasterEnterpriseExcel(report: EnterpriseReportResult) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const periodTitle =
    report.timeframe === "weekly"
      ? `WEEKLY REPORT: ${report.periodLabel}`
      : report.timeframe === "monthly"
      ? `MONTHLY REPORT: ${report.periodLabel}`
      : `CUSTOM REPORT: ${report.periodLabel}`;

  const generatedAt = format(new Date(), "yyyy-MM-dd HH:mm:ss");

  // ──────────────────────────────────────────────────────────────────────────
  // SHEET 1: 📊 EXECUTIVE SUMMARY & SCORECARD
  // ──────────────────────────────────────────────────────────────────────────
  const summaryRows: any[][] = [
    ["PRO-TECH ENTERPRISE OS — EXECUTIVE SYSTEM REPORT"],
    [`BUSINESS NAME: ${report.businessName.toUpperCase()}`],
    [`REPORT PERIOD: ${periodTitle}`],
    [`GENERATED ON: ${generatedAt}`],
    [`CURRENCY: ${report.currency}`],
    [],
    ["=============================================================="],
    ["1. EXECUTIVE PROFITABILITY SCORECARD", ""],
    ["=============================================================="],
    ["Gross Sales Revenue", num(report.summary.totalRevenue)],
    ["Cost of Goods Sold (COGS)", num(report.summary.totalCOGS)],
    ["Gross Profit", num(report.summary.grossProfit)],
    ["Gross Profit Margin (%)", `${report.summary.grossMargin.toFixed(2)}%`],
    ["Total Operating Expenses (OpEx)", num(report.summary.totalExpenses)],
    ["Net Operating Profit", num(report.summary.netProfit)],
    ["Net Profit Margin (%)", `${report.summary.netMargin.toFixed(2)}%`],
    [],
    ["=============================================================="],
    ["2. PERIOD COMPARISON & GROWTH TRAJECTORY", ""],
    ["=============================================================="],
    ["Previous Period Revenue", num(report.summary.previousRevenue)],
    ["Revenue Growth vs Previous Period (%)", `${report.summary.revenueGrowthPct >= 0 ? "+" : ""}${report.summary.revenueGrowthPct}%`],
    ["Previous Period Invoices", report.summary.previousTransactions],
    ["Invoice Volume Growth (%)", `${report.summary.transactionsGrowthPct >= 0 ? "+" : ""}${report.summary.transactionsGrowthPct}%`],
    ["Previous Period Net Profit", num(report.summary.previousNetProfit)],
    ["Net Profit Growth (%)", `${report.summary.netProfitGrowthPct >= 0 ? "+" : ""}${report.summary.netProfitGrowthPct}%`],
    [],
    ["=============================================================="],
    ["3. TRANSACTION VELOCITY & SALES METRICS", ""],
    ["=============================================================="],
    ["Total Paid Invoices / Transactions", report.summary.totalTransactions],
    ["Average Transaction Value (AOV)", num(report.summary.avgTransactionValue)],
    ["Total Customer Receivables / Credit Sales", num(report.summary.totalCreditSales)],
    [],
    ["=============================================================="],
    ["4. NRA FISCAL TAX COMPLIANCE (15% GST)", ""],
    ["=============================================================="],
    ["Taxable Base Turnover", num(report.summary.taxableBase)],
    ["GST (15%) Collected", num(report.summary.totalGST)],
    [],
    ["=============================================================="],
    ["5. CURRENT INVENTORY VALUATION SNAPSHOT", ""],
    ["=============================================================="],
    ["Total Active Products in Catalog", report.summary.totalProductsCount],
    ["Total Inventory Cost Valuation", num(report.summary.totalStockCostValuation)],
    ["Total Inventory Retail Valuation", num(report.summary.totalStockRetailValuation)],
    ["Potential Inventory Gross Margin", num(report.summary.totalStockRetailValuation - report.summary.totalStockCostValuation)],
    ["Low Stock Warning Items", report.summary.lowStockCount],
    ["Out of Stock Alert Items", report.summary.outOfStockCount],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 42 }, { wch: 26 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "1. Executive Summary");

  // ──────────────────────────────────────────────────────────────────────────
  // SHEET 2: 📅 PERIOD BREAKDOWN (WEEKLY / MONTHLY)
  // ──────────────────────────────────────────────────────────────────────────
  const intervalHeader = [
    "Sub-Period / Day",
    "Start Date",
    "End Date",
    `Gross Revenue (${report.currency})`,
    `COGS (${report.currency})`,
    `Expenses (${report.currency})`,
    `Gross Profit (${report.currency})`,
    `Net Profit (${report.currency})`,
    "Gross Margin (%)",
    "Invoices Count",
  ];

  const intervalRows = [
    intervalHeader,
    ...report.intervalBreakdown.map((row) => [
      row.label,
      row.startDate,
      row.endDate,
      num(row.revenue),
      num(row.cogs),
      num(row.expenses),
      num(row.grossProfit),
      num(row.netProfit),
      `${row.grossMargin.toFixed(1)}%`,
      row.transactions,
    ]),
  ];

  const wsInterval = XLSX.utils.aoa_to_sheet(intervalRows);
  wsInterval["!cols"] = [
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(
    wb,
    wsInterval,
    report.timeframe === "weekly" ? "2. Day-by-Day Breakdown" : "2. Weekly Breakdown"
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SHEET 3: 🧾 SALES TRANSACTIONS REGISTER
  // ──────────────────────────────────────────────────────────────────────────
  const salesHeader = [
    "Invoice #",
    "Date & Time",
    "Customer Name",
    "Staff / Cashier",
    "Payment Method",
    "Payment Status",
    "Items Count",
    `Total Amount (${report.currency})`,
    `Discount (${report.currency})`,
    `Tax / GST (${report.currency})`,
  ];

  const salesData = [
    salesHeader,
    ...report.salesRows.map((s) => [
      s.invoiceNumber,
      s.date,
      s.customer,
      s.staff,
      s.paymentMethod,
      s.paymentStatus,
      s.items,
      num(s.totalAmount),
      num(s.discount),
      num(s.tax),
    ]),
  ];

  const wsSales = XLSX.utils.aoa_to_sheet(salesData);
  wsSales["!cols"] = [
    { wch: 22 },
    { wch: 18 },
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSales, "3. Sales Invoices");

  // ──────────────────────────────────────────────────────────────────────────
  // SHEET 4: 📦 PRODUCT MARGINS & SALES RANKING
  // ──────────────────────────────────────────────────────────────────────────
  const prodHeader = [
    "Product Name",
    "Category",
    "Units Sold",
    `Unit Cost (${report.currency})`,
    `Unit Selling Price (${report.currency})`,
    `Total Revenue (${report.currency})`,
    `Total COGS (${report.currency})`,
    `Gross Profit (${report.currency})`,
    "Profit Margin (%)",
  ];

  const prodData = [
    prodHeader,
    ...report.topProducts.map((p) => [
      p.name,
      p.category,
      p.qtySold,
      num(p.costPrice),
      num(p.unitPrice),
      num(p.revenue),
      num(p.cogs),
      num(p.grossProfit),
      `${p.marginPct.toFixed(1)}%`,
    ]),
  ];

  const wsProd = XLSX.utils.aoa_to_sheet(prodData);
  wsProd["!cols"] = [
    { wch: 30 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsProd, "4. Product Margins");

  // ──────────────────────────────────────────────────────────────────────────
  // SHEET 5: 🏷️ INVENTORY ASSET VALUATION
  // ──────────────────────────────────────────────────────────────────────────
  if (report.inventorySnapshot && report.inventorySnapshot.length > 0) {
    const invHeader = [
      "Product Name",
      "SKU / Barcode",
      "Category",
      "Stock On Hand",
      `Cost Price (${report.currency})`,
      `Selling Price (${report.currency})`,
      `Stock Cost Valuation (${report.currency})`,
      `Stock Retail Valuation (${report.currency})`,
      `Potential Margin (${report.currency})`,
      "Stock Status",
    ];

    const invData = [
      invHeader,
      ...report.inventorySnapshot.map((item) => [
        item.name,
        item.sku || "N/A",
        item.category,
        item.currentStock,
        num(item.costPrice),
        num(item.unitPrice),
        num(item.costValuation),
        num(item.retailValuation),
        num(item.potentialProfit),
        item.status === "OUT_OF_STOCK"
          ? "OUT OF STOCK"
          : item.status === "LOW_STOCK"
          ? "LOW STOCK ALERT"
          : "HEALTHY",
      ]),
    ];

    const wsInv = XLSX.utils.aoa_to_sheet(invData);
    wsInv["!cols"] = [
      { wch: 30 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 24 },
      { wch: 24 },
      { wch: 20 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, wsInv, "5. Inventory Valuation");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SHEET 6: 🚚 PURCHASES & INBOUND EXPENSES
  // ──────────────────────────────────────────────────────────────────────────
  if (report.purchaseRows && report.purchaseRows.length > 0) {
    const purHeader = [
      "PO / Invoice #",
      "Date & Time",
      "Supplier Name",
      "Items Count",
      `Total Purchase Cost (${report.currency})`,
    ];

    const purData = [
      purHeader,
      ...report.purchaseRows.map((p) => [
        p.invoiceNumber,
        p.date,
        p.supplier,
        p.items,
        num(p.totalAmount),
      ]),
    ];

    const wsPur = XLSX.utils.aoa_to_sheet(purData);
    wsPur["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 26 }, { wch: 12 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, wsPur, "6. Supplier Purchases");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SHEET 7: 💸 OPERATING EXPENSE REGISTER
  // ──────────────────────────────────────────────────────────────────────────
  if (report.expenseRows && report.expenseRows.length > 0) {
    const expHeader = [
      "Expense Date",
      "Category",
      "Description",
      `Amount (${report.currency})`,
      "Recorded By",
    ];

    const expData = [
      expHeader,
      ...report.expenseRows.map((e) => [
        e.date,
        e.category,
        e.description,
        num(e.amount),
        e.recordedBy,
      ]),
    ];

    const wsExp = XLSX.utils.aoa_to_sheet(expData);
    wsExp["!cols"] = [{ wch: 14 }, { wch: 20 }, { wch: 34 }, { wch: 18 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsExp, "7. Operating Expenses");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SHEET 8: 💳 PAYMENT TENDER & CASH FLOW
  // ──────────────────────────────────────────────────────────────────────────
  if (report.paymentBreakdown && report.paymentBreakdown.length > 0) {
    const payHeader = [
      "Payment Channel",
      "Invoices Processed",
      `Total Volume (${report.currency})`,
      "Share of Revenue (%)",
    ];

    const payData = [
      payHeader,
      ...report.paymentBreakdown.map((p) => [
        p.method,
        p.count,
        num(p.total),
        `${p.percentage.toFixed(1)}%`,
      ]),
    ];

    const wsPay = XLSX.utils.aoa_to_sheet(payData);
    wsPay["!cols"] = [{ wch: 24 }, { wch: 18 }, { wch: 22 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsPay, "8. Payment Tender");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SHEET 9: 👥 STAFF SALES AUDIT
  // ──────────────────────────────────────────────────────────────────────────
  if (report.staffPerformance && report.staffPerformance.length > 0) {
    const staffHeader = [
      "Staff Member",
      "Email Address",
      "Invoices Processed",
      `Total Sales Yield (${report.currency})`,
      `Average Sale Value (${report.currency})`,
    ];

    const staffData = [
      staffHeader,
      ...report.staffPerformance.map((st) => [
        st.name,
        st.email,
        st.transactions,
        num(st.totalRevenue),
        num(st.avgTransaction),
      ]),
    ];

    const wsStaff = XLSX.utils.aoa_to_sheet(staffData);
    wsStaff["!cols"] = [{ wch: 24 }, { wch: 28 }, { wch: 18 }, { wch: 22 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsStaff, "9. Staff Performance");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // WRITE AND DOWNLOAD WORKBOOK
  // ──────────────────────────────────────────────────────────────────────────
  const cleanBiz = report.businessName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Admin_System_Report_${cleanBiz}_${report.timeframe}_${format(
    new Date(report.startDate),
    "yyyy-MM-dd"
  )}_to_${format(new Date(report.endDate), "yyyy-MM-dd")}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Targeted Export Helper for Specific Category Requests
 */
export async function exportCategoryExcel(
  categoryName: string,
  report: EnterpriseReportResult
) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const generated = format(new Date(), "yyyy-MM-dd HH:mm");

  switch (categoryName.toLowerCase()) {
    case "sales": {
      const header = ["Invoice #", "Date", "Customer", "Staff", "Method", "Status", "Items", `Total (${report.currency})`];
      const data = [
        [`${report.businessName} — Sales Summary Report`],
        [`Period: ${report.periodLabel} | Generated: ${generated}`],
        [],
        header,
        ...report.salesRows.map((s) => [s.invoiceNumber, s.date, s.customer, s.staff, s.paymentMethod, s.paymentStatus, s.items, num(s.totalAmount)]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 24 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws, "Sales Summary");
      break;
    }

    case "inventory": {
      const header = ["Product", "SKU", "Category", "Stock", `Cost Price (${report.currency})`, `Selling Price (${report.currency})`, `Total Valuation (${report.currency})`, "Status"];
      const data = [
        [`${report.businessName} — Inventory Valuation & Stock Report`],
        [`Total Catalog Valuation: ${report.currency} ${num(report.summary.totalStockCostValuation)} | Generated: ${generated}`],
        [],
        header,
        ...report.inventorySnapshot.map((i) => [i.name, i.sku, i.category, i.currentStock, num(i.costPrice), num(i.unitPrice), num(i.costValuation), i.status]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, "Inventory Valuation");
      break;
    }

    case "financial": {
      const data = [
        [`${report.businessName} — Profit & Loss Financial Statement`],
        [`Period: ${report.periodLabel} | Generated: ${generated}`],
        [],
        ["ACCOUNTING LINE ITEM", `AMOUNT (${report.currency})`],
        ["Gross Sales Revenue", num(report.summary.totalRevenue)],
        ["Less: Cost of Goods Sold (COGS)", num(report.summary.totalCOGS)],
        ["GROSS PROFIT", num(report.summary.grossProfit)],
        ["Gross Margin (%)", `${report.summary.grossMargin.toFixed(1)}%`],
        ["Less: Operating Expenses (OpEx)", num(report.summary.totalExpenses)],
        ["NET OPERATING PROFIT", num(report.summary.netProfit)],
        ["Net Margin (%)", `${report.summary.netMargin.toFixed(1)}%`],
        [],
        ["OPERATING EXPENSES BY CATEGORY", ""],
        ...report.expenseCategoryBreakdown.map((e) => [e.category, num(e.total)]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = [{ wch: 36 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, ws, "Profit & Loss");
      break;
    }

    case "purchase": {
      const header = ["Invoice #", "Date", "Supplier", "Items", `Total Amount (${report.currency})`];
      const data = [
        [`${report.businessName} — Purchase History & Suppliers Report`],
        [`Period: ${report.periodLabel} | Generated: ${generated}`],
        [],
        header,
        ...report.purchaseRows.map((p) => [p.invoiceNumber, p.date, p.supplier, p.items, num(p.totalAmount)]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 26 }, { wch: 10 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, ws, "Purchases");
      break;
    }

    case "customer": {
      const header = ["Customer Name", "Phone", "Invoices Count", `Total Spend (${report.currency})`];
      const data = [
        [`${report.businessName} — Customer Activity & Top Buyers`],
        [`Period: ${report.periodLabel} | Generated: ${generated}`],
        [],
        header,
        ...report.customerBreakdown.topCustomers.map((c) => [c.name, c.phone, c.transactions, num(c.totalSpent)]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = [{ wch: 26 }, { wch: 18 }, { wch: 16 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, ws, "Top Customers");
      break;
    }

    case "performance": {
      const header = ["Staff / Cashier", "Email", "Transactions", `Total Yield (${report.currency})`, `Average Sale (${report.currency})`];
      const data = [
        [`${report.businessName} — Staff Performance Audit`],
        [`Period: ${report.periodLabel} | Generated: ${generated}`],
        [],
        header,
        ...report.staffPerformance.map((s) => [s.name, s.email, s.transactions, num(s.totalRevenue), num(s.avgTransaction)]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = [{ wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 22 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws, "Staff Performance");
      break;
    }

    default: {
      return exportMasterEnterpriseExcel(report);
    }
  }

  const cleanCategory = categoryName.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `${cleanCategory}_Report_${format(new Date(), "yyyyMMdd")}.xlsx`);
}
