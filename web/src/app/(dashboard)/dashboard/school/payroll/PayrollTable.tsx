'use client';

import React, { useState } from 'react';
import { Search, Info, Plus } from 'lucide-react';

export default function PayrollTable({ initialPayrolls }: { initialPayrolls: any[] }) {
  const [payrolls] = useState(initialPayrolls);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayrolls = payrolls.filter(p => 
    p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search staff..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
        <button 
          onClick={() => alert("Please manage staff creation in the global Settings > Staff module. This view is read-only for school admins.")}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-sm font-medium rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Payroll Record
        </button>
      </div>

      <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
        <Info className="w-5 h-5 shrink-0" />
        <p>This is a unified view. Staff, Roles, and Payroll generation are managed globally through the standard Inventory/Business platform settings for this tenant.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Staff Member</th>
              <th className="p-4 font-medium">Period</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Method</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredPayrolls.length > 0 ? filteredPayrolls.map(payroll => (
              <tr key={payroll.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {payroll.user?.name || 'Unknown'}
                  </div>
                  <div className="text-xs text-slate-500">{payroll.user?.email || 'N/A'}</div>
                </td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                  {new Date(payroll.periodStart).toLocaleDateString()} - {new Date(payroll.periodEnd).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                  Le {Number(payroll.amount).toLocaleString()}
                </td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                  {payroll.paymentMethod || 'Not specified'}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    payroll.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200' :
                    payroll.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    {payroll.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No payroll records found for this institution.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
