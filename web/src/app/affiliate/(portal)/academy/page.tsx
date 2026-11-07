"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Award,
  ChevronRight,
  PlayCircle,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPaanAcademyCurriculum,
  completePaanAcademyLesson,
} from "@/lib/actions/paan";

export default function AffiliateAcademyPage() {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getPaanAcademyCurriculum();
      if (res.success) {
        setLessons(res.lessons);
        setStats(res.stats);
        if (res.lessons.length > 0 && !selectedLesson) {
          setSelectedLesson(res.lessons[0]);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load Academy curriculum");
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteLesson(lessonId: string) {
    setCompletingId(lessonId);
    try {
      const res = await completePaanAcademyLesson(lessonId);
      if (res.success) {
        toast.success("Lesson marked as completed!");
        if (res.allComplete) {
          toast.success("Congratulations! You are now a Certified PAAN Academy Marketer!", {
            duration: 5000,
          });
        }
        loadData();
      } else {
        toast.error(res.error || "Failed to update progress");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCompletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Academy Learning Centre...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Academy Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="h-3.5 w-3.5" /> ProTech Online Academy
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
              Affiliate Marketer Training & Certification
            </h1>
            <p className="text-slate-300 text-sm md:text-base">
              Learn practical, high-converting marketing strategies tailored for Sierra Leone. Master WhatsApp status selling, physical walk-in sales guidance, and ethical marketing.
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shrink-0 w-full md:w-72 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-300">
              <span>Course Progress</span>
              <span className="text-emerald-400">{stats?.completionPercentage || 0}%</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats?.completionPercentage || 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-300">
              {stats?.completedCount || 0} of {stats?.totalLessons || 0} lessons completed
            </p>

            {stats?.isCertified && (
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-xl text-emerald-300 text-xs font-bold">
                <Award className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Certified Academy Marketer</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Learning Hub Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Lessons Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 px-2">
            Curriculum Modules
          </h3>

          <div className="space-y-2">
            {lessons.map((lesson, idx) => {
              const isSelected = selectedLesson?.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-400"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {lesson.isCompleted ? (
                      <CheckCircle2
                        className={`h-5 w-5 ${isSelected ? "text-white" : "text-emerald-500"}`}
                      />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? "border-white text-white" : "border-slate-300 text-slate-500"
                        }`}
                      >
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[10px] uppercase font-bold tracking-wider ${
                        isSelected ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      {lesson.moduleTitle}
                    </p>
                    <p className="text-sm font-bold truncate mt-0.5">{lesson.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Lesson Content Viewer */}
        <div className="lg:col-span-2">
          {selectedLesson ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {selectedLesson.moduleTitle}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {selectedLesson.title}
                </h2>
              </div>

              {/* Lesson Text Body */}
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {selectedLesson.content}
              </div>

              {/* Key Takeaways */}
              {selectedLesson.keyTakeaways && selectedLesson.keyTakeaways.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-5 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">
                    Key Practical Takeaways:
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedLesson.keyTakeaways.map((takeaway: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Complete Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {selectedLesson.isCompleted ? (
                  <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5" /> Completed
                  </div>
                ) : (
                  <button
                    onClick={() => handleCompleteLesson(selectedLesson.id)}
                    disabled={completingId === selectedLesson.id}
                    className="px-6 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 flex items-center gap-2 text-sm"
                  >
                    {completingId === selectedLesson.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Mark Lesson as Completed
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">Select a lesson from the left to start learning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
