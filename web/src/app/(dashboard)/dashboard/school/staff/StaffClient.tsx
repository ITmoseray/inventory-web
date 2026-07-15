'use client';

import React, { useState, useTransition } from 'react';
import { Users, CalendarClock, UserPlus, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { createStaff, submitLeaveRequest, updateLeaveStatus } from '@/actions/hrActions';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';

export default function StaffClient({ initialStaff }: any) {
  const [activeTab, setActiveTab] = useState<'roster' | 'leave'>('roster');
  const [isPending, startTransition] = useTransition();

  // Staff Modal
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'Teacher', department: '', salary: '' });

  // Leave Modal
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ staffId: '', leaveType: 'Sick', startDate: '', endDate: '', reason: '' });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createStaff({
        ...staffForm,
        salary: Number(staffForm.salary)
      });
      if (res.success) {
        toast.success("Staff member added successfully!");
        setShowStaffForm(false);
        setStaffForm({ firstName: '', lastName: '', email: '', phone: '', role: 'Teacher', department: '', salary: '' });
      } else {
        toast.error("Failed to add staff.");
      }
    });
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitLeaveRequest(leaveForm);
      if (res.success) {
        toast.success("Leave request submitted!");
        setShowLeaveForm(false);
        setLeaveForm({ staffId: '', leaveType: 'Sick', startDate: '', endDate: '', reason: '' });
      } else {
        toast.error("Failed to submit request.");
      }
    });
  };

  const handleUpdateLeave = async (id: string, status: string) => {
    startTransition(async () => {
      const res = await updateLeaveStatus(id, status);
      if (res.success) {
        toast.success(`Leave request ${status.toLowerCase()}`);
      } else {
        toast.error("Failed to update status.");
      }
    });
  };

  // Flatten leave requests from all staff
  const allLeaveRequests = initialStaff.flatMap((s: any) => 
    s.leaveRequests.map((l: any) => ({ ...l, staffName: `${s.firstName} ${s.lastName}` }))
  ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('roster')}
            className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'roster' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <span className="flex items-center gap-2"><Users className="w-4 h-4"/> Staff Directory</span>
          </button>
          <button 
            onClick={() => setActiveTab('leave')}
            className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'leave' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <span className="flex items-center gap-2"><CalendarClock className="w-4 h-4"/> Leave Requests</span>
          </button>
        </div>
        <div className="pb-2">
          {activeTab === 'roster' && (
            <button onClick={() => setShowStaffForm(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <UserPlus className="w-4 h-4"/> Add Staff
            </button>
          )}
          {activeTab === 'leave' && (
            <button onClick={() => setShowLeaveForm(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <CalendarClock className="w-4 h-4"/> Submit Request
            </button>
          )}
        </div>
      </div>

      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {initialStaff.map((staff: any) => (
            <div key={staff.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-xl mb-4">
                  {staff.firstName[0]}{staff.lastName[0]}
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{staff.firstName} {staff.lastName}</h3>
                <p className="text-sm font-medium text-violet-600 mb-1">{staff.role}</p>
                <div className="text-sm text-slate-500 space-y-1 mt-4">
                  <p>Department: {staff.department || 'N/A'}</p>
                  <p>Email: {staff.email || 'N/A'}</p>
                  <p>Base Salary: {Number(staff.salary).toLocaleString(undefined, { style: 'currency', currency: 'SLL' })}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-md ${staff.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-slate-400">Hired: {new Date(staff.hireDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {initialStaff.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p>No staff members added yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Staff Member</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Duration</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 pr-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allLeaveRequests.map((leave: any) => (
                <tr key={leave.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-4 pl-6 font-semibold">{leave.staffName}</td>
                  <td className="p-4 font-medium">{leave.leaveType}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {leave.status === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md"><CheckCircle2 className="w-3 h-3"/> Approved</span>
                    ) : leave.status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-rose-100 text-rose-700 rounded-md"><XCircle className="w-3 h-3"/> Rejected</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md"><Clock className="w-3 h-3"/> Pending</span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {leave.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdateLeave(leave.id, 'APPROVED')} disabled={isPending} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors">Approve</button>
                        <button onClick={() => handleUpdateLeave(leave.id, 'REJECTED')} disabled={isPending} className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {allLeaveRequests.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No leave requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffForm && (
        <Modal isOpen={showStaffForm} onClose={() => setShowStaffForm(false)} title="Add Staff Member">
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">First Name</label><input required value={staffForm.firstName} onChange={e => setStaffForm({...staffForm, firstName: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
              <div><label className="text-sm font-medium">Last Name</label><input required value={staffForm.lastName} onChange={e => setStaffForm({...staffForm, lastName: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            </div>
            <div><label className="text-sm font-medium">Role</label>
              <select required value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="Teacher">Teacher</option>
                <option value="Administrator">Administrator</option>
                <option value="Bursar">Bursar</option>
                <option value="Librarian">Librarian</option>
                <option value="Support Staff">Support Staff</option>
              </select>
            </div>
            <div><label className="text-sm font-medium">Department / Subject</label><input placeholder="e.g. Science" value={staffForm.department} onChange={e => setStaffForm({...staffForm, department: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            <div><label className="text-sm font-medium">Base Salary (SLL)</label><input type="number" required value={staffForm.salary} onChange={e => setStaffForm({...staffForm, salary: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            <button type="submit" disabled={isPending} className="w-full py-2 bg-violet-600 text-white rounded-lg font-semibold mt-4">{isPending ? 'Saving...' : 'Add Staff'}</button>
          </form>
        </Modal>
      )}

      {/* Leave Modal */}
      {showLeaveForm && (
        <Modal isOpen={showLeaveForm} onClose={() => setShowLeaveForm(false)} title="Submit Leave Request">
          <form onSubmit={handleCreateLeave} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Staff Member</label>
              <select required value={leaveForm.staffId} onChange={e => setLeaveForm({...leaveForm, staffId: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="">Select Staff...</option>
                {initialStaff.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Leave Type</label>
              <select required value={leaveForm.leaveType} onChange={e => setLeaveForm({...leaveForm, leaveType: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="Sick">Sick Leave</option>
                <option value="Vacation">Vacation / Annual</option>
                <option value="Maternity">Maternity / Paternity</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Start Date</label><input type="date" required value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
              <div><label className="text-sm font-medium">End Date</label><input type="date" required value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            </div>
            <div><label className="text-sm font-medium">Reason (Optional)</label><textarea value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" rows={2} /></div>
            <button type="submit" disabled={isPending} className="w-full py-2 bg-violet-600 text-white rounded-lg font-semibold mt-4">{isPending ? 'Submitting...' : 'Submit Request'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
