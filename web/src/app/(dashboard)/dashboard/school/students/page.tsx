import React from 'react';
import { getStudents } from '@/actions/schoolAdminActions';
import StudentTable from './StudentTable';

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Student Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage admissions, view profiles, and update enrollment statuses.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <StudentTable initialStudents={students} />
      </div>
    </div>
  );
}
