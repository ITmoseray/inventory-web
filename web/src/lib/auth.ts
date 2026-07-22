import NextAuth, { type DefaultSession, CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { cookies } from "next/headers";
import { authConfig } from "../auth.config";
import { getSystemSettings } from "@/lib/actions/system-settings";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/mail";

class CustomAuthError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      businessId: string;
      businessName: string;
      businessType: string;
      institutionType: string | null;
      trialEndDate: Date | null;
      role: string;
      permissions: string[];
      originalRole?: string;
    } & DefaultSession["user"];
  }

  interface User {
    businessId: string;
    businessName: string;
    businessType: string;
    institutionType: string | null;
    trialEndDate: Date | null;
    role: string;
    permissions: string[];
    originalRole?: string;
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
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
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
                  { email: { equals: email.trim(), mode: 'insensitive' } },
                  { username: { equals: email.trim(), mode: 'insensitive' } }
                ]
              },
              include: { 
                business: true,
                role: { include: { permissions: true } }
              }
            });
            
            if (!user) {
              console.warn("SERVER AUTH: User not found in database matching:", { searchInput: email });
              throw new CustomAuthError("Invalid email, username or password.");
            }

            console.log("SERVER AUTH: User found, checking password match...", { email: user.email, role: user.role?.name });
            const passwordMatch = await bcrypt.compare(password.trim(), user.passwordHash);
            if (!passwordMatch) {
              console.warn("SERVER AUTH: Password check failed for user:", { email: user.email });
              throw new CustomAuthError("Invalid email, username or password.");
            }

            if (user.status !== 'active') {
              console.warn("SERVER AUTH: Account inactive", { email });
              throw new CustomAuthError("Your account is not active. Please contact the administrator.");
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
      // Clear any leftover impersonation cookies on fresh sign-in
      try {
        const cookieStore = await cookies();
        cookieStore.delete("impersonation_target");
      } catch (e) {
        console.error("Failed to delete impersonation cookie on sign-in:", e);
      }

      let finalUserId = user.id;
      let finalBusinessId = (user as any).businessId;

      if (account?.provider === "google" && user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!dbUser) {
            console.log(`Google Auth: User ${user.email} not found in DB. Creating new business and user account.`);
            
            const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
            const settings = await getSystemSettings().catch(() => ({ defaultTrialDays: 7, registrationOpen: true }));
            
            if (settings.registrationOpen === false) {
              console.warn(`Google Auth: Registration is closed, rejecting new user ${user.email}`);
              return false;
            }
            
            const trialEndDate = new Date(Date.now() + settings.defaultTrialDays * 24 * 60 * 60 * 1000);
            let businessData = {
              name: `${user.name || "Google User"}'s Enterprise`,
              type: "SHOP" as any,
              currency: "SLL",
              timezone: "UTC",
              address: null as string | null,
              logoUrl: null as string | null,
              phone: null as string | null,
            };

            try {
              const regCookie = (await cookies()).get("registrationData")?.value;
              if (regCookie) {
                const regData = JSON.parse(decodeURIComponent(regCookie));
                if (regData.businessName) businessData.name = regData.businessName;
                if (regData.businessType) businessData.type = regData.businessType;
                if (regData.currency) businessData.currency = regData.currency;
                if (regData.timezone) businessData.timezone = regData.timezone;
                if (regData.address) businessData.address = regData.address;
                if (regData.logoUrl) businessData.logoUrl = regData.logoUrl;
                if (regData.phone) businessData.phone = regData.phone;
              }
            } catch (e) {
              console.error("Failed to parse registration cookie", e);
            }
            
            await prisma.$transaction(async (tx) => {
              const business = await tx.business.create({
                data: {
                  name: businessData.name,
                  slug: `${businessData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).substring(7)}`,
                  type: businessData.type,
                  currency: businessData.currency,
                  timezone: businessData.timezone,
                  address: businessData.address,
                  logoUrl: businessData.logoUrl,
                  phone: businessData.phone,
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

              const verificationToken = generateVerificationToken();
              const newDbUser = await tx.user.create({
                data: {
                  email: user.email!,
                  passwordHash,
                  name: user.name || "Google User",
                  roleId: adminRole.id,
                  businessId: business.id,
                  // emailVerified intentionally NOT set — user must verify email first
                  verificationToken,
                },
              });
              finalUserId = newDbUser.id;
              finalBusinessId = business.id;

              // Send verification email outside transaction (fire-and-forget)
              sendVerificationEmail(user.email!, verificationToken).catch(err =>
                console.error("Google Auth: Failed to send verification email:", err)
              );
            });
            console.log(`Google Auth: Created account for ${user.email} — verification email sent.`);

            // Block access until email is verified
            return false;
          } else {
            if (dbUser.status !== 'active') {
              console.warn("Google Auth: Account inactive", { email: user.email });
              return false;
            }

            // Block access if the user hasn't verified their email yet
            if (!dbUser.emailVerified && dbUser.verificationToken) {
              console.warn("Google Auth: Email not yet verified", { email: user.email });
              return false;
            }

            finalUserId = dbUser.id;
            finalBusinessId = dbUser.businessId;
          }
        } catch (error) {
          console.error("Google Auth: Error in signIn callback during findOrCreate:", error);
          return false;
        }
      }

      // Log successful login activity
      if (finalUserId && finalBusinessId) {
        try {
          await prisma.auditLog.create({
            data: {
              action: `LOGGED IN (${account?.provider === "google" ? "Google" : "Credentials"})`,
              entity: "USER",
              entityId: finalUserId,
              userId: finalUserId,
              businessId: finalBusinessId,
            }
          });
        } catch (auditErr) {
          console.error("Failed to log sign-in audit:", auditErr);
        }
      }

      return true;
    },
    async session({ session, token }) {
      console.log("SERVER AUTH: Session Callback Start", { sub: token.sub, role: token.role });
      
      if (token.sub && session.user) session.user.id = token.sub as string;
      if (token.picture && session.user) session.user.image = token.picture as string;
      if (token.businessId && session.user) session.user.businessId = token.businessId as string;
      if (token.businessName && session.user) session.user.businessName = token.businessName as string;
      if (token.role && session.user) session.user.role = token.role as string;
      if (token.businessType && session.user) session.user.businessType = token.businessType as string;
      if (token.institutionType && session.user) session.user.institutionType = token.institutionType as string;
      if (token.trialEndDate && session.user) session.user.trialEndDate = token.trialEndDate as Date;
      if (token.originalRole && session.user) {
        (session.user as any).originalRole = token.originalRole as string;
      }
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
        token.businessName = (user as any).businessName;
        token.role = (user as any).role;
        token.businessType = (user as any).businessType;
        token.institutionType = (user as any).institutionType;
        token.trialEndDate = (user as any).trialEndDate;
        token.permissions = (user as any).permissions;
        token.picture = (user as any).imageUrl || user.image;
        console.log(`SERVER AUTH: Initial Login - Role: ${token.role}, Perms: ${(token.permissions as string[] || []).length || 0}`);
      }

      // 2. Auto-refresh permissions if missing or empty
      const lookupKey = (token.sub || token.email) as string;
      
      if (trigger === "update" || (lookupKey && (!token.permissions || (token.permissions as string[]).length === 0 || !token.businessId))) {
        try {
          console.log(`SERVER AUTH: Refreshing permissions (sub: ${token.sub}, email: ${token.email})`);
          const orConditions = [
            ...(token.sub ? [{ id: token.sub as string }] : []),
            ...(token.email ? [{ email: token.email as string }] : [])
          ];

          if (orConditions.length > 0) {
            const dbUser = await prisma.user.findFirst({
              where: { OR: orConditions },
              include: { role: { include: { permissions: true } }, business: true }
            });
            
            if (dbUser) {
              token.sub = dbUser.id; // Ensure sub is synced
              token.role = dbUser.role.name;
              token.permissions = dbUser.role.permissions.map(p => p.key);
              token.businessType = dbUser.business.type;
              token.institutionType = dbUser.business.institutionType;
              token.businessName = dbUser.business.name;
              token.businessId = dbUser.businessId;
              token.trialEndDate = dbUser.business.trialEndDate;
              token.picture = dbUser.imageUrl;
              console.log(`SERVER AUTH: DB Refresh Success - User: ${dbUser.email}, Role: ${token.role}, Perms: ${(token.permissions as string[]).length}`);
            } else {
              console.error(`SERVER AUTH: DB User not found for sub: ${token.sub}, email: ${token.email}`);
            }
          }
        } catch (error) {
          console.error("SERVER AUTH: JWT Permission Refresh Error:", error);
        }
      }

      // 3. Database-dependent impersonation logic
      try {
        const cookieStore = await cookies();
        const impersonationTargetId = cookieStore.get("impersonation_target")?.value;
        const isSuperAdmin = token.role === "SUPERADMIN" || token.originalRole === "SUPERADMIN";

        if (isSuperAdmin) {
          if (impersonationTargetId) {
            // Check if we need to set up or update the impersonation
            if (!token.originalRole || token.sub !== impersonationTargetId) {
              console.log(`SERVER AUTH: Initializing or updating impersonation to targetId: ${impersonationTargetId}`);
              const targetUser = await prisma.user.findUnique({
                where: { id: impersonationTargetId },
                include: { business: true, role: { include: { permissions: true } } },
              });

              if (targetUser) {
                // If not already in impersonation, save the original super admin details
                if (!token.originalRole) {
                  token.originalSub = token.sub;
                  token.originalRole = "SUPERADMIN";
                  token.originalBusinessId = token.businessId;
                  token.originalBusinessName = token.businessName;
                  token.originalBusinessType = token.businessType;
                  token.originalTrialEndDate = token.trialEndDate;
                  token.originalPermissions = token.permissions;
                }

                // Overwrite active token properties with target user details
                token.sub = targetUser.id;
                token.role = targetUser.role.name;
                token.businessId = targetUser.businessId;
                token.businessName = targetUser.business.name;
                token.businessType = targetUser.business.type;
                token.permissions = targetUser.role.permissions.map(p => p.key);
                console.log(`SERVER AUTH: Impersonation active - Target: ${targetUser.email}, Business: ${targetUser.business.name}`);
              }
            }
          } else if (token.originalRole) {
            // Restore original details because impersonation has stopped (cookie was deleted)
            console.log(`SERVER AUTH: Restoring original Super Admin session`);
            token.sub = token.originalSub as string | undefined;
            token.role = token.originalRole as string;
            token.businessId = token.originalBusinessId as string;
            token.businessName = token.originalBusinessName as string;
            token.businessType = token.originalBusinessType as string;
            token.institutionType = token.originalInstitutionType as string | null;
            token.trialEndDate = token.originalTrialEndDate as any;
            token.permissions = token.originalPermissions as string[];

            // Delete original keys from token
            delete token.originalSub;
            delete token.originalRole;
            delete token.originalBusinessId;
            delete token.originalBusinessName;
            delete token.originalBusinessType;
            delete token.originalTrialEndDate;
            delete token.originalPermissions;
          }
        }
      } catch (error) {
        console.error("SERVER AUTH: Impersonation Cookie Error:", error);
      }

      return token;
    },
  },
});
