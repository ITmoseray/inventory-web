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
import { toast } from "sonner";

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
    
    try {
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
        toast.success("Consultation saved successfully!");
        setSelectedAppointment(null);
        // Reset form
        setVitals({ bp: "", temp: "", weight: "", heartRate: "" });
        setChiefComplaint("");
        setSymptoms("");
        setDiagnosis("");
        setTreatmentPlan("");
        setDoctorNotes("");
        fetchQueue();
      } else {
        toast.error(res.error || "Failed to save consultation");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleOrderLab = async () => {
    if (!selectedAppointment || !testName.trim()) return;
    try {
      const res = await createLabTest({
        patientId: selectedAppointment.patientId,
        doctorId: session!.user.id,
        testName,
        businessId: session!.user.businessId
      });
      if (res.success) {
        toast.success("Lab Test Ordered successfully!");
        setTestName("");
        setLabDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to order lab test");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-cyan-600 dark:from-teal-400 dark:to-cyan-300 tracking-tight">Consultations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Doctor workspace and clinical notes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side - Queue */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm dark:bg-slate-900">
             <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4 rounded-t-2xl">
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
                 <div className="divide-y divide-slate-100 dark:divide-slate-800">
                     {appointments.map(apt => (
                      <div 
                        key={apt.id} 
                        onClick={() => setSelectedAppointment(apt)}
                        className={`p-4 cursor-pointer transition-all duration-300 ${selectedAppointment?.id === apt.id ? 'bg-teal-50 dark:bg-teal-500/10 border-l-4 border-teal-600 dark:border-teal-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
                      >
                         <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{apt.patient?.name}</p>
                         <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider truncate">{apt.reason || "General Visit"}</p>
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
              <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-xl shadow-teal-500/5 overflow-hidden dark:bg-slate-900">
               <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-900/50 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-full bg-teal-500/20 text-teal-100 flex items-center justify-center font-bold text-xl shrink-0 border border-teal-500/30">
                       {selectedAppointment.patient?.name?.charAt(0)}
                     </div>
                     <div className="min-w-0">
                       <h2 className="text-xl font-bold truncate">{selectedAppointment.patient?.name}</h2>
                       <p className="text-slate-300 text-sm truncate font-medium">{selectedAppointment.patient?.phone} • {selectedAppointment.reason}</p>
                     </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                     <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0 transition-colors">
                        <History className="mr-2 h-4 w-4" /> History
                     </Button>
                     <Dialog open={labDialogOpen} onOpenChange={setLabDialogOpen}>
                        <DialogTrigger asChild>
                           <Button variant="secondary" size="sm" className="bg-teal-600/20 hover:bg-teal-600/40 text-teal-100 border border-teal-500/30 transition-colors">
                              <FlaskConical className="mr-2 h-4 w-4" /> Order Lab
                           </Button>n>
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
                            <Button onClick={handleOrderLab} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
                              Send to Lab
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                     </Dialog>
                     <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0 transition-colors">
                        <Pill className="mr-2 h-4 w-4" /> Rx
                     </Button>
                  </div>
               </div>

               <CardContent className="p-6 space-y-6">
                 {/* Vitals */}
                 <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                   <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" /> Patient Vitals
                   </h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                     <div className="space-y-1">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Blood Pressure</Label>
                       <Input value={vitals.bp} onChange={(e) => setVitals({...vitals, bp: e.target.value})} placeholder="120/80" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl" />
                     </div>
                     <div className="space-y-1">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Heart Rate (bpm)</Label>
                       <Input value={vitals.heartRate} onChange={(e) => setVitals({...vitals, heartRate: e.target.value})} placeholder="72" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl" />
                     </div>
                     <div className="space-y-1">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Temperature (°C)</Label>
                       <Input value={vitals.temp} onChange={(e) => setVitals({...vitals, temp: e.target.value})} placeholder="36.5" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl" />
                     </div>
                     <div className="space-y-1">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Weight (kg)</Label>
                       <Input value={vitals.weight} onChange={(e) => setVitals({...vitals, weight: e.target.value})} placeholder="70" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl" />
                     </div>
                   </div>
                 </div>

                 {/* Notes */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="font-bold text-slate-700 dark:text-slate-300">Chief Complaint</Label>
                       <Input value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="Main reason for visit..." className="dark:bg-slate-950 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold text-slate-700 dark:text-slate-300">Symptoms</Label>
                       <Input value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="E.g., fever, cough, headache..." className="dark:bg-slate-950 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold text-slate-700 dark:text-slate-300">Diagnosis</Label>
                       <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Primary diagnosis..." className="dark:bg-slate-950 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold text-slate-700 dark:text-slate-300">Treatment Plan</Label>
                       <Input value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} placeholder="Medications, rest, follow-up..." className="dark:bg-slate-950 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl" />
                    </div>
                 </div>

                 {/* Detailed Notes */}
                 <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Comprehensive Doctor Notes</Label>
                    <Textarea 
                      value={doctorNotes} 
                      onChange={(e) => setDoctorNotes(e.target.value)} 
                      placeholder="Detailed clinical observations, examination findings, and additional remarks..."
                      className="min-h-[150px] resize-y bg-slate-50 dark:bg-slate-950 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl"
                    />
                 </div>

                 <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button onClick={handleSaveConsultation} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-teal-600/20 transition-all hover:shadow-teal-600/40 px-8 w-full sm:w-auto h-12 font-bold uppercase tracking-widest text-xs">
                       <Save className="mr-2 h-4 w-4" /> Finish Consultation
                    </Button>
                 </div>
               </CardContent>
             </Card>
           ) : (
             <div className="h-[500px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <Stethoscope className="h-12 w-12 mb-4 text-slate-300" />
                <p className="font-bold">Select a patient from the queue to start</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
