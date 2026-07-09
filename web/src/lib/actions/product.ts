"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";
import { canPerformAction } from "@/lib/subscriptions";
import { checkAccess } from "@/lib/rbac";

export async function getProducts() {
  try {
    const session = await auth();
    console.log("DEBUG: getProducts session:", !!session, "User ID:", session?.user?.id);
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const products = await prisma.product.findMany({
      where: { businessId: session.user.businessId },
      include: { 
        category: true,
        units: true
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map(p => {
      let status: "LOW" | "CRITICAL" | "OK" = "OK";
      if (p.stockQuantity === 0) status = "CRITICAL";
      else if (p.stockQuantity <= p.minStockLevel) status = "LOW";
      
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        description: p.description,
        barcode: p.barcode,
        unitPrice: p.unitPrice.toNumber(),
        costPrice: p.costPrice?.toNumber() || null,
        stockQuantity: Number(p.stockQuantity?.toString() || 0),
        minStockLevel: Number(p.minStockLevel?.toString() || 0),
        status: status, // Server-side computed status
        metadata: p.metadata,
        businessId: p.businessId,
        categoryId: p.categoryId,
        imageUrl: p.imageUrl,
        baseUnit: p.baseUnit,
        units: p.units.map(u => ({
          id: u.id,
          productId: u.productId,
          name: u.name,
          ratio: Number(u.ratio?.toString() || 0),
          sellingPrice: u.sellingPrice.toNumber(),
          costPrice: u.costPrice?.toNumber() ?? null,
          barcode: u.barcode,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        })),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        category: p.category ? {
          id: p.category.id,
          name: p.category.name,
          description: p.category.description,
          businessId: p.category.businessId,
          createdAt: p.category.createdAt.toISOString(),
          updatedAt: p.category.updatedAt.toISOString(),
        } : null,
        requiresPrescription: p.requiresPrescription || false,
        genericAlternative: p.genericAlternative || null,
        isControlledSubstance: p.isControlledSubstance || false,
      };
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
}

import { logAudit } from "./audit";

// ... (imports)

export async function createProduct(data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.businessId) throw new Error("Unauthorized");

    // 1. RBAC Check
    const access = await checkAccess(session.user.id, session.user.businessId, "product:create");
    if (!access.allowed) throw new Error(access.message);

    // 2. Subscription Limit Check
    const business = await prisma.business.findUnique({
      where: { id: session.user.businessId },
      select: { plan: true }
    });
    
    const productCount = await prisma.product.count({
      where: { businessId: session.user.businessId }
    });

    const check = canPerformAction(business?.plan || "FREE", "maxProducts", productCount);
    if (!check.allowed) {
      throw new Error(check.message);
    }
    
    const { 
      name, 
      sku, 
      description, 
      barcode, 
      unitPrice, 
      costPrice, 
      stockQuantity, 
      minStockLevel, 
      status, 
      categoryId, 
      metadata,
      imageUrl,
      baseUnit,
      units,
      requiresPrescription,
      genericAlternative,
      isControlledSubstance
    } = data;

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        barcode,
        unitPrice,
        costPrice,
        stockQuantity,
        minStockLevel,
        status: status || "active",
        categoryId: categoryId === "" || categoryId === "none" ? null : categoryId,
        metadata: metadata || {},
        businessId: session.user.businessId,
        imageUrl,
        baseUnit,
        requiresPrescription: requiresPrescription || false,
        genericAlternative: genericAlternative || null,
        isControlledSubstance: isControlledSubstance || false,
        units: {
          create: units?.map((u: any) => ({
            name: u.name,
            ratio: u.ratio,
            sellingPrice: u.sellingPrice,
            costPrice: u.costPrice,
            barcode: u.barcode
          })) || []
        }
      },
    });

    await logAudit({
      action: "CREATE",
      entity: "PRODUCT",
      entityId: product.id,
      newData: product
    });

    if (product.stockQuantity === 0) {
       await createNotification({
          title: `Critical Low Stock: ${product.name}`,
          message: `New product "${product.name}" initialized with zero stock.`,
          type: "CRITICAL"
       });
    } else if (product.stockQuantity <= product.minStockLevel) {
       await createNotification({
          title: `Low Stock: ${product.name}`,
          message: `New product "${product.name}" initialized below threshold. Current: ${product.stockQuantity}`,
          type: "WARNING"
       });
    }

    revalidatePath("/dashboard/inventory/products");
    
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      barcode: product.barcode,
      unitPrice: product.unitPrice.toNumber(),
      costPrice: product.costPrice?.toNumber() ?? null,
      stockQuantity: Number(product.stockQuantity?.toString() || 0),
      minStockLevel: Number(product.minStockLevel?.toString() || 0),
      status: product.status,
      metadata: product.metadata,
      businessId: product.businessId,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      baseUnit: product.baseUnit,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("CRITICAL ERROR: Failed to create product:", error);
    throw error;
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized: Only administrators can modify this data.");
    }

    const { 
      name, 
      sku, 
      description, 
      barcode, 
      unitPrice, 
      costPrice, 
      stockQuantity, 
      minStockLevel, 
      status, 
      categoryId, 
      metadata,
      imageUrl,
      baseUnit,
      units,
      requiresPrescription,
      genericAlternative,
      isControlledSubstance
    } = data;

    // Use a transaction to ensure atomicity
    const product = await prisma.$transaction(async (tx) => {
      // 1. Update the product
      const updatedProduct = await tx.product.update({
        where: { id, businessId: session.user.businessId },
        data: {
          name,
          sku,
          description,
          barcode,
          unitPrice,
          costPrice,
          stockQuantity,
          minStockLevel,
          status,
          categoryId: categoryId === "" || categoryId === "none" ? null : categoryId,
          metadata: metadata || {},
          imageUrl,
          baseUnit,
          requiresPrescription: requiresPrescription !== undefined ? requiresPrescription : false,
          genericAlternative: genericAlternative !== undefined ? genericAlternative : null,
          isControlledSubstance: isControlledSubstance !== undefined ? isControlledSubstance : false,
        },
      });

      // 2. Sync units (Delete existing and recreate for simplicity)
      if (units) {
        await tx.productUnit.deleteMany({
          where: { productId: id }
        });

        if (units.length > 0) {
          await tx.productUnit.createMany({
            data: units.map((u: any) => ({
              productId: id,
              name: u.name,
              ratio: u.ratio,
              sellingPrice: u.sellingPrice,
              costPrice: u.costPrice,
              barcode: u.barcode
            }))
          });
        }
      }

      return updatedProduct;
    });

    await logAudit({
      action: "UPDATE",
      entity: "PRODUCT",
      entityId: product.id,
      newData: product
    });

    if (product.stockQuantity === 0) {
       await createNotification({
          title: `Critical Low Stock: ${product.name}`,
          message: `Product "${product.name}" is completely out of stock. Immediate replenishment required.`,
          type: "CRITICAL"
       });
    } else if (product.stockQuantity <= product.minStockLevel) {
       await createNotification({
          title: `Low Stock: ${product.name}`,
          message: `Product "${product.name}" stock level updated below threshold. Remaining: ${product.stockQuantity}`,
          type: "WARNING"
       });
    } else {
       // Auto-clear or mark as read notifications for this product when stock is back to normal
       await prisma.notification.updateMany({
         where: {
           businessId: session.user.businessId,
           OR: [
             { title: `Low Stock: ${product.name}` },
             { title: `Critical Low Stock: ${product.name}` }
           ],
           isRead: false
         },
         data: { isRead: true }
       });
    }

    revalidatePath("/dashboard/inventory/products");
    
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      barcode: product.barcode,
      unitPrice: product.unitPrice.toNumber(),
      costPrice: product.costPrice?.toNumber() ?? null,
      stockQuantity: Number(product.stockQuantity?.toString() || 0),
      minStockLevel: Number(product.minStockLevel?.toString() || 0),
      status: product.status,
      metadata: product.metadata,
      businessId: product.businessId,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      baseUnit: product.baseUnit,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("CRITICAL ERROR: Failed to update product:", error);
    throw error;
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized: Only administrators can modify this data.");
    }

    await prisma.product.delete({
      where: { id, businessId: session.user.businessId },
    });

    await logAudit({
      action: "DELETE",
      entity: "PRODUCT",
      entityId: id,
    });

    revalidatePath("/dashboard/inventory/products");
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw error;
  }
}

export async function getExpiringProducts(daysThreshold = 30) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    // We fetch products and then filter in JS since querying nested JSON dates in Prisma can be tricky across different DBs.
    // For large catalogs, consider indexing or top-level fields for expiry dates.
    const products = await prisma.product.findMany({
      where: {
        businessId: session.user.businessId,
      },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        metadata: true,
        imageUrl: true,
      }
    });

    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + daysThreshold);

    const expiring = products
      .map(p => {
        const metadata = p.metadata as any;
        if (!metadata || !metadata.expiryDate) return null;
        
        const expiryDate = new Date(metadata.expiryDate);
        if (isNaN(expiryDate.getTime())) return null;

        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...p,
          expiryDate: expiryDate.toISOString(),
          daysUntilExpiry
        };
      })
      .filter(p => p !== null && p.daysUntilExpiry <= daysThreshold)
      .sort((a, b) => (a?.daysUntilExpiry || 0) - (b?.daysUntilExpiry || 0));

    return expiring;
  } catch (error) {
    console.error("Failed to fetch expiring products:", error);
    return [];
  }
}
