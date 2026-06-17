import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool as PgPool } from "pg";
import bcrypt from 'bcrypt';
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
  const targetEmail = 'strangesteven001@gmail.com';
  const newPassword = 'Trovegs34@';
  
  console.log(`🚀 Promoting ${targetEmail} to SUPERADMIN in the live database...`);

  // 1. Get or Create System Business
  const systemBusiness = await prisma.business.upsert({
    where: { slug: 'protech-nexus-core' },
    update: {},
    create: {
      name: 'Protech Assist SL Limited Super Admin Hub',
      slug: 'protech-nexus-core',
      type: 'SHOP',
      plan: 'PREMIUM',
      status: 'active',
      enabledModules: ['POS', 'INVENTORY', 'RESTAURANT'],
    },
  });

  // 2. Get or Create SUPERADMIN role
  const superAdminRole = await prisma.role.upsert({
    where: { businessId_name: { businessId: systemBusiness.id, name: 'SUPERADMIN' } },
    update: {},
    create: {
      name: 'SUPERADMIN',
      businessId: systemBusiness.id,
    },
  });

  // 3. Upsert the user as SUPERADMIN
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.upsert({
    where: { email: targetEmail },
    update: {
      roleId: superAdminRole.id,
      businessId: systemBusiness.id,
      passwordHash: hashedPassword,
      status: 'active'
    },
    create: {
      email: targetEmail,
      name: 'Dr. Strange Admin',
      passwordHash: hashedPassword,
      roleId: superAdminRole.id,
      businessId: systemBusiness.id,
      status: 'active'
    },
  });

  console.log(`✅ Success! ${user.email} is now a SUPERADMIN.`);
  console.log(`🔑 Password is set to: ${newPassword}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
