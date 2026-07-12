"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical, CheckCircle2, Clock, Printer, Receipt } from "lucide-react";
import { getLabTests, submitLabResults } from "@/app/actions/clinic";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import autoTable from "jspdf-autotable";
import { generateLabBill } from "@/app/actions/clinic-billing";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function LabTestsPage() {
  const { data: session } = useSession();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [resultsText, setResultsText] = useState("");
  const [generateBill, setGenerateBill] = useState(true);
  const [fee, setFee] = useState("50.00");

  useEffect(() => {
    if (session?.user?.businessId) {
      fetchTests();
    }
  }, [session]);

  const fetchTests = async () => {
    setLoading(true);
    const res = await getLabTests(session!.user.businessId);
    if (res.success) {
      setTests(res.data || []);
    }
    setLoading(false);
  };

  const handleSubmitResults = async () => {
    if (!selectedTest) return;
    const res = await submitLabResults(selectedTest.id, resultsText, session!.user.id);
    if (res.success) {
      if (generateBill && parseFloat(fee) > 0) {
        await generateLabBill(selectedTest.id, parseFloat(fee), selectedTest.patientId, selectedTest.testName);
        alert("Results submitted and Bill sent to POS!");
      } else {
        alert("Results submitted successfully!");
      }
      setSelectedTest(null);
      setResultsText("");
      setGenerateBill(true);
      setFee("50.00");
      fetchTests();
    }
  };
  const handleDownloadPDF = (test: any) => {
    const doc = new jsPDF();
    const clinicName = session?.user?.businessName || "Clinic Laboratory";
    
    // Theme colors
    const primaryColor: [number, number, number] = [16, 185, 129]; // Emerald 500
    const secondaryColor: [number, number, number] = [241, 245, 249]; // Slate 50
    const textColor: [number, number, number] = [15, 23, 42]; // Slate 900

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(clinicName, 105, 20, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("OFFICIAL LABORATORY REPORT", 105, 28, { align: "center" });

    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Report ID: LAB-${test.id.substring(0, 8).toUpperCase()}`, 14, 55);
    doc.text(`Date: ${format(new Date(test.updatedAt || test.createdAt), "MMMM dd, yyyy - h:mm a")}`, 140, 55);

    autoTable(doc, {
      startY: 65,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      bodyStyles: { textColor: 50 },
      head: [['Patient Information', 'Physician Information']],
      body: [
        [
          `Name: ${test.patient?.name || "Unknown"}\nPatient ID: ${test.patientId?.substring(0,8).toUpperCase() || "N/A"}`,
          `Referring Doctor: Dr. ${test.doctor?.name || "Unknown"}\nStatus: COMPLETED`
        ],
      ],
    });

    let finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(`Test Name: ${test.testName}`, 14, finalY);

    finalY += 5;

    autoTable(doc, {
      startY: finalY,
      theme: 'plain',
      bodyStyles: { 
        fillColor: secondaryColor,
        textColor: textColor,
        cellPadding: 8,
        fontSize: 11,
        font: "helvetica",
        lineColor: [226, 232, 240], // slate-200
        lineWidth: 0.5
      },
      body: [
        [test.results || "No results available."]
      ],
    });

    finalY = (doc as any).lastAutoTable.finalY + 30;

    if (finalY > 250) {
      doc.addPage();
      finalY = 40;
    }

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.line(14, finalY, 74, finalY); 
    doc.text("Laboratory Technician", 14, finalY + 5);

    doc.line(136, finalY, 196, finalY); 
    doc.text("Authorized Doctor", 136, finalY + 5);

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}  |  Generated on ${format(new Date(), "MMM dd, yyyy")}`, 105, 290, { align: "center" });
    }

    doc.save(`LabReport_${test.testName.replace(/\s+/g, '_')}_${test.patient?.name?.replace(/\s+/g, '_')}.pdf`);
  };

  const pendingTests = tests.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const completedTests = tests.filter(t => t.status === 'COMPLETED');

  return (
    <div className="space-y-6 min-h-[80vh] p-4 -m-4 bg-background text-foreground relative overflow-hidden rounded-3xl">
      {/* Decorative Glow Background */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tight">Laboratory Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage lab tests and submit diagnostic results</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Tests */}
          <Card className="rounded-3xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
             <CardHeader className="bg-amber-500/10 border-b border-amber-500/20 pb-4">
               <CardTitle className="text-sm uppercase tracking-widest text-amber-400 font-black flex items-center gap-2">
                 <Clock className="h-4 w-4" /> Pending Tests
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               {loading ? (
                 <div className="p-6 text-center text-sm text-foreground0">Loading tests...</div>
               ) : pendingTests.length === 0 ? (
                 <div className="p-8 text-center text-foreground0">No pending lab tests.</div>
               ) : (
                 <div className="divide-y divide-white/5">
                    {pendingTests.map(test => (
                      <div key={test.id} className="p-5 flex items-center justify-between hover:bg-card/50 transition-all duration-300 border-l-4 border-transparent hover:border-amber-500 group">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                               <FlaskConical className="h-6 w-6" />
                            </div>
                            <div>
                               <p className="font-bold text-foreground text-lg">{test.testName}</p>
                               <p className="text-sm text-muted-foreground">Patient: <span className="text-amber-100">{test.patient?.name}</span> • Doctor: {test.doctor?.name}</p>
                            </div>
                         </div>
                         <Button 
                           className={`rounded-full px-6 shadow-md transition-all ${selectedTest?.id === test.id ? "bg-amber-500 hover:bg-amber-600 text-foreground shadow-[0_0_15px_-3px_#f59e0b]" : "bg-white/10 hover:bg-white/20 text-foreground border border-border"}`}
                           onClick={() => {
                             setSelectedTest(test);
                             setResultsText(test.results || "");
                           }}
                         >
                           Enter Results
                         </Button>
                      </div>
                    ))}
                 </div>
               )}
             </CardContent>
          </Card>

          {/* Completed Tests */}
          <Card className="rounded-3xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
             <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 pb-4">
               <CardTitle className="text-sm uppercase tracking-widest text-emerald-400 font-black flex items-center gap-2">
                 <CheckCircle2 className="h-4 w-4" /> Completed Tests
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-white/5">
                  {completedTests.slice(0, 5).map(test => (
                    <div key={test.id} className="p-5 flex flex-col gap-3 hover:bg-card/50 transition-all duration-300 border-l-4 border-transparent hover:border-emerald-500 rounded-r-3xl">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                               <FlaskConical className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="font-bold text-base text-foreground">{test.testName}</p>
                               <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{test.patient?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-emerald-400 font-black bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full uppercase hidden sm:inline-block">Completed</span>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-foreground transition-colors" onClick={() => handleDownloadPDF(test)} title="Download PDF">
                               <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                       </div>
                       <div className="bg-muted/50 p-4 rounded-2xl border border-border ml-14">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{test.results}</p>
                       </div>
                    </div>
                  ))}
                  {completedTests.length === 0 && !loading && (
                    <div className="p-6 text-center text-sm text-foreground0">No completed tests yet.</div>
                  )}
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Side - Entry Form */}
        <div>
           {selectedTest ? (
             <Card className="rounded-3xl border border-emerald-500/30 shadow-[0_0_30px_-5px_#10b981] sticky top-24 bg-card/90 backdrop-blur-xl overflow-hidden">
               <CardHeader className="bg-gradient-to-r from-emerald-600/50 to-teal-600/50 text-foreground pb-6 border-b border-emerald-500/30">
                 <CardTitle className="text-2xl font-black">Submit Results</CardTitle>
                 <p className="text-emerald-100 text-sm mt-1">{selectedTest.testName} for <span className="font-bold">{selectedTest.patient?.name}</span></p>
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-emerald-400 uppercase tracking-widest">Test Results / Notes</label>
                    <Textarea 
                      value={resultsText} 
                      onChange={(e) => setResultsText(e.target.value)} 
                      placeholder="Enter detailed lab results here..."
                      className="min-h-[250px] resize-y bg-muted/50 border border-border text-foreground focus-visible:ring-emerald-500 rounded-2xl p-4 shadow-inner"
                    />
                 </div>
                 <div className="flex flex-col gap-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-emerald-900/20 p-3 rounded-2xl border border-emerald-500/30">
                      <div className="flex items-center gap-2 pl-2">
                        <input type="checkbox" id="generate-bill" checked={generateBill} onChange={(e) => setGenerateBill(e.target.checked)} className="h-5 w-5 rounded bg-muted/50 border-emerald-500 text-emerald-500 focus:ring-emerald-500" />
                        <Label htmlFor="generate-bill" className="font-bold cursor-pointer flex items-center gap-1 text-emerald-300">
                          <Receipt className="h-4 w-4" /> Lab Billing
                        </Label>
                      </div>
                      {generateBill && (
                        <div className="flex items-center gap-2 pr-1 ml-auto">
                           <Label className="text-[10px] uppercase text-emerald-400 font-black">Fee:</Label>
                           <Input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="w-24 h-10 bg-muted/50 border-border focus-visible:ring-emerald-500 rounded-xl text-right font-mono text-foreground font-bold" />
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSubmitResults} className="w-full bg-emerald-500 hover:bg-emerald-600 text-foreground rounded-full shadow-[0_0_20px_-5px_#10b981] h-14 text-sm font-black uppercase tracking-widest transition-all">
                       Submit & Mark Completed
                    </Button>
                    <Button variant="ghost" onClick={() => setSelectedTest(null)} className="w-full rounded-full text-muted-foreground hover:text-foreground hover:bg-card/50 h-12">
                       Cancel
                    </Button>
                 </div>
               </CardContent>
             </Card>
           ) : (
             <div className="h-[400px] rounded-3xl border border-white/5 flex flex-col items-center justify-center text-foreground0 bg-card/50 backdrop-blur-xl">
                <FlaskConical className="h-16 w-16 mb-4 text-emerald-500/30" />
                <p className="font-black text-muted-foreground uppercase tracking-widest text-sm">Select a test to enter results</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
