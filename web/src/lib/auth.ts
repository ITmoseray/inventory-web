import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { cookies } from "next/headers";
import { authConfig } from "../auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      businessId: string;
      businessName: string;
      businessType: string;
      trialEndDate: Date | null;
      role: string;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    businessId: string;
    businessName: string;
    businessType: string;
    trialEndDate: Date | null;
    role: string;
    permissions: string[];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          const user = await prisma.user.findUnique({ 
            where: { email },
            include: { 
              business: true,
              role: { include: { permissions: true } }
            }
          });
          
          if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new Error("Invalid email or password.");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            businessId: user.businessId,
            businessName: user.business.name,
            businessType: user.business.type,
            trialEndDate: user.business.trialEndDate,
            role: user.role.name,
            permissions: user.role.permissions.map(p => p.key),
            emailVerified: user.emailVerified,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token.sub && session.user) session.user.id = token.sub as string;
      if (token.businessId && session.user) session.user.businessId = token.businessId as string;
      if (token.role && session.user) session.user.role = token.role as string;
      if (token.businessType && session.user) session.user.businessType = token.businessType as string;
      if (token.trialEndDate && session.user) session.user.trialEndDate = token.trialEndDate as Date;
      if (token.permissions && session.user) session.user.permissions = token.permissions as string[];
      return session;
    },
    async jwt({ token, user, trigger }) {
      // 1. Basic population from login
      if (user) {
        token.businessId = (user as any).businessId;
        token.role = (user as any).role;
        token.businessType = (user as any).businessType;
        token.trialEndDate = (user as any).trialEndDate;
        token.permissions = (user as any).permissions;
      }

      // 2. Auto-refresh permissions if missing or empty
      if (trigger === "update" || (token.sub && (!token.permissions || (token.permissions as string[]).length === 0))) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub as string },
            include: { role: { include: { permissions: true } }, business: true }
          });
          if (dbUser) {
            token.role = dbUser.role.name;
            token.permissions = dbUser.role.permissions.map(p => p.key);
            token.businessType = dbUser.business.type;
            token.businessId = dbUser.businessId;
          }
        } catch (error) {
          console.error("JWT Permission Refresh Error:", error);
        }
      }

      // 3. Database-dependent impersonation logic
      const cookieStore = await cookies();
      const impersonationTargetId = cookieStore.get("impersonation_target")?.value;

      if (impersonationTargetId && token.role === "SUPERADMIN") {
        const targetUser = await prisma.user.findUnique({
          where: { id: impersonationTargetId },
          include: { business: true, role: { include: { permissions: true } } },
        });

        if (targetUser) {
          token.sub = targetUser.id;
          token.role = targetUser.role.name;
          token.businessId = targetUser.businessId;
          token.permissions = targetUser.role.permissions.map(p => p.key);
        }
      }
      return token;
    },
  },
});
