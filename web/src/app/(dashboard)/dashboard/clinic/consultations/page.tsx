"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Stethoscope, User, Save, History, FlaskConical, Pill } from "lucide-react";
import { getAppointments, createConsultation, createLabTest } from "@/app/actions/clinic";

export default function ConsultationsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [vitals, setVitals] = useState({ bp: "", temp: "", weight: "", heartRate: "" });
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  const [labDialogOpen, setLabDialogOpen] = useState(false);
  const [testName, setTestName] = useState("");

  useEffect(() => {
    if (session?.user?.businessId) {
      fetchQueue();
    }
  }, [session]);

  const fetchQueue = async () => {
    setLoading(true);
    // Fetch IN_PROGRESS appointments for today
    const res = await getAppointments(session!.user.businessId);
    if (res.success) {
      setAppointments((res.data || []).filter((a: any) => a.status === 'IN_PROGRESS'));
    }
    setLoading(false);
  };

  const handleSaveConsultation = async () => {
    if (!selectedAppointment) return;
    
    const res = await createConsultation({
      patientId: selectedAppointment.patientId,
      doctorId: session!.user.id,
      appointmentId: selectedAppointment.id,
      vitals,
      chiefComplaint,
      symptoms,
      diagnosis,
      treatmentPlan,
      doctorNotes,
      businessId: session!.user.businessId
    });

    if (res.success) {
      alert("Consultation saved successfully!");
      setSelectedAppointment(null);
      // Reset form
      setVitals({ bp: "", temp: "", weight: "", heartRate: "" });
      setChiefComplaint("");
      setSymptoms("");
      setDiagnosis("");
      setTreatmentPlan("");
      setDoctorNotes("");
      fetchQueue();
    }
  };

  const handleOrderLab = async () => {
    if (!selectedAppointment || !testName.trim()) return;
    const res = await createLabTest({
      patientId: selectedAppointment.patientId,
      doctorId: session!.user.id,
      testName,
      businessId: session!.user.businessId
    });
    if (res.success) {
      alert("Lab Test Ordered successfully!");
      setTestName("");
      setLabDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Consultations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Doctor workspace and clinical notes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side - Queue */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="rounded-2xl border-slate-100 shadow-sm">
             <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 rounded-t-2xl">
               <CardTitle className="text-sm uppercase tracking-widest text-slate-500 font-black flex items-center gap-2">
                 <User className="h-4 w-4" /> Waiting Queue
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               {loading ? (
                 <div className="p-4 text-center text-xs text-slate-500">Loading queue...</div>
               ) : appointments.length === 0 ? (
                 <div className="p-6 text-center text-xs text-slate-500">No patients waiting.</div>
               ) : (
                 <div className="divide-y divide-slate-100">
                    {appointments.map(apt => (
                      <div 
                        key={apt.id} 
                        onClick={() => setSelectedAppointment(apt)}
                        className={`p-4 cursor-pointer transition-colors ${selectedAppointment?.id === apt.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                      >
                         <p className="font-bold text-sm text-slate-900">{apt.patient?.name}</p>
                         <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{apt.reason || "General Visit"}</p>
                      </div>
                    ))}
                 </div>
               )}
             </CardContent>
          </Card>
        </div>

        {/* Right Side - Workspace */}
        <div className="lg:col-span-3 space-y-4">
           {selectedAppointment ? (
             <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
               <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl">
                       {selectedAppointment.patient?.name?.charAt(0)}
                     </div>
                     <div>
                       <h2 className="text-xl font-bold">{selectedAppointment.patient?.name}</h2>
                       <p className="text-slate-400 text-sm">{selectedAppointment.patient?.phone} • {selectedAppointment.reason}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0">
                        <History className="mr-2 h-4 w-4" /> History
                     </Button>
                     <Dialog open={labDialogOpen} onOpenChange={setLabDialogOpen}>
                        <DialogTrigger asChild>
                           <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0">
                              <FlaskConical className="mr-2 h-4 w-4" /> Order Lab
                           </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Order Lab Test</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="space-y-2">
                              <Label className="font-bold">Test Name / Description</Label>
                              <Input 
                                value={testName} 
                                onChange={(e) => setTestName(e.target.value)} 
                                placeholder="E.g. Complete Blood Count, Malaria Rapid Test..." 
                                className="bg-slate-50 dark:bg-slate-800"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleOrderLab} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                              Send to Lab
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                     </Dialog>
                     <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0">
                        <Pill className="mr-2 h-4 w-4" /> Rx
                     </Button>
                  </div>
               </div>

               <CardContent className="p-6 space-y-6">
                 {/* Vitals */}
                 <div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Stethoscope className="h-4 w-4 text-rose-500" /> Vitals
                   </h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="space-y-1">
                       <Label className="text-xs">Blood Pressure</Label>
                       <Input value={vitals.bp} onChange={(e) => setVitals({...vitals, bp: e.target.value})} placeholder="120/80" className="bg-slate-50" />
                     </div>
                     <div className="space-y-1">
                       <Label className="text-xs">Heart Rate (bpm)</Label>
                       <Input value={vitals.heartRate} onChange={(e) => setVitals({...vitals, heartRate: e.target.value})} placeholder="72" className="bg-slate-50" />
                     </div>
                     <div className="space-y-1">
                       <Label className="text-xs">Temperature (°C)</Label>
                       <Input value={vitals.temp} onChange={(e) => setVitals({...vitals, temp: e.target.value})} placeholder="36.5" className="bg-slate-50" />
                     </div>
                     <div className="space-y-1">
                       <Label className="text-xs">Weight (kg)</Label>
                       <Input value={vitals.weight} onChange={(e) => setVitals({...vitals, weight: e.target.value})} placeholder="70" className="bg-slate-50" />
                     </div>
                   </div>
                 </div>

                 {/* Notes */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="font-bold">Chief Complaint</Label>
                       <Input value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="Main reason for visit..." />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold">Symptoms</Label>
                       <Input value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="E.g., fever, cough, headache..." />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold">Diagnosis</Label>
                       <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Primary diagnosis..." />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold">Treatment Plan</Label>
                       <Input value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} placeholder="Medications, rest, follow-up..." />
                    </div>
                 </div>

                 {/* Detailed Notes */}
                 <div className="space-y-2">
                    <Label className="font-bold">Comprehensive Doctor Notes</Label>
                    <Textarea 
                      value={doctorNotes} 
                      onChange={(e) => setDoctorNotes(e.target.value)} 
                      placeholder="Detailed clinical observations, examination findings, and additional remarks..."
                      className="min-h-[150px] resize-y bg-slate-50"
                    />
                 </div>

                 <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button onClick={handleSaveConsultation} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 px-8">
                       <Save className="mr-2 h-4 w-4" /> Finish Consultation
                    </Button>
                 </div>
               </CardContent>
             </Card>
           ) : (
             <div className="h-[500px] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <Stethoscope className="h-12 w-12 mb-4 text-slate-300" />
                <p className="font-bold">Select a patient from the queue to start</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
