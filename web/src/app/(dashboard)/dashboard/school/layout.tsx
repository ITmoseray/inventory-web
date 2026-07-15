import React from 'react';
import Link from 'next/link';
import { GraduationCap, Users, BookOpen, CreditCard } from 'lucide-react';

export default function SchoolDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full overflow-hidden w-full max-w-full font-sans bg-slate-50 dark:bg-slate-950/50">
      
      {/* Top Nav for School Module */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 shadow-sm px-6 py-4 flex gap-6 overflow-x-auto">
        <Link href="/dashboard/school" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium whitespace-nowrap transition-colors">
          <GraduationCap className="w-5 h-5" />
          Overview
        </Link>
        <Link href="/dashboard/school/students" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium whitespace-nowrap transition-colors">
          <Users className="w-5 h-5" />
          Students
        </Link>
        <Link href="/dashboard/school/courses" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium whitespace-nowrap transition-colors">
          <BookOpen className="w-5 h-5" />
          Courses
        </Link>
        <Link href="/dashboard/school/payments" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium whitespace-nowrap transition-colors">
          <CreditCard className="w-5 h-5" />
          Payments
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
