import React from 'react';
import { getTerms } from '@/actions/academicActions';
import { getCourses } from '@/actions/schoolAdminActions';
import AcademicsClient from './AcademicsClient';

export default async function AcademicsPage() {
  const [terms, courses] = await Promise.all([
    getTerms(),
    getCourses()
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Academic Records</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage terms, enter grades, and generate student report cards.</p>
      </div>

      <AcademicsClient 
        initialTerms={terms} 
        courses={courses} 
      />
    </div>
  );
}
