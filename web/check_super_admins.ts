import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool as PgPool } from "pg";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new PgPool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Super Admin Check ---');
  const superAdminRole = await prisma.role.findFirst({
    where: { name: 'SUPERADMIN' }
  });

  if (!superAdminRole) {
    console.log('SUPERADMIN role not found.');
  } else {
    console.log(`SUPERADMIN Role ID: ${superAdminRole.id}`);
    const users = await prisma.user.findMany({
      where: { roleId: superAdminRole.id },
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
        businessId: true
      }
    });

    if (users.length === 0) {
      console.log('No users found with SUPERADMIN role.');
    } else {
      console.log('Super Admin Users:');
      users.forEach(u => console.log(`- Email: ${u.email}, Username: ${u.username}, Status: ${u.status}`));
    }
  }

  console.log('\n--- Specific User Check ---');
  const specificUser = await prisma.user.findUnique({
    where: { email: 'strangesteven001@gmail.com' },
    include: { role: true }
  });

  if (specificUser) {
    console.log(`User strangesteven001@gmail.com found:`);
    console.log(`- Role: ${specificUser.role.name}`);
    console.log(`- Status: ${specificUser.status}`);
  } else {
    console.log(`User strangesteven001@gmail.com NOT found.`);
  }

  console.log('\n--- All Roles ---');
  const roles = await prisma.role.findMany();
  roles.forEach(r => console.log(`- Role: ${r.name}, ID: ${r.id}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
