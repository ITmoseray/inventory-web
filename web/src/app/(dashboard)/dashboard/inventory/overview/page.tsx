import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getInventoryOverview, getFastMovingProducts, getLowStockProducts, getStockMovements } from "@/lib/actions/inventory";
import { AlertTriangle, TrendingUp, DollarSign, ArrowRight, ArrowDownRight, ArrowUpRight, Package, Boxes, Eye } from "lucide-react";
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

  const kpis = [
    {
      label: "Total Valuation",
      value: `Le ${Math.round(overview.totalValue).toLocaleString()}`,
      sub: "Total stock worth",
      color: "#10B981",
      icon: DollarSign,
    },
    {
      label: "Low Stock Items",
      value: overview.lowStock,
      sub: "Items below minimum",
      color: "#F59E0B",
      icon: AlertTriangle,
    },
    {
      label: "Critical Stock",
      value: overview.criticalStock,
      sub: "Out of stock or near zero",
      color: "#EF4444",
      icon: AlertTriangle,
    },
    {
      label: "Fast Moving",
      value: fastMoving.length,
      sub: "High velocity products",
      color: "#2563EB",
      icon: TrendingUp,
    },
  ];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Stock Overview</h1>
          <p className="section-label" style={{ margin: "4px 0 0 0" }}>Enterprise inventory intelligence, valuations, and replenishment alerts</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExportButton lowStockProducts={lowStockProducts} recentMovements={recentMovements} />
          <Link href="/dashboard/inventory/products">
            <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 13 }}>
              <Package size={14} /> Full Catalog
            </button>
          </Link>
          <Link href="/dashboard/inventory/adjustments">
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13 }}>
              <Boxes size={14} /> Stock Adjustment
            </button>
          </Link>
        </div>
      </div>
      
      {/* 4 KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="kpi-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 500, marginBottom: 4 }}>{kpi.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800 }}>{kpi.value}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{kpi.sub}</div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: kpi.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color={kpi.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Grids */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 20 }}>
        
        {/* Low Stock Alerts */}
        <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700 }}>Action Required: Low Stock</div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>Assets below minimum safety thresholds</div>
            </div>
            <Link href="/dashboard/purchases">
              <button className="btn-secondary" style={{ padding: "5px 10px", fontSize: 11.5, display: "flex", alignItems: "center", gap: 4 }}>
                Reorder <ArrowRight size={12} />
              </button>
            </Link>
          </div>
          <div style={{ flex: 1 }}>
            {lowStockProducts.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
                All stock levels are healthy.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {lowStockProducts.slice(0, 8).map((product: any) => (
                  <div key={product.id} className="table-row-hover" style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--foreground)" }} className="truncate">{product.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>Min Level: {product.minStockLevel}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, marginLeft: 16 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{product.stockQuantity}</div>
                      <span className="status-badge" style={{
                        background: product.status === "CRITICAL" ? "#FEE2E2" : "#FEF9C3",
                        color: product.status === "CRITICAL" ? "#B91C1C" : "#A16207",
                      }}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700 }}>Recent Stock Movements</div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>Latest inbound and outbound transactions</div>
            </div>
            <Link href="/dashboard/inventory/movements">
              <button className="btn-secondary" style={{ padding: "5px 10px", fontSize: 11.5, display: "flex", alignItems: "center", gap: 4 }}>
                View Ledger <ArrowRight size={12} />
              </button>
            </Link>
          </div>
          <div style={{ flex: 1 }}>
            {recentMovements.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
                No recent movements recorded.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recentMovements.slice(0, 8).map((movement: any) => (
                  <div key={movement.id} className="table-row-hover" style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: movement.type === "IN" ? "#DCFCE7" : "#EFF6FF",
                        color: movement.type === "IN" ? "#15803D" : "#2563EB",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        {movement.type === "IN" ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--foreground)" }} className="truncate">{movement.productName}</div>
                        <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{format(new Date(movement.timestamp), "MMM dd, HH:mm")}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 16 }}>
                      <div style={{
                        fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700,
                        color: movement.type === "IN" ? "#10B981" : "var(--foreground)"
                      }}>
                        {movement.type === "IN" ? "+" : "-"}{movement.quantity}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", textTransform: "uppercase" }}>{movement.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
