"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Search, MoreHorizontal, ChevronRight, Activity, Users, Calendar, TrendingUp } from "lucide-react";
import { getClinicOverviewStats } from "@/app/actions/clinic";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function ClinicOverviewPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.businessId) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    setLoading(true);
    const res = await getClinicOverviewStats(session!.user.businessId);
    if (res.success) setStats(res.data);
    setLoading(false);
  };

  const chartData = stats?.chartData || [];

  const getAvatar = (name: string, isDoctor = false) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    if (isDoctor) {
       return (
         <div className="h-10 w-10 rounded-full border-2 border-teal-500/50 overflow-hidden relative bg-muted shrink-0">
            <img src={`https://ui-avatars.com/api/?name=${initial}&background=14b8a6&color=fff&size=128`} alt={name} className="object-cover w-full h-full opacity-90" />
         </div>
       );
    }
    return (
       <div className="h-10 w-10 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden relative">
         <img src={`https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Avatar" />
       </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background text-teal-600 dark:text-teal-500 font-bold tracking-widest uppercase -m-4">
        Loading Overview...
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] p-6 sm:p-8 -m-4 bg-background text-foreground relative overflow-hidden rounded-3xl font-sans transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0f766e]/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <h1 className="text-3xl font-black text-foreground tracking-tight">Clinic Overview</h1>
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground font-medium text-sm hidden sm:block">{format(new Date(), "hh:mm a")}</p>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm dark:shadow-none">
              <Bell className="h-4 w-4 text-slate-500 dark:text-slate-300" />
            </button>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <input type="text" placeholder="Search" className="h-10 w-32 sm:w-48 pl-9 pr-4 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm shadow-sm dark:shadow-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10">
        
        <div className="xl:col-span-2 space-y-6">
          
          <div className="flex items-center gap-4 mb-2">
            <div className="h-14 w-14 rounded-full border-2 border-teal-500 p-0.5 relative overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-teal-500/20 blur-sm"></div>
              <img src={`https://ui-avatars.com/api/?name=${session?.user?.name || 'Dr'}&background=0f766e&color=fff&size=128`} className="relative rounded-full w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-[#1e2025] rounded-full z-10"></div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Welcome,</p>
              <h2 className="text-2xl font-black text-foreground">Dr. {session?.user?.name || "Sarah Okonkwo"}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-[#26282e] border-slate-200 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-lg">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground font-medium">Total Patients</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-black text-foreground">{stats?.totalPatients?.toLocaleString() || "0"}</h3>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> 8.2%
                  </span>
                </div>
                <div className="flex items-end gap-1 h-8 pt-2">
                  {[40, 60, 30, 80, 50, 70, 90, 60].map((h, i) => (
                    <div key={i} className="flex-1 bg-teal-500 rounded-sm hover:bg-teal-400 transition-colors" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#26282e] border-slate-200 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-lg">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground font-medium">Today's Appointments</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-black text-foreground">{stats?.todaysAppointments || "0"}</h3>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> 12%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#26282e] border-slate-200 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-lg flex flex-col justify-center relative overflow-hidden group">
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                 <ChevronRight className="h-5 w-5" />
               </div>
               <CardContent className="p-4">
                 <p className="text-xs text-muted-foreground font-medium mb-1">New Registrations</p>
                 <h3 className="text-2xl font-black text-foreground">{stats?.newRegistrations || "0"}</h3>
               </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#26282e] border-slate-200 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-lg flex flex-col justify-center relative overflow-hidden group">
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                 <ChevronRight className="h-5 w-5" />
               </div>
               <CardContent className="p-4">
                 <p className="text-xs text-muted-foreground font-medium mb-1">Active Cases</p>
                 <h3 className="text-2xl font-black text-foreground">{stats?.activeCases || "0"}</h3>
               </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-[#26282e] border-slate-200 dark:border-white/5 rounded-3xl shadow-sm dark:shadow-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 border-b border-slate-200 dark:border-white/5">
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">Patient Demographics</CardTitle>
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Age</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Data</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.3} />
                  <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="series1" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorTeal)" />
                  <Area type="monotone" dataKey="series2" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorAmber)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card className="bg-white dark:bg-[#26282e] border-slate-200 dark:border-white/5 rounded-3xl shadow-sm dark:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-200 dark:border-white/5">
                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">Doctor Availability</CardTitle>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-slate-700 dark:hover:text-white" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200 dark:divide-white/5">
                  {(stats?.doctors || []).map((doc: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-card/50 transition-colors">
                      <div className="flex items-center gap-3">
                         {getAvatar(doc.name, true)}
                         <div>
                           <p className="text-sm font-bold text-foreground leading-tight">{doc.name}</p>
                           <p className="text-xs text-muted-foreground">{doc.specialization || "General"}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">Available</p>
                         <p className="text-xs text-muted-foreground font-mono">{doc.points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#26282e] border-slate-200 dark:border-white/5 rounded-3xl shadow-sm dark:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-200 dark:border-white/5">
                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">Recent In</CardTitle>
                <select className="bg-slate-100 dark:bg-card/50 border border-border text-xs text-muted-foreground rounded-md px-2 py-1 outline-none">
                  <option>Data</option>
                  <option>Today</option>
                </select>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200 dark:divide-white/5">
                  {(stats?.recentAppointments || []).slice(0,3).map((apt: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-card/50 transition-colors">
                      <div className="flex items-center gap-3">
                         {getAvatar(apt.patient?.name)}
                         <div>
                           <p className="text-sm font-bold text-foreground leading-tight">{apt.patient?.name}</p>
                           <p className="text-xs text-muted-foreground">{apt.doctor?.name}</p>
                         </div>
                      </div>
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-500/10 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-500/20">
                        Check-in
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        <div className="space-y-6">
          
          <Card className="bg-white dark:bg-[#26282e] border-slate-200 dark:border-white/5 rounded-3xl shadow-sm dark:shadow-lg">
             <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">Healthcare Professionals</CardTitle>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-slate-700 dark:hover:text-white" />
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                 {(stats?.doctors || []).map((doc: any, i: number) => (
                   <div key={i} className="bg-slate-50 dark:bg-[#31343d] border border-slate-200 dark:border-white/5 p-3 rounded-2xl flex items-center justify-between group hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                         <div className="relative">
                           {getAvatar(doc.name, true)}
                           <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white dark:border-[#31343d] rounded-full z-10"></div>
                         </div>
                         <div>
                           <p className="text-sm font-bold text-foreground leading-tight flex items-center gap-1">
                             {doc.name} <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                           </p>
                           <p className="text-xs text-muted-foreground">{doc.specialization || "General"}</p>
                           <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5 bg-emerald-100 dark:bg-emerald-500/10 inline-block px-1.5 rounded">Available</p>
                         </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono self-end pb-1">{doc.points} pts today</p>
                   </div>
                 ))}
              </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#26282e] border-slate-200 dark:border-white/5 rounded-3xl shadow-sm dark:shadow-lg flex-1">
             <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">Recent Appointments</CardTitle>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-slate-700 dark:hover:text-white" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200 dark:divide-white/5">
                   {(stats?.recentAppointments || []).map((apt: any, i: number) => (
                     <div key={i} className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-card/50 transition-colors">
                        <div className="flex items-center gap-3">
                           {getAvatar(apt.patient?.name)}
                           <div>
                             <p className="text-sm font-bold text-foreground leading-tight">{apt.patient?.name}</p>
                             <p className="text-xs text-muted-foreground">{apt.doctor?.name}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-mono text-slate-600 dark:text-slate-300">{apt.time || format(new Date(apt.appointmentDate || new Date()), "hh:mm a")}</p>
                           {apt.checkin && <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-1">Check-in</p>}
                           {!apt.checkin && apt.status === 'SCHEDULED' && <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold mt-1">Details license-to details</p>}
                        </div>
                     </div>
                   ))}
                </div>
              </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
