'use client';

import React, { useState } from 'react';
import { FileSignature, X, Info, Banknote, Copy, CheckCircle2 } from 'lucide-react';
import { submitRegistration } from '@/actions/schoolActions';

export default function RegistrationModal({ businessId, businessName }: { businessId: string, businessName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText('073019699');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    formData.append('businessId', businessId);

    const result = await submitRegistration(formData);
    
    if (result.success) {
      setSuccess(`Application submitted successfully! Your tracking ID is ${result.studentId}.`);
    } else {
      setError(result.error || 'Something went wrong.');
    }
    
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-8 py-4 rounded-2xl bg-white text-violet-900 font-bold uppercase tracking-wide hover:scale-105 hover:bg-slate-50 hover:text-violet-700 transition-all shadow-xl flex items-center justify-center gap-2"
      >
        Begin Application
        <FileSignature className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-4xl rounded-[1.5rem] shadow-2xl overflow-hidden my-8 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
            
            {/* Header */}
            <div className="bg-slate-900 dark:bg-slate-950 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-violet-600 rounded-xl p-2">
                  <FileSignature className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Admission Application</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Application Received!</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8">{success}</p>
                  <button onClick={() => setIsOpen(false)} className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl shadow hover:bg-violet-700 transition-colors">
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-start gap-4">
                    <Info className="w-6 h-6 text-violet-600 shrink-0 mt-1" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      You are submitting a formal application to <strong className="text-slate-900 dark:text-white">{businessName}</strong>. Please ensure all details are accurate.
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-2xl p-5 border-l-4 border-l-green-500">
                    <h6 className="font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                      <Banknote className="w-5 h-5" />
                      Registration Fee: 100 Leones
                    </h6>
                    <p className="text-sm text-green-800 dark:text-green-300 mb-4">
                      To complete your application, please send the 100 Leones registration fee to the following number:
                    </p>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-4 rounded-xl border border-green-100 dark:border-slate-800 mb-3 shadow-sm">
                      <span className="text-xl font-bold text-slate-900 dark:text-white tracking-widest">073019699</span>
                      <button type="button" onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors text-sm">
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-green-700/80 dark:text-green-400/80 italic">
                      Note: Your application will remain Pending until an administrator verifies your payment. Please keep your transaction ID.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="col-span-12">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Payment Transaction ID / Reference</label>
                      <input type="text" name="payment_reference" required placeholder="Enter the ID from your payment message" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white" />
                    </div>

                    <div className="col-span-12 md:col-span-8">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name of Student</label>
                      <input type="text" name="full_name" required placeholder="As it appears on ID" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Age</label>
                      <input type="number" name="age" required placeholder="Age" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                      <select name="gender" required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-span-12">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Address</label>
                      <input type="text" name="address" required placeholder="Current Residential Address" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white" />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                      <input type="text" name="phone" required placeholder="+232..." className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email (Optional)</label>
                      <input type="email" name="email" placeholder="example@email.com" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white" />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Guardian or Friend's Name</label>
                      <input type="text" name="guardian_name" required placeholder="Emergency Contact Name" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Guardian Phone</label>
                      <input type="text" name="guardian_phone" required placeholder="+232..." className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <button type="submit" disabled={loading} className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
                      {loading ? 'Submitting Application...' : 'Submit Admission Application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
