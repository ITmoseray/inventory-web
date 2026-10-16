"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  ShieldCheck,
  ArrowLeft,
  Printer,
  Sparkles,
  HelpCircle,
  Check,
  X,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { getStudentExamResult } from "@/lib/actions/examination";

export default function StudentExamResultPage() {
  const params = useParams();
  const publicId = typeof params.publicId === "string" ? params.publicId : "";
  const attemptId = typeof params.attemptId === "string" ? params.attemptId : "";

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;

    setLoading(true);
    getStudentExamResult(attemptId)
      .then((res) => {
        if (res.success) {
          setResult(res);
        } else {
          setError(res.error || "Result could not be loaded.");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load examination result.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [attemptId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">
            Calculating Official Examination Performance Scorecard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">Scorecard Unavailable</h2>
          <p className="text-xs text-slate-400">{error || "Unable to retrieve examination result."}</p>
          <Link
            href={`/examinations/${publicId}`}
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
          >
            Return to Examination Entry
          </Link>
        </div>
      </div>
    );
  }

  // If results are withheld for administrative review
  if (!result.isPublished) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
        <div className="max-w-xl mx-auto my-auto w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
              Receipt of Submission
            </span>
            <h2 className="text-2xl font-black text-white">
              Examination Submitted Successfully
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {result.message}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Candidate:</span>
              <span className="font-bold text-white">{result.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Course:</span>
              <span className="font-bold text-white">{result.courseTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Submission Timestamp:</span>
              <span className="font-mono text-slate-300">
                {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : "Just now"}
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
          >
            Return to Academy Home
          </Link>
        </div>
      </div>
    );
  }

  const isPassed = result.passed;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white print:bg-white print:text-black">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/examinations/${publicId}`}
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Examination Hub
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Scorecard
            </button>
          </div>
        </div>
      </header>

      {/* Main Scorecard Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8 flex-1">
        {/* Outcome Banner */}
        <div
          className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 shadow-2xl relative overflow-hidden ${
            isPassed
              ? "bg-gradient-to-b from-emerald-950/40 to-slate-900/90 border-emerald-500/40 shadow-emerald-500/10"
              : "bg-gradient-to-b from-rose-950/40 to-slate-900/90 border-rose-500/40 shadow-rose-500/10"
          }`}
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            {isPassed ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> OFFICIAL CERTIFICATION ACHIEVED
              </span>
            ) : (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" /> BELOW PASSING THRESHOLD
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              {isPassed ? "Congratulations, " + result.studentName + "!" : "Assessment Completed"}
            </h1>
            <p className="text-sm font-semibold text-slate-300">
              {result.examTitle} &bull; {result.courseTitle}
            </p>
          </div>

          {/* Primary Score Ring / Numbers */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 pt-4">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-inner min-w-[200px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Final Grade
              </span>
              <div
                className={`text-4xl sm:text-5xl font-black mt-1 ${
                  isPassed ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {result.percentage}%
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Pass Mark: {result.passMarkPercentage}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Marks Earned</span>
                <span className="text-lg font-black text-white">
                  {result.scoreObtained} / {result.maxScore}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Correct Answers</span>
                <span className="text-lg font-black text-emerald-400">
                  {result.correctAnswers} / {result.totalQuestions}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Incorrect Answers</span>
                <span className="text-lg font-black text-rose-400">
                  {result.incorrectAnswers}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Time Taken</span>
                <span className="text-lg font-black text-indigo-300">
                  {Math.round((result.timeSpentSeconds || 0) / 60)} Mins
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate & Assessment Details */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Candidate Record</span>
            <span className="font-bold text-white text-sm block">{result.studentName}</span>
            <span className="text-slate-500 font-mono">{result.studentEmail}</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Submitted Timestamp</span>
            <span className="font-bold text-slate-200 block">
              {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : "Just now"}
            </span>
            <span className="text-slate-500 font-mono">Status: Authenticated &amp; Scored</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Issuing Authority</span>
            <span className="font-bold text-indigo-400 block">ProTech Online Academy</span>
            <span className="text-slate-500">Enterprise OS Examination Centre</span>
          </div>
        </div>

        {/* Question-by-Question Review (if enabled) */}
        {result.allowAnswerReview && result.reviewQuestions && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" /> Detailed Question Performance Review
              </h3>
              <span className="text-xs text-slate-400 font-bold">
                {result.reviewQuestions.length} Questions Reviewed
              </span>
            </div>

            <div className="space-y-4">
              {result.reviewQuestions.map((q: any, idx: number) => {
                const isCorrect = q.isCorrect;

                return (
                  <div
                    key={q.id}
                    className={`p-6 rounded-3xl border transition space-y-4 ${
                      isCorrect
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : "bg-rose-950/20 border-rose-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                              {q.category}
                            </span>
                            <span
                              className={`text-[11px] font-bold ${
                                isCorrect ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isCorrect ? `+${q.marksAwarded} Marks Awarded` : "0 Marks Awarded"}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-white leading-relaxed">
                            {q.questionText}
                          </p>
                        </div>
                      </div>

                      <div>
                        {isCorrect ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Correct
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <X className="w-3 h-3" /> Incorrect
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Options Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10 text-xs">
                      {q.options.map((opt: any) => {
                        const isStudentChoice = (q.selectedOptionIds || []).includes(opt.id);
                        const isOptionCorrect = opt.isCorrect;

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                              isOptionCorrect
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-bold"
                                : isStudentChoice && !isOptionCorrect
                                ? "bg-rose-500/15 border-rose-500/40 text-rose-200 line-through"
                                : "bg-slate-800/40 border-slate-700/60 text-slate-400"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] ${
                                  isOptionCorrect
                                    ? "bg-emerald-600 text-white"
                                    : isStudentChoice
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-700 text-slate-400"
                                }`}
                              >
                                {opt.label}
                              </span>
                              <span>{opt.optionText}</span>
                            </div>

                            <div className="text-[10px] font-bold">
                              {isStudentChoice && isOptionCorrect && (
                                <span className="text-emerald-400">Your Answer (Correct)</span>
                              )}
                              {isStudentChoice && !isOptionCorrect && (
                                <span className="text-rose-400">Your Answer</span>
                              )}
                              {!isStudentChoice && isOptionCorrect && (
                                <span className="text-emerald-400">Correct Key</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="pl-10 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60 leading-relaxed">
                        <strong className="text-indigo-400">Learning Rationalization:</strong>{" "}
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-xl py-6 px-6 text-center text-xs text-slate-500 print:hidden">
        <p>ProTech Assist Enterprise OS &bull; Online Examination Centre &bull; Verification ID: {attemptId}</p>
      </footer>
    </div>
  );
}
