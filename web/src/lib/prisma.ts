import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Standard configuration for Neon serverless
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

// DIAGNOSTIC LOG
console.log("--- DIAGNOSTIC: Checking DATABASE_URL ---");
console.log("DATABASE_URL is set:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL prefix:", process.env.DATABASE_URL.substring(0, 15) + "...");
} else {
  console.error("CRITICAL: DATABASE_URL is NOT defined in process.env!");
}
// END DIAGNOSTIC

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

const prismaClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;

export const getTenantPrisma = (businessId: string) => {
  return prismaClient.$extends({
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

export const prisma = prismaClient;
