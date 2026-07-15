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

export async function getBroadcasts() {
  const { businessId } = await getAuthSession();
  return prisma.schoolBroadcast.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
    include: {
      recipients: true
    }
  });
}

export async function sendBroadcast(data: {
  subject: string;
  content: string;
  channel: string;
  audience: string;
  specificCourseId?: string;
}) {
  const { businessId } = await getAuthSession();
  
  try {
    // 1. Fetch Target Audience
    let targetStudents: any[] = [];
    if (data.audience === 'ALL_STUDENTS') {
      targetStudents = await prisma.schoolStudent.findMany({
        where: { businessId, status: 'ACTIVE' },
        select: { id: true }
      });
    } else if (data.audience === 'SPECIFIC_COURSE' && data.specificCourseId) {
      const enrollments = await prisma.schoolCourseEnrollment.findMany({
        where: { businessId, courseId: data.specificCourseId, status: 'ENROLLED' },
        include: { student: { select: { id: true } } }
      });
      targetStudents = enrollments.map(e => e.student);
    }

    if (targetStudents.length === 0) {
      throw new Error("No recipients found for this audience.");
    }

    // 2. Create Broadcast Record
    const broadcast = await prisma.schoolBroadcast.create({
      data: {
        businessId,
        subject: data.subject,
        content: data.content,
        channel: data.channel,
        audience: data.audience,
        status: 'SENT', // Simulating instant send
        sentAt: new Date(),
        recipients: {
          create: targetStudents.map(s => ({
            studentId: s.id,
            status: 'DELIVERED', // Simulating instant delivery
            deliveredAt: new Date()
          }))
        }
      }
    });

    revalidatePath('/dashboard/school/communications');
    return { success: true, count: targetStudents.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
