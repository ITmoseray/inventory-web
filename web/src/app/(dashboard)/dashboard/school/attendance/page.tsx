import React from 'react';
import { getStudents, getCourses, getAttendanceByDate } from '@/actions/schoolAdminActions';
import AttendanceManager from './AttendanceManager';

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { date?: string; courseId?: string };
}) {
  const dateStr = searchParams.date || new Date().toISOString().split('T')[0];
  const courseId = searchParams.courseId || '';
  
  // Fetch active students to mark attendance for
  const students = await getStudents();
  const activeStudents = students.filter(s => s.status === 'ACTIVE');
  
  const courses = await getCourses();
  
  // Fetch today's records
  const attendanceRecords = await getAttendanceByDate(dateStr);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Attendance</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Log and monitor student attendance across active courses.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <AttendanceManager 
          students={activeStudents} 
          courses={courses} 
          existingRecords={attendanceRecords} 
          initialDate={dateStr}
          initialCourseId={courseId}
        />
      </div>
    </div>
  );
}
