import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Standard configuration for Neon serverless
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize Neon Pool
// prisma.config.ts handles DATABASE_URL from environment variables
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Tenant-scoped prisma
export const getTenantPrisma = (businessId: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (model === 'Business' || model === 'Permission') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
        async findUnique({ model, args, query }) {
          if (model === 'Business' || model === 'Permission') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (model === 'Business' || model === 'Permission') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
        async update({ model, args, query }) {
          if (model === 'Business' || model === 'Permission') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
        async delete({ model, args, query }) {
          if (model === 'Business' || model === 'Permission') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
        async count({ model, args, query }) {
          if (model === 'Business' || model === 'Permission') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
      },
    },
  });
};
