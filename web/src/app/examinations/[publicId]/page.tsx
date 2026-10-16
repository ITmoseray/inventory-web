"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  getPublicExamByPublicId,
  verifyOrRegisterParticipant,
  startOrResumeExamAttempt,
} from "@/lib/actions/examination";

export default function ExaminationEntryPage() {
  const params = useParams();
  const router = useRouter();
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">
            Connecting to ProTech Online Academy Examination Vault...
          </p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-800/80 border border-slate-700 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">Examination Unavailable</h2>
          <p className="text-xs text-slate-400">{error || "The requested examination could not be loaded."}</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-indigo-400 tracking-wider uppercase">
                ProTech Online Academy
              </div>
              <div className="text-sm font-black text-white tracking-tight">
                Examination &amp; Assessment Centre
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Examination Node
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8">
        {/* Examination Title & Program Banner */}
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              {exam.courseBadge || exam.courseTitle}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-400">
              {exam.publicId}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {exam.title}
            </h1>
            {exam.description && (
              <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                {exam.description}
              </p>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                <span className="text-base font-black text-white">{exam.durationMinutes} Minutes</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Questions</span>
                <span className="text-base font-black text-white">{exam.totalQuestions} Questions</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pass Threshold</span>
                <span className="text-base font-black text-emerald-400">{exam.passMarkPercentage}%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allowed Attempts</span>
                <span className="text-base font-black text-white">{exam.maxAttempts} Attempt{exam.maxAttempts > 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Instructions & Registration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Instructions Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" /> Candidate Examination Instructions
              </h3>

              <div className="text-xs text-slate-300 space-y-3 leading-relaxed whitespace-pre-line font-medium">
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
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
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
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">
                  Identity Verification
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Start Candidate Attempt
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your student credentials to initialize your proctored assessment session.
                </p>
              </div>

              <form onSubmit={handleStartExam} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fatmata Koroma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. fatmata@example.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Academy Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PRO-STU-8821"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    WhatsApp / Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="e.g. +232 78 000 000"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={starting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-xl py-6 px-6 text-center text-xs text-slate-500">
        <p>ProTech Assist Enterprise OS &bull; Online Examination Centre &bull; All Rights Reserved.</p>
      </footer>
    </div>
  );
}
