'use client';

import React, { useState, useTransition } from 'react';
import { Book, Plus, ArrowRightLeft, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { addLibraryBook, checkoutBook, returnBook } from '@/actions/libraryActions';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';

export default function LibraryClient({ initialBooks, initialCheckouts, students }: any) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'checkouts'>('catalog');
  const [isPending, startTransition] = useTransition();

  // Add Book Modal State
  const [showAddBook, setShowAddBook] = useState(false);
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });

  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ bookId: '', studentId: '', dueDate: '' });

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await addLibraryBook(bookForm);
      if (res.success) {
        toast.success("Book added to library!");
        setShowAddBook(false);
        setBookForm({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });
      } else {
        toast.error("Failed to add book.");
      }
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await checkoutBook(checkoutForm.bookId, checkoutForm.studentId, checkoutForm.dueDate);
      if (res.success) {
        toast.success("Book checked out successfully!");
        setShowCheckout(false);
        setCheckoutForm({ bookId: '', studentId: '', dueDate: '' });
      } else {
        toast.error(res.error || "Failed to checkout book.");
      }
    });
  };

  const handleReturn = async (checkoutId: string, bookId: string) => {
    startTransition(async () => {
      const res = await returnBook(checkoutId, bookId);
      if (res.success) {
        toast.success("Book returned successfully!");
      } else {
        toast.error("Failed to return book.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'catalog' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          Book Catalog
        </button>
        <button 
          onClick={() => setActiveTab('checkouts')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'checkouts' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          Active Checkouts
        </button>
      </div>

      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddBook(true)} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-violet-700">
              <Plus className="w-4 h-4" /> Add Book
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialBooks.map((book: any) => (
              <div key={book.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center mb-4">
                  <Book className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">{book.title}</h3>
                <p className="text-slate-500 text-sm mb-4">By {book.author || 'Unknown'}</p>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${book.availableCopies > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {book.availableCopies} / {book.totalCopies} Available
                  </span>
                  <button 
                    onClick={() => { setCheckoutForm({ ...checkoutForm, bookId: book.id }); setShowCheckout(true); }}
                    disabled={book.availableCopies <= 0}
                    className="text-sm font-semibold text-violet-600 hover:text-violet-700 disabled:opacity-50"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            ))}
            {initialBooks.length === 0 && (
              <div className="col-span-3 text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No books in the library yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'checkouts' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Student</th>
                <th className="p-4 font-medium">Book Title</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 pr-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialCheckouts.map((checkout: any) => {
                const isOverdue = new Date(checkout.dueDate) < new Date() && checkout.status === 'ACTIVE';
                return (
                  <tr key={checkout.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-4 pl-6 font-semibold">{checkout.student.firstName} {checkout.student.lastName}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{checkout.book.title}</td>
                    <td className="p-4 text-slate-500">{new Date(checkout.dueDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      {checkout.status === 'RETURNED' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md"><CheckCircle2 className="w-3 h-3"/> Returned</span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-rose-100 text-rose-700 rounded-md"><AlertCircle className="w-3 h-3"/> Overdue</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">Active</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {checkout.status === 'ACTIVE' && (
                        <button 
                          onClick={() => handleReturn(checkout.id, checkout.bookId)}
                          disabled={isPending}
                          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
                        >
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {initialCheckouts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No active checkouts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBook && (
        <Modal isOpen={showAddBook} onClose={() => setShowAddBook(false)} title="Add New Book">
          <form onSubmit={handleAddBook} className="space-y-4">
            <div><label className="text-sm font-medium">Title</label><input required value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            <div><label className="text-sm font-medium">Author</label><input required value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">ISBN / Code</label><input value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
              <div><label className="text-sm font-medium">Total Copies</label><input type="number" min="1" value={bookForm.totalCopies} onChange={e => setBookForm({...bookForm, totalCopies: parseInt(e.target.value)})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            </div>
            <button type="submit" disabled={isPending} className="w-full py-2 bg-violet-600 text-white rounded-lg font-semibold mt-4">{isPending ? 'Saving...' : 'Save Book'}</button>
          </form>
        </Modal>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <Modal isOpen={showCheckout} onClose={() => setShowCheckout(false)} title="Checkout Book">
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Student</label>
              <select required value={checkoutForm.studentId} onChange={e => setCheckoutForm({...checkoutForm, studentId: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="">Select a student...</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <input type="date" required value={checkoutForm.dueDate} onChange={e => setCheckoutForm({...checkoutForm, dueDate: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <button type="submit" disabled={isPending || !checkoutForm.studentId} className="w-full py-2 bg-violet-600 text-white rounded-lg font-semibold mt-4">{isPending ? 'Processing...' : 'Confirm Checkout'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
