"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function ExportButton({ lowStockProducts, recentMovements }: { lowStockProducts: any[], recentMovements: any[] }) {
  const handleExportCSV = () => {
    let csvContent = "--- LOW STOCK ALERT ---\n";
    csvContent += "Product Name,Min Level,Current Stock,Status\n";
    lowStockProducts.forEach(p => {
      csvContent += `"${p.name}",${p.minStockLevel},${p.stockQuantity},${p.status}\n`;
    });
    
    csvContent += "\n--- RECENT MOVEMENTS ---\n";
    csvContent += "Date,Product,Type,Quantity\n";
    recentMovements.forEach(m => {
      csvContent += `"${format(new Date(m.timestamp), "yyyy-MM-dd HH:mm")}","${m.productName}",${m.type},${m.quantity}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `stock_overview_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExportCSV}
      className="h-9 text-xs font-semibold rounded-md shadow-sm border-slate-200 dark:border-slate-800"
    >
      Export Report
    </Button>
  );
}
