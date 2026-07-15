'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { getAttendanceForCourse, saveAttendanceBatch } from '@/actions/attendanceActions';
import { Loader2, User, Check, X, Clock, Calendar, Users, Save } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AttendanceClient({ initialCourses }: { initialCourses: any[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourses[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoster = async () => {
    if (!selectedCourseId) return;
    setIsLoading(true);
    const res = await getAttendanceForCourse(selectedCourseId, selectedDate);
    if (res.success) {
      setRoster(res.roster);
      if (res.roster.length === 0) {
        toast.info("No students enrolled in this class.");
      }
    } else {
      toast.error(res.error || "Failed to load roster");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchRoster();
    }
  }, [selectedCourseId, selectedDate]);

  const handleStatusChange = (studentId: string, status: string) => {
    setRoster(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));
  };

  const handleSave = async () => {
    if (!selectedCourseId || roster.length === 0) return;
    
    startTransition(async () => {
      const recordsToSave = roster.map(r => ({ studentId: r.studentId, status: r.status }));
      const res = await saveAttendanceBatch(selectedCourseId, selectedDate, recordsToSave);
      if (res.success) {
        toast.success("Attendance saved successfully!");
      } else {
        toast.error("Failed to save attendance.");
      }
    });
  };

  const stats = {
    present: roster.filter(s => s.status === 'PRESENT').length,
    absent: roster.filter(s => s.status === 'ABSENT').length,
    late: roster.filter(s => s.status === 'LATE').length,
    total: roster.length
  };

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Users className="w-4 h-4" /> Select Class / Cohort
          </label>
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
          >
            {initialCourses.length === 0 && <option value="">No classes available</option>}
            {initialCourses.map(c => (
              <option key={c.id} value={c.id}>{c.courseName} ({c.courseCode})</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Select Date
          </label>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
      </div>

      {/* Roster Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Header Stats */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-sm font-semibold">
              <Check className="w-4 h-4" /> {stats.present} Present
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg text-sm font-semibold">
              <X className="w-4 h-4" /> {stats.absent} Absent
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-sm font-semibold">
              <Clock className="w-4 h-4" /> {stats.late} Late
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isPending || roster.length === 0}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isPending ? 'Saving...' : 'Save Attendance Record'}
          </button>
        </div>

        {/* Student List */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-4" />
              <p>Loading class roster...</p>
            </div>
          ) : roster.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
              <p>No students enrolled in this class yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium pl-6">Student</th>
                  <th className="p-4 font-medium">ID Code</th>
                  <th className="p-4 font-medium text-right pr-6">Status Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {roster.map(student => (
                  <tr key={student.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative">
                          {student.photoPath ? (
                            <Image src={student.photoPath} alt={student.studentName} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white">{student.studentName}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-slate-500 dark:text-slate-400">{student.studentCode}</span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                        <button
                          onClick={() => handleStatusChange(student.studentId, 'PRESENT')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            student.status === 'PRESENT' 
                              ? 'bg-emerald-500 text-white shadow-md' 
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" /> Present
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.studentId, 'ABSENT')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            student.status === 'ABSENT' 
                              ? 'bg-rose-500 text-white shadow-md' 
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" /> Absent
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.studentId, 'LATE')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            student.status === 'LATE' 
                              ? 'bg-amber-500 text-white shadow-md' 
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" /> Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
