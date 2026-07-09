"use client";

import { Printer, Download } from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function ReceiptActions({ receipt }: { receipt: any }) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text(receipt.business.name, 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    if (receipt.business.address) {
      doc.text(receipt.business.address, 105, 28, { align: "center" });
    }
    if (receipt.business.phone) {
      doc.text(receipt.business.phone, 105, 34, { align: "center" });
    }

    doc.setFontSize(12);
    doc.text("Receipt", 105, 45, { align: "center" });

    // Details
    doc.setFontSize(10);
    doc.text(`Transaction ID: ${receipt.transactionId}`, 14, 55);
    doc.text(`Date: ${format(new Date(receipt.date), "MMM dd, yyyy h:mm a")}`, 14, 61);
    doc.text(`Payment: ${receipt.paymentMethod} (${receipt.paymentStatus})`, 14, 67);

    // Items table
    const tableData = receipt.items.map((item: any) => [
      item.name,
      item.quantity.toString(),
      `Le ${Math.round(item.unitPrice).toLocaleString()}`,
      `Le ${Math.round(item.subtotal).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 75,
      head: [["Item", "Qty", "Price", "Total"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 75;

    // Totals
    doc.setFontSize(12);
    doc.text(`Total Amount: Le ${Math.round(receipt.totalAmount).toLocaleString()}`, 14, finalY + 15);

    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for your business!", 105, finalY + 30, { align: "center" });

    doc.save(`Receipt-${receipt.transactionId}.pdf`);
  };

  return (
    <div className="bg-slate-50 p-6 flex gap-3 print:hidden border-t border-slate-100">
      <button 
        onClick={handlePrint} 
        className="flex-1 flex items-center justify-center h-12 rounded-xl text-xs font-black tracking-widest uppercase bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-100 transition-colors"
      >
        <Printer className="h-4 w-4 mr-2" /> Print
      </button>
      
      <button 
        onClick={handleDownload} 
        className="flex-1 flex items-center justify-center h-12 rounded-xl text-xs font-black tracking-widest uppercase bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
      >
        <Download className="h-4 w-4 mr-2" /> Download PDF
      </button>
    </div>
  );
}
