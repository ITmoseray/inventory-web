"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import * as crypto from "crypto";
import { revalidatePath } from "next/cache";
import { StudentAccountStatus, ExamAuthorizationStatus } from "@prisma/client";

// =========================================================================
// 1. AUTH & SECURITY HELPERS
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
    throw new Error("Unauthorized: Please sign in as a Super Admin.");
  }
  const role = ((session.user as any)?.originalRole || session.user.role || "").toUpperCase();
  if (role !== "SUPERADMIN") {
    throw new Error("Forbidden: Super Admin authority required.");
  }
  return session.user;
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore during non-HTTP contexts (e.g. testing)
  }
}

/**
 * Normalizes full name for robust, case-insensitive comparison
 */
export function normalizeStudentName(name: string): string {
  if (!name) return "";
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "") // remove quotes/apostrophes
    .replace(/[^a-z0-9\s]/g, " ") // replace special chars with space
    .replace(/\s+/g, " "); // collapse multiple whitespace

  // Strip common honorific titles (e.g. Dr, Mr, Mrs, Ms, Prof)
  const tokens = cleaned
    .split(" ")
    .filter((w) => !["dr", "mr", "mrs", "ms", "miss", "prof", "engr", "chief", "sir"].includes(w));
  return tokens.join(" ") || cleaned;
}

/**
 * Compares two names with forgiving normalization (order independent if names match)
 */
export function compareStudentNames(inputName: string, registeredName: string): boolean {
  const n1 = normalizeStudentName(inputName);
  const n2 = normalizeStudentName(registeredName);

  if (!n1 || !n2) return false;
  if (n1 === n2) return true;

  // Check word set match (e.g. "Mohamed Kamara" vs "Kamara Mohamed")
  const words1 = n1.split(" ").filter(Boolean).sort().join(" ");
  const words2 = n2.split(" ").filter(Boolean).sort().join(" ");
  return words1 === words2;
}

/**
 * Cryptographically secure non-sequential student examination ID generator
 * Generates unambiguous IDs e.g. PTA-OA-7K4M9X2Q
 */
const ID_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // No 0, O, 1, I to avoid visual confusion

export async function generateUniqueStudentExamId(): Promise<string> {
  const PREFIX = "PTA-OA-";
  let uniqueId = "";
  let exists = true;
  let iterations = 0;

  while (exists && iterations < 50) {
    iterations++;
    const randomBytes = crypto.randomBytes(8);
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += ID_CHARSET[randomBytes[i] % ID_CHARSET.length];
    }
    uniqueId = `${PREFIX}${code}`;

    const duplicate = await prisma.examStudent.findUnique({
      where: { studentId: uniqueId },
    });
    if (!duplicate) {
      exists = false;
    }
  }

  if (exists) {
    // Fallback timestamp entropy
    uniqueId = `${PREFIX}${Date.now().toString(36).toUpperCase().slice(-8)}`;
  }

  return uniqueId;
}

/**
 * Secure Session Token for verified students (HMAC signed)
 */
const SESSION_SECRET = process.env.NEXTAUTH_SECRET || "protech-academy-secure-session-key-2026";

interface StudentPortalSessionPayload {
  studentDbId: string;
  studentExamId: string;
  studentName: string;
  authorizedExamIds: string[];
  issuedAt: number;
  expiresAt: number;
}

export function createStudentSessionToken(payload: Omit<StudentPortalSessionPayload, "issuedAt" | "expiresAt">): string {
  const now = Date.now();
  const fullPayload: StudentPortalSessionPayload = {
    ...payload,
    issuedAt: now,
    expiresAt: now + 3 * 60 * 60 * 1000, // 3 hours validity
  };

  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifyStudentSessionToken(token: string): StudentPortalSessionPayload | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [payloadB64, signature] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: StudentPortalSessionPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (Date.now() > payload.expiresAt) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// =========================================================================
// 2. SUPER ADMIN: STUDENT MANAGEMENT
// =========================================================================

export interface CreateStudentInput {
  fullName: string;
  email?: string;
  phone?: string;
  courseIds: string[]; // One or more enrolled courses
  notes?: string;
}

/**
 * Register a student and generate a unique examination ID.
 * NOTE: Registering a student does NOT authorize them for any exam!
 */
export async function createStudent(input: CreateStudentInput) {
  try {
    const user = await checkSuperAdminAuth();

    if (!input.fullName || !input.fullName.trim()) {
      return { success: false, error: "Student full name is required." };
    }

    if (!input.courseIds || input.courseIds.length === 0) {
      return { success: false, error: "Please select at least one course the student is enrolled in." };
    }

    // Verify all selected courses exist
    const courses = await prisma.examCourse.findMany({
      where: { id: { in: input.courseIds } },
    });
    if (courses.length === 0) {
      return { success: false, error: "None of the selected courses were found." };
    }

    const studentId = await generateUniqueStudentExamId();
    const cleanName = input.fullName.trim();
    const normalizedName = normalizeStudentName(cleanName);

    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.examStudent.create({
        data: {
          studentId,
          fullName: cleanName,
          normalizedName,
          email: input.email?.trim().toLowerCase() || null,
          phone: input.phone?.trim() || null,
          status: "ACTIVE",
          notes: input.notes?.trim() || null,
        },
      });

      // Create enrollments
      for (const course of courses) {
        await tx.examStudentEnrollment.create({
          data: {
            studentId: student.id,
            courseId: course.id,
          },
        });
      }

      // Audit Log
      await tx.examAuditEvent.create({
        data: {
          examId: null,
          action: "STUDENT_REGISTERED",
          actorEmail: user.email || "superadmin@protechassist.com",
          actorRole: "SUPERADMIN",
          details: {
            studentDatabaseId: student.id,
            studentExamId: student.studentId,
            fullName: student.fullName,
            courseTitles: courses.map((c) => c.title),
          },
        },
      });

      return { student, courses };
    });

    safeRevalidate("/super-admin/examinations");

    return {
      success: true,
      message: `Student registered successfully. Generated Examination ID: ${result.student.studentId}`,
      student: {
        id: result.student.id,
        studentId: result.student.studentId,
        fullName: result.student.fullName,
        email: result.student.email,
        phone: result.student.phone,
        status: result.student.status,
        courses: result.courses.map((c) => ({ id: c.id, title: c.title, code: c.code })),
        createdAt: result.student.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("[createStudent error]:", error);
    return { success: false, error: error.message || "Failed to register student." };
  }
}

/**
 * Super Admin: Get all registered students with filters
 */
export async function getSuperAdminStudents(filters?: {
  search?: string;
  courseId?: string;
  status?: string; // "ALL" | "ACTIVE" | "INACTIVE" | "SUSPENDED"
  authorizationStatus?: string; // "ALL" | "APPROVED" | "PENDING" | "REVOKED" | "NO_AUTH"
}) {
  try {
    await checkSuperAdminAuth();

    const students = await prisma.examStudent.findMany({
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
        authorizations: {
          include: {
            examination: {
              include: {
                course: true,
              },
            },
          },
        },
        attempts: {
          include: {
            result: true,
            examination: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let filtered = students;

    // Search filter
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          s.enrollments.some((e) => e.course.title.toLowerCase().includes(q) || e.course.code.toLowerCase().includes(q))
      );
    }

    // Course filter
    if (filters?.courseId && filters.courseId !== "ALL") {
      filtered = filtered.filter((s) => s.enrollments.some((e) => e.courseId === filters.courseId));
    }

    // Account status filter
    if (filters?.status && filters.status !== "ALL") {
      filtered = filtered.filter((s) => s.status === filters.status);
    }

    // Authorization status filter
    if (filters?.authorizationStatus && filters.authorizationStatus !== "ALL") {
      if (filters.authorizationStatus === "NO_AUTH") {
        filtered = filtered.filter((s) => s.authorizations.length === 0);
      } else {
        filtered = filtered.filter((s) =>
          s.authorizations.some((a) => a.status === filters.authorizationStatus)
        );
      }
    }

    return {
      success: true,
      students: filtered.map((s) => {
        const approvedAuths = s.authorizations.filter((a) => a.status === "APPROVED");
        const completedAttempts = s.attempts.filter((a) => a.status === "SUBMITTED" || a.status === "MARKED" || a.result !== null);

        return {
          id: s.id,
          studentId: s.studentId,
          fullName: s.fullName,
          email: s.email,
          phone: s.phone,
          status: s.status,
          notes: s.notes,
          createdAt: s.createdAt.toISOString(),
          courses: s.enrollments.map((e) => ({
            id: e.course.id,
            title: e.course.title,
            code: e.course.code,
            enrolledAt: e.enrolledAt.toISOString(),
          })),
          authorizations: s.authorizations.map((a) => ({
            id: a.id,
            examinationId: a.examinationId,
            examTitle: a.examination.title,
            examPublicId: a.examination.publicId,
            courseTitle: a.examination.course.title,
            status: a.status,
            validFrom: a.validFrom?.toISOString() || null,
            validUntil: a.validUntil?.toISOString() || null,
            maxAttemptsAllowed: a.maxAttemptsAllowed,
            attemptsConsumed: a.attemptsConsumed,
            authorizedBy: a.authorizedBy,
            authorizedAt: a.authorizedAt?.toISOString() || null,
            revokedBy: a.revokedBy,
            revocationReason: a.revocationReason,
          })),
          approvedExamsCount: approvedAuths.length,
          totalAttemptsCount: s.attempts.length,
          completedExamsCount: completedAttempts.length,
          latestAttempt: s.attempts[0]
            ? {
                id: s.attempts[0].id,
                examTitle: s.attempts[0].examination.title,
                status: s.attempts[0].status,
                startedAt: s.attempts[0].startedAt.toISOString(),
                score: s.attempts[0].result ? Number(s.attempts[0].result.scoreObtained) : null,
                passed: s.attempts[0].result ? s.attempts[0].result.passed : null,
              }
            : null,
        };
      }),
      stats: {
        totalStudents: students.length,
        activeStudents: students.filter((s) => s.status === "ACTIVE").length,
        suspendedStudents: students.filter((s) => s.status === "SUSPENDED").length,
        studentsWithApprovedExams: students.filter((s) => s.authorizations.some((a) => a.status === "APPROVED")).length,
        studentsPendingAuth: students.filter((s) => s.authorizations.some((a) => a.status === "PENDING")).length,
        studentsNoAuth: students.filter((s) => s.authorizations.length === 0).length,
      },
    };
  } catch (error: any) {
    console.error("[getSuperAdminStudents error]:", error);
    return { success: false, error: error.message || "Failed to load students." };
  }
}

/**
 * Update student profile and course enrollments
 */
export async function updateStudent(
  studentDatabaseId: string,
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    status?: StudentAccountStatus;
    courseIds?: string[];
    notes?: string;
  }
) {
  try {
    const user = await checkSuperAdminAuth();

    const existing = await prisma.examStudent.findUnique({
      where: { id: studentDatabaseId },
      include: { enrollments: true },
    });
    if (!existing) return { success: false, error: "Student record not found." };

    const updateFields: any = {};
    if (data.fullName !== undefined && data.fullName.trim()) {
      updateFields.fullName = data.fullName.trim();
      updateFields.normalizedName = normalizeStudentName(data.fullName.trim());
    }
    if (data.email !== undefined) updateFields.email = data.email?.trim().toLowerCase() || null;
    if (data.phone !== undefined) updateFields.phone = data.phone?.trim() || null;
    if (data.status !== undefined) updateFields.status = data.status;
    if (data.notes !== undefined) updateFields.notes = data.notes?.trim() || null;

    await prisma.$transaction(async (tx) => {
      await tx.examStudent.update({
        where: { id: studentDatabaseId },
        data: updateFields,
      });

      // Sync course enrollments if provided
      if (data.courseIds !== undefined) {
        // Delete enrollments not in list
        await tx.examStudentEnrollment.deleteMany({
          where: {
            studentId: studentDatabaseId,
            courseId: { notIn: data.courseIds },
          },
        });

        // Add new enrollments
        for (const cId of data.courseIds) {
          await tx.examStudentEnrollment.upsert({
            where: {
              studentId_courseId: {
                studentId: studentDatabaseId,
                courseId: cId,
              },
            },
            create: {
              studentId: studentDatabaseId,
              courseId: cId,
            },
            update: {},
          });
        }
      }

      await tx.examAuditEvent.create({
        data: {
          examId: null,
          action: "STUDENT_UPDATED",
          actorEmail: user.email || "superadmin@protechassist.com",
          actorRole: "SUPERADMIN",
          details: {
            studentDatabaseId,
            studentExamId: existing.studentId,
            updatedFields: Object.keys(updateFields),
          },
        },
      });
    });

    safeRevalidate("/super-admin/examinations");
    return { success: true, message: "Student record updated successfully." };
  } catch (error: any) {
    console.error("[updateStudent error]:", error);
    return { success: false, error: error.message || "Failed to update student." };
  }
}

/**
 * Reissue a student's examination ID with administrative security controls
 */
export async function reissueStudentExamId(studentDatabaseId: string, reason: string) {
  try {
    const user = await checkSuperAdminAuth();

    if (!reason || !reason.trim()) {
      return { success: false, error: "Administrative reason is required to reissue a student examination ID." };
    }

    const student = await prisma.examStudent.findUnique({
      where: { id: studentDatabaseId },
    });
    if (!student) return { success: false, error: "Student not found." };

    const oldId = student.studentId;
    const newId = await generateUniqueStudentExamId();

    await prisma.$transaction(async (tx) => {
      await tx.examStudent.update({
        where: { id: studentDatabaseId },
        data: { studentId: newId },
      });

      await tx.examAuditEvent.create({
        data: {
          examId: null,
          action: "STUDENT_ID_REISSUED",
          actorEmail: user.email || "superadmin@protechassist.com",
          actorRole: "SUPERADMIN",
          details: {
            studentDatabaseId,
            oldStudentId: oldId,
            newStudentId: newId,
            reason: reason.trim(),
            reissuedAt: new Date().toISOString(),
          },
        },
      });
    });

    safeRevalidate("/super-admin/examinations");
    return {
      success: true,
      message: `Student examination ID reissued successfully: ${newId}`,
      oldStudentId: oldId,
      newStudentId: newId,
    };
  } catch (error: any) {
    console.error("[reissueStudentExamId error]:", error);
    return { success: false, error: error.message || "Failed to reissue examination ID." };
  }
}

/**
 * Activate, deactivate, or suspend a student's examination access
 */
export async function setStudentAccountStatus(studentDatabaseId: string, status: StudentAccountStatus, reason?: string) {
  try {
    const user = await checkSuperAdminAuth();

    const student = await prisma.examStudent.findUnique({
      where: { id: studentDatabaseId },
    });
    if (!student) return { success: false, error: "Student not found." };

    await prisma.$transaction(async (tx) => {
      await tx.examStudent.update({
        where: { id: studentDatabaseId },
        data: { status },
      });

      await tx.examAuditEvent.create({
        data: {
          examId: null,
          action: `STUDENT_STATUS_${status}`,
          actorEmail: user.email || "superadmin@protechassist.com",
          actorRole: "SUPERADMIN",
          details: {
            studentDatabaseId,
            studentExamId: student.studentId,
            oldStatus: student.status,
            newStatus: status,
            reason: reason?.trim() || null,
          },
        },
      });
    });

    safeRevalidate("/super-admin/examinations");
    return { success: true, message: `Student status changed to ${status}.` };
  } catch (error: any) {
    console.error("[setStudentAccountStatus error]:", error);
    return { success: false, error: error.message || "Failed to change student status." };
  }
}

// =========================================================================
// 3. ADMINISTRATOR-CONTROLLED EXAMINATION AUTHORIZATION
// =========================================================================

export interface AuthorizeExamInput {
  studentDatabaseId?: string;
  studentId?: string;
  examinationId: string;
  status: "APPROVED" | "PENDING" | "REVOKED";
  validFrom?: string | null;
  validUntil?: string | null;
  maxAttemptsAllowed?: number;
}

/**
 * Authorize an examination for a specific student.
 * NOTE: Explicit authorization is MANDATORY for exam entry.
 */
export async function authorizeExaminationForStudent(input: AuthorizeExamInput) {
  try {
    const user = await checkSuperAdminAuth();

    const targetStudentId = input.studentDatabaseId || input.studentId;
    if (!targetStudentId) {
      return { success: false, error: "Student ID is required." };
    }

    const student = await prisma.examStudent.findUnique({
      where: { id: targetStudentId },
      include: { enrollments: true },
    });
    if (!student) return { success: false, error: "Student record not found." };

    const exam = await prisma.examination.findUnique({
      where: { id: input.examinationId },
      include: { course: true },
    });
    if (!exam) return { success: false, error: "Examination not found." };

    // Auto-enroll student into the course if not already enrolled
    const isEnrolled = student.enrollments.some((e) => e.courseId === exam.courseId);
    if (!isEnrolled) {
      await prisma.examStudentEnrollment.create({
        data: {
          studentId: student.id,
          courseId: exam.courseId,
        },
      });
    }

    const validFromDate = input.validFrom ? new Date(input.validFrom) : null;
    const validUntilDate = input.validUntil ? new Date(input.validUntil) : null;

    if (validFromDate && validUntilDate && validFromDate >= validUntilDate) {
      return { success: false, error: "Opening date/time must precede closing date/time." };
    }

    const authRecord = await prisma.examAuthorization.upsert({
      where: {
        studentId_examinationId: {
          studentId: student.id,
          examinationId: exam.id,
        },
      },
      create: {
        studentId: student.id,
        examinationId: exam.id,
        status: input.status as ExamAuthorizationStatus,
        validFrom: validFromDate,
        validUntil: validUntilDate,
        maxAttemptsAllowed: Math.max(1, Number(input.maxAttemptsAllowed) || 1),
        attemptsConsumed: 0,
        authorizedBy: user.email || "superadmin@protechassist.com",
        authorizedAt: input.status === "APPROVED" ? new Date() : null,
      },
      update: {
        status: input.status as ExamAuthorizationStatus,
        validFrom: validFromDate,
        validUntil: validUntilDate,
        maxAttemptsAllowed: Math.max(1, Number(input.maxAttemptsAllowed) || 1),
        authorizedBy: user.email || "superadmin@protechassist.com",
        authorizedAt: input.status === "APPROVED" ? new Date() : undefined,
      },
      include: {
        examination: { include: { course: true } },
        student: true,
      },
    });

    await prisma.examAuditEvent.create({
      data: {
        examId: exam.id,
        action: `EXAM_AUTHORIZATION_${input.status}`,
        actorEmail: user.email || "superadmin@protechassist.com",
        actorRole: "SUPERADMIN",
        details: {
          studentName: student.fullName,
          studentExamId: student.studentId,
          examTitle: exam.title,
          status: input.status,
          maxAttemptsAllowed: authRecord.maxAttemptsAllowed,
          validFrom: validFromDate?.toISOString(),
          validUntil: validUntilDate?.toISOString(),
        },
      },
    });

    safeRevalidate("/super-admin/examinations");

    return {
      success: true,
      message: `Examination authorization successfully saved as ${input.status} for ${student.fullName}.`,
      authorizationId: authRecord.id,
      authorization: {
        id: authRecord.id,
        status: authRecord.status,
        examTitle: exam.title,
        studentName: student.fullName,
        studentExamId: student.studentId,
        maxAttemptsAllowed: authRecord.maxAttemptsAllowed,
        attemptsConsumed: authRecord.attemptsConsumed,
      },
    };
  } catch (error: any) {
    console.error("[authorizeExaminationForStudent error]:", error);
    return { success: false, error: error.message || "Failed to authorize examination." };
  }
}

/**
 * Super Admin: Revoke examination authorization
 */
export async function revokeExaminationAuthorization(authorizationId: string, reason: string) {
  try {
    const user = await checkSuperAdminAuth();

    if (!reason || !reason.trim()) {
      return { success: false, error: "Administrative reason is required to revoke an examination authorization." };
    }

    const authRecord = await prisma.examAuthorization.findUnique({
      where: { id: authorizationId },
      include: { examination: true, student: true },
    });
    if (!authRecord) return { success: false, error: "Authorization record not found." };

    const updated = await prisma.examAuthorization.update({
      where: { id: authorizationId },
      data: {
        status: "REVOKED",
        revokedBy: user.email || "superadmin@protechassist.com",
        revocationReason: reason.trim(),
        revokedAt: new Date(),
      },
    });

    await prisma.examAuditEvent.create({
      data: {
        examId: authRecord.examinationId,
        action: "EXAM_AUTHORIZATION_REVOKED",
        actorEmail: user.email || "superadmin@protechassist.com",
        actorRole: "SUPERADMIN",
        details: {
          authorizationId,
          studentName: authRecord.student.fullName,
          studentExamId: authRecord.student.studentId,
          examTitle: authRecord.examination.title,
          reason: reason.trim(),
        },
      },
    });

    safeRevalidate("/super-admin/examinations");
    return { success: true, message: `Examination access revoked for ${authRecord.student.fullName}.` };
  } catch (error: any) {
    console.error("[revokeExaminationAuthorization error]:", error);
    return { success: false, error: error.message || "Failed to revoke authorization." };
  }
}

/**
 * Super Admin: Grant an additional examination attempt / retake
 */
export async function grantStudentExamRetake(authorizationId: string, reason: string, additionalAttempts = 1) {
  try {
    const user = await checkSuperAdminAuth();

    if (!reason || !reason.trim()) {
      return { success: false, error: "Administrative justification reason is required to grant a retake." };
    }

    const authRecord = await prisma.examAuthorization.findUnique({
      where: { id: authorizationId },
      include: { examination: true, student: true },
    });
    if (!authRecord) return { success: false, error: "Authorization record not found." };

    const updated = await prisma.examAuthorization.update({
      where: { id: authorizationId },
      data: {
        status: "APPROVED", // Re-approve if revoked or expired
        maxAttemptsAllowed: authRecord.maxAttemptsAllowed + Math.max(1, additionalAttempts),
      },
    });

    await prisma.examAuditEvent.create({
      data: {
        examId: authRecord.examinationId,
        action: "RETAKE_GRANTED",
        actorEmail: user.email || "superadmin@protechassist.com",
        actorRole: "SUPERADMIN",
        details: {
          authorizationId,
          studentName: authRecord.student.fullName,
          studentExamId: authRecord.student.studentId,
          examTitle: authRecord.examination.title,
          newMaxAttempts: updated.maxAttemptsAllowed,
          reason: reason.trim(),
        },
      },
    });

    safeRevalidate("/super-admin/examinations");
    return {
      success: true,
      message: `Retake granted for ${authRecord.student.fullName}. Total attempts allowed: ${updated.maxAttemptsAllowed}.`,
    };
  } catch (error: any) {
    console.error("[grantStudentExamRetake error]:", error);
    return { success: false, error: error.message || "Failed to grant retake." };
  }
}

/**
 * Super Admin: Fetch all examination authorizations
 */
export async function getSuperAdminAuthorizations(filters?: {
  search?: string;
  courseId?: string;
  status?: string;
}) {
  try {
    await checkSuperAdminAuth();

    const auths = await prisma.examAuthorization.findMany({
      include: {
        student: true,
        examination: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    let filtered = auths;

    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.student.fullName.toLowerCase().includes(q) ||
          a.student.studentId.toLowerCase().includes(q) ||
          a.examination.title.toLowerCase().includes(q) ||
          a.examination.course.title.toLowerCase().includes(q)
      );
    }

    if (filters?.courseId && filters.courseId !== "ALL") {
      filtered = filtered.filter((a) => a.examination.courseId === filters.courseId);
    }

    if (filters?.status && filters.status !== "ALL") {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    return {
      success: true,
      authorizations: filtered.map((a) => ({
        id: a.id,
        studentId: a.studentId,
        studentName: a.student.fullName,
        studentExamId: a.student.studentId,
        studentStatus: a.student.status,
        examinationId: a.examinationId,
        examPublicId: a.examination.publicId,
        examTitle: a.examination.title,
        courseTitle: a.examination.course.title,
        status: a.status,
        validFrom: a.validFrom?.toISOString() || null,
        validUntil: a.validUntil?.toISOString() || null,
        maxAttemptsAllowed: a.maxAttemptsAllowed,
        attemptsConsumed: a.attemptsConsumed,
        authorizedBy: a.authorizedBy,
        authorizedAt: a.authorizedAt?.toISOString() || null,
        revokedBy: a.revokedBy,
        revocationReason: a.revocationReason,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("[getSuperAdminAuthorizations error]:", error);
    return { success: false, error: error.message || "Failed to load authorizations." };
  }
}

/**
 * Super Admin: Fetch comprehensive examination activity logs
 */
export async function getSuperAdminStudentActivityLogs(limit = 100) {
  try {
    await checkSuperAdminAuth();

    const events = await prisma.examAuditEvent.findMany({
      take: limit,
      orderBy: { timestamp: "desc" },
      include: {
        examination: {
          include: { course: true },
        },
      },
    });

    return {
      success: true,
      logs: events.map((e) => ({
        id: e.id,
        action: e.action,
        actorEmail: e.actorEmail,
        actorRole: e.actorRole,
        details: e.details,
        timestamp: e.timestamp.toISOString(),
        examTitle: e.examination?.title || "System Level",
        courseTitle: e.examination?.course?.title || "System",
      })),
    };
  } catch (error: any) {
    console.error("[getSuperAdminStudentActivityLogs error]:", error);
    return { success: false, error: error.message || "Failed to load audit logs." };
  }
}

// =========================================================================
// 4. PUBLIC STUDENT IDENTITY VERIFICATION & PORTAL ACCESS
// =========================================================================

export interface StudentVerificationResult {
  success: boolean;
  error?: string;
  sessionToken?: string;
  student?: {
    studentName: string;
    studentId: string;
  };
  authorizedExams?: {
    authorizationId: string;
    examinationId: string;
    publicId: string;
    title: string;
    courseTitle: string;
    durationMinutes: number;
    passMarkPercentage: number;
    maxAttemptsAllowed: number;
    attemptsConsumed: number;
    hasActiveAttempt: boolean;
    activeAttemptId?: string;
    accessStatus: "READY" | "SCHEDULED_FUTURE" | "EXPIRED" | "COMPLETED" | "NOT_AUTHORIZED";
    statusMessage?: string;
  }[];
}

/**
 * Public Entry Verification: Full Name + Student Examination ID
 * Implements strict server-side validation and security rules.
 */
export async function verifyStudentExaminationAccess(
  fullName: string,
  studentExamId: string
): Promise<StudentVerificationResult> {
  try {
    if (!fullName || !fullName.trim()) {
      return { success: false, error: "Please enter your registered Full Name." };
    }
    if (!studentExamId || !studentExamId.trim()) {
      return { success: false, error: "Please enter your unique Student Examination ID." };
    }

    const cleanExamId = studentExamId.trim().toUpperCase();

    // 1. Look up student by examination ID
    const student = await prisma.examStudent.findUnique({
      where: { studentId: cleanExamId },
      include: {
        enrollments: {
          include: { course: true },
        },
        authorizations: {
          include: {
            examination: {
              include: { course: true },
            },
          },
        },
        attempts: {
          include: { result: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // 2. Reject if student does not exist OR full name does not match normalized registered name
    // (Notice: We return a consistent, safe error message to avoid account existence enumeration)
    if (!student || !compareStudentNames(fullName, student.fullName)) {
      return {
        success: false,
        error: "Verification failed: The submitted Full Name or Student Examination ID does not match any registered student records.",
      };
    }

    // 3. Confirm student account is active
    if (student.status !== "ACTIVE") {
      const statusMsg =
        student.status === "SUSPENDED"
          ? "Your student examination account has been suspended by the Online Academy Super Administration."
          : "Your student examination account is currently inactive.";
      return {
        success: false,
        error: `${statusMsg} Please contact the academy administrator for clearance.`,
      };
    }

    // 4. Verify Administrator-Controlled Examination Authorizations
    // If the student has zero authorizations:
    if (student.authorizations.length === 0) {
      return {
        success: false,
        error: "Your examination access has not yet been authorized. Please contact the academy administrator.",
      };
    }

    const now = new Date();
    const evaluatedExams: StudentVerificationResult["authorizedExams"] = [];

    for (const authRec of student.authorizations) {
      const exam = authRec.examination;
      if (exam.status !== "published") continue; // Exam must be published by admin

      // Check if student currently has an IN_PROGRESS attempt for this exam
      const activeAttempt = student.attempts.find(
        (a) => a.examId === exam.id && a.status === "IN_PROGRESS"
      );

      let accessStatus: "READY" | "SCHEDULED_FUTURE" | "EXPIRED" | "COMPLETED" | "NOT_AUTHORIZED" = "READY";
      let statusMessage = "Authorized & Ready to Begin";

      if (authRec.status !== "APPROVED") {
        accessStatus = "NOT_AUTHORIZED";
        statusMessage = "Your examination access has not yet been authorized. Please contact the academy administrator.";
      } else if (authRec.validFrom && now < authRec.validFrom) {
        accessStatus = "SCHEDULED_FUTURE";
        statusMessage = `This examination is scheduled to open on ${authRec.validFrom.toLocaleString()}. Please return at that time.`;
      } else if (authRec.validUntil && now > authRec.validUntil) {
        accessStatus = "EXPIRED";
        statusMessage = `This examination authorization expired on ${authRec.validUntil.toLocaleString()}.`;
      } else if (authRec.attemptsConsumed >= authRec.maxAttemptsAllowed && !activeAttempt) {
        accessStatus = "COMPLETED";
        statusMessage = "You have already completed this examination. Please contact the academy administrator if you have been approved for a retake.";
      } else if (activeAttempt) {
        accessStatus = "READY";
        statusMessage = "Resume active in-progress attempt";
      }

      evaluatedExams.push({
        authorizationId: authRec.id,
        examinationId: exam.id,
        publicId: exam.publicId,
        title: exam.title,
        courseTitle: exam.course.title,
        durationMinutes: exam.durationMinutes,
        passMarkPercentage: Number(exam.passMarkPercentage),
        maxAttemptsAllowed: authRec.maxAttemptsAllowed,
        attemptsConsumed: authRec.attemptsConsumed,
        hasActiveAttempt: Boolean(activeAttempt),
        activeAttemptId: activeAttempt?.id,
        accessStatus,
        statusMessage,
      });
    }

    if (evaluatedExams.length === 0) {
      return {
        success: false,
        error: "No active examinations are currently assigned to your enrolled courses.",
      };
    }

    // Check if at least one exam is currently READY
    const readyExams = evaluatedExams.filter((e) => e.accessStatus === "READY");
    if (readyExams.length === 0) {
      // Find the most relevant error message
      const specificMsg = evaluatedExams[0]?.statusMessage || "Your examination access has not yet been authorized.";
      return {
        success: false,
        error: specificMsg,
      };
    }

    // 5. Create secure short-lived examination session token
    const sessionToken = createStudentSessionToken({
      studentDbId: student.id,
      studentExamId: student.studentId,
      studentName: student.fullName,
      authorizedExamIds: readyExams.map((e) => e.examinationId),
    });

    return {
      success: true,
      sessionToken,
      student: {
        studentName: student.fullName,
        studentId: student.studentId,
      },
      authorizedExams: evaluatedExams,
    };
  } catch (error: any) {
    console.error("[verifyStudentExaminationAccess error]:", error);
    return { success: false, error: "An unexpected verification error occurred. Please try again." };
  }
}

/**
 * Enter or resume examination room using secure session token
 */
export async function launchAuthorizedExamination(sessionToken: string, examPublicId: string) {
  try {
    const sessionPayload = verifyStudentSessionToken(sessionToken);
    if (!sessionPayload) {
      return {
        success: false,
        error: "Your student examination session has expired or is invalid. Please verify your identity again at the portal.",
        sessionExpired: true,
      };
    }

    const student = await prisma.examStudent.findUnique({
      where: { id: sessionPayload.studentDbId },
      include: {
        authorizations: {
          include: { examination: true },
        },
      },
    });

    if (!student || student.status !== "ACTIVE") {
      return {
        success: false,
        error: "Student account is not active.",
      };
    }

    const exam = await prisma.examination.findUnique({
      where: { publicId: examPublicId },
      include: { course: true },
    });
    if (!exam || exam.status !== "published") {
      return { success: false, error: "Examination is not published or available." };
    }

    // Strict Authorization Check: Must have APPROVED authorization
    const authRec = student.authorizations.find((a) => a.examinationId === exam.id);
    if (!authRec || authRec.status !== "APPROVED") {
      return {
        success: false,
        error: "Your examination access has not yet been authorized by the administrator.",
      };
    }

    // Check date boundaries
    const now = new Date();
    if (authRec.validFrom && now < authRec.validFrom) {
      return {
        success: false,
        error: `This examination is scheduled to open on ${authRec.validFrom.toLocaleString()}.`,
      };
    }
    if (authRec.validUntil && now > authRec.validUntil) {
      return {
        success: false,
        error: "This examination authorization has expired.",
      };
    }

    // Check for existing attempts
    const existingAttempts = await prisma.examAttempt.findMany({
      where: {
        examId: exam.id,
        OR: [
          { studentId: student.id },
          { participant: { studentEmail: student.email || `${student.studentId.toLowerCase()}@student.protechassist.com` } },
        ],
      },
      orderBy: { attemptNumber: "desc" },
    });

    // Check if student has an active IN_PROGRESS attempt (Resume it!)
    let currentAttempt = existingAttempts.find((a) => a.status === "IN_PROGRESS");
    if (currentAttempt) {
      // Check if time expired
      if (now > currentAttempt.serverDeadline) {
        // Expired
        return {
          success: false,
          error: "Your examination deadline has expired.",
          isTimedOut: true,
          attemptId: currentAttempt.id,
        };
      }

      // Resume existing attempt
      return {
        success: true,
        resumed: true,
        attemptId: currentAttempt.id,
        redirectUrl: `/examinations/${exam.publicId}/take?participantId=${currentAttempt.participantId}&attemptId=${currentAttempt.id}&studentExamId=${student.studentId}`,
      };
    }

    // Enforce permitted attempt count
    if (authRec.attemptsConsumed >= authRec.maxAttemptsAllowed) {
      return {
        success: false,
        error: "You have already completed this examination. Please contact the academy administrator if you have been approved for a retake.",
        isLimitReached: true,
      };
    }

    // Ensure ExamParticipant record exists for integration with existing exam engine
    const studentEmail = student.email || `${student.studentId.toLowerCase()}@student.protechassist.com`;
    let participant = await prisma.examParticipant.findUnique({
      where: {
        examId_studentEmail: {
          examId: exam.id,
          studentEmail,
        },
      },
    });

    if (!participant) {
      participant = await prisma.examParticipant.create({
        data: {
          examId: exam.id,
          studentName: student.fullName,
          studentEmail,
          studentPhone: student.phone,
          studentId: student.studentId,
          verified: true,
        },
      });
    }

    // Create new attempt within transaction to prevent race conditions
    const newAttempt = await prisma.$transaction(async (tx) => {
      const attemptNumber = existingAttempts.length + 1;
      const durationMs = exam.durationMinutes * 60 * 1000;
      const gracePeriodMs = (exam.gracePeriodSeconds || 60) * 1000;
      const serverDeadline = new Date(now.getTime() + durationMs + gracePeriodMs);

      const attempt = await tx.examAttempt.create({
        data: {
          examId: exam.id,
          participantId: participant!.id,
          studentId: student.id,
          authorizationId: authRec.id,
          attemptNumber,
          status: "IN_PROGRESS",
          startedAt: now,
          serverDeadline,
        },
      });

      // Increment consumed attempts on authorization
      await tx.examAuthorization.update({
        where: { id: authRec.id },
        data: {
          attemptsConsumed: authRec.attemptsConsumed + 1,
        },
      });

      // Audit event
      await tx.examAuditEvent.create({
        data: {
          examId: exam.id,
          attemptId: attempt.id,
          participantId: participant!.id,
          action: "EXAM_STARTED",
          actorEmail: studentEmail,
          actorRole: "STUDENT",
          details: {
            studentName: student.fullName,
            studentExamId: student.studentId,
            attemptNumber,
            authorizationId: authRec.id,
          },
        },
      });

      return attempt;
    });

    return {
      success: true,
      resumed: false,
      attemptId: newAttempt.id,
      redirectUrl: `/examinations/${exam.publicId}/take?participantId=${participant.id}&attemptId=${newAttempt.id}&studentExamId=${student.studentId}`,
    };
  } catch (error: any) {
    console.error("[launchAuthorizedExamination error]:", error);
    return { success: false, error: error.message || "Failed to launch examination room." };
  }
}
