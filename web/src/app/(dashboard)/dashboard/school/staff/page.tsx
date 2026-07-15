import React from 'react';
import { getStaff } from '@/actions/hrActions';
import StaffClient from './StaffClient';

export default async function StaffPage() {
  const staffMembers = await getStaff();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Staff & HR Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage teachers, administrators, and process leave requests.</p>
      </div>

      <StaffClient initialStaff={staffMembers} />
    </div>
  );
}
