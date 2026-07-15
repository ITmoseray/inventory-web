'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { markAttendance } from '@/actions/schoolAdminActions';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendanceManager({
  students,
  courses,
  existingRecords,
  initialDate,
  initialCourseId
}: {
  students: any[];
  courses: any[];
  existingRecords: any[];
  initialDate: string;
  initialCourseId: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [courseId, setCourseId] = useState(initialCourseId);
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (newDate: string, newCourseId: string) => {
    setDate(newDate);
    setCourseId(newCourseId);
    router.push(`/dashboard/school/attendance?date=${newDate}&courseId=${newCourseId}`);
  };

  const handleMark = (studentId: string, status: string) => {
    if (!courseId) {
      toast.error('Please select a course first');
      return;
    }

    startTransition(async () => {
      const res = await markAttendance(studentId, courseId, date, status);
      if (res.success) {
        toast.success(`Marked as ${status}`);
      } else {
        toast.error('Failed to mark attendance');
      }
    });
  };

  // Helper to find current status
  const getStatus = (studentId: string) => {
    const record = existingRecords.find(r => r.studentId === studentId && r.courseId === courseId);
    return record?.status || null;
  };

  return (
    <div>
      {/* Top Filters */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Date</label>
          <input 
            type="date" 
            value={date}
            onChange={e => handleFilterChange(e.target.value, courseId)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Course</label>
          <select 
            value={courseId}
            onChange={e => handleFilterChange(date, e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white"
          >
            <option value="">-- Choose a Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.courseCode} - {course.courseName}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Attendance Grid */}
      <div className="overflow-x-auto">
        {!courseId ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <AlertCircle className="w-12 h-12 mb-4 text-slate-400" />
            <p>Please select a course to start marking attendance for {date}.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Student Name</th>
                <th className="p-4 font-medium">Student ID</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Mark As</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {students.length > 0 ? students.map(student => {
                const status = getStatus(student.id);
                return (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-500">
                      {student.studentId}
                    </td>
                    <td className="p-4 text-center">
                      {status ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          status === 'PRESENT' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          status === 'ABSENT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {status}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Not marked</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleMark(student.id, 'PRESENT')}
                          disabled={isPending || status === 'PRESENT'}
                          className={`p-2 rounded-lg transition-colors border ${
                            status === 'PRESENT' ? 'bg-green-500 text-white border-green-500 opacity-50 cursor-not-allowed' : 
                            'bg-white text-green-600 border-green-200 hover:bg-green-50 dark:bg-slate-950 dark:border-green-900/50 dark:hover:bg-green-900/20'
                          }`}
                          title="Present"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMark(student.id, 'LATE')}
                          disabled={isPending || status === 'LATE'}
                          className={`p-2 rounded-lg transition-colors border ${
                            status === 'LATE' ? 'bg-amber-500 text-white border-amber-500 opacity-50 cursor-not-allowed' : 
                            'bg-white text-amber-600 border-amber-200 hover:bg-amber-50 dark:bg-slate-950 dark:border-amber-900/50 dark:hover:bg-amber-900/20'
                          }`}
                          title="Late"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMark(student.id, 'ABSENT')}
                          disabled={isPending || status === 'ABSENT'}
                          className={`p-2 rounded-lg transition-colors border ${
                            status === 'ABSENT' ? 'bg-red-500 text-white border-red-500 opacity-50 cursor-not-allowed' : 
                            'bg-white text-red-600 border-red-200 hover:bg-red-50 dark:bg-slate-950 dark:border-red-900/50 dark:hover:bg-red-900/20'
                          }`}
                          title="Absent"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No active students available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
