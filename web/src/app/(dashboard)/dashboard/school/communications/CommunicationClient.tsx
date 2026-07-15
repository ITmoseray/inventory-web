'use client';

import React, { useState, useTransition } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { sendBroadcast } from '@/actions/communicationActions';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';

export default function CommunicationClient({ initialBroadcasts, courses }: any) {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [isPending, startTransition] = useTransition();

  // Compose Form State
  const [form, setForm] = useState({
    subject: '',
    content: '',
    channel: 'EMAIL',
    audience: 'ALL_STUDENTS',
    specificCourseId: ''
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.audience === 'SPECIFIC_COURSE' && !form.specificCourseId) {
      toast.error("Please select a course.");
      return;
    }
    
    startTransition(async () => {
      const res = await sendBroadcast(form);
      if (res.success) {
        toast.success(`Broadcast sent successfully to ${res.count} recipients!`);
        setForm({ ...form, subject: '', content: '' });
        setActiveTab('history');
      } else {
        toast.error(res.error || "Failed to send broadcast.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('compose')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'compose' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <span className="flex items-center gap-2"><Send className="w-4 h-4"/> Compose</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'history' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <span className="flex items-center gap-2"><History className="w-4 h-4"/> Outbox History</span>
        </button>
      </div>

      {activeTab === 'compose' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-3xl">
          <form onSubmit={handleSend} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Delivery Channel</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${form.channel === 'EMAIL' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' : 'border-slate-200 dark:border-slate-700'}`}>
                    <input type="radio" name="channel" value="EMAIL" checked={form.channel === 'EMAIL'} onChange={e => setForm({...form, channel: e.target.value})} className="hidden" />
                    <Mail className="w-6 h-6" />
                    <span className="text-sm font-medium">Email</span>
                  </label>
                  <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${form.channel === 'SMS' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' : 'border-slate-200 dark:border-slate-700'}`}>
                    <input type="radio" name="channel" value="SMS" checked={form.channel === 'SMS'} onChange={e => setForm({...form, channel: e.target.value})} className="hidden" />
                    <MessageSquare className="w-6 h-6" />
                    <span className="text-sm font-medium">SMS</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Target Audience</label>
                <select value={form.audience} onChange={e => setForm({...form, audience: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none">
                  <option value="ALL_STUDENTS">All Active Students</option>
                  <option value="SPECIFIC_COURSE">Students in Specific Course</option>
                </select>

                {form.audience === 'SPECIFIC_COURSE' && (
                  <select value={form.specificCourseId} onChange={e => setForm({...form, specificCourseId: e.target.value})} className="w-full mt-3 p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none">
                    <option value="">Select a course...</option>
                    {courses.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Subject</label>
              <input required placeholder="E.g., Important update regarding exams" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Message</label>
              <textarea required rows={6} placeholder="Type your message here..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 outline-none resize-y"></textarea>
              {form.channel === 'SMS' && <p className="text-xs text-slate-500 mt-2">SMS messages should be kept short (under 160 characters per segment). Current length: {form.content.length}</p>}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button type="submit" disabled={isPending} className="px-8 py-3 bg-violet-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-50">
                {isPending ? 'Sending Broadcast...' : <><Send className="w-5 h-5" /> Send Broadcast Now</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Channel</th>
                <th className="p-4 font-medium">Audience</th>
                <th className="p-4 font-medium">Subject</th>
                <th className="p-4 pr-6 font-medium text-right">Recipients</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialBroadcasts.map((broadcast: any) => (
                <tr key={broadcast.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-4 pl-6 font-semibold whitespace-nowrap">{new Date(broadcast.sentAt || broadcast.createdAt).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${broadcast.channel === 'EMAIL' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {broadcast.channel}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {broadcast.audience === 'ALL_STUDENTS' ? 'All Students' : 'Specific Course'}
                  </td>
                  <td className="p-4 text-slate-900 dark:text-white font-medium max-w-xs truncate" title={broadcast.subject}>
                    {broadcast.subject}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-violet-100 text-violet-700 rounded-md">
                      <CheckCircle2 className="w-3 h-3"/> {broadcast.recipients.length} Delivered
                    </span>
                  </td>
                </tr>
              ))}
              {initialBroadcasts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No broadcasts have been sent yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
