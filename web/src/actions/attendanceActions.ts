'use server';

import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAttendanceForCourse(courseId: string, dateStr: string) {
  try {
    const { businessId } = await getAuthSession();
    const date = new Date(dateStr);
    
    // Normalize date to start of day in UTC for consistent querying
    date.setUTCHours(0, 0, 0, 0);

    // Get all students enrolled in the course
    const enrollments = await prisma.schoolEnrollment.findMany({
      where: {
        businessId,
        courseId,
        status: 'ACTIVE'
      },
      include: {
        student: true
      }
    });

    // Get existing attendance records for this course and date
    const attendances = await prisma.schoolAttendance.findMany({
      where: {
        businessId,
        courseId,
        date
      }
    });

    // Map existing attendance records by studentId for quick lookup
    const attendanceMap = new Map(attendances.map(a => [a.studentId, a]));

    // Build the roster: if a student has an attendance record, use its status; otherwise, default to 'PRESENT' or null.
    const roster = enrollments.map(e => {
      const existingRecord = attendanceMap.get(e.studentId);
      return {
        studentId: e.studentId,
        studentName: `${e.student.firstName} ${e.student.lastName}`,
        studentCode: e.student.studentId,
        photoPath: e.student.photoPath,
        status: existingRecord ? existingRecord.status : 'PRESENT', // default to PRESENT
        attendanceId: existingRecord ? existingRecord.id : null
      };
    });

    return { success: true, roster };
  } catch (error: any) {
    console.error("Failed to fetch attendance roster:", error);
    return { success: false, error: error.message };
  }
}

export async function saveAttendanceBatch(courseId: string, dateStr: string, records: { studentId: string, status: string }[]) {
  try {
    const { businessId } = await getAuthSession();
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    // Due to Neon's potential pooler limitations with large complex upserts via Prisma, 
    // it's safest to run this within a transaction sequentially or use createMany/updateMany.
    // However, Prisma doesn't have an upsertMany. So we'll iterate.
    
    await prisma.$transaction(
      records.map(record => 
        prisma.schoolAttendance.upsert({
          where: {
            studentId_courseId_date: {
              studentId: record.studentId,
              courseId,
              date
            }
          },
          update: {
            status: record.status
          },
          create: {
            businessId,
            studentId: record.studentId,
            courseId,
            date,
            status: record.status
          }
        })
      )
    );

    revalidatePath('/dashboard/school/attendance');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save attendance:", error);
    return { success: false, error: error.message };
  }
}

export async function getCoursesList() {
  try {
    const { businessId } = await getAuthSession();
    const courses = await prisma.schoolCourse.findMany({
      where: { businessId },
      select: { id: true, courseName: true, courseCode: true },
      orderBy: { courseName: 'asc' }
    });
    return { success: true, courses };
  } catch (error: any) {
    console.error("Failed to fetch courses:", error);
    return { success: false, error: error.message };
  }
}
