import { NextResponse } from 'next/server';
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  
  const session = (req as any).auth;
  const role = session?.user?.role;
  const businessId = session?.user?.businessId;
  
  console.log(`DEBUG: Middleware - Path: ${path}, Session exists: ${!!session}, Role: ${role}`);

  // Handle CORS
  const origin = req.headers.get("origin");
  const response = NextResponse.next();

  if (origin && (origin.includes("onrender.com"))) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  // 1. If no session, redirect to login
  if (!session) {
    console.log("DEBUG: Middleware - Redirecting to /login due to no session");
    const loginUrl = new URL('/login', req.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Copy CORS headers to redirect response
    response.headers.forEach((value, key) => {
      redirectResponse.headers.set(key, value);
    });
    return redirectResponse;
  }

  // 2. SuperAdmin Bypass
  if (role === 'SUPERADMIN') {
    return response;
  }

  // 3. Protect SuperAdmin routes for non-SuperAdmins
  if (path.startsWith('/super-admin') && role !== 'SUPERADMIN') {
    console.log("DEBUG: Blocking non-SuperAdmin from super-admin route");
    const accessDeniedUrl = new URL('/access-denied', req.url);
    const deniedResponse = NextResponse.redirect(accessDeniedUrl);
    response.headers.forEach((value, key) => {
      deniedResponse.headers.set(key, value);
    });
    return deniedResponse;
  }

  // 4. Enforce Business Context for non-SuperAdmins
  if (!businessId) {
    const setupUrl = new URL('/setup-organization', req.url);
    const setupResponse = NextResponse.redirect(setupUrl);
    response.headers.forEach((value, key) => {
      setupResponse.headers.set(key, value);
    });
    return setupResponse;
  }

  return response;
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/super-admin/:path*",
  ],
};
