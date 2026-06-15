import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import ws from "ws";

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  let adapter;
  if (connectionString.includes("neon.tech")) {
    neonConfig.webSocketConstructor = ws;
    const pool = new NeonPool({ connectionString });
    adapter = new PrismaNeon(pool);
  } else {
    const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
    const pool = new PgPool({ 
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false }
    });
    adapter = new PrismaPg(pool);
  }

  return new PrismaClient({ adapter });
};

const prisma = createPrismaClient();

async function main() {
  console.log('📊 Diagnostic: Role & Permission Audit');

  const roles = await prisma.role.findMany({
    include: {
      _count: {
        select: { permissions: true }
      },
      business: true
    }
  });

  console.log(`🔍 Total Roles Found: ${roles.length}`);
  
  roles.forEach(role => {
    console.log(`- Role: [${role.name}] | Business: [${role.business?.name ?? 'No Business'}] | ID: ${role.id} | Permissions: ${role._count.permissions}`);
  });

  const users = await prisma.user.findMany({
    include: {
      role: true
    }
  });

  console.log(`\n👤 Total Users Found: ${users.length}`);
  users.forEach(user => {
    console.log(`- User: [${user.email}] | Role: [${user.role.name}]`);
  });

  console.log('\n🏁 Audit complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
