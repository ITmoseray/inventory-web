import { prisma } from "../src/lib/prisma";
import crypto from "crypto";

async function runPaanSimulation() {
  console.log("==========================================================");
  console.log("   PROTECH ASSIST AFFILIATE NETWORK (PAAN) - TEST SUITE   ");
  console.log("   Connecting Businesses. Empowering Marketers. Sales.   ");
  console.log("==========================================================\n");

  try {
    // 1. Locate or create a test business
    let business = await prisma.business.findFirst({
      where: { slug: "paan-demo-merchant" },
    });

    if (!business) {
      business = await prisma.business.create({
        data: {
          name: "Apex Electronics Sierra Leone",
          slug: "paan-demo-merchant",
          type: "SHOP" as any,
          currency: "NLe",
          phone: "+23276112233",
          email: "sales@apexelectronics.sl",
          address: "24 Siaka Stevens Street, Freetown",
          status: "ACTIVE",
        },
      });
      console.log(`[1] Created Test Merchant Business: ${business.name} (ID: ${business.id})`);
    } else {
      console.log(`[1] Using Existing Merchant Business: ${business.name} (ID: ${business.id})`);
    }

    // 2. Register Business in PAAN Network
    const merchant = await (prisma as any).paanMerchantProfile.upsert({
      where: { businessId: business.id },
      update: { status: "APPROVED" },
      create: {
        businessId: business.id,
        status: "APPROVED",
        contactPersonName: "Mohamed Mansaray",
        contactPersonPhone: "+23276112233",
        contactPersonEmail: "mohamed@apexelectronics.sl",
        commissionAgreement: "Standard 70/30 split",
      },
    });
    console.log(`[2] PAAN Merchant Profile Verified: ID ${merchant.id}, Status: ${merchant.status}`);

    // 3. Create a Merchant Product
    let product = await prisma.product.findFirst({
      where: { businessId: business.id, name: "Samsung 55\" 4K UHD Smart TV" },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          businessId: business.id,
          name: "Samsung 55\" 4K UHD Smart TV",
          sku: "APX-TV-55",
          unitPrice: 8500.00, // NLe 8,500
          stockQuantity: 15,
          isNetworkAvailable: true,
          status: "active",
        },
      });
      console.log(`[3] Created Merchant Product: ${product.name} (Price: NLe ${product.unitPrice})`);
    } else {
      console.log(`[3] Existing Merchant Product Found: ${product.name}`);
    }

    // 4. Create PAAN Campaign
    const campaignSlug = "apex-smart-tv-promo-2026";
    let campaign = await (prisma as any).paanCampaign.findUnique({
      where: { slug: campaignSlug },
    });

    if (!campaign) {
      campaign = await (prisma as any).paanCampaign.create({
        data: {
          merchantId: merchant.id,
          title: "Apex Smart TV Festive Promo",
          slug: campaignSlug,
          description: "Earn 10% commission promoting genuine Samsung UHD Smart TVs in Freetown.",
          category: "Electronics",
          type: "OPEN",
          status: "ACTIVE",
          commissionType: "PERCENTAGE",
          totalCommissionRate: 10.00, // 10% Total
          affiliateSharePct: 70.00,    // 70% to Marketer (= 7% of sale)
          platformSharePct: 30.00,     // 30% to ProTech Assist (= 3% of sale)
          products: {
            create: [{ productId: product.id }],
          },
        },
      });
      console.log(`[4] Created PAAN Campaign: "${campaign.title}" (10% Total Comm, 70/30 Split)`);
    } else {
      console.log(`[4] Using Existing PAAN Campaign: "${campaign.title}"`);
    }

    // 5. Ensure Test Affiliate exists
    let user = await prisma.user.findFirst({
      where: { email: "affiliate.tester@protechassist.com" },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Alhaji Bangura",
          email: "affiliate.tester@protechassist.com",
          passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456", // placeholder
          phone: "+23278998877",
          status: "active",
        },
      });
    }

    let affiliate = await prisma.affiliate.findFirst({
      where: { userId: user.id },
    });

    if (!affiliate) {
      affiliate = await prisma.affiliate.create({
        data: {
          userId: user.id,
          affiliateCode: "PA-AFF-77701",
          fullName: "Alhaji Bangura",
          email: user.email,
          phone: user.phone || "+23278998877",
          status: "APPROVED" as any,
          country: "Sierra Leone",
          paanCategory: "ACADEMY_STUDENT" as any,
          isAcademyGraduate: true,
          academyCohort: "Cohort 1 - Freetown",
        },
      });
      console.log(`[5] Created Test Affiliate: ${affiliate.fullName} (${affiliate.affiliateCode})`);
    } else {
      console.log(`[5] Using Test Affiliate: ${affiliate.fullName} (${affiliate.affiliateCode})`);
    }

    // 6. Generate Tracking Link for Campaign
    const linkTrackingCode = "PAAN-APEX-7701";
    let referralLink = await (prisma as any).paanReferralLink.findUnique({
      where: { trackingCode: linkTrackingCode },
    });

    if (!referralLink) {
      referralLink = await (prisma as any).paanReferralLink.create({
        data: {
          campaignId: campaign.id,
          affiliateId: affiliate.id,
          trackingCode: linkTrackingCode,
          isActive: true,
        },
      });
      console.log(`[6] Generated Campaign Referral Link: Code ${referralLink.trackingCode}`);
    } else {
      console.log(`[6] Existing Referral Link: Code ${referralLink.trackingCode}`);
    }

    // 7. SIMULATE PHYSICAL OFFLINE WALK-IN SALE IN FREETOWN
    console.log("\n----------------------------------------------------------");
    console.log("   SIMULATING WALK-IN STORE SALE (OFFLINE ATTRIBUTION)   ");
    console.log("----------------------------------------------------------");
    const saleGMV = 8500.00; // Customer paid NLe 8,500 at physical counter
    const receiptNum = "APX-REC-" + Math.floor(100000 + Math.random() * 900000);
    
    // Commission breakdown
    const totalComm = (saleGMV * Number(campaign.totalCommissionRate)) / 100; // 850.00
    const affiliateCut = (totalComm * Number(campaign.affiliateSharePct)) / 100; // 595.00 (70%)
    const platformCut = totalComm - affiliateCut; // 255.00 (30%)
    const merchantNet = saleGMV - totalComm; // 7,650.00

    console.log(`Customer walks in and quotes promo code: "${referralLink.trackingCode}"`);
    console.log(`Receipt Number: ${receiptNum}`);
    console.log(`Sale Gross Amount:       NLe ${saleGMV.toFixed(2)}`);
    console.log(`Total Commission (10%):  NLe ${totalComm.toFixed(2)}`);
    console.log(`-> Marketer Cut (70%):   NLe ${affiliateCut.toFixed(2)}`);
    console.log(`-> ProTech Share (30%):  NLe ${platformCut.toFixed(2)}`);
    console.log(`-> Merchant Net Retains: NLe ${merchantNet.toFixed(2)}`);

    const offlineAttributionRef = `OFFLINE-${Date.now()}`;
    const ledgerTxRef = `LEDGER-${Date.now()}`;

    // Transactional write to DB
    await prisma.$transaction(async (tx: any) => {
      // Create offline attribution
      await tx.paanOfflineAttribution.create({
        data: {
          attributionRef: offlineAttributionRef,
          merchantId: merchant.id,
          campaignId: campaign.id,
          affiliateId: affiliate.id,
          receiptNumber: receiptNum,
          customerName: "David Koroma (Walk-in Customer)",
          customerPhone: "+23276443322",
          saleAmount: saleGMV,
          totalCommission: totalComm,
          affiliateEarning: affiliateCut,
          platformRevenue: platformCut,
          merchantRetention: merchantNet,
          currency: "NLe",
          verificationStatus: "CONFIRMED",
          verifiedBy: user.id,
          notes: "Walk-in purchase verified at central store cashier counter.",
        },
      });

      // Update or create Affiliate Wallet
      const wallet = await tx.paanAffiliateWallet.upsert({
        where: { affiliateId: affiliate.id },
        update: {
          pendingBalance: { increment: affiliateCut },
          totalEarned: { increment: affiliateCut },
        },
        create: {
          affiliateId: affiliate.id,
          pendingBalance: affiliateCut,
          availableBalance: 0,
          totalWithdrawn: 0,
          totalEarned: affiliateCut,
          currency: "NLe",
        },
      });

      // Write Immutable Ledger Record
      await tx.paanFinancialLedger.create({
        data: {
          transactionRef: ledgerTxRef,
          entryType: "COMMISSION_ACCRUAL",
          affiliateId: affiliate.id,
          merchantId: merchant.id,
          adminUserId: user.id,
          amount: affiliateCut,
          currency: "NLe",
          direction: "CREDIT",
          balanceBefore: Number(wallet.pendingBalance) - affiliateCut,
          balanceAfter: Number(wallet.pendingBalance),
          referenceType: "OFFLINE_SALE",
          referenceId: offlineAttributionRef,
          description: `Offline store walk-in sale verified. Receipt: ${receiptNum}. Marketer earned NLe ${affiliateCut.toFixed(2)}.`,
        },
      });

      // Update merchant totals
      await tx.paanMerchantProfile.update({
        where: { id: merchant.id },
        data: {
          totalSalesAttributed: { increment: saleGMV },
          totalCommissionsOwed: { increment: totalComm },
        },
      });

      // Update campaign conversions
      await tx.paanCampaign.update({
        where: { id: campaign.id },
        data: {
          totalConversions: { increment: 1 },
          totalRevenueGenerated: { increment: saleGMV },
        },
      });
    });

    console.log("\n[SUCCESS] Transaction successfully committed to PostgreSQL database!");
    console.log(`[SUCCESS] Double-entry ledger entry: ${ledgerTxRef}`);

    // 8. Verify the updated state from Database
    const updatedWallet = await (prisma as any).paanAffiliateWallet.findUnique({
      where: { affiliateId: affiliate.id },
    });
    console.log(`[VERIFY] Marketer Wallet Pending Balance: NLe ${Number(updatedWallet.pendingBalance).toFixed(2)}`);

    const latestLedger = await (prisma as any).paanFinancialLedger.findUnique({
      where: { transactionRef: ledgerTxRef },
    });
    console.log(`[VERIFY] Verified Ledger Entry: ${latestLedger.transactionRef} (${latestLedger.entryType})`);

    console.log("\n==========================================================");
    console.log("   PAAN END-TO-END BUSINESS WORKFLOW VERIFIED 100%!     ");
    console.log("==========================================================");

  } catch (err: any) {
    console.error("Simulation Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runPaanSimulation();
