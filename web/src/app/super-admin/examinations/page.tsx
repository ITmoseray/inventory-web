"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Activity,
  FileCheck,
  XCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  Share2,
  FileSpreadsheet,
  Eye,
  BookOpen,
  Layers,
  Settings2,
  ArrowLeft,
  HelpCircle,
  Check,
  X,
  ChevronRight,
  Info,
  Sparkles,
  Brain,
  Megaphone,
  AlertTriangle,
  Download,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  getSuperAdminExamStats,
  getSuperAdminExams,
  getExamCourses,
  createExamCourse,
  createExamination,
  updateExamination,
  setExaminationStatus,
  getExamQuestionsForAdmin,
  createExamQuestion,
  updateExamQuestion,
  deleteExamQuestion,
  bulkImportQuestions,
  getSuperAdminExamResults,
  publishExamResults,
  exportExamResultsCsv,
  seedStarterExaminationsIfEmpty,
} from "@/lib/actions/examination";

export default function SuperAdminExaminationsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"exams" | "questions" | "results" | "courses">("exams");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Exams List state
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Create / Edit Examination Modal
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examForm, setExamForm] = useState({
    title: "",
    courseId: "",
    description: "",
    instructions: "1. Read each question carefully before selecting an answer.\n2. Answer all objective questions before submitting.\n3. You can bookmark and review questions.\n4. Countdown timer is strictly enforced.",
    durationMinutes: 30,
    passMarkPercentage: 70,
    maxAttempts: 1,
    accessMode: "open_verified" as "open_verified" | "restricted",
    resultReleaseMode: "immediate" as "immediate" | "manual",
    allowAnswerReview: true,
    negativeMarking: false,
    negativeMarkValue: 0.25,
    allowNavigation: true,
    allowBookmarks: true,
  });

  // Question Bank state
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState<string>("");
  const [currentQuestionsData, setCurrentQuestionsData] = useState<any>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    questionType: "single_choice" as "single_choice" | "multiple_select",
    category: "General",
    marks: 1,
    explanation: "",
    options: [
      { label: "A", optionText: "", isCorrect: true },
      { label: "B", optionText: "", isCorrect: false },
      { label: "C", optionText: "", isCorrect: false },
      { label: "D", optionText: "", isCorrect: false },
    ],
  });

  // Bulk Import Questions state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState("");

  // Submissions & Results State
  const [selectedExamForResults, setSelectedExamForResults] = useState<string>("");
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsSearch, setResultsSearch] = useState("");
  const [resultsStatusFilter, setResultsStatusFilter] = useState("ALL");
  const [inspectAttemptModalOpen, setInspectAttemptModalOpen] = useState(false);
  const [selectedAttemptForInspection, setSelectedAttemptForInspection] = useState<any>(null);

  // New Course Modal
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "",
    code: "",
    description: "",
    badge: "Academy Core Programme",
  });

  // Share Dialog state
  const [shareExamModalOpen, setShareExamModalOpen] = useState(false);
  const [selectedExamForShare, setSelectedExamForShare] = useState<any>(null);

  // Initial Load
  const loadInitialData = async () => {
    try {
      setLoading(true);
      await seedStarterExaminationsIfEmpty();

      const [statsRes, coursesRes, examsRes] = await Promise.all([
        getSuperAdminExamStats(),
        getExamCourses(),
        getSuperAdminExams({ courseId: courseFilter, status: statusFilter, search: searchQuery }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (coursesRes.success) {
        setCourses(coursesRes.courses);
        if (coursesRes.courses.length > 0 && !examForm.courseId) {
          setExamForm((prev) => ({ ...prev, courseId: coursesRes.courses[0].id }));
        }
      }
      if (examsRes.success) {
        setExams(examsRes.exams);
        if (examsRes.exams.length > 0) {
          if (!selectedExamForQuestions) setSelectedExamForQuestions(examsRes.exams[0].id);
          if (!selectedExamForResults) setSelectedExamForResults(examsRes.exams[0].id);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load examination suite data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadInitialData();
  }, []);

  // Filter reloads
  useEffect(() => {
    if (!loading) {
      getSuperAdminExams({ courseId: courseFilter, status: statusFilter, search: searchQuery }).then((res) => {
        if (res.success) setExams(res.exams);
      });
    }
  }, [courseFilter, statusFilter, searchQuery]);

  // Load questions when selectedExamForQuestions changes
  useEffect(() => {
    if (selectedExamForQuestions) {
      setLoadingQuestions(true);
      getExamQuestionsForAdmin(selectedExamForQuestions).then((res) => {
        if (res.success) {
          setCurrentQuestionsData(res);
        } else {
          toast.error(res.error || "Failed to load questions");
        }
        setLoadingQuestions(false);
      });
    }
  }, [selectedExamForQuestions]);

  // Load results when selectedExamForResults changes
  useEffect(() => {
    if (selectedExamForResults) {
      setLoadingResults(true);
      getSuperAdminExamResults(selectedExamForResults, {
        search: resultsSearch,
        status: resultsStatusFilter,
      }).then((res) => {
        if (res.success) {
          setResultsData(res.results || res.submissions || []);
        } else {
          setResultsData([]);
          toast.error(res.error || "Failed to load results");
        }
        setLoadingResults(false);
      }).catch(() => {
        setResultsData([]);
        setLoadingResults(false);
      });
    }
  }, [selectedExamForResults, resultsSearch, resultsStatusFilter]);

  // Actions
  const handleOpenCreateExam = () => {
    setEditingExamId(null);
    setExamForm({
      title: "",
      courseId: courses[0]?.id || "",
      description: "",
      instructions: "1. Read each question carefully before selecting an answer.\n2. Answer all objective questions before submitting.\n3. You can bookmark and review questions.\n4. Countdown timer is strictly enforced.",
      durationMinutes: 30,
      passMarkPercentage: 70,
      maxAttempts: 1,
      accessMode: "open_verified",
      resultReleaseMode: "immediate",
      allowAnswerReview: true,
      negativeMarking: false,
      negativeMarkValue: 0.25,
      allowNavigation: true,
      allowBookmarks: true,
    });
    setExamModalOpen(true);
  };

  const handleOpenEditExam = (exam: any) => {
    setEditingExamId(exam.id);
    setExamForm({
      title: exam.title,
      courseId: exam.courseId,
      description: exam.description || "",
      instructions: exam.instructions || "",
      durationMinutes: exam.durationMinutes,
      passMarkPercentage: exam.passMarkPercentage,
      maxAttempts: exam.maxAttempts,
      accessMode: exam.accessMode,
      resultReleaseMode: exam.resultReleaseMode,
      allowAnswerReview: exam.allowAnswerReview,
      negativeMarking: exam.negativeMarking,
      negativeMarkValue: exam.negativeMarkValue,
      allowNavigation: exam.allowNavigation ?? true,
      allowBookmarks: exam.allowBookmarks ?? true,
    });
    setExamModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.title.trim() || !examForm.courseId) {
      toast.error("Please provide examination title and course programme");
      return;
    }

    try {
      if (editingExamId) {
        const res = await updateExamination(editingExamId, examForm);
        if (res.success) {
          toast.success("Examination updated successfully!");
          setExamModalOpen(false);
          loadInitialData();
        } else {
          toast.error(res.error || "Update failed");
        }
      } else {
        const res = await createExamination(examForm);
        if (res.success) {
          toast.success("Examination created successfully!");
          setExamModalOpen(false);
          loadInitialData();
        } else {
          toast.error(res.error || "Creation failed");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    }
  };

  const handleStatusChange = async (examId: string, newStatus: "draft" | "published" | "archived") => {
    try {
      const res = await setExaminationStatus(examId, newStatus);
      if (res.success) {
        toast.success(`Examination status changed to ${newStatus.toUpperCase()}`);
        loadInitialData();
      } else {
        toast.error(res.error || "Status update failed");
      }
    } catch (err: any) {
      toast.error("Status update failed");
    }
  };

  const handleCopyLink = (publicId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/examinations/${publicId}`;
    navigator.clipboard.writeText(url);
    toast.success("Examination link copied to clipboard!");
  };

  const handleOpenShareModal = (exam: any) => {
    setSelectedExamForShare(exam);
    setShareExamModalOpen(true);
  };

  // Question Actions
  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQuestionForm({
      questionText: "",
      questionType: "single_choice",
      category: "General",
      marks: 1,
      explanation: "",
      options: [
        { label: "A", optionText: "", isCorrect: true },
        { label: "B", optionText: "", isCorrect: false },
        { label: "C", optionText: "", isCorrect: false },
        { label: "D", optionText: "", isCorrect: false },
      ],
    });
    setQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestionId(q.id);
    setQuestionForm({
      questionText: q.questionText,
      questionType: q.questionType,
      category: q.category || "General",
      marks: q.marks,
      explanation: q.explanation || "",
      options: q.options.map((o: any) => ({
        label: o.label,
        optionText: o.optionText,
        isCorrect: o.isCorrect,
      })),
    });
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.questionText.trim()) {
      toast.error("Please enter question text");
      return;
    }
    const hasCorrect = questionForm.options.some((o) => o.isCorrect);
    if (!hasCorrect) {
      toast.error("At least one option must be marked as correct");
      return;
    }

    try {
      if (editingQuestionId) {
        const res = await updateExamQuestion(editingQuestionId, questionForm);
        if (res.success) {
          toast.success("Question updated!");
          setQuestionModalOpen(false);
          // Reload questions
          const qRes = await getExamQuestionsForAdmin(selectedExamForQuestions);
          if (qRes.success) setCurrentQuestionsData(qRes);
          loadInitialData();
        } else {
          toast.error(res.error || "Update failed");
        }
      } else {
        const res = await createExamQuestion(selectedExamForQuestions, questionForm);
        if (res.success) {
          toast.success("Question created!");
          setQuestionModalOpen(false);
          const qRes = await getExamQuestionsForAdmin(selectedExamForQuestions);
          if (qRes.success) setCurrentQuestionsData(qRes);
          loadInitialData();
        } else {
          toast.error(res.error || "Creation failed");
        }
      }
    } catch (err: any) {
      toast.error("Failed to save question");
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await deleteExamQuestion(qId);
      if (res.success) {
        toast.success("Question deleted");
        const qRes = await getExamQuestionsForAdmin(selectedExamForQuestions);
        if (qRes.success) setCurrentQuestionsData(qRes);
        loadInitialData();
      } else {
        toast.error(res.error || "Delete failed");
      }
    } catch (err) {
      toast.error("Failed to delete question");
    }
  };

  // Bulk Import Questions
  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkJsonText);
      if (!Array.isArray(parsed)) {
        toast.error("JSON must be an array of questions");
        return;
      }
      const res = await bulkImportQuestions(selectedExamForQuestions, parsed);
      if (res.success) {
        toast.success(`Successfully imported ${res.count} questions!`);
        setBulkModalOpen(false);
        setBulkJsonText("");
        const qRes = await getExamQuestionsForAdmin(selectedExamForQuestions);
        if (qRes.success) setCurrentQuestionsData(qRes);
        loadInitialData();
      } else {
        toast.error(res.error || "Import failed");
      }
    } catch (err: any) {
      toast.error("Invalid JSON format: " + err.message);
    }
  };

  // Results & Publication
  const handlePublishResults = async () => {
    if (!confirm("Are you sure you want to publish results for all candidates of this examination? They will immediately be able to view their scores and answer breakdowns.")) return;
    try {
      const res = await publishExamResults(selectedExamForResults);
      if (res.success) {
        toast.success(res.message);
        const rRes = await getSuperAdminExamResults(selectedExamForResults);
        if (rRes.success) setResultsData(rRes.results || rRes.submissions || []);
      } else {
        toast.error(res.error || "Failed to publish results");
      }
    } catch (err) {
      toast.error("Failed to publish results");
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await exportExamResultsCsv(selectedExamForResults);
      if (res.success && res.csvContent) {
        const blob = new Blob([res.csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", res.filename || "exam-results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Results CSV downloaded successfully!");
      } else {
        toast.error(res.error || "Export failed");
      }
    } catch (err) {
      toast.error("Export failed");
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim() || !courseForm.code.trim()) {
      toast.error("Course title and code are required");
      return;
    }
    try {
      const res = await createExamCourse(courseForm);
      if (res.success) {
        toast.success("Course programme created!");
        setCourseModalOpen(false);
        const cRes = await getExamCourses();
        if (cRes.success) setCourses(cRes.courses);
      } else {
        toast.error(res.error || "Course creation failed");
      }
    } catch (err) {
      toast.error("Failed to create course");
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-md p-1.5 overflow-hidden mt-0.5">
            <Image
              src="/images/logo-192.png"
              alt="ProTech Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/super-admin"
                className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Super Admin Center
              </Link>
              <span className="text-slate-400">&bull;</span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                ProTech Online Academy
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Online Examination Centre
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Schedule objective academic evaluations for Affiliate Marketing, AI Masterclass, and enterprise courses with real-time server-authoritative timer, automated proctoring, and instant certification grading.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition"
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

          <button
            onClick={loadInitialData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition"
            title="Refresh All Examination Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreateExam}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Examination
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Examinations</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats?.totalExams || 0}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            {stats?.publishedExams || 0} live published
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Drafts</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats?.draftExams || 0}
          </div>
          <div className="text-[10px] text-slate-400">in preparation</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Participants</span>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats?.totalParticipants || 0}
          </div>
          <div className="text-[10px] text-slate-400">registered candidates</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Taking</span>
          <div className="text-xl sm:text-2xl font-black text-amber-500 animate-pulse">
            {stats?.activeTaking || 0}
          </div>
          <div className="text-[10px] text-amber-600 font-bold">in progress now</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submissions</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats?.completed || 0}
          </div>
          <div className="text-[10px] text-slate-400">graded attempts</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passed</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats?.passed || 0}
          </div>
          <div className="text-[10px] text-emerald-500 font-bold">certified</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Failed</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {stats?.failed || 0}
          </div>
          <div className="text-[10px] text-slate-400">below pass mark</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pass Rate</span>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
            {stats?.overallPassRate || 0}%
          </div>
          <div className="text-[10px] text-slate-400">avg {stats?.averageScore || 0}%</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: "exams", label: `Examinations Catalog (${exams.length})`, icon: GraduationCap },
          { id: "questions", label: "Question Banks & Curricula", icon: BookOpen },
          { id: "results", label: "Submissions, Grading & Records", icon: Award },
          { id: "courses", label: `Programmes & Courses (${courses.length})`, icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-sm"
                  : "bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: EXAMINATIONS CATALOG */}
      {/* ============================================================== */}
      {activeTab === "exams" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search examination title, course, or public ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Programmes</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="published">Published (Live)</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Examinations List */}
          {exams.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                No examinations found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No examinations match your current filters. Create a new examination or adjust search parameters.
              </p>
              <button
                onClick={handleOpenCreateExam}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition"
              >
                + Create Examination
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map((exam) => {
                const isPublished = exam.status === "published";
                const isDraft = exam.status === "draft";
                const isArchived = exam.status === "archived";

                return (
                  <div
                    key={exam.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Course badge & status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                          {exam.courseTitle}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : isDraft
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {isPublished && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {exam.status}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        {exam.title}
                      </h3>

                      <p className="text-xs font-mono font-bold text-slate-400 mt-1">
                        Code: {exam.publicId}
                      </p>

                      {exam.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                          {exam.description}
                        </p>
                      )}

                      {/* Specs Matrix */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div>
                          <span className="text-slate-400">Duration:</span>{" "}
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {exam.durationMinutes} Mins
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Questions:</span>{" "}
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {exam.totalQuestions} Questions
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Pass Mark:</span>{" "}
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {exam.passMarkPercentage}%
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Max Attempts:</span>{" "}
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {exam.maxAttempts}x
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Candidates:</span>{" "}
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {exam.totalParticipants} registered
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Pass Rate:</span>{" "}
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {exam.passRate}% ({exam.passedCount}P/{exam.failedCount}F)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedExamForQuestions(exam.id);
                            setActiveTab("questions");
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Questions ({exam.totalQuestions})
                        </button>

                        <button
                          onClick={() => {
                            setSelectedExamForResults(exam.id);
                            setActiveTab("results");
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <Award className="w-3.5 h-3.5 text-purple-500" /> Results ({exam.completedCount})
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(exam.publicId)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          title="Copy Student Link"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Link
                        </button>

                        <button
                          onClick={() => handleOpenShareModal(exam)}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center transition"
                          title="Share to WhatsApp / Students"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEditExam(exam)}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center transition"
                          title="Edit Examination Settings"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Publish / Unpublish button */}
                        {isDraft && (
                          <button
                            onClick={() => handleStatusChange(exam.id, "published")}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center transition"
                            title="Publish Examination"
                          >
                            Publish
                          </button>
                        )}
                        {isPublished && (
                          <button
                            onClick={() => handleStatusChange(exam.id, "draft")}
                            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center transition"
                            title="Unpublish Examination"
                          >
                            Unpublish
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: QUESTION BANKS */}
      {/* ============================================================== */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {/* Exam Selector & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Examination
                </label>
                <select
                  value={selectedExamForQuestions}
                  onChange={(e) => setSelectedExamForQuestions(e.target.value)}
                  className="bg-transparent text-sm font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {exams.map((e) => (
                    <option key={e.id} value={e.id} className="dark:bg-slate-900">
                      {e.title} ({e.totalQuestions} Questions)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Bulk JSON Import
              </button>

              <button
                onClick={handleOpenAddQuestion}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>
          </div>

          {/* Question List */}
          {loadingQuestions ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
              Loading question bank...
            </div>
          ) : !currentQuestionsData?.questions || currentQuestionsData.questions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                No questions created yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Add objective questions (Single-Choice A–E or Multiple-Select A–E) for this examination.
              </p>
              <button
                onClick={handleOpenAddQuestion}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition"
              >
                + Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>
                  Total Questions: {currentQuestionsData.questions.length} &bull; Total Available Marks:{" "}
                  {currentQuestionsData.questions.reduce((acc: number, q: any) => acc + q.marks, 0)}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  Green tick denotes correct answer key (hidden from students until release)
                </span>
              </div>

              {currentQuestionsData.questions.map((q: any, idx: number) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-black text-xs text-indigo-700 dark:text-indigo-400">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {q.category || "General"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 uppercase">
                            {q.questionType === "multiple_select" ? "Multiple Select" : "Single Choice"}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                          {q.questionText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs transition"
                        title="Edit Question"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 text-xs transition"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                    {q.options.map((opt: any) => (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          opt.isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-300 font-bold"
                            : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px] ${
                              opt.isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span>{opt.optionText}</span>
                        </div>
                        {opt.isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <Check className="w-3.5 h-3.5" /> Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation Note */}
                  {q.explanation && (
                    <div className="pl-10 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Explanation:</span>{" "}
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SUBMISSIONS, GRADING & AUDIT */}
      {/* ============================================================== */}
      {activeTab === "results" && (
        <div className="space-y-6">
          {/* Header & Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-purple-500" />
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Examination Submissions
                </label>
                <select
                  value={selectedExamForResults}
                  onChange={(e) => setSelectedExamForResults(e.target.value)}
                  className="bg-transparent text-sm font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {exams.map((e) => (
                    <option key={e.id} value={e.id} className="dark:bg-slate-900">
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePublishResults}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                title="Publish results to candidate portal"
              >
                <Sparkles className="w-3.5 h-3.5" /> Publish Results to Students
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" /> Export CSV
              </button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name, email, or student ID..."
                value={resultsSearch}
                onChange={(e) => setResultsSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <select
              value={resultsStatusFilter}
              onChange={(e) => setResultsStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">All Outcomes</option>
              <option value="PASSED">Passed Only</option>
              <option value="FAILED">Failed Only</option>
              <option value="IN_PROGRESS">Taking Right Now</option>
            </select>
          </div>

          {/* Submissions Table */}
          {loadingResults ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
              Loading submissions...
            </div>
          ) : (!resultsData || resultsData.length === 0) ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                No examination submissions yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Candidates who start or complete this examination will automatically appear here with real-time score calculation.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Attempt</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Outcome</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(resultsData || []).map((row: any) => {
                      const isPass = row.passed ?? row.result?.passed;
                      const isInProgress = row.status === "IN_PROGRESS";
                      const finalScore = row.scoreObtained ?? row.result?.scoreObtained ?? 0;
                      const maxScore = row.maxScore ?? row.result?.maxScore ?? 0;
                      const percentage = row.percentage ?? row.result?.percentage ?? 0;

                      return (
                        <tr key={row.attemptId || row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            <div>{row.studentName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{row.studentEmail}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {row.studentId || "-"}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-bold">
                            #{row.attemptNumber}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isInProgress
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 animate-pulse"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold">
                            {isInProgress ? (
                              <span className="text-amber-500">Evaluating...</span>
                            ) : (
                              <span>
                                {finalScore}/{maxScore} ({percentage}%)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isInProgress ? (
                              <span className="text-amber-500 font-bold">Active</span>
                            ) : isPass ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                PASSED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                                FAILED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "In progress"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedAttemptForInspection(row);
                                setInspectAttemptModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] inline-flex items-center gap-1 transition"
                            >
                              <Eye className="w-3 h-3 text-indigo-500" /> Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PROGRAMMES & COURSES */}
      {/* ============================================================== */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Academic Programmes Catalog
              </h2>
              <p className="text-xs text-slate-500">
                Core departments supporting objective examinations and digital credentials.
              </p>
            </div>
            <button
              onClick={() => setCourseModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Programme
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {course.code}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {course.title}
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {course.badge || "Academy Programme"}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                  {course.description || "Comprehensive professional training curriculum."}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 flex items-center justify-between">
                  <span>{course._count?.examinations || 0} Examination(s)</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: CREATE / EDIT EXAMINATION */}
      {/* ============================================================== */}
      {examModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingExamId ? "Edit Examination Settings" : "Create New Examination"}
                </h3>
              </div>
              <button
                onClick={() => setExamModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Examination Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Affiliate Marketing Certification Assessment — Cohort Alpha"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course Programme *
                  </label>
                  <select
                    required
                    value={examForm.courseId}
                    onChange={(e) => setExamForm({ ...examForm, courseId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    required
                    value={examForm.durationMinutes}
                    onChange={(e) => setExamForm({ ...examForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pass Mark (%) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={examForm.passMarkPercentage}
                    onChange={(e) => setExamForm({ ...examForm, passMarkPercentage: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Attempts *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={examForm.maxAttempts}
                    onChange={(e) => setExamForm({ ...examForm, maxAttempts: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Result Release Mode
                  </label>
                  <select
                    value={examForm.resultReleaseMode}
                    onChange={(e) => setExamForm({ ...examForm, resultReleaseMode: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="immediate">Immediate Scorecard</option>
                    <option value="manual">Manual Admin Release</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Overview
                </label>
                <textarea
                  rows={2}
                  placeholder="Overview of topics and certification scope..."
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Instructions for Students
                </label>
                <textarea
                  rows={3}
                  value={examForm.instructions}
                  onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={examForm.allowAnswerReview}
                    onChange={(e) => setExamForm({ ...examForm, allowAnswerReview: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Allow Students to Review Question Explanations
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={examForm.allowBookmarks}
                    onChange={(e) => setExamForm({ ...examForm, allowBookmarks: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Enable Question Bookmarking / Flags
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={examForm.allowNavigation}
                    onChange={(e) => setExamForm({ ...examForm, allowNavigation: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Allow Free Question Palette Jumping
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={examForm.negativeMarking}
                    onChange={(e) => setExamForm({ ...examForm, negativeMarking: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Enable Negative Marking for Wrong Answers
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setExamModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md"
                >
                  {editingExamId ? "Save Changes" : "Create Examination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ADD / EDIT QUESTION */}
      {/* ============================================================== */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingQuestionId ? "Edit Objective Question" : "Add Objective Question"}
                </h3>
              </div>
              <button
                onClick={() => setQuestionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Text *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter objective question prompt or scenario..."
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Question Type
                  </label>
                  <select
                    value={questionForm.questionType}
                    onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="single_choice">Single Choice (1 Option)</option>
                    <option value="multiple_select">Multiple Select (Checkboxes)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topic / Category
                  </label>
                  <input
                    type="text"
                    value={questionForm.category}
                    onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                    placeholder="e.g. LLM Parameters"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Marks Awarded
                  </label>
                  <input
                    type="number"
                    min={0.25}
                    step={0.25}
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Options A-D (or E) */}
              <div className="space-y-3 pt-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Answer Options (Select the checkmark for correct answer) *
                </label>
                {questionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...questionForm.options];
                        if (questionForm.questionType === "single_choice") {
                          newOptions.forEach((o, i) => (o.isCorrect = i === idx));
                        } else {
                          newOptions[idx].isCorrect = !newOptions[idx].isCorrect;
                        }
                        setQuestionForm({ ...questionForm, options: newOptions });
                      }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition ${
                        opt.isCorrect
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                      }`}
                      title={opt.isCorrect ? "Correct Answer" : "Mark as Correct"}
                    >
                      {opt.label}
                    </button>

                    <input
                      type="text"
                      required
                      placeholder={`Option ${opt.label} text...`}
                      value={opt.optionText}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[idx].optionText = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOptions });
                      }}
                      className={`flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none font-semibold ${
                        opt.isCorrect
                          ? "border-emerald-500/60 ring-1 ring-emerald-500/30"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Explanation / Academic Rationalization (shown upon review)
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why the marked answer is correct..."
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md"
                >
                  {editingQuestionId ? "Save Question" : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: BULK JSON IMPORT */}
      {/* ============================================================== */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Bulk Import Questions via JSON
                </h3>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste an array of questions with their options, category, marks, and answer key:
            </p>

            <textarea
              rows={12}
              value={bulkJsonText}
              onChange={(e) => setBulkJsonText(e.target.value)}
              placeholder={`[
  {
    "questionText": "What does RAG stand for?",
    "category": "Enterprise AI",
    "marks": 1,
    "explanation": "Retrieval-Augmented Generation.",
    "options": [
      { "label": "A", "optionText": "Retrieval-Augmented Generation", "isCorrect": true },
      { "label": "B", "optionText": "Random Access Gateway", "isCorrect": false }
    ]
  }
]`}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px] focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Parse &amp; Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: SHARE / WHATSAPP ANNOUNCEMENT */}
      {/* ============================================================== */}
      {shareExamModalOpen && selectedExamForShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Share Examination Link
                </h3>
              </div>
              <button
                onClick={() => setShareExamModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Student Portal URL:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/examinations/${selectedExamForShare.publicId}`}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                  />
                  <button
                    onClick={() => handleCopyLink(selectedExamForShare.publicId)}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">WhatsApp Broadcast Announcement:</span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] leading-relaxed select-all">
                  🎓 *PROTECH ONLINE ACADEMY — OFFICIAL EXAMINATION NOTICE*
                  <br /><br />
                  Dear Students, the certification examination for *{selectedExamForShare.title}* is now live.
                  <br /><br />
                  ⏱️ *Duration:* {selectedExamForShare.durationMinutes} Minutes
                  <br />
                  🎯 *Pass Mark:* {selectedExamForShare.passMarkPercentage}%
                  <br />
                  📝 *Questions:* {selectedExamForShare.totalQuestions} Questions
                  <br /><br />
                  👉 *Take Examination Now:*
                  <br />
                  {typeof window !== "undefined" ? window.location.origin : ""}/examinations/{selectedExamForShare.publicId}
                  <br /><br />
                  _ProTech Assist Enterprise OS Academic Center_
                </div>
              </div>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🎓 *PROTECH ONLINE ACADEMY EXAMINATION NOTICE*\n\nDear Students, the certification examination for *${selectedExamForShare.title}* is now live.\n\n⏱️ Duration: ${selectedExamForShare.durationMinutes} Mins\n🎯 Pass Mark: ${selectedExamForShare.passMarkPercentage}%\n\n👉 Take Examination Now:\n${typeof window !== "undefined" ? window.location.origin : ""}/examinations/${selectedExamForShare.publicId}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md"
              >
                <Share2 className="w-4 h-4" /> Open WhatsApp Web &amp; Broadcast
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: INSPECT CANDIDATE ATTEMPT */}
      {/* ============================================================== */}
      {inspectAttemptModalOpen && selectedAttemptForInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Candidate Attempt Audit
                </h3>
              </div>
              <button
                onClick={() => setInspectAttemptModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Candidate</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedAttemptForInspection.studentName}
                  </span>
                  <div className="text-slate-500">{selectedAttemptForInspection.studentEmail}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Outcome</span>
                  <div className="mt-1">
                    {selectedAttemptForInspection.passed ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        PASSED ({selectedAttemptForInspection.percentage}%)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">
                        FAILED ({selectedAttemptForInspection.percentage}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Score</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedAttemptForInspection.scoreObtained}/{selectedAttemptForInspection.maxScore}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Correct</span>
                  <span className="font-bold text-sm text-emerald-600">
                    {selectedAttemptForInspection.correctAnswers || 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Time Spent</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {Math.round((selectedAttemptForInspection.timeSpentSeconds || 0) / 60)} mins
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/examinations/${exams.find((e) => e.id === selectedExamForResults)?.publicId}/result/${selectedAttemptForInspection.attemptId || selectedAttemptForInspection.id}`}
                  target="_blank"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Official Student Scorecard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: CREATE PROGRAMME / COURSE */}
      {/* ============================================================== */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Add Academic Programme
                </h3>
              </div>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Programme Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cybersecurity Fundamentals"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Code / Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CYBER-SEC"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={courseForm.badge}
                  onChange={(e) => setCourseForm({ ...courseForm, badge: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md"
                >
                  Create Programme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
