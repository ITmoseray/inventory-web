"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  User, Phone, MapPin, Calendar, Clock, Stethoscope, 
  FlaskConical, FileText, Receipt, CheckCircle2, Trash2, 
  Plus, X, CreditCard, ShieldAlert, Sparkles, Printer, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createPatientBill, payPatientBill, deletePatientBill } from "@/app/actions/patient-billing";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface PatientProfileClientProps {
  patient: any;
}

export default function PatientProfileClient({ patient }: PatientProfileClientProps) {
  const [sales, setSales] = useState<any[]>(patient.sales || []);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  
  // New Bill Form State
  const [billDesc, setBillDesc] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const mrn = `EHR-${patient.id.substring(0, 6).toUpperCase()}-SK`;

  // Calculations
  const totalBilled = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
  const outstandingBalance = sales
    .filter(s => s.paymentStatus !== "PAID")
    .reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

  // Actions
  async function handleAddBill(e: React.FormEvent) {
    e.preventDefault();
    if (!billDesc || !billAmount) return toast.error("Please fill in all fields.");
    const parsedAmount = parseFloat(billAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return toast.error("Please enter a valid amount.");

    try {
      setSubmitting(true);
      const res = await createPatientBill(patient.id, billDesc, parsedAmount);
      if (res.success && res.data) {
        setSales([res.data, ...sales]);
        setIsAddBillOpen(false);
        setBillDesc("");
        setBillAmount("");
        toast.success("Bill generated successfully.");
      } else {
        toast.error(res.error || "Failed to create patient bill.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePayBill(saleId: string) {
    try {
      setSubmitting(true);
      const res = await payPatientBill(saleId, patient.id);
      if (res.success && res.data) {
        setSales(sales.map(s => s.id === saleId ? res.data : s));
        setIsPayDialogOpen(false);
        setSelectedSale(null);
        toast.success("Payment recorded successfully.");
      } else {
        toast.error(res.error || "Failed to process payment.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBill(saleId: string) {
    if (!confirm("Are you sure you want to delete this billing record? This action cannot be undone.")) return;

    try {
      const res = await deletePatientBill(saleId, patient.id);
      if (res.success) {
        setSales(sales.filter(s => s.id !== saleId));
        toast.success("Billing record deleted successfully.");
      } else {
        toast.error(res.error || "Failed to delete billing record.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  }

  // PDF Generator for Statement
  async function handleDownloadStatement() {
    try {
      const doc = new jsPDF();
      
      // Load and add Logo asynchronously
      try {
        const logoBase64 = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = "/images/logo.jpeg";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg"));
            } else {
              reject(new Error("Canvas context failed"));
            }
          };
          img.onerror = () => reject(new Error("Failed to load logo"));
        });
        doc.addImage(logoBase64, "JPEG", 14, 12, 16, 16);
      } catch (err) {
        console.warn("Clinic logo failed to render in PDF", err);
      }
      
      // Title & Branding
      doc.setFontSize(22);
      doc.setTextColor(20, 184, 166); // Teal
      doc.text("CLINIC BILLING STATEMENT", 34, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated At: ${format(new Date(), "dd-MMM-yyyy hh:mm a")}`, 34, 28);
      
      // Horizontal Rule
      doc.setDrawColor(230);
      doc.line(14, 34, 196, 34);

      // Patient Information Block
      doc.setFontSize(12);
      doc.setTextColor(50);
      doc.text("PATIENT INFORMATION", 14, 42);
      
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`Name: ${patient.name}`, 14, 48);
      doc.text(`MRN: ${mrn}`, 14, 54);
      doc.text(`Gender: ${patient.gender || "Not specified"}`, 14, 60);
      doc.text(`Phone: ${patient.phone || "Not specified"}`, 14, 66);
      doc.text(`Outstanding Balance: Le ${outstandingBalance.toLocaleString()}`, 130, 48);
      doc.text(`Total Billed: Le ${totalBilled.toLocaleString()}`, 130, 54);

      // Table mapping
      const tableRows = sales.map((sale) => [
        format(new Date(sale.createdAt), "dd-MMM-yyyy"),
        "Clinical Services / Fee",
        sale.invoiceNumber,
        `Le ${Number(sale.totalAmount).toLocaleString()}`,
        sale.paymentStatus,
      ]);

      autoTable(doc, {
        startY: 74,
        head: [["Date", "Description", "Invoice #", "Amount", "Status"]],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [20, 184, 166] }, // Teal header
        styles: { fontSize: 9 },
      });

      doc.save(`Statement_${patient.name.replace(/\s+/g, "_")}.pdf`);
      toast.success("Statement downloaded successfully.");
    } catch (e) {
      toast.error("Failed to generate PDF statement.");
    }
  }

  // PDF Generator for Single Invoice
  async function handleDownloadInvoice(sale: any) {
    try {
      const doc = new jsPDF();

      // Load and add Logo asynchronously
      try {
        const logoBase64 = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = "/images/logo.jpeg";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg"));
            } else {
              reject(new Error("Canvas context failed"));
            }
          };
          img.onerror = () => reject(new Error("Failed to load logo"));
        });
        doc.addImage(logoBase64, "JPEG", 14, 12, 16, 16);
      } catch (err) {
        console.warn("Clinic logo failed to render in PDF", err);
      }

      // Invoice Header
      doc.setFontSize(22);
      doc.setTextColor(59, 130, 246); // Blue
      doc.text("INVOICE", 34, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Invoice #: ${sale.invoiceNumber}`, 34, 28);
      doc.text(`Date Issued: ${format(new Date(sale.createdAt), "dd-MMM-yyyy hh:mm a")}`, 34, 34);

      // Rule
      doc.setDrawColor(230);
      doc.line(14, 38, 196, 38);

      // Patient Details
      doc.setFontSize(12);
      doc.setTextColor(50);
      doc.text("BILLED TO:", 14, 46);

      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`Patient Name: ${patient.name}`, 14, 52);
      doc.text(`MRN: ${mrn}`, 14, 58);
      doc.text(`Contact: ${patient.phone || "N/A"}`, 14, 64);

      // Billing details
      autoTable(doc, {
        startY: 72,
        head: [["Item Description", "Qty", "Unit Price", "Total Amount"]],
        body: [
          ["Medical & Consultation Services", "1", `Le ${Number(sale.totalAmount).toLocaleString()}`, `Le ${Number(sale.totalAmount).toLocaleString()}`]
        ],
        theme: "plain",
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
      });

      // Total & Status block
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setTextColor(50);
      doc.text(`Payment Status: ${sale.paymentStatus}`, 14, finalY);
      doc.text(`Total Billed: Le ${Number(sale.totalAmount).toLocaleString()}`, 130, finalY);

      doc.save(`Invoice_${sale.invoiceNumber}.pdf`);
      toast.success(`Invoice ${sale.invoiceNumber} downloaded.`);
    } catch (e) {
      toast.error("Failed to generate invoice PDF.");
    }
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto text-slate-900 dark:text-white p-2 sm:p-6 min-h-[80vh]">
      {/* Top Profile Header */}
      <div className="flex items-center gap-6 pb-6 border-b border-border">
         <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-brand-500 overflow-hidden relative shadow-[0_0_25px_-5px_#14b8a6] shrink-0 bg-muted">
             <img src={`https://ui-avatars.com/api/?name=${patient.name}&background=14b8a6&color=fff&size=256`} alt={patient.name} className="object-cover w-full h-full opacity-90" />
         </div>
         <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Patient Profile</p>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">{patient.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground font-mono">MRN: {mrn}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column (Demographics & Medical History) */}
        <div className="xl:col-span-4 space-y-6">
           
           {/* Demographics */}
           <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl overflow-hidden relative shadow-lg">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-blue-500 opacity-80"></div>
             <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-brand-400/50 to-transparent opacity-80"></div>
             <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-blue-500/50 to-transparent opacity-80"></div>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400/20 to-blue-500/20 opacity-80"></div>

             <div className="p-6 relative z-10">
               <h2 className="text-2xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">Demographics</h2>
               
               <div className="space-y-4 text-sm sm:text-base">
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Name</span>
                   <span className="col-span-2 font-medium text-slate-900 dark:text-white">{patient.name}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">DOB</span>
                   <span className="col-span-2 font-medium text-slate-900 dark:text-white">{patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "dd-MMM-yyyy") : "Not specified"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Gender</span>
                   <span className="col-span-2 font-medium text-slate-900 dark:text-white">{patient.gender || "Not specified"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Nationality</span>
                   <span className="col-span-2 font-medium text-slate-900 dark:text-white">{patient.nationality || "Not specified"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Address</span>
                   <span className="col-span-2 font-medium text-slate-900 dark:text-white">{patient.address || "Not specified"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Contact</span>
                   <span className="col-span-2 font-medium text-slate-900 dark:text-white flex flex-col">
                     <span>{patient.phone || "Not specified"}</span>
                     {patient.email && <span className="text-sm text-muted-foreground">{patient.email}</span>}
                   </span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 border-t border-border pt-4 mt-2">
                   <span className="text-muted-foreground font-medium">Emergency Contact</span>
                   <span className="col-span-2 font-medium text-slate-900 dark:text-white">{patient.emergencyContact || "Not specified"}</span>
                 </div>
               </div>
             </div>
           </div>

           {/* Medical History */}
           <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-muted to-muted-foreground/30 opacity-50"></div>
             
              <h2 className="text-2xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">Medical History</h2>
              
              <div className="space-y-4 text-sm sm:text-base">
                 <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-4">
                   <span className="text-muted-foreground font-medium">Allergy</span>
                   <span className="col-span-2 font-medium text-foreground">{patient.allergies || "None noted"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-4">
                   <span className="text-muted-foreground font-medium">Conditions</span>
                   <span className="col-span-2 font-medium text-foreground whitespace-pre-line">{patient.conditions || "None noted"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-4">
                   <span className="text-muted-foreground font-medium">Past Procedures</span>
                   <span className="col-span-2 font-medium text-foreground whitespace-pre-line">{patient.pastProcedures || "None noted"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-4">
                   <span className="text-muted-foreground font-medium">Current Medications</span>
                   <span className="col-span-2 font-medium text-foreground whitespace-pre-line">{patient.currentMedications || "None noted"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Immunizations</span>
                   <span className="col-span-2 font-medium text-foreground">{patient.immunizations || "Not specified"}</span>
                 </div>
              </div>
           </div>

        </div>

        {/* Right Column (Billing Ledger) */}
        <div className="xl:col-span-8">
           <div className="rounded-[2rem] border border-border bg-card/60 backdrop-blur-xl shadow-lg flex flex-col h-full overflow-hidden">
             
             <div className="p-6 sm:p-8 border-b border-border bg-muted/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Billing & Payments Ledger</h2>
                  <div className="flex gap-3 shrink-0">
                    <Button 
                      onClick={() => setIsAddBillOpen(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-[0_0_15px_-3px_#3b82f6] h-10 px-5 text-sm font-bold transition-all"
                    >
                      New Payment
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadStatement}
                      className="rounded-xl border-border bg-card/50 h-10 px-5 text-sm font-bold hover:bg-muted transition-all"
                    >
                      View Full Ledger
                    </Button>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground">Current Balance: <span className="font-bold text-slate-900 dark:text-white">Le {outstandingBalance.toLocaleString()}</span></p>
             </div>

             <div className="flex-1 overflow-x-auto p-6 sm:p-8 pt-4">
                <table className="w-full text-sm sm:text-base text-left">
                  <thead className="text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-4 font-medium px-2">Date</th>
                      <th className="py-4 font-medium px-2">Description</th>
                      <th className="py-4 font-medium px-2">Invoice #</th>
                      <th className="py-4 font-medium px-2 text-right">Amount</th>
                      <th className="py-4 font-medium px-2 text-center">Status</th>
                      <th className="py-4 font-medium px-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-slate-900 dark:text-white">
                    {sales.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground font-medium">No billing records found for this patient.</td>
                      </tr>
                    ) : (
                      sales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="py-4 px-2 whitespace-nowrap text-muted-foreground">{format(new Date(sale.createdAt), "dd-MMM-yyyy")}</td>
                          <td className="py-4 px-2 truncate max-w-[200px] font-medium">Clinical Services</td>
                          <td className="py-4 px-2 font-mono text-muted-foreground">{sale.invoiceNumber}</td>
                          <td className="py-4 px-2 font-medium text-right">Le {Number(sale.totalAmount).toLocaleString()}</td>
                          <td className="py-4 px-2 text-center">
                            {sale.paymentStatus === 'PAID' ? (
                               <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-black border border-emerald-500/20 uppercase tracking-wider">Paid</span>
                            ) : sale.paymentStatus === 'PENDING' ? (
                               <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-black border border-amber-500/20 uppercase tracking-wider">Pending</span>
                            ) : (
                               <span className="bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full text-xs font-black border border-brand-500/20 uppercase tracking-wider">{sale.paymentStatus}</span>
                            )}
                          </td>
                          <td className="py-4 px-2 text-right">
                             <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                               {sale.paymentStatus !== "PAID" && (
                                 <button 
                                   onClick={() => { setSelectedSale(sale); setIsPayDialogOpen(true); }}
                                   title="Pay invoice" 
                                   className="text-emerald-500 hover:text-emerald-600 p-2 rounded-lg hover:bg-emerald-500/10"
                                 >
                                   <CheckCircle2 className="h-4 w-4" />
                                 </button>
                               )}
                               <button 
                                 onClick={() => handleDownloadInvoice(sale)}
                                 title="Download Invoice" 
                                 className="text-blue-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-500/10"
                               >
                                 <Download className="h-4 w-4" />
                               </button>
                               <button 
                                 onClick={() => handleDeleteBill(sale.id)}
                                 title="Delete invoice" 
                                 className="text-muted-foreground/50 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border font-bold">
                      <td colSpan={3} className="py-6 px-2 text-foreground text-base">Total Bill</td>
                      <td className="py-6 px-2 text-right text-foreground text-base">Le {totalBilled.toLocaleString()}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
             </div>

             <div className="p-6 border-t border-border bg-muted/20 flex flex-wrap items-center justify-end gap-6 text-sm font-medium text-muted-foreground">
               <button 
                 onClick={() => {
                   if (sales.length > 0) {
                     handleDownloadInvoice(sales[0]);
                   } else {
                     toast.info("No invoice records to download.");
                   }
                 }}
                 className="hover:text-foreground transition-colors flex items-center gap-2"
               >
                 <FileText className="h-4 w-4"/> View invoice
               </button>
               <button 
                 onClick={() => {
                   const pending = sales.find(s => s.paymentStatus !== "PAID");
                   if (pending) {
                     setSelectedSale(pending);
                     setIsPayDialogOpen(true);
                   } else {
                     toast.info("No pending balance to pay.");
                   }
                 }}
                 className="hover:text-foreground transition-colors flex items-center gap-2"
               >
                 <CheckCircle2 className="h-4 w-4"/> Pay Now
               </button>
               <button 
                 onClick={handleDownloadStatement}
                 className="hover:text-foreground transition-colors flex items-center gap-2"
               >
                 <Receipt className="h-4 w-4"/> Download Statement
               </button>
             </div>

           </div>
        </div>

      </div>

      {/* Pay Invoice Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className="sm:max-w-md border-slate-100 bg-white dark:bg-slate-900 rounded-[2rem] text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-[1000] tracking-tight uppercase text-slate-900 dark:text-white">Collect Payment</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Process payment for invoice {selectedSale?.invoiceNumber}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-muted/30 dark:bg-slate-950/30 rounded-2xl border border-border">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Amount Due</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">Le {Number(selectedSale?.totalAmount || 0).toLocaleString()}</p>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsPayDialogOpen(false)} className="rounded-xl h-11 text-xs">Cancel</Button>
              <Button onClick={() => handlePayBill(selectedSale.id)} disabled={submitting} className="rounded-xl h-11 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-6 font-bold">
                {submitting ? "Processing..." : "Confirm Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate New Bill Dialog */}
      <Dialog open={isAddBillOpen} onOpenChange={setIsAddBillOpen}>
        <DialogContent className="sm:max-w-md border-slate-100 bg-white dark:bg-slate-900 rounded-[2rem] text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-[1000] tracking-tight uppercase text-slate-900 dark:text-white">Generate Medical Bill</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Record a new medical consultation or procedure fee for this patient profile.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBill} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="desc" className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Fee Description</Label>
              <Input 
                id="desc" 
                required 
                value={billDesc} 
                onChange={e => setBillDesc(e.target.value)} 
                placeholder="e.g. Dental cleaning / General consultation" 
                className="rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white" 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount" className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Fee Amount (Le)</Label>
              <Input 
                id="amount" 
                required 
                type="number"
                min="0"
                step="0.01"
                value={billAmount} 
                onChange={e => setBillAmount(e.target.value)} 
                placeholder="e.g. 250" 
                className="rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white" 
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsAddBillOpen(false)} className="rounded-xl h-11 text-xs">Cancel</Button>
              <Button type="submit" disabled={submitting} className="rounded-xl h-11 bg-blue-500 hover:bg-blue-600 text-white text-xs px-6 font-bold">
                {submitting ? "Generating..." : "Generate Bill"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
