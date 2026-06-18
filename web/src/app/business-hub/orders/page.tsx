"use client";

import { useState, useEffect } from "react";
import { useBusiness } from "@/components/providers/business-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrders } from "@/lib/actions/order";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function BusinessOrdersPage() {
  const { activeBusinessId } = useBusiness();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadOrders() {
      if (!activeBusinessId) return;
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        toast.error("Failed to load orders");
      }
    }
    loadOrders();
  }, [activeBusinessId]);

  if (!activeBusinessId) return <div>Please select a business first.</div>;

  return (
    <div className="p-6 md:p-12 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8">Order History</h1>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-bold">{order.invoiceNumber}</TableCell>
                <TableCell>{order.customer?.name || "Walk-in"}</TableCell>
                <TableCell>${order.totalAmount}</TableCell>
                <TableCell>
                    <Badge variant={order.status === "COMPLETED" ? "default" : "secondary"}>
                        {order.status}
                    </Badge>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
