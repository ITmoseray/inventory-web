import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/business/setup
 * Called from the organization onboarding wizard (Step 5 — Launch).
 * Creates the Business + default Warehouse records and links them to the
 * logged-in user, so the JWT can be refreshed with the new businessId.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check DB for existing businessId in case JWT is slightly desynced
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, businessId: true }
  });

  const existingBizId = session.user.businessId || dbUser?.businessId;
  if (existingBizId) {
    // Ensure any standalone stores are linked
    await prisma.store.updateMany({
      where: { ownerId: session.user.id, businessId: null },
      data: { businessId: existingBizId },
    });
    return NextResponse.json(
      { success: true, businessId: existingBizId, alreadySetup: true },
      { status: 200 }
    );
  }

  const body = await req.json();
  const {
    name,
    industry,
    phone,
    email,
    address,
    country,
    currency,
    defaultWarehouse,
    taxRate,
    invoicePrefix,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Business name is required" },
      { status: 400 }
    );
  }

  // Generate a URL-safe slug
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Ensure slug uniqueness by appending a short random suffix if needed
  let slug = baseSlug;
  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) {
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  // Map industry string to BusinessType enum value
  const businessTypeMap: Record<string, string> = {
    "Retail & Shop": "SHOP",
    Supermarket: "SHOP",
    Pharmacy: "SHOP",
    "Wholesale & Distribution": "WHOLESALE",
    "Hardware & Tools": "SHOP",
    "Boutique & Fashion": "SHOP",
    Electronics: "SHOP",
    "Bar & Restaurant": "RESTAURANT",
    "Hospital & Clinic": "CLINIC",
    "School & Education": "SCHOOL",
    Manufacturing: "MANUFACTURING",
    "Corporate Office": "CORPORATE",
  };
  const businessType = (businessTypeMap[industry] || "SHOP") as any;

  // Trial: 14 days from now
  const trialStartDate = new Date();
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14);

  try {
    // Create business + warehouse + link user — all in one transaction
    const business = await prisma.$transaction(async (tx) => {
      const biz = await tx.business.create({
        data: {
          name: name.trim(),
          slug,
          type: businessType,
          institutionType: industry,
          currency: currency || "SLE",
          address: address || null,
          email: email || null,
          phone: phone || null,
          status: "ACTIVE",
          trialStartDate,
          trialEndDate,
          enabledModules: [
            "POS",
            "INVENTORY",
            "EXPENSES",
            "REPORTS",
            "STORE_BUILDER",
          ],
          receiptSettings: {
            prefix: invoicePrefix || "INV-2026",
            taxRate: parseFloat(taxRate || "15"),
            showLogo: true,
            footerNote: `Thank you for shopping at ${name.trim()}!`,
          },
        },
      });

      // Create the default warehouse
      await tx.warehouse.create({
        data: {
          name: defaultWarehouse?.trim() || "Main Central Store",
          businessId: biz.id,
          type: "STORE",
          address: address || null,
        },
      } as any);

      // Link the user to this business
      await tx.user.update({
        where: { id: session.user.id },
        data: { businessId: biz.id },
      });

      // Link any standalone/guest stores owned by this user to the newly minted business
      await tx.store.updateMany({
        where: { ownerId: session.user.id, businessId: null },
        data: { businessId: biz.id },
      });

      return biz;
    });

    return NextResponse.json(
      {
        success: true,
        businessId: business.id,
        businessType: business.type,
        slug: business.slug,
        trialEndDate: business.trialEndDate,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[/api/business/setup] Error:", error);
    return NextResponse.json(
      { error: "Failed to create organization. Please try again." },
      { status: 500 }
    );
  }
}
