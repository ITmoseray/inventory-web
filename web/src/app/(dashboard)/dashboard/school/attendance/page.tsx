import { getCoursesList } from '@/actions/attendanceActions';
import AttendanceClient from './AttendanceClient';

export default async function AttendancePage() {
  const { courses } = await getCoursesList();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Attendance Tracking</h1>
        <p className="text-slate-500 dark:text-slate-400">Record daily attendance for your classes and cohorts.</p>
      </div>

      <AttendanceClient initialCourses={courses || []} />
    </div>
  );
}
