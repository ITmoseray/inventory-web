"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "@/components/providers/business-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react";

export default function BusinessAnalyticsPage() {
  const { activeBusinessId } = useBusiness();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      if (!activeBusinessId) return;
      try {
        const res = await fetch(`/api/business/stats?businessId=${activeBusinessId}`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        toast.error("Failed to load analytics");
      }
    }
    loadStats();
  }, [activeBusinessId]);

  if (!activeBusinessId) return <div>Please select a business first.</div>;
  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-6 md:p-12 bg-slate-50 min-h-screen space-y-8">
      <h1 className="text-3xl font-black">Analytics Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">${stats.revenue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold">Total Products</CardTitle>
            <Package className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.products}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
