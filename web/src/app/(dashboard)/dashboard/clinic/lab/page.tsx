"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical, CheckCircle2, Clock, Printer } from "lucide-react";
import { getLabTests, submitLabResults } from "@/app/actions/clinic";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

export default function LabTestsPage() {
  const { data: session } = useSession();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [resultsText, setResultsText] = useState("");

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
      alert("Results submitted successfully!");
      setSelectedTest(null);
      setResultsText("");
      fetchTests();
    }
  };

import autoTable from "jspdf-autotable";

  const handleDownloadPDF = (test: any) => {
    const doc = new jsPDF();
    const clinicName = session?.user?.businessName || "Clinic Laboratory";
    
    // Theme colors
    const primaryColor: [number, number, number] = [79, 74, 133]; // Indigo/Purple
    const secondaryColor: [number, number, number] = [241, 245, 249]; // Slate 50
    const textColor: [number, number, number] = [15, 23, 42]; // Slate 900

    // Header Background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F");

    // Clinic Name
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(clinicName, 105, 20, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("OFFICIAL LABORATORY REPORT", 105, 28, { align: "center" });

    // Reset Text Color
    doc.setTextColor(...textColor);

    // Document Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Report ID: LAB-${test.id.substring(0, 8).toUpperCase()}`, 14, 55);
    doc.text(`Date: ${format(new Date(test.updatedAt || test.createdAt), "MMMM dd, yyyy - h:mm a")}`, 140, 55);

    // Patient & Doctor Info Table
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

    // Test Results Header
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(`Test Name: ${test.testName}`, 14, finalY);

    finalY += 5;

    // Results Box
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

    // Footer Signatures
    if (finalY > 250) {
      doc.addPage();
      finalY = 40;
    }

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.line(14, finalY, 74, finalY); // Signature line 1
    doc.text("Laboratory Technician", 14, finalY + 5);

    doc.line(136, finalY, 196, finalY); // Signature line 2
    doc.text("Authorized Doctor", 136, finalY + 5);

    // Footer Page Number
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-cyan-600 dark:from-teal-400 dark:to-cyan-300 tracking-tight">Laboratory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage lab tests and submit results</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Tests */}
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden dark:bg-slate-900">
             <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-100/50 dark:border-amber-900/20 pb-4">
               <CardTitle className="text-sm uppercase tracking-widest text-amber-700 dark:text-amber-500 font-black flex items-center gap-2">
                 <Clock className="h-4 w-4" /> Pending Tests
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               {loading ? (
                 <div className="p-6 text-center text-sm text-slate-500">Loading tests...</div>
               ) : pendingTests.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">No pending lab tests.</div>
               ) : (
                 <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pendingTests.map(test => (
                      <div key={test.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 border-l-4 border-transparent hover:border-amber-400 dark:hover:border-amber-500 hover:pl-5 hover:shadow-sm">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                               <FlaskConical className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="font-bold text-slate-900 dark:text-white">{test.testName}</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400">Patient: {test.patient?.name} • Ordered by: Dr. {test.doctor?.name}</p>
                            </div>
                         </div>
                         <Button 
                           variant={selectedTest?.id === test.id ? "default" : "outline"}
                           className="rounded-xl shadow-sm"
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
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden dark:bg-slate-900">
             <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b border-emerald-100/50 dark:border-emerald-900/20 pb-4">
               <CardTitle className="text-sm uppercase tracking-widest text-emerald-700 dark:text-emerald-500 font-black flex items-center gap-2">
                 <CheckCircle2 className="h-4 w-4" /> Completed Tests
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {completedTests.slice(0, 5).map(test => (
                    <div key={test.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300 border-l-4 border-transparent hover:border-emerald-400 dark:hover:border-emerald-500 rounded-r-xl">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                               <FlaskConical className="h-4 w-4" />
                            </div>
                            <div>
                               <p className="font-bold text-sm text-slate-900 dark:text-white">{test.testName}</p>
                               <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">{test.patient?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md uppercase hidden sm:inline-block">Completed</span>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-teal-600 border-slate-200 dark:border-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/50" onClick={() => handleDownloadPDF(test)} title="Download PDF">
                               <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                       </div>
                       <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 ml-11">
                          <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{test.results}</p>
                       </div>
                    </div>
                  ))}
                  {completedTests.length === 0 && !loading && (
                    <div className="p-6 text-center text-sm text-slate-500">No completed tests yet.</div>
                  )}
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Side - Entry Form */}
        <div>
           {selectedTest ? (
             <Card className="rounded-2xl border-teal-100 dark:border-teal-900 shadow-2xl shadow-teal-600/10 sticky top-24 dark:bg-slate-900 overflow-hidden">
               <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white pb-6">
                 <CardTitle className="text-lg">Submit Results</CardTitle>
                 <p className="text-teal-100 text-sm mt-1">{selectedTest.testName} for {selectedTest.patient?.name}</p>
               </CardHeader>
               <CardContent className="p-6 space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Test Results / Notes</label>
                    <Textarea 
                      value={resultsText} 
                      onChange={(e) => setResultsText(e.target.value)} 
                      placeholder="Enter detailed lab results here..."
                      className="min-h-[250px] resize-y bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl"
                    />
                 </div>
                 <Button onClick={handleSubmitResults} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-teal-600/20 h-12 text-sm font-bold uppercase tracking-widest transition-all hover:shadow-teal-600/40">
                    Submit & Mark Completed
                 </Button>
                 <Button variant="ghost" onClick={() => setSelectedTest(null)} className="w-full rounded-xl text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800">
                    Cancel
                 </Button>
               </CardContent>
             </Card>
           ) : (
             <div className="h-[300px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
                <FlaskConical className="h-12 w-12 mb-4 text-slate-300 dark:text-slate-600" />
                <p className="font-bold text-sm">Select a test to enter results</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
