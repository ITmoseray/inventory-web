'use client';

import React, { useState, useTransition } from 'react';
import { FileSignature, Receipt, CheckCircle2, Clock } from 'lucide-react';
import { generatePayslip, markPayslipPaid } from '@/actions/hrActions';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';

export default function PayrollClient({ staff, initialPayslips }: any) {
  const [isPending, startTransition] = useTransition();

  // Generate Payslip Modal
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [form, setForm] = useState({ staffId: '', month: '', baseSalary: '', deductions: '0', bonuses: '0' });

  // Handle staff selection change to auto-fill base salary
  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const staffId = e.target.value;
    const selectedStaff = staff.find((s: any) => s.id === staffId);
    setForm(prev => ({
      ...prev,
      staffId,
      baseSalary: selectedStaff ? selectedStaff.salary.toString() : ''
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await generatePayslip({
        ...form,
        baseSalary: Number(form.baseSalary),
        deductions: Number(form.deductions),
        bonuses: Number(form.bonuses)
      });
      if (res.success) {
        toast.success("Payslip generated successfully!");
        setShowGenerateForm(false);
        setForm({ staffId: '', month: '', baseSalary: '', deductions: '0', bonuses: '0' });
      } else {
        toast.error("Failed to generate payslip.");
      }
    });
  };

  const handleMarkPaid = async (id: string) => {
    startTransition(async () => {
      const res = await markPayslipPaid(id);
      if (res.success) {
        toast.success("Payslip marked as paid!");
      } else {
        toast.error("Failed to update status.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <button onClick={() => setShowGenerateForm(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <FileSignature className="w-4 h-4" /> Generate Payslip
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 pl-6 font-medium">Employee</th>
              <th className="p-4 font-medium">Month</th>
              <th className="p-4 font-medium">Base Salary</th>
              <th className="p-4 font-medium">Net Pay</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 pr-6 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {initialPayslips.map((payslip: any) => (
              <tr key={payslip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="p-4 pl-6 font-semibold">{payslip.staff.firstName} {payslip.staff.lastName}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{payslip.month}</td>
                <td className="p-4 text-slate-500">
                  {Number(payslip.baseSalary).toLocaleString(undefined, { style: 'currency', currency: 'SLL' })}
                </td>
                <td className="p-4 font-bold text-violet-600">
                  {Number(payslip.netPay).toLocaleString(undefined, { style: 'currency', currency: 'SLL' })}
                </td>
                <td className="p-4">
                  {payslip.status === 'PAID' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md"><CheckCircle2 className="w-3 h-3"/> Paid</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md"><Clock className="w-3 h-3"/> Pending</span>
                  )}
                </td>
                <td className="p-4 pr-6 text-right">
                  {payslip.status === 'PENDING' && (
                    <button 
                      onClick={() => handleMarkPaid(payslip.id)}
                      disabled={isPending}
                      className="px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-semibold hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors flex items-center justify-end gap-1 ml-auto disabled:opacity-50"
                    >
                      <Receipt className="w-4 h-4" /> Issue Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {initialPayslips.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No payslips generated yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Payslip Modal */}
      {showGenerateForm && (
        <Modal isOpen={showGenerateForm} onClose={() => setShowGenerateForm(false)} title="Generate Staff Payslip">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Staff Member</label>
              <select required value={form.staffId} onChange={handleStaffChange} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="">Select Staff...</option>
                {staff.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.role})</option>
                ))}
              </select>
            </div>
            <div><label className="text-sm font-medium">Payroll Month</label><input required placeholder="e.g. October 2026" value={form.month} onChange={e => setForm({...form, month: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            <div><label className="text-sm font-medium">Base Salary (SLL)</label><input type="number" required value={form.baseSalary} onChange={e => setForm({...form, baseSalary: e.target.value})} className="w-full mt-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Bonuses (SLL)</label><input type="number" required value={form.bonuses} onChange={e => setForm({...form, bonuses: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
              <div><label className="text-sm font-medium">Deductions (SLL)</label><input type="number" required value={form.deductions} onChange={e => setForm({...form, deductions: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mt-4 text-center">
              <span className="text-sm text-slate-500 block mb-1">Estimated Net Pay</span>
              <span className="text-2xl font-bold text-violet-600">
                {(Number(form.baseSalary) + Number(form.bonuses) - Number(form.deductions)).toLocaleString(undefined, { style: 'currency', currency: 'SLL' })}
              </span>
            </div>
            <button type="submit" disabled={isPending} className="w-full py-2 bg-violet-600 text-white rounded-lg font-semibold mt-4">{isPending ? 'Processing...' : 'Generate Payslip'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
