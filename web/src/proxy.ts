import { NextResponse, type NextRequest } from 'next/server';
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const path = req.nextUrl.pathname;
  const origin = req.headers.get("origin") || req.nextUrl.origin;
  const session = (req as any).auth;
  const role = session?.user?.role;
  const businessId = session?.user?.businessId;
  console.log("PROXY SESSION:", JSON.stringify(session, null, 2));

  // 1. Define CORS injection utility
  const injectCORS = (res: NextResponse) => {
    if (origin && (origin.includes("onrender.com") || origin.includes("hosted.app"))) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      res.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return res;
  };

  // 2. Early return for preflight
  if (req.method === "OPTIONS") {
    return injectCORS(new NextResponse(null, { status: 200 }));
  }

  // 3. Handle Protected Routes
  const protectedRoutes = ["/dashboard", "/super-admin", "/setup-organization"];
  const isProtectedRoute = protectedRoutes.some(r => path.startsWith(r));

  if (!session && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url);
    // Preserving CORS headers during redirect
    return injectCORS(NextResponse.redirect(loginUrl));
  }

  // 4. Authorization Logic
  if (session) {
    if (path.startsWith('/super-admin') && role !== 'SUPERADMIN') {
      return injectCORS(NextResponse.redirect(new URL('/access-denied', req.url)));
    }

    if (role !== 'SUPERADMIN') {
      // Trial expiration check
      const trialEndDate = session.user.trialEndDate;
      const isTrialExpired = trialEndDate && new Date(trialEndDate) < new Date();
      
      // If trial is expired and they are trying to access dashboard
      // Allow pricing, login, and static assets
      if (isTrialExpired && path.startsWith('/dashboard') && !path.startsWith('/dashboard/pricing')) {
         return injectCORS(NextResponse.redirect(new URL('/trial-expired', req.url)));
      }

      if (!businessId && path.startsWith('/dashboard')) {
        return injectCORS(NextResponse.redirect(new URL('/setup-organization', req.url)));
      }
    }
  }

  // 5. Default next with CORS
  return injectCORS(NextResponse.next());
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
