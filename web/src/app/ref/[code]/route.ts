import { NextRequest, NextResponse } from "next/server";
import { recordAffiliateClick } from "@/lib/actions/affiliate-tracking";
import crypto from "crypto";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const rawParams = context?.params;
    const params = rawParams instanceof Promise ? await rawParams : rawParams;
    const code = params?.code || req.nextUrl.pathname.split("/").filter(Boolean).pop() || "";
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // 1. Resolve Visitor ID
    let visitorId = req.cookies.get("pa_visitor_id")?.value;
    let isNewVisitor = false;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      isNewVisitor = true;
    }

    // 2. Extract Client Metadata
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;
    const referrer = req.headers.get("referer") || undefined;
    const landingPage = url.pathname + url.search;

    // 3. Record Click in Database safely (never crash redirect on DB failure)
    let trackingResult: any = { success: false };
    try {
      trackingResult = await recordAffiliateClick({
        code,
        ip,
        userAgent,
        referrer,
        landingPage,
        visitorId,
      });
    } catch (trackErr) {
      console.error("[Affiliate Tracking Error]:", trackErr);
    }

    // 4. Determine Destination URL
    let destination = "/";

    const explicitTo = searchParams.get("to") || searchParams.get("redirect");
    const productParam = searchParams.get("product");

    if (explicitTo && explicitTo.startsWith("/")) {
      destination = explicitTo;
    } else if (productParam) {
      const slug = productParam.toLowerCase();
      if (slug === "enterprise-os" || slug === "inventory") {
        destination = "/register";
      } else if (slug.includes("training") || slug.includes("course") || slug.includes("full-stack") || slug.includes("ai")) {
        destination = "/services";
      } else {
        destination = `/?product=${encodeURIComponent(productParam)}`;
      }
    } else if (trackingResult?.success && trackingResult.targetUrl && trackingResult.targetUrl !== "/") {
      destination = trackingResult.targetUrl;
    }

    // Determine the true public origin behind reverse proxies (Firebase App Hosting, Cloud Run)
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const forwardedHost = req.headers.get("x-forwarded-host");
    const host = forwardedHost || req.headers.get("host") || req.nextUrl.host;
    const proto = forwardedProto || (req.url.startsWith("https") ? "https" : "http");
    const baseOrigin = `${proto}://${host}`;

    const destUrl = new URL(destination, baseOrigin);

    // Preserve any remaining query parameters (except 'to', 'redirect')
    searchParams.forEach((value, key) => {
      if (key !== "to" && key !== "redirect") {
        destUrl.searchParams.set(key, value);
      }
    });

    // Always append ref tag for client display if relevant
    const effectiveRefCode = trackingResult?.success && trackingResult.affiliateCode ? trackingResult.affiliateCode : code;
    if (effectiveRefCode) {
      destUrl.searchParams.set("ref", effectiveRefCode);
    }

    const response = NextResponse.redirect(destUrl, 307);

    // 5. Set Tracking Cookies (30 days default attribution window)
    const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
    const isProduction = process.env.NODE_ENV === "production";

    // Attribution Cookie - allow JS access so registration/purchase forms can read it
    if (effectiveRefCode) {
      response.cookies.set("pa_ref", effectiveRefCode, {
        maxAge,
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        secure: isProduction,
      });
    }

    // Click ID Cookie (for instant conversion correlation)
    if (trackingResult?.clickId) {
      response.cookies.set("pa_click_id", trackingResult.clickId, {
        maxAge,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
      });
    }

    // Visitor ID Cookie (1 year)
    if (isNewVisitor || !req.cookies.get("pa_visitor_id")) {
      response.cookies.set("pa_visitor_id", visitorId, {
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
      });
    }

    return response;
  } catch (error) {
    console.error("[Ref Route Error]:", error);
    // Absolute fallback: redirect to homepage
    return NextResponse.redirect(new URL("/", req.url));
  }
}
