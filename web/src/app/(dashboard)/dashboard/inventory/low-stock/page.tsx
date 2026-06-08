import { ResponsiveTable } from "@/components/shared/responsive-table";
import { getLowStockProducts } from "@/lib/actions/inventory";
import { Badge } from "@/components/ui/badge";
import { ModuleHeader } from "@/components/layout/ModuleHeader";
import React from "react";

// Assuming ResponsiveTable uses this Column interface
interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
}

interface Product {
  id: string;
  name: string;
  stockQuantity: number;
  minStockLevel: number;
  status: string;
}

export default async function LowStockPage() {
  const products = await getLowStockProducts();

  const columns: Column<Product>[] = [
    { header: "Product", accessor: (p: Product) => <span className="font-bold">{p.name}</span> },
    { header: "Stock", accessor: (p: Product) => p.stockQuantity },
    { header: "Threshold", accessor: (p: Product) => p.minStockLevel },
    { header: "Status", accessor: (p: Product) => (
      <Badge variant={p.status === "CRITICAL" ? "destructive" : "default"}>
        {p.status}
      </Badge>
    ) },
  ];

  return (
      <div className="p-6">
        <ModuleHeader title="Low Stock Alerts" description="Items requiring immediate attention" />
        <ResponsiveTable data={products} columns={columns} />
      </div>
  );
}
