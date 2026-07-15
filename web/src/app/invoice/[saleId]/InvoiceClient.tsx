"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, CheckCircle2, Building2, User, Calendar, CreditCard, Wrench } from "lucide-react";

export default function InvoiceClient({ sale }: { sale: any }) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const invoiceUrl = typeof window !== "undefined"
    ? `${window.location.origin}/invoice/${sale.id}`
    : `/invoice/${sale.id}`;

  const currency = sale.business?.currency === "SLL" ? "Le" : (sale.business?.currency || "Le");

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const el = invoiceRef.current!;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        // Multi-page if needed
        let y = 0;
        while (y < imgHeight) {
          pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
          y += pageHeight;
          if (y < imgHeight) pdf.addPage();
        }
      }

      pdf.save(`invoice-${sale.invoiceNumber}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 py-8 px-4">
      {/* Action Buttons — hidden on print */}
      <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div
        ref={invoiceRef}
        className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ fontFamily: "'Segoe UI', sans-serif" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {sale.business?.logoUrl ? (
                  <img src={sale.business.logoUrl} alt="logo" className="h-12 w-12 rounded-xl object-cover bg-white/20" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black">{sale.business?.name || "Business"}</h1>
                  {sale.business?.address && <p className="text-indigo-200 text-xs mt-0.5">{sale.business.address}</p>}
                </div>
              </div>
              {sale.business?.phone && <p className="text-indigo-200 text-xs">📞 {sale.business.phone}</p>}
              {sale.business?.email && <p className="text-indigo-200 text-xs">✉️ {sale.business.email}</p>}
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-xl mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <span className="text-sm font-black">PAID</span>
              </div>
              <p className="text-indigo-200 text-[10px] uppercase tracking-widest">Invoice No.</p>
              <p className="text-xl font-black">{sale.invoiceNumber}</p>
              <p className="text-indigo-200 text-xs mt-1">{formatDate(sale.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6">

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Customer */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">{sale.customer?.name || "Walk-in Customer"}</p>
              {sale.customer?.phone && <p className="text-slate-500 text-xs">{sale.customer.phone}</p>}
            </div>

            {/* Staff */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Technician</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {sale.staff?.name || sale.staffName || "Not Assigned"}
              </p>
              {sale.staff?.jobTitle && <p className="text-slate-500 text-xs">{sale.staff.jobTitle}</p>}
            </div>
          </div>

          {/* Services Table */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Services Rendered</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="text-left pb-2">Description</th>
                  <th className="text-center pb-2">Qty</th>
                  <th className="text-right pb-2">Unit Price</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="py-3">
                      <p className="font-bold text-slate-800 text-sm">{item.product?.name || item.productName || "Service"}</p>
                      {item.product?.description && (
                        <p className="text-slate-400 text-xs">{item.product.description}</p>
                      )}
                    </td>
                    <td className="py-3 text-center text-sm font-bold text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-right text-sm font-bold text-slate-600">
                      {currency} {Number(item.unitPrice).toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-sm font-black text-slate-800">
                      {currency} {Number(item.total).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="border-t-2 border-slate-100 pt-4">
            <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-4 rounded-2xl">
              <div>
                <p className="text-indigo-200 text-[10px] uppercase tracking-widest">Amount Paid</p>
                <div className="flex items-center gap-2 mt-1">
                  <CreditCard className="h-4 w-4 text-indigo-300" />
                  <span className="text-indigo-200 text-xs font-bold">{sale.paymentMethod?.replace("_", " ")}</span>
                </div>
              </div>
              <p className="text-3xl font-black">
                {currency} {Number(sale.totalAmount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Scan to View Invoice</p>
              <p className="text-xs text-slate-400 max-w-[200px]">Customer can scan this code to download a copy on their phone</p>
            </div>
            <div className="p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
              <QRCodeSVG
                value={invoiceUrl}
                size={100}
                bgColor="#ffffff"
                fgColor="#1e1b4b"
                level="M"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">Thank you for your business!</p>
            <p className="text-[10px] text-slate-300 mt-1">{invoiceUrl}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
