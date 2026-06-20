import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
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
  debug: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      async authorize(credentials) {
        console.log("SERVER AUTH: Authorize Attempt", { email: credentials?.email });
        const parsedCredentials = z
          .object({ email: z.string(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          try {
            const user = await prisma.user.findFirst({ 
              where: { 
                OR: [
                  { email: email },
                  { username: email }
                ]
              },
              include: { 
                business: true,
                role: { include: { permissions: true } }
              }
            });
            
            if (!user) {
              console.warn("SERVER AUTH: User not found", { email });
              throw new Error("Invalid email, username or password.");
            }

            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            if (!passwordMatch) {
              console.warn("SERVER AUTH: Password mismatch", { email });
              throw new Error("Invalid email, username or password.");
            }

            if (user.status !== 'active') {
              console.warn("SERVER AUTH: Account inactive", { email });
              throw new Error("Your account is not active. Please contact the administrator.");
            }

            console.log("SERVER AUTH: Authorization Success", { email, role: user.role.name });
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
          } catch (error) {
            console.error("SERVER AUTH: Authorize Exception", error);
            throw error;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!dbUser) {
            console.log(`Google Auth: User ${user.email} not found in DB. Creating new business and user account.`);
            
            const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
            const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            
            await prisma.$transaction(async (tx) => {
              const business = await tx.business.create({
                data: {
                  name: `${user.name || "Google User"}'s Enterprise`,
                  slug: `${(user.name || "google-user").toLowerCase().replace(/ /g, "-")}-${Math.random().toString(36).substring(7)}`,
                  type: "SHOP",
                  plan: "FREE",
                  status: "ACTIVE",
                  enabledModules: ["POS", "INVENTORY"],
                  trialStartDate: new Date(),
                  trialEndDate: trialEndDate,
                },
              });

              const [adminRole] = await Promise.all([
                tx.role.create({ data: { name: 'ADMIN', businessId: business.id } }),
                tx.role.create({ data: { name: 'MANAGER', businessId: business.id } }),
                tx.role.create({ data: { name: 'EMPLOYEE', businessId: business.id } }),
              ]);

              const allPermissions = await tx.permission.findMany();
              if (allPermissions.length > 0) {
                await tx.role.update({
                  where: { id: adminRole.id },
                  data: {
                    permissions: {
                      connect: allPermissions.map(p => ({ id: p.id }))
                    }
                  }
                });
              }

              await tx.user.create({
                data: {
                  email: user.email!,
                  passwordHash,
                  name: user.name || "Google User",
                  roleId: adminRole.id,
                  businessId: business.id,
                  emailVerified: new Date(),
                },
              });
            });
            console.log(`Google Auth: Successfully created business and user for ${user.email}`);
          }
        } catch (error) {
          console.error("Google Auth: Error in signIn callback during findOrCreate:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      console.log("SERVER AUTH: Session Callback Start", { sub: token.sub, role: token.role });
      
      if (token.sub && session.user) session.user.id = token.sub as string;
      if (token.businessId && session.user) session.user.businessId = token.businessId as string;
      if (token.role && session.user) session.user.role = token.role as string;
      if (token.businessType && session.user) session.user.businessType = token.businessType as string;
      if (token.trialEndDate && session.user) session.user.trialEndDate = token.trialEndDate as Date;
      if (token.permissions && session.user) {
        session.user.permissions = token.permissions as string[];
        console.log(`SERVER AUTH: Assigned ${session.user.permissions.length} permissions to session`);
      } else if (session.user) {
        session.user.permissions = [];
        console.warn("SERVER AUTH: No permissions found in token, defaulting to empty array");
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      console.log("SERVER AUTH: JWT Callback Start", { trigger, sub: token.sub });

      // 1. Basic population from login
      if (user) {
        token.businessId = (user as any).businessId;
        token.role = (user as any).role;
        token.businessType = (user as any).businessType;
        token.trialEndDate = (user as any).trialEndDate;
        token.permissions = (user as any).permissions;
        console.log(`SERVER AUTH: Initial Login - Role: ${token.role}, Perms: ${(token.permissions as string[] || []).length || 0}`);
      }

      // 2. Auto-refresh permissions if missing or empty
      const lookupKey = (token.sub || token.email) as string;
      
      if (trigger === "update" || (lookupKey && (!token.permissions || (token.permissions as string[]).length === 0))) {
        try {
          console.log(`SERVER AUTH: Refreshing permissions (sub: ${token.sub}, email: ${token.email})`);
          const dbUser = await prisma.user.findFirst({
            where: { 
              OR: [
                ...(token.sub ? [{ id: token.sub }] : []),
                ...(token.email ? [{ email: token.email }] : [])
              ]
            },
            include: { role: { include: { permissions: true } }, business: true }
          });
          
          if (dbUser) {
            token.sub = dbUser.id; // Ensure sub is synced
            token.role = dbUser.role.name;
            token.permissions = dbUser.role.permissions.map(p => p.key);
            token.businessType = dbUser.business.type;
            token.businessId = dbUser.businessId;
            token.trialEndDate = dbUser.business.trialEndDate;
            console.log(`SERVER AUTH: DB Refresh Success - User: ${dbUser.email}, Role: ${token.role}, Perms: ${(token.permissions as string[]).length}`);
          } else {
            console.error(`SERVER AUTH: DB User not found for sub: ${token.sub}, email: ${token.email}`);
          }
        } catch (error) {
          console.error("SERVER AUTH: JWT Permission Refresh Error:", error);
        }
      }

      // 3. Database-dependent impersonation logic
      try {
        const cookieStore = await cookies();
        const impersonationTargetId = cookieStore.get("impersonation_target")?.value;

        if (impersonationTargetId && token.role === "SUPERADMIN") {
          console.log(`SERVER AUTH: Impersonation detected for targetId: ${impersonationTargetId}`);
          const targetUser = await prisma.user.findUnique({
            where: { id: impersonationTargetId },
            include: { business: true, role: { include: { permissions: true } } },
          });

          if (targetUser) {
            token.sub = targetUser.id;
            token.role = targetUser.role.name;
            token.businessId = targetUser.businessId;
            token.businessName = targetUser.business.name;
            token.businessType = targetUser.business.type;
            token.permissions = targetUser.role.permissions.map(p => p.key);
            console.log(`SERVER AUTH: Impersonation Active - Target: ${targetUser.email}, Business: ${targetUser.business.name}`);
          }
        }
      } catch (error) {
        console.error("SERVER AUTH: Impersonation Cookie Error:", error);
      }

      return token;
    },
  },
});
