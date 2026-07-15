'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.businessId) {
    throw new Error("Unauthorized");
  }
  return { session, businessId: session.user.businessId };
}

// === TERMS ===

export async function getTerms() {
  const { businessId } = await getAuthSession();
  return prisma.schoolTerm.findMany({
    where: { businessId },
    orderBy: { startDate: 'desc' }
  });
}

export async function createTerm(data: { name: string; startDate: string; endDate: string }) {
  const { businessId } = await getAuthSession();
  try {
    await prisma.schoolTerm.create({
      data: {
        businessId,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: true
      }
    });
    revalidatePath('/dashboard/school/academics');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === GRADES ===

export async function getGradesForCourseAndTerm(courseId: string, termId: string) {
  const { businessId } = await getAuthSession();
  
  // Get all students enrolled in the course
  const enrollments = await prisma.schoolCourseEnrollment.findMany({
    where: { businessId, courseId, status: 'ENROLLED' },
    include: { student: true }
  });

  // Get existing grades for this course and term
  const grades = await prisma.schoolGrade.findMany({
    where: { businessId, courseId, termId }
  });

  // Combine them
  const gradeMap = new Map(grades.map(g => [g.studentId, g]));
  
  return enrollments.map(e => ({
    student: e.student,
    grade: gradeMap.get(e.studentId) || null
  }));
}

export async function saveGrade(data: {
  studentId: string;
  courseId: string;
  termId: string;
  score: number;
}) {
  const { businessId } = await getAuthSession();
  
  try {
    // Determine letter grade (basic scale)
    let letterGrade = 'F';
    if (data.score >= 90) letterGrade = 'A';
    else if (data.score >= 80) letterGrade = 'B';
    else if (data.score >= 70) letterGrade = 'C';
    else if (data.score >= 60) letterGrade = 'D';

    await prisma.schoolGrade.upsert({
      where: {
        studentId_courseId_termId: {
          studentId: data.studentId,
          courseId: data.courseId,
          termId: data.termId
        }
      },
      update: {
        score: data.score,
        grade: letterGrade,
      },
      create: {
        businessId,
        studentId: data.studentId,
        courseId: data.courseId,
        termId: data.termId,
        score: data.score,
        grade: letterGrade,
      }
    });

    revalidatePath('/dashboard/school/academics');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === REPORT CARDS ===
export async function getStudentReportCard(studentId: string, termId: string) {
  const { businessId } = await getAuthSession();
  
  const student = await prisma.schoolStudent.findUnique({
    where: { id: studentId, businessId }
  });

  const term = await prisma.schoolTerm.findUnique({
    where: { id: termId, businessId }
  });

  const grades = await prisma.schoolGrade.findMany({
    where: { businessId, studentId, termId },
    include: { course: true }
  });

  return { student, term, grades };
}
