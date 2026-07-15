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

  // Fetch recent enrollments
  const recentStudents = await prisma.schoolStudent.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, firstName: true, lastName: true, studentId: true, photoPath: true, currentLevel: true, createdAt: true }
  });

  // Calculate 7-day attendance trend
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const rawAttendance = await prisma.schoolAttendance.findMany({
    where: { 
      businessId, 
      date: { gte: sevenDaysAgo, lte: today } 
    }
  });

  // Group by date string (YYYY-MM-DD)
  const groupedAttendance = rawAttendance.reduce((acc, curr) => {
    const dateStr = curr.date.toISOString().split('T')[0];
    if (!acc[dateStr]) acc[dateStr] = { present: 0, absent: 0, late: 0 };
    
    if (curr.status === 'PRESENT') acc[dateStr].present++;
    if (curr.status === 'ABSENT') acc[dateStr].absent++;
    if (curr.status === 'LATE') acc[dateStr].late++;
    
    return acc;
  }, {} as Record<string, { present: number, absent: number, late: number }>);

  // Format for Recharts (fill in missing days with zeros)
  const attendanceTrend = [];
  for (let i = 0; i <= 6; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Format label to something nicer like "Mon 15"
    const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    
    attendanceTrend.push({
      date: label,
      present: groupedAttendance[dateStr]?.present || 0,
      absent: groupedAttendance[dateStr]?.absent || 0,
      late: groupedAttendance[dateStr]?.late || 0
    });
  }

  return { totalStudents, activeStudents, totalCourses, pendingPayments, totalRevenue, attendanceTrend, recentStudents };
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

export async function createStudent(formData: FormData) {
  try {
    const { businessId } = await getAuthSession();
    
    const studentId = formData.get('studentId') as string || `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const gender = formData.get('gender') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const dobStr = formData.get('dateOfBirth') as string;
    
    // New comprehensive fields
    const photoPath = formData.get('photoPath') as string;
    const guardianName = formData.get('guardianName') as string;
    const guardianPhone = formData.get('guardianPhone') as string;
    const guardianEmail = formData.get('guardianEmail') as string;
    const guardianRelation = formData.get('guardianRelation') as string;
    const bloodGroup = formData.get('bloodGroup') as string;
    const medicalConditions = formData.get('medicalConditions') as string;
    const currentLevel = formData.get('currentLevel') as string;
    
    await prisma.schoolStudent.create({
      data: {
        businessId,
        studentId,
        firstName,
        lastName,
        gender,
        email,
        phone,
        address,
        photoPath,
        guardianName,
        guardianPhone,
        guardianEmail,
        guardianRelation,
        bloodGroup,
        medicalConditions,
        currentLevel,
        dateOfBirth: dobStr ? new Date(dobStr) : null,
        status: 'ACTIVE',
        applicationSource: 'MANUAL_ENTRY'
      }
    });
    
    revalidatePath('/dashboard/school/students');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
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

// PAYMENTS CRUD
export async function getPayments() {
  const { businessId } = await getAuthSession();
  return prisma.schoolPayment.findMany({
    where: { businessId },
    include: {
      student: true,
      course: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updatePaymentStatus(id: string, status: string) {
  const { businessId } = await getAuthSession();
  await prisma.schoolPayment.update({
    where: { id, businessId },
    data: { status }
  });
  revalidatePath('/dashboard/school/payments');
  return { success: true };
}

// ATTENDANCE CRUD
export async function getAttendanceByDate(dateStr: string) {
  const { businessId } = await getAuthSession();
  
  // Parse date string to start and end of day
  const date = new Date(dateStr);
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  return prisma.schoolAttendance.findMany({
    where: { 
      businessId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      student: true,
      course: true
    }
  });
}

export async function markAttendance(studentId: string, courseId: string, dateStr: string, status: string) {
  const { businessId } = await getAuthSession();
  const date = new Date(dateStr);
  
  // Using upsert based on unique constraint [studentId, courseId, date]
  await prisma.schoolAttendance.upsert({
    where: {
      studentId_courseId_date: {
        studentId,
        courseId,
        date
      }
    },
    update: {
      status,
      businessId // Ensure businessId is maintained
    },
    create: {
      businessId,
      studentId,
      courseId,
      date,
      status
    }
  });
  
  revalidatePath('/dashboard/school/attendance');
  return { success: true };
}

// PAYROLL
export async function getStaffPayroll() {
  const { businessId } = await getAuthSession();
  return prisma.payroll.findMany({
    where: { businessId },
    include: {
      user: true
    },
    orderBy: { createdAt: 'desc' }
  });
}
