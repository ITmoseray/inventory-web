"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getInvoiceById, recordInvoicePayment } from "@/lib/actions/invoices";
import { Printer, CreditCard, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  async function loadInvoice() {
    try {
      const data = await getInvoiceById(id);
      if (!data) {
        toast.error("Invoice not found");
        router.push("/dashboard/sales/invoices");
        return;
      }
      setInvoice(data);
      setPaymentAmount(data.balanceDue.toString());
    } catch (error) {
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      return toast.error("Invalid payment amount");
    }
    
    setIsRecordingPayment(true);
    try {
      const res = await recordInvoicePayment(id, Number(paymentAmount), "CASH", "MANUAL");
      if (res.success) {
        toast.success("Payment recorded!");
        loadInvoice(); // reload
      } else {
        toast.error(res.error || "Failed to record payment");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading invoice...</div>;
  }

  if (!invoice) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Print Styles injected to hide layout elements */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}} />

      {/* Action Bar (Hidden when printing) */}
      <div className="flex items-center justify-between print-hidden">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/sales/invoices')}
            className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoice {invoice.invoiceNumber}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-500 text-sm">Created {format(new Date(invoice.createdAt), 'MMM d, yyyy')}</span>
              {invoice.status === "PAID" && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Paid in Full</Badge>}
              {invoice.status === "PARTIAL" && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Partially Paid</Badge>}
              {invoice.status === "UNPAID" && <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">Unpaid</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" onClick={handlePrint} className="rounded-xl h-10">
              <Printer className="w-4 h-4 mr-2" /> Print PDF
           </Button>
        </div>
      </div>

      {/* Main Grid: Invoice Preview + Payment Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* The Printable Invoice Document */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden" id="printable-invoice">
           <div className="p-10 text-slate-800">
             
             {/* Header */}
             <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
                <div>
                   <h2 className="text-3xl font-bold text-indigo-900 tracking-tight uppercase">Invoice</h2>
                   <p className="text-slate-500 font-medium mt-1">#{invoice.invoiceNumber}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                   <h3 className="font-bold text-lg text-slate-900">{invoice.business?.name || 'Your Business'}</h3>
                   <p className="mt-1">{invoice.business?.address || 'No Address Set'}</p>
                   <p>{invoice.business?.email}</p>
                   <p>{invoice.business?.phone}</p>
                </div>
             </div>

             {/* Meta Data */}
             <div className="flex justify-between items-start mb-8 text-sm">
                <div>
                   <p className="text-slate-500 font-semibold uppercase mb-1">Bill To:</p>
                   {invoice.customer ? (
                     <>
                       <p className="font-bold text-slate-900 text-lg">{invoice.customer.name}</p>
                       {invoice.customer.address && <p className="text-slate-600">{invoice.customer.address}</p>}
                       {invoice.customer.phone && <p className="text-slate-600">{invoice.customer.phone}</p>}
                       {invoice.customer.email && <p className="text-slate-600">{invoice.customer.email}</p>}
                     </>
                   ) : (
                     <p className="text-slate-600 italic">Walk-in Customer</p>
                   )}
                </div>
                <div className="text-right space-y-2">
                   <div>
                     <p className="text-slate-500 font-semibold uppercase">Issue Date</p>
                     <p className="font-medium text-slate-900">{format(new Date(invoice.issueDate), 'MMMM d, yyyy')}</p>
                   </div>
                   <div>
                     <p className="text-slate-500 font-semibold uppercase">Due Date</p>
                     <p className="font-medium text-slate-900">{format(new Date(invoice.dueDate), 'MMMM d, yyyy')}</p>
                   </div>
                </div>
             </div>

             {/* Line Items */}
             <table className="w-full text-left border-collapse mb-8">
               <thead>
                 <tr className="border-b-2 border-slate-800 text-slate-800 uppercase text-xs">
                   <th className="py-3 px-2 font-bold w-1/2">Description</th>
                   <th className="py-3 px-2 font-bold text-center">Qty</th>
                   <th className="py-3 px-2 font-bold text-right">Price</th>
                   <th className="py-3 px-2 font-bold text-right">Amount</th>
                 </tr>
               </thead>
               <tbody>
                 {invoice.items.map((item: any) => (
                   <tr key={item.id} className="border-b border-slate-200">
                     <td className="py-4 px-2">
                        <p className="font-semibold text-slate-800">{item.description}</p>
                     </td>
                     <td className="py-4 px-2 text-center text-slate-600">{item.quantity}</td>
                     <td className="py-4 px-2 text-right text-slate-600">Le {Number(item.unitPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                     <td className="py-4 px-2 text-right font-semibold text-slate-800">Le {Number(item.total).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                   </tr>
                 ))}
               </tbody>
             </table>

             {/* Totals */}
             <div className="flex justify-end mb-8">
                <div className="w-1/2 md:w-1/3 space-y-3 text-sm">
                   <div className="flex justify-between text-slate-600">
                     <span>Subtotal</span>
                     <span>Le {Number(invoice.subTotal).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                   </div>
                   {Number(invoice.taxRate) > 0 && (
                     <div className="flex justify-between text-slate-600">
                       <span>Tax ({Number(invoice.taxRate)}%)</span>
                       <span>Le {Number(invoice.taxAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                     </div>
                   )}
                   <div className="flex justify-between text-lg font-bold text-indigo-900 border-t border-slate-200 pt-3">
                     <span>Total</span>
                     <span>Le {Number(invoice.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                   </div>
                   {Number(invoice.totalAmount) - Number(invoice.balanceDue) > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold border-b border-slate-200 pb-3">
                        <span>Amount Paid</span>
                        <span>- Le {(Number(invoice.totalAmount) - Number(invoice.balanceDue)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                   )}
                   <div className="flex justify-between text-xl font-bold text-rose-600 pt-1">
                     <span>Balance Due</span>
                     <span>Le {Number(invoice.balanceDue).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                   </div>
                </div>
             </div>

             {/* Footer / Notes */}
             <div className="text-sm text-slate-500 space-y-4">
                {invoice.notes && (
                  <div>
                    <p className="font-semibold text-slate-700">Notes</p>
                    <p>{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="font-semibold text-slate-700">Terms & Conditions</p>
                    <p>{invoice.terms}</p>
                  </div>
                )}
             </div>

           </div>
        </div>

        {/* Sidebar / Payment Panel (Hidden when printing) */}
        <div className="lg:col-span-1 space-y-6 print-hidden">
           {invoice.status !== "PAID" && (
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-indigo-600" /> Record Payment
                </h3>
                <form onSubmit={handleRecordPayment} className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount (Le)</label>
                     <Input 
                       type="number" 
                       min="1" 
                       max={Number(invoice.balanceDue)}
                       step="0.01" 
                       value={paymentAmount}
                       onChange={(e) => setPaymentAmount(e.target.value)}
                       className="text-lg font-bold rounded-xl"
                       required
                     />
                   </div>
                   <Button type="submit" disabled={isRecordingPayment} className="w-full rounded-xl h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                     {isRecordingPayment ? "Recording..." : "Record Payment"}
                   </Button>
                </form>
             </div>
           )}

           {/* Payment History */}
           {invoice.payments && invoice.payments.length > 0 && (
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payment History</h3>
                <div className="space-y-3">
                  {invoice.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{format(new Date(p.createdAt), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-slate-500">{p.paymentMethod}</p>
                      </div>
                      <div className="font-bold text-emerald-600">
                        + Le {Number(p.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
