import React from 'react';
import { getInvoices } from '@/actions/feeActions';
import { getStudents } from '@/actions/schoolAdminActions';
import FinanceClient from './FinanceClient';

export default async function PaymentsPage() {
  const [invoices, students] = await Promise.all([
    getInvoices(),
    getStudents()
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Fee Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage student invoices, track payments, and view arrears.</p>
      </div>

      <FinanceClient 
        initialInvoices={invoices} 
        students={students} 
      />
    </div>
  );
}
