"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Appointments ---

export async function createAppointment(data: {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  reason?: string;
  businessId: string;
}) {
  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentDate: data.appointmentDate,
        reason: data.reason,
        businessId: data.businessId,
      },
    });
    revalidatePath(`/dashboard/clinic/appointments`);
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Failed to create appointment:", error);
    return { success: false, error: "Failed to create appointment" };
  }
}

export async function getAppointments(businessId: string, dateStr?: string) {
  try {
    let whereClause: any = { businessId };
    
    // If a specific date string (YYYY-MM-DD) is provided, filter by that day
    if (dateStr) {
      const startOfDay = new Date(dateStr);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      whereClause.appointmentDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: true,
        doctor: true,
        consultation: true,
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });
    return { success: true, data: appointments };
  } catch (error) {
    console.error("Failed to get appointments:", error);
    return { success: false, error: "Failed to get appointments" };
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    revalidatePath(`/dashboard/clinic/appointments`);
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Failed to update appointment status:", error);
    return { success: false, error: "Failed to update appointment status" };
  }
}

// --- Consultations / Doctor Notes ---

export async function createConsultation(data: {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  vitals?: any;
  chiefComplaint?: string;
  symptoms?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  doctorNotes?: string;
  businessId: string;
}) {
  try {
    const consultation = await prisma.consultation.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId,
        vitals: data.vitals,
        chiefComplaint: data.chiefComplaint,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        treatmentPlan: data.treatmentPlan,
        doctorNotes: data.doctorNotes,
        businessId: data.businessId,
      },
    });
    
    if (data.appointmentId) {
      await prisma.appointment.update({
        where: { id: data.appointmentId },
        data: { status: "COMPLETED" },
      });
      revalidatePath(`/dashboard/clinic/appointments`);
    }
    
    revalidatePath(`/dashboard/clinic/consultations`);
    return { success: true, data: consultation };
  } catch (error) {
    console.error("Failed to create consultation:", error);
    return { success: false, error: "Failed to create consultation" };
  }
}

export async function getConsultations(businessId: string, patientId?: string) {
  try {
    const where: any = { businessId };
    if (patientId) where.patientId = patientId;

    const consultations = await prisma.consultation.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        appointment: true,
        labTests: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, data: consultations };
  } catch (error) {
    console.error("Failed to get consultations:", error);
    return { success: false, error: "Failed to get consultations" };
  }
}

export async function updateConsultationNotes(id: string, notesData: any) {
  try {
    const consultation = await prisma.consultation.update({
      where: { id },
      data: notesData,
    });
    revalidatePath(`/dashboard/clinic/consultations`);
    return { success: true, data: consultation };
  } catch (error) {
    console.error("Failed to update consultation:", error);
    return { success: false, error: "Failed to update consultation" };
  }
}

// --- Lab Tests ---

export async function createLabTest(data: {
  patientId: string;
  doctorId: string;
  consultationId?: string;
  testName: string;
  testCategory?: string;
  businessId: string;
}) {
  try {
    const labTest = await prisma.labTest.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        consultationId: data.consultationId,
        testName: data.testName,
        testCategory: data.testCategory,
        businessId: data.businessId,
      },
    });
    revalidatePath(`/dashboard/clinic/lab`);
    return { success: true, data: labTest };
  } catch (error) {
    console.error("Failed to request lab test:", error);
    return { success: false, error: "Failed to request lab test" };
  }
}

export async function getLabTests(businessId: string, status?: string) {
  try {
    const where: any = { businessId };
    if (status) where.status = status;

    const tests = await prisma.labTest.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        labTechnician: true,
        consultation: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, data: tests };
  } catch (error) {
    console.error("Failed to get lab tests:", error);
    return { success: false, error: "Failed to get lab tests" };
  }
}

export async function submitLabResults(id: string, results: string, labTechnicianId: string) {
  try {
    const labTest = await prisma.labTest.update({
      where: { id },
      data: {
        results,
        status: "COMPLETED",
        labTechnicianId,
      },
    });
    revalidatePath(`/dashboard/clinic/lab`);
    return { success: true, data: labTest };
  } catch (error) {
    console.error("Failed to submit lab results:", error);
    return { success: false, error: "Failed to submit lab results" };
  }
}

// --- Overview Stats ---

export async function getClinicOverviewStats(businessId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      newRegistrations,
      todaysAppointments,
      activeCases,
      doctors,
      recentAppointments
    ] = await Promise.all([
      prisma.patient.count({ where: { businessId } }),
      prisma.patient.count({
        where: {
          businessId,
          createdAt: { gte: today, lt: tomorrow }
        }
      }),
      prisma.appointment.count({
        where: {
          businessId,
          appointmentDate: { gte: today, lt: tomorrow }
        }
      }),
      prisma.appointment.count({
        where: {
          businessId,
          status: 'IN_PROGRESS'
        }
      }),
      prisma.user.findMany({
        where: { businessId, role: 'DOCTOR' },
        select: { id: true, name: true, email: true },
        take: 5
      }),
      prisma.appointment.findMany({
        where: { businessId, appointmentDate: { gte: today } },
        include: { patient: true, doctor: true },
        orderBy: { appointmentDate: 'asc' },
        take: 5
      })
    ]);

    // Map doctor load roughly based on their appointments today
    const doctorStats = await Promise.all(doctors.map(async (doc) => {
      const pts = await prisma.appointment.count({
         where: { businessId, doctorId: doc.id, appointmentDate: { gte: today, lt: tomorrow } }
      });
      return { ...doc, points: pts };
    }));

    return {
      success: true,
      data: {
        totalPatients,
        newRegistrations,
        todaysAppointments,
        activeCases,
        doctors: doctorStats,
        recentAppointments
      }
    };
  } catch (error) {
    console.error("Failed to fetch clinic overview stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
