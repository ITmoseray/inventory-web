import { getPublicReceipt } from "@/lib/actions/public-receipt";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, Download, Receipt as ReceiptIcon, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceiptActions } from "@/components/shared/ReceiptActions";

export default async function PublicReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const receipt = await getPublicReceipt(resolvedParams.id);

  if (!receipt) {
    return notFound();
  }

  if ('error' in receipt) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center p-4 sm:p-8 font-sans overflow-y-auto">
        <div className="w-full max-w-md my-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center p-8">
          <div className="h-20 w-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ReceiptIcon className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Receipt Unavailable</h1>
          <p className="text-slate-500 font-medium">{receipt.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center p-4 sm:p-8 font-sans overflow-y-auto">
      <div className="w-full max-w-md my-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden print:shadow-none print:border-none print:w-full print:my-0">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden print:bg-slate-900 print:text-white">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
           <div className="relative z-10 flex flex-col items-center">
              {receipt.business.logoUrl ? (
                <img src={receipt.business.logoUrl} alt="Logo" className="h-16 w-16 rounded-full border-4 border-white/20 mb-4 bg-white object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full border-4 border-white/20 mb-4 bg-white/10 flex items-center justify-center">
                  <ReceiptIcon className="h-8 w-8 text-white" />
                </div>
              )}
              <h1 className="text-2xl font-black text-white tracking-tight">{receipt.business.name}</h1>
              <p className="text-indigo-200 text-sm font-medium mt-1">{receipt.business.address || "Digital Receipt"}</p>
              {receipt.business.phone && <p className="text-indigo-200 text-xs mt-1">{receipt.business.phone}</p>}
           </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-8">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-6 border-b border-dashed border-slate-200 gap-4 sm:gap-0">
              <div className="flex flex-col">
                 <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction ID</span>
                 <span className="text-xs sm:text-sm font-black text-slate-900 break-all">{receipt.transactionId}</span>
              </div>
              <div className="flex flex-col sm:text-right">
                 <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Date</span>
                 <span className="text-xs sm:text-sm font-black text-slate-900">{format(new Date(receipt.date), "MMM dd, yyyy h:mm a")}</span>
              </div>
           </div>

           {receipt.customer && receipt.customer.name !== "WALKIN" && (
             <div className="mb-8 pb-6 border-b border-dashed border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Details</span>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-base font-black text-slate-900">{receipt.customer.name}</span>
                   {receipt.customer.phone && <span className="text-sm font-medium text-slate-500">({receipt.customer.phone})</span>}
                </div>
             </div>
           )}

           <div className="space-y-4 mb-8">
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                 <span>Item</span>
                 <span>Total</span>
              </div>
              {receipt.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start group gap-3">
                   <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-bold text-slate-900 break-words">{item.name}</span>
                      <span className="text-xs text-slate-500 font-medium">{item.quantity} x Le {Math.round(item.unitPrice).toLocaleString()}</span>
                   </div>
                   <span className="text-sm font-black text-slate-900 whitespace-nowrap pt-0.5">Le {Math.round(item.subtotal).toLocaleString()}</span>
                </div>
              ))}
           </div>

           <div className="bg-slate-50 rounded-2xl p-6 space-y-3 mb-8 border border-slate-100">
              <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                 <span>Subtotal</span>
                 <span>Le {Math.round(receipt.totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                 <span>Discount / Tax</span>
                 <span>Le 0</span>
              </div>
              <div className="h-px w-full bg-slate-200 my-2" />
              <div className="flex justify-between items-center">
                 <span className="text-base font-black text-slate-900">Total Amount</span>
                 <span className="text-xl font-black text-indigo-600">Le {Math.round(receipt.totalAmount).toLocaleString()}</span>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 text-sm gap-4 sm:gap-0">
              <div className="flex flex-col gap-1">
                 <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Payment Method</span>
                 <span className="font-black text-slate-900">{receipt.paymentMethod}</span>
              </div>
              <div className="flex flex-col gap-1 sm:text-right">
                 <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Status</span>
                 <span className="font-black text-emerald-500 flex items-center sm:justify-end gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {receipt.paymentStatus}
                 </span>
              </div>
           </div>
        </div>

        {/* Footer actions - Hidden on print */}
        <ReceiptActions receipt={receipt} />
      </div>
    </div>
  );
}
