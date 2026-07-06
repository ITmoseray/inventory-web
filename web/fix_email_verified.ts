import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool as PgPool } from "pg";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Override to use remote DB
const connectionString = "postgresql://protech_db_v423_user:CCTeFeHeqPlJpTKwFxm6YLy5sh0KxSoH@dpg-d8mnu7po3t8c73c21n30-a.virginia-postgres.render.com/protech_db_v423?sslmode=require";

const pool = new PgPool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Fixing emailVerified for existing users ---');

  // Find all active users who have no emailVerified and no pending verificationToken
  // (i.e., they were created directly, not through the registration flow)
  const usersToFix = await prisma.user.findMany({
    where: {
      emailVerified: null,
      status: 'active',
    },
    select: { id: true, email: true, role: true, verificationToken: true }
  });

  console.log(`Found ${usersToFix.length} users with emailVerified = null`);
  usersToFix.forEach(u => {
    console.log(`  - ${u.email} | role: ${u.role.name} | hasToken: ${!!u.verificationToken}`);
  });

  // Only auto-verify users who have NO pending verificationToken
  // (users with a token must click the link themselves)
  const toAutoVerify = usersToFix.filter(u => !u.verificationToken);
  console.log(`\nAuto-verifying ${toAutoVerify.length} users (no pending token)...`);

  for (const user of toAutoVerify) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });
    console.log(`  ✅ Verified: ${user.email}`);
  }

  const skipped = usersToFix.filter(u => !!u.verificationToken);
  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} users (still have pending verification token):`);
    skipped.forEach(u => console.log(`  ⏳ ${u.email}`));
  }

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
