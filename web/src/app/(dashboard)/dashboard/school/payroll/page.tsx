import React from 'react';
import { getStaff, getPayslips } from '@/actions/hrActions';
import PayrollClient from './PayrollClient';

export default async function PayrollPage() {
  const [staff, payslips] = await Promise.all([
    getStaff(),
    getPayslips()
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Payroll</h1>
        <p className="text-slate-500 dark:text-slate-400">Generate payslips, process salaries, and track deductions.</p>
      </div>

      <PayrollClient staff={staff} initialPayslips={payslips} />
    </div>
  );
}
