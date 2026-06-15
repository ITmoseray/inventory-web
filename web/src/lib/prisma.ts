import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import ws from "ws";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // During build, DATABASE_URL might be missing. 
    // We can return a dummy or just let it fail if it's actually needed.
    // For Next.js build, we might need to handle this gracefully.
    return new PrismaClient({
      log: ["error"],
    });
  }

  let adapter;
  if (connectionString.includes("neon.tech")) {
    neonConfig.webSocketConstructor = ws;
    const pool = new NeonPool({ connectionString });
    adapter = new PrismaNeon(pool);
  } else {
    const pool = new PgPool({ connectionString });
    adapter = new PrismaPg(pool);
  }

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma =
  globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Tenant-scoped prisma
export const getTenantPrisma = (businessId: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (model === 'Business' || model === 'Permission' || model === 'Role') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
        async findUnique({ model, args, query }) {
          if (model === 'Business' || model === 'Permission' || model === 'Role') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (model === 'Business' || model === 'Permission' || model === 'Role') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
        async update({ model, args, query }) {
          if (model === 'Business' || model === 'Permission' || model === 'Role') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
        async delete({ model, args, query }) {
          if (model === 'Business' || model === 'Permission' || model === 'Role') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
        async count({ model, args, query }) {
          if (model === 'Business' || model === 'Permission' || model === 'Role') return query(args);
          args.where = { ...args.where, businessId };
          return query(args);
        },
      },
    },
  });
};
