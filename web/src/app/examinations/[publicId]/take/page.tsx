"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Flag,
  HelpCircle,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  startOrResumeExamAttempt,
  saveExamAnswer,
  toggleExamBookmark,
  submitExamAttempt,
} from "@/lib/actions/examination";

export default function ExaminationTakePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const publicId = typeof params.publicId === "string" ? params.publicId : "";
  const attemptIdParam = searchParams.get("attemptId") || "";
  const participantIdParam = searchParams.get("participantId") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Attempt Data
  const [attemptId, setAttemptId] = useState<string>("");
  const [examData, setExamData] = useState<any>(null);
  const [studentName, setStudentName] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);

  // Interactive Exam Room State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [savingStatus, setSavingStatus] = useState<"saved" | "saving" | "error">("saved");

  // Timer State
  const [serverDeadline, setServerDeadline] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Submission Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load Attempt
  useEffect(() => {
    if (!publicId || !participantIdParam) {
      setError("Missing examination identification or student authorization.");
      setLoading(false);
      return;
    }

    setLoading(true);
    startOrResumeExamAttempt(publicId, participantIdParam)
      .then((res) => {
        if (!res.success) {
          setError(res.error || "Failed to load examination attempt.");
          setLoading(false);
          return;
        }

        setAttemptId(res.attemptId!);
        setExamData(res.exam);
        setStudentName(res.studentName || "Student Candidate");
        setQuestions(res.questions || []);
        setSelectedAnswers(res.savedAnswers || {});
        setBookmarkedIds(new Set(res.bookmarkedQuestionIds || []));

        if (res.serverDeadline) {
          const deadline = new Date(res.serverDeadline);
          setServerDeadline(deadline);
          const initialRemaining = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
          setRemainingSeconds(initialRemaining);
        }

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to initialize examination.");
        setLoading(false);
      });
  }, [publicId, participantIdParam]);

  // Server-Authoritative Countdown Interval
  useEffect(() => {
    if (!serverDeadline) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((serverDeadline.getTime() - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
        handleAutoSubmitOnTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [serverDeadline]);

  // Automatic submission when timer expires
  const handleAutoSubmitOnTimeout = async () => {
    if (submitting) return;
    setSubmitting(true);
    toast.error("Time has expired! Automatically submitting your examination...");

    try {
      const res = await submitExamAttempt(attemptId);
      if (res.success) {
        router.push(`/examinations/${publicId}/result/${attemptId}`);
      } else {
        toast.error(res.error || "Failed to finalize examination.");
      }
    } catch (err: any) {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Option Click Handler
  const handleOptionSelect = async (questionId: string, optionId: string, questionType: string) => {
    const currentSelected = selectedAnswers[questionId] || [];
    let updatedSelected: string[] = [];

    if (questionType === "single_choice") {
      updatedSelected = [optionId];
    } else {
      // Multiple select toggle
      if (currentSelected.includes(optionId)) {
        updatedSelected = currentSelected.filter((id) => id !== optionId);
      } else {
        updatedSelected = [...currentSelected, optionId];
      }
    }

    // Update local state immediately
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: updatedSelected,
    }));

    // Autosave to server
    setSavingStatus("saving");
    try {
      const res = await saveExamAnswer(attemptId, questionId, updatedSelected);
      if (res.success) {
        setSavingStatus("saved");
      } else {
        if (res.isTimedOut) {
          toast.error("Examination time has expired.");
          router.push(`/examinations/${publicId}/result/${attemptId}`);
        } else {
          setSavingStatus("error");
          toast.error(res.error || "Failed to autosave answer");
        }
      }
    } catch (err) {
      setSavingStatus("error");
    }
  };

  // Clear Selection Handler
  const handleClearSelection = async (questionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: [],
    }));

    setSavingStatus("saving");
    try {
      const res = await saveExamAnswer(attemptId, questionId, []);
      if (res.success) {
        setSavingStatus("saved");
      }
    } catch (err) {
      setSavingStatus("error");
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = async (questionId: string) => {
    const isBookmarked = bookmarkedIds.has(questionId);
    const newSet = new Set(bookmarkedIds);
    if (isBookmarked) {
      newSet.delete(questionId);
    } else {
      newSet.add(questionId);
    }
    setBookmarkedIds(newSet);

    try {
      await toggleExamBookmark(attemptId, questionId);
    } catch (err) {
      console.error("Failed to bookmark question:", err);
    }
  };

  // Submit Examination Handler
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitExamAttempt(attemptId);
      if (res.success) {
        toast.success("Examination submitted and scored successfully!");
        setSubmitModalOpen(false);
        router.push(`/examinations/${publicId}/result/${attemptId}`);
      } else {
        toast.error(res.error || "Submission failed");
        setSubmitting(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to finalize examination");
      setSubmitting(false);
    }
  };

  // Format Timer
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">
            Initializing Secure Proctored Room...
          </p>
        </div>
      </div>
    );
  }

  if (error || !examData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-white">Assessment Error</h2>
          <p className="text-xs text-slate-400">{error || "No examination questions available."}</p>
          <Link
            href={`/examinations/${publicId}`}
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Back to Entry
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.values(selectedAnswers).filter((arr) => arr.length > 0).length;
  const unansweredCount = questions.length - answeredCount;
  const isCurrentBookmarked = bookmarkedIds.has(currentQ.id);
  const currentSelection = selectedAnswers[currentQ.id] || [];

  const isLowTime = remainingSeconds < 300; // < 5 mins
  const isCriticalTime = remainingSeconds < 60; // < 1 min

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Proctored Exam Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Academy Brand & Exam Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider truncate">
                {examData.courseTitle}
              </div>
              <h2 className="text-xs sm:text-sm font-black text-white truncate">
                {examData.title}
              </h2>
            </div>
          </div>

          {/* Center: Live Timer Banner */}
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-2xl border font-mono font-black text-sm sm:text-base flex items-center gap-2 transition shadow-lg ${
                isCriticalTime
                  ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                  : isLowTime
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                  : "bg-slate-800/80 border-slate-700 text-indigo-300"
              }`}
            >
              <Clock className={`w-4 h-4 ${isCriticalTime ? "text-rose-400" : "text-indigo-400"}`} />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            {/* Autosave Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[10px] font-bold">
              {savingStatus === "saving" ? (
                <>
                  <div className="w-2.5 h-2.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-indigo-300">Autosaving...</span>
                </>
              ) : savingStatus === "saved" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">Autosaved</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-400">Save Error</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Candidate Badge & Finish CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold text-white truncate max-w-[140px]">
                {studentName}
              </div>
              <div className="text-[10px] text-slate-400">Candidate</div>
            </div>

            <button
              onClick={() => setSubmitModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Submit Exam
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Active Question Card (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
              {/* Question Metadata Header */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                    {currentQ.category || "General"}
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {currentQ.marks} {currentQ.marks === 1 ? "Mark" : "Marks"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBookmark(currentQ.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                      isCurrentBookmarked
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                    title={isCurrentBookmarked ? "Remove Bookmark" : "Bookmark Question"}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isCurrentBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                    <span>{isCurrentBookmarked ? "Bookmarked" : "Bookmark"}</span>
                  </button>
                </div>
              </div>

              {/* Question Type Instruction */}
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                {currentQ.questionType === "multiple_select" ? (
                  <span>Select ALL options that correctly apply.</span>
                ) : (
                  <span>Select ONE best option.</span>
                )}
              </div>

              {/* Question Prompt */}
              <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.questionText}
              </div>

              {/* Options Cards */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt: any) => {
                  const isSelected = currentSelection.includes(opt.id);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleOptionSelect(currentQ.id, opt.id, currentQ.questionType)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 select-none ${
                        isSelected
                          ? "bg-indigo-600/15 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/50 shadow-md shadow-indigo-500/10"
                          : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {opt.label}
                        </div>
                        <span className="text-xs sm:text-sm leading-snug">{opt.optionText}</span>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Question Navigation Controls */}
              <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-800/80">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentSelection.length > 0 && (
                    <button
                      onClick={() => handleClearSelection(currentQ.id)}
                      className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition"
                      title="Clear answer for this question"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </div>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-500/20"
                  >
                    Next Question <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setSubmitModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    Review &amp; Submit <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Question Navigator Palette (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white">
                  Question Palette
                </h3>
                <span className="text-[11px] font-bold text-indigo-400">
                  {answeredCount}/{questions.length} Answered
                </span>
              </div>

              {/* Question Number Buttons Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = (selectedAnswers[q.id] || []).length > 0;
                  const isBookmarked = bookmarkedIds.has(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative h-11 rounded-xl font-black text-xs flex items-center justify-center transition cursor-pointer ${
                        isCurrent
                          ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 font-black scale-105 z-10"
                          : ""
                      } ${
                        isAnswered
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                          : "bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isBookmarked && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800 text-[10px] text-slate-400 font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-600" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-slate-800 border border-slate-700" />
                  <span>Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md ring-2 ring-indigo-400 bg-slate-800" />
                  <span>Current Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span>Bookmarked ({bookmarkedIds.size})</span>
                </div>
              </div>

              {/* Submit CTA button */}
              <div className="pt-2">
                <button
                  onClick={() => setSubmitModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Examination
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CONFIRMATION SUBMIT MODAL */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Submit Examination?
              </h3>
              <p className="text-xs text-slate-400">
                Please review your answer summary before finalizing your submission. Once submitted, your answers will be locked and automatically scored.
              </p>
            </div>

            {/* Answer Summary Cards */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total</span>
                <span className="text-lg font-black text-white">{questions.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Answered</span>
                <span className="text-lg font-black text-emerald-400">{answeredCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">Unanswered</span>
                <span className="text-lg font-black text-rose-400">{unansweredCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  You still have <strong>{unansweredCount} unanswered questions</strong>. You can return to answer them before submitting.
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmitModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Return to Questions
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Confirm &amp; Submit</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
