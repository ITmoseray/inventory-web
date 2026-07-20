import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getInventoryOverview, getFastMovingProducts, getLowStockProducts, getStockMovements } from "@/lib/actions/inventory";
import { AlertTriangle, TrendingUp, DollarSign, ArrowRight, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ModuleHeader } from "@/components/layout/ModuleHeader";
import { Button } from "@/components/ui/button";
import { ExportButton } from "./ExportButton";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default async function InventoryOverviewPage() {
  const [overview, fastMoving, lowStockProducts, recentMovements] = await Promise.all([
      getInventoryOverview(),
      getFastMovingProducts(),
      getLowStockProducts(),
      getStockMovements(undefined, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
  ]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <ModuleHeader title="Stock Overview" description="Enterprise inventory intelligence and alerts" />
        <div className="flex items-center gap-2">
           <ExportButton lowStockProducts={lowStockProducts} recentMovements={recentMovements} />
           <Link href="/dashboard/inventory/adjustments">
             <Button className="h-9 text-xs font-semibold rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
               Stock Adjustment
             </Button>
           </Link>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Valuation</CardTitle>
                <div className="h-8 w-8 rounded-md bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">Le {Math.round(overview.totalValue).toLocaleString()}</div>
            </CardContent>
        </Card>
        
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Low Stock</CardTitle>
                <div className="h-8 w-8 rounded-md bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{overview.lowStock} <span className="text-sm font-normal text-slate-500">Items</span></div>
            </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Critical Stock</CardTitle>
                <div className="h-8 w-8 rounded-md bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-500" />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{overview.criticalStock} <span className="text-sm font-normal text-slate-500">Items</span></div>
            </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Fast Moving</CardTitle>
                <div className="h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <ul className="text-xs space-y-1.5 font-medium text-slate-700 dark:text-slate-300">
                    {fastMoving.slice(0, 3).map(p => <li key={p.name} className="truncate">• {p.name}</li>)}
                </ul>
            </CardContent>
        </Card>
      </div>

      {/* Data Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alerts */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Action Required: Low Stock</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1">Assets below minimum thresholds</CardDescription>
                </div>
                <Link href="/dashboard/purchases">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800">
                        Reorder <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {lowStockProducts.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">All stock levels are healthy.</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {lowStockProducts.slice(0, 8).map((product: any) => (
                            <div key={product.id} className="p-3 px-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{product.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">Min Level: {product.minStockLevel}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{product.stockQuantity}</div>
                                    <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider", product.status === "CRITICAL" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400")}>
                                        {product.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Recent Stock Movements */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Recent Stock Movements</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1">Latest inbound and outbound transactions</CardDescription>
                </div>
                <Link href="/dashboard/inventory/movements">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800">
                        View Ledger <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {recentMovements.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">No recent movements found.</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {recentMovements.slice(0, 8).map((movement: any) => (
                            <div key={movement.id} className="p-3 px-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn("h-8 w-8 rounded-md flex items-center justify-center shrink-0", movement.type === "IN" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600")}>
                                        {movement.type === "IN" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{movement.productName}</div>
                                        <div className="text-[10px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">{format(new Date(movement.timestamp), "MMM dd, HH:mm")}</div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <div className={cn("font-bold text-sm", movement.type === "IN" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300")}>
                                        {movement.type === "IN" ? "+" : "-"}{movement.quantity}
                                    </div>
                                    <div className="text-[10px] font-medium text-slate-500 mt-0.5">{movement.type}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
