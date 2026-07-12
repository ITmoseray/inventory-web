"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical, CheckCircle2, Search, Bell, Settings, Receipt, Printer, Edit2, ChevronDown, Check, Activity, Trash2, Plus, ArrowLeft } from "lucide-react";
import { getLabTests, submitLabResults } from "@/app/actions/clinic";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import autoTable from "jspdf-autotable";
import { generateLabBill } from "@/app/actions/clinic-billing";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LabResultParam {
  id: string;
  name: string;
  result: string;
  unit: string;
  range: string;
  flag: 'Low' | 'Normal' | 'High' | '';
}

const LAB_TEMPLATES: Record<string, Omit<LabResultParam, 'id' | 'result' | 'flag'>[]> = {
  "CBC with Differential": [
    { name: "WBC Count", unit: "x10^9/L", range: "4.0-11.0" },
    { name: "Hemoglobin", unit: "g/dL", range: "13.5-17.5" },
    { name: "Hematocrit", unit: "%", range: "43-43.5" },
    { name: "Platelets", unit: "x10^9/L", range: "150-450" },
    { name: "Neutrophils", unit: "%", range: "40-60" },
    { name: "Lymphocytes", unit: "%", range: "20-40" },
    { name: "Monocytes", unit: "%", range: "2-8" },
  ],
  "Lipid Profile": [
    { name: "Total Cholesterol", unit: "mg/dL", range: "< 200" },
    { name: "HDL Cholesterol", unit: "mg/dL", range: "> 40" },
    { name: "LDL Cholesterol", unit: "mg/dL", range: "< 100" },
    { name: "Triglycerides", unit: "mg/dL", range: "< 150" },
  ],
  "Comprehensive Metabolic Panel": [
    { name: "Glucose", unit: "mg/dL", range: "70-99" },
    { name: "Calcium", unit: "mg/dL", range: "8.6-10.2" },
    { name: "Sodium", unit: "mmol/L", range: "135-145" },
    { name: "Potassium", unit: "mmol/L", range: "3.5-5.2" },
  ]
};

export default function LabTestsPage() {
  const { data: session } = useSession();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  
  const [parameters, setParameters] = useState<LabResultParam[]>([]);
  const [notes, setNotes] = useState("");
  
  const [generateBill, setGenerateBill] = useState(true);
  const [fee, setFee] = useState("50.00");
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const handleSelectTest = (test: any) => {
    setSelectedTest(test);
    try {
      const parsed = JSON.parse(test.results || "{}");
      if (parsed.parameters && Array.isArray(parsed.parameters)) {
        setParameters(parsed.parameters);
        setNotes(parsed.notes || "");
      } else {
        throw new Error("Not structured");
      }
    } catch (e) {
      setNotes(test.results || "");
      const templateName = Object.keys(LAB_TEMPLATES).find(k => test.testName?.toLowerCase().includes(k.toLowerCase()));
      if (templateName) {
        setParameters(LAB_TEMPLATES[templateName].map(p => ({ ...p, id: Math.random().toString(), result: '', flag: '' as any })));
      } else {
        setParameters([{ id: Math.random().toString(), name: '', result: '', unit: '', range: '', flag: '' }]);
      }
    }
  };

  const handleUpdateParam = (id: string, field: keyof LabResultParam, value: string) => {
    setParameters(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addRow = () => {
    setParameters(prev => [...prev, { id: Math.random().toString(), name: '', result: '', unit: '', range: '', flag: '' }]);
  };

  const removeRow = (id: string) => {
    setParameters(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmitResults = async (asDraft = false) => {
    if (!selectedTest) return;
    const finalPayload = JSON.stringify({ parameters, notes });
    
    const res = await submitLabResults(selectedTest.id, finalPayload, session!.user.id);
    if (res.success) {
      if (!asDraft && generateBill && parseFloat(fee) > 0) {
        await generateLabBill(selectedTest.id, parseFloat(fee), selectedTest.patientId, selectedTest.testName);
        alert("Results submitted and Bill sent to POS!");
      } else {
        alert(asDraft ? "Draft saved successfully!" : "Results verified and submitted successfully!");
      }
      setSelectedTest(null);
      setParameters([]);
      setNotes("");
      setGenerateBill(true);
      setFee("50.00");
      fetchTests();
    }
  };

  const handleDownloadPDF = (test: any) => {
    const doc = new jsPDF();
    const clinicName = session?.user?.businessName || "Clinic Laboratory";
    
    const primaryColor: [number, number, number] = [16, 185, 129]; 
    const secondaryColor: [number, number, number] = [241, 245, 249]; 
    const textColor: [number, number, number] = [15, 23, 42]; 

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
          `Referring Doctor: Dr. ${test.doctor?.name || "Unknown"}\nStatus: ${test.status}`
        ],
      ],
    });

    let finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(`Test Name: ${test.testName}`, 14, finalY);

    finalY += 5;

    let isStructured = false;
    let parsedData: any = null;
    try {
       parsedData = JSON.parse(test.results || "{}");
       if (parsedData.parameters) isStructured = true;
    } catch(e) {}

    if (isStructured) {
      autoTable(doc, {
        startY: finalY + 5,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        head: [['Test Parameter', 'Result', 'Units', 'Reference Range', 'Flag']],
        body: parsedData.parameters.map((p: any) => [
          p.name, p.result, p.unit, p.range, p.flag
        ])
      });
      finalY = (doc as any).lastAutoTable.finalY + 10;
      
      if (parsedData.notes) {
          doc.setFontSize(12);
          doc.setTextColor(...textColor);
          doc.text("Observations / Notes", 14, finalY);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          const lines = doc.splitTextToSize(parsedData.notes, 180);
          doc.text(lines, 14, finalY + 6);
          finalY += 10 + (lines.length * 5);
      }
    } else {
      autoTable(doc, {
        startY: finalY,
        theme: 'plain',
        bodyStyles: { fillColor: secondaryColor, textColor: textColor, cellPadding: 8, fontSize: 11, font: "helvetica", lineColor: [226, 232, 240], lineWidth: 0.5 },
        body: [[test.results || "No results available."]],
      });
      finalY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (finalY > 250) {
      doc.addPage();
      finalY = 40;
    }

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.line(14, finalY + 15, 74, finalY + 15); 
    doc.text("Laboratory Technician", 14, finalY + 20);

    doc.line(136, finalY + 15, 196, finalY + 15); 
    doc.text("Authorized Doctor", 136, finalY + 20);

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
  
  const displayedTests = searchQuery 
    ? tests.filter(t => t.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || t.testName?.toLowerCase().includes(searchQuery.toLowerCase()))
    : pendingTests;

  const getAvatar = (name: string) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`;
  };

  return (
    <div className="bg-[#131417] min-h-[90vh] text-slate-200 -m-4 p-4 lg:p-6 font-sans relative overflow-hidden flex flex-col">
      {/* Top Header matching mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 z-10 relative bg-[#1c1d21] p-4 rounded-2xl border border-white/5 shadow-lg gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
           <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-emerald-500" />
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">MEDLAB</h1>
                <p className="text-[10px] text-emerald-500 tracking-widest uppercase font-bold">Bio-Analytics</p>
              </div>
           </div>
        </div>
        
        <div className="w-full sm:flex-1 sm:max-w-xl sm:mx-8">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search patients, tests, results..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#25262b] border border-white/5 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-500"
              />
           </div>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
           <div className="relative cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-[#1c1d21]"></span>
              {showNotifications && (
                 <div className="absolute top-8 left-0 sm:left-auto sm:right-0 w-64 bg-[#25262b] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden cursor-default" onClick={e => e.stopPropagation()}>
                    <div className="p-3 border-b border-white/5 bg-[#1c1d21]">
                       <p className="text-xs font-bold text-white">Notifications</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                       <div className="p-3 hover:bg-white/5 transition-colors border-b border-white/5">
                          <p className="text-sm font-bold text-emerald-400">Lab Ready</p>
                          <p className="text-xs text-slate-400">System is online and ready for processing.</p>
                       </div>
                       <div className="p-3 hover:bg-white/5 transition-colors">
                          <p className="text-sm font-bold text-amber-400">Pending Tests</p>
                          <p className="text-xs text-slate-400">You have {pendingTests.length} tests awaiting results.</p>
                       </div>
                    </div>
                 </div>
              )}
           </div>
           <Settings className="h-5 w-5 cursor-pointer hover:text-emerald-400 transition-colors text-slate-400" />
           <div className="flex items-center gap-3 border-l border-white/10 pl-6 cursor-pointer relative" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="text-right hidden sm:block">
                 <p className="text-sm font-bold text-white">{session?.user?.name || "Technician"}</p>
                 <p className="text-[10px] text-emerald-500 flex items-center justify-end gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                 </p>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${session?.user?.name || 'Tech'}&background=10b981&color=fff`} className="h-9 w-9 rounded-full border border-white/10" />
              <ChevronDown className="h-4 w-4 text-slate-500" />
              {showProfileMenu && (
                 <div className="absolute top-12 right-0 w-48 bg-[#25262b] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden cursor-default" onClick={e => e.stopPropagation()}>
                    <div className="p-3 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => window.location.href = '/dashboard/settings'}>
                       <p className="text-sm text-white">Account Settings</p>
                    </div>
                    <div className="p-3 hover:bg-rose-500/10 transition-colors cursor-pointer text-rose-400 border-t border-white/5" onClick={() => signOut({ callbackUrl: '/auth/login' })}>
                       <p className="text-sm font-bold">Sign Out</p>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1 z-10 relative">
        
        {/* Left Panel: PENDING LAB TESTS */}
        <div className={`w-full xl:w-[450px] shrink-0 flex-col gap-4 ${selectedTest ? 'hidden xl:flex' : 'flex'}`}>
           <div>
              <h2 className="text-lg font-bold text-emerald-400 uppercase tracking-widest">{searchQuery ? 'Search Results' : 'Pending Lab Tests'}</h2>
              <p className="text-sm text-slate-500">{searchQuery ? `Found ${displayedTests.length} tests` : 'Recent patients who needed testing'}</p>
           </div>
           
           <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-10" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {loading ? (
                 <div className="p-8 text-center text-slate-500">Loading requests...</div>
              ) : displayedTests.length === 0 ? (
                 <div className="p-8 text-center text-slate-500 bg-[#1c1d21] rounded-2xl border border-white/5">No tests found.</div>
              ) : (
                 displayedTests.map((test) => (
                   <div 
                     key={test.id}
                     onClick={() => handleSelectTest(test)}
                     className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${selectedTest?.id === test.id ? 'bg-gradient-to-br from-[#202126] to-[#16171a] border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]' : 'bg-[#1c1d21] border-white/5 hover:border-white/10 hover:bg-[#202126]'}`}
                   >
                     <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-slate-300 truncate pr-2">
                           *{test.patient?.name?.toUpperCase() || "UNKNOWN"}, {test.patient?.dateOfBirth ? (new Date().getFullYear() - new Date(test.patient.dateOfBirth).getFullYear()) : "??"}, {test.patient?.gender?.charAt(0) || "U"}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono tracking-wider">#PT{test.patientId?.substring(0,6).toUpperCase()}</span>
                     </div>
                     <div className="mb-4">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Test Type</p>
                        <div className="flex items-center justify-between">
                           <p className="text-base font-medium text-white">{test.testName}</p>
                           <span className={`text-[10px] px-2 py-0.5 rounded border ${test.testName.toLowerCase().includes('comprehensive') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                              {test.status === 'PENDING' ? 'Processing' : 'Awaiting'}
                           </span>
                        </div>
                     </div>
                     <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div>
                           <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Sample ID</p>
                           <p className="text-sm font-mono text-slate-300">#BL{(Math.random() * 9000 + 1000).toFixed(0)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="text-right">
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Assigned Tech</p>
                              <p className="text-xs text-white">{test.labTechnician?.name || "Unassigned"}</p>
                           </div>
                           <img src={getAvatar(test.labTechnician?.name || "Un")} className="h-8 w-8 rounded-full border border-white/10" />
                        </div>
                     </div>
                   </div>
                 ))
              )}
           </div>
        </div>

        {/* Right Panel: RESULTS INPUT */}
        <div className={`flex-1 flex-col gap-4 ${!selectedTest ? 'hidden xl:flex' : 'flex'}`}>
           <div>
              <div className="flex items-center gap-2 xl:hidden mb-2">
                 <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-400 hover:bg-transparent p-0 h-auto font-bold uppercase tracking-widest text-[10px]" onClick={() => setSelectedTest(null)}>
                    <ArrowLeft className="h-3 w-3 mr-1" /> Back to Tests
                 </Button>
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-widest">Results Input & Verification</h2>
              <p className="text-sm text-slate-500">Patient selected: <span className="text-emerald-400">{selectedTest?.patient?.name || "None"}</span></p>
           </div>
           
           <div className="bg-[#1c1d21] border border-white/5 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl relative">
              {!selectedTest ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-opacity-5">
                    <FlaskConical className="h-16 w-16 mb-4 text-emerald-500/20" />
                    <p className="font-bold tracking-widest uppercase">Select a test to begin</p>
                 </div>
              ) : (
                 <div className="flex flex-col h-full">
                    {/* Header Details */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-900/10 to-transparent">
                       <div>
                          <h3 className="text-2xl font-black text-white">{selectedTest.patient?.name}</h3>
                          <p className="text-emerald-400 font-medium">{selectedTest.testName}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xs text-slate-500 mb-1">Test ID: #TSK{selectedTest.id.substring(0,4).toUpperCase()}</p>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(selectedTest)} className="h-8 bg-[#25262b] border-white/10 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 text-slate-300">
                             <Printer className="h-3 w-3 mr-2" /> Download Report
                          </Button>
                       </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                       
                       {/* Data Grid */}
                       <div className="border border-white/10 rounded-xl overflow-hidden bg-[#18191c] shadow-inner">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 bg-[#25262b] border-b border-white/10">
                              <tr>
                                <th className="px-4 py-3 font-medium w-1/4">Test Parameter</th>
                                <th className="px-4 py-3 font-medium">Result</th>
                                <th className="px-4 py-3 font-medium">Units</th>
                                <th className="px-4 py-3 font-medium">Reference Range</th>
                                <th className="px-4 py-3 font-medium w-1/6">Flag</th>
                                <th className="px-2 py-3 w-8"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {parameters.map((p, idx) => (
                                 <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                   <td className="px-4 py-2">
                                      <input value={p.name} onChange={(e)=>handleUpdateParam(p.id, 'name', e.target.value)} placeholder="Parameter Name" className="w-full bg-transparent border-none focus:ring-0 text-slate-300 text-sm p-0 placeholder:text-slate-600 outline-none" />
                                   </td>
                                   <td className="px-4 py-2 relative">
                                      <div className="relative flex items-center">
                                         <input value={p.result} onChange={(e)=>handleUpdateParam(p.id, 'result', e.target.value)} className="w-full bg-[#1c1d21] border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-lg text-emerald-400 font-mono font-bold text-sm px-3 py-1.5 outline-none transition-all shadow-inner" placeholder="0.0" />
                                         <Edit2 className="h-3 w-3 text-emerald-500/50 absolute right-3 pointer-events-none" />
                                      </div>
                                   </td>
                                   <td className="px-4 py-2">
                                      <input value={p.unit} onChange={(e)=>handleUpdateParam(p.id, 'unit', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-slate-400 text-sm p-0 outline-none" placeholder="unit" />
                                   </td>
                                   <td className="px-4 py-2">
                                      <input value={p.range} onChange={(e)=>handleUpdateParam(p.id, 'range', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-slate-400 text-sm p-0 outline-none" placeholder="0-0" />
                                   </td>
                                   <td className="px-4 py-2">
                                      <select 
                                        value={p.flag} 
                                        onChange={(e)=>handleUpdateParam(p.id, 'flag', e.target.value)} 
                                        className={`w-full bg-transparent border-none focus:ring-0 text-sm p-0 outline-none cursor-pointer appearance-none ${p.flag==='High'?'text-rose-400 font-bold':p.flag==='Low'?'text-amber-400 font-bold':p.flag==='Normal'?'text-emerald-400 font-bold':'text-slate-500'}`}
                                      >
                                         <option value="" className="bg-[#1c1d21]">Select</option>
                                         <option value="Normal" className="bg-[#1c1d21] text-emerald-400">Normal</option>
                                         <option value="High" className="bg-[#1c1d21] text-rose-400">High</option>
                                         <option value="Low" className="bg-[#1c1d21] text-amber-400">Low</option>
                                      </select>
                                   </td>
                                   <td className="px-2 py-2 text-right">
                                      <button onClick={()=>removeRow(p.id)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                         <Trash2 className="h-4 w-4" />
                                      </button>
                                   </td>
                                 </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="p-2 border-t border-white/5 bg-[#1c1d21]">
                             <button onClick={addRow} className="flex items-center justify-center w-full py-2 text-xs text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors font-bold uppercase tracking-widest border border-dashed border-emerald-500/30">
                                <Plus className="h-3 w-3 mr-1" /> Add Parameter Row
                             </button>
                          </div>
                       </div>
                       
                       {/* Observations / Notes */}
                       <div>
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Observations / Notes</Label>
                          <Textarea 
                             value={notes}
                             onChange={(e) => setNotes(e.target.value)}
                             placeholder="Add commortions/notes to test and observation..."
                             className="min-h-[100px] bg-[#18191c] border border-white/10 text-slate-300 focus-visible:ring-emerald-500/50 rounded-xl resize-y"
                          />
                       </div>

                       {/* Billing */}
                       <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[#25262b] p-4 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3 pl-2">
                             <input type="checkbox" id="generate-bill" checked={generateBill} onChange={(e) => setGenerateBill(e.target.checked)} className="h-5 w-5 rounded bg-[#18191c] border-emerald-500 text-emerald-500 focus:ring-emerald-500 accent-emerald-500" />
                             <Label htmlFor="generate-bill" className="font-bold cursor-pointer flex items-center gap-2 text-emerald-400">
                               <Receipt className="h-4 w-4" /> Generate Lab Bill
                             </Label>
                          </div>
                          {generateBill && (
                             <div className="flex items-center gap-3 pr-1 ml-auto">
                                <Label className="text-xs uppercase text-slate-400 font-bold">Fee ($):</Label>
                                <Input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="w-24 h-9 bg-[#18191c] border border-white/10 focus-visible:ring-emerald-500/50 rounded-lg text-right font-mono text-emerald-400 font-bold" />
                             </div>
                          )}
                       </div>
                    </div>
                    
                    {/* Bottom Actions */}
                    <div className="p-6 border-t border-white/5 bg-[#18191c] flex items-center justify-between gap-6">
                       <div className="flex items-center gap-6">
                          <div>
                             <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Assigned Technician</p>
                             <div className="flex items-center gap-3 bg-[#25262b] border border-emerald-500/30 py-1.5 px-3 rounded-full">
                                <img src={getAvatar(session?.user?.name || "Tech")} className="h-6 w-6 rounded-full" />
                                <span className="text-xs font-bold text-white">{session?.user?.name || "Technician"}</span>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-2" />
                             </div>
                          </div>
                          <div className="hidden sm:block">
                             <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Verified By</p>
                             <div className="flex items-center gap-3 bg-[#25262b] border border-white/10 py-1.5 px-3 rounded-full opacity-50">
                                <img src={getAvatar("Sarah Jallow")} className="h-6 w-6 rounded-full grayscale" />
                                <span className="text-xs font-bold text-white">Pending</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <Button onClick={() => handleSubmitResults(true)} variant="outline" className="bg-transparent border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white rounded-lg h-11 px-6 font-bold">
                             [Review & Save Draft]
                          </Button>
                          <Button onClick={() => handleSubmitResults(false)} className="bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg shadow-[0_0_15px_-3px_#10b981] h-11 px-6 font-black uppercase tracking-widest transition-all hover:shadow-[0_0_25px_-3px_#10b981]">
                             Submit & Verify Results
                          </Button>
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>

      </div>
      
      {/* Background glow effects matching the mockup vibe */}
      <div className="absolute bottom-0 right-0 w-[800px] h-[300px] bg-emerald-900/20 mix-blend-screen filter blur-[150px] pointer-events-none z-0"></div>
    </div>
  );
}
