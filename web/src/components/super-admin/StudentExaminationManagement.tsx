"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  UserX,
  UserCheck,
  KeyRound,
  BookOpen,
  GraduationCap,
  Award,
  Calendar,
  Lock,
  Unlock,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  FileText,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  getSuperAdminStudents,
  createStudent,
  updateStudent,
  reissueStudentExamId,
  setStudentAccountStatus,
  authorizeExaminationForStudent,
  revokeExaminationAuthorization,
  grantStudentExamRetake,
  getSuperAdminAuthorizations,
  getSuperAdminStudentActivityLogs,
} from "@/lib/actions/student-examination";
import { StudentAccountStatus, ExamAuthorizationStatus } from "@prisma/client";

interface StudentManagementProps {
  courses: any[];
  exams: any[];
}

export default function StudentExaminationManagement({ courses, exams }: StudentManagementProps) {
  const [subView, setSubView] = useState<"directory" | "authorizations" | "activity">("directory");
  const [loading, setLoading] = useState(true);

  // Directory State
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [authStatusFilter, setAuthStatusFilter] = useState("ALL");

  // Authorizations State
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [authSearchQuery, setAuthSearchQuery] = useState("");
  const [authCourseFilter, setAuthCourseFilter] = useState("ALL");
  const [authStatusTabFilter, setAuthStatusTabFilter] = useState("ALL");

  // Activity Logs State
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Modals
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [addStudentForm, setAddStudentForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    courseIds: [] as string[],
    notes: "",
  });
  const [createdStudentResult, setCreatedStudentResult] = useState<any>(null);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit Student Modal
  const [editStudentModalOpen, setEditStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "ACTIVE" as StudentAccountStatus,
    courseIds: [] as string[],
    notes: "",
  });

  // Authorize Exam Modal
  const [authorizeModalOpen, setAuthorizeModalOpen] = useState(false);
  const [selectedStudentForAuth, setSelectedStudentForAuth] = useState<any>(null);
  const [authForm, setAuthForm] = useState({
    examinationId: "",
    status: "APPROVED" as "APPROVED" | "PENDING" | "REVOKED",
    validFrom: "",
    validUntil: "",
    maxAttemptsAllowed: 1,
  });
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Confirmation Modals
  const [reissueModalOpen, setReissueModalOpen] = useState(false);
  const [studentForReissue, setStudentForReissue] = useState<any>(null);
  const [reissueReason, setReissueReason] = useState("");

  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [authForRevoke, setAuthForRevoke] = useState<any>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const [retakeModalOpen, setRetakeModalOpen] = useState(false);
  const [authForRetake, setAuthForRetake] = useState<any>(null);
  const [retakeReason, setRetakeReason] = useState("");
  const [additionalAttempts, setAdditionalAttempts] = useState(1);

  const [statusConfirmModalOpen, setStatusConfirmModalOpen] = useState(false);
  const [studentForStatusChange, setStudentForStatusChange] = useState<any>(null);
  const [targetStatus, setTargetStatus] = useState<StudentAccountStatus>("ACTIVE");
  const [statusReason, setStatusReason] = useState("");

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      if (subView === "directory") {
        const res = await getSuperAdminStudents({
          search: searchQuery,
          courseId: courseFilter,
          status: statusFilter,
          authorizationStatus: authStatusFilter,
        });
        if (res.success) {
          setStudents(res.students || []);
          setStats(res.stats || null);
        } else {
          toast.error(res.error || "Failed to load students");
        }
      } else if (subView === "authorizations") {
        const res = await getSuperAdminAuthorizations({
          search: authSearchQuery,
          courseId: authCourseFilter,
          status: authStatusTabFilter,
        });
        if (res.success) {
          setAuthorizations(res.authorizations || []);
        } else {
          toast.error(res.error || "Failed to load authorizations");
        }
      } else if (subView === "activity") {
        const res = await getSuperAdminStudentActivityLogs(100);
        if (res.success) {
          setActivityLogs(res.logs || []);
        } else {
          toast.error(res.error || "Failed to load activity logs");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subView, courseFilter, statusFilter, authStatusFilter, authCourseFilter, authStatusTabFilter]);

  // Handle Search Debounce / Trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Add Student Handler
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStudentForm.fullName.trim()) {
      toast.error("Student Full Name is required");
      return;
    }
    if (addStudentForm.courseIds.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    setSubmittingAdd(true);
    try {
      const res = await createStudent(addStudentForm);
      if (res.success) {
        toast.success(res.message);
        setCreatedStudentResult(res.student);
        loadData();
      } else {
        toast.error(res.error || "Failed to register student");
      }
    } catch (err: any) {
      toast.error(err.message || "Error creating student");
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setEditForm({
      fullName: student.fullName,
      email: student.email || "",
      phone: student.phone || "",
      status: student.status,
      courseIds: student.courses.map((c: any) => c.id),
      notes: student.notes || "",
    });
    setEditStudentModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const res = await updateStudent(editingStudent.id, editForm);
      if (res.success) {
        toast.success(res.message);
        setEditStudentModalOpen(false);
        loadData();
      } else {
        toast.error(res.error || "Failed to update student");
      }
    } catch (err: any) {
      toast.error(err.message || "Update error");
    }
  };

  // Open Authorize Modal
  const openAuthorizeModal = (student: any) => {
    setSelectedStudentForAuth(student);
    const availableExams = exams.filter((ex) =>
      student.courses.some((c: any) => c.id === ex.courseId)
    );
    setAuthForm({
      examinationId: availableExams[0]?.id || exams[0]?.id || "",
      status: "APPROVED",
      validFrom: "",
      validUntil: "",
      maxAttemptsAllowed: 1,
    });
    setAuthorizeModalOpen(true);
  };

  const handleSaveAuthorization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForAuth || !authForm.examinationId) {
      toast.error("Please select an examination");
      return;
    }

    setSubmittingAuth(true);
    try {
      const res = await authorizeExaminationForStudent({
        studentDatabaseId: selectedStudentForAuth.id,
        examinationId: authForm.examinationId,
        status: authForm.status,
        validFrom: authForm.validFrom || null,
        validUntil: authForm.validUntil || null,
        maxAttemptsAllowed: authForm.maxAttemptsAllowed,
      });

      if (res.success) {
        toast.success(res.message);
        setAuthorizeModalOpen(false);
        loadData();
      } else {
        toast.error(res.error || "Failed to save authorization");
      }
    } catch (err: any) {
      toast.error(err.message || "Authorization error");
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Reissue ID
  const handleConfirmReissue = async () => {
    if (!studentForReissue || !reissueReason.trim()) {
      toast.error("Administrative reason is required");
      return;
    }

    try {
      const res = await reissueStudentExamId(studentForReissue.id, reissueReason);
      if (res.success) {
        toast.success(res.message);
        setReissueModalOpen(false);
        setReissueReason("");
        loadData();
      } else {
        toast.error(res.error || "Failed to reissue ID");
      }
    } catch (err: any) {
      toast.error(err.message || "Reissue error");
    }
  };

  // Revoke Authorization
  const handleConfirmRevoke = async () => {
    if (!authForRevoke || !revokeReason.trim()) {
      toast.error("Administrative reason is required");
      return;
    }

    try {
      const res = await revokeExaminationAuthorization(authForRevoke.id, revokeReason);
      if (res.success) {
        toast.success(res.message);
        setRevokeModalOpen(false);
        setRevokeReason("");
        loadData();
      } else {
        toast.error(res.error || "Failed to revoke authorization");
      }
    } catch (err: any) {
      toast.error(err.message || "Revoke error");
    }
  };

  // Grant Retake
  const handleConfirmRetake = async () => {
    if (!authForRetake || !retakeReason.trim()) {
      toast.error("Administrative justification reason is required");
      return;
    }

    try {
      const res = await grantStudentExamRetake(authForRetake.id, retakeReason, additionalAttempts);
      if (res.success) {
        toast.success(res.message);
        setRetakeModalOpen(false);
        setRetakeReason("");
        loadData();
      } else {
        toast.error(res.error || "Failed to grant retake");
      }
    } catch (err: any) {
      toast.error(err.message || "Retake error");
    }
  };

  // Status Change (Suspend / Activate)
  const handleConfirmStatusChange = async () => {
    if (!studentForStatusChange) return;

    try {
      const res = await setStudentAccountStatus(studentForStatusChange.id, targetStatus, statusReason);
      if (res.success) {
        toast.success(res.message);
        setStatusConfirmModalOpen(false);
        setStatusReason("");
        loadData();
      } else {
        toast.error(res.error || "Failed to change status");
      }
    } catch (err: any) {
      toast.error(err.message || "Status error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-View Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSubView("directory")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 whitespace-nowrap ${
              subView === "directory"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Student Directory</span>
          </button>

          <button
            onClick={() => setSubView("authorizations")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 whitespace-nowrap ${
              subView === "authorizations"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Examination Authorizations</span>
          </button>

          <button
            onClick={() => setSubView("activity")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 whitespace-nowrap ${
              subView === "activity"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit &amp; Activity Log</span>
          </button>
        </div>

        {subView === "directory" && (
          <button
            onClick={() => {
              setCreatedStudentResult(null);
              setAddStudentForm({
                fullName: "",
                email: "",
                phone: "",
                courseIds: courses.length > 0 ? [courses[0].id] : [],
                notes: "",
              });
              setAddStudentModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Student
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* 1. STUDENT DIRECTORY VIEW */}
      {/* ============================================================== */}
      {subView === "directory" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Students</span>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">{stats.totalStudents}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Active</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{stats.activeStudents}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Approved for Exam</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">{stats.studentsWithApprovedExams}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">Pending Auth</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{stats.studentsPendingAuth}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">No Auth Assigned</span>
                <span className="text-xl font-black text-slate-700 dark:text-slate-300 mt-0.5 block">{stats.studentsNoAuth}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">Suspended</span>
                <span className="text-xl font-black text-rose-500 mt-0.5 block">{stats.suspendedStudents}</span>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, examination ID (PTA-OA-...), or course..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              <select
                value={authStatusFilter}
                onChange={(e) => setAuthStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Authorizations</option>
                <option value="APPROVED">Approved Only</option>
                <option value="PENDING">Pending Only</option>
                <option value="REVOKED">Revoked Only</option>
                <option value="NO_AUTH">No Authorization</option>
              </select>

              <button
                onClick={loadData}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                title="Refresh Students"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Students Directory Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Examination ID</th>
                    <th className="py-3.5 px-4">Enrolled Courses</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Exam Authorization</th>
                    <th className="py-3.5 px-4">Attempt Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading registered student directory...</span>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="font-bold">No registered students found</p>
                        <p className="text-[11px] text-slate-400">Click &ldquo;Add Student&rdquo; above to register students and generate unique IDs.</p>
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => {
                      const approvedAuths = student.authorizations.filter((a: any) => a.status === "APPROVED");
                      const pendingAuths = student.authorizations.filter((a: any) => a.status === "PENDING");
                      const revokedAuths = student.authorizations.filter((a: any) => a.status === "REVOKED");

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                          {/* Student Name */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{student.fullName}</div>
                            {student.email ? (
                              <div className="text-[10px] text-slate-400">{student.email}</div>
                            ) : (
                              <div className="text-[10px] text-slate-400 italic">No email registered</div>
                            )}
                          </td>

                          {/* Unique Examination ID */}
                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              <span>{student.studentId}</span>
                            </div>
                          </td>

                          {/* Enrolled Courses */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {student.courses.map((c: any) => (
                                <span
                                  key={c.id}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                >
                                  {c.title}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                student.status === "ACTIVE"
                                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                                  : student.status === "SUSPENDED"
                                  ? "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${student.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"}`} />
                              {student.status}
                            </span>
                          </td>

                          {/* Exam Authorization */}
                          <td className="py-3.5 px-4">
                            {approvedAuths.length > 0 ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-200 dark:border-emerald-500/30">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>{approvedAuths.length} Approved</span>
                                </span>
                                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                  {approvedAuths.map((a: any) => a.examTitle).join(", ")}
                                </div>
                              </div>
                            ) : pendingAuths.length > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[10px] border border-amber-200 dark:border-amber-500/30">
                                <Clock className="w-3 h-3" />
                                <span>Pending Approval</span>
                              </span>
                            ) : revokedAuths.length > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold text-[10px] border border-rose-200 dark:border-rose-500/30">
                                <ShieldAlert className="w-3 h-3" />
                                <span>Revoked</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No Exam Authorized</span>
                            )}
                          </td>

                          {/* Attempt History */}
                          <td className="py-3.5 px-4">
                            {student.latestAttempt ? (
                              <div>
                                <div className="flex items-center gap-1 font-bold">
                                  <span className={student.latestAttempt.passed ? "text-emerald-600" : "text-rose-600"}>
                                    {student.latestAttempt.passed ? "Passed" : "Below Pass"}
                                  </span>
                                  {student.latestAttempt.score !== null && (
                                    <span className="text-slate-400">({student.latestAttempt.score} pts)</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  {student.completedExamsCount} of {student.totalAttemptsCount} submitted
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No attempts yet</span>
                            )}
                          </td>

                          {/* Available Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Authorize Exam Button */}
                              <button
                                onClick={() => openAuthorizeModal(student)}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Authorize Examination Access"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Authorize</span>
                              </button>

                              {/* Edit Student */}
                              <button
                                onClick={() => openEditModal(student)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                                title="Edit Student Profile"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Reissue ID */}
                              <button
                                onClick={() => {
                                  setStudentForReissue(student);
                                  setReissueReason("");
                                  setReissueModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition"
                                title="Reissue Unique Examination ID"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Suspend / Activate Toggle */}
                              {student.status === "ACTIVE" ? (
                                <button
                                  onClick={() => {
                                    setStudentForStatusChange(student);
                                    setTargetStatus("SUSPENDED");
                                    setStatusReason("");
                                    setStatusConfirmModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                                  title="Suspend Student Access"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setStudentForStatusChange(student);
                                    setTargetStatus("ACTIVE");
                                    setStatusReason("");
                                    setStatusConfirmModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-600 transition"
                                  title="Reactivate Student"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. EXAMINATION AUTHORIZATIONS VIEW */}
      {/* ============================================================== */}
      {subView === "authorizations" && (
        <div className="space-y-6">
          {/* Authorizations Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={authSearchQuery}
                onChange={(e) => setAuthSearchQuery(e.target.value)}
                placeholder="Search authorizations by student name, ID, or examination title..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={authCourseFilter}
                onChange={(e) => setAuthCourseFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Programmes</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              <select
                value={authStatusTabFilter}
                onChange={(e) => setAuthStatusTabFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REVOKED">Revoked</option>
              </select>

              <button
                onClick={loadData}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Authorizations Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Programme &amp; Exam</th>
                    <th className="py-3.5 px-4">Authorization Status</th>
                    <th className="py-3.5 px-4">Opening &amp; Closing</th>
                    <th className="py-3.5 px-4">Attempts Allowed / Used</th>
                    <th className="py-3.5 px-4">Authorizing Admin</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading examination authorizations...</span>
                      </td>
                    </tr>
                  ) : authorizations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <ShieldCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="font-bold">No examination authorizations recorded</p>
                        <p className="text-[11px] text-slate-400">Authorizations must be explicitly granted per student and examination.</p>
                      </td>
                    </tr>
                  ) : (
                    authorizations.map((authRec) => (
                      <tr key={authRec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{authRec.studentName}</div>
                          <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                            {authRec.studentExamId}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{authRec.examTitle}</div>
                          <span className="text-[10px] text-slate-400">{authRec.courseTitle}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                              authRec.status === "APPROVED"
                                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                                : authRec.status === "REVOKED"
                                ? "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30"
                                : "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${authRec.status === "APPROVED" ? "bg-emerald-500" : authRec.status === "REVOKED" ? "bg-rose-500" : "bg-amber-500"}`} />
                            {authRec.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[11px]">
                          {authRec.validFrom ? (
                            <div>Opens: {new Date(authRec.validFrom).toLocaleString()}</div>
                          ) : (
                            <span className="text-slate-400">Open Immediately</span>
                          )}
                          {authRec.validUntil && (
                            <div className="text-rose-600 dark:text-rose-400">Closes: {new Date(authRec.validUntil).toLocaleString()}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {authRec.attemptsConsumed} of {authRec.maxAttemptsAllowed} Used
                          </div>
                          {authRec.attemptsConsumed >= authRec.maxAttemptsAllowed && (
                            <span className="text-[10px] text-amber-600 font-bold block">Limit Reached</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-slate-500">
                          <div>{authRec.authorizedBy}</div>
                          {authRec.authorizedAt && (
                            <div className="text-[10px] text-slate-400">{new Date(authRec.authorizedAt).toLocaleDateString()}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Grant Retake */}
                            <button
                              onClick={() => {
                                setAuthForRetake(authRec);
                                setRetakeReason("");
                                setAdditionalAttempts(1);
                                setRetakeModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-bold transition cursor-pointer"
                              title="Grant Examination Retake"
                            >
                              Grant Retake
                            </button>

                            {/* Revoke */}
                            {authRec.status === "APPROVED" && (
                              <button
                                onClick={() => {
                                  setAuthForRevoke(authRec);
                                  setRevokeReason("");
                                  setRevokeModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[11px] font-bold transition cursor-pointer"
                                title="Revoke Authorization"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. EXAMINATION ACTIVITY / AUDIT LOG VIEW */}
      {/* ============================================================== */}
      {subView === "activity" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Examination Security Audit Timeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited records of student registrations, attempt starts, departures, submissions, and administrator authorizations.
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading activity log...</span>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="font-bold">No activity events logged yet</p>
              </div>
            ) : (
              activityLogs.map((log) => {
                const isViolation = ["TAB_HIDDEN", "WINDOW_BLURRED", "EXAM_PAGE_EXIT", "EXAM_TERMINATED"].includes(log.action);
                const isStart = log.action === "EXAM_STARTED";
                const isSubmit = log.action === "EXAM_SUBMITTED";

                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-4 transition ${
                      isViolation
                        ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                        : isStart
                        ? "bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40"
                        : isSubmit
                        ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                        : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400">&bull; {log.examTitle}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Actor: <strong>{log.actorEmail}</strong> ({log.actorRole})
                      </div>
                      {log.details && (
                        <div className="text-[10px] font-mono text-slate-500 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 max-w-xl">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD STUDENT */}
      {/* ============================================================== */}
      {addStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            {!createdStudentResult ? (
              <form onSubmit={handleCreateStudent} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    <span>Register New Student</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter the student details and select their enrolled course(s). A unique examination ID will be generated automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addStudentForm.fullName}
                    onChange={(e) => setAddStudentForm({ ...addStudentForm, fullName: e.target.value })}
                    placeholder="e.g. Mohamed Kamara"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={addStudentForm.email}
                      onChange={(e) => setAddStudentForm({ ...addStudentForm, email: e.target.value })}
                      placeholder="student@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={addStudentForm.phone}
                      onChange={(e) => setAddStudentForm({ ...addStudentForm, phone: e.target.value })}
                      placeholder="+232..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Enrolled Courses <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    {courses.map((course) => {
                      const isChecked = addStudentForm.courseIds.includes(course.id);
                      return (
                        <label key={course.id} className="flex items-center gap-2.5 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAddStudentForm({
                                  ...addStudentForm,
                                  courseIds: [...addStudentForm.courseIds, course.id],
                                });
                              } else {
                                setAddStudentForm({
                                  ...addStudentForm,
                                  courseIds: addStudentForm.courseIds.filter((id) => id !== course.id),
                                });
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{course.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({course.code})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Security Protocol Banner */}
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Automatic ID Generation &amp; Zero-Trust Policy:</span>
                  </div>
                  <p>
                    A non-sequential student examination ID (e.g. <code>PTA-OA-7K4M9X2Q</code>) will be generated. The student will <strong>not</strong> have examination access until you explicitly authorize them.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddStudentModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdd}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-500/20 transition cursor-pointer"
                  >
                    {submittingAdd ? "Generating ID & Saving..." : "Register Student"}
                  </button>
                </div>
              </form>
            ) : (
              /* Success Callout with Generated ID */
              <div className="text-center space-y-5">
                <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Student Registered Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    The student has been enrolled into the selected course(s). Share their examination ID below:
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                    Unique Student Examination ID
                  </span>
                  <div className="text-2xl font-mono font-black text-indigo-950 dark:text-white tracking-wider">
                    {createdStudentResult.studentId}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Candidate: {createdStudentResult.fullName}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setAddStudentModalOpen(false);
                      openAuthorizeModal(createdStudentResult);
                    }}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-500/20 transition cursor-pointer"
                  >
                    Authorize Exam Now
                  </button>
                  <button
                    onClick={() => setAddStudentModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: AUTHORIZE EXAMINATION */}
      {/* ============================================================== */}
      {authorizeModalOpen && selectedStudentForAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Authorize Examination Access</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant explicit examination permissions, specify availability windows, and set permitted attempts.
              </p>
            </div>

            {/* Student Preview Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedStudentForAuth.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Examination ID:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedStudentForAuth.studentId}</span>
              </div>
            </div>

            <form onSubmit={handleSaveAuthorization} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Examination <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={authForm.examinationId}
                  onChange={(e) => setAuthForm({ ...authForm, examinationId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select an Examination --</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} ({ex.courseTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Authorization Status
                  </label>
                  <select
                    value={authForm.status}
                    onChange={(e) => setAuthForm({ ...authForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="APPROVED">Approved (Can Sit Exam)</option>
                    <option value="PENDING">Pending (On Hold)</option>
                    <option value="REVOKED">Revoked (Access Denied)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Permitted Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={authForm.maxAttemptsAllowed}
                    onChange={(e) => setAuthForm({ ...authForm, maxAttemptsAllowed: Number(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Default: 1 attempt</span>
                </div>
              </div>

              {/* Timing Windows */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Opening Date/Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={authForm.validFrom}
                    onChange={(e) => setAuthForm({ ...authForm, validFrom: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Closing Date/Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={authForm.validUntil}
                    onChange={(e) => setAuthForm({ ...authForm, validUntil: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setAuthorizeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAuth}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-500/20 transition cursor-pointer"
                >
                  {submittingAuth ? "Saving..." : "Save Authorization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT STUDENT */}
      {/* ============================================================== */}
      {editStudentModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-600" />
              <span>Edit Student Record</span>
            </h3>

            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {/* Course Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Enrolled Courses</label>
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 max-h-36 overflow-y-auto">
                  {courses.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.courseIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm({ ...editForm, courseIds: [...editForm.courseIds, c.id] });
                          } else {
                            setEditForm({ ...editForm, courseIds: editForm.courseIds.filter((id) => id !== c.id) });
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{c.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CONFIRMATION: REISSUE ID */}
      {/* ============================================================== */}
      {reissueModalOpen && studentForReissue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Reissue Examination ID?</h3>
              <p className="text-xs text-slate-500">
                This will generate a new unique examination ID for <strong>{studentForReissue.fullName}</strong>. Their previous ID (<code>{studentForReissue.studentId}</code>) will be permanently invalidated.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Administrative Reason <span className="text-rose-500">*</span></label>
              <textarea
                required
                rows={2}
                value={reissueReason}
                onChange={(e) => setReissueReason(e.target.value)}
                placeholder="Reason for reissuing student examination ID..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setReissueModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReissue}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase"
              >
                Confirm Reissue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CONFIRMATION: REVOKE AUTHORIZATION */}
      {/* ============================================================== */}
      {revokeModalOpen && authForRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Revoke Examination Access?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to revoke access to <strong>{authForRevoke.examTitle}</strong> for <strong>{authForRevoke.studentName}</strong>? The student will be blocked from starting the examination.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Revocation Reason <span className="text-rose-500">*</span></label>
              <textarea
                required
                rows={2}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Reason for revoking examination access..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setRevokeModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CONFIRMATION: GRANT RETAKE */}
      {/* ============================================================== */}
      {retakeModalOpen && authForRetake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Grant Examination Retake?</h3>
              <p className="text-xs text-slate-500">
                Granting a retake allows <strong>{authForRetake.studentName}</strong> to sit <strong>{authForRetake.examTitle}</strong> for an additional attempt.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Additional Attempts to Grant</label>
              <input
                type="number"
                min="1"
                max="5"
                value={additionalAttempts}
                onChange={(e) => setAdditionalAttempts(Number(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Administrative Justification <span className="text-rose-500">*</span></label>
              <textarea
                required
                rows={2}
                value={retakeReason}
                onChange={(e) => setRetakeReason(e.target.value)}
                placeholder="Reason for authorizing retake (e.g. system disruption, approved re-sit)..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setRetakeModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRetake}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase"
              >
                Grant Retake
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CONFIRMATION: STATUS CHANGE (SUSPEND / ACTIVATE) */}
      {/* ============================================================== */}
      {statusConfirmModalOpen && studentForStatusChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Change Status to {targetStatus}?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to set <strong>{studentForStatusChange.fullName}</strong>&apos;s account status to <strong>{targetStatus}</strong>?
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Reason (Optional)</label>
              <textarea
                rows={2}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Notes for status change..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setStatusConfirmModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase text-white ${
                  targetStatus === "ACTIVE" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                Confirm {targetStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
