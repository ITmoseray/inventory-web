import { getPublicReceipt } from "@/lib/actions/public-receipt";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, Download, Receipt as ReceiptIcon, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PublicReceiptPage({ params }: { params: { id: string } }) {
  const receipt = await getPublicReceipt(params.id);

  if (!receipt) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden print:shadow-none print:border-none print:w-full">
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
        <div className="p-8">
           <div className="flex items-center justify-between mb-8 pb-6 border-b border-dashed border-slate-200">
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction ID</span>
                 <span className="text-sm font-black text-slate-900">{receipt.transactionId}</span>
              </div>
              <div className="flex flex-col text-right">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</span>
                 <span className="text-sm font-black text-slate-900">{format(new Date(receipt.date), "MMM dd, yyyy h:mm a")}</span>
              </div>
           </div>

           <div className="space-y-4 mb-8">
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                 <span>Item</span>
                 <span>Total</span>
              </div>
              {receipt.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center group">
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{item.name}</span>
                      <span className="text-xs text-slate-500 font-medium">{item.quantity} x Le {Math.round(item.unitPrice).toLocaleString()}</span>
                   </div>
                   <span className="text-sm font-black text-slate-900">Le {Math.round(item.subtotal).toLocaleString()}</span>
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

           <div className="flex items-center justify-between px-2 text-sm">
              <div className="flex flex-col gap-1">
                 <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Payment Method</span>
                 <span className="font-black text-slate-900">{receipt.paymentMethod}</span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                 <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Status</span>
                 <span className="font-black text-emerald-500 flex items-center justify-end gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {receipt.paymentStatus}
                 </span>
              </div>
           </div>
        </div>

        {/* Footer actions - Hidden on print */}
        <div className="bg-slate-50 p-6 flex gap-3 print:hidden border-t border-slate-100">
           {/* Client-side print button requires a client component, but we can do a simple a href="#" onClick="window.print()" hack, or just make a small client component. Let's make a small client wrapper or just use standard button with dangerouslySetInnerHTML if needed. Better yet, we can't easily use onClick in a server component. Wait, this is a Server Component. We can use a tiny inline script or a Client Component for the buttons. */}
           <a href={`javascript:window.print()`} className="flex-1 flex items-center justify-center h-12 rounded-xl text-xs font-black tracking-widest uppercase bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-100 transition-colors">
              <Printer className="h-4 w-4 mr-2" /> Print
           </a>
        </div>
      </div>
    </div>
  );
}
