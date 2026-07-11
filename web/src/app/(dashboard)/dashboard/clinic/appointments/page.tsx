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
      const [patientsRes, usersRes] = await Promise.all([
        getPatients(),
        getUsers()
      ]);
      setPatients(Array.isArray(patientsRes) ? patientsRes : []);
      setDoctors(Array.isArray(usersRes) ? usersRes : []);
    } catch (e) {
      console.error(e);
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
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.time) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const dateTime = new Date(`${formData.appointmentDate}T${formData.time}`);
      const res = await createAppointment({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDate: dateTime,
        reason: formData.reason,
        businessId: session!.user.businessId,
      });
      if (res.success) {
        toast.success("Appointment created successfully");
        setIsDialogOpen(false);
        setFormData({ patientId: "", doctorId: "", appointmentDate: "", time: "", reason: "" });
        fetchAppointments();
      } else {
        toast.error(res.message || "Failed to create appointment");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await updateAppointmentStatus(id, status);
    if (res.success) {
      fetchAppointments();
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    apt.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Appointments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage patient schedules and doctor availability</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20">
          <Plus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden dark:bg-slate-900">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-lg shrink-0">
                  <CalendarDays className="h-5 w-5 text-indigo-600" /> Today's Schedule
                </CardTitle>
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patient..." 
                    className="pl-9 rounded-xl bg-white dark:bg-slate-950 dark:border-slate-800 w-full" 
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading appointments...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                   <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                     <Search className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No matches found</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">No appointments found matching your search query.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center font-bold shrink-0">
                          <span className="text-xs">{new Date(apt.appointmentDate).getHours()}:{new Date(apt.appointmentDate).getMinutes().toString().padStart(2, '0')}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{apt.patient?.name || "Unknown Patient"}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <User className="h-3 w-3 shrink-0" /> Dr. {apt.doctor?.name || "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                          apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          apt.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                        }`}>
                          {apt.status}
                        </span>
                        {apt.status === 'SCHEDULED' && (
                          <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs shrink-0" onClick={() => handleStatusUpdate(apt.id, 'IN_PROGRESS')}>
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
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-slate-500 font-black">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{appointments.length}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Today</p>
                 </div>
               </div>
               <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">New Appointment</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Schedule a patient visit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Select Patient *</Label>
              <Select value={formData.patientId} onValueChange={v => setFormData({ ...formData, patientId: v })}>
                <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 h-12">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800">
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Select Doctor *</Label>
              <Select value={formData.doctorId} onValueChange={v => setFormData({ ...formData, doctorId: v })}>
                <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 h-12">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800">
                  {doctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Date *</Label>
                 <Input type="date" required value={formData.appointmentDate} onChange={e => setFormData({ ...formData, appointmentDate: e.target.value })} className="rounded-xl h-12" />
               </div>
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Time *</Label>
                 <Input type="time" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="rounded-xl h-12" />
               </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Reason for Visit</Label>
              <Input value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="e.g. Regular Checkup" className="rounded-xl h-12" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 px-6">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
