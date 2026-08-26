"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";

// Type definitions for verification checklist
export interface VerificationChecklistState {
  allCategoriesEntered: boolean;
  allProductsEntered: boolean;
  allSuppliersEntered: boolean;
  openingStockEntered: boolean;
  purchasePricesVerified: boolean;
  sellingPricesVerified: boolean;
  expiryDatesEntered: boolean;
  barcodeInfoEntered: boolean;
  stockQuantitiesVerified: boolean;
  clientReviewed: boolean;
  clientApproved: boolean;
}

export interface InventorySummaryStats {
  totalCategories: number;
  totalProducts: number;
  totalSuppliers: number;
  totalStockItems: number;
  productsWithBarcodes: number;
  productsWithExpiryDates: number;
  productsWithPurchasePrices: number;
  productsWithSellingPrices: number;
  productsWithOpeningStock: number;
  totalQuantity: number;
  totalValuation: number;
  refreshedAt: string;
}

// 1. Authorization Helper: Require SUPERADMIN
async function requireSuperAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.originalRole || session?.user?.role;
  if (!session || role !== "SUPERADMIN") {
    throw new Error("Unauthorized: Super Admin credentials required.");
  }
  return session;
}

// 2. Generate unique Implementation Number
async function generateImplementationNumber(): Promise<string> {
  const count = await prisma.clientImplementation.count();
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(4, "0");
  return `IMP-${year}-${seq}`;
}

// 3. Dynamic Calculation of Inventory Summary from Live Database
export async function calculateBusinessInventorySummary(businessId: string): Promise<InventorySummaryStats> {
  const [
    totalCategories,
    totalProducts,
    totalSuppliers,
    productsWithBarcodes,
    productsWithPurchasePrices,
    productsWithSellingPrices,
    productsWithOpeningStock,
    productsList,
    batchesWithExpiry
  ] = await Promise.all([
    prisma.category.count({ where: { businessId, deletedAt: null } }),
    prisma.product.count({ where: { businessId, deletedAt: null } }),
    prisma.supplier.count({ where: { businessId, deletedAt: null } }),
    prisma.product.count({
      where: {
        businessId,
        deletedAt: null,
        barcode: { not: null },
        NOT: { barcode: "" }
      }
    }),
    prisma.product.count({
      where: {
        businessId,
        deletedAt: null,
        costPrice: { not: null, gt: 0 }
      }
    }),
    prisma.product.count({
      where: {
        businessId,
        deletedAt: null,
        unitPrice: { gt: 0 }
      }
    }),
    prisma.product.count({
      where: {
        businessId,
        deletedAt: null,
        stockQuantity: { gt: 0 }
      }
    }),
    prisma.product.findMany({
      where: { businessId, deletedAt: null },
      select: {
        stockQuantity: true,
        costPrice: true,
        unitPrice: true
      }
    }),
    prisma.batch.count({
      where: {
        businessId,
        expiryDate: { not: null }
      }
    })
  ]);

  let totalQuantity = 0;
  let totalValuation = 0;

  for (const item of productsList) {
    const qty = Number(item.stockQuantity) || 0;
    const unitVal = Number(item.costPrice) || Number(item.unitPrice) || 0;
    totalQuantity += qty;
    totalValuation += qty * unitVal;
  }

  return {
    totalCategories,
    totalProducts,
    totalSuppliers,
    totalStockItems: productsWithOpeningStock,
    productsWithBarcodes,
    productsWithExpiryDates: batchesWithExpiry,
    productsWithPurchasePrices,
    productsWithSellingPrices,
    productsWithOpeningStock,
    totalQuantity: Math.round(totalQuantity),
    totalValuation: Math.round(totalValuation),
    refreshedAt: new Date().toISOString()
  };
}

// 4. List All Implementations & Dashboard Stats
export async function getClientImplementations(params?: {
  search?: string;
  status?: string;
  city?: string;
}) {
  await requireSuperAdmin();

  const where: any = {
    deletedAt: null
  };

  if (params?.status && params.status !== "ALL") {
    where.status = params.status;
  }

  if (params?.city && params.city !== "ALL") {
    where.city = { contains: params.city, mode: "insensitive" };
  }

  if (params?.search && params.search.trim()) {
    const term = params.search.trim();
    where.OR = [
      { implementationNumber: { contains: term, mode: "insensitive" } },
      { clientName: { contains: term, mode: "insensitive" } },
      { ownerName: { contains: term, mode: "insensitive" } },
      { contactPhone: { contains: term, mode: "insensitive" } },
      { business: { name: { contains: term, mode: "insensitive" } } },
      { business: { slug: { contains: term, mode: "insensitive" } } }
    ];
  }

  const [items, totalCount, statsCounts] = await Promise.all([
    prisma.clientImplementation.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            type: true,
            plan: true,
            status: true,
            createdAt: true,
            address: true,
            phone: true,
            email: true
          }
        },
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
            role: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.clientImplementation.count({ where: { deletedAt: null } }),
    prisma.clientImplementation.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { deletedAt: null }
    })
  ]);

  const statsMap: Record<string, number> = {};
  for (const s of statsCounts) {
    statsMap[s.status] = s._count.id;
  }

  const registrationCompletedCount = await prisma.clientImplementation.count({
    where: { registrationCompleted: true, deletedAt: null }
  });

  const inventoryCompletedCount = await prisma.clientImplementation.count({
    where: { inventoryCompleted: true, deletedAt: null }
  });

  const stats = {
    total: totalCount,
    registrationCompleted: registrationCompletedCount,
    inventoryCompleted: inventoryCompletedCount,
    inventoryPending: totalCount - inventoryCompletedCount,
    awaitingVerification: statsMap["INVENTORY_VERIFICATION"] || 0,
    awaitingSignatures: statsMap["AWAITING_CLIENT_APPROVAL"] || 0,
    completed: statsMap["COMPLETED"] || 0
  };

  return { items, stats };
}

// 5. Get Single Implementation Record By ID
export async function getClientImplementationById(id: string) {
  await requireSuperAdmin();

  const implementation = await prisma.clientImplementation.findUnique({
    where: { id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          type: true,
          plan: true,
          status: true,
          address: true,
          phone: true,
          secondaryPhone: true,
          whatsappPhone: true,
          email: true,
          trialStartDate: true,
          createdAt: true
        }
      },
      assignedStaff: {
        select: {
          id: true,
          name: true,
          email: true,
          role: { select: { name: true } }
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  if (!implementation) {
    throw new Error("Implementation record not found.");
  }

  return implementation;
}

// 6. Create Or Open Implementation For A Business
export async function createOrGetClientImplementation(businessId: string) {
  const session = await requireSuperAdmin();

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      users: {
        where: { role: { name: { in: ["ADMIN", "MANAGER", "SUPERADMIN"] } } },
        take: 1
      }
    }
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  // Check if active implementation exists
  let implementation = await prisma.clientImplementation.findFirst({
    where: {
      businessId,
      deletedAt: null
    },
    orderBy: { createdAt: "desc" }
  });

  if (implementation) {
    return implementation;
  }

  // Calculate live inventory stats
  const initialInventory = await calculateBusinessInventorySummary(businessId);
  const impNumber = await generateImplementationNumber();
  const ownerUser = business.users[0];

  const defaultChecklist: VerificationChecklistState = {
    allCategoriesEntered: initialInventory.totalCategories > 0,
    allProductsEntered: initialInventory.totalProducts > 0,
    allSuppliersEntered: initialInventory.totalSuppliers > 0,
    openingStockEntered: initialInventory.productsWithOpeningStock > 0,
    purchasePricesVerified: false,
    sellingPricesVerified: false,
    expiryDatesEntered: false,
    barcodeInfoEntered: false,
    stockQuantitiesVerified: false,
    clientReviewed: false,
    clientApproved: false
  };

  implementation = await prisma.clientImplementation.create({
    data: {
      implementationNumber: impNumber,
      businessId,
      createdById: session.user.id,
      assignedStaffId: session.user.id,
      status: "REGISTRATION_PENDING",
      currentStep: 1,
      clientName: business.name,
      ownerName: ownerUser?.name || "Business Owner",
      contactPhone: business.phone || "",
      contactWhatsapp: business.whatsappPhone || business.phone || "",
      contactEmail: business.email || ownerUser?.email || "",
      businessAddress: business.address || "",
      city: "Freetown",
      district: "Western Area Urban",
      businessType: business.type,
      assignedStaffName: session.user.name || "Super Admin Field Officer",
      assignedStaffRole: "Protech Enterprise Implementation Lead",
      subscriptionPlan: business.plan,
      trialStartDate: business.trialStartDate || new Date(),
      accountStatus: business.status,
      inventorySummary: initialInventory as any,
      verificationChecklist: defaultChecklist as any,
      inventoryCompleted: initialInventory.totalProducts > 0,
      inventoryCompletedAt: initialInventory.totalProducts > 0 ? new Date() : null
    }
  });

  await logAudit({
    action: `CREATED CLIENT IMPLEMENTATION ${impNumber}`,
    entity: "CLIENT_IMPLEMENTATION",
    entityId: implementation.id
  });

  revalidatePath("/super-admin/implementations");
  return implementation;
}

// 7. Update Registration Details
export async function updateClientRegistrationInfo(
  id: string,
  data: {
    clientName: string;
    ownerName: string;
    contactPhone: string;
    contactWhatsapp?: string;
    contactEmail?: string;
    businessAddress: string;
    city: string;
    district: string;
    businessType: string;
    subscriptionPlan: string;
    trialStartDate?: Date;
    notes?: string;
  }
) {
  const session = await requireSuperAdmin();

  const record = await prisma.clientImplementation.findUnique({
    where: { id }
  });

  if (!record) throw new Error("Record not found.");
  if (record.isLocked) throw new Error("Record is locked and cannot be modified.");

  // Update Implementation snapshot
  const updated = await prisma.clientImplementation.update({
    where: { id },
    data: {
      clientName: data.clientName,
      ownerName: data.ownerName,
      contactPhone: data.contactPhone,
      contactWhatsapp: data.contactWhatsapp,
      contactEmail: data.contactEmail,
      businessAddress: data.businessAddress,
      city: data.city,
      district: data.district,
      businessType: data.businessType as any,
      subscriptionPlan: data.subscriptionPlan as any,
      ...(data.trialStartDate && { trialStartDate: new Date(data.trialStartDate) }),
      notes: data.notes,
      registrationCompleted: true,
      registrationCompletedAt: record.registrationCompletedAt || new Date(),
      status: record.status === "REGISTRATION_PENDING" ? "REGISTRATION_COMPLETED" : record.status,
      currentStep: Math.max(record.currentStep, 2)
    }
  });

  // Sync with Business entity
  await prisma.business.update({
    where: { id: record.businessId },
    data: {
      name: data.clientName,
      phone: data.contactPhone,
      whatsappPhone: data.contactWhatsapp,
      email: data.contactEmail,
      address: data.businessAddress,
      type: data.businessType as any,
      plan: data.subscriptionPlan as any
    }
  });

  await logAudit({
    action: `UPDATED REGISTRATION INFO FOR ${record.implementationNumber}`,
    entity: "CLIENT_IMPLEMENTATION",
    entityId: id
  });

  revalidatePath(`/super-admin/implementations/${id}`);
  revalidatePath("/super-admin/implementations");
  return updated;
}

// 8. Refresh Inventory Summary from Database
export async function refreshImplementationInventorySummary(id: string) {
  await requireSuperAdmin();

  const record = await prisma.clientImplementation.findUnique({
    where: { id }
  });

  if (!record) throw new Error("Record not found.");
  if (record.isLocked) throw new Error("Record is locked.");

  const inventorySummary = await calculateBusinessInventorySummary(record.businessId);
  const isInventoryDone = inventorySummary.totalProducts > 0;

  const updated = await prisma.clientImplementation.update({
    where: { id },
    data: {
      inventorySummary: inventorySummary as any,
      inventoryCompleted: isInventoryDone,
      inventoryCompletedAt: isInventoryDone ? (record.inventoryCompletedAt || new Date()) : null,
      status: record.status === "REGISTRATION_COMPLETED" && isInventoryDone ? "INVENTORY_IN_PROGRESS" : record.status,
      currentStep: Math.max(record.currentStep, isInventoryDone ? 3 : 2)
    }
  });

  revalidatePath(`/super-admin/implementations/${id}`);
  return updated;
}

// 9. Update Verification Checklist State
export async function updateInventoryChecklist(
  id: string,
  checklist: VerificationChecklistState,
  verificationNotes?: string
) {
  await requireSuperAdmin();

  const record = await prisma.clientImplementation.findUnique({
    where: { id }
  });

  if (!record) throw new Error("Record not found.");
  if (record.isLocked) throw new Error("Record is locked.");

  const allChecked = Object.values(checklist).every(Boolean);

  const updated = await prisma.clientImplementation.update({
    where: { id },
    data: {
      verificationChecklist: checklist as any,
      verificationNotes,
      inventoryVerified: allChecked,
      inventoryVerifiedAt: allChecked ? (record.inventoryVerifiedAt || new Date()) : null,
      status: allChecked ? "AWAITING_CLIENT_APPROVAL" : "INVENTORY_VERIFICATION",
      currentStep: Math.max(record.currentStep, allChecked ? 4 : 3)
    }
  });

  await logAudit({
    action: `UPDATED VERIFICATION CHECKLIST FOR ${record.implementationNumber}`,
    entity: "CLIENT_IMPLEMENTATION",
    entityId: id
  });

  revalidatePath(`/super-admin/implementations/${id}`);
  return updated;
}

// 10. Save Staff Digital Signature
export async function saveStaffSignature(id: string, signatureBase64: string) {
  const session = await requireSuperAdmin();

  if (!signatureBase64 || !signatureBase64.startsWith("data:image/")) {
    throw new Error("Invalid signature format.");
  }

  const record = await prisma.clientImplementation.findUnique({
    where: { id }
  });

  if (!record) throw new Error("Record not found.");
  if (record.isLocked) throw new Error("Record is locked.");

  const updated = await prisma.clientImplementation.update({
    where: { id },
    data: {
      staffSignature: signatureBase64,
      staffSignerName: session.user.name || "Super Admin Field Lead",
      staffSignerRole: "Implementation Lead / System Auditor",
      staffSignedAt: new Date(),
      assignedStaffId: session.user.id
    }
  });

  await logAudit({
    action: `CAPTURED STAFF SIGNATURE FOR ${record.implementationNumber}`,
    entity: "CLIENT_IMPLEMENTATION",
    entityId: id
  });

  revalidatePath(`/super-admin/implementations/${id}`);
  return updated;
}

// 11. Save Client Representative Digital Signature
export async function saveClientSignature(
  id: string,
  data: {
    clientSignature: string;
    clientSignerName: string;
    clientSignerRole: string;
    clientSignerPhone?: string;
  }
) {
  await requireSuperAdmin();

  if (!data.clientSignature || !data.clientSignature.startsWith("data:image/")) {
    throw new Error("Invalid signature format.");
  }

  if (!data.clientSignerName.trim() || !data.clientSignerRole.trim()) {
    throw new Error("Client representative name and role/position are required.");
  }

  const record = await prisma.clientImplementation.findUnique({
    where: { id }
  });

  if (!record) throw new Error("Record not found.");
  if (record.isLocked) throw new Error("Record is locked.");

  const updated = await prisma.clientImplementation.update({
    where: { id },
    data: {
      clientSignature: data.clientSignature,
      clientSignerName: data.clientSignerName.trim(),
      clientSignerRole: data.clientSignerRole.trim(),
      clientSignerPhone: data.clientSignerPhone?.trim() || record.contactPhone,
      clientSignedAt: new Date(),
      clientApproved: true,
      clientApprovedAt: new Date(),
      currentStep: 5
    }
  });

  await logAudit({
    action: `CAPTURED CLIENT SIGNATURE (${data.clientSignerName}) FOR ${record.implementationNumber}`,
    entity: "CLIENT_IMPLEMENTATION",
    entityId: id
  });

  revalidatePath(`/super-admin/implementations/${id}`);
  return updated;
}

// 12. Complete & Lock Implementation
export async function completeImplementation(id: string) {
  const session = await requireSuperAdmin();

  const record = await prisma.clientImplementation.findUnique({
    where: { id }
  });

  if (!record) throw new Error("Record not found.");
  if (record.isLocked) throw new Error("Record is already completed and locked.");

  // Strict Validations
  if (!record.registrationCompleted) {
    throw new Error("Cannot complete: Client registration details must be saved.");
  }

  const checklist = (record.verificationChecklist as any) || {};
  const isChecklistComplete = Object.values(checklist).length >= 10 && Object.values(checklist).every(Boolean);
  if (!isChecklistComplete && !record.inventoryVerified) {
    throw new Error("Cannot complete: All 11 inventory verification items must be verified.");
  }

  if (!record.staffSignature || !record.staffSignedAt) {
    throw new Error("Cannot complete: Staff declaration signature is missing.");
  }

  if (!record.clientSignature || !record.clientSignedAt) {
    throw new Error("Cannot complete: Client authorization signature is missing.");
  }

  const updated = await prisma.clientImplementation.update({
    where: { id },
    data: {
      status: "COMPLETED",
      isLocked: true,
      currentStep: 5,
      completedAt: new Date(),
      completedBy: session.user.name || "Super Admin Auditor"
    }
  });

  // Activate store status in business model if pending
  await prisma.business.update({
    where: { id: record.businessId },
    data: { status: "ACTIVE" }
  });

  await logAudit({
    action: `COMPLETED & LOCKED IMPLEMENTATION ${record.implementationNumber}`,
    entity: "CLIENT_IMPLEMENTATION",
    entityId: id
  });

  revalidatePath(`/super-admin/implementations/${id}`);
  revalidatePath(`/super-admin/implementations/${id}/report`);
  revalidatePath("/super-admin/implementations");
  revalidatePath("/super-admin/businesses");
  return updated;
}

// 13. Reopen / Amend Completed Implementation Workflow
export async function reopenOrAmendImplementation(id: string, reason: string) {
  const session = await requireSuperAdmin();

  if (!reason || reason.trim().length < 10) {
    throw new Error("A detailed revision reason (at least 10 characters) is required.");
  }

  const record = await prisma.clientImplementation.findUnique({
    where: { id }
  });

  if (!record) throw new Error("Record not found.");

  const currentRevisions = (record.revisions as any[]) || [];
  const newRevisionEntry = {
    amendedAt: new Date().toISOString(),
    amendedBy: session.user.name || "Super Admin",
    amendedById: session.user.id,
    reason: reason.trim(),
    previousStatus: record.status,
    previousCompletedAt: record.completedAt
  };

  const updated = await prisma.clientImplementation.update({
    where: { id },
    data: {
      status: "AMENDED",
      isLocked: false,
      revisions: [...currentRevisions, newRevisionEntry] as any
    }
  });

  await logAudit({
    action: `REOPENED / AMENDED IMPLEMENTATION ${record.implementationNumber}: ${reason.trim()}`,
    entity: "CLIENT_IMPLEMENTATION",
    entityId: id
  });

  revalidatePath(`/super-admin/implementations/${id}`);
  revalidatePath("/super-admin/implementations");
  return updated;
}

// 14. Delete / Archive Implementation
export async function deleteClientImplementation(id: string) {
  await requireSuperAdmin();

  const record = await prisma.clientImplementation.findUnique({
    where: { id }
  });

  if (!record) throw new Error("Record not found.");

  await prisma.clientImplementation.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  await logAudit({
    action: `ARCHIVED CLIENT IMPLEMENTATION ${record.implementationNumber}`,
    entity: "CLIENT_IMPLEMENTATION",
    entityId: id
  });

  revalidatePath("/super-admin/implementations");
  return { success: true };
}
