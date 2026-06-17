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
  console.log('--- All Users Check ---');
  const users = await prisma.user.findMany({
    include: { role: true, business: true }
  });

  console.log(`Total users: ${users.length}`);
  users.forEach(u => {
    console.log(`- ${u.email} (${u.role.name}) [Status: ${u.status}] Business: ${u.business.name}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
