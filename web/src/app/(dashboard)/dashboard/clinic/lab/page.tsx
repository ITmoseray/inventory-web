"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical, CheckCircle2, Clock } from "lucide-react";
import { getLabTests, submitLabResults } from "@/app/actions/clinic";

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

  const pendingTests = tests.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const completedTests = tests.filter(t => t.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Laboratory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage lab tests and submit results</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Tests */}
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
             <CardHeader className="bg-amber-50/50 border-b border-amber-100/50 pb-4">
               <CardTitle className="text-sm uppercase tracking-widest text-amber-700 font-black flex items-center gap-2">
                 <Clock className="h-4 w-4" /> Pending Tests
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               {loading ? (
                 <div className="p-6 text-center text-sm text-slate-500">Loading tests...</div>
               ) : pendingTests.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">No pending lab tests.</div>
               ) : (
                 <div className="divide-y divide-slate-100">
                    {pendingTests.map(test => (
                      <div key={test.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                               <FlaskConical className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="font-bold text-slate-900">{test.testName}</p>
                               <p className="text-xs text-slate-500">Patient: {test.patient?.name} • Ordered by: Dr. {test.doctor?.name}</p>
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
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
             <CardHeader className="bg-emerald-50/50 border-b border-emerald-100/50 pb-4">
               <CardTitle className="text-sm uppercase tracking-widest text-emerald-700 font-black flex items-center gap-2">
                 <CheckCircle2 className="h-4 w-4" /> Completed Tests
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-slate-100">
                  {completedTests.slice(0, 5).map(test => (
                    <div key={test.id} className="p-4 flex flex-col gap-2">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                               <FlaskConical className="h-4 w-4" />
                            </div>
                            <div>
                               <p className="font-bold text-sm text-slate-900">{test.testName}</p>
                               <p className="text-[10px] text-slate-500 uppercase tracking-widest">{test.patient?.name}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-2 py-1 rounded-md uppercase">Completed</span>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 ml-11">
                          <p className="text-xs text-slate-700 whitespace-pre-wrap">{test.results}</p>
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
             <Card className="rounded-2xl border-indigo-100 shadow-xl shadow-indigo-600/5 sticky top-24">
               <CardHeader className="bg-indigo-600 text-white rounded-t-2xl">
                 <CardTitle className="text-lg">Submit Results</CardTitle>
                 <p className="text-indigo-100 text-sm mt-1">{selectedTest.testName} for {selectedTest.patient?.name}</p>
               </CardHeader>
               <CardContent className="p-6 space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Test Results / Notes</label>
                    <Textarea 
                      value={resultsText} 
                      onChange={(e) => setResultsText(e.target.value)} 
                      placeholder="Enter detailed lab results here..."
                      className="min-h-[250px] resize-y"
                    />
                 </div>
                 <Button onClick={handleSubmitResults} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 h-12 text-md">
                    Submit & Mark Completed
                 </Button>
                 <Button variant="ghost" onClick={() => setSelectedTest(null)} className="w-full rounded-xl text-slate-500">
                    Cancel
                 </Button>
               </CardContent>
             </Card>
           ) : (
             <div className="h-[300px] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <FlaskConical className="h-12 w-12 mb-4 text-slate-300" />
                <p className="font-bold text-sm">Select a test to enter results</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
