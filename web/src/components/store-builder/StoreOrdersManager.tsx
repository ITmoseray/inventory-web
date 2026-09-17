"use client";

import React, { useState } from "react";
import { 
  ShoppingBag, Phone, MessageSquare, Clock, CheckCircle2, AlertCircle, 
  Search, Eye, ArrowRight, ExternalLink, Calendar, MapPin, Truck
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderRecord {
  id: string;
  soNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryAddress?: string | null;
  deliveryMethod?: string | null;
  paymentTerms?: string | null;
  status: string; // PENDING, CONFIRMED, PROCESSING, COMPLETED, CANCELLED
  totalAmount: number;
  subtotal: number;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface Props {
  initialOrders: OrderRecord[];
  currency?: string;
  storeSlug?: string;
}

export function StoreOrdersManager({ initialOrders = [], currency = "SLE", storeSlug }: Props) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20"><Clock className="w-3 h-3" /> Pending Review</span>;
      case "CONFIRMED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>;
      case "COMPLETED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20"><AlertCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border">{status}</span>;
    }
  };

  const getWhatsAppChatUrl = (order: OrderRecord) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hello ${order.customerName},\nThis is regarding your recent online order #${order.soNumber} for ${currency} ${order.totalAmount.toLocaleString()}.\nWe are preparing your items for delivery!`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Online Storefront Orders
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Incoming orders submitted via your public web shop. Contact customers directly on WhatsApp, confirm delivery, and convert them to POS sales.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/sales/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-card border hover:bg-muted transition-colors"
          >
            Sales Orders Pipeline
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center bg-muted/60 p-1 rounded-xl border text-xs font-medium">
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === st ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "ALL" ? `All (${orders.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Delivery & Method</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-base font-medium">No storefront orders found.</p>
                    <p className="text-xs mt-1">When shoppers check out on your online store, orders will appear here in real-time.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                      {order.soNumber}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3" />
                        {order.customerPhone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-medium text-foreground flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                        {order.deliveryMethod || "Delivery"}
                      </div>
                      <div className="text-muted-foreground line-clamp-1 max-w-[200px]" title={order.deliveryAddress || ""}>
                        {order.deliveryAddress || "Address on file"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-medium text-foreground">
                        {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"}
                      </span>
                      <div className="text-muted-foreground line-clamp-1 max-w-[180px]">
                        {order.items?.map(i => `${i.quantity}x ${i.productName}`).join(", ")}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-foreground">
                      {currency} {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getWhatsAppChatUrl(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Message customer on WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <span className="text-xs font-bold text-primary font-mono">{selectedOrder.soNumber}</span>
                <h3 className="font-bold text-lg text-foreground mt-0.5">Order Details</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border">
                <span className="text-muted-foreground block mb-1 font-semibold uppercase">Customer</span>
                <p className="font-bold text-foreground text-sm">{selectedOrder.customerName}</p>
                <p className="text-muted-foreground mt-0.5 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3" /> {selectedOrder.customerPhone}
                </p>
                {selectedOrder.customerEmail && (
                  <p className="text-muted-foreground">{selectedOrder.customerEmail}</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border">
                <span className="text-muted-foreground block mb-1 font-semibold uppercase">Delivery Info</span>
                <p className="font-bold text-foreground">{selectedOrder.deliveryMethod || "Delivery"}</p>
                <p className="text-muted-foreground mt-0.5">{selectedOrder.deliveryAddress || "Not specified"}</p>
                <p className="text-muted-foreground mt-1">Payment: {selectedOrder.paymentTerms || "Cash on Delivery"}</p>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold block mb-0.5">Customer / Order Note:</span>
                {selectedOrder.notes}
              </div>
            )}

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Order Line Items</h4>
              <div className="border rounded-xl overflow-hidden divide-y divide-border">
                {selectedOrder.items?.map(i => (
                  <div key={i.id} className="flex items-center justify-between p-3 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{i.productName}</p>
                      <p className="text-muted-foreground">{i.quantity} x {currency} {i.unitPrice.toLocaleString()}</p>
                    </div>
                    <div className="font-bold text-foreground">
                      {currency} {i.total.toLocaleString()}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-muted/40 text-sm font-bold">
                  <span>Total Amount</span>
                  <span className="text-primary">{currency} {selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t gap-2">
              <a
                href={getWhatsAppChatUrl(selectedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat on WhatsApp
              </a>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/sales/orders"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Manage in Sales Pipeline
                </Link>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
