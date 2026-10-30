import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleExamSecurityViolationInternal } from "@/lib/actions/examination";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = { text };
      }
    }

    const { attemptId, eventType, reason, details } = body || {};

    if (!attemptId || !eventType) {
      return NextResponse.json({ success: false, error: "Missing attemptId or eventType" }, { status: 400 });
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const result = await handleExamSecurityViolationInternal({
      attemptId,
      eventType,
      reason: reason || "Prohibited browser window departure / tab switch detected.",
      details: {
        ...(details || {}),
        ipAddress,
        userAgent,
        reportedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /api/examinations/security-event error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process security event" }, { status: 500 });
  }
}
