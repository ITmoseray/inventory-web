"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkSuperAdmin() {
  const session = await auth();
  const isSuper = session?.user?.role === "SUPERADMIN" || (session?.user as any)?.originalRole === "SUPERADMIN";
  if (!isSuper) {
    throw new Error("Unauthorized: Super Admin access required");
  }
  return session;
}

export interface GetStaffAgreementsFilter {
  businessId?: string;
  status?: string;
  department?: string;
  search?: string;
}

export async function getAllStaffAgreements(filters?: GetStaffAgreementsFilter) {
  await checkSuperAdmin();

  const where: any = {
    deletedAt: null
  };

  if (filters?.businessId && filters.businessId !== "ALL") {
    where.businessId = filters.businessId;
  }

  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters?.department && filters.department !== "ALL") {
    where.department = filters.department;
  }

  if (filters?.search && filters.search.trim()) {
    const term = filters.search.trim();
    where.OR = [
      { fullName: { contains: term, mode: "insensitive" } },
      { agreementNumber: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      { nationalId: { contains: term, mode: "insensitive" } },
      { jobTitle: { contains: term, mode: "insensitive" } },
      { business: { name: { contains: term, mode: "insensitive" } } },
    ];
  }

  const [agreements, totalCount, signedCount, pendingCount, verifiedCount, allBusinesses] = await Promise.all([
    prisma.staffAgreement.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            type: true,
            phone: true,
            address: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            jobTitle: true,
            department: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.staffAgreement.count({ where: { deletedAt: null } }),
    prisma.staffAgreement.count({ where: { deletedAt: null, status: "SIGNED" } }),
    prisma.staffAgreement.count({ where: { deletedAt: null, status: "PENDING" } }),
    prisma.staffAgreement.count({ where: { deletedAt: null, verifiedByAdmin: true } }),
    prisma.business.findMany({
      select: { id: true, name: true, slug: true, type: true },
      orderBy: { name: "asc" }
    })
  ]);

  return {
    agreements: agreements.map(a => ({
      ...a,
      startDate: a.startDate?.toISOString() || null,
      dateOfBirth: a.dateOfBirth?.toISOString() || null,
      signedAt: a.signedAt?.toISOString() || null,
      verifiedAt: a.verifiedAt?.toISOString() || null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    stats: {
      total: totalCount,
      signed: signedCount,
      pending: pendingCount,
      verified: verifiedCount,
    },
    businesses: allBusinesses
  };
}

export async function getStaffAgreementById(id: string) {
  if (!id) return null;

  const agreement = await prisma.staffAgreement.findFirst({
    where: {
      OR: [
        { id: id },
        { agreementNumber: id }
      ],
      deletedAt: null
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          type: true,
          address: true,
          phone: true,
          email: true,
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          jobTitle: true,
          department: true,
          role: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!agreement) return null;

  return {
    ...agreement,
    startDate: agreement.startDate?.toISOString() || null,
    dateOfBirth: agreement.dateOfBirth?.toISOString() || null,
    signedAt: agreement.signedAt?.toISOString() || null,
    verifiedAt: agreement.verifiedAt?.toISOString() || null,
    createdAt: agreement.createdAt.toISOString(),
    updatedAt: agreement.updatedAt.toISOString(),
  };
}

export interface CreateStaffAgreementInput {
  businessId: string;
  userId?: string;
  fullName: string;
  jobTitle: string;
  department?: string;
  phone: string;
  email?: string;
  nationalId?: string;
  address?: string;
  employmentType?: string;
  startDate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  agreementType?: string;
  termsContent?: string;
}

export async function createStaffAgreement(input: CreateStaffAgreementInput) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!input.businessId) throw new Error("Business ID is required");
  if (!input.fullName?.trim()) throw new Error("Full staff name is required");
  if (!input.jobTitle?.trim()) throw new Error("Job title / designation is required");
  if (!input.phone?.trim()) throw new Error("Phone number is required");

  // Generate unique Agreement Number
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const agreementNumber = `AGR-${year}-${randomSuffix}`;

  const created = await prisma.staffAgreement.create({
    data: {
      agreementNumber,
      businessId: input.businessId,
      userId: input.userId || null,
      fullName: input.fullName.trim(),
      jobTitle: input.jobTitle.trim(),
      department: input.department?.trim() || "General Operations",
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      nationalId: input.nationalId?.trim() || null,
      address: input.address?.trim() || null,
      employmentType: input.employmentType || "FULL_TIME",
      startDate: input.startDate ? new Date(input.startDate) : new Date(),
      emergencyContactName: input.emergencyContactName?.trim() || null,
      emergencyContactPhone: input.emergencyContactPhone?.trim() || null,
      agreementType: input.agreementType || "EMPLOYMENT_COMPLIANCE",
      termsContent: input.termsContent || null,
      status: "PENDING"
    }
  });

  revalidatePath("/super-admin/agreements");
  revalidatePath("/dashboard/staff/agreements");

  return {
    success: true,
    agreementId: created.id,
    agreementNumber: created.agreementNumber
  };
}

export interface SubmitStaffSignatureInput {
  id: string;
  fullName: string;
  nationalId?: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  signatureData: string; // Base64 PNG
  ipAddress?: string;
  userAgent?: string;
}

export async function submitStaffSignature(input: SubmitStaffSignatureInput) {
  if (!input.id) throw new Error("Agreement ID is required");
  if (!input.signatureData) throw new Error("A drawn digital signature is required");
  if (!input.fullName?.trim()) throw new Error("Full legal name confirmation is required");

  const existing = await prisma.staffAgreement.findUnique({
    where: { id: input.id }
  });

  if (!existing || existing.deletedAt) {
    throw new Error("Staff agreement record not found or has been revoked.");
  }

  const updated = await prisma.staffAgreement.update({
    where: { id: input.id },
    data: {
      status: "SIGNED",
      fullName: input.fullName.trim(),
      signerFullName: input.fullName.trim(),
      signatureData: input.signatureData,
      nationalId: input.nationalId?.trim() || existing.nationalId,
      phone: input.phone?.trim() || existing.phone,
      email: input.email?.trim() || existing.email,
      address: input.address?.trim() || existing.address,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : existing.dateOfBirth,
      emergencyContactName: input.emergencyContactName?.trim() || existing.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone?.trim() || existing.emergencyContactPhone,
      signedAt: new Date(),
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
    }
  });

  revalidatePath(`/agreements/${input.id}`);
  revalidatePath(`/super-admin/agreements`);
  revalidatePath(`/dashboard/staff/agreements`);

  return {
    success: true,
    agreementNumber: updated.agreementNumber,
    signedAt: updated.signedAt?.toISOString()
  };
}

export async function verifyStaffAgreement(id: string, adminNotes?: string) {
  await checkSuperAdmin();

  const updated = await prisma.staffAgreement.update({
    where: { id },
    data: {
      verifiedByAdmin: true,
      verifiedAt: new Date(),
      adminNotes: adminNotes || "Officially verified and approved by Supreme Master Super Admin.",
    }
  });

  revalidatePath("/super-admin/agreements");
  return { success: true, agreement: updated };
}

export async function deleteStaffAgreement(id: string) {
  await checkSuperAdmin();

  await prisma.staffAgreement.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      status: "REVOKED"
    }
  });

  revalidatePath("/super-admin/agreements");
  return { success: true };
}

export async function getTenantStaffAgreements() {
  const session = await auth();
  const businessId = (session?.user as any)?.businessId;
  if (!businessId) {
    throw new Error("No business context found in session");
  }

  const agreements = await prisma.staffAgreement.findMany({
    where: {
      businessId,
      deletedAt: null
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          jobTitle: true,
          department: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return agreements.map(a => ({
    ...a,
    startDate: a.startDate?.toISOString() || null,
    dateOfBirth: a.dateOfBirth?.toISOString() || null,
    signedAt: a.signedAt?.toISOString() || null,
    verifiedAt: a.verifiedAt?.toISOString() || null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}
