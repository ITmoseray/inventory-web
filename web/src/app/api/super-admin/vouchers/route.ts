import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function generateLicenseCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if (i < 3) result += '-';
  }
  return result; // e.g. ABCD-1234-EFGH-5678
}

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const vouchers = await prisma.licenseVoucher.findMany({
      include: {
        tier: true,
        redeemedBy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(vouchers);
  } catch (error) {
    console.error("GET /api/super-admin/vouchers ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const { tierId, type, durationDays, count } = body;

    const numVouchers = Number(count) || 1;
    const generatedVouchers = [];

    // Find or create the tier first
    let tier = await prisma.activationTier.findFirst({
      where: { name: tierId }
    });

    if (!tier) {
      tier = await prisma.activationTier.create({
        data: {
          name: tierId,
          maxUsers: tierId === "ENTERPRISE" ? 100 : (tierId === "PRO" ? 20 : 5),
          maxProducts: tierId === "ENTERPRISE" ? 10000 : (tierId === "PRO" ? 1000 : 100),
          price: 0
        }
      });
    }

    for (let i = 0; i < numVouchers; i++) {
      const voucher = await prisma.licenseVoucher.create({
        data: {
          code: generateLicenseCode(),
          type: type || "TRIAL",
          tierId: tier.id,
          durationDays: Number(durationDays) || 30,
        }
      });
      generatedVouchers.push({ ...voucher, tierName: tier.name });
    }

    return NextResponse.json(generatedVouchers);
  } catch (error) {
    console.error("POST /api/super-admin/vouchers ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
