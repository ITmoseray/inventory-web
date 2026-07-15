'use client';

import React, { useState, useTransition } from 'react';
import { updateStudentStatus, deleteStudent } from '@/actions/schoolAdminActions';
import { MoreHorizontal, CheckCircle, XCircle, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentTable({ initialStudents }: { initialStudents: any[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (id: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateStudentStatus(id, newStatus);
      if (res.success) {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        toast.success(`Student status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update student status');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    startTransition(async () => {
      const res = await deleteStudent(id);
      if (res.success) {
        setStudents(prev => prev.filter(s => s.id !== id));
        toast.success('Student deleted successfully');
      } else {
        toast.error('Failed to delete student');
      }
    });
  };

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
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
              <th className="p-4 font-medium">Student ID</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Gender</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredStudents.length > 0 ? filteredStudents.map(student => (
              <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4">
                  <span className="font-mono text-sm text-violet-600 dark:text-violet-400 font-medium">{student.studentId}</span>
                </td>
                <td className="p-4">
                  <div className="font-medium text-slate-900 dark:text-white">{student.firstName} {student.lastName}</div>
                  <div className="text-xs text-slate-500">{new Date(student.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{student.gender}</td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                  <div>{student.phone}</div>
                  {student.email && <div className="text-xs text-slate-400">{student.email}</div>}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    student.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                    student.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {student.status === 'PENDING' && (
                      <button 
                        onClick={() => handleStatusChange(student.id, 'ACTIVE')}
                        disabled={isPending}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve Admission"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {student.status === 'ACTIVE' && (
                      <button 
                        onClick={() => handleStatusChange(student.id, 'SUSPENDED')}
                        disabled={isPending}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Suspend Student"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(student.id)}
                      disabled={isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
