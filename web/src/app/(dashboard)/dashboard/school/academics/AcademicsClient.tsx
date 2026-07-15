'use client';

import React, { useState, useTransition } from 'react';
import { Calendar, GraduationCap, FileText, CheckCircle2 } from 'lucide-react';
import { createTerm, getGradesForCourseAndTerm, saveGrade, getStudentReportCard } from '@/actions/academicActions';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';

export default function AcademicsClient({ initialTerms, courses }: any) {
  const [activeTab, setActiveTab] = useState<'gradebook' | 'terms'>('gradebook');
  const [isPending, startTransition] = useTransition();

  // Term Modal State
  const [showTermForm, setShowTermForm] = useState(false);
  const [termForm, setTermForm] = useState({ name: '', startDate: '', endDate: '' });

  // Gradebook State
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studentsWithGrades, setStudentsWithGrades] = useState<any[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);

  // Report Card State
  const [showReportCard, setShowReportCard] = useState(false);
  const [reportCardData, setReportCardData] = useState<any>(null);

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createTerm(termForm);
      if (res.success) {
        toast.success("Academic Term created!");
        setShowTermForm(false);
        setTermForm({ name: '', startDate: '', endDate: '' });
      } else {
        toast.error("Failed to create term.");
      }
    });
  };

  const fetchGrades = async () => {
    if (!selectedTerm || !selectedCourse) return;
    setIsLoadingGrades(true);
    const data = await getGradesForCourseAndTerm(selectedCourse, selectedTerm);
    setStudentsWithGrades(data);
    setIsLoadingGrades(false);
  };

  const handleGradeChange = (studentId: string, score: string) => {
    setStudentsWithGrades(prev => prev.map(s => {
      if (s.student.id === studentId) {
        return { ...s, grade: { ...s.grade, score: score } };
      }
      return s;
    }));
  };

  const handleSaveGrade = async (studentId: string, score: number) => {
    startTransition(async () => {
      const res = await saveGrade({ studentId, courseId: selectedCourse, termId: selectedTerm, score });
      if (res.success) {
        toast.success("Grade saved!");
      } else {
        toast.error("Failed to save grade.");
      }
    });
  };

  const handleViewReportCard = async (studentId: string) => {
    startTransition(async () => {
      const data = await getStudentReportCard(studentId, selectedTerm);
      setReportCardData(data);
      setShowReportCard(true);
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('gradebook')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'gradebook' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4"/> Gradebook</span>
        </button>
        <button 
          onClick={() => setActiveTab('terms')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'terms' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Academic Terms</span>
        </button>
      </div>

      {activeTab === 'terms' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowTermForm(true)} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700">
              Create New Term
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialTerms.map((term: any) => (
              <div key={term.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{term.name}</h3>
                <div className="text-sm text-slate-500 space-y-1">
                  <p>Start: {new Date(term.startDate).toLocaleDateString()}</p>
                  <p>End: {new Date(term.endDate).toLocaleDateString()}</p>
                </div>
                <div className="mt-4">
                  <span className={`inline-flex text-xs font-bold px-2 py-1 rounded-md ${term.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {term.isActive ? 'Active Term' : 'Past Term'}
                  </span>
                </div>
              </div>
            ))}
            {initialTerms.length === 0 && (
              <div className="col-span-3 text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p>No academic terms created yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gradebook' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Select Term</label>
              <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="">Choose a term...</option>
                {initialTerms.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Select Course/Class</label>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="">Choose a course...</option>
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <button 
              onClick={fetchGrades} 
              disabled={!selectedTerm || !selectedCourse || isLoadingGrades}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 disabled:opacity-50"
            >
              {isLoadingGrades ? 'Loading...' : 'Load Gradebook'}
            </button>
          </div>

          {studentsWithGrades.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 pl-6 font-medium">Student</th>
                    <th className="p-4 font-medium w-48">Score (0-100)</th>
                    <th className="p-4 font-medium">Letter Grade</th>
                    <th className="p-4 pr-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {studentsWithGrades.map((item) => {
                    const score = item.grade?.score || '';
                    return (
                      <tr key={item.student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="p-4 pl-6 font-semibold">{item.student.firstName} {item.student.lastName}</td>
                        <td className="p-4">
                          <input 
                            type="number" 
                            max="100" 
                            min="0"
                            step="0.01"
                            value={score}
                            onChange={(e) => handleGradeChange(item.student.id, e.target.value)}
                            className="w-full p-2 border rounded-md text-sm dark:bg-slate-800 dark:border-slate-700"
                            placeholder="Enter score"
                          />
                        </td>
                        <td className="p-4 font-bold text-violet-600">
                          {item.grade?.grade || '-'}
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <button 
                            onClick={() => handleSaveGrade(item.student.id, Number(score))}
                            disabled={isPending || score === ''}
                            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors disabled:opacity-50"
                          >
                            Save Mark
                          </button>
                          <button 
                            onClick={() => handleViewReportCard(item.student.id)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            Report Card
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Term Modal */}
      {showTermForm && (
        <Modal isOpen={showTermForm} onClose={() => setShowTermForm(false)} title="Create Academic Term">
          <form onSubmit={handleCreateTerm} className="space-y-4">
            <div><label className="text-sm font-medium">Term Name</label><input required placeholder="e.g. 2026 First Term" value={termForm.name} onChange={e => setTermForm({...termForm, name: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Start Date</label><input type="date" required value={termForm.startDate} onChange={e => setTermForm({...termForm, startDate: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
              <div><label className="text-sm font-medium">End Date</label><input type="date" required value={termForm.endDate} onChange={e => setTermForm({...termForm, endDate: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            </div>
            <button type="submit" disabled={isPending} className="w-full py-2 bg-violet-600 text-white rounded-lg font-semibold mt-4">{isPending ? 'Saving...' : 'Create Term'}</button>
          </form>
        </Modal>
      )}

      {/* Report Card Modal */}
      {showReportCard && reportCardData && (
        <Modal isOpen={showReportCard} onClose={() => setShowReportCard(false)} title="Student Report Card">
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold">{reportCardData.student.firstName} {reportCardData.student.lastName}</h2>
              <p className="text-sm text-slate-500">ID: {reportCardData.student.studentId}</p>
              <p className="text-sm font-semibold mt-2 text-violet-600">{reportCardData.term.name}</p>
            </div>
            
            <div className="space-y-2">
              {reportCardData.grades.length > 0 ? reportCardData.grades.map((g: any) => (
                <div key={g.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{g.course.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-lg">{g.grade}</span>
                    <span className="text-xs text-slate-500 ml-2">({Number(g.score)}%)</span>
                  </div>
                </div>
              )) : (
                <p className="text-center text-slate-500 py-4">No grades recorded for this term.</p>
              )}
            </div>

            <button onClick={() => window.print()} className="w-full py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              Print Transcript
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
