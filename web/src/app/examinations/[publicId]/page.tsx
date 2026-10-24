"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Phone,
  FileText,
  HelpCircle,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  getPublicExamByPublicId,
  verifyOrRegisterParticipant,
  startOrResumeExamAttempt,
} from "@/lib/actions/examination";

export default function ExaminationEntryPage() {
  const params = useParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const publicId = typeof params.publicId === "string" ? params.publicId : "";

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Candidate Registration / Verification State
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!publicId) return;

    setLoading(true);
    getPublicExamByPublicId(publicId)
      .then((res) => {
        if (res.success && res.exam) {
          setExam(res.exam);
        } else {
          setError(res.error || "Examination not found or unavailable.");
        }
      })
      .catch((err) => {
        setError("Failed to load examination.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [publicId]);

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim()) {
      toast.error("Please enter your Full Name and registered Email Address");
      return;
    }

    try {
      setStarting(true);

      // 1. Register or verify participant
      const pRes = await verifyOrRegisterParticipant(publicId, {
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(),
        studentPhone: studentPhone.trim() || undefined,
        studentId: studentId.trim() || undefined,
      });

      if (!pRes.success || !pRes.participant) {
        toast.error(pRes.error || "Failed to verify participant");
        setStarting(false);
        return;
      }

      // 2. Start or Resume Attempt
      const aRes = await startOrResumeExamAttempt(publicId, pRes.participant.id);

      if (!aRes.success) {
        if (aRes.isLimitReached && aRes.lastAttemptId) {
          toast.info(aRes.error);
          router.push(`/examinations/${publicId}/result/${aRes.lastAttemptId}`);
          return;
        }
        toast.error(aRes.error || "Failed to start examination");
        setStarting(false);
        return;
      }

      toast.success("Examination session initialized!");
      // 3. Route to distraction-free room
      router.push(`/examinations/${publicId}/take?attemptId=${aRes.attemptId}&participantId=${pRes.participant.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to start examination");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Connecting to ProTech Online Academy Examination Vault...
          </p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Examination Unavailable</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error || "The requested examination could not be loaded."}</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-500/20"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white transition-colors duration-300">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-indigo-500/5 dark:bg-indigo-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-purple-500/5 dark:bg-purple-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 sm:py-4 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-md p-1 overflow-hidden">
              <Image
                src="/images/logo-192.png"
                alt="ProTech Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase truncate">
                ProTech Online Academy
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
                Examination &amp; Assessment Centre
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Dark/Light Mode Toggle */}
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 shadow-sm text-xs font-bold cursor-pointer"
                title="Toggle Dark / Light Mode"
                aria-label="Toggle Dark / Light Mode"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>
            )}

            <span className="hidden md:flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified Node
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12 w-full space-y-6 sm:space-y-8 flex-1">
        {/* Examination Title & Program Banner */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl space-y-6 transition-colors">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              {exam.courseBadge || exam.courseTitle}
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {exam.publicId}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {exam.title}
            </h1>
            {exam.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {exam.description}
              </p>
            )}
          </div>

          {/* Quick Stats Grid - Fully Responsive (2 Cols on mobile, 4 on laptop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 transition">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Duration</span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate block">{exam.durationMinutes} Minutes</span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 transition">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Total Questions</span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate block">{exam.totalQuestions} Questions</span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 transition">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Pass Threshold</span>
                <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 truncate block">{exam.passMarkPercentage}%</span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 transition">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Max Attempts</span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate block">{exam.maxAttempts} Attempt{exam.maxAttempts > 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Instructions & Verification Form (Stacked on mobile, split on laptop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Instructions Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Candidate Examination Instructions
              </h3>

              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed whitespace-pre-line font-medium">
                {exam.instructions || (
                  <>
                    1. Read every question scenario thoroughly before choosing an option.
                    <br />
                    2. Single-choice questions require exactly one correct answer (A–E).
                    <br />
                    3. Multiple-select questions permit one or more correct answers (A–E).
                    <br />
                    4. Your answers autosave automatically as you click each option.
                    <br />
                    5. The countdown timer is calculated strictly on the academy server and continues even if you refresh your browser.
                    <br />
                    6. Click &quot;Submit Examination&quot; when completed, or the system will automatically submit when time expires.
                  </>
                )}
              </div>

              {exam.negativeMarking && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Negative Marking Active:</strong> Incorrect answers incur a deduction of {exam.negativeMarkValue} marks. Unanswered questions do not deduct marks.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Student Verification / Start Exam Form */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 shadow-xl shadow-indigo-500/5 space-y-5 transition">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Image
                  src="/protech-assist-logo.png"
                  alt="ProTech Assist"
                  width={140}
                  height={36}
                  className="h-7 w-auto object-contain dark:brightness-110"
                />
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                  Secure Portal
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Start Candidate Attempt
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter your student credentials to initialize your proctored assessment session.
                </p>
              </div>

              <form onSubmit={handleStartExam} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fatmata Koroma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. fatmata@example.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Academy Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PRO-STU-8821"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    WhatsApp / Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="e.g. +232 78 000 000"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={starting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {starting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Initializing Attempt...
                    </>
                  ) : (
                    <>
                      Start Examination Now <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl py-6 px-6 text-center text-xs text-slate-500">
        <p>ProTech Assist Enterprise OS &bull; Online Examination Centre &bull; All Rights Reserved.</p>
      </footer>
    </div>
  );
}
