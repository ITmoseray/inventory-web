import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.businessId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const businessId = session.user.businessId;
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return new NextResponse("Voucher code is required", { status: 400 });
    }

    // Find the voucher
    const voucher = await prisma.licenseVoucher.findUnique({
      where: { code },
      include: { tier: true }
    });

    if (!voucher) {
      return new NextResponse("Invalid voucher code", { status: 404 });
    }

    if (voucher.status !== "ACTIVE") {
      return new NextResponse(`Voucher is ${voucher.status.toLowerCase()}`, { status: 400 });
    }

    // Update business and voucher in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update the business
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + voucher.durationDays);

      await tx.business.update({
        where: { id: businessId },
        data: {
          activationTierId: voucher.tierId,
          subscriptionStatus: "ACTIVE",
          trialEndDate: endDate,
          plan: voucher.tier.name as any // mapping to existing enums where possible
        }
      });

      // 2. Mark voucher as redeemed
      await tx.licenseVoucher.update({
        where: { id: voucher.id },
        data: {
          status: "REDEEMED",
          redeemedById: businessId,
          redeemedAt: new Date()
        }
      });
    });

    return NextResponse.json({ success: true, message: "Voucher redeemed successfully!" });
  } catch (error) {
    console.error("POST /api/business/redeem-voucher ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
