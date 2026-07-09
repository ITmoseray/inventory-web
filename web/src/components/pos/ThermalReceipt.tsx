import React, { forwardRef, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ThermalReceiptProps {
  items: ReceiptItem[];
  total: number;
  paid: number;
  paymentMethod: string;
  cashierName?: string;
  customerName?: string;
  transactionId?: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  id?: string;
}

export const ThermalReceipt = forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ items, total, paid, paymentMethod, cashierName, customerName, transactionId, businessName, businessAddress, businessPhone, id }, ref) => {
    const date = new Date().toLocaleString();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : "";

    return (
      <div ref={ref} className="bg-white text-black p-4 w-[80mm] mx-auto font-mono text-[12px] leading-tight flex flex-col print:m-0 print:p-2 print:shadow-none print:w-[80mm]">
        {/* Header */}
        <div className="text-center space-y-1 mb-4">
          <h2 className="text-lg font-bold uppercase">{businessName || "Protech Assist SL Limited"}</h2>
          <p className="text-[10px]">{businessAddress || "123 Enterprise Way, Freetown"}</p>
          <p className="text-[10px]">Tel: {businessPhone || "+232 00 000 000"}</p>
        </div>

        {/* Meta Info */}
        <div className="text-[10px] space-y-0.5 border-b border-black border-dashed pb-2 mb-2">
          <p>Date: {date}</p>
          <p>Receipt #: {transactionId || Math.floor(Math.random() * 100000000)}</p>
          {cashierName && <p>Cashier: {cashierName}</p>}
          {customerName && customerName !== "WALKIN" && <p>Customer: {customerName}</p>}
        </div>

        {/* Line Items */}
        <div className="flex-1 w-full mb-2 border-b border-black border-dashed pb-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black">
                <th className="font-bold py-1 w-1/2">Item</th>
                <th className="font-bold py-1 text-center w-1/4">Qty</th>
                <th className="font-bold py-1 text-right w-1/4">Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="align-top">
                  <td className="py-1 break-words pr-2">{item.name}</td>
                  <td className="py-1 text-center">x{item.quantity}</td>
                  <td className="py-1 text-right">{Math.round(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-1 text-right border-b border-black border-dashed pb-2 mb-2">
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL:</span>
            <span>Le {Math.round(total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>PAID ({paymentMethod}):</span>
            <span>Le {Math.round(paid).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>CHANGE:</span>
            <span>Le {Math.max(0, Math.round(paid - total)).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] mt-4 space-y-1">
          {id && baseUrl && (
            <div className="flex flex-col items-center my-3 pb-3 border-b border-black border-dashed">
               <p className="font-bold mb-2 text-[8px] text-black">SCAN FOR DIGITAL RECEIPT</p>
               <QRCodeSVG value={`${baseUrl}/receipt/${id}`} size={100} level="H" fgColor="#000000" bgColor="#FFFFFF" />
            </div>
          )}
          <p>Thank you for your business!</p>
          <p>Powered by Protech Assist SL Limited</p>
          <p className="mt-2 text-[8px]">* Returns accepted within 7 days with receipt *</p>
        </div>
      </div>
    );
  }
);

ThermalReceipt.displayName = 'ThermalReceipt';
