"use client";

import { useState, useEffect, use, useRef } from "react";
import { 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Printer, 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Package, 
  Check, 
  Lock, 
  FileText,
  Sparkles,
  QrCode,
  Download,
  Share2,
  Send,
  Loader2,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getClientImplementationById } from "@/lib/actions/client-implementation";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

export default function ImplementationReportPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getClientImplementationById(id);
        setRecord(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load report.");
        router.push("/super-admin/implementations");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Generate & Download PDF file
  const handleDownloadPDF = async () => {
    if (!reportRef.current || !record) return;
    setDownloadingPdf(true);
    const toastId = toast.loading("Compiling official PDF report...");

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const el = reportRef.current;
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
        let y = 0;
        while (y < imgHeight) {
          pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
          y += pageHeight;
          if (y < imgHeight) pdf.addPage();
        }
      }

      const clientClean = (record.clientName || record.business?.name || "Client").replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${record.implementationNumber}_${clientClean}_Completion_Record.pdf`;
      pdf.save(filename);
      toast.success("PDF report downloaded successfully!", { id: toastId });
    } catch (e: any) {
      console.error("PDF generation failed:", e);
      toast.error("Failed to generate PDF: " + (e.message || "Unknown error"), { id: toastId });
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Format WhatsApp number cleanly for Sierra Leone / International
  const getCleanWhatsappNumber = (phoneStr?: string) => {
    if (!phoneStr) return "";
    let cleaned = phoneStr.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "232" + cleaned.substring(1);
    } else if (cleaned.length === 8) {
      cleaned = "232" + cleaned;
    }
    return cleaned;
  };

  // Share via WhatsApp with professional breakdown
  const handleShareWhatsApp = () => {
    if (!record) return;

    const invSummary = record.inventorySummary || {};
    const rawPhone = record.contactWhatsapp || record.contactPhone || "";
    const cleanPhone = getCleanWhatsappNumber(rawPhone);
    const reportUrl = typeof window !== "undefined" ? window.location.href : "";

    const message = 
`🏢 *PROTECH ASSIST ENTERPRISE OS*
📋 *Official Client Registration & Inventory Audit Completion Record*

Dear *${record.clientName || record.business?.name || "Valued Client"}* (${record.ownerName || "Management"}),

Your business registration, inventory catalog setup, and physical stock audit have been officially completed and certified into the Protech Assist Enterprise database!

━━━━━━━━━━━━━━━━━━━━
📌 *Implementation ID:* ${record.implementationNumber}
📅 *Audit Date:* ${format(new Date(), "PPP")}
🏷️ *Business Type:* ${record.businessType || record.business?.type || "Retail / Enterprise"}
📦 *Total Products Registered:* ${invSummary.totalProducts ?? 0} Products (${invSummary.totalCategories ?? 0} Categories)
📊 *Total Stock Units Counted:* ${(invSummary.totalQuantity ?? 0).toLocaleString()} Units
💰 *Total Verified Inventory Valuation:* Le ${(invSummary.totalValuation ?? 0).toLocaleString()}
🛡️ *Audit Status:* Officially Certified & Locked
✍️ *Signatures:* Verified by Lead Auditor (${record.staffSignerName || record.assignedStaffName || "Dr. Strange Admin"}) & Client (${record.clientSignerName || record.ownerName || "Authorized Client Representative"})
━━━━━━━━━━━━━━━━━━━━

🔗 *View & Download Your Official Digital Certificate & Audit Report:*
${reportUrl}

Thank you for choosing Protech Assist Enterprise OS for your automated business management!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp to share completion record...");
  };

  // Copy share link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Official report link copied to clipboard!");
    }
  };

  if (loading || !record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Generating Official Completion Record...</p>
      </div>
    );
  }

  const invSummary = record.inventorySummary || {};
  const checklist = record.verificationChecklist || {};

  const checklistDisplay = [
    { label: "All categories entered into system catalog", key: "allCategoriesEntered" },
    { label: "All products & SKU records registered", key: "allProductsEntered" },
    { label: "All suppliers & vendor contact lines recorded", key: "allSuppliersEntered" },
    { label: "Opening stock quantities recorded", key: "openingStockEntered" },
    { label: "Purchase cost prices verified against records", key: "purchasePricesVerified" },
    { label: "Selling retail/wholesale prices verified", key: "sellingPricesVerified" },
    { label: "Expiry dates logged where applicable", key: "expiryDatesEntered" },
    { label: "Barcode scan mapping verified", key: "barcodeInfoEntered" },
    { label: "Physical stock quantities verified on shelves", key: "stockQuantitiesVerified" },
    { label: "Client reviewed digital database", key: "clientReviewed" },
    { label: "Client approved final inventory audit", key: "clientApproved" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 px-3 sm:px-6 md:px-8 py-4 sm:py-8 text-slate-900 print:bg-white print:p-0 overflow-x-hidden">
      
      {/* ─── ACTION TOOLBAR (Hidden on Print / PDF export) ─── */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Link href={`/super-admin/implementations/${record.id}`}>
          <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl text-xs font-bold gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            <span>Back to Workspace</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* 1. Download PDF Button */}
          <Button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className="h-10 px-4 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/25 gap-2 transition-all cursor-pointer"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Downloading PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </>
            )}
          </Button>

          {/* 2. WhatsApp Share Button */}
          <Button
            onClick={handleShareWhatsApp}
            className="h-10 px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/25 gap-2 transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Share WhatsApp</span>
          </Button>

          {/* 3. Copy Link */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-10 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Copy Report URL"
          >
            <Copy className="h-4 w-4" />
          </Button>

          {/* 4. Print Report */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-10 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Print Paper Copy"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ─── OFFICIAL REPORT DOCUMENT PAGE ─── */}
      <div 
        ref={reportRef}
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-0 print:rounded-none print:max-w-full text-slate-900"
      >
        
        {/* Document Header & Letterhead */}
        <div className="border-b-2 border-slate-900 pb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Image 
                  src="/images/PA.png" 
                  alt="Protech Assist Logo" 
                  width={36} 
                  height={36} 
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div>
                <h2 className="text-base font-black tracking-widest uppercase text-indigo-600">Protech Assist Enterprise OS</h2>
                <p className="text-[10px] font-black tracking-[0.25em] text-slate-500 uppercase">Enterprise Node Implementation &amp; Audit Division</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-xs font-black uppercase tracking-wider">
                {record.implementationNumber}
              </span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                Generated: {format(new Date(), "PPP")}
              </p>
            </div>
          </div>

          <div className="pt-2 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-[1000] uppercase tracking-tight text-slate-950">
              Client Registration &amp; Inventory Completion Record
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Official implementation certification, inventory audit verification, and signed hand-over declaration.
            </p>
          </div>
        </div>

        {/* SECTION I: Client & Business Profile */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Section I — Business &amp; Client Profile
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Business Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{record.clientName || record.business?.name}</p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Owner / Manager</p>
              <p className="font-bold text-slate-900 mt-0.5">{record.ownerName || "N/A"}</p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Business Type</p>
              <p className="font-bold text-slate-900 mt-0.5">{record.businessType || record.business?.type}</p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Primary Phone</p>
              <p className="font-bold text-slate-900 mt-0.5">{record.contactPhone || "N/A"}</p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">WhatsApp Line</p>
              <p className="font-bold text-slate-900 mt-0.5">{record.contactWhatsapp || "N/A"}</p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Email Address</p>
              <p className="font-bold text-slate-900 mt-0.5 truncate">{record.contactEmail || "N/A"}</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Physical Address</p>
              <p className="font-bold text-slate-900 mt-0.5">{record.businessAddress || "N/A"}</p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Location</p>
              <p className="font-bold text-slate-900 mt-0.5">{record.city || "Freetown"}, {record.district || "Western Area"}</p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">License Tier Plan</p>
              <p className="font-bold text-slate-900 mt-0.5">{record.subscriptionPlan || "FREE"}</p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Assigned Lead</p>
              <p className="font-bold text-slate-900 mt-0.5">{record.assignedStaffName || "Implementation Auditor"}</p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Registration Date</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {record.registrationCompletedAt ? format(new Date(record.registrationCompletedAt), "PPP") : format(new Date(record.createdAt), "PPP")}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION II: Verified Inventory & Stock Valuation Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Package className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Section II — Verified Inventory &amp; Stock Valuation Summary
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Total Categories</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{invSummary.totalCategories ?? 0}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Total Products</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{invSummary.totalProducts ?? 0}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Total Suppliers</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{invSummary.totalSuppliers ?? 0}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Stocked Items</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{invSummary.totalStockItems ?? 0}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">With Barcodes</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{invSummary.productsWithBarcodes ?? 0}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">With Expiries</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{invSummary.productsWithExpiryDates ?? 0}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Cost Prices Set</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{invSummary.productsWithPurchasePrices ?? 0}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Selling Prices Set</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{invSummary.productsWithSellingPrices ?? 0}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 sm:col-span-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Total Inventory Quantity</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{(invSummary.totalQuantity ?? 0).toLocaleString()} Units</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-300 bg-indigo-50 sm:col-span-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-indigo-700">Total Verified Valuation</p>
              <p className="text-xl font-black text-indigo-950 mt-0.5">
                Le {(invSummary.totalValuation ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION III: Verification Checklist Audit */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Section III — Verification Checklist Audit
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {checklistDisplay.map((item) => {
              return (
                <div key={item.key} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="h-4 w-4 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-slate-800 font-medium text-[11px] leading-tight">{item.label}</span>
                </div>
              );
            })}
          </div>

          {record.verificationNotes && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Verification Notes</p>
              <p className="font-medium text-slate-800 mt-0.5">{record.verificationNotes}</p>
            </div>
          )}
        </div>

        {/* SECTION IV & V: Dual Digital Signatures */}
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Staff Declaration & Signature Card */}
            <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50 space-y-3">
              <div className="border-b border-slate-200 pb-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Implementation Lead Signature</p>
                <p className="text-[10px] text-slate-600 italic mt-1 leading-snug">
                  &quot;I confirm that the client registration and inventory information recorded in this implementation has been completed and verified to the best of my knowledge.&quot;
                </p>
              </div>

              {/* Signature Graphic */}
              <div className="h-20 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2">
                {record.staffSignature ? (
                  <img src={record.staffSignature} alt="Staff Signature" className="max-h-16 w-auto object-contain" />
                ) : (
                  <p className="text-xs text-slate-400 font-mono italic">No staff signature</p>
                )}
              </div>

              <div className="text-[10px] space-y-0.5 border-t border-slate-200 pt-2">
                <p><strong className="font-black">Name:</strong> {record.staffSignerName || record.assignedStaffName || "Super Admin Field Officer"}</p>
                <p><strong className="font-black">Role:</strong> {record.staffSignerRole || "Lead Implementation Auditor"}</p>
                <p><strong className="font-black">Date:</strong> {record.staffSignedAt ? format(new Date(record.staffSignedAt), "PPP 'at' pp") : "N/A"}</p>
              </div>
            </div>

            {/* Client Confirmation & Signature Card */}
            <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50 space-y-3">
              <div className="border-b border-slate-200 pb-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Client Authorization Signature</p>
                <p className="text-[10px] text-slate-600 italic mt-1 leading-snug">
                  &quot;I confirm that I have reviewed the recorded business and inventory information and approve the information provided.&quot;
                </p>
              </div>

              {/* Signature Graphic */}
              <div className="h-20 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2">
                {record.clientSignature ? (
                  <img src={record.clientSignature} alt="Client Signature" className="max-h-16 w-auto object-contain" />
                ) : (
                  <p className="text-xs text-slate-400 font-mono italic">No client signature</p>
                )}
              </div>

              <div className="text-[10px] space-y-0.5 border-t border-slate-200 pt-2">
                <p><strong className="font-black">Name:</strong> {record.clientSignerName || record.ownerName || "Authorized Client Representative"}</p>
                <p><strong className="font-black">Designation:</strong> {record.clientSignerRole || "Managing Director / Owner"}</p>
                <p><strong className="font-black">Date:</strong> {record.clientSignedAt ? format(new Date(record.clientSignedAt), "PPP 'at' pp") : "N/A"}</p>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION VI: Official Certification Seal & Footer */}
        <div className="border-t-2 border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="font-black uppercase tracking-wider text-slate-900">Officially Certified &amp; Locked Record</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Protech Assist Enterprise OS • Implementation ID: <span className="font-mono font-bold text-slate-800">{record.implementationNumber}</span>
            </p>
          </div>

          <div className="text-center sm:text-right space-y-0.5">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300">
              Status: {record.status}
            </span>
            <p className="text-[9px] text-slate-400">Tamper-proof digital cryptographic audit record</p>
          </div>
        </div>

      </div>

      {/* ─── FOOTER ACTIONS (Print Hidden) ─── */}
      <div className="max-w-4xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 font-medium">
          Ready to send to client? Use the buttons below to export or share.
        </p>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            size="sm"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 cursor-pointer"
          >
            {downloadingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span>Download PDF</span>
          </Button>

          <Button
            onClick={handleShareWhatsApp}
            size="sm"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send to Client via WhatsApp</span>
          </Button>
        </div>
      </div>

    </div>
  );
}
