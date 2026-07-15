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

// === HOSTELS ===

export async function getHostels() {
  const { businessId } = await getAuthSession();
  return prisma.schoolHostel.findMany({
    where: { businessId },
    orderBy: [{ blockName: 'asc' }, { roomNumber: 'asc' }],
    include: {
      allocations: {
        where: { status: 'ACTIVE' },
        include: { student: true }
      }
    }
  });
}

export async function addHostelRoom(data: {
  blockName: string;
  roomNumber: string;
  capacity: number;
  type: string;
}) {
  const { businessId } = await getAuthSession();
  
  try {
    await prisma.schoolHostel.create({
      data: {
        businessId,
        blockName: data.blockName,
        roomNumber: data.roomNumber,
        capacity: Number(data.capacity),
        type: data.type
      }
    });

    revalidatePath('/dashboard/school/hostel');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === ALLOCATIONS ===

export async function allocateBed(hostelId: string, studentId: string) {
  const { businessId } = await getAuthSession();

  try {
    // Check if room has capacity
    const room = await prisma.schoolHostel.findUnique({
      where: { id: hostelId },
      include: {
        allocations: { where: { status: 'ACTIVE' } }
      }
    });

    if (!room) throw new Error("Room not found");
    if (room.allocations.length >= room.capacity) throw new Error("Room is full");

    // Allocate
    await prisma.schoolHostelAllocation.create({
      data: {
        businessId,
        hostelId,
        studentId,
        status: 'ACTIVE'
      }
    });

    revalidatePath('/dashboard/school/hostel');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function vacateBed(allocationId: string) {
  const { businessId } = await getAuthSession();

  try {
    await prisma.schoolHostelAllocation.update({
      where: { id: allocationId, businessId },
      data: { status: 'VACATED' }
    });

    revalidatePath('/dashboard/school/hostel');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
