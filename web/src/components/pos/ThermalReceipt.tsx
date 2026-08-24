import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ReceiptSettingsConfig {
  headerTagline?: string;
  footerMessage?: string;
  returnPolicy?: string;
  showLogo?: boolean;
  showAddress?: boolean;
  showPhone?: boolean;
  showSecondaryPhone?: boolean;
  showWhatsapp?: boolean;
  showEmail?: boolean;
  showCashier?: boolean;
  showCustomer?: boolean;
  showQrCode?: boolean;
  showPoweredBy?: boolean;
  paperWidth?: "58mm" | "80mm";
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
  businessSecondaryPhone?: string;
  businessWhatsappPhone?: string;
  businessEmail?: string;
  logoUrl?: string;
  id?: string;
  receiptSettings?: ReceiptSettingsConfig | null;
}

export const ThermalReceipt = forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ 
    items, 
    total, 
    paid, 
    paymentMethod, 
    cashierName, 
    customerName, 
    transactionId, 
    businessName, 
    businessAddress, 
    businessPhone, 
    businessSecondaryPhone,
    businessWhatsappPhone,
    businessEmail,
    logoUrl,
    id,
    receiptSettings
  }, ref) => {
    const date = new Date().toLocaleString();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : "";

    // Settings defaults
    const showLogo = receiptSettings?.showLogo ?? true;
    const showAddress = receiptSettings?.showAddress ?? true;
    const showPhone = receiptSettings?.showPhone ?? true;
    const showSecondaryPhone = receiptSettings?.showSecondaryPhone ?? true;
    const showWhatsapp = receiptSettings?.showWhatsapp ?? true;
    const showEmail = receiptSettings?.showEmail ?? false;
    const showCashier = receiptSettings?.showCashier ?? true;
    const showCustomer = receiptSettings?.showCustomer ?? true;
    const showQrCode = receiptSettings?.showQrCode ?? true;
    const showPoweredBy = receiptSettings?.showPoweredBy ?? true;
    const headerTagline = receiptSettings?.headerTagline;
    const footerMessage = receiptSettings?.footerMessage || "Thank you for your business!";
    const returnPolicy = receiptSettings?.returnPolicy || "* Returns accepted within 7 days with receipt *";
    const paperWidthClass = receiptSettings?.paperWidth === "58mm" ? "w-[58mm] print:w-[58mm]" : "w-[80mm] print:w-[80mm]";

    // Build phones list
    const phones: string[] = [];
    if (showPhone && businessPhone) phones.push(businessPhone);
    if (showSecondaryPhone && businessSecondaryPhone) phones.push(businessSecondaryPhone);

    return (
      <div ref={ref} className={`bg-white text-black p-4 ${paperWidthClass} mx-auto font-mono text-[12px] leading-tight flex flex-col print:m-0 print:p-2 print:shadow-none`}>
        {/* Header */}
        <div className="text-center space-y-1 mb-4">
          {showLogo && logoUrl && (
            <div className="flex justify-center mb-2">
              <img src={logoUrl} alt="Logo" className="h-12 w-12 object-contain rounded-full border border-black/20" />
            </div>
          )}
          <h2 className="text-lg font-bold uppercase">{businessName || "Enterprise OS"}</h2>
          {headerTagline && (
            <p className="text-[10px] italic font-semibold">{headerTagline}</p>
          )}
          {showAddress && (
            <p className="text-[10px]">{businessAddress || "123 Enterprise Way, Freetown"}</p>
          )}
          {phones.length > 0 && (
            <p className="text-[10px]">Tel: {phones.join(" / ")}</p>
          )}
          {showWhatsapp && businessWhatsappPhone && (
            <p className="text-[10px]">WhatsApp: {businessWhatsappPhone}</p>
          )}
          {showEmail && businessEmail && (
            <p className="text-[10px]">Email: {businessEmail}</p>
          )}
        </div>

        {/* Meta Info */}
        <div className="text-[10px] space-y-0.5 border-b border-black border-dashed pb-2 mb-2">
          <p>Date: {date}</p>
          <p>Receipt #: {transactionId || Math.floor(Math.random() * 100000000)}</p>
          {showCashier && cashierName && <p>Cashier: {cashierName}</p>}
          {showCustomer && customerName && customerName !== "WALKIN" && <p>Customer: {customerName}</p>}
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
          {showQrCode && id && baseUrl && (
            <div className="flex flex-col items-center my-3 pb-3 border-b border-black border-dashed">
               <p className="font-bold mb-2 text-[8px] text-black uppercase">Scan for Digital Receipt</p>
               <QRCodeSVG value={`${baseUrl}/receipt/${id}`} size={90} level="M" fgColor="#000000" bgColor="#FFFFFF" />
            </div>
          )}
          {footerMessage && <p className="font-medium">{footerMessage}</p>}
          {returnPolicy && <p className="mt-1 text-[8px] italic">{returnPolicy}</p>}
          {showPoweredBy && <p className="text-[8px] text-black/60 pt-1">Powered by Enterprise OS</p>}
        </div>
      </div>
    );
  }
);

ThermalReceipt.displayName = 'ThermalReceipt';
