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

// === STAFF ===

export async function getStaff() {
  const { businessId } = await getAuthSession();
  return prisma.schoolStaff.findMany({
    where: { businessId },
    include: {
      leaveRequests: true,
      payslips: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createStaff(data: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: string;
  department?: string;
  salary: number;
}) {
  const { businessId } = await getAuthSession();
  try {
    await prisma.schoolStaff.create({
      data: {
        businessId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        department: data.department,
        salary: data.salary,
        hireDate: new Date(),
      }
    });
    revalidatePath('/dashboard/school/staff');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === LEAVE REQUESTS ===

export async function submitLeaveRequest(data: {
  staffId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  const { businessId } = await getAuthSession();
  try {
    await prisma.schoolLeaveRequest.create({
      data: {
        businessId,
        staffId: data.staffId,
        leaveType: data.leaveType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: 'PENDING'
      }
    });
    revalidatePath('/dashboard/school/staff');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLeaveStatus(leaveId: string, status: string) {
  const { businessId } = await getAuthSession();
  try {
    await prisma.schoolLeaveRequest.update({
      where: { id: leaveId, businessId },
      data: { status }
    });
    revalidatePath('/dashboard/school/staff');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === PAYROLL ===

export async function getPayslips() {
  const { businessId } = await getAuthSession();
  return prisma.schoolPayslip.findMany({
    where: { businessId },
    include: { staff: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function generatePayslip(data: {
  staffId: string;
  month: string;
  baseSalary: number;
  deductions: number;
  bonuses: number;
}) {
  const { businessId } = await getAuthSession();
  try {
    const netPay = data.baseSalary + data.bonuses - data.deductions;
    await prisma.schoolPayslip.create({
      data: {
        businessId,
        staffId: data.staffId,
        month: data.month,
        baseSalary: data.baseSalary,
        deductions: data.deductions,
        bonuses: data.bonuses,
        netPay: netPay,
        status: 'PENDING'
      }
    });
    revalidatePath('/dashboard/school/payroll');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markPayslipPaid(payslipId: string) {
  const { businessId } = await getAuthSession();
  try {
    await prisma.schoolPayslip.update({
      where: { id: payslipId, businessId },
      data: { 
        status: 'PAID',
        paymentDate: new Date()
      }
    });
    revalidatePath('/dashboard/school/payroll');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
