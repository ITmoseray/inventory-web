'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Receipt, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { createInvoice, logPayment } from '@/actions/feeActions';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';

export default function FinanceClient({ initialInvoices, students }: any) {
  const [isPending, startTransition] = useTransition();

  // Invoice Modal State
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ studentId: '', title: '', description: '', totalAmount: '', dueDate: '' });

  // Payment Modal State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ invoiceId: '', studentId: '', amount: '', paymentMethod: 'CASH' });

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createInvoice({
        ...invoiceForm,
        totalAmount: Number(invoiceForm.totalAmount)
      });
      if (res.success) {
        toast.success("Invoice created successfully!");
        setShowInvoiceForm(false);
        setInvoiceForm({ studentId: '', title: '', description: '', totalAmount: '', dueDate: '' });
      } else {
        toast.error("Failed to create invoice.");
      }
    });
  };

  const handleLogPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await logPayment({
        ...paymentForm,
        amount: Number(paymentForm.amount)
      });
      if (res.success) {
        toast.success("Payment logged successfully!");
        setShowPaymentForm(false);
        setPaymentForm({ invoiceId: '', studentId: '', amount: '', paymentMethod: 'CASH' });
      } else {
        toast.error("Failed to log payment.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <button onClick={() => setShowInvoiceForm(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <FileText className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 pl-6 font-medium">Student</th>
              <th className="p-4 font-medium">Invoice Title</th>
              <th className="p-4 font-medium">Total Amount</th>
              <th className="p-4 font-medium">Arrears (Due)</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 pr-6 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {initialInvoices.map((invoice: any) => {
              const totalAmount = Number(invoice.totalAmount);
              const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
              const arrears = totalAmount - totalPaid;
              const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID';

              return (
                <tr key={invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-4 pl-6 font-semibold">{invoice.student.firstName} {invoice.student.lastName}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    <div className="font-medium">{invoice.title}</div>
                    <div className="text-xs text-slate-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4 font-medium">
                    {totalAmount.toLocaleString(undefined, { style: 'currency', currency: 'SLL' })}
                  </td>
                  <td className="p-4 font-bold text-rose-600">
                    {arrears > 0 ? arrears.toLocaleString(undefined, { style: 'currency', currency: 'SLL' }) : '0.00'}
                  </td>
                  <td className="p-4">
                    {invoice.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md"><CheckCircle2 className="w-3 h-3"/> Paid</span>
                    ) : invoice.status === 'PARTIAL' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md"><Clock className="w-3 h-3"/> Partial</span>
                    ) : isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-rose-100 text-rose-700 rounded-md"><AlertCircle className="w-3 h-3"/> Overdue</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">Pending</span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {invoice.status !== 'PAID' && (
                      <button 
                        onClick={() => {
                          setPaymentForm({ ...paymentForm, invoiceId: invoice.id, studentId: invoice.studentId, amount: arrears.toString() });
                          setShowPaymentForm(true);
                        }}
                        className="px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-semibold hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors flex items-center justify-end gap-1 ml-auto"
                      >
                        <Receipt className="w-4 h-4" /> Receive Pay
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {initialInvoices.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No invoices generated yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      {showInvoiceForm && (
        <Modal isOpen={showInvoiceForm} onClose={() => setShowInvoiceForm(false)} title="Create Invoice">
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Student</label>
              <select required value={invoiceForm.studentId} onChange={e => setInvoiceForm({...invoiceForm, studentId: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="">Select a student...</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
                ))}
              </select>
            </div>
            <div><label className="text-sm font-medium">Invoice Title</label><input required placeholder="e.g. Term 1 Tuition" value={invoiceForm.title} onChange={e => setInvoiceForm({...invoiceForm, title: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            <div><label className="text-sm font-medium">Total Amount</label><input type="number" step="0.01" required value={invoiceForm.totalAmount} onChange={e => setInvoiceForm({...invoiceForm, totalAmount: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            <div><label className="text-sm font-medium">Due Date</label><input type="date" required value={invoiceForm.dueDate} onChange={e => setInvoiceForm({...invoiceForm, dueDate: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            <button type="submit" disabled={isPending} className="w-full py-2 bg-violet-600 text-white rounded-lg font-semibold mt-4">{isPending ? 'Saving...' : 'Create Invoice'}</button>
          </form>
        </Modal>
      )}

      {/* Payment Modal */}
      {showPaymentForm && (
        <Modal isOpen={showPaymentForm} onClose={() => setShowPaymentForm(false)} title="Receive Payment">
          <form onSubmit={handleLogPayment} className="space-y-4">
            <div><label className="text-sm font-medium">Amount Received</label><input type="number" step="0.01" required value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <select required value={paymentForm.paymentMethod} onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="CARD">Credit/Debit Card</option>
              </select>
            </div>
            <button type="submit" disabled={isPending} className="w-full py-2 bg-violet-600 text-white rounded-lg font-semibold mt-4">{isPending ? 'Processing...' : 'Log Payment'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
