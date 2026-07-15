'use client';

import React, { useState, useTransition } from 'react';
import { createCourse, deleteCourse } from '@/actions/schoolAdminActions';
import { Plus, Trash2, Search, BookOpen, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseTable({ initialCourses }: { initialCourses: any[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    startTransition(async () => {
      const res = await deleteCourse(id);
      if (res.success) {
        setCourses(prev => prev.filter(c => c.id !== id));
        toast.success('Course deleted successfully');
      } else {
        toast.error('Failed to delete course');
      }
    });
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await createCourse(formData);
      if (res.success) {
        toast.success('Course created successfully');
        setIsModalOpen(false);
        // Normally we'd re-fetch, but Next.js Server Actions with revalidatePath handles this if we just rely on page refresh. 
        // For optimisic UI, we'd append it. For now, we instruct a reload or wait for next.js router.
        window.location.reload();
      } else {
        toast.error(res.error || 'Failed to create course');
      }
    });
  };

  const filteredCourses = courses.filter(c => 
    c.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Code</th>
              <th className="p-4 font-medium">Course Name</th>
              <th className="p-4 font-medium">Duration</th>
              <th className="p-4 font-medium">Tuition Fee</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredCourses.length > 0 ? filteredCourses.map(course => (
              <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4">
                  <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">{course.courseCode}</span>
                </td>
                <td className="p-4">
                  <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    {course.courseName}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1">{course.description}</div>
                </td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{course.duration}</td>
                <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">Le {Number(course.fee).toLocaleString()}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(course.id)}
                    disabled={isPending}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Course</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Name</label>
                  <input type="text" name="courseName" required placeholder="e.g. Intro to Computer Science" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                  <input type="text" name="courseCode" required placeholder="e.g. CS101" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                  <input type="text" name="duration" required placeholder="e.g. 6 Months" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tuition Fee (Leones)</label>
                  <input type="number" name="fee" required placeholder="e.g. 1500" step="0.01" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea name="description" rows={3} placeholder="Brief description of the curriculum..." className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-violet-500 outline-none"></textarea>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isPending} className="px-5 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isPending ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
