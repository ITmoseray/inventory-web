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
  const email = 'strangesteven001@gmail.com';
  const newPassword = 'Trovegs35@';
  
  console.log(`🔐 Resetting password for ${email}...`);
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash: hashedPassword }
  });

  console.log(`✅ Password successfully reset for ${user.email}.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
