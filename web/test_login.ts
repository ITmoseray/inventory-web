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
  connectionString
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'strangesteven001@gmail.com';
  const password = 'Trovegs35@';
  
  console.log(`Checking login for ${email}...`);
  
  const user = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: { equals: email.trim(), mode: 'insensitive' } },
        { username: { equals: email.trim(), mode: 'insensitive' } }
      ]
    },
    include: { role: true }
  });

  if (!user) {
    console.log("User not found!");
    return;
  }
  
  console.log(`User found: ${user.email}, Role: ${user.role.name}, Status: ${user.status}`);
  
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  console.log(`Password match: ${passwordMatch}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
