"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, Users, Plus, Search, CalendarDays } from "lucide-react";
import { getAppointments, updateAppointmentStatus } from "@/app/actions/clinic";

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.businessId) {
      fetchAppointments();
    }
  }, [session]);

  const fetchAppointments = async () => {
    setLoading(true);
    const res = await getAppointments(session!.user.businessId);
    if (res.success) {
      setAppointments(res.data || []);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await updateAppointmentStatus(id, status);
    if (res.success) {
      fetchAppointments();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Appointments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage patient schedules and doctor availability</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20">
          <Plus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="h-5 w-5 text-indigo-600" /> Today's Schedule
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search patient..." className="pl-9 rounded-xl bg-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                   <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                     <Calendar className="h-8 w-8 text-slate-400" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-1">No appointments found</h3>
                   <p className="text-sm text-slate-500 max-w-sm">There are no appointments scheduled for today. Click the button above to create one.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold">
                          <span className="text-xs">{new Date(apt.appointmentDate).getHours()}:{new Date(apt.appointmentDate).getMinutes().toString().padStart(2, '0')}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{apt.patient?.name || "Unknown Patient"}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3" /> Dr. {apt.doctor?.name || "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                          apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                          apt.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {apt.status}
                        </span>
                        {apt.status === 'SCHEDULED' && (
                          <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs" onClick={() => handleStatusUpdate(apt.id, 'IN_PROGRESS')}>
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
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-slate-500 font-black">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-900">{appointments.length}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Today</p>
                 </div>
               </div>
               <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-900">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
