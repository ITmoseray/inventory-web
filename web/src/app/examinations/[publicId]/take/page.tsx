"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Flag,
  HelpCircle,
  Check,
  RotateCcw,
  Sun,
  Moon,
  LayoutGrid,
  ShieldAlert,
  Shield,
  Lock,
  EyeOff,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  startOrResumeExamAttempt,
  saveExamAnswer,
  toggleExamBookmark,
  submitExamAttempt,
  recordExamSecurityViolation,
} from "@/lib/actions/examination";

export default function ExaminationTakePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  // Security & Anti-Cheat State
  const [securityAgreed, setSecurityAgreed] = useState(false);
  const [securityTermsChecked, setSecurityTermsChecked] = useState(false);
  const [terminatedState, setTerminatedState] = useState<{
    isTerminated: boolean;
    reason: string;
    eventType?: string;
    timestamp?: string;
  } | null>(null);
  const departureReportedRef = useRef(false);

  // Submission Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mobile Question Palette Drawer Toggle
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger Security Departure (Immediate auto-termination & log)
  const triggerSecurityDeparture = useCallback(
    (eventType: string, defaultReason: string) => {
      if (departureReportedRef.current) return;
      departureReportedRef.current = true;

      const termReason = `Prohibited departure (${eventType}): ${defaultReason}`;
      setTerminatedState({
        isTerminated: true,
        reason: termReason,
        eventType,
        timestamp: new Date().toLocaleTimeString(),
      });

      // 1. Send beacon to keepalive API immediately
      try {
        const payload = JSON.stringify({
          attemptId,
          eventType,
          reason: termReason,
          details: {
            reportedVia: "client-departure-hook",
            timestamp: new Date().toISOString(),
          },
        });

        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          navigator.sendBeacon("/api/examinations/security-event", payload);
        } else {
          fetch("/api/examinations/security-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch (e) {
        console.error("Failed to send departure beacon:", e);
      }

      // 2. Call Server Action
      recordExamSecurityViolation({
        attemptId,
        eventType,
        reason: termReason,
      }).catch(() => {});
    },
    [attemptId]
  );

  // Load Attempt
  useEffect(() => {
    if (!publicId || !participantIdParam) {
      setError("Missing examination identification or student authorization.");
      setLoading(false);
      return;
    }

    setLoading(true);
    startOrResumeExamAttempt(publicId, participantIdParam, attemptIdParam)
      .then((res) => {
        if (!res.success) {
          if (res.isTerminated) {
            setTerminatedState({
              isTerminated: true,
              reason: res.error || "Examination attempt was terminated due to a security violation.",
            });
            setAttemptId(res.lastAttemptId || "");
            setLoading(false);
            return;
          }
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

        if (!res.exam.strictSecurity) {
          setSecurityAgreed(true);
        }

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

  // Anti-Cheat: Visibility Change, Blur, Unload Listeners
  useEffect(() => {
    if (!attemptId || !examData?.strictSecurity || !securityAgreed || terminatedState?.isTerminated) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerSecurityDeparture(
          "TAB_HIDDEN",
          "The candidate switched away from the examination window or opened another browser tab."
        );
      }
    };

    const handleWindowBlur = () => {
      triggerSecurityDeparture(
        "WINDOW_BLURRED",
        "The candidate minimized the browser window or switched focus to another application."
      );
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      triggerSecurityDeparture(
        "EXAM_PAGE_EXIT",
        "The candidate refreshed, closed, or navigated away from the proctored examination route."
      );
      e.preventDefault();
      e.returnValue = "Leaving this examination window will immediately terminate your session.";
      return e.returnValue;
    };

    const handlePageHide = () => {
      triggerSecurityDeparture(
        "EXAM_PAGE_EXIT",
        "The examination page was hidden or unloaded."
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [attemptId, examData, securityAgreed, terminatedState, triggerSecurityDeparture]);

  // Anti-Extraction: Block Key Shortcuts (DevTools, Copy, Paste, Cut, Source, Print)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (e.key === "F12") {
        e.preventDefault();
        toast.error("Developer tools shortcut disabled by examination security policy.");
        return;
      }

      if (isCtrlOrCmd) {
        const key = e.key.toLowerCase();
        if (["c", "x", "v", "u", "s", "p"].includes(key) || (e.shiftKey && ["i", "j", "c"].includes(key))) {
          e.preventDefault();
          toast.error(`Keyboard action [Ctrl+${e.key.toUpperCase()}] is prohibited during this examination.`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Server-Authoritative Countdown Interval
  useEffect(() => {
    if (!serverDeadline || terminatedState?.isTerminated) return;

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
  }, [serverDeadline, terminatedState]);

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

  if (terminatedState?.isTerminated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 transition-colors">
        <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top Warning Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600" />

          {/* Logo & Shield Icon */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <Image
              src="/protech-assist-logo.png"
              alt="ProTech Assist Logo"
              width={160}
              height={42}
              className="h-9 w-auto object-contain dark:brightness-110"
              priority
            />
            <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
              Session Terminated &bull; Departure Violation
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Examination Session Terminated
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              In accordance with ProTech Online Academy examination security regulations, your examination attempt was immediately terminated because the system detected a prohibited browser departure or tab switch.
            </p>
          </div>

          {/* Violation Details Box */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-xs text-left space-y-2.5">
            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 dark:text-slate-400 shrink-0">Violation Reason:</span>
              <span className="font-bold text-rose-700 dark:text-rose-300 text-right">
                {terminatedState.reason}
              </span>
            </div>
            {terminatedState.timestamp && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Recorded At:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{terminatedState.timestamp}</span>
              </div>
            )}
            <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/40 text-[11px] text-slate-600 dark:text-slate-300">
              <strong>Grading Safeguard:</strong> All answers submitted prior to departure have been securely autosaved and scored by the examination engine.
            </div>
          </div>

          {/* Admin Retake Instructions */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 text-left flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              Further attempts for this assessment are locked. If this departure was caused by an unexpected system disruption, please contact your <strong>Super Administrator</strong> to inspect your audit timeline and authorize a retake.
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {attemptId && (
              <Link
                href={`/examinations/${publicId}/result/${attemptId}`}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-500/20 text-center"
              >
                View Scored Results
              </Link>
            )}
            <Link
              href={`/examinations/${publicId}`}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition text-center"
            >
              Back to Exam Centre
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Initializing Secure Proctored Room...
          </p>
        </div>
      </div>
    );
  }

  if (error || !examData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Assessment Error</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error || "No examination questions available."}</p>
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
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        toast.error("Right-click context menu is disabled for examination security.");
      }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white transition-colors duration-300 select-none"
    >
      {/* Top Proctored Exam Header - Responsive for Mobile & Laptop */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
          {/* Main Top Row */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Academy Brand & Exam Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-sm p-1 overflow-hidden">
                <Image
                  src="/images/logo-192.png"
                  alt="ProTech Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">
                  {examData.courseTitle}
                </div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                  {examData.title}
                </h2>
              </div>
            </div>

            {/* Desktop Center: Live Timer Banner */}
            <div className="hidden md:flex items-center gap-3">
              <div
                className={`px-4 py-1.5 rounded-2xl border font-mono font-black text-sm lg:text-base flex items-center gap-2 transition shadow-xs ${
                  isCriticalTime
                    ? "bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse"
                    : isLowTime
                    ? "bg-amber-50 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/50 text-amber-700 dark:text-amber-300"
                    : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300"
                }`}
              >
                <Clock className={`w-4 h-4 ${isCriticalTime ? "text-rose-500" : "text-indigo-600 dark:text-indigo-400"}`} />
                <span>{formatTime(remainingSeconds)}</span>
              </div>

              {/* Autosave Status Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[10px] font-bold">
                {savingStatus === "saving" ? (
                  <>
                    <div className="w-2.5 h-2.5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-indigo-600 dark:text-indigo-300">Autosaving...</span>
                  </>
                ) : savingStatus === "saved" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-slate-500 dark:text-slate-400">Autosaved</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-rose-500">Save Error</span>
                  </>
                )}
              </div>
            </div>

            {/* Right: Controls & Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Theme Toggle Button */}
              {mounted && (
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-xs text-xs"
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

              {/* Mobile Palette Toggle Button */}
              <button
                type="button"
                onClick={() => setMobilePaletteOpen(!mobilePaletteOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-xs font-bold flex items-center gap-1"
                title="Toggle Question Palette"
              >
                <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] hidden sm:inline">Palette</span>
              </button>

              <button
                onClick={() => setSubmitModalOpen(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Submit</span> Exam
              </button>
            </div>
          </div>

          {/* Mobile Sub-Bar: Prominent Timer & Autosave */}
          <div className="md:hidden flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60 pt-2 text-xs">
            <div
              className={`px-3 py-1 rounded-xl border font-mono font-black text-xs flex items-center gap-1.5 ${
                isCriticalTime
                  ? "bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse"
                  : isLowTime
                  ? "bg-amber-50 dark:bg-amber-500/20 border-amber-300 text-amber-700 dark:text-amber-300"
                  : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
              {savingStatus === "saving" ? (
                <>
                  <div className="w-2 h-2 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Autosaved</span>
                </>
              )}
            </div>

            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              Q{currentIndex + 1} of {questions.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* LEFT: Active Question Card (8 Cols on laptop) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-5 sm:space-y-6 transition-colors">
              {/* Question Metadata Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-3 sm:pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {currentQ.category || "General"}
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {currentQ.marks} {currentQ.marks === 1 ? "Mark" : "Marks"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBookmark(currentQ.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isCurrentBookmarked
                        ? "bg-amber-500/15 border-amber-400 text-amber-700 dark:text-amber-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title={isCurrentBookmarked ? "Remove Bookmark" : "Bookmark Question"}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isCurrentBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                    <span className="text-[11px] sm:text-xs">{isCurrentBookmarked ? "Bookmarked" : "Bookmark"}</span>
                  </button>
                </div>
              </div>

              {/* Question Type Instruction */}
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {currentQ.questionType === "multiple_select" ? (
                  <span>Select ALL options that correctly apply (Multiple Choice).</span>
                ) : (
                  <span>Select ONE best option (Single Choice).</span>
                )}
              </div>

              {/* Question Prompt */}
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.questionText}
              </div>

              {/* Options Cards - Touch-friendly touch targets (min 48px height) */}
              <div className="space-y-2.5 sm:space-y-3 pt-2">
                {currentQ.options.map((opt: any) => {
                  const isSelected = currentSelection.includes(opt.id);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleOptionSelect(currentQ.id, opt.id, currentQ.questionType)}
                      className={`min-h-[50px] p-3.5 sm:p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 sm:gap-4 select-none ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-600/15 border-indigo-600 dark:border-indigo-500 text-indigo-950 dark:text-white font-bold ring-2 ring-indigo-500/20 shadow-sm"
                          : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {opt.label}
                        </div>
                        <span className="text-xs sm:text-sm leading-snug">{opt.optionText}</span>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Question Navigation Controls */}
              <div className="flex items-center justify-between gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentSelection.length > 0 && (
                    <button
                      onClick={() => handleClearSelection(currentQ.id)}
                      className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition"
                      title="Clear selection for this question"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-500/20"
                  >
                    Next <span className="hidden sm:inline">Question</span> <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setSubmitModalOpen(true)}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    Finish <span className="hidden sm:inline">&amp; Submit</span> <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT / DRAWER: Question Navigator Palette (4 Cols on laptop, collapsible on mobile) */}
          <div
            className={`lg:col-span-4 space-y-4 ${
              mobilePaletteOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4 sm:space-y-5 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Question Palette
                </h3>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
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
                      onClick={() => {
                        setCurrentIndex(idx);
                        setMobilePaletteOpen(false);
                      }}
                      className={`relative h-10 sm:h-11 rounded-xl font-black text-xs flex items-center justify-center transition cursor-pointer ${
                        isCurrent
                          ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 font-black scale-105 z-10"
                          : ""
                      } ${
                        isAnswered
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isBookmarked && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-emerald-600 shrink-0" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shrink-0" />
                  <span>Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md ring-2 ring-indigo-500 bg-slate-100 dark:bg-slate-800 shrink-0" />
                  <span>Current Q</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Flagged ({bookmarkedIds.size})</span>
                </div>
              </div>

              {/* Submit CTA button inside palette */}
              <div className="pt-2">
                <button
                  onClick={() => setSubmitModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Examination
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PRE-EXAM SECURITY & INTEGRITY AGREEMENT MODAL */}
      {!securityAgreed && examData?.strictSecurity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Examination Integrity &amp; Security Protocol
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This examination is proctored with automated anti-cheat monitoring. Please review the rules before entering:
              </p>
            </div>

            {/* Protocol Highlights */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                <EyeOff className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">Strict Single-Window Policy:</strong>
                  Switching away to another browser tab, opening another program, or minimizing this window will <strong>immediately terminate your examination</strong>.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">Authoritative Server Countdown:</strong>
                  The timer runs continuously on the server. Reloading or closing your browser will not reset or pause your time.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">Content Protection:</strong>
                  Text selection, copying, pasting, developer inspection tools, and printing shortcuts are disabled.
                </div>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 cursor-pointer">
              <input
                type="checkbox"
                checked={securityTermsChecked}
                onChange={(e) => setSecurityTermsChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-xs text-indigo-950 dark:text-indigo-200 font-semibold leading-relaxed">
                I confirm that I am {studentName}, and I agree to adhere to all examination integrity protocols. I acknowledge that leaving this window will terminate my session.
              </span>
            </label>

            <button
              type="button"
              disabled={!securityTermsChecked}
              onClick={() => setSecurityAgreed(true)}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-xs shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              Acknowledge &amp; Enter Examination Room
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUBMIT MODAL */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Submit Examination?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please review your answer summary before finalizing your submission. Once submitted, your answers will be locked and automatically scored.
              </p>
            </div>

            {/* Answer Summary Cards */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{questions.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">Answered</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{answeredCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold block">Unanswered</span>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400">{unansweredCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  You still have <strong>{unansweredCount} unanswered questions</strong>. You can return to answer them before submitting.
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmitModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
