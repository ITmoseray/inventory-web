import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool as PgPool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL is not set. PrismaClient may fail at runtime.");
    return new PrismaClient({
      log: ["error"],
    });
  }

  // Mask sensitive info in log
  const maskedUrl = connectionString.replace(/:([^:@]+)@/, ":****@");
  console.log(`🔌 Initializing Prisma with connection: ${maskedUrl}`);

  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
  const pool = new PgPool({ 
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  console.log(`🐘 Using Standard Postgres Driver Adapter (${isLocal ? 'local' : 'remote'})`);

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
