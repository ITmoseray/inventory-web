import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const isSuperAdmin = session?.user?.email === "strangesteven001@gmail.com" || (session?.user as any)?.role === "SUPER_ADMIN";

    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, isVerified, authorName, companyName, roleTitle, industry, rating, content, location } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (authorName !== undefined) updateData.authorName = authorName.trim();
    if (companyName !== undefined) updateData.companyName = companyName.trim();
    if (roleTitle !== undefined) updateData.roleTitle = roleTitle.trim();
    if (industry !== undefined) updateData.industry = industry.trim();
    if (rating !== undefined) updateData.rating = parseInt(rating, 10);
    if (content !== undefined) updateData.content = content.trim();
    if (location !== undefined) updateData.location = location.trim();

    const updated = await prisma.testimonial.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, testimonial: updated });
  } catch (error: any) {
    console.error("Failed to update testimonial:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const isSuperAdmin = session?.user?.email === "strangesteven001@gmail.com" || (session?.user as any)?.role === "SUPER_ADMIN";

    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.testimonial.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete testimonial:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
