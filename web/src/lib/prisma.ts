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
    ssl: isLocal ? false : { rejectUnauthorized: false },
    // Prevent "Connection terminated unexpectedly" from Neon idle timeouts:
    // Neon drops idle connections after ~5 min; we evict them at 4 min to avoid stale sockets.
    idleTimeoutMillis: 240_000,       // remove idle connections after 4 min
    connectionTimeoutMillis: 10_000,  // fail fast if can't connect within 10 s
    keepAlive: true,                  // TCP keepalive to detect dropped connections early
    max: 5,                           // keep pool small for serverless workloads
  });

  // Prevent unhandled errors from killing the process when a pool connection is lost
  pool.on("error", (err) => {
    console.error("⚠️ Unexpected pg pool error (non-fatal):", err.message);
  });

  const adapter = new PrismaPg(pool);
  console.log(`🐘 Using Standard Postgres Driver Adapter (${isLocal ? 'local' : 'remote'})`);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
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
