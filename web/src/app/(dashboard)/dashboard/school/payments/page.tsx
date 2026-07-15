import React from 'react';
import { getPayments } from '@/actions/schoolAdminActions';
import PaymentTable from './PaymentTable';

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Payments & Financials</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage student admissions and course tuition payments.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <PaymentTable initialPayments={payments} />
      </div>
    </div>
  );
}
