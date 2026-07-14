"use server";

import { prisma, getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getPatients() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    return await prisma.patient.findMany({
      where: { businessId },
      include: { prescriptions: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch patients:", error);
    throw error;
  }
}

export async function createPatient(data: {
  name: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  allergies?: string;
  medicalNotes?: string;
  nationality?: string;
  emergencyContact?: string;
  conditions?: string;
  pastProcedures?: string;
  currentMedications?: string;
  immunizations?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const tenantPrisma = getTenantPrisma(businessId);

    const newPatient = await tenantPrisma.patient.create({
      data: {
        name: data.name,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        allergies: data.allergies || null,
        medicalNotes: data.medicalNotes || null,
        nationality: data.nationality || null,
        emergencyContact: data.emergencyContact || null,
        conditions: data.conditions || null,
        pastProcedures: data.pastProcedures || null,
        currentMedications: data.currentMedications || null,
        immunizations: data.immunizations || null,
        businessId,
      },
    });

    revalidatePath("/dashboard/patients");
    return { success: true, patient: newPatient };
  } catch (error: any) {
    console.error("Failed to create patient:", error);
    throw new Error(error.message || "Failed to register patient profile.");
  }
}
