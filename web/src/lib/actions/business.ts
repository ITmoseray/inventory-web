"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getUserBusinesses() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // If Super Admin, return all businesses
    if (session.user.role === "SUPERADMIN") {
      return await prisma.business.findMany({
        orderBy: { name: "asc" }
      });
    }

    // Otherwise, find businesses where this user (by email) is an admin or member
    // Since email is unique, we search for all User records with this email
    const usersWithSameEmail = await prisma.user.findMany({
      where: { email: session.user.email },
      include: { business: true }
    });

    return usersWithSameEmail.map(u => u.business);
  } catch (error) {
    console.error("GET USER BUSINESSES ERROR:", error);
    return [];
  }
}

export async function switchBusiness(businessId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // 1. Check if user has access to this business
    if (session.user.role !== "SUPERADMIN") {
      const access = await prisma.user.findFirst({
        where: { 
          email: session.user.email,
          businessId: businessId
        }
      });
      if (!access) throw new Error("Access Denied");
    }

    // 2. For SuperAdmin, we use impersonation logic (cookie-based)
    if (session.user.role === "SUPERADMIN") {
      const admin = await prisma.user.findFirst({
        where: { 
          businessId, 
          role: { name: 'ADMIN' } 
        },
      });

      if (!admin) throw new Error("No admin found for this business.");

      (await cookies()).set("impersonation_target", admin.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    } else {
      // For regular users with multiple accounts, we might need a way to switch "active" user ID
      // But for now, since we only have one user record per email, we'd need to update the user record
      // or use a different mechanism.
      // Given the current schema, a user is 1-to-1 with a business.
      // If we want them to switch, we'd need to set the impersonation target to their other user ID.
      const targetUser = await prisma.user.findFirst({
        where: { email: session.user.email, businessId }
      });
      
      if (targetUser) {
        (await cookies()).set("impersonation_target", targetUser.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("SWITCH BUSINESS ERROR:", error);
    return { success: false, error: error.message };
  }
}
