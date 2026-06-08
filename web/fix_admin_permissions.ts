import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Starting Admin Permission Fix...');

  const allPermissions = await prisma.permission.findMany();
  if (allPermissions.length === 0) {
    console.error('❌ No permissions found in database. Run seed_permissions.ts first.');
    return;
  }

  const adminRoles = await prisma.role.findMany({
    where: { name: 'ADMIN' }
  });

  console.log(`🔍 Found ${adminRoles.length} ADMIN roles.`);

  for (const role of adminRoles) {
    await prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          set: allPermissions.map(p => ({ id: p.id }))
        }
      }
    });
    console.log(`✅ Assigned ${allPermissions.length} permissions to role: ${role.id} (${role.businessId})`);
  }

  console.log('🏁 Admin Permission Fix complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
