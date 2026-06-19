"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createBusiness(data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  description: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Generate a slug from business name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const business = await prisma.business.create({
      data: {
        name: data.name,
        slug: `${slug}-${Date.now()}`,
        email: data.email,
        phone: data.phone,
        address: data.address,
        type: data.type as any,
        description: data.description,
        ownerId: session.user.id,
        users: {
          connect: { id: session.user.id }
        }
      },
    });

    return { success: true, businessId: business.id };
  } catch (error) {
    console.error("Failed to create business:", error);
    return { success: false, error: "Failed to create business" };
  }
}
