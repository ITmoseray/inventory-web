"use server";

import { prisma, getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getPrescriptions() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    return await prisma.prescription.findMany({
      where: { businessId },
      include: { patient: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch prescriptions:", error);
    throw error;
  }
}

export async function createPrescription(data: {
  patientId: string;
  doctorName: string;
  notes?: string;
  instructions?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const tenantPrisma = getTenantPrisma(businessId);

    const prescriptionNumber = `RX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newPrescription = await tenantPrisma.prescription.create({
      data: {
        prescriptionNumber,
        patientId: data.patientId,
        doctorName: data.doctorName,
        notes: data.notes || null,
        instructions: data.instructions || null,
        status: "PENDING",
        businessId,
      },
    });

    revalidatePath("/dashboard/patients/prescriptions");
    return { success: true, prescription: newPrescription };
  } catch (error: any) {
    console.error("Failed to create prescription:", error);
    throw new Error(error.message || "Failed to register prescription.");
  }
}

export async function dispensePrescription(prescriptionId: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const tenantPrisma = getTenantPrisma(businessId);

    await tenantPrisma.prescription.update({
      where: { id: prescriptionId, businessId },
      data: { status: "DISPENSED" },
    });

    revalidatePath("/dashboard/patients/prescriptions");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to dispense prescription:", error);
    throw new Error(error.message || "Failed to update prescription status.");
  }
}

export async function getPendingPrescriptions() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    return await prisma.prescription.findMany({
      where: { 
        businessId,
        status: "PENDING"
      },
      include: { patient: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch pending prescriptions:", error);
    throw error;
  }
}
