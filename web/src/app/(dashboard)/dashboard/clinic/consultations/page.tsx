"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Stethoscope, User, Save, History, FlaskConical, Pill, Receipt } from "lucide-react";
import { getAppointments, createConsultation, createLabTest } from "@/app/actions/clinic";
import { generateConsultationBill } from "@/app/actions/clinic-billing";
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

  const [generateBill, setGenerateBill] = useState(true);
  const [fee, setFee] = useState("100.00");

  const [labDialogOpen, setLabDialogOpen] = useState(false);
  const [testName, setTestName] = useState("");

  useEffect(() => {
    if (session?.user?.businessId) {
      fetchQueue();
    }
  }, [session]);

  const fetchQueue = async () => {
    setLoading(true);
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
        patientId: selectedAppointment.patientId, doctorId: session!.user.id, appointmentId: selectedAppointment.id,
        vitals, chiefComplaint, symptoms, diagnosis, treatmentPlan, doctorNotes, businessId: session!.user.businessId
      });
      if (res.success) {
        if (generateBill && parseFloat(fee) > 0) {
           await generateConsultationBill(res.data.id, parseFloat(fee), selectedAppointment.patientId);
           toast.success("Consultation saved and Bill sent to POS!");
        } else {
           toast.success("Consultation saved successfully!");
        }
        setSelectedAppointment(null);
        setVitals({ bp: "", temp: "", weight: "", heartRate: "" });
        setChiefComplaint(""); setSymptoms(""); setDiagnosis(""); setTreatmentPlan(""); setDoctorNotes("");
        setGenerateBill(true); setFee("100.00");
        fetchQueue();
      } else toast.error(res.error || "Failed to save consultation");
    } catch (error: any) { toast.error(error.message); }
  };

  const handleOrderLab = async () => {
    if (!selectedAppointment || !testName.trim()) return;
    try {
      const res = await createLabTest({ patientId: selectedAppointment.patientId, doctorId: session!.user.id, testName, businessId: session!.user.businessId });
      if (res.success) {
        toast.success("Lab Test Ordered successfully!");
        setTestName(""); setLabDialogOpen(false);
      } else toast.error(res.error || "Failed to order lab test");
    } catch (error: any) { toast.error(error.message); }
  };

  // Abstract Avatar Generator
  const getAvatar = (name: string, seed: number) => {
     const initial = name ? name.charAt(0).toUpperCase() : '?';
     return (
        <div className="h-12 w-12 rounded-xl bg-muted/80 border border-border text-muted-foreground flex items-center justify-center font-black text-lg shrink-0 overflow-hidden relative">
          <img src={`https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Avatar" />
        </div>
     );
  };

  return (
    <div className="space-y-6 min-h-[80vh] p-4 -m-4 bg-background text-foreground relative overflow-hidden rounded-3xl">
      {/* Decorative Glow Background */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-600/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 tracking-tight">Clinical Consultations</h1>
          <p className="text-sm text-muted-foreground mt-1">Doctor workspace and clinical notes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        {/* Left Side - Queue */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="rounded-3xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
             <CardHeader className="bg-black/20 border-b border-border pb-4 rounded-t-3xl">
               <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-black flex items-center gap-2">
                 <User className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Waiting Queue
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               {loading ? (
                 <div className="p-4 text-center text-xs text-muted-foreground">Loading queue...</div>
               ) : appointments.length === 0 ? (
                 <div className="p-6 text-center text-xs text-muted-foreground">No patients waiting.</div>
               ) : (
                 <div className="divide-y divide-white/5">
                     {appointments.map((apt, idx) => (
                      <div 
                        key={apt.id} 
                        onClick={() => setSelectedAppointment(apt)}
                        className={`p-4 cursor-pointer transition-all duration-300 ${selectedAppointment?.id === apt.id ? 'bg-purple-500/10 border-l-4 border-purple-500' : 'hover:bg-card/50 border-l-4 border-transparent'}`}
                      >
                         <p className="font-bold text-sm text-foreground truncate">{apt.patient?.name}</p>
                         <p className="text-[10px] text-purple-400 mt-1 uppercase tracking-wider truncate">{apt.reason || "General Visit"}</p>
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
              <Card className="rounded-3xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
               <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border">
                  <div className="flex items-center gap-4">
                     {getAvatar(selectedAppointment.patient?.name, 1)}
                     <div className="min-w-0">
                       <h2 className="text-2xl font-black text-foreground truncate">{selectedAppointment.patient?.name}</h2>
                       <p className="text-purple-600 dark:text-purple-300 text-sm truncate font-medium">{selectedAppointment.patient?.phone} • {selectedAppointment.reason}</p>
                     </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                     <Button variant="secondary" size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-foreground border border-border transition-colors">
                        <History className="mr-2 h-4 w-4" /> History
                     </Button>
                     <Dialog open={labDialogOpen} onOpenChange={setLabDialogOpen}>
                        <DialogTrigger asChild>
                           <Button variant="secondary" size="sm" className="rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 transition-colors shadow-[0_0_15px_-3px_#10b981]">
                              <FlaskConical className="mr-2 h-4 w-4" /> Order Lab
                           </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card/95 backdrop-blur-xl border border-border text-foreground sm:max-w-[425px] rounded-3xl shadow-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-foreground">Order Lab Test</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Test Name / Description</Label>
                              <Input 
                                value={testName} 
                                onChange={(e) => setTestName(e.target.value)} 
                                placeholder="E.g. Complete Blood Count, Malaria Rapid Test..." 
                                className="bg-muted/50 border-border text-foreground rounded-xl h-12"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleOrderLab} className="rounded-full h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-[0_0_20px_-5px_#10b981]">
                              Send to Lab
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                     </Dialog>
                     <Button variant="secondary" size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-foreground border border-border transition-colors">
                        <Pill className="mr-2 h-4 w-4" /> Rx
                     </Button>
                  </div>
               </div>

               <CardContent className="p-6 space-y-8">
                 {/* Vitals */}
                 <div className="bg-black/20 p-6 rounded-3xl border border-border shadow-inner">
                   <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Stethoscope className="h-4 w-4" /> Patient Vitals
                   </h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                     <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground">Blood Pressure</Label>
                       <Input value={vitals.bp} onChange={(e) => setVitals({...vitals, bp: e.target.value})} placeholder="120/80" className="bg-card/50 border-border text-foreground focus-visible:ring-purple-500 rounded-xl h-12" />
                     </div>
                     <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground">Heart Rate (bpm)</Label>
                       <Input value={vitals.heartRate} onChange={(e) => setVitals({...vitals, heartRate: e.target.value})} placeholder="72" className="bg-card/50 border-border text-foreground focus-visible:ring-purple-500 rounded-xl h-12" />
                     </div>
                     <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground">Temperature (°C)</Label>
                       <Input value={vitals.temp} onChange={(e) => setVitals({...vitals, temp: e.target.value})} placeholder="36.5" className="bg-card/50 border-border text-foreground focus-visible:ring-purple-500 rounded-xl h-12" />
                     </div>
                     <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground">Weight (kg)</Label>
                       <Input value={vitals.weight} onChange={(e) => setVitals({...vitals, weight: e.target.value})} placeholder="70" className="bg-card/50 border-border text-foreground focus-visible:ring-purple-500 rounded-xl h-12" />
                     </div>
                   </div>
                 </div>

                 {/* Notes */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="font-bold text-muted-foreground">Chief Complaint</Label>
                       <Input value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="Main reason for visit..." className="bg-card/50 border-border text-foreground focus-visible:ring-purple-500 rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold text-muted-foreground">Symptoms</Label>
                       <Input value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="E.g., fever, cough, headache..." className="bg-card/50 border-border text-foreground focus-visible:ring-purple-500 rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold text-muted-foreground">Diagnosis</Label>
                       <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Primary diagnosis..." className="bg-card/50 border-border text-foreground focus-visible:ring-purple-500 rounded-xl h-12 border-purple-500/50 shadow-[0_0_15px_-3px_#a855f7]" />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold text-muted-foreground">Treatment Plan</Label>
                       <Input value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} placeholder="Medications, rest, follow-up..." className="bg-card/50 border-border text-foreground focus-visible:ring-purple-500 rounded-xl h-12" />
                    </div>
                 </div>

                 {/* Detailed Notes */}
                 <div className="space-y-2">
                    <Label className="font-bold text-muted-foreground">Comprehensive Doctor Notes</Label>
                    <Textarea 
                      value={doctorNotes} 
                      onChange={(e) => setDoctorNotes(e.target.value)} 
                      placeholder="Detailed clinical observations, examination findings, and additional remarks..."
                      className="min-h-[150px] resize-y bg-black/20 border-border text-foreground focus-visible:ring-purple-500 rounded-2xl p-4 shadow-inner"
                    />
                 </div>

                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-purple-900/20 p-3 rounded-2xl border border-purple-500/30">
                      <div className="flex items-center gap-2 pl-2">
                        <input type="checkbox" id="generate-bill" checked={generateBill} onChange={(e) => setGenerateBill(e.target.checked)} className="h-5 w-5 rounded bg-muted/50 border-purple-500 text-purple-500 focus:ring-purple-500" />
                        <Label htmlFor="generate-bill" className="font-bold cursor-pointer flex items-center gap-1 text-purple-700 dark:text-purple-300">
                          <Receipt className="h-4 w-4" /> Point-of-Care Billing
                        </Label>
                      </div>
                      {generateBill && (
                        <div className="flex items-center gap-2 pr-1">
                           <Label className="text-[10px] uppercase text-purple-600 dark:text-purple-400 font-black">Fee:</Label>
                           <Input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="w-24 h-10 bg-muted/50 border-border focus-visible:ring-purple-500 rounded-xl text-right font-mono text-foreground font-bold" />
                        </div>
                      )}
                    </div>

                    <Button onClick={handleSaveConsultation} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-[0_0_20px_-5px_#9333ea] px-8 h-12 font-black uppercase tracking-widest text-xs transition-all">
                       <Save className="mr-2 h-4 w-4" /> Finish & Submit
                    </Button>
                 </div>
               </CardContent>
             </Card>
           ) : (
             <div className="h-[500px] rounded-3xl border border-white/5 bg-card/50 flex flex-col items-center justify-center text-muted-foreground backdrop-blur-xl">
                <Stethoscope className="h-16 w-16 mb-4 text-purple-500/50" />
                <p className="font-black text-muted-foreground uppercase tracking-widest">Select Patient to Begin</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
