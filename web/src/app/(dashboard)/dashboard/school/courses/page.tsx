import React from 'react';
import { getCourses } from '@/actions/schoolAdminActions';
import CourseTable from './CourseTable';

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Course Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Create new academic programs, edit fees, and manage the curriculum.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <CourseTable initialCourses={courses} />
      </div>
    </div>
  );
}
