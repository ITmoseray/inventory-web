import React from 'react';
import { getStaffPayroll } from '@/actions/schoolAdminActions';
import PayrollTable from './PayrollTable';

export default async function PayrollPage() {
  const payrolls = await getStaffPayroll();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Payroll</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage salaries and payments for lecturers and administrative staff.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <PayrollTable initialPayrolls={payrolls} />
      </div>
    </div>
  );
}
