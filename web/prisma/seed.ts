import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import ws from "ws";
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set for seeding.");
  }

  const pool = new PgPool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
};

const prisma = createPrismaClient();

async function main() {
  console.log('🚀 Starting Super Admin seeding...');
  
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@protechnexus.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('❌ Error: SUPER_ADMIN_PASSWORD environment variable is not set.');
    console.log('💡 Tip: Set this in your Render environment variables.');
    process.exit(1);
  }

  try {
    // 1. Create a System Business
    const systemBusiness = await prisma.business.upsert({
      where: { slug: 'protech-nexus-core' },
      update: {},
      create: {
        name: 'Protech Assist SL Limited Super Admin Hub',
        slug: 'protech-nexus-core',
        type: 'SHOP',
        plan: 'ENTERPRISE',
        status: 'active',
        enabledModules: ['POS', 'INVENTORY', 'RESTAURANT'],
      },
    });

    // 2. Create SUPERADMIN role
    const superAdminRole = await prisma.role.upsert({
      where: { businessId_name: { businessId: systemBusiness.id, name: 'SUPERADMIN' } },
      update: {},
      create: {
        name: 'SUPERADMIN',
        businessId: systemBusiness.id,
      },
    });

    // 3. Create/Update Super Admin User
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        roleId: superAdminRole.id,
        passwordHash: hashedPassword,
      },
      create: {
        email: adminEmail,
        name: 'Nexus System Admin',
        passwordHash: hashedPassword,
        roleId: superAdminRole.id,
        businessId: systemBusiness.id,
      },
    });

    console.log('✅ Super Admin account seeded successfully.');
    console.log(`👤 Email: ${adminEmail}`);
  } catch (error) {
    console.error('❌ Failed to seed Super Admin:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Unexpected error in seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
