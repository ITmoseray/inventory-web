import React from 'react';
import { getHostels } from '@/actions/hostelActions';
import { getStudents } from '@/actions/schoolAdminActions';
import HostelClient from './HostelClient';

export default async function HostelPage() {
  const [hostels, students] = await Promise.all([
    getHostels(),
    getStudents()
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Hostel & Accommodations</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage boarding houses, room capacities, and bed allocations.</p>
      </div>

      <HostelClient 
        initialHostels={hostels} 
        students={students} 
      />
    </div>
  );
}
