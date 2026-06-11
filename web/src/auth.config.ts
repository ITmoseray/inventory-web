import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [], // No providers here to keep it edge-safe
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      return true; // We handle redirection in the custom middleware wrapper
    },
    async session({ session, token }) {
      console.log("SESSION CALLBACK", {
        sub: token.sub,
        role: token.role,
      });

      if (token.sub && session.user) session.user.id = token.sub as string;
      if (token.businessId && session.user) session.user.businessId = token.businessId as string;
      if (token.role && session.user) session.user.role = token.role as string;
      if (token.businessType && session.user) session.user.businessType = token.businessType as string;
      if (token.trialEndDate && session.user) session.user.trialEndDate = token.trialEndDate as Date;
      if (token.permissions && session.user) session.user.permissions = token.permissions as string[];
      return session;
    },
    async jwt({ token, user }) {
      console.log("JWT CALLBACK", {
        hasUser: !!user,
        email: user?.email,
      });

      if (user) {
        token.businessId = (user as any).businessId;
        token.role = (user as any).role;
        token.businessType = (user as any).businessType;
        token.trialEndDate = (user as any).trialEndDate;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
  },
};
