"use client";

import { 
  Book, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Truck, 
  Wallet, 
  UserCheck, 
  Plus, 
  Search, 
  Printer, 
  LayoutDashboard,
  CheckCircle2,
  ChevronRight,
  Info,
  Activity,
  History,
  CreditCard,
  Building2,
  Box,
  FileText,
  Bell,
  Clock,
  Zap,
  Globe,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function UserManualPage() {
  const sections = [
    {
      title: "1. Intelligence Hub",
      icon: LayoutDashboard,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      content: [
        "Overview: Your central mission control. View real-time revenue, order volume, and critical system alerts.",
        "Partner Directory: A sophisticated ERP directory for both Customers and Suppliers. Track 'Reliability Scores' and lifetime trade volume per entity.",
        "Analytics: Deep-dive into sales velocity, product performance, and growth trends using visual charts.",
        "Reports: Generate official business documents, including tax summaries, inventory valuations, and audit-ready spreadsheets."
      ]
    },
    {
      title: "2. Inventory Management",
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      content: [
        "Products: The heart of your stock. Manage SKU details, pricing, and minimum stock alerts to prevent outages.",
        "Network Exchange: Advanced module for multi-location stock transfers or cross-business inventory sourcing.",
        "Categories & Batches: Organize items by type and track specific shipment batches (crucial for expiry tracking).",
        "Stock History & Expiry: Complete audit trail of every unit movement and a proactive warning system for items nearing expiration."
      ]
    },
    {
      title: "3. Supply Chain (Purchases)",
      icon: Truck,
      color: "text-amber-600",
      bg: "bg-amber-50",
      content: [
        "Suppliers: Manage your wholesale relationships, contact info, and specialized trade terms.",
        "Purchase Orders (PO): Professional workflow for ordering new stock. Track from 'Draft' to 'Received'.",
        "Purchase Returns: Streamlined process for returning damaged or incorrect stock to suppliers while updating your ledger."
      ]
    },
    {
      title: "4. Commerce (Sales & POS)",
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
      content: [
        "Point of Sale (POS): High-speed interface for daily transactions. Supports barcode scanning and quick-search.",
        "Sales Orders: Managed workflow for complex orders, custom fulfillment states, and high-fidelity receipt printing.",
        "Credit Sales: Specialized module for 'Sell Now, Pay Later' transactions. Automatically links to the Debt Management system.",
        "Sales Returns: Handle customer returns with automatic restock logic and credit note generation."
      ]
    },
    {
      title: "5. Relationships & CRM",
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
      content: [
        "Customer Registry: Build detailed profiles for your clients. Track preferences, contact nodes, and transaction history.",
        "Loyalty Program: Reward frequent buyers with points or specialized discounts managed automatically by the POS.",
        "Purchase Profiles: Advanced behavioral analysis showing what your customers buy most frequently."
      ]
    },
    {
      title: "6. Finance & Accounting",
      icon: Wallet,
      color: "text-rose-600",
      bg: "bg-rose-50",
      content: [
        "Expense Tracking: Record rent, utilities, and daily overheads. Categorize expenses for accurate tax reporting.",
        "Profit & Loss (P&L): Automated real-time financial statement showing your net income after all costs (COGS + Expenses).",
        "Cash Flow: Visualization of liquidity moving through your business ecosystem.",
        "Billing: Manage your own platform subscription and official invoices from Protech Ecosystem."
      ]
    },
    {
      title: "7. Administrative & HR",
      icon: UserCheck,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      content: [
        "Employee Management: Create staff accounts with role-based access control (RBAC).",
        "Attendance Node: Digital clock-in/out system for monitoring staff shift performance.",
        "Payroll Engine: Generate automated payslips based on attendance, bonuses, and tax deductions.",
        "Audit Logs: A permanent, unchangeable record of every sensitive action taken within the system."
      ]
    },
    {
      title: "8. System Configuration",
      icon: Settings,
      color: "text-slate-600",
      bg: "bg-slate-50",
      content: [
        "Business Profile: Update your shop name, logo, address, and contact info for dynamic receipt branding.",
        "Notifications: Configure real-time alerts for low stock, expiring items, or high-value transactions.",
        "Global Settings: Adjust currency (Le/NLe), timezones, and industry-specific module toggles."
      ]
    }
  ];

  const handleDownloadPDF = async () => {
    toast.info("Analyzing next-gen CSS & Generating PDF... Please wait.");
    try {
      // @ts-ignore
      const domtoimage = (await import('dom-to-image-more')).default;
      const { jsPDF } = await import('jspdf');
      
      const element = document.getElementById('manual-content');
      if (!element) return;
      
      // Use dom-to-image to perfectly capture modern CSS (oklab, color-mix, etc.) via SVG rendering
      const dataUrl = await domtoimage.toPng(element, { 
        quality: 0.95,
        bgcolor: '#ffffff',
        scale: 2 // Higher resolution
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = pdfHeight;
      let position = 0;

      // Add first page
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if the content is longer than one A4 page
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight; // Shift the image up
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('Protech_System_Manual.pdf');
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div id="manual-content" className="min-h-full p-6 md:p-10 space-y-10 bg-slate-50/30 selection:bg-indigo-600/10 selection:text-indigo-600">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm w-fit">
              <Book className="h-4 w-4 text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Enterprise Documentation</span>
           </div>
           <div className="space-y-1">
              <h1 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase italic text-slate-950 dark:text-white leading-none">System <span className="text-indigo-600">Manual</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em] italic mt-2">Mastering your inventory & trade ecosystem</p>
           </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <Button 
              onClick={() => window.print()}
              variant="outline"
              className="h-16 px-10 rounded-[2rem] border-slate-200 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 gap-3"
           >
              <Printer className="h-4 w-4" /> Print Manual
           </Button>
           <Button 
              onClick={handleDownloadPDF}
              className="h-16 px-10 rounded-[2rem] bg-slate-950 dark:bg-indigo-600 text-white font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-[1.05] transition-all active:scale-95 gap-3"
           >
              <Download className="h-4 w-4" /> Download PDF
           </Button>
        </div>
      </div>

      {/* Intro Card */}
      <Card className="rounded-[3rem] border-none bg-indigo-600 p-12 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
         <div className="relative z-10 space-y-6 max-w-3xl">
            <h2 className="text-3xl font-[1000] uppercase italic tracking-tight">Welcome to the <span className="text-indigo-200">Knowledge Base</span></h2>
            <p className="text-lg font-medium text-indigo-50 leading-relaxed italic">
               This manual is designed to turn you into a power user of the African Trade Operating System. Every module is integrated into a unified "Intelligence Stream" that manages your stock, sales, and staff autonomously.
            </p>
         </div>
      </Card>

      {/* Manual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {sections.map((section, idx) => (
           <motion.div 
             key={section.title}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: idx * 0.05 }}
           >
              <Card className="h-full rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white overflow-hidden group">
                 <CardHeader className="p-10 pb-6 flex flex-row items-center gap-8">
                    <div className={`h-20 w-20 rounded-3xl ${section.bg} ${section.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner`}>
                       <section.icon size={40} />
                    </div>
                    <div>
                       <CardTitle className="text-2xl font-[1000] text-slate-950 dark:text-white uppercase italic tracking-tight leading-none mb-2">{section.title}</CardTitle>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Integrated Intelligence Node</p>
                    </div>
                 </CardHeader>
                 <CardContent className="p-10 pt-4">
                    <div className="space-y-6">
                       {section.content.map((item, i) => {
                         const [heading, description] = item.split(": ");
                         return (
                           <div key={i} className="flex items-start gap-6 group/item">
                              <div className="mt-2 h-2 w-2 rounded-full bg-indigo-200 group-hover/item:bg-indigo-600 transition-colors shrink-0" />
                              <div>
                                 <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-1">{heading}</p>
                                 <p className="text-sm font-medium text-slate-500 leading-relaxed">{description}</p>
                              </div>
                           </div>
                         );
                       })}
                    </div>
                 </CardContent>
              </Card>
           </motion.div>
         ))}
      </div>

      {/* Pro Tips Section */}
      <Card className="rounded-[4rem] border-none bg-slate-950 p-16 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
         <div className="relative z-10 grid grid-cols-1 xl:grid-cols-3 gap-16 items-center">
            <div className="xl:col-span-2 space-y-10">
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <Zap className="h-10 w-10 text-indigo-400 animate-pulse" />
                     <h3 className="text-4xl font-[1000] uppercase italic tracking-tighter">Workflow <span className="text-indigo-500">Accelerators</span></h3>
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] italic">Tips for high-frequency operations</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4 hover:bg-white/10 transition-colors">
                     <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Globe size={20} /></div>
                     <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400 italic">Sidebar Intelligence</p>
                     <p className="text-sm font-medium text-slate-300 leading-relaxed">Don't waste clicks. Hover over the sidebar to expand it instantly. It automatically collapses to save your screen space for data.</p>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4 hover:bg-white/10 transition-colors">
                     <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Search size={20} /></div>
                     <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400 italic">Deep Data Query</p>
                     <p className="text-sm font-medium text-slate-300 leading-relaxed">Every list uses 'Neural Search'. Type partial names, SKU IDs, or even dates to find any node across your entire registry.</p>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4 hover:bg-white/10 transition-colors">
                     <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400"><Printer size={20} /></div>
                     <p className="text-[11px] font-black uppercase tracking-widest text-amber-400 italic">Receipt Branding</p>
                     <p className="text-sm font-medium text-slate-300 leading-relaxed">Ensure your Business Profile is complete in Settings. The system dynamically brands every invoice with your logo and node coordinates.</p>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4 hover:bg-white/10 transition-colors">
                     <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400"><ShieldCheck size={20} /></div>
                     <p className="text-[11px] font-black uppercase tracking-widest text-rose-400 italic">Audit Safety</p>
                     <p className="text-sm font-medium text-slate-300 leading-relaxed">Use the 'Audit Logs' in the System module to verify which staff member performed specific actions, ensuring 100% accountability.</p>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col items-center gap-8 p-12 bg-white/5 rounded-[3rem] border border-white/10 shadow-inner">
               <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Ready to trade?</p>
                  <p className="text-xs font-bold text-slate-400 uppercase italic">Jump back to the hub</p>
               </div>
               <Button 
                  onClick={() => window.location.href = '/dashboard/pos'}
                  className="h-24 w-full rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-sm tracking-[0.3em] shadow-2xl shadow-indigo-600/40 gap-6 transition-all hover:scale-105 active:scale-95 italic"
               >
                  <ShoppingCart className="h-8 w-8" /> Launch Quick POS
               </Button>
            </div>
         </div>
      </Card>

      {/* Footer Branding */}
      <div className="pt-10 pb-20 text-center">
         <div className="inline-flex flex-col items-center gap-4">
            <div className="h-px w-32 bg-slate-200" />
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300 italic">Official Protech Assist Documentation</p>
            <p className="text-[8px] font-bold text-slate-200 uppercase tracking-widest leading-none">African Trade Ecosystem • OS v2.0</p>
         </div>
      </div>
    </div>
  );
}
