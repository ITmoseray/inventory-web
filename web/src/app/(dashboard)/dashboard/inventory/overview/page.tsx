import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryOverview, getFastMovingProducts } from "@/lib/actions/inventory";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { ModuleHeader } from "@/components/layout/ModuleHeader";

export default async function InventoryOverviewPage() {
  const [overview, fastMoving] = await Promise.all([
      getInventoryOverview(),
      getFastMovingProducts()
  ]);

  return (
    <div className="p-6 space-y-6">
      <ModuleHeader title="Inventory Intelligence Overview" description="High-level asset performance and stock status" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold">Total Stock Value</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-black">Le {overview.totalValue.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold">Low Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-black text-amber-600">{overview.lowStock}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold">Critical Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-black text-rose-600">{overview.criticalStock}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold">Fast Moving</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <ul className="text-xs space-y-1">
                    {fastMoving.map(p => <li key={p.name}>• {p.name}</li>)}
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
