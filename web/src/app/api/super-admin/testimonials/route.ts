import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const isSuperAdmin = session?.user?.email === "strangesteven001@gmail.com" || (session?.user as any)?.role === "SUPER_ADMIN";

    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PENDING | APPROVED | FEATURED | REJECTED | ALL
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { authorName: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } }
      ];
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    // Compute counts
    const [pendingCount, approvedCount, featuredCount, rejectedCount] = await Promise.all([
      prisma.testimonial.count({ where: { status: "PENDING" } }),
      prisma.testimonial.count({ where: { status: "APPROVED" } }),
      prisma.testimonial.count({ where: { status: "FEATURED" } }),
      prisma.testimonial.count({ where: { status: "REJECTED" } })
    ]);

    return NextResponse.json({
      success: true,
      testimonials,
      counts: {
        all: pendingCount + approvedCount + featuredCount + rejectedCount,
        pending: pendingCount,
        approved: approvedCount,
        featured: featuredCount,
        rejected: rejectedCount
      }
    });
  } catch (error: any) {
    console.error("Failed to fetch super-admin testimonials:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
