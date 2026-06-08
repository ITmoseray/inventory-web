import { ResponsiveTable } from "@/components/shared/responsive-table";
import { getStockMovements } from "@/lib/actions/inventory";
import { ModuleHeader } from "@/components/layout/ModuleHeader";

export default async function MovementsPage() {
  const movements = await getStockMovements();

  const columns = [
    { header: "Product", accessor: (m: any) => m.productName },
    { header: "Quantity", accessor: (m: any) => m.quantity },
    { header: "Type", accessor: (m: any) => m.type },
    { header: "Date", accessor: (m: any) => new Date(m.timestamp).toLocaleDateString() },
  ];

  return (
      <div className="p-6">
        <ModuleHeader title="Stock Movement History" description="Audit trail of all inventory events" />
        <ResponsiveTable data={movements} columns={columns} />
      </div>
  );
}
