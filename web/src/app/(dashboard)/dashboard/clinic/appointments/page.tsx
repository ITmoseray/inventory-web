"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, Users, Plus, Search, CalendarDays } from "lucide-react";
import { getAppointments, updateAppointmentStatus, createAppointment } from "@/app/actions/clinic";
import { getPatients } from "@/lib/actions/patient";
import { getUsers } from "@/lib/actions/user";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ patientId: "", doctorId: "", appointmentDate: "", time: "", reason: "" });

  useEffect(() => {
    if (session?.user?.businessId) {
      fetchAppointments();
      fetchFormData();
    }
  }, [session]);

  const fetchFormData = async () => {
    try {
      const results = await Promise.allSettled([getPatients(), getUsers()]);
      const patientsRes = results[0].status === 'fulfilled' ? results[0].value : [];
      const usersRes = results[1].status === 'fulfilled' ? results[1].value : [];
      setPatients(Array.isArray(patientsRes?.data) ? patientsRes.data : []);
      setDoctors(Array.isArray(usersRes?.data) ? usersRes.data : []);
    } catch (e) {
      console.error("fetchFormData error:", e);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    const res = await getAppointments(session!.user.businessId);
    if (res.success) {
      setAppointments(res.data || []);
    }
    setLoading(false);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.time) return toast.error("Please fill all required fields");
    try {
      const dateTime = new Date(`${formData.appointmentDate}T${formData.time}`);
      const res = await createAppointment({
        patientId: formData.patientId, doctorId: formData.doctorId, appointmentDate: dateTime, reason: formData.reason, businessId: session!.user.businessId,
      });
      if (res.success) {
        toast.success("Appointment created successfully");
        setIsDialogOpen(false);
        setFormData({ patientId: "", doctorId: "", appointmentDate: "", time: "", reason: "" });
        fetchAppointments();
      } else toast.error(res.message || "Failed to create appointment");
    } catch (error: any) { toast.error(error.message); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await updateAppointmentStatus(id, status);
    if (res.success) fetchAppointments();
  };

  const filteredAppointments = appointments.filter(apt => apt.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Abstract Avatar Generator
  const getAvatar = (name: string, isDoctor = false) => {
     const initial = name ? name.charAt(0).toUpperCase() : '?';
     if (isDoctor) {
        return (
          <div className="h-10 w-10 rounded-full border-2 border-brand-500/50 overflow-hidden relative bg-slate-800 shrink-0 shadow-[0_0_15px_-3px_#14b8a6]">
             <img src={`https://ui-avatars.com/api/?name=${initial}&background=14b8a6&color=fff&size=128`} alt={name} className="object-cover w-full h-full opacity-90" />
          </div>
        );
     }
     return (
        <div className="h-12 w-12 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 flex items-center justify-center font-black text-lg shrink-0">
          {initial}
        </div>
     );
  };

  return (
    <div className="space-y-6 min-h-[80vh] p-4 -m-4 bg-slate-950 text-slate-50 relative overflow-hidden rounded-3xl">
      {/* Decorative Glow Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-500 tracking-tight">Appointments</h1>
          <p className="text-sm text-slate-400 mt-1">Manage patient schedules and doctor availability</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-[0_0_20px_-5px_#14b8a6] transition-all px-6">
          <Plus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="md:col-span-2 space-y-4">
          <Card className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/10 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <CalendarDays className="h-5 w-5 text-brand-400" /> Today's Schedule
                </CardTitle>
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patient..." 
                    className="pl-9 rounded-full bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-brand-500 w-full" 
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading appointments...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                   <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                     <Search className="h-8 w-8 text-slate-500" />
                   </div>
                   <h3 className="text-lg font-bold text-white mb-1">No matches found</h3>
                   <p className="text-sm text-slate-400 max-w-sm">No appointments found matching your search query.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredAppointments.map((apt) => (
                    <div key={apt.id} className="p-5 hover:bg-white/5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-transparent hover:border-brand-500 group">
                      <div className="flex items-center gap-4">
                        {getAvatar(apt.patient?.name)}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-white truncate text-base">{apt.patient?.name || "Unknown Patient"}</p>
                          <div className="flex items-center gap-2 mt-1">
                             {getAvatar(apt.doctor?.name, true)}
                             <p className="text-xs text-slate-400 truncate font-medium">Dr. {apt.doctor?.name || "Unassigned"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-black text-brand-400 font-mono">{new Date(apt.appointmentDate).getHours()}:{new Date(apt.appointmentDate).getMinutes().toString().padStart(2, '0')}</p>
                        </div>
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                          apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                          apt.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          'bg-brand-500/10 text-brand-400 border-brand-500/30'
                        }`}>
                          {apt.status}
                        </span>
                        {apt.status === 'SCHEDULED' && (
                          <Button size="sm" className="rounded-full h-8 text-xs shrink-0 bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white border border-brand-500/50" onClick={() => handleStatusUpdate(apt.id, 'IN_PROGRESS')}>
                            Check In
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl sticky top-24">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-slate-400 font-black">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-4 shadow-inner">
                 <div className="h-12 w-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                    <Users className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-3xl font-black text-white">{appointments.length}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Today</p>
                 </div>
               </div>
               <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-4 shadow-inner">
                 <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Clock className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-3xl font-black text-white">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md border border-white/10 bg-slate-900/95 backdrop-blur-2xl text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-white">New Appointment</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Schedule a patient visit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Select Patient *</Label>
              <Select value={formData.patientId} onValueChange={v => setFormData({ ...formData, patientId: v })}>
                <SelectTrigger className="rounded-xl bg-black/40 border-white/10 text-white h-12">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-800 bg-slate-900 text-white">
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Select Doctor *</Label>
              <Select value={formData.doctorId} onValueChange={v => setFormData({ ...formData, doctorId: v })}>
                <SelectTrigger className="rounded-xl bg-black/40 border-white/10 text-white h-12">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-800 bg-slate-900 text-white">
                  {doctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Date *</Label>
                 <Input type="date" required value={formData.appointmentDate} onChange={e => setFormData({ ...formData, appointmentDate: e.target.value })} className="rounded-xl h-12 bg-black/40 border-white/10 text-white [color-scheme:dark]" />
               </div>
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Time *</Label>
                 <Input type="time" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="rounded-xl h-12 bg-black/40 border-white/10 text-white [color-scheme:dark]" />
               </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Reason for Visit</Label>
              <Input value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="e.g. Regular Checkup" className="rounded-xl h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-500" />
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-full h-12 px-6 text-slate-400 hover:bg-white/5 hover:text-white">Cancel</Button>
              <Button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white rounded-full h-12 px-8 font-black shadow-[0_0_20px_-5px_#14b8a6]">
                Schedule
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
