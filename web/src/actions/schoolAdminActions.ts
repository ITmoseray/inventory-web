'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Helper to get session and businessId safely
async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.businessId) {
    throw new Error("Unauthorized");
  }
  return { session, businessId: session.user.businessId };
}

// DASHBOARD STATS
export async function getSchoolDashboardStats() {
  const { businessId } = await getAuthSession();
  
  const [totalStudents, activeStudents, totalCourses, pendingPayments] = await Promise.all([
    prisma.schoolStudent.count({ where: { businessId } }),
    prisma.schoolStudent.count({ where: { businessId, status: 'ACTIVE' } }),
    prisma.schoolCourse.count({ where: { businessId } }),
    prisma.schoolPayment.count({ where: { businessId, status: 'PENDING' } })
  ]);

  // Calculate total revenue
  const payments = await prisma.schoolPayment.findMany({
    where: { businessId, status: 'PAID' },
    select: { amount: true }
  });
  
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return { totalStudents, activeStudents, totalCourses, pendingPayments, totalRevenue };
}

// STUDENTS CRUD
export async function getStudents() {
  const { businessId } = await getAuthSession();
  return prisma.schoolStudent.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateStudentStatus(id: string, status: string) {
  const { businessId } = await getAuthSession();
  await prisma.schoolStudent.update({
    where: { id, businessId },
    data: { status }
  });
  revalidatePath('/dashboard/school/students');
  return { success: true };
}

export async function deleteStudent(id: string) {
  const { businessId } = await getAuthSession();
  await prisma.schoolStudent.delete({
    where: { id, businessId }
  });
  revalidatePath('/dashboard/school/students');
  return { success: true };
}

// COURSES CRUD
export async function getCourses() {
  const { businessId } = await getAuthSession();
  return prisma.schoolCourse.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createCourse(formData: FormData) {
  try {
    const { businessId } = await getAuthSession();
    
    const courseCode = formData.get('courseCode') as string;
    const courseName = formData.get('courseName') as string;
    const description = formData.get('description') as string;
    const duration = formData.get('duration') as string;
    const feeStr = formData.get('fee') as string;
    
    await prisma.schoolCourse.create({
      data: {
        businessId,
        courseCode,
        courseName,
        description,
        duration,
        fee: parseFloat(feeStr) || 0
      }
    });
    
    revalidatePath('/dashboard/school/courses');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function deleteCourse(id: string) {
  const { businessId } = await getAuthSession();
  await prisma.schoolCourse.delete({
    where: { id, businessId }
  });
  revalidatePath('/dashboard/school/courses');
  return { success: true };
}
