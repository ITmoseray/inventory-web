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
    const paperWidthClass = receiptSettings?.paperWidth === "58mm" 
      ? "w-full max-w-[220px] sm:max-w-[240px] print:w-[58mm]" 
      : "w-full max-w-[280px] sm:max-w-[320px] print:w-[80mm]";

    // Build phones list
    const phones: string[] = [];
    if (showPhone && businessPhone) phones.push(businessPhone);
    if (showSecondaryPhone && businessSecondaryPhone) phones.push(businessSecondaryPhone);

    return (
      <div 
        ref={ref} 
        className={`bg-white text-black p-3 sm:p-4 pb-5 ${paperWidthClass} mx-auto font-mono text-[10.5px] sm:text-[11.5px] leading-tight flex flex-col print:m-0 print:p-2 print:shadow-none box-border w-full`}
      >
        {/* Header */}
        <div className="text-center space-y-1 mb-3">
          {showLogo && logoUrl && (
            <div className="flex justify-center mb-2">
              <img src={logoUrl} alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full border border-black/20" />
            </div>
          )}
          <h2 className="text-sm sm:text-base font-bold uppercase break-words px-1">{businessName || "Enterprise OS"}</h2>
          {headerTagline && (
            <p className="text-[9.5px] italic font-semibold break-words px-1">{headerTagline}</p>
          )}
          {showAddress && (
            <p className="text-[9.5px] break-words px-1">{businessAddress || "123 Enterprise Way, Freetown"}</p>
          )}
          {phones.length > 0 && (
            <p className="text-[9.5px] break-words px-1">Tel: {phones.join(" / ")}</p>
          )}
          {showWhatsapp && businessWhatsappPhone && (
            <p className="text-[9.5px] break-words px-1">WhatsApp: {businessWhatsappPhone}</p>
          )}
          {showEmail && businessEmail && (
            <p className="text-[9.5px] break-words px-1">Email: {businessEmail}</p>
          )}
        </div>

        {/* Meta Info */}
        <div className="text-[9.5px] space-y-0.5 border-b border-black border-dashed pb-2 mb-2">
          <p>Date: {date}</p>
          <p className="break-all">Receipt #: {transactionId || Math.floor(Math.random() * 100000000)}</p>
          {showCashier && cashierName && <p className="truncate">Cashier: {cashierName}</p>}
          {showCustomer && customerName && customerName !== "WALKIN" && <p className="break-words">Customer: {customerName}</p>}
        </div>

        {/* Line Items */}
        <div className="flex-1 w-full mb-2 border-b border-black border-dashed pb-2">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="border-b border-black text-[9.5px]">
                <th className="font-bold py-1 w-[46%]">Item</th>
                <th className="font-bold py-1 text-center w-[18%]">Qty</th>
                <th className="font-bold py-1 text-right w-[36%]">Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="align-top text-[9.5px]">
                  <td className="py-1 break-words pr-1">{item.name}</td>
                  <td className="py-1 text-center whitespace-nowrap">x{item.quantity}</td>
                  <td className="py-1 text-right whitespace-nowrap">{Math.round(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-1 text-right border-b border-black border-dashed pb-2 mb-2">
          <div className="flex justify-between font-bold text-xs sm:text-sm">
            <span>TOTAL:</span>
            <span>Le {Math.round(total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[9.5px]">
            <span>PAID ({paymentMethod}):</span>
            <span>Le {Math.round(paid).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[9.5px]">
            <span>CHANGE:</span>
            <span>Le {Math.max(0, Math.round(paid - total)).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[9.5px] mt-3 space-y-1 pb-1">
          {showQrCode && id && baseUrl && (
            <div className="flex flex-col items-center my-2 pb-2 border-b border-black border-dashed">
               <p className="font-bold mb-1 text-[7.5px] text-black uppercase">Scan for Digital Receipt</p>
               <QRCodeSVG value={`${baseUrl}/receipt/${id}`} size={75} level="M" fgColor="#000000" bgColor="#FFFFFF" />
            </div>
          )}
          {footerMessage && <p className="font-medium break-words px-1 leading-snug">{footerMessage}</p>}
          {returnPolicy && <p className="mt-1 text-[7.5px] italic break-words px-1 leading-tight">{returnPolicy}</p>}
          {showPoweredBy && (
            <div className="pt-2 pb-0.5">
              <p className="text-[8.5px] font-bold text-black/75 uppercase tracking-normal block text-center break-words px-1">
                Powered by Enterprise OS
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ThermalReceipt.displayName = 'ThermalReceipt';
