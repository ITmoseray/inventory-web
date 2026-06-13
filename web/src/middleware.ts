import { NextResponse } from 'next/server';
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const origin = req.headers.get("origin");
  const session = (req as any).auth;
  const role = session?.user?.role;
  const businessId = session?.user?.businessId;

  // 1. Initialize global response
  let response = NextResponse.next();

  // 2. Apply Global CORS for all Render subdomains
  if (origin && origin.includes("onrender.com")) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // 3. Early return for preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  console.log(`DEBUG: Middleware - Path: ${path}, Session: ${!!session}, Role: ${role}`);

  // 4. Handle Redirection with CORS Header Preservation
  const protectedRoutes = ["/dashboard", "/super-admin", "/setup-organization"];
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(protectedRoutes.find(r => path.startsWith(r)) || "___NONE___"));

  if (!session && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Copy CORS headers to the redirect response
    response.headers.forEach((value, key) => {
      redirectResponse.headers.set(key, value);
    });
    return redirectResponse;
  }

  // 5. Authorization Logic
  if (session) {
    if (path.startsWith('/super-admin') && role !== 'SUPERADMIN') {
      const deniedResponse = NextResponse.redirect(new URL('/access-denied', req.url));
      response.headers.forEach((value, key) => deniedResponse.headers.set(key, value));
      return deniedResponse;
    }

    if (role !== 'SUPERADMIN' && !businessId && path.startsWith('/dashboard')) {
      const setupResponse = NextResponse.redirect(new URL('/setup-organization', req.url));
      response.headers.forEach((value, key) => setupResponse.headers.set(key, value));
      return setupResponse;
    }
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
