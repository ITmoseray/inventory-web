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
        <Link href="/dashboard/school/attendance" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium whitespace-nowrap transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-check-2"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/><path d="m16 20 2 2 4-4"/></svg>
          Attendance
        </Link>
        <Link href="/dashboard/school/payroll" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium whitespace-nowrap transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-banknote"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
          Staff Payroll
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
