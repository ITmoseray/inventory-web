"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft, User, Truck, MapPin, CreditCard, FileText,
  Package, Clock, CheckCircle2, XCircle, Receipt, Edit,
  Trash2, AlertCircle, ChevronRight, Calendar, Phone, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  getSalesOrderById,
  updateSalesOrderStatus,
  deleteSalesOrder,
  convertSalesOrderToInvoice,
} from "@/lib/actions/sales-order";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:      { label: "Draft",      color: "text-slate-500",   bg: "bg-slate-100",   border: "border-slate-200" },
  PENDING:    { label: "Pending",    color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200" },
  CONFIRMED:  { label: "Confirmed",  color: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-200"  },
  PROCESSING: { label: "Processing", color: "text-violet-600",  bg: "bg-violet-50",   border: "border-violet-200"},
  SHIPPED:    { label: "Shipped",    color: "text-cyan-600",    bg: "bg-cyan-50",     border: "border-cyan-200"  },
  DELIVERED:  { label: "Delivered",  color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200"},
  COMPLETED:  { label: "Completed",  color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-300"},
  CANCELLED:  { label: "Cancelled",  color: "text-rose-600",    bg: "bg-rose-50",     border: "border-rose-200"  },
};

const WORKFLOW = ["DRAFT", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"];

// ── Next Action Buttons ──────────────────────────────────────────────────────

function getNextAction(status: string) {
  const map: Record<string, { label: string; next: string; color: string }> = {
    DRAFT:      { label: "Submit for Approval", next: "PENDING",    color: "bg-amber-500 hover:bg-amber-600" },
    PENDING:    { label: "Confirm Order",        next: "CONFIRMED",  color: "bg-blue-600 hover:bg-blue-700"  },
    CONFIRMED:  { label: "Mark as Processing",   next: "PROCESSING", color: "bg-violet-600 hover:bg-violet-700"},
    PROCESSING: { label: "Mark as Shipped",      next: "SHIPPED",    color: "bg-cyan-600 hover:bg-cyan-700"  },
    SHIPPED:    { label: "Mark as Delivered",    next: "DELIVERED",  color: "bg-emerald-600 hover:bg-emerald-700"},
    DELIVERED:  { label: "Complete & Convert to Invoice", next: "COMPLETED", color: "bg-indigo-600 hover:bg-indigo-700" },
  };
  return map[status] ?? null;
}

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Note dialog
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState("");

  // Confirm delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    try {
      setLoading(true);
      const data = await getSalesOrderById(id);
      setOrder(data);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to load sales order");
    } finally {
      setLoading(false);
    }
  }

  const openStatusDialog = (next: string) => {
    setPendingStatus(next);
    setStatusNote("");
    if (next === "COMPLETED") {
      // Convert to invoice — confirm first
      setShowNoteDialog(true);
    } else {
      setShowNoteDialog(true);
    }
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    setActionLoading(true);
    try {
      if (pendingStatus === "COMPLETED") {
        const result = await convertSalesOrderToInvoice(id);
        toast.success(`Converted to Invoice ${result.invoiceNumber} 🎉`);
      } else {
        await updateSalesOrderStatus(id, pendingStatus, statusNote || undefined);
        toast.success(`Order status updated to ${STATUS_CONFIG[pendingStatus]?.label}`);
      }
      await fetchOrder();
      setShowNoteDialog(false);
    } catch (err: any) {
      toast.error(err.message ?? "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await updateSalesOrderStatus(id, "CANCELLED", "Order cancelled");
      toast.success("Order cancelled");
      await fetchOrder();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to cancel");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteSalesOrder(id);
      toast.success("Order deleted");
      router.push("/dashboard/sales/orders");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 animate-pulse" />
          <p className="text-sm font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading…</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.DRAFT;
  const nextAction = getNextAction(order.status);
  const canCancel = !["COMPLETED", "CANCELLED"].includes(order.status);
  const canDelete = ["DRAFT", "CANCELLED"].includes(order.status);
  const statusIndex = WORKFLOW.indexOf(order.status);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 md:px-10 h-20 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales/orders">
            <button className="h-10 w-10 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </button>
          </Link>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
              Sales Orders
            </p>
            <h1 className="text-2xl font-[1000] tracking-tight italic text-slate-900 dark:text-white uppercase leading-none flex items-center gap-3">
              {order.soNumber}
              <span className={cn("inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border", sc.bg, sc.color, sc.border)}>
                {sc.label}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canDelete && (
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="h-10 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          )}
          {canCancel && order.status !== "DRAFT" && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={actionLoading}
              className="h-10 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest border-slate-200 text-slate-500"
            >
              <XCircle className="h-4 w-4 mr-2" /> Cancel Order
            </Button>
          )}
          {nextAction && (
            <Button
              onClick={() => openStatusDialog(nextAction.next)}
              disabled={actionLoading}
              className={cn("h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest text-white shadow-lg gap-2", nextAction.color)}
            >
              <ChevronRight className="h-4 w-4" />
              {nextAction.label}
            </Button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 space-y-6">

        {/* ── Progress Bar ── */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-0">
            {WORKFLOW.filter(s => s !== "COMPLETED").map((step, idx) => {
              const done = WORKFLOW.indexOf(step) < statusIndex || (order.status === "COMPLETED" && step !== "CANCELLED");
              const active = step === order.status;
              const cfg = STATUS_CONFIG[step];
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                      done ? "bg-indigo-600 text-white" :
                      active ? cn(cfg.bg, cfg.color, "ring-2 ring-offset-2 ring-indigo-600") :
                      "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest whitespace-nowrap", active ? cfg.color : "text-slate-400")}>
                      {cfg.label}
                    </span>
                  </div>
                  {idx < WORKFLOW.filter(s => s !== "COMPLETED").length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-2 mb-5", done ? "bg-indigo-600" : "bg-slate-100 dark:bg-slate-800")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Items + Status History */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Items */}
            <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                    <Package className="h-4 w-4 text-amber-600" />
                  </div>
                  <h2 className="font-[1000] uppercase tracking-tight italic text-slate-900 dark:text-white">
                    Order Items
                  </h2>
                </div>

                <div className="rounded-2xl overflow-x-auto border border-slate-100 dark:border-slate-800 w-full">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="text-left px-5 py-4">Product</th>
                        <th className="text-center px-4 py-4">Qty</th>
                        <th className="text-right px-4 py-4">Unit Price</th>
                        <th className="text-right px-5 py-4">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {order.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-4">
                            <span className="font-bold text-slate-900 dark:text-white">{item.productName}</span>
                          </td>
                          <td className="px-4 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 text-right font-medium text-slate-600 dark:text-slate-400">
                            NLe {Number(item.unitPrice).toLocaleString()}
                          </td>
                          <td className="px-5 py-4 text-right font-black text-slate-900 dark:text-white">
                            NLe {Number(item.total).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <td colSpan={3} className="px-5 py-4 font-black uppercase tracking-widest text-slate-400 text-right text-xs">
                          Grand Total
                        </td>
                        <td className="px-5 py-4 text-right font-[1000] text-lg text-indigo-600 dark:text-indigo-400">
                          NLe {Number(order.totalAmount).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Summary rows */}
                <div className="mt-5 space-y-2 px-1">
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Discount</span>
                      <span className="font-bold text-emerald-600">- NLe {Number(order.discount).toLocaleString()}</span>
                    </div>
                  )}
                  {Number(order.tax) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Tax</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">+ NLe {Number(order.tax).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status History Timeline */}
            <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-slate-500" />
                  </div>
                  <h2 className="font-[1000] uppercase tracking-tight italic text-slate-900 dark:text-white">
                    Activity Timeline
                  </h2>
                </div>

                <div className="space-y-0">
                  {(order.statusHistory ?? []).map((h: any, idx: number) => {
                    const cfg = STATUS_CONFIG[h.status] ?? STATUS_CONFIG.DRAFT;
                    return (
                      <div key={h.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", cfg.bg)}>
                            <CheckCircle2 className={cn("h-4 w-4", cfg.color)} />
                          </div>
                          {idx < order.statusHistory.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-800 my-1 min-h-[24px]" />
                          )}
                        </div>
                        <div className="pb-6 flex-1">
                          <div className="flex items-center justify-between">
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", cfg.color)}>
                              {cfg.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {format(new Date(h.createdAt), "dd MMM yyyy, HH:mm")}
                            </span>
                          </div>
                          {h.note && (
                            <p className="text-xs text-slate-500 mt-1 font-medium">{h.note}</p>
                          )}
                          {h.user?.name && (
                            <p className="text-[10px] text-slate-400 mt-1">by {h.user.name}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Info Cards */}
          <div className="space-y-5">

            {/* Order Info */}
            <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-7 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Info</h3>
                <div className="space-y-3">
                  <InfoRow label="SO Number" value={order.soNumber} highlight />
                  <InfoRow label="Order Date" value={format(new Date(order.orderDate), "dd MMM yyyy")} />
                  {order.expectedDate && (
                    <InfoRow label="Expected" value={format(new Date(order.expectedDate), "dd MMM yyyy")} />
                  )}
                  <InfoRow label="Payment Terms" value={order.paymentTerms} />
                  <InfoRow label="Delivery Method" value={order.deliveryMethod ?? "—"} />
                  {order.convertedSaleId && (
                    <div className="flex items-center gap-2 mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                      <Receipt className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                        Converted to Invoice
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-7 space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</h3>
                </div>
                <div className="space-y-2">
                  <p className="font-[1000] text-slate-900 dark:text-white">{order.customerName}</p>
                  {order.customerEmail && (
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Mail className="h-3 w-3" /> {order.customerEmail}
                    </p>
                  )}
                  {order.customerPhone && (
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Phone className="h-3 w-3" /> {order.customerPhone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {(order.deliveryAddress || order.billingAddress) && (
              <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardContent className="p-7 space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Addresses</h3>
                  </div>
                  {order.deliveryAddress && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Delivery</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{order.deliveryAddress}</p>
                    </div>
                  )}
                  {order.billingAddress && order.billingAddress !== order.deliveryAddress && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Billing</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{order.billingAddress}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {order.notes && (
              <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardContent className="p-7 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</h3>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                    {order.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ── Status Note Dialog ── */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 max-w-md">
          <div className="bg-slate-950 p-8 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 mb-2">Confirm Action</p>
            <h3 className="text-3xl font-[1000] tracking-tighter uppercase italic leading-none">
              {pendingStatus === "COMPLETED" ? "Convert to Invoice" : `Set to ${STATUS_CONFIG[pendingStatus ?? ""]?.label}`}
            </h3>
          </div>
          <div className="p-8 space-y-6">
            {pendingStatus === "COMPLETED" && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-amber-800 dark:text-amber-400">This will:</p>
                  <ul className="text-xs text-amber-700 dark:text-amber-500 mt-2 space-y-1 list-disc list-inside">
                    <li>Create a new Invoice from this Sales Order</li>
                    <li>Deduct stock for all inventory-linked products</li>
                    <li>Mark this Sales Order as Completed</li>
                  </ul>
                </div>
              </div>
            )}
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Note (optional)
              </Label>
              <Textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note about this status change…"
                rows={3}
                className="rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-medium dark:text-white resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={confirmStatusChange}
                disabled={actionLoading}
                className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase text-[11px] tracking-widest"
              >
                {actionLoading ? "Processing…" : "Confirm"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNoteDialog(false)}
                className="flex-1 h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest border-slate-200 dark:border-slate-800 text-slate-500"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 max-w-sm">
          <div className="bg-rose-600 p-8 text-white">
            <h3 className="text-3xl font-[1000] tracking-tighter uppercase italic leading-none">Delete Order?</h3>
            <p className="text-sm text-rose-200 mt-2">This cannot be undone.</p>
          </div>
          <div className="p-8 flex gap-3">
            <Button
              onClick={handleDelete}
              disabled={actionLoading}
              className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 font-black uppercase text-[11px] tracking-widest"
            >
              {actionLoading ? "Deleting…" : "Delete"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest"
            >
              Keep
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Helper Component ─────────────────────────────────────────────────────────

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex-shrink-0 mt-0.5">{label}</span>
      <span className={cn("text-xs font-black text-right", highlight ? "text-indigo-600 dark:text-indigo-400 text-sm" : "text-slate-700 dark:text-slate-300")}>
        {value}
      </span>
    </div>
  );
}
