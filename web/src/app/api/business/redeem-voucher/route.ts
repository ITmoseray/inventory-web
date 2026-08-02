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
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + voucher.durationDays);

      // Map tier to valid SubscriptionPlan enum
      let mappedPlan = "FREE";
      if (voucher.tier.name === "SHOP") mappedPlan = "STANDARD";
      else if (voucher.tier.name === "PRO") mappedPlan = "BUSINESS";
      else if (voucher.tier.name === "ENTERPRISE") mappedPlan = "ENTERPRISE";

      // 1. Update the business
      await tx.business.update({
        where: { id: businessId },
        data: {
          activationTierId: voucher.tierId,
          subscriptionStatus: "ACTIVE",
          trialEndDate: endDate,
          plan: mappedPlan as any
        }
      });

      // 2. Create a Subscription record so it shows in the UI
      await tx.subscription.create({
        data: {
          businessId,
          plan: mappedPlan as any,
          status: "active",
          startDate: new Date(),
          endDate: endDate,
          amount: 0,
          paymentRef: voucher.code,
        }
      });

      // 3. Create an Invoice record so it shows in history
      await tx.invoice.create({
        data: {
          businessId,
          invoiceNumber: `INV-VCH-${Date.now()}`,
          issueDate: new Date(),
          dueDate: endDate,
          totalAmount: 0,
          status: "PAID",
          notes: "Redeemed via Activation Voucher: " + voucher.code,
        }
      });

      // 4. Mark voucher as redeemed
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
