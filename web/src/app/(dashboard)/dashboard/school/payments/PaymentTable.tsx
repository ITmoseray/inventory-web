'use client';

import React, { useState, useTransition } from 'react';
import { updatePaymentStatus } from '@/actions/schoolAdminActions';
import { CheckCircle, XCircle, Search, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentTable({ initialPayments }: { initialPayments: any[] }) {
  const [payments, setPayments] = useState(initialPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this payment as ${newStatus}?`)) return;
    
    startTransition(async () => {
      const res = await updatePaymentStatus(id, newStatus);
      if (res.success) {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        toast.success(`Payment marked as ${newStatus}`);
      } else {
        toast.error('Failed to update payment status');
      }
    });
  };

  const filteredPayments = payments.filter(p => 
    p.student?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.student?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.student?.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search payments, names, IDs..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Student</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Reference</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredPayments.length > 0 ? filteredPayments.map(payment => (
              <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {payment.student?.firstName} {payment.student?.lastName}
                  </div>
                  <div className="text-xs text-slate-500">{payment.student?.studentId}</div>
                </td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="font-medium">{payment.formType ? 'Admission Form' : 'Course Fee'}</div>
                  {payment.course && <div className="text-xs text-slate-400">{payment.course.courseName}</div>}
                </td>
                <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                  Le {Number(payment.amount).toLocaleString()}
                </td>
                <td className="p-4">
                  <div className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block text-slate-600 dark:text-slate-300">
                    {payment.paymentReference || 'N/A'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(payment.paymentDate).toLocaleDateString()}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    payment.status === 'PAID' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                    payment.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {payment.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleStatusChange(payment.id, 'PAID')}
                        disabled={isPending}
                        className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-200 text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button 
                        onClick={() => handleStatusChange(payment.id, 'REJECTED')}
                        disabled={isPending}
                        className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200 text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                  {payment.status === 'PAID' && (
                    <button className="text-slate-400 cursor-not-allowed">
                      <Receipt className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
