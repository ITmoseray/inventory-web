'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitRegistration(formData: FormData) {
  try {
    const businessId = formData.get('businessId') as string;
    const fullName = formData.get('full_name') as string;
    const gender = formData.get('gender') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const guardianName = formData.get('guardian_name') as string;
    const guardianPhone = formData.get('guardian_phone') as string;
    const paymentReference = formData.get('payment_reference') as string;
    const course = formData.get('course') as string;

    // Validate inputs
    if (!businessId || !fullName || !phone) {
      return { success: false, error: 'Required fields missing' };
    }

    // Generate a unique student ID like STU20261181
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const studentId = `STU${year}${random}`;

    // Create the student in Prisma
    const newStudent = await prisma.schoolStudent.create({
      data: {
        businessId,
        studentId,
        firstName: fullName.split(' ')[0] || '',
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        gender: gender || 'Other',
        phone,
        email,
        address,
        status: 'PENDING',
        applicationSource: 'ONLINE',
      }
    });

    // Create the registration payment record (Pending verification)
    await prisma.schoolPayment.create({
      data: {
        businessId,
        studentId: newStudent.id,
        amount: 100, // 100 Leones registration fee
        paymentDate: new Date(),
        paymentMethod: 'Mobile Money',
        status: 'PENDING',
        formType: 'ADMISSION',
        paymentReference,
        guardianName,
        guardianPhone,
      }
    });

    revalidatePath('/school');
    return { success: true, studentId: newStudent.studentId };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: 'Failed to submit registration.' };
  }
}
