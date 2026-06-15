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
  const email = 'strangesteven001@gmail.com';
  console.log(`🕵️ Deep Audit for User: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: true
        }
      }
    }
  });

  if (!user) {
    console.error('❌ User not found!');
    return;
  }

  console.log(`✅ User ID: ${user.id}`);
  console.log(`✅ Role: ${user.role.name} (ID: ${user.role.id})`);
  console.log(`✅ Permissions Count: ${user.role.permissions.length}`);
  
  if (user.role.permissions.length > 0) {
    console.log('📜 First 5 Permission Keys:');
    user.role.permissions.slice(0, 5).forEach(p => console.log(`  - ${p.key}`));
  } else {
    console.warn('⚠️ THIS ROLE HAS NO PERMISSIONS LINKED!');
  }

  console.log('\n🏁 Deep Audit complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
