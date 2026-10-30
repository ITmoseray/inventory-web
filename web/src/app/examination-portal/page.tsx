"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  Lock,
  Sun,
  Moon,
  Sparkles,
  Search,
  UserCheck,
  KeyRound,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  verifyStudentExaminationAccess,
  launchAuthorizedExamination,
  StudentVerificationResult,
} from "@/lib/actions/student-examination";

export default function StudentExaminationPortalPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Form Input State
  const [fullName, setFullName] = useState("");
  const [studentExamId, setStudentExamId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Verified Session State
  const [sessionData, setSessionData] = useState<StudentVerificationResult | null>(null);
  const [launchingExamId, setLaunchingExamId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError("Please enter your registered Full Name.");
      return;
    }
    if (!studentExamId.trim()) {
      setFormError("Please enter your unique Student Examination ID (e.g. PTA-OA-7K4M9X2Q).");
      return;
    }

    setVerifying(true);
    try {
      const res = await verifyStudentExaminationAccess(fullName, studentExamId);
      if (res.success && res.student) {
        setSessionData(res);
        toast.success(`Welcome, ${res.student.studentName}! Identity successfully verified.`);
      } else {
        setFormError(res.error || "Unable to verify student credentials.");
        toast.error(res.error || "Verification failed");
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected network error occurred.");
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleResetSession = () => {
    setSessionData(null);
    setFormError(null);
    setStudentExamId("");
  };

  const handleLaunchExam = async (examPublicId: string) => {
    if (!sessionData?.sessionToken) {
      toast.error("Session expired. Please verify your credentials again.");
      setSessionData(null);
      return;
    }

    setLaunchingExamId(examPublicId);
    try {
      const res = await launchAuthorizedExamination(sessionData.sessionToken, examPublicId);
      if (res.success && res.redirectUrl) {
        toast.success("Launching examination workspace...");
        router.push(res.redirectUrl);
      } else {
        toast.error(res.error || "Failed to launch examination room.");
        if (res.sessionExpired) {
          setSessionData(null);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to enter examination room.");
    } finally {
      setLaunchingExamId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-40 transition-colors shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link href="/examination-portal" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-sm p-1.5 overflow-hidden">
              <Image
                src="/images/logo-192.png"
                alt="ProTech Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 block">
                ProTech Online Academy
              </span>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                Student Examination Portal
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-xs text-xs"
                title="Toggle Light / Dark Mode"
                aria-label="Toggle Light / Dark Mode"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            )}

            <Link
              href="/super-admin/examinations"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Super Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Portal Viewport */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        {!sessionData ? (
          /* STEP 1: IDENTITY VERIFICATION FORM */
          <div className="max-w-xl mx-auto w-full space-y-6">
            {/* Header Card */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Authorized Student Access Point</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Verify Student Examination Identity
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Welcome to the ProTech Online Academy Examination Centre. Enter your registered full name and unique student examination ID to access your authorized assessment.
              </p>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{formError}</div>
              </div>
            )}

            {/* Verification Form Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 transition-colors">
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Mohamed Kamara"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                    Must match your official registration name with the academy.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Student Examination ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={studentExamId}
                      onChange={(e) => setStudentExamId(e.target.value.toUpperCase())}
                      placeholder="e.g. PTA-OA-7K4M9X2Q"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono text-sm uppercase tracking-wider font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                    Non-sequential student identifier provided by your course administrator.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={verifying}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm tracking-wide uppercase shadow-lg shadow-indigo-500/25 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Authorization...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Informational Guidance Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Administrator Authorization Policy:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Student registration alone does not automatically grant examination access. Each examination must be explicitly authorized by your Super Administrator before you can begin.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: VERIFIED STUDENT DASHBOARD & AUTHORIZED EXAM ROUTING */
          <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Student Identity Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      ✓ Identity Verified &bull; Active Candidate
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {sessionData.student?.studentName}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    ID: {sessionData.student?.studentId}
                  </div>
                  <button
                    onClick={handleResetSession}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Sign out of student portal session"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
                <span>
                  The following examinations have been explicitly approved by the Super Administrator for your account:
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {sessionData.authorizedExams?.length} Approved Programme(s)
                </span>
              </div>
            </div>

            {/* Authorized Examinations List */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Approved Examinations</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {sessionData.authorizedExams?.map((exam) => {
                  const isReady = exam.accessStatus === "READY";
                  const isLaunching = launchingExamId === exam.publicId;

                  return (
                    <div
                      key={exam.authorizationId}
                      className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                        isReady
                          ? "bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/80 shadow-md hover:shadow-xl dark:shadow-indigo-500/5 ring-1 ring-indigo-500/20"
                          : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80"
                      }`}
                    >
                      {/* Top Exam Info */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                            {exam.courseTitle}
                          </span>

                          {exam.hasActiveAttempt ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 animate-pulse">
                              In Progress
                            </span>
                          ) : isReady ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {exam.accessStatus}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                          {exam.title}
                        </h4>

                        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Duration</span>
                            <span className="font-black text-slate-800 dark:text-slate-200">{exam.durationMinutes} Mins</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Pass Mark</span>
                            <span className="font-black text-slate-800 dark:text-slate-200">{exam.passMarkPercentage}%</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Attempts</span>
                            <span className="font-black text-slate-800 dark:text-slate-200">
                              {exam.attemptsConsumed} of {exam.maxAttemptsAllowed}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status / Call to Action */}
                      <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800/80">
                        {isReady ? (
                          <button
                            onClick={() => handleLaunchExam(exam.publicId)}
                            disabled={isLaunching}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                          >
                            {isLaunching ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Entering Exam Room...</span>
                              </>
                            ) : exam.hasActiveAttempt ? (
                              <>
                                <span>Resume In-Progress Examination</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <span>Launch Examination Room</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                            {exam.statusMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {new Date().getFullYear()} ProTech Assist Online Academy &bull; Enterprise Examination Hub</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Secure Server Proctored</span>
            <span>&bull;</span>
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Academy Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
