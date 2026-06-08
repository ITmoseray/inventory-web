import { ResponsiveTable } from "@/components/shared/responsive-table";
import { getStockMovements } from "@/lib/actions/inventory";

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
        <h1 className="text-2xl font-black mb-6 uppercase tracking-tight">Stock Movement History</h1>
        <ResponsiveTable data={movements} columns={columns} />
      </div>
  );
}
