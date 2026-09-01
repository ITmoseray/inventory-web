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
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:py-12 sm:px-8 font-sans">
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center p-8">
          <div className="h-20 w-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ReceiptIcon className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Receipt Unavailable</h1>
          <p className="text-slate-500 font-medium">{receipt.error}</p>
        </div>
      </div>
    );
  }

  const rawSettings = (receipt.business as any)?.receiptSettings || {};
  const isNraMode = Boolean(rawSettings.enableNraFiscalMode);
  const tin = rawSettings.taxIdentificationNumber || receipt.business.taxId || "1002934-8";
  const ecrId = rawSettings.nraDeviceId || "CIS-TNSD-001";
  const gstRate = rawSettings.gstRate ?? 15;
  const isTaxInclusive = rawSettings.taxInclusive ?? true;
  const showGst = Boolean(isNraMode && rawSettings.showGstBreakdown !== false) || (rawSettings.showGstBreakdown === true);

  const rateDecimal = gstRate / 100;
  const totalAmount = Number(receipt.totalAmount) || 0;
  const netTaxableAmount = isTaxInclusive ? (totalAmount / (1 + rateDecimal)) : totalAmount;
  const gstAmount = isTaxInclusive ? (totalAmount - netTaxableAmount) : (totalAmount * rateDecimal);
  const grossTotal = isTaxInclusive ? totalAmount : (totalAmount + gstAmount);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:py-12 sm:px-8 font-sans">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 print:shadow-none print:border-none print:w-full">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden rounded-t-3xl print:bg-slate-900 print:text-white print:rounded-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
           <div className="relative z-10 flex flex-col items-center">
              {receipt.business.logoUrl ? (
                <img src={receipt.business.logoUrl} alt="Logo" className="h-16 w-16 rounded-full border-4 border-white/20 mb-4 bg-white object-cover shadow-md" />
              ) : (
                <div className="h-16 w-16 rounded-full border-4 border-white/20 mb-4 bg-white/10 flex items-center justify-center">
                  <ReceiptIcon className="h-8 w-8 text-white" />
                </div>
              )}
              <h1 className="text-2xl font-black text-white tracking-tight">{receipt.business.name}</h1>
              
              {isNraMode && (
                <div className="my-1.5 py-0.5 px-3 bg-white/20 text-white font-black text-[10px] uppercase tracking-wider rounded-full border border-white/30 backdrop-blur-sm">
                  *** NRA FISCAL RECEIPT ***
                </div>
              )}

              {rawSettings.headerTagline && (
                <p className="text-indigo-100 text-xs italic font-medium mt-0.5">{rawSettings.headerTagline}</p>
              )}
              <p className="text-indigo-200 text-sm font-medium mt-1">{receipt.business.address || "Digital Receipt"}</p>
              
              {/* Phone Contacts */}
              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-indigo-200 text-xs mt-1.5 font-medium">
                {receipt.business.phone && <span>Tel: {receipt.business.phone}</span>}
                {(receipt.business as any)?.secondaryPhone && <span>Alt: {(receipt.business as any).secondaryPhone}</span>}
                {(receipt.business as any)?.whatsappPhone && <span>WhatsApp: {(receipt.business as any).whatsappPhone}</span>}
              </div>

              {/* NRA Fiscal Identifiers */}
              {isNraMode && (
                <div className="pt-2 text-indigo-100 text-[11px] font-mono flex items-center justify-center gap-3 border-t border-white/20 mt-2">
                  <span>TIN: <b>{tin}</b></span>
                  <span>CIS ID: <b>{ecrId}</b></span>
                </div>
              )}
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
                 <span>Item {showGst && <span className="text-[10px] text-indigo-600">[Tax]</span>}</span>
                 <span>Total</span>
              </div>
              {receipt.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start group gap-3">
                   <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-bold text-slate-900 break-words">
                        {item.name} {showGst && <span className="text-[10px] font-bold text-indigo-600">[A]</span>}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{item.quantity} x Le {Math.round(item.unitPrice).toLocaleString()}</span>
                   </div>
                   <span className="text-sm font-black text-slate-900 whitespace-nowrap pt-0.5">Le {Math.round(item.subtotal).toLocaleString()}</span>
                </div>
              ))}
           </div>

           {/* Totals Box & 15% GST Breakdown */}
           <div className="bg-slate-50 rounded-2xl p-6 space-y-3 mb-8 border border-slate-100">
              {showGst ? (
                <>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                     <span>Taxable Base (A - 15%)</span>
                     <span className="font-mono font-bold text-slate-700">Le {netTaxableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                     <span>NRA GST (15%)</span>
                     <span className="font-mono font-bold text-indigo-600">Le {gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                     <span>Exempt / Zero-Rated (B - 0%)</span>
                     <span className="font-mono">Le 0.00</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                   <span>Subtotal</span>
                   <span>Le {Math.round(totalAmount).toLocaleString()}</span>
                </div>
              )}
              <div className="h-px w-full bg-slate-200 my-2" />
              <div className="flex justify-between items-center">
                 <span className="text-base font-black text-slate-900">Total Payable</span>
                 <span className="text-xl font-black text-indigo-600">Le {Math.round(grossTotal).toLocaleString()}</span>
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

            {/* Custom Notes & Return Policy */}
            <div className="mt-8 pt-6 border-t border-dashed border-slate-200 text-center space-y-1 text-slate-500">
               <p className="text-xs font-semibold text-slate-700">{rawSettings.footerMessage || "Thank you for your business!"}</p>
               <p className="text-[10px] text-slate-400 italic">{rawSettings.returnPolicy || "* Returns accepted within 7 days with original receipt *"}</p>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-2">Powered by Enterprise OS</p>
            </div>
         </div>

        {/* Footer actions - Hidden on print */}
        <ReceiptActions receipt={receipt} />
      </div>
    </div>
  );
}
