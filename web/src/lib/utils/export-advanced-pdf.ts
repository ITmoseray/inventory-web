import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { EnterpriseReportResult } from "@/lib/actions/enterprise-report";

function num(val: number | undefined | null): string {
  if (typeof val !== "number" || isNaN(val)) return "0";
  return Math.round(val).toLocaleString();
}

/**
 * Generates an executive, multi-page vector PDF report for business administration,
 * tax compliance, and auditing with sharp tables, headers, and footers.
 */
export async function exportEnterpriseReportPDF(report: EnterpriseReportResult) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currency = report.currency;

  const periodTitle =
    report.timeframe === "weekly"
      ? `WEEKLY REPORT: ${report.periodLabel}`
      : report.timeframe === "monthly"
      ? `MONTHLY REPORT: ${report.periodLabel}`
      : `CUSTOM REPORT: ${report.periodLabel}`;

  const generatedDate = format(new Date(), "MMM dd, yyyy HH:mm");

  // ── HEADER BANNER ──────────────────────────────────────────────────────────
  doc.setFillColor(11, 22, 41); // Deep Navy (#0B1629)
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(report.businessName.toUpperCase(), 14, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("EXECUTIVE SYSTEM AUDIT & FINANCIAL REPORT", 14, 18);
  doc.text(`PERIOD: ${periodTitle}`, 14, 24);

  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${generatedDate}`, pageWidth - 14, 18, { align: "right" });
  doc.text(`Currency: ${currency}`, pageWidth - 14, 24, { align: "right" });

  let currentY = 36;

  // ── SECTION 1: EXECUTIVE PROFITABILITY SCORECARD ──────────────────────────
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("1. EXECUTIVE PROFITABILITY & FINANCIAL SCORECARD", 14, currentY);
  currentY += 4;

  const scorecardData = [
    [
      "Gross Sales Revenue",
      `${currency} ${num(report.summary.totalRevenue)}`,
      "Cost of Goods Sold (COGS)",
      `${currency} ${num(report.summary.totalCOGS)}`,
    ],
    [
      "Gross Operating Profit",
      `${currency} ${num(report.summary.grossProfit)}`,
      "Gross Profit Margin",
      `${report.summary.grossMargin.toFixed(1)}%`,
    ],
    [
      "Operating Expenses (OpEx)",
      `${currency} ${num(report.summary.totalExpenses)}`,
      "Net Operating Profit",
      `${currency} ${num(report.summary.netProfit)}`,
    ],
    [
      "Net Profit Margin",
      `${report.summary.netMargin.toFixed(1)}%`,
      "Invoices / Transactions",
      `${report.summary.totalTransactions.toLocaleString()} Invoices`,
    ],
    [
      "Average Order Value (AOV)",
      `${currency} ${num(report.summary.avgTransactionValue)}`,
      "Credit / Receivables",
      `${currency} ${num(report.summary.totalCreditSales)}`,
    ],
    [
      "NRA 15% GST Collected",
      `${currency} ${num(report.summary.totalGST)}`,
      "Taxable Base Turnover",
      `${currency} ${num(report.summary.taxableBase)}`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Financial Metric", "Amount", "Metric", "Amount / Margin"]],
    body: scorecardData,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235], // Blue 600
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { fontStyle: "bold", textColor: [37, 99, 235], cellWidth: 42 },
      2: { fontStyle: "bold", cellWidth: 50 },
      3: { fontStyle: "bold", textColor: [16, 185, 129], cellWidth: 42 },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ── SECTION 2: COMPARATIVE GROWTH BENCHMARKS ──────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("2. COMPARATIVE BENCHMARK VS PREVIOUS PERIOD", 14, currentY);
  currentY += 4;

  const growthData = [
    [
      "Gross Sales Revenue",
      `${currency} ${num(report.summary.previousRevenue)}`,
      `${currency} ${num(report.summary.totalRevenue)}`,
      `${report.summary.revenueGrowthPct >= 0 ? "+" : ""}${report.summary.revenueGrowthPct}%`,
    ],
    [
      "Invoice Volume",
      `${report.summary.previousTransactions} Invoices`,
      `${report.summary.totalTransactions} Invoices`,
      `${report.summary.transactionsGrowthPct >= 0 ? "+" : ""}${report.summary.transactionsGrowthPct}%`,
    ],
    [
      "Net Operating Profit",
      `${currency} ${num(report.summary.previousNetProfit)}`,
      `${currency} ${num(report.summary.netProfit)}`,
      `${report.summary.netProfitGrowthPct >= 0 ? "+" : ""}${report.summary.netProfitGrowthPct}%`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Performance Dimension", "Previous Period", "Current Period", "Trajectory Growth (%)"]],
    body: growthData,
    theme: "grid",
    headStyles: {
      fillColor: [15, 30, 56],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { fontStyle: "bold" },
      3: { fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ── SECTION 3: INTERVAL BREAKDOWN ─────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(
    report.timeframe === "weekly"
      ? "3. DAY-BY-DAY OPERATING SCHEDULE (MON – SUN)"
      : "3. WEEK-BY-WEEK OPERATING SCHEDULE",
    14,
    currentY
  );
  currentY += 4;

  const intervalTableData = report.intervalBreakdown.map((row) => [
    row.label,
    row.transactions,
    `${currency} ${num(row.revenue)}`,
    `${currency} ${num(row.cogs)}`,
    `${currency} ${num(row.expenses)}`,
    `${currency} ${num(row.netProfit)}`,
    `${row.grossMargin.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Interval / Day", "Invoices", "Revenue", "COGS", "Expenses", "Net Profit", "Margin"]],
    body: intervalTableData,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { fontStyle: "bold" },
      2: { fontStyle: "bold", textColor: [37, 99, 235] },
      5: { fontStyle: "bold", textColor: [16, 185, 129] },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if page needs to break before Section 4
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 20;
  }

  // ── SECTION 4: TOP PRODUCT MARGINS & SALES RANKING ────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("4. TOP PRODUCT MARGINS & SALES RANKING", 14, currentY);
  currentY += 4;

  const topProdData = report.topProducts.slice(0, 10).map((p) => [
    p.name,
    p.category,
    p.qtySold,
    `${currency} ${num(p.revenue)}`,
    `${currency} ${num(p.cogs)}`,
    `${currency} ${num(p.grossProfit)}`,
    `${p.marginPct.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Product Name", "Category", "Units", "Revenue", "COGS", "Gross Profit", "Margin"]],
    body: topProdData,
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129], // Emerald 600
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { fontStyle: "bold" },
      3: { fontStyle: "bold", textColor: [37, 99, 235] },
      5: { fontStyle: "bold", textColor: [16, 185, 129] },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if page needs to break before Section 5
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 20;
  }

  // ── SECTION 5: INVENTORY ASSET VALUATION SNAPSHOT ─────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("5. CURRENT INVENTORY VALUATION & STOCK HEALTH", 14, currentY);
  currentY += 4;

  const invSnapshotData = [
    [
      "Total Active Products in Catalog",
      report.summary.totalProductsCount.toString(),
      "Total Inventory Cost Valuation",
      `${currency} ${num(report.summary.totalStockCostValuation)}`,
    ],
    [
      "Total Inventory Retail Valuation",
      `${currency} ${num(report.summary.totalStockRetailValuation)}`,
      "Potential Catalog Gross Margin",
      `${currency} ${num(
        report.summary.totalStockRetailValuation - report.summary.totalStockCostValuation
      )}`,
    ],
    [
      "Low Stock Alert Items",
      report.summary.lowStockCount.toString(),
      "Out of Stock Depleted Items",
      report.summary.outOfStockCount.toString(),
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Inventory Dimension", "Metric", "Valuation Dimension", "Value"]],
    body: invSnapshotData,
    theme: "striped",
    headStyles: {
      fillColor: [139, 92, 246], // Purple 500
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { fontStyle: "bold" },
      2: { fontStyle: "bold" },
      3: { fontStyle: "bold", textColor: [139, 92, 246] },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if page needs to break before Section 6
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 20;
  }

  // ── SECTION 6: PAYMENT TENDER & EXPENSE BREAKDOWN ─────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("6. PAYMENT CHANNELS & OPERATING EXPENSES", 14, currentY);
  currentY += 4;

  const payData = report.paymentBreakdown.map((p) => [
    p.method,
    p.count,
    `${currency} ${num(p.total)}`,
    `${p.percentage.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Settlement Channel", "Invoices Handled", "Total Yield", "Revenue Share (%)"]],
    body: payData,
    theme: "grid",
    headStyles: {
      fillColor: [245, 158, 11], // Amber 500
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { fontStyle: "bold" },
      2: { fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  // ── FOOTERS ON ALL PAGES ──────────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate 400

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.text(
      "CONFIDENTIAL • Generated by ProTech Enterprise OS • Executive Financial Audit",
      14,
      pageHeight - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, {
      align: "right",
    });
  }

  // ── SAVE AND DOWNLOAD ─────────────────────────────────────────────────────
  const cleanBiz = report.businessName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Executive_Report_${cleanBiz}_${report.timeframe}_${format(
    new Date(report.startDate),
    "yyyy-MM-dd"
  )}.pdf`;

  doc.save(fileName);
}

/**
 * Targeted PDF Export for Specific Report Category Templates
 */
export async function exportCategoryPDF(
  categoryName: string,
  report: EnterpriseReportResult
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currency = report.currency;
  const generatedDate = format(new Date(), "MMM dd, yyyy HH:mm");

  // Top header banner
  doc.setFillColor(15, 30, 56);
  doc.rect(0, 0, pageWidth, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`${report.businessName.toUpperCase()} — ${categoryName.toUpperCase()} REPORT`, 14, 11);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(`Period: ${report.periodLabel} | Generated: ${generatedDate}`, 14, 18);
  doc.text(`Currency: ${currency}`, pageWidth - 14, 18, { align: "right" });

  let head: string[][] = [];
  let body: any[][] = [];
  let headerColor = [37, 99, 235];

  switch (categoryName.toLowerCase()) {
    case "sales": {
      headerColor = [37, 99, 235];
      head = [["Invoice #", "Date", "Customer", "Staff", "Method", "Items", "Total Amount"]];
      body = report.salesRows.slice(0, 35).map((s) => [
        s.invoiceNumber,
        s.date,
        s.customer,
        s.staff,
        s.paymentMethod,
        s.items,
        `${currency} ${num(s.totalAmount)}`,
      ]);
      break;
    }

    case "inventory": {
      headerColor = [16, 185, 129];
      head = [["Product", "SKU", "In Stock", "Cost Price", "Selling Price", "Valuation", "Status"]];
      body = report.inventorySnapshot.slice(0, 35).map((i) => [
        i.name,
        i.sku,
        i.currentStock,
        `${currency} ${num(i.costPrice)}`,
        `${currency} ${num(i.unitPrice)}`,
        `${currency} ${num(i.costValuation)}`,
        i.status,
      ]);
      break;
    }

    case "purchase": {
      headerColor = [245, 158, 11];
      head = [["Invoice / PO #", "Date", "Supplier", "Items", "Total Purchase Cost"]];
      body = report.purchaseRows.slice(0, 35).map((p) => [
        p.invoiceNumber,
        p.date,
        p.supplier,
        p.items,
        `${currency} ${num(p.totalAmount)}`,
      ]);
      break;
    }

    case "customer": {
      headerColor = [139, 92, 246];
      head = [["Customer Name", "Phone", "Invoices Count", "Total Spend"]];
      body = report.customerBreakdown.topCustomers.map((c) => [
        c.name,
        c.phone,
        c.transactions,
        `${currency} ${num(c.totalSpent)}`,
      ]);
      break;
    }

    case "financial": {
      headerColor = [239, 68, 68];
      head = [["Accounting Line Item", "Amount"]];
      body = [
        ["Gross Sales Revenue", `${currency} ${num(report.summary.totalRevenue)}`],
        ["Cost of Goods Sold (COGS)", `${currency} ${num(report.summary.totalCOGS)}`],
        ["GROSS PROFIT", `${currency} ${num(report.summary.grossProfit)}`],
        ["Gross Margin (%)", `${report.summary.grossMargin.toFixed(1)}%`],
        ["Total Operating Expenses", `${currency} ${num(report.summary.totalExpenses)}`],
        ["NET OPERATING PROFIT", `${currency} ${num(report.summary.netProfit)}`],
        ["Net Margin (%)", `${report.summary.netMargin.toFixed(1)}%`],
        ["NRA 15% GST Collected", `${currency} ${num(report.summary.totalGST)}`],
      ];
      break;
    }

    case "performance": {
      headerColor = [14, 165, 233];
      head = [["Staff Member", "Email", "Invoices", "Total Sales Yield", "Average Ticket"]];
      body = report.staffPerformance.map((s) => [
        s.name,
        s.email,
        s.transactions,
        `${currency} ${num(s.totalRevenue)}`,
        `${currency} ${num(s.avgTransaction)}`,
      ]);
      break;
    }

    default:
      return exportEnterpriseReportPDF(report);
  }

  autoTable(doc, {
    startY: 32,
    head,
    body,
    theme: "striped",
    headStyles: {
      fillColor: headerColor as [number, number, number],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `CONFIDENTIAL • ${report.businessName} • ${categoryName} Audit`,
      14,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 8, {
      align: "right",
    });
  }

  const cleanCategory = categoryName.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`${cleanCategory}_Report_${format(new Date(), "yyyyMMdd")}.pdf`);
}
