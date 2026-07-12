"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, ChevronLeft, ChevronRight, Download, MoreHorizontal, Info, Clock, CalendarDays, CheckCircle2 } from "lucide-react";
import { getAppointments, updateAppointmentStatus, createAppointment } from "@/app/actions/clinic";
import { getPatients } from "@/lib/actions/patient";
import { getUsers } from "@/lib/actions/user";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from "date-fns";

export default function SmartSchedulingPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ patientId: "", doctorId: "", appointmentDate: "", time: "", reason: "" });
  
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (session?.user?.businessId) {
      fetchAppointments();
      fetchFormData();
    }
  }, [session, currentDate]);

  const fetchFormData = async () => {
    try {
      const results = await Promise.allSettled([getPatients(), getUsers()]);
      const patientsRes = results[0].status === 'fulfilled' ? results[0].value : [];
      const usersRes = results[1].status === 'fulfilled' ? results[1].value : [];
      setPatients(Array.isArray(patientsRes?.data) ? patientsRes.data : []);
      // Filter out non-doctors if needed, but for now just use users as doctors
      setDoctors(Array.isArray(usersRes?.data) ? usersRes.data : []);
    } catch (e) {
      console.error("fetchFormData error:", e);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const res = await getAppointments(session!.user.businessId, dateStr);
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

  // --- Grid Settings ---
  const START_HOUR = 8; // 8 AM
  const END_HOUR = 17; // 5 PM
  const PIXELS_PER_HOUR = 120;
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

  const getAvatar = (name: string, isDoctor = false) => {
     const initial = name ? name.charAt(0).toUpperCase() : '?';
     if (isDoctor) {
        return (
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-brand-500/50 overflow-hidden relative bg-muted shrink-0">
             <img src={`https://ui-avatars.com/api/?name=${initial}&background=14b8a6&color=fff&size=128`} alt={name} className="object-cover w-full h-full opacity-90" />
          </div>
        );
     }
     return (
        <div className="h-8 w-8 rounded-full bg-muted/80 border border-border text-muted-foreground flex items-center justify-center font-black text-xs shrink-0">
          {initial}
        </div>
     );
  };

  // --- Mini Calendar Logic ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = monthStart; 
  const daysInMonth = eachDayOfInterval({ start: startDate, end: monthEnd });
  // Add padding for start of month
  const startPadding = Array.from({ length: getDay(monthStart) }).map((_, i) => i);

  // Group appointments by doctor
  // Using `doctors` array for columns, but only doctors who actually have appointments or just show all of them.
  // The mockup shows specific doctors as columns. Let's just use the fetched doctors (max 4 for display, or scroll).
  const displayDoctors = doctors.slice(0, 4); 

  const renderAppointmentCard = (apt: any) => {
    const aptDate = new Date(apt.appointmentDate);
    const hour = aptDate.getHours();
    const minute = aptDate.getMinutes();
    
    // Calculate positioning
    if (hour < START_HOUR || hour > END_HOUR) return null; // Outside grid
    
    const topPosition = ((hour - START_HOUR) * PIXELS_PER_HOUR) + ((minute / 60) * PIXELS_PER_HOUR);
    
    // Duration - Assuming 30 mins default if not specified
    // In our DB schema we didn't add duration, so we hardcode 45m or 30m for display
    const durationMinutes = 45; // Simulated 45 minutes
    const height = (durationMinutes / 60) * PIXELS_PER_HOUR;

    // Status colors matching mockup (glassy blue/teal)
    const isCompleted = apt.status === 'COMPLETED';
    const isInProgress = apt.status === 'IN_PROGRESS';

    let cardStyle = "bg-slate-800/80 dark:bg-[#1a2332] border-brand-500/30 text-white"; // Default (Scheduled)
    if (isCompleted) cardStyle = "bg-emerald-900/80 dark:bg-[#112a22] border-emerald-500/30 text-emerald-50";
    if (isInProgress) cardStyle = "bg-brand-900/80 dark:bg-[#102a30] border-brand-500/50 text-brand-50";

    return (
      <div 
        key={apt.id} 
        className={`absolute left-2 right-4 rounded-xl border p-3 flex flex-col justify-between shadow-lg overflow-hidden transition-all hover:ring-2 hover:ring-brand-500/50 z-10 ${cardStyle}`}
        style={{ top: `${topPosition}px`, height: `${height}px` }}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-sm truncate leading-tight">{format(aptDate, 'HH:mm')}</p>
            <p className="font-black text-sm truncate max-w-[120px] sm:max-w-[160px]">{apt.patient?.name || "Unknown Patient"}</p>
          </div>
          <button className="text-white/50 hover:text-white">
            <Info className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-white/70 truncate flex items-center gap-1">
             <Clock className="h-3 w-3" /> {durationMinutes}m
          </p>
          {apt.status === 'SCHEDULED' ? (
             <button onClick={() => handleStatusUpdate(apt.id, 'IN_PROGRESS')} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 hover:bg-brand-500 hover:text-white transition-colors border border-brand-500/30">
               Check-in
             </button>
          ) : (
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCompleted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'}`}>
               {apt.status === 'IN_PROGRESS' ? 'Active' : apt.status}
             </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[85vh] p-4 sm:p-6 -m-4 bg-background text-foreground relative flex flex-col font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Appointments & Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">Effortlessly manage patient visits and daily calendars.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 rounded-full bg-muted/50 border-border h-10 w-64" />
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-[0_0_20px_-5px_#14b8a6] transition-all px-6 h-10">
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 h-[calc(100vh-200px)] overflow-hidden">
        
        {/* Left Sidebar: Mini Calendar & Filters */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
           {/* Mini Calendar Card */}
           <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-sm">{format(currentDate, 'MMMM yyyy')}</h3>
               <div className="flex gap-1">
                 <button onClick={() => setCurrentDate(subDays(currentDate, 30))} className="p-1 hover:bg-muted rounded-md"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                 <button onClick={() => setCurrentDate(addDays(currentDate, 30))} className="p-1 hover:bg-muted rounded-md"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
               </div>
             </div>
             
             {/* Days of week header */}
             <div className="grid grid-cols-7 gap-1 mb-2">
               {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                 <div key={d} className="text-center text-[10px] font-bold text-muted-foreground">{d}</div>
               ))}
             </div>
             
             {/* Calendar Grid */}
             <div className="grid grid-cols-7 gap-1">
               {startPadding.map(i => <div key={`pad-${i}`} />)}
               {daysInMonth.map((day, i) => {
                 const isSelected = isSameDay(day, currentDate);
                 return (
                   <button 
                     key={i} 
                     onClick={() => setCurrentDate(day)}
                     className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${isSelected ? 'bg-brand-500 text-white font-bold shadow-md' : 'hover:bg-muted text-foreground'}`}
                   >
                     {format(day, 'd')}
                   </button>
                 )
               })}
             </div>
           </div>

           {/* Staff Availability */}
           <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex-1">
             <h3 className="font-bold text-sm mb-4">Staff Availability</h3>
             <div className="space-y-4">
               {displayDoctors.map((doc, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <p className="text-xs font-medium truncate pr-2">{doc.name}</p>
                   <div className="flex gap-1">
                     <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                     <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                     <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                   </div>
                 </div>
               ))}
               {displayDoctors.length === 0 && <p className="text-xs text-muted-foreground">No staff found.</p>}
             </div>
           </div>
        </div>

        {/* Main Schedule Grid Area */}
        <div className="flex-1 bg-card border border-border rounded-3xl overflow-hidden flex flex-col shadow-sm">
          
          {/* Grid Toolbar */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-1.5 hover:bg-muted rounded-md border border-border bg-card"><ChevronLeft className="h-4 w-4" /></button>
              <h2 className="text-base sm:text-lg font-bold">Daily Schedule <span className="text-muted-foreground font-normal ml-1">({format(currentDate, 'MMMM d, yyyy')})</span></h2>
              <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-1.5 hover:bg-muted rounded-md border border-border bg-card"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-2 hidden sm:flex">
              <Button variant="outline" size="sm" className="rounded-full border-border bg-card text-xs h-9">
                <Download className="h-3 w-3 mr-2" /> Export
              </Button>
            </div>
          </div>

          {/* Grid Layout (Scrollable Y-axis, possibly X-axis) */}
          <div className="flex-1 overflow-auto bg-card relative">
            <div className="min-w-[800px] flex h-full relative pb-10">
              
              {/* Time Labels Column */}
              <div className="w-20 shrink-0 border-r border-border bg-card/95 sticky left-0 z-20">
                <div className="h-20 border-b border-border"></div> {/* Empty corner cell */}
                {hours.map((hour) => (
                  <div key={hour} className="relative" style={{ height: `${PIXELS_PER_HOUR}px` }}>
                    <span className="absolute -top-3 left-0 w-full text-center text-xs font-bold text-muted-foreground">
                      {hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Doctors Columns */}
              {displayDoctors.map((doc, docIndex) => {
                const docAppointments = appointments.filter(a => a.doctorId === doc.id);
                
                return (
                  <div key={doc.id} className="flex-1 border-r border-border relative min-w-[200px]">
                    {/* Doctor Header */}
                    <div className="h-20 border-b border-border sticky top-0 bg-card/95 z-30 flex items-center justify-center flex-col p-2">
                      <div className="flex items-center gap-2">
                         {getAvatar(doc.name, true)}
                         <div className="min-w-0">
                           <p className="font-bold text-sm text-foreground truncate">{doc.name}</p>
                           <p className="text-[10px] text-muted-foreground truncate">{doc.specialization || "General Medicine"}</p>
                         </div>
                      </div>
                    </div>

                    {/* Time Grid Lines & Appointments Container */}
                    <div className="relative w-full" style={{ height: `${hours.length * PIXELS_PER_HOUR}px` }}>
                       {/* Horizontal Lines */}
                       {hours.map((hour) => (
                         <div key={hour} className="absolute w-full border-t border-border/50" style={{ top: `${(hour - START_HOUR) * PIXELS_PER_HOUR}px` }}></div>
                       ))}
                       {/* Half-hour Lines */}
                       {hours.map((hour) => (
                         <div key={`half-${hour}`} className="absolute w-full border-t border-border/30 border-dashed" style={{ top: `${(hour - START_HOUR) * PIXELS_PER_HOUR + (PIXELS_PER_HOUR/2)}px` }}></div>
                       ))}

                       {/* Render Appointments */}
                       {docAppointments.map(apt => renderAppointmentCard(apt))}
                    </div>
                  </div>
                )
              })}
              
              {/* Fallback if no doctors */}
              {displayDoctors.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  No doctors available. Add doctors to the system to manage schedule.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md border border-border bg-card/95 backdrop-blur-2xl text-foreground rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-foreground">New Appointment</DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Schedule a patient visit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Select Patient *</Label>
              <Select value={formData.patientId} onValueChange={v => setFormData({ ...formData, patientId: v })}>
                <SelectTrigger className="rounded-xl bg-muted/50 border-border text-foreground h-12">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card text-foreground">
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Select Doctor *</Label>
              <Select value={formData.doctorId} onValueChange={v => setFormData({ ...formData, doctorId: v })}>
                <SelectTrigger className="rounded-xl bg-muted/50 border-border text-foreground h-12">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card text-foreground">
                  {doctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Date *</Label>
                 <Input type="date" required value={formData.appointmentDate} onChange={e => setFormData({ ...formData, appointmentDate: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border text-foreground " />
               </div>
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Time *</Label>
                 <Input type="time" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border text-foreground " />
               </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Reason for Visit</Label>
              <Input value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="e.g. Regular Checkup" className="rounded-xl h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-full h-12 px-6 text-muted-foreground hover:bg-card/50 hover:text-foreground">Cancel</Button>
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
