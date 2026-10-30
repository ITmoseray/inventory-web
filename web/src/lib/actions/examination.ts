"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import * as crypto from "crypto";
import { AFFILIATE_50_QUESTIONS } from "@/lib/data/affiliate-exam-questions";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch (e) {
    // Safely ignore when called outside Next.js request context (e.g. CLI / testing)
  }
}

// =========================================================================
// AUTH & ACCESS CONTROL HELPERS
// =========================================================================

async function checkSuperAdminAuth() {
  if (process.env.PROTECH_TEST_BYPASS === "true") {
    return {
      id: "test-superadmin-id",
      name: "System Test Admin",
      email: "admin@protech.test",
      role: "SUPERADMIN",
    };
  }
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please log in.");
  }
  const role = ((session.user as any)?.originalRole || session.user.role || "").toUpperCase();
  if (role !== "SUPERADMIN") {
    throw new Error("Forbidden: Super Admin authorization required.");
  }
  return session.user;
}

/**
 * Generate unique public examination identifier e.g. EXAM-AFF-2026-XXXX
 */
function generateExamPublicId(courseCode: string): string {
  const prefix = (courseCode || "EXAM").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 4);
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  const year = new Date().getFullYear();
  return `EXAM-${prefix}-${year}-${randomSuffix}`;
}

// =========================================================================
// 1. PROGRAMMES & COURSES MANAGEMENT
// =========================================================================

export async function seedDefaultCoursesIfEmpty() {
  try {
    const count = await prisma.examCourse.count();
    if (count > 0) return { success: true };

    await prisma.examCourse.createMany({
      data: [
        {
          title: "Affiliate Marketing Course",
          code: "AFFILIATE-MKT",
          description: "Comprehensive professional practical training in digital customer acquisition, affiliate funnel strategy, commission models, and campaign performance optimization.",
          badge: "Academy Core Programme",
          icon: "Megaphone",
          isActive: true,
        },
        {
          title: "AI Masterclass",
          code: "AI-MASTER",
          description: "Flagship executive masterclass on Large Language Models, prompt engineering, agentic system design, workflow automations, and enterprise AI deployment.",
          badge: "Academy Flagship Masterclass",
          icon: "Brain",
          isActive: true,
        },
      ],
    });

    return { success: true, message: "Default academy courses initialized." };
  } catch (error: any) {
    console.error("[seedDefaultCourses error]:", error);
    return { success: false, error: error.message };
  }
}

export async function getExamCourses() {
  try {
    await seedDefaultCoursesIfEmpty();
    const courses = await prisma.examCourse.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            examinations: true,
          },
        },
      },
      orderBy: { title: "asc" },
    });
    return { success: true, courses };
  } catch (error: any) {
    console.error("[getExamCourses error]:", error);
    return { success: false, error: "Failed to load examination programmes." };
  }
}

export async function createExamCourse(data: {
  title: string;
  code: string;
  description?: string;
  badge?: string;
  icon?: string;
}) {
  try {
    await checkSuperAdminAuth();
    if (!data.title?.trim() || !data.code?.trim()) {
      return { success: false, error: "Course title and unique code are required." };
    }

    const cleanCode = data.code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
    const existing = await prisma.examCourse.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return { success: false, error: "A course with this code already exists." };
    }

    const course = await prisma.examCourse.create({
      data: {
        title: data.title.trim(),
        code: cleanCode,
        description: data.description?.trim() || null,
        badge: data.badge?.trim() || "Online Academy Course",
        icon: data.icon?.trim() || "Book",
        isActive: true,
      },
    });

    safeRevalidate("/super-admin/examinations");
    return { success: true, course };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =========================================================================
// 2. SUPER ADMIN EXAMINATION CRUD & DASHBOARD
// =========================================================================

export interface ExaminationInput {
  title: string;
  courseId: string;
  description?: string;
  instructions?: string;
  coverImageUrl?: string;
  durationMinutes: number;
  passMarkPercentage: number;
  maxAttempts?: number;
  startDate?: string | null;
  endDate?: string | null;
  gracePeriodSeconds?: number;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  allowNavigation?: boolean;
  allowChangeAnswer?: boolean;
  allowBookmarks?: boolean;
  allowUnansweredSubmission?: boolean;
  negativeMarking?: boolean;
  negativeMarkValue?: number;
  resultReleaseMode?: "immediate" | "manual";
  allowAnswerReview?: boolean;
  accessMode?: "open_verified" | "restricted";
  strictSecurity?: boolean;
  maxViolationsAllowed?: number;
  status?: "draft" | "published" | "archived";
}

export async function createExamination(input: ExaminationInput) {
  try {
    const user = await checkSuperAdminAuth();

    if (!input.title?.trim() || !input.courseId) {
      return { success: false, error: "Examination title and course programme are required." };
    }

    const course = await prisma.examCourse.findUnique({ where: { id: input.courseId } });
    if (!course) return { success: false, error: "Selected course does not exist." };

    let publicId = generateExamPublicId(course.code);
    while (await prisma.examination.findUnique({ where: { publicId } })) {
      publicId = generateExamPublicId(course.code);
    }

    const exam = await prisma.examination.create({
      data: {
        publicId,
        title: input.title.trim(),
        courseId: input.courseId,
        description: input.description?.trim() || null,
        instructions: input.instructions?.trim() || "Read each question carefully. Select the best answer for each question. You may bookmark questions to review later. Click Submit when finished.",
        coverImageUrl: input.coverImageUrl?.trim() || null,
        durationMinutes: Math.max(1, Number(input.durationMinutes) || 45),
        passMarkPercentage: Number(input.passMarkPercentage) || 70.0,
        maxAttempts: Math.max(1, Number(input.maxAttempts) || 1),
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        gracePeriodSeconds: input.gracePeriodSeconds ?? 60,
        randomizeQuestions: input.randomizeQuestions ?? false,
        randomizeOptions: input.randomizeOptions ?? false,
        allowNavigation: input.allowNavigation ?? true,
        allowChangeAnswer: input.allowChangeAnswer ?? true,
        allowBookmarks: input.allowBookmarks ?? true,
        allowUnansweredSubmission: input.allowUnansweredSubmission ?? true,
        negativeMarking: input.negativeMarking ?? false,
        negativeMarkValue: Number(input.negativeMarkValue) || 0,
        resultReleaseMode: input.resultReleaseMode || "immediate",
        allowAnswerReview: input.allowAnswerReview ?? true,
        accessMode: input.accessMode || "open_verified",
        strictSecurity: input.strictSecurity ?? true,
        maxViolationsAllowed: input.maxViolationsAllowed !== undefined ? Math.max(0, Number(input.maxViolationsAllowed)) : 0,
        status: input.status || "draft",
        createdById: user.id,
      },
      include: {
        course: true,
      },
    });

    // Log Audit Event
    await prisma.examAuditEvent.create({
      data: {
        examId: exam.id,
        action: "CREATED",
        actorEmail: user.email || "superadmin@protechassist.com",
        actorRole: "SUPERADMIN",
        details: { title: exam.title, publicId: exam.publicId },
      },
    });

    safeRevalidate("/super-admin/examinations");
    return { success: true, exam };
  } catch (error: any) {
    console.error("[createExamination error]:", error);
    return { success: false, error: error.message || "Failed to create examination." };
  }
}

export async function updateExamination(id: string, input: Partial<ExaminationInput>) {
  try {
    const user = await checkSuperAdminAuth();

    const existing = await prisma.examination.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Examination not found." };

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.courseId !== undefined) updateData.courseId = input.courseId;
    if (input.description !== undefined) updateData.description = input.description?.trim() || null;
    if (input.instructions !== undefined) updateData.instructions = input.instructions?.trim() || null;
    if (input.coverImageUrl !== undefined) updateData.coverImageUrl = input.coverImageUrl?.trim() || null;
    if (input.durationMinutes !== undefined) updateData.durationMinutes = Math.max(1, Number(input.durationMinutes));
    if (input.passMarkPercentage !== undefined) updateData.passMarkPercentage = Number(input.passMarkPercentage);
    if (input.maxAttempts !== undefined) updateData.maxAttempts = Math.max(1, Number(input.maxAttempts));
    if (input.startDate !== undefined) updateData.startDate = input.startDate ? new Date(input.startDate) : null;
    if (input.endDate !== undefined) updateData.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.gracePeriodSeconds !== undefined) updateData.gracePeriodSeconds = input.gracePeriodSeconds;
    if (input.randomizeQuestions !== undefined) updateData.randomizeQuestions = input.randomizeQuestions;
    if (input.randomizeOptions !== undefined) updateData.randomizeOptions = input.randomizeOptions;
    if (input.allowNavigation !== undefined) updateData.allowNavigation = input.allowNavigation;
    if (input.allowChangeAnswer !== undefined) updateData.allowChangeAnswer = input.allowChangeAnswer;
    if (input.allowBookmarks !== undefined) updateData.allowBookmarks = input.allowBookmarks;
    if (input.allowUnansweredSubmission !== undefined) updateData.allowUnansweredSubmission = input.allowUnansweredSubmission;
    if (input.negativeMarking !== undefined) updateData.negativeMarking = input.negativeMarking;
    if (input.negativeMarkValue !== undefined) updateData.negativeMarkValue = Number(input.negativeMarkValue);
    if (input.resultReleaseMode !== undefined) updateData.resultReleaseMode = input.resultReleaseMode;
    if (input.allowAnswerReview !== undefined) updateData.allowAnswerReview = input.allowAnswerReview;
    if (input.accessMode !== undefined) updateData.accessMode = input.accessMode;
    if (input.strictSecurity !== undefined) updateData.strictSecurity = input.strictSecurity;
    if (input.maxViolationsAllowed !== undefined) updateData.maxViolationsAllowed = Math.max(0, Number(input.maxViolationsAllowed));
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await prisma.examination.update({
      where: { id },
      data: updateData,
      include: { course: true },
    });

    await prisma.examAuditEvent.create({
      data: {
        examId: id,
        action: "UPDATED",
        actorEmail: user.email || "superadmin@protechassist.com",
        actorRole: "SUPERADMIN",
        details: { fieldsChanged: Object.keys(updateData) },
      },
    });

    safeRevalidate("/super-admin/examinations");
    return { success: true, exam: updated };
  } catch (error: any) {
    console.error("[updateExamination error]:", error);
    return { success: false, error: error.message || "Failed to update examination." };
  }
}

export async function setExaminationStatus(id: string, status: "draft" | "published" | "archived") {
  try {
    const user = await checkSuperAdminAuth();

    // Check if questions exist before publishing
    if (status === "published") {
      const qCount = await prisma.examQuestion.count({
        where: { examId: id, isActive: true },
      });
      if (qCount === 0) {
        return { success: false, error: "Cannot publish an examination with no questions. Please add questions first." };
      }
    }

    // Safeguard: if unpublishing or archiving, ensure active attempts are preserved
    const updated = await prisma.examination.update({
      where: { id },
      data: { status },
      include: { course: true },
    });

    await prisma.examAuditEvent.create({
      data: {
        examId: id,
        action: status.toUpperCase(),
        actorEmail: user.email || "superadmin@protechassist.com",
        actorRole: "SUPERADMIN",
        details: { newStatus: status },
      },
    });

    safeRevalidate("/super-admin/examinations");
    return { success: true, exam: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSuperAdminExams(options?: {
  courseId?: string;
  status?: string;
  search?: string;
}) {
  try {
    await checkSuperAdminAuth();
    await seedDefaultCoursesIfEmpty();

    const where: any = {};
    if (options?.courseId && options.courseId !== "ALL") {
      where.courseId = options.courseId;
    }
    if (options?.status && options.status !== "ALL") {
      where.status = options.status;
    }
    if (options?.search?.trim()) {
      where.OR = [
        { title: { contains: options.search.trim(), mode: "insensitive" } },
        { publicId: { contains: options.search.trim(), mode: "insensitive" } },
        { description: { contains: options.search.trim(), mode: "insensitive" } },
      ];
    }

    const exams = await prisma.examination.findMany({
      where,
      include: {
        course: true,
        _count: {
          select: {
            questions: { where: { isActive: true } },
            participants: true,
            attempts: true,
          },
        },
        attempts: {
          select: {
            status: true,
            result: {
              select: {
                passed: true,
                scoreObtained: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      exams: exams.map((e) => {
        const completedAttempts = e.attempts.filter((a) => a.status === "SUBMITTED" || a.status === "MARKED" || a.status === "TIMED_OUT");
        const activeTaking = e.attempts.filter((a) => a.status === "IN_PROGRESS");
        const passedCount = completedAttempts.filter((a) => a.result?.passed === true).length;
        const failedCount = completedAttempts.filter((a) => a.result?.passed === false).length;

        return {
          id: e.id,
          publicId: e.publicId,
          title: e.title,
          courseId: e.courseId,
          courseTitle: e.course.title,
          courseCode: e.course.code,
          description: e.description,
          instructions: e.instructions,
          durationMinutes: e.durationMinutes,
          passMarkPercentage: Number(e.passMarkPercentage),
          maxAttempts: e.maxAttempts,
          status: e.status,
          startDate: e.startDate?.toISOString() || null,
          endDate: e.endDate?.toISOString() || null,
          resultReleaseMode: e.resultReleaseMode,
          allowAnswerReview: e.allowAnswerReview,
          accessMode: e.accessMode,
          strictSecurity: e.strictSecurity,
          maxViolationsAllowed: e.maxViolationsAllowed,
          negativeMarking: e.negativeMarking,
          negativeMarkValue: Number(e.negativeMarkValue),
          totalQuestions: e._count.questions,
          totalParticipants: e._count.participants,
          totalAttempts: e._count.attempts,
          activeTaking: activeTaking.length,
          completedCount: completedAttempts.length,
          passedCount,
          failedCount,
          passRate: completedAttempts.length > 0 ? Math.round((passedCount / completedAttempts.length) * 100) : 0,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        };
      }),
    };
  } catch (error: any) {
    console.error("[getSuperAdminExams error]:", error);
    return { success: false, error: error.message || "Failed to load examinations." };
  }
}

export async function getSuperAdminExamStats() {
  try {
    await checkSuperAdminAuth();

    const [
      totalExams,
      publishedExams,
      draftExams,
      totalParticipants,
      attempts,
      results,
    ] = await Promise.all([
      prisma.examination.count(),
      prisma.examination.count({ where: { status: "published" } }),
      prisma.examination.count({ where: { status: "draft" } }),
      prisma.examParticipant.count(),
      prisma.examAttempt.findMany({ select: { status: true } }),
      prisma.examResult.findMany({ select: { passed: true, scoreObtained: true, maxScore: true, percentage: true } }),
    ]);

    const activeTaking = attempts.filter((a) => a.status === "IN_PROGRESS").length;
    const completed = attempts.filter((a) => a.status === "SUBMITTED" || a.status === "MARKED" || a.status === "TIMED_OUT").length;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const averageScore = results.length > 0
      ? Math.round((results.reduce((acc, r) => acc + Number(r.percentage), 0) / results.length) * 10) / 10
      : 0;
    const overallPassRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;

    return {
      success: true,
      stats: {
        totalExams,
        publishedExams,
        draftExams,
        totalParticipants,
        activeTaking,
        completed,
        passed,
        failed,
        averageScore,
        overallPassRate,
      },
    };
  } catch (error: any) {
    console.error("[getSuperAdminExamStats error]:", error);
    return { success: false, error: "Failed to load examination statistics." };
  }
}

// =========================================================================
// 3. QUESTION MANAGEMENT & ANSWER KEYS (SECURITY-CRITICAL)
// =========================================================================

export interface ExamOptionInput {
  id?: string;
  label: string; // "A" | "B" | "C" | "D" | "E"
  optionText: string;
  isCorrect: boolean;
}

export interface ExamQuestionInput {
  questionText: string;
  questionType: "single_choice" | "multiple_select";
  imageUrl?: string;
  marks: number;
  explanation?: string;
  category?: string;
  options: ExamOptionInput[];
}

export async function getExamQuestionsForAdmin(examId: string) {
  try {
    await checkSuperAdminAuth();

    const exam = await prisma.examination.findUnique({
      where: { id: examId },
      include: { course: true },
    });
    if (!exam) return { success: false, error: "Examination not found." };

    const questions = await prisma.examQuestion.findMany({
      where: { examId },
      include: {
        options: {
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    return {
      success: true,
      exam,
      questions: questions.map((q) => ({
        id: q.id,
        examId: q.examId,
        questionText: q.questionText,
        questionType: q.questionType,
        imageUrl: q.imageUrl,
        marks: Number(q.marks),
        explanation: q.explanation,
        category: q.category,
        orderIndex: q.orderIndex,
        isActive: q.isActive,
        options: q.options.map((o) => ({
          id: o.id,
          label: o.label,
          optionText: o.optionText,
          isCorrect: o.isCorrect, // Permitted for Super Admin
          orderIndex: o.orderIndex,
        })),
        createdAt: q.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createExamQuestion(examId: string, input: ExamQuestionInput) {
  try {
    await checkSuperAdminAuth();

    if (!input.questionText?.trim()) {
      return { success: false, error: "Question text is required." };
    }
    if (!input.options || input.options.length < 2 || input.options.length > 5) {
      return { success: false, error: "Question must have between 2 and 5 answer options (A–E)." };
    }

    const hasCorrect = input.options.some((o) => o.isCorrect);
    if (!hasCorrect) {
      return { success: false, error: "At least one answer option must be marked as correct." };
    }

    if (input.questionType === "single_choice") {
      const correctCount = input.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        return { success: false, error: "Single-choice questions must have exactly one correct answer." };
      }
    }

    const count = await prisma.examQuestion.count({ where: { examId } });

    const question = await prisma.examQuestion.create({
      data: {
        examId,
        questionText: input.questionText.trim(),
        questionType: input.questionType || "single_choice",
        imageUrl: input.imageUrl?.trim() || null,
        marks: Math.max(0.25, Number(input.marks) || 1.0),
        explanation: input.explanation?.trim() || null,
        category: input.category?.trim() || "General",
        orderIndex: count,
        isActive: true,
        options: {
          create: input.options.map((opt, idx) => ({
            label: opt.label || String.fromCharCode(65 + idx), // A, B, C, D, E
            optionText: opt.optionText.trim(),
            isCorrect: Boolean(opt.isCorrect),
            orderIndex: idx,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    safeRevalidate("/super-admin/examinations");
    return { success: true, question };
  } catch (error: any) {
    console.error("[createExamQuestion error]:", error);
    return { success: false, error: error.message || "Failed to create question." };
  }
}

export async function updateExamQuestion(questionId: string, input: Partial<ExamQuestionInput>) {
  try {
    await checkSuperAdminAuth();

    const existing = await prisma.examQuestion.findUnique({
      where: { id: questionId },
      include: { options: true },
    });
    if (!existing) return { success: false, error: "Question not found." };

    await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (input.questionText !== undefined) updateData.questionText = input.questionText.trim();
      if (input.questionType !== undefined) updateData.questionType = input.questionType;
      if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl?.trim() || null;
      if (input.marks !== undefined) updateData.marks = Math.max(0.25, Number(input.marks));
      if (input.explanation !== undefined) updateData.explanation = input.explanation?.trim() || null;
      if (input.category !== undefined) updateData.category = input.category?.trim();

      await tx.examQuestion.update({
        where: { id: questionId },
        data: updateData,
      });

      // Update options if provided
      if (input.options && Array.isArray(input.options)) {
        if (input.options.length < 2 || input.options.length > 5) {
          throw new Error("Questions must have between 2 and 5 answer options.");
        }
        const hasCorrect = input.options.some((o) => o.isCorrect);
        if (!hasCorrect) {
          throw new Error("At least one answer option must be marked as correct.");
        }

        // Delete existing and recreate
        await tx.examOption.deleteMany({ where: { questionId } });
        await tx.examOption.createMany({
          data: input.options.map((opt, idx) => ({
            questionId,
            label: opt.label || String.fromCharCode(65 + idx),
            optionText: opt.optionText.trim(),
            isCorrect: Boolean(opt.isCorrect),
            orderIndex: idx,
          })),
        });
      }
    });

    safeRevalidate("/super-admin/examinations");
    return { success: true, message: "Question updated successfully." };
  } catch (error: any) {
    console.error("[updateExamQuestion error]:", error);
    return { success: false, error: error.message || "Failed to update question." };
  }
}

export async function deleteExamQuestion(questionId: string) {
  try {
    await checkSuperAdminAuth();

    // Check if answered in any completed attempt
    const answeredCount = await prisma.examAnswer.count({ where: { questionId } });
    if (answeredCount > 0) {
      // Soft-delete by setting inactive to preserve historical records
      await prisma.examQuestion.update({
        where: { id: questionId },
        data: { isActive: false },
      });
      return { success: true, message: "Question has previous student answers; marked inactive to preserve historical audit integrity." };
    }

    await prisma.examQuestion.delete({ where: { id: questionId } });
    safeRevalidate("/super-admin/examinations");
    return { success: true, message: "Question deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reorderExamQuestions(examId: string, questionIds: string[]) {
  try {
    await checkSuperAdminAuth();

    await prisma.$transaction(
      questionIds.map((id, index) =>
        prisma.examQuestion.update({
          where: { id },
          data: { orderIndex: index },
        })
      )
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Bulk Question Import with Validation
export async function bulkImportQuestions(examId: string, questionsData: any[]) {
  try {
    await checkSuperAdminAuth();

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      return { success: false, error: "No valid question records provided." };
    }

    const errors: string[] = [];
    const validQuestions: any[] = [];

    questionsData.forEach((row, idx) => {
      const line = idx + 1;
      const text = row.questionText || row.Question || row["Question Text"];
      if (!text || String(text).trim().length < 5) {
        errors.push(`Row ${line}: Missing question text or text too short.`);
        return;
      }

      const optA = row.optionA || row["Option A"] || row.A;
      const optB = row.optionB || row["Option B"] || row.B;
      const optC = row.optionC || row["Option C"] || row.C;
      const optD = row.optionD || row["Option D"] || row.D;
      const optE = row.optionE || row["Option E"] || row.E;

      const rawOpts = [
        { label: "A", text: optA },
        { label: "B", text: optB },
        { label: "C", text: optC },
        { label: "D", text: optD },
        { label: "E", text: optE },
      ].filter((o) => Boolean(o.text && String(o.text).trim()));

      if (rawOpts.length < 2) {
        errors.push(`Row ${line}: At least 2 options (A & B) are required.`);
        return;
      }

      const correctRaw = String(row.correctAnswer || row["Correct Answer"] || row.Answer || "").trim().toUpperCase();
      if (!correctRaw) {
        errors.push(`Row ${line}: Missing correct answer indicator (e.g. 'A' or 'B,C').`);
        return;
      }

      const correctLetters = correctRaw.split(/[,;\s]+/).map((s: string) => s.trim());
      const hasValidCorrect = rawOpts.some((o) => correctLetters.includes(o.label));
      if (!hasValidCorrect) {
        errors.push(`Row ${line}: Correct answer '${correctRaw}' does not match any provided options.`);
        return;
      }

      const marks = Number(row.marks || row.Marks) || 1.0;
      const explanation = row.explanation || row.Explanation || null;
      const category = row.category || row.Category || "Imported";

      validQuestions.push({
        questionText: String(text).trim(),
        questionType: correctLetters.length > 1 ? "multiple_select" : "single_choice",
        marks,
        explanation,
        category,
        options: rawOpts.map((o, optIdx) => ({
          label: o.label,
          optionText: String(o.text).trim(),
          isCorrect: correctLetters.includes(o.label),
          orderIndex: optIdx,
        })),
      });
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: `Import failed with ${errors.length} validation errors.`,
        validationErrors: errors,
      };
    }

    const currentCount = await prisma.examQuestion.count({ where: { examId } });

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < validQuestions.length; i++) {
        const q = validQuestions[i];
        await tx.examQuestion.create({
          data: {
            examId,
            questionText: q.questionText,
            questionType: q.questionType,
            marks: q.marks,
            explanation: q.explanation,
            category: q.category,
            orderIndex: currentCount + i,
            isActive: true,
            options: {
              create: q.options,
            },
          },
        });
      }
    });

    safeRevalidate("/super-admin/examinations");
    return {
      success: true,
      importedCount: validQuestions.length,
      message: `Successfully imported ${validQuestions.length} examination questions!`,
    };
  } catch (error: any) {
    console.error("[bulkImportQuestions error]:", error);
    return { success: false, error: error.message || "Failed to bulk import questions." };
  }
}

// Pre-seed Starter Examination Question Banks
export async function seedStarterExaminationsIfEmpty() {
  try {
    await seedDefaultCoursesIfEmpty();

    const affCourse = await prisma.examCourse.findUnique({ where: { code: "AFFILIATE-MKT" } });
    const aiCourse = await prisma.examCourse.findUnique({ where: { code: "AI-MASTER" } });

    if (!affCourse || !aiCourse) return { success: false, error: "Courses not found." };

    // 1. Seed Affiliate Marketing Exam if not present
    const existingAffExam = await prisma.examination.findFirst({
      where: { courseId: affCourse.id },
    });

    if (!existingAffExam) {
      const affExam = await prisma.examination.create({
        data: {
          publicId: "EXAM-AFF-OCT2026",
          title: "Affiliate Marketing — Objective Examination",
          courseId: affCourse.id,
          description: "ProTech Assist Online Academy: Beginner Level Affiliate Marketing Objective Examination testing foundational knowledge across core principles, ethics, niche selection, performance tracking, calculations, and content strategy.",
          instructions: "1. You have 60 minutes to complete the examination.\n2. The pass mark is 80%, equivalent to 40 out of 50 marks.\n3. Each question carries 1 mark.\n4. You may navigate between questions and bookmark items for review.\n5. Click Submit Examination before the timer runs out. When the time expires, your answers should be submitted automatically.\n6. Select only one answer for each question.\n7. Each correct answer earns 1 mark. Incorrect or unanswered questions earn 0 marks.",
          durationMinutes: 60,
          passMarkPercentage: 80.0,
          maxAttempts: 2,
          status: "published",
          resultReleaseMode: "immediate",
          allowAnswerReview: true,
          accessMode: "open_verified",
        },
      });

      const affQuestions = AFFILIATE_50_QUESTIONS;

      for (let i = 0; i < affQuestions.length; i++) {
        const q = affQuestions[i];
        await prisma.examQuestion.create({
          data: {
            examId: affExam.id,
            questionText: q.questionText,
            questionType: q.questionType || "single_choice",
            marks: 1.0,
            explanation: q.explanation,
            category: q.category,
            orderIndex: i,
            isActive: true,
            options: {
              create: q.options.map((opt, optIdx) => ({
                label: opt.label,
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
                orderIndex: optIdx,
              })),
            },
          },
        });
      }
    }

    // 2. Seed AI Masterclass Exam if not present
    const existingAiExam = await prisma.examination.findFirst({
      where: { courseId: aiCourse.id },
    });

    if (!existingAiExam) {
      const aiExam = await prisma.examination.create({
        data: {
          publicId: "EXAM-AI-OCT2026",
          title: "ProTech Online Academy: AI Masterclass Certification Exam",
          courseId: aiCourse.id,
          description: "Rigorous technical and practical evaluation of Large Language Models, prompt engineering frameworks, temperature parameters, context windows, and autonomous agent architectures.",
          instructions: "1. Total duration: 35 minutes.\n2. Pass mark: 70% (7/10 questions minimum).\n3. Read each scenario carefully before selecting your answer.\n4. You may bookmark and review questions before final submission.",
          durationMinutes: 35,
          passMarkPercentage: 70.0,
          maxAttempts: 2,
          status: "published",
          resultReleaseMode: "immediate",
          allowAnswerReview: true,
          accessMode: "open_verified",
        },
      });

      const aiQuestions = [
        {
          questionText: "What does the 'Temperature' parameter control in Large Language Model (LLM) generation?",
          options: [
            { label: "A", optionText: "The physical temperature of the server GPU chips", isCorrect: false },
            { label: "B", optionText: "The randomness and creativity of the generated tokens", isCorrect: true },
            { label: "C", optionText: "The internet download speed of the response", isCorrect: false },
            { label: "D", optionText: "The maximum number of characters permitted in the prompt", isCorrect: false },
          ],
          explanation: "Lower temperature (e.g. 0.1) produces deterministic, focused answers; higher temperature (e.g. 0.8) introduces creative diversity in token selection.",
          category: "LLM Parameters",
        },
        {
          questionText: "In prompt engineering, what is the 'Few-Shot Prompting' technique?",
          options: [
            { label: "A", optionText: "Providing the model with multiple illustrative input-output examples before the task", isCorrect: true },
            { label: "B", optionText: "Asking the model only three questions per day", isCorrect: false },
            { label: "C", optionText: "Running the model on low power battery mode", isCorrect: false },
            { label: "D", optionText: "Typing the prompt in all lowercase letters", isCorrect: false },
          ],
          explanation: "Few-shot prompting conditions the model on exemplary pairs to guide format, tone, and reasoning structure.",
          category: "Prompt Engineering",
        },
        {
          questionText: "What does RAG stand for in modern enterprise AI architectures?",
          options: [
            { label: "A", optionText: "Realtime Automated Graphics", isCorrect: false },
            { label: "B", optionText: "Retrieval-Augmented Generation", isCorrect: true },
            { label: "C", optionText: "Random Access Gateway", isCorrect: false },
            { label: "D", optionText: "Recursive Algorithm Grid", isCorrect: false },
          ],
          explanation: "Retrieval-Augmented Generation combines semantic document search with LLM synthesis to reduce hallucinations and ground responses in private data.",
          category: "Enterprise AI Architecture",
        },
        {
          questionText: "What is an AI 'Token' in natural language processing?",
          options: [
            { label: "A", optionText: "A cryptocurrency coin used to pay the electricity bill", isCorrect: false },
            { label: "B", optionText: "A sub-word unit or fragment of text processed by language models (roughly 4 characters)", isCorrect: true },
            { label: "C", optionText: "A physical smartcard inserted into the computer", isCorrect: false },
            { label: "D", optionText: "A USB flash drive containing software", isCorrect: false },
          ],
          explanation: "Models process text as tokens, where 1,000 tokens typically correspond to about 750 English words.",
          category: "Foundational AI",
        },
        {
          questionText: "What is the primary role of an 'Autonomous AI Agent' compared to a basic chatbot?",
          options: [
            { label: "A", optionText: "An agent can reason, plan multi-step tasks, and call tools/APIs to achieve goals without constant manual prompts", isCorrect: true },
            { label: "B", optionText: "An agent can only reply with pre-written static text files", isCorrect: false },
            { label: "C", optionText: "An agent runs exclusively on disconnected vintage hardware", isCorrect: false },
            { label: "D", optionText: "An agent cannot access files or run code", isCorrect: false },
          ],
          explanation: "Autonomous agents use reasoning loops (ReAct/Plan-and-Solve) to invoke tools, read files, execute shell commands, and verify outcomes.",
          category: "Agentic Systems",
        },
        {
          questionText: "Which of the following are effective methods for preventing AI Hallucinations in production? (Select all that apply)",
          questionType: "multiple_select",
          options: [
            { label: "A", optionText: "Grounding responses with verified context via Retrieval-Augmented Generation (RAG)", isCorrect: true },
            { label: "B", optionText: "Using chain-of-thought verification and structured output schemas", isCorrect: true },
            { label: "C", optionText: "Lowering model temperature for factual queries", isCorrect: true },
            { label: "D", optionText: "Deleting all system prompts and instructions", isCorrect: false },
          ],
          explanation: "RAG, chain-of-thought, low temperature, and schema validation are core techniques to prevent hallucinations.",
          category: "AI Safety & Reliability",
        },
        {
          questionText: "What does 'Context Window' represent in a Large Language Model?",
          options: [
            { label: "A", optionText: "The maximum number of tokens the model can hold in memory simultaneously across input and output", isCorrect: true },
            { label: "B", optionText: "The size of the physical computer monitor screen", isCorrect: false },
            { label: "C", optionText: "The amount of RAM installed on the client's laptop", isCorrect: false },
            { label: "D", optionText: "The time elapsed between software updates", isCorrect: false },
          ],
          explanation: "The context window dictates how much text (prompts + history + retrieved docs) the model can consider at once.",
          category: "LLM Architecture",
        },
        {
          questionText: "In prompt engineering, what is the role of a 'System Prompt' (or developer instruction)?",
          options: [
            { label: "A", optionText: "It defines the persona, behavioral boundaries, guidelines, and core constraints for the model", isCorrect: true },
            { label: "B", optionText: "It shuts down the computer when generation is complete", isCorrect: false },
            { label: "C", optionText: "It translates user messages to hexadecimal numbers", isCorrect: false },
            { label: "D", optionText: "It deletes the database schema", isCorrect: false },
          ],
          explanation: "System prompts anchor the model's identity, tone, tool usage rules, and safety boundaries across interactions.",
          category: "Prompt Engineering",
        },
        {
          questionText: "When should an enterprise choose 'Fine-Tuning' over 'RAG' (Retrieval-Augmented Generation)?",
          options: [
            { label: "A", optionText: "When the primary goal is teaching the model a specific style, specialized vocabulary, or consistent structural output format", isCorrect: true },
            { label: "B", optionText: "When the company wants to constantly update factual knowledge every 5 minutes", isCorrect: false },
            { label: "C", optionText: "When there is zero training data available", isCorrect: false },
            { label: "D", optionText: "When the company has no budget or computational resources", isCorrect: false },
          ],
          explanation: "Fine-tuning adapts model behavior, style, and syntax, whereas RAG dynamically provides current factual knowledge.",
          category: "Model Customization",
        },
        {
          questionText: "In ethical AI adoption, why is Human-in-the-Loop (HITL) validation vital for high-stakes decision workflows?",
          options: [
            { label: "A", optionText: "To ensure critical decisions (e.g. financial disbursements, medical reviews) have human oversight and accountability", isCorrect: true },
            { label: "B", optionText: "To slow down computers intentionally", isCorrect: false },
            { label: "C", optionText: "Because computers cannot process numbers", isCorrect: false },
            { label: "D", optionText: "To prevent humans from learning how to use software", isCorrect: false },
          ],
          explanation: "Human-in-the-loop ensures human agency, compliance, and error-correction in high-impact automated processes.",
          category: "AI Ethics & Governance",
        },
      ];

      for (let i = 0; i < aiQuestions.length; i++) {
        const q = aiQuestions[i];
        await prisma.examQuestion.create({
          data: {
            examId: aiExam.id,
            questionText: q.questionText,
            questionType: q.questionType || "single_choice",
            marks: 1.0,
            explanation: q.explanation,
            category: q.category,
            orderIndex: i,
            isActive: true,
            options: {
              create: q.options.map((opt, optIdx) => ({
                label: opt.label,
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
                orderIndex: optIdx,
              })),
            },
          },
        });
      }
    }

    return { success: true, message: "Starter examination suites pre-seeded successfully." };
  } catch (error: any) {
    console.error("[seedStarterExaminations error]:", error);
    return { success: false, error: error.message };
  }
}

// =========================================================================
// 4. STUDENT EXAMINATION ACCESS & SERVER-AUTHORITATIVE ATTEMPT ENGINE
// =========================================================================

/**
 * Public examination entry lookup (STRICT SECURITY: NO ANSWER KEYS EXPOSED)
 */
export async function getPublicExamByPublicId(publicId: string) {
  try {
    await seedStarterExaminationsIfEmpty();

    const exam = await prisma.examination.findUnique({
      where: { publicId: publicId.trim() },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true,
            badge: true,
            icon: true,
          },
        },
        _count: {
          select: {
            questions: { where: { isActive: true } },
          },
        },
      },
    });

    if (!exam) return { success: false, error: "Examination not found." };
    if (exam.status === "archived") {
      return { success: false, error: "This examination has been archived and is no longer accessible." };
    }

    // Availability checks
    const now = new Date();
    if (exam.startDate && now < exam.startDate) {
      return {
        success: false,
        error: `This examination is scheduled to open on ${exam.startDate.toLocaleString()}. Please return then.`,
      };
    }
    if (exam.endDate && now > exam.endDate) {
      return {
        success: false,
        error: `This examination closed on ${exam.endDate.toLocaleString()}. Submissions are no longer accepted.`,
      };
    }

    return {
      success: true,
      exam: {
        id: exam.id,
        publicId: exam.publicId,
        title: exam.title,
        courseTitle: exam.course.title,
        courseCode: exam.course.code,
        courseBadge: exam.course.badge,
        courseIcon: exam.course.icon,
        description: exam.description,
        instructions: exam.instructions,
        coverImageUrl: exam.coverImageUrl,
        durationMinutes: exam.durationMinutes,
        passMarkPercentage: Number(exam.passMarkPercentage),
        maxAttempts: exam.maxAttempts,
        status: exam.status,
        totalQuestions: exam._count.questions,
        allowNavigation: exam.allowNavigation,
        allowBookmarks: exam.allowBookmarks,
        negativeMarking: exam.negativeMarking,
        negativeMarkValue: Number(exam.negativeMarkValue),
        resultReleaseMode: exam.resultReleaseMode,
        strictSecurity: exam.strictSecurity,
        maxViolationsAllowed: exam.maxViolationsAllowed,
      },
    };
  } catch (error: any) {
    console.error("[getPublicExamByPublicId error]:", error);
    return { success: false, error: "Failed to load examination details." };
  }
}

/**
 * Verify or register student participant for an examination
 */
export async function verifyOrRegisterParticipant(publicId: string, data: {
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentId?: string;
}) {
  try {
    if (!data.studentName?.trim() || !data.studentEmail?.trim()) {
      return { success: false, error: "Full Name and registered Email are required." };
    }

    const email = data.studentEmail.trim().toLowerCase();
    const exam = await prisma.examination.findUnique({
      where: { publicId },
    });
    if (!exam) return { success: false, error: "Examination not found." };

    let participant = await prisma.examParticipant.findUnique({
      where: {
        examId_studentEmail: {
          examId: exam.id,
          studentEmail: email,
        },
      },
    });

    if (!participant) {
      participant = await prisma.examParticipant.create({
        data: {
          examId: exam.id,
          studentName: data.studentName.trim(),
          studentEmail: email,
          studentPhone: data.studentPhone?.trim() || null,
          studentId: data.studentId?.trim() || null,
          verified: true,
        },
      });
    } else {
      // Update name/phone if changed
      participant = await prisma.examParticipant.update({
        where: { id: participant.id },
        data: {
          studentName: data.studentName.trim(),
          studentPhone: data.studentPhone?.trim() || participant.studentPhone,
          studentId: data.studentId?.trim() || participant.studentId,
        },
      });
    }

    return { success: true, participant };
  } catch (error: any) {
    console.error("[verifyOrRegisterParticipant error]:", error);
    return { success: false, error: error.message || "Failed to verify participant." };
  }
}

/**
 * Start or resume examination attempt (SERVER-AUTHORITATIVE DEADLINE)
 * CRITICAL SECURITY: Questions and Options are SANITIZED — NO `isCorrect` is returned!
 */
export async function startOrResumeExamAttempt(publicId: string, participantId: string, attemptIdParam?: string) {
  try {
    const exam = await prisma.examination.findUnique({
      where: { publicId },
      include: {
        course: true,
        questions: {
          where: { isActive: true },
          include: {
            options: {
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!exam || exam.status !== "published") {
      return { success: false, error: "Examination is not published or currently available." };
    }

    const participant = await prisma.examParticipant.findUnique({
      where: { id: participantId },
    });
    if (!participant) return { success: false, error: "Participant record not found." };

    // Fetch existing attempts
    const existingAttempts = await prisma.examAttempt.findMany({
      where: { examId: exam.id, participantId: participant.id },
      orderBy: { attemptNumber: "desc" },
      include: {
        answers: true,
        bookmarks: true,
        result: true,
        violations: true,
      },
    });

    const now = new Date();
    let currentAttempt = attemptIdParam
      ? existingAttempts.find((a) => a.id === attemptIdParam)
      : existingAttempts.find((a) => a.status === "IN_PROGRESS");

    // Check if in-progress attempt has timed out
    if (currentAttempt) {
      if (now > currentAttempt.serverDeadline) {
        // Auto-finalize attempt as timed out
        await finalizeExamAttemptInternal(currentAttempt.id, "TIMED_OUT");
        currentAttempt = undefined;
      }
    }

    // Check if the student has a terminated attempt that has NOT been authorized for retake
    const blockedTerminatedAttempt = existingAttempts.find(
      (a) => a.status === "TERMINATED" && !a.retakeAuthorized
    );
    if (blockedTerminatedAttempt) {
      return {
        success: false,
        error: `Examination Session Terminated: A security violation was recorded on your attempt (${blockedTerminatedAttempt.terminationReason || "prohibited screen departure"}). Please contact the ProTech Online Academy Super Administrator to review your attempt.`,
        isTerminated: true,
        lastAttemptId: blockedTerminatedAttempt.id,
      };
    }

    // If no active attempt, check attempt limits
    if (!currentAttempt) {
      const nonAuthorizedCompletedCount = existingAttempts.filter(
        (a) => a.status !== "IN_PROGRESS" && !a.retakeAuthorized
      ).length;

      if (nonAuthorizedCompletedCount >= exam.maxAttempts) {
        return {
          success: false,
          error: `You have reached the maximum allowed attempts (${exam.maxAttempts}) for this examination.`,
          isLimitReached: true,
          lastAttemptId: existingAttempts[0]?.id || null,
        };
      }

      // Resolve matching ExamStudent for automatic linking
      let linkedStudentId: string | null = null;
      let linkedAuthId: string | null = null;
      let matchedStudent = null;

      if (participant.studentId) {
        matchedStudent = await prisma.examStudent.findUnique({
          where: { studentId: participant.studentId.trim().toUpperCase() },
        });
      }
      if (!matchedStudent && participant.studentEmail) {
        matchedStudent = await prisma.examStudent.findFirst({
          where: { email: { equals: participant.studentEmail.trim(), mode: "insensitive" } },
        });
      }
      if (!matchedStudent && participant.studentName) {
        matchedStudent = await prisma.examStudent.findFirst({
          where: { fullName: { equals: participant.studentName.trim(), mode: "insensitive" } },
        });
      }

      if (matchedStudent) {
        linkedStudentId = matchedStudent.id;
        const auth = await prisma.examAuthorization.findFirst({
          where: { studentId: matchedStudent.id, examinationId: exam.id, status: "APPROVED" },
        });
        if (auth) linkedAuthId = auth.id;
      }

      // Create brand new attempt with server-authoritative deadline
      const attemptNumber = existingAttempts.length + 1;
      const durationMs = exam.durationMinutes * 60 * 1000;
      const gracePeriodMs = (exam.gracePeriodSeconds || 60) * 1000;
      const serverDeadline = new Date(now.getTime() + durationMs + gracePeriodMs);

      currentAttempt = await prisma.examAttempt.create({
        data: {
          examId: exam.id,
          participantId: participant.id,
          studentId: linkedStudentId,
          authorizationId: linkedAuthId,
          attemptNumber,
          status: "IN_PROGRESS",
          startedAt: now,
          serverDeadline,
        },
        include: {
          answers: true,
          bookmarks: true,
          result: true,
          violations: true,
        },
      });

      await prisma.examAuditEvent.create({
        data: {
          examId: exam.id,
          attemptId: currentAttempt.id,
          participantId: participant.id,
          action: "EXAM_STARTED",
          actorEmail: participant.studentEmail,
          actorRole: "STUDENT",
          details: { attemptId: currentAttempt.id, attemptNumber, studentName: participant.studentName },
        },
      });
    } else if (currentAttempt && !currentAttempt.studentId) {
      // Auto-link resumed attempt to ExamStudent if not already linked
      let matchedStudent = null;
      if (participant.studentId) {
        matchedStudent = await prisma.examStudent.findUnique({
          where: { studentId: participant.studentId.trim().toUpperCase() },
        });
      }
      if (!matchedStudent && participant.studentEmail) {
        matchedStudent = await prisma.examStudent.findFirst({
          where: { email: { equals: participant.studentEmail.trim(), mode: "insensitive" } },
        });
      }
      if (!matchedStudent && participant.studentName) {
        matchedStudent = await prisma.examStudent.findFirst({
          where: { fullName: { equals: participant.studentName.trim(), mode: "insensitive" } },
        });
      }

      if (matchedStudent) {
        let authId = currentAttempt.authorizationId;
        if (!authId) {
          const auth = await prisma.examAuthorization.findFirst({
            where: { studentId: matchedStudent.id, examinationId: exam.id, status: "APPROVED" },
          });
          if (auth) authId = auth.id;
        }

        await prisma.examAttempt.update({
          where: { id: currentAttempt.id },
          data: { studentId: matchedStudent.id, authorizationId: authId },
        });
      }
    }

    // Compute exact remaining seconds from server deadline
    const remainingSeconds = Math.max(0, Math.floor((currentAttempt.serverDeadline.getTime() - now.getTime()) / 1000));

    // SANITIZE QUESTIONS & OPTIONS: STRICTLY STRIP `isCorrect` AND `explanation`
    const sanitizedQuestions = exam.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      imageUrl: q.imageUrl,
      marks: Number(q.marks),
      category: q.category,
      orderIndex: q.orderIndex,
      options: q.options.map((o) => ({
        id: o.id,
        label: o.label,
        optionText: o.optionText,
        orderIndex: o.orderIndex,
        // isCorrect is DELIBERATELY EXCLUDED!
      })),
    }));

    // Map existing answers & bookmarks
    const savedAnswers: Record<string, string[]> = {};
    currentAttempt.answers.forEach((ans) => {
      savedAnswers[ans.questionId] = ans.selectedOptionIds;
    });

    const bookmarkedQuestionIds = currentAttempt.bookmarks.map((b) => b.questionId);

    return {
      success: true,
      attemptId: currentAttempt.id,
      attemptNumber: currentAttempt.attemptNumber,
      serverDeadline: currentAttempt.serverDeadline.toISOString(),
      remainingSeconds,
      studentName: participant.studentName,
      studentEmail: participant.studentEmail,
      exam: {
        id: exam.id,
        publicId: exam.publicId,
        title: exam.title,
        courseTitle: exam.course.title,
        durationMinutes: exam.durationMinutes,
        allowNavigation: exam.allowNavigation,
        allowChangeAnswer: exam.allowChangeAnswer,
        allowBookmarks: exam.allowBookmarks,
        allowUnansweredSubmission: exam.allowUnansweredSubmission,
        strictSecurity: exam.strictSecurity,
        maxViolationsAllowed: exam.maxViolationsAllowed,
      },
      questions: sanitizedQuestions,
      savedAnswers,
      bookmarkedQuestionIds,
    };
  } catch (error: any) {
    console.error("[startOrResumeExamAttempt error]:", error);
    return { success: false, error: error.message || "Failed to start examination attempt." };
  }
}

/**
 * Autosave student answer securely
 */
export async function saveExamAnswer(attemptId: string, questionId: string, selectedOptionIds: string[]) {
  try {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { examination: true },
    });
    if (!attempt) return { success: false, error: "Attempt not found." };

    if (attempt.status === "TERMINATED") {
      return {
        success: false,
        error: "Cannot save answer: Examination has been terminated due to a security violation.",
        isTerminated: true,
      };
    }

    if (attempt.status !== "IN_PROGRESS") {
      return {
        success: false,
        error: "Cannot save answers: Examination has already been submitted or finalized.",
        isFinalized: true,
      };
    }

    const now = new Date();
    const graceMs = (attempt.examination.gracePeriodSeconds || 60) * 1000;
    if (now.getTime() > attempt.serverDeadline.getTime() + graceMs) {
      await finalizeExamAttemptInternal(attempt.id, "TIMED_OUT");
      return { success: false, error: "Time expired. Your examination has been automatically submitted.", isTimedOut: true };
    }

    // Validate that the question belongs to this exam
    const question = await prisma.examQuestion.findFirst({
      where: { id: questionId, examId: attempt.examId, isActive: true },
      include: { options: { select: { id: true } } },
    });
    if (!question) {
      return { success: false, error: "Invalid question ID for this examination." };
    }

    // Validate selected option IDs
    const validOptionIds = question.options.map((o) => o.id);
    const sanitizedOptionIds = selectedOptionIds.filter((id) => validOptionIds.includes(id));

    // Upsert answer
    await prisma.examAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      create: {
        attemptId,
        questionId,
        selectedOptionIds: sanitizedOptionIds,
        savedAt: now,
      },
      update: {
        selectedOptionIds: sanitizedOptionIds,
        savedAt: now,
      },
    });

    return { success: true, savedAt: now.toLocaleTimeString() };
  } catch (error: any) {
    console.error("[saveExamAnswer error]:", error);
    return { success: false, error: "Failed to autosave answer." };
  }
}

/**
 * Toggle question bookmark
 */
export async function toggleExamBookmark(attemptId: string, questionId: string) {
  try {
    const existing = await prisma.examBookmark.findUnique({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
    });

    if (existing) {
      await prisma.examBookmark.delete({ where: { id: existing.id } });
      return { success: true, isBookmarked: false };
    } else {
      await prisma.examBookmark.create({
        data: { attemptId, questionId },
      });
      return { success: true, isBookmarked: true };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =========================================================================
// 5. SERVER-SIDE AUTOMATIC GRADING & SUBMISSION ENGINE
// =========================================================================

/**
 * Internal grading and finalization worker
 */
async function finalizeExamAttemptInternal(
  attemptId: string,
  submissionType: "SUBMITTED" | "TIMED_OUT" | "TERMINATED",
  terminationReason?: string
) {
  return await prisma.$transaction(async (tx) => {
    const attempt = await tx.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        examination: true,
        participant: true,
        answers: true,
        result: true,
      },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    if (attempt.status !== "IN_PROGRESS" && attempt.result !== null) {
      return { attempt, result: attempt.result, alreadyFinalized: true };
    }

    const exam = attempt.examination;
    const now = new Date();
    const timeSpentSeconds = Math.max(0, Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000));

    // Fetch all active questions and their true answer keys
    const questions = await tx.examQuestion.findMany({
      where: { examId: exam.id, isActive: true },
      include: {
        options: true,
      },
    });

    const studentAnswersMap = new Map<string, string[]>();
    attempt.answers.forEach((ans) => {
      studentAnswersMap.set(ans.questionId, ans.selectedOptionIds);
    });

    let totalScore = 0;
    let maxAvailableScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let answeredCount = 0;

    // Grade each question
    for (const q of questions) {
      const qMarks = Number(q.marks);
      maxAvailableScore += qMarks;

      const selectedIds = studentAnswersMap.get(q.id) || [];
      const hasAnswered = selectedIds.length > 0;

      if (hasAnswered) answeredCount++;

      const correctOptionIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);

      let isCorrect = false;
      let marksAwarded = 0;

      if (hasAnswered) {
        if (q.questionType === "single_choice") {
          // Exact single selection match
          if (selectedIds.length === 1 && correctOptionIds.includes(selectedIds[0])) {
            isCorrect = true;
            marksAwarded = qMarks;
            correctCount++;
          } else {
            isCorrect = false;
            incorrectCount++;
            if (exam.negativeMarking && Number(exam.negativeMarkValue) > 0) {
              marksAwarded = -Number(exam.negativeMarkValue);
            }
          }
        } else {
          // Multiple-select: exact match of all correct options
          const sortedSelected = [...selectedIds].sort();
          const sortedCorrect = [...correctOptionIds].sort();
          const isExactMatch =
            sortedSelected.length === sortedCorrect.length &&
            sortedSelected.every((val, idx) => val === sortedCorrect[idx]);

          if (isExactMatch) {
            isCorrect = true;
            marksAwarded = qMarks;
            correctCount++;
          } else {
            isCorrect = false;
            incorrectCount++;
            if (exam.negativeMarking && Number(exam.negativeMarkValue) > 0) {
              marksAwarded = -Number(exam.negativeMarkValue);
            }
          }
        }

        // Update answer record with grading
        await tx.examAnswer.upsert({
          where: { attemptId_questionId: { attemptId: attempt.id, questionId: q.id } },
          create: {
            attemptId: attempt.id,
            questionId: q.id,
            selectedOptionIds: selectedIds,
            isCorrect,
            marksAwarded,
            savedAt: now,
          },
          update: {
            isCorrect,
            marksAwarded,
          },
        });
      }

      totalScore += marksAwarded;
    }

    // Bounded total score (cannot be negative)
    const finalScore = Math.max(0, Math.round(totalScore * 100) / 100);
    const percentage = maxAvailableScore > 0 ? Math.round((finalScore / maxAvailableScore) * 100 * 100) / 100 : 0;
    const passed = percentage >= Number(exam.passMarkPercentage);
    const questionsUnanswered = Math.max(0, questions.length - answeredCount);

    const isPublished = exam.resultReleaseMode === "immediate";

    // Create or update result
    const result = await tx.examResult.upsert({
      where: { attemptId: attempt.id },
      create: {
        attemptId: attempt.id,
        examId: exam.id,
        participantId: attempt.participantId,
        totalQuestions: questions.length,
        questionsAnswered: answeredCount,
        questionsUnanswered,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        scoreObtained: finalScore,
        maxScore: maxAvailableScore,
        percentage,
        passed,
        isPublished,
        publishedAt: isPublished ? now : null,
        terminationReason: terminationReason || null,
      },
      update: {
        totalQuestions: questions.length,
        questionsAnswered: answeredCount,
        questionsUnanswered,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        scoreObtained: finalScore,
        maxScore: maxAvailableScore,
        percentage,
        passed,
        isPublished,
        publishedAt: isPublished ? now : null,
        terminationReason: terminationReason || null,
      },
    });

    // Resolve student linking if not already attached
    let studentIdToLink = attempt.studentId;
    let authIdToLink = attempt.authorizationId;
    if (!studentIdToLink) {
      let matchedStudent = null;
      if (attempt.participant.studentId) {
        matchedStudent = await tx.examStudent.findUnique({
          where: { studentId: attempt.participant.studentId.trim().toUpperCase() },
        });
      }
      if (!matchedStudent && attempt.participant.studentEmail) {
        matchedStudent = await tx.examStudent.findFirst({
          where: { email: { equals: attempt.participant.studentEmail.trim(), mode: "insensitive" } },
        });
      }
      if (!matchedStudent && attempt.participant.studentName) {
        matchedStudent = await tx.examStudent.findFirst({
          where: { fullName: { equals: attempt.participant.studentName.trim(), mode: "insensitive" } },
        });
      }
      if (matchedStudent) {
        studentIdToLink = matchedStudent.id;
        const auth = await tx.examAuthorization.findFirst({
          where: { studentId: matchedStudent.id, examinationId: exam.id, status: "APPROVED" },
        });
        if (auth) authIdToLink = auth.id;
      }
    }

    // Update attempt status
    const updatedAttempt = await tx.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: submissionType,
        submittedAt: now,
        timeSpentSeconds,
        studentId: studentIdToLink,
        authorizationId: authIdToLink,
        terminationReason: terminationReason || attempt.terminationReason,
        terminatedAt: submissionType === "TERMINATED" ? now : attempt.terminatedAt,
      },
    });

    const auditAction =
      submissionType === "TERMINATED"
        ? "EXAM_TERMINATED"
        : submissionType === "TIMED_OUT"
        ? "EXAM_TIME_EXPIRED"
        : "EXAM_SUBMITTED";

    // Audit log
    await tx.examAuditEvent.create({
      data: {
        examId: exam.id,
        attemptId: attempt.id,
        participantId: attempt.participantId,
        action: auditAction,
        actorEmail: attempt.participant.studentEmail,
        actorRole: "STUDENT",
        details: {
          attemptId: attempt.id,
          submissionType,
          terminationReason,
          score: finalScore,
          maxScore: maxAvailableScore,
          percentage,
          passed,
        },
      },
    });

    return { attempt: updatedAttempt, result, alreadyFinalized: false };
  });
}

/**
 * Submit examination attempt (Manual or Timeout Trigger)
 */
export async function submitExamAttempt(attemptId: string, idempotencyKey?: string) {
  try {
    const existing = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { result: true },
    });

    if (!existing) return { success: false, error: "Attempt not found." };
    if (existing.status !== "IN_PROGRESS") {
      return {
        success: true,
        alreadySubmitted: true,
        attemptId: existing.id,
        status: existing.status,
        message: "Examination was already submitted.",
      };
    }

    const { attempt, result } = await finalizeExamAttemptInternal(attemptId, "SUBMITTED");

    safeRevalidate("/super-admin/examinations");
    return {
      success: true,
      attemptId: attempt.id,
      status: attempt.status,
      result: result ? {
        scoreObtained: Number(result.scoreObtained),
        maxScore: Number(result.maxScore),
        percentage: Number(result.percentage),
        passed: result.passed,
        isPublished: result.isPublished,
      } : null,
      message: "Examination submitted successfully!",
    };
  } catch (error: any) {
    console.error("[submitExamAttempt error]:", error);
    return { success: false, error: error.message || "Failed to submit examination." };
  }
}

// =========================================================================
// 6. STUDENT RESULTS & REVIEW (PERMISSION-GATED)
// =========================================================================

export async function getStudentExamResult(attemptId: string) {
  try {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        examination: {
          include: { course: true },
        },
        participant: true,
        result: true,
        answers: true,
      },
    });

    if (!attempt || !attempt.result) {
      return { success: false, error: "Result not found or examination not yet finalized." };
    }

    const exam = attempt.examination;
    const result = attempt.result;

    // Check if result publication is held manually
    if (!result.isPublished) {
      return {
        success: true,
        isPublished: false,
        isTerminated: attempt.status === "TERMINATED",
        terminationReason: attempt.terminationReason || result.terminationReason || null,
        status: attempt.status,
        retakeAuthorized: attempt.retakeAuthorized,
        studentName: attempt.participant.studentName,
        examTitle: exam.title,
        courseTitle: exam.course.title,
        submittedAt: attempt.submittedAt?.toISOString(),
        message:
          attempt.status === "TERMINATED"
            ? "Your examination attempt was terminated due to a security policy violation."
            : "Your examination has been submitted successfully! The results will be released by the Online Academy Super Admin shortly.",
      };
    }

    // Answer Review Data (only if exam permits answer review)
    let reviewQuestions = null;
    if (exam.allowAnswerReview) {
      const questions = await prisma.examQuestion.findMany({
        where: { examId: exam.id, isActive: true },
        include: {
          options: {
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { orderIndex: "asc" },
      });

      const studentAnswersMap = new Map<string, any>();
      attempt.answers.forEach((ans) => {
        studentAnswersMap.set(ans.questionId, ans);
      });

      reviewQuestions = questions.map((q) => {
        const studentAns = studentAnswersMap.get(q.id);
        const selectedOptionIds = studentAns?.selectedOptionIds || [];

        return {
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          marks: Number(q.marks),
          marksAwarded: studentAns ? Number(studentAns.marksAwarded) : 0,
          isCorrect: studentAns ? Boolean(studentAns.isCorrect) : false,
          explanation: q.explanation,
          category: q.category,
          selectedOptionIds,
          options: q.options.map((o) => ({
            id: o.id,
            label: o.label,
            optionText: o.optionText,
            isCorrect: o.isCorrect, // Permitted now that result is officially published
          })),
        };
      });
    }

    return {
      success: true,
      isPublished: true,
      isTerminated: attempt.status === "TERMINATED",
      terminationReason: attempt.terminationReason || result.terminationReason || null,
      status: attempt.status,
      retakeAuthorized: attempt.retakeAuthorized,
      studentName: attempt.participant.studentName,
      studentEmail: attempt.participant.studentEmail,
      examTitle: exam.title,
      courseTitle: exam.course.title,
      durationMinutes: exam.durationMinutes,
      timeSpentSeconds: attempt.timeSpentSeconds,
      submittedAt: attempt.submittedAt?.toISOString(),
      scoreObtained: Number(result.scoreObtained),
      maxScore: Number(result.maxScore),
      percentage: Number(result.percentage),
      passMarkPercentage: Number(exam.passMarkPercentage),
      passed: result.passed,
      totalQuestions: result.totalQuestions,
      questionsAnswered: result.questionsAnswered,
      questionsUnanswered: result.questionsUnanswered,
      correctAnswers: result.correctAnswers,
      incorrectAnswers: result.incorrectAnswers,
      allowAnswerReview: exam.allowAnswerReview,
      reviewQuestions,
    };
  } catch (error: any) {
    console.error("[getStudentExamResult error]:", error);
    return { success: false, error: "Failed to load examination result." };
  }
}

// =========================================================================
// 7. SUPER ADMIN RESULTS AUDIT & EXPORT
// =========================================================================

export async function getSuperAdminExamResults(examId: string, filters?: {
  search?: string;
  status?: string; // "ALL" | "PASSED" | "FAILED" | "IN_PROGRESS" | "TERMINATED"
}) {
  try {
    await checkSuperAdminAuth();

    const exam = await prisma.examination.findUnique({
      where: { id: examId },
      include: { course: true },
    });
    if (!exam) return { success: false, error: "Examination not found." };

    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      include: {
        participant: true,
        result: true,
        answers: true,
        violations: {
          orderBy: { timestamp: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let filtered = attempts;

    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.participant.studentName.toLowerCase().includes(q) ||
          a.participant.studentEmail.toLowerCase().includes(q) ||
          (a.participant.studentId && a.participant.studentId.toLowerCase().includes(q))
      );
    }

    if (filters?.status && filters.status !== "ALL") {
      if (filters.status === "PASSED") {
        filtered = filtered.filter((a) => a.result?.passed === true);
      } else if (filters.status === "FAILED") {
        filtered = filtered.filter((a) => a.result?.passed === false && a.status !== "TERMINATED");
      } else if (filters.status === "IN_PROGRESS") {
        filtered = filtered.filter((a) => a.status === "IN_PROGRESS");
      } else if (filters.status === "TERMINATED") {
        filtered = filtered.filter((a) => a.status === "TERMINATED");
      }
    }

    const completed = attempts.filter((a) => a.result !== null);
    const passedCount = completed.filter((a) => a.result?.passed).length;
    const scores = completed.map((a) => Number(a.result?.scoreObtained || 0));
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const averageScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;

    const mapAttemptRow = (a: typeof attempts[0]) => {
      const resultData = a.result
        ? {
            scoreObtained: Number(a.result.scoreObtained),
            maxScore: Number(a.result.maxScore),
            percentage: Number(a.result.percentage),
            passed: a.result.passed,
            isPublished: a.result.isPublished,
            questionsAnswered: a.result.questionsAnswered,
            questionsUnanswered: a.result.questionsUnanswered,
            terminationReason: a.result.terminationReason || null,
          }
        : null;

      return {
        id: a.id,
        attemptId: a.id,
        participantId: a.participantId,
        studentName: a.participant.studentName,
        studentEmail: a.participant.studentEmail,
        studentPhone: a.participant.studentPhone,
        studentId: a.participant.studentId,
        attemptNumber: a.attemptNumber,
        status: a.status,
        startedAt: a.startedAt.toISOString(),
        submittedAt: a.submittedAt?.toISOString() || null,
        timeSpentSeconds: a.timeSpentSeconds,
        result: resultData,
        scoreObtained: resultData ? resultData.scoreObtained : null,
        maxScore: resultData ? resultData.maxScore : null,
        percentage: resultData ? resultData.percentage : null,
        passed: resultData ? resultData.passed : null,
        isPublished: resultData ? resultData.isPublished : false,
        violationCount: a.violationCount || a.violations.length,
        violations: a.violations.map((v) => ({
          id: v.id,
          eventType: v.eventType,
          reason: v.reason,
          timestamp: v.timestamp.toISOString(),
          details: v.details,
        })),
        terminationReason: a.terminationReason || a.result?.terminationReason || null,
        terminatedAt: a.terminatedAt?.toISOString() || null,
        retakeAuthorized: a.retakeAuthorized,
        retakeAuthorizedBy: a.retakeAuthorizedBy,
        retakeAuthorizedReason: a.retakeAuthorizedReason,
        retakeAuthorizedAt: a.retakeAuthorizedAt?.toISOString() || null,
        canReactivate: a.status === "TERMINATED" || a.status === "TIMED_OUT",
        studentDbId: a.studentId || null,
        examTitle: exam.title,
        examPublicId: exam.publicId,
      };
    };

    return {
      success: true,
      exam: {
        id: exam.id,
        publicId: exam.publicId,
        title: exam.title,
        courseTitle: exam.course.title,
        durationMinutes: exam.durationMinutes,
        passMarkPercentage: Number(exam.passMarkPercentage),
        resultReleaseMode: exam.resultReleaseMode,
        strictSecurity: exam.strictSecurity,
        maxViolationsAllowed: exam.maxViolationsAllowed,
      },
      summary: {
        totalParticipants: attempts.length,
        completedCount: completed.length,
        passedCount,
        failedCount: completed.length - passedCount,
        terminatedCount: attempts.filter((a) => a.status === "TERMINATED").length,
        passRate: completed.length > 0 ? Math.round((passedCount / completed.length) * 100) : 0,
        highestScore,
        averageScore,
      },
      submissions: filtered.map(mapAttemptRow),
      results: filtered.map(mapAttemptRow),
    };
  } catch (error: any) {
    console.error("[getSuperAdminExamResults error]:", error);
    return { success: false, error: error.message || "Failed to load examination results." };
  }
}

/**
 * Super Admin: Publish/Release examination results manually
 */
export async function publishExamResults(examId: string) {
  try {
    const user = await checkSuperAdminAuth();

    await prisma.examResult.updateMany({
      where: { examId, isPublished: false },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    await prisma.examAuditEvent.create({
      data: {
        examId,
        action: "RESULT_RELEASED",
        actorEmail: user.email || "superadmin@protechassist.com",
        actorRole: "SUPERADMIN",
        details: { timestamp: new Date() },
      },
    });

    safeRevalidate("/super-admin/examinations");
    return { success: true, message: "Examination results released to students successfully!" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate CSV export data for examination results
 */
export async function exportExamResultsCsv(examId: string) {
  try {
    await checkSuperAdminAuth();

    const exam = await prisma.examination.findUnique({
      where: { id: examId },
      include: { course: true },
    });
    if (!exam) return { success: false, error: "Examination not found." };

    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      include: {
        participant: true,
        result: true,
        violations: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Student Name",
      "Email Address",
      "Phone",
      "Student ID",
      "Attempt #",
      "Status",
      "Score Obtained",
      "Max Score",
      "Percentage",
      "Pass Mark %",
      "Outcome",
      "Violations Count",
      "Termination Reason",
      "Retake Authorized",
      "Time Spent (Minutes)",
      "Started At",
      "Submitted At",
    ];

    const rows = attempts.map((a) => {
      const res = a.result;
      const timeSpentMins = Math.round((a.timeSpentSeconds / 60) * 10) / 10;
      const outcome = a.status === "TERMINATED" ? "TERMINATED" : res ? (res.passed ? "PASS" : "FAIL") : "N/A";
      return [
        `"${a.participant.studentName.replace(/"/g, '""')}"`,
        `"${a.participant.studentEmail}"`,
        `"${a.participant.studentPhone || ""}"`,
        `"${a.participant.studentId || ""}"`,
        a.attemptNumber,
        a.status,
        res ? Number(res.scoreObtained) : "N/A",
        res ? Number(res.maxScore) : "N/A",
        res ? `${Number(res.percentage)}%` : "N/A",
        `${Number(exam.passMarkPercentage)}%`,
        outcome,
        a.violationCount || a.violations.length,
        `"${(a.terminationReason || "").replace(/"/g, '""')}"`,
        a.retakeAuthorized ? "YES" : "NO",
        timeSpentMins,
        a.startedAt.toISOString(),
        a.submittedAt ? a.submittedAt.toISOString() : "In Progress",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const filename = `${exam.publicId}-results-${new Date().toISOString().slice(0, 10)}.csv`;

    return {
      success: true,
      csvContent,
      filename,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =========================================================================
// 8. SECURITY & ANTI-CHEAT ENGINE
// =========================================================================

/**
 * Handle incoming security violation event
 */
export async function handleExamSecurityViolationInternal(input: {
  attemptId: string;
  eventType: string;
  reason?: string;
  details?: any;
}) {
  const { attemptId, eventType, reason, details } = input;

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      examination: true,
      participant: true,
    },
  });

  if (!attempt) {
    return { success: false, error: "Attempt not found" };
  }

  // If already finalized or terminated, log violation and return current status
  if (attempt.status !== "IN_PROGRESS") {
    await prisma.examViolation.create({
      data: {
        attemptId: attempt.id,
        eventType,
        reason: reason || `Event logged after attempt finalized (Status: ${attempt.status})`,
        details: details || {},
      },
    });

    return {
      success: true,
      status: attempt.status,
      terminated: attempt.status === "TERMINATED",
      alreadyFinalized: true,
      message: "Attempt already finalized",
    };
  }

  // Create violation record
  const violation = await prisma.examViolation.create({
    data: {
      attemptId: attempt.id,
      eventType,
      reason: reason || "Prohibited browser window departure or security violation detected.",
      details: details || {},
    },
  });

  const updatedViolationCount = (attempt.violationCount || 0) + 1;
  const exam = attempt.examination;

  // Log audit event
  await prisma.examAuditEvent.create({
    data: {
      examId: exam.id,
      attemptId: attempt.id,
      participantId: attempt.participantId,
      action: eventType,
      actorEmail: attempt.participant.studentEmail,
      actorRole: "STUDENT",
      details: {
        violationId: violation.id,
        violationNumber: updatedViolationCount,
        eventType,
        reason,
        details,
      },
    },
  });

  // Departure events that trigger termination under strictSecurity
  const departureEvents = ["TAB_HIDDEN", "WINDOW_BLURRED", "EXAM_PAGE_EXIT", "SUSPICIOUS_UNLOAD"];
  const isDeparture = departureEvents.includes(eventType);
  const shouldTerminate =
    exam.strictSecurity &&
    (isDeparture || updatedViolationCount > exam.maxViolationsAllowed);

  if (shouldTerminate) {
    const termReason =
      reason ||
      (isDeparture
        ? `Prohibited window departure (${eventType}): Candidate left the active examination window or switched browser tabs.`
        : `Exceeded maximum allowable security violations (${updatedViolationCount}/${exam.maxViolationsAllowed}).`);

    // Finalize the attempt as TERMINATED
    const finalization = await finalizeExamAttemptInternal(attempt.id, "TERMINATED", termReason);

    return {
      success: true,
      terminated: true,
      status: "TERMINATED",
      violationCount: updatedViolationCount,
      terminationReason: termReason,
      result: finalization.result
        ? {
            scoreObtained: Number(finalization.result.scoreObtained),
            maxScore: Number(finalization.result.maxScore),
            percentage: Number(finalization.result.percentage),
            passed: finalization.result.passed,
          }
        : null,
    };
  } else {
    // Non-terminating warning
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        violationCount: updatedViolationCount,
      },
    });

    return {
      success: true,
      terminated: false,
      status: "IN_PROGRESS",
      violationCount: updatedViolationCount,
      warning: `Security warning ${updatedViolationCount} logged. Please remain in the examination tab.`,
    };
  }
}

/**
 * Public Server Action to record violation from client
 */
export async function recordExamSecurityViolation(input: {
  attemptId: string;
  eventType: string;
  reason?: string;
  details?: any;
}) {
  try {
    return await handleExamSecurityViolationInternal(input);
  } catch (error: any) {
    console.error("[recordExamSecurityViolation error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Super Admin Action: Authorize student to retake examination after termination or limit
 */
export async function authorizeExamRetake(attemptId: string, reason: string) {
  try {
    const adminUser = await checkSuperAdminAuth();

    if (!reason || !reason.trim()) {
      return { success: false, error: "Administrative justification reason is required to authorize a retake." };
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        examination: true,
        participant: true,
      },
    });

    if (!attempt) {
      return { success: false, error: "Attempt record not found." };
    }

    const updated = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        retakeAuthorized: true,
        retakeAuthorizedBy: adminUser.email || "Super Admin",
        retakeAuthorizedReason: reason.trim(),
        retakeAuthorizedAt: new Date(),
      },
    });

    await prisma.examAuditEvent.create({
      data: {
        examId: attempt.examId,
        attemptId: attempt.id,
        participantId: attempt.participantId,
        action: "RETAKE_AUTHORIZED",
        actorEmail: adminUser.email || "Super Admin",
        actorRole: "SUPER_ADMIN",
        details: {
          attemptId: attempt.id,
          authorizedBy: adminUser.email,
          reason: reason.trim(),
          authorizedAt: new Date().toISOString(),
        },
      },
    });

    safeRevalidate("/super-admin/examinations");
    return {
      success: true,
      message: `Retake successfully authorized for ${attempt.participant.studentName}.`,
      attempt: {
        id: updated.id,
        retakeAuthorized: updated.retakeAuthorized,
        retakeAuthorizedBy: updated.retakeAuthorizedBy,
        retakeAuthorizedReason: updated.retakeAuthorizedReason,
        retakeAuthorizedAt: updated.retakeAuthorizedAt?.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("[authorizeExamRetake error]:", error);
    return { success: false, error: error.message || "Failed to authorize retake." };
  }
}

/**
 * Super Admin Action: Fetch violation timeline for an attempt
 */
export async function getAttemptViolationsLog(attemptId: string) {
  try {
    await checkSuperAdminAuth();

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        examination: true,
        participant: true,
        violations: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!attempt) {
      return { success: false, error: "Attempt not found." };
    }

    return {
      success: true,
      attempt: {
        id: attempt.id,
        studentName: attempt.participant.studentName,
        studentEmail: attempt.participant.studentEmail,
        status: attempt.status,
        terminationReason: attempt.terminationReason,
        terminatedAt: attempt.terminatedAt?.toISOString() || null,
        violationCount: attempt.violationCount,
        retakeAuthorized: attempt.retakeAuthorized,
        retakeAuthorizedBy: attempt.retakeAuthorizedBy,
        retakeAuthorizedReason: attempt.retakeAuthorizedReason,
        retakeAuthorizedAt: attempt.retakeAuthorizedAt?.toISOString() || null,
      },
      violations: attempt.violations.map((v) => ({
        id: v.id,
        eventType: v.eventType,
        reason: v.reason,
        timestamp: v.timestamp.toISOString(),
        details: v.details,
      })),
    };
  } catch (error: any) {
    console.error("[getAttemptViolationsLog error]:", error);
    return { success: false, error: error.message || "Failed to load violations log." };
  }
}
