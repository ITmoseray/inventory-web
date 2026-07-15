import React from 'react';
import { getLibraryBooks, getCheckouts } from '@/actions/libraryActions';
import { getStudents } from '@/actions/schoolAdminActions';
import LibraryClient from './LibraryClient';

export default async function LibraryPage() {
  const [books, checkouts, students] = await Promise.all([
    getLibraryBooks(),
    getCheckouts(),
    getStudents()
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Library Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your institution's book inventory and student checkouts.</p>
      </div>

      <LibraryClient 
        initialBooks={books} 
        initialCheckouts={checkouts} 
        students={students} 
      />
    </div>
  );
}
