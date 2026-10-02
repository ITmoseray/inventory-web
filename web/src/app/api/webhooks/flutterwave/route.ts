import { NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/prisma';
import { recordAffiliateConversion } from '@/lib/actions/affiliate-tracking';

export async function POST(req: Request) {
  const body = await req.json();
  const signature = req.headers.get("verif-hash");

  // In production, ALWAYS verify the signature!
  if (signature !== process.env.FLUTTERWAVE_SECRET_HASH) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  if (body.event === "charge.completed") {
    const { tx_ref, amount, meta } = body.data;
    
    // Update business plan in DB
    const prisma = getTenantPrisma(meta.businessId);
    await prisma.business.update({
      where: { id: meta.businessId },
      data: {
        subscriptionStatus: "ACTIVE",
        flutterwaveRef: tx_ref
      }
    });

    // ─── Affiliate Conversion Tracking ────────────────────────────────────────
    // If this payment carries affiliate referral metadata, record a commission.
    // meta.affiliateRef = affiliate code (pa_ref cookie value passed at checkout)
    // meta.affiliateClickId = click row ID (pa_click_id cookie value)
    if (meta?.affiliateRef) {
      try {
        await recordAffiliateConversion({
          referralCode: meta.affiliateRef,
          clickId: meta.affiliateClickId || undefined,
          orderId: tx_ref,
          orderAmount: Number(amount),
          orderType: "SUBSCRIPTION",
          productSlug: meta.productSlug || "enterprise-os",
          customerId: meta.userId || undefined,
        });
      } catch (err) {
        // Non-fatal — log but don't block the webhook response
        console.error("[Affiliate] Conversion recording failed:", err);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────
  }

  return NextResponse.json({ received: true });
}
