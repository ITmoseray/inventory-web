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
  console.log('🚀 Starting Admin Permission Fix...');

  const allPermissions = await prisma.permission.findMany();
  if (allPermissions.length === 0) {
    console.error('❌ No permissions found in database. Run seed_permissions.ts first.');
    return;
  }

  const targetRoles = await prisma.role.findMany({
    where: { 
      OR: [
        { name: 'ADMIN' },
        { name: 'SUPERADMIN' }
      ]
    }
  });

  console.log(`🔍 Found ${targetRoles.length} target roles (ADMIN/SUPERADMIN).`);

  for (const role of targetRoles) {
    await prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          set: allPermissions.map(p => ({ id: p.id }))
        }
      }
    });
    console.log(`✅ Assigned ${allPermissions.length} permissions to role: ${role.name} (${role.id})`);
  }

  console.log('🏁 Admin Permission Fix complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
