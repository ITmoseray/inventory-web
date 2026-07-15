import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/actions/audit";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const isSuper = session?.user?.role === "SUPERADMIN" || (session?.user as any)?.originalRole === "SUPERADMIN";
    if (!isSuper) {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
    }

    const data = await req.json();
    
    const trimmedName = data.name?.trim();
    const trimmedUsername = data.username?.trim();
    const trimmedEmail = data.email?.trim().toLowerCase();
    const passwordStr = data.passwordStr;

    if (!trimmedName || !trimmedEmail || !passwordStr) {
      return NextResponse.json({ error: "Name, Email and Password are required." }, { status: 400 });
    }
    if (passwordStr.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    // Find system business
    const systemBusiness = await prisma.business.findUnique({
      where: { slug: 'protech-nexus-core' }
    });
    if (!systemBusiness) {
      return NextResponse.json({ error: "System Admin core business ('protech-nexus-core') not found. Please run database seeding." }, { status: 404 });
    }

    // Find SUPERADMIN role for system business
    let superAdminRole = await prisma.role.findFirst({
      where: { businessId: systemBusiness.id, name: 'SUPERADMIN' }
    });
    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          name: 'SUPERADMIN',
          businessId: systemBusiness.id
        }
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: trimmedEmail },
          trimmedUsername ? { username: trimmedUsername } : null
        ].filter(Boolean) as any
      }
    });
    
    if (existingUser) {
      if (existingUser.email === trimmedEmail) {
        return NextResponse.json({ error: "A user with this email address already exists." }, { status: 400 });
      }
      return NextResponse.json({ error: "A user with this username already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(passwordStr, 10);
    
    const newUser = await prisma.user.create({
      data: {
        name: trimmedName,
        username: trimmedUsername || null,
        email: trimmedEmail,
        passwordHash: hashedPassword,
        roleId: superAdminRole.id,
        businessId: systemBusiness.id,
        status: "active"
      }
    });

    await logAudit({
      action: `CREATED NEW SUPER ADMIN: ${newUser.email}`,
      entity: "USER",
      entityId: newUser.id,
    });

    return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (error: any) {
    console.error("API createSuperAdmin ERROR:", error?.message);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A user with this email or username already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message ?? "Failed to create Super Admin. Please try again." }, { status: 500 });
  }
}
