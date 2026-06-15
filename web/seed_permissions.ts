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
  const permissions = [
    // 1. Overview
    { key: "menu:overview" },

    // 2. Intelligence Hub
    { key: "menu:intelligence:hub" },
    { key: "menu:intelligence:analytics" },
    { key: "menu:intelligence:reports" },
    { key: "menu:intelligence:supply_chain" },
    
    // 3. Inventory
    { key: "menu:inventory" },
    { key: "menu:inventory:products" },
    { key: "menu:inventory:network" },
    { key: "menu:inventory:categories" },
    { key: "menu:inventory:batches" },
    { key: "menu:inventory:history" },
    { key: "menu:inventory:expiry" },
    
    // 4. Purchases
    { key: "menu:purchases" },
    { key: "menu:purchases:suppliers" },
    { key: "menu:purchases:orders" },
    { key: "menu:purchases:returns" },
    
    // 5. Commerce (Sales)
    { key: "menu:sales" },
    { key: "menu:sales:pos" },
    { key: "menu:sales:history" },
    { key: "menu:sales:orders" },
    { key: "menu:sales:credit" },
    { key: "menu:sales:returns" },
    
    // 6. Relationships (Customers)
    { key: "menu:customers" },
    { key: "menu:customers:registry" },
    { key: "menu:customers:loyalty" },
    { key: "menu:customers:profiles" },
    
    // 7. Finance (Accounting)
    { key: "menu:accounting" },
    { key: "menu:accounting:expenses" },
    { key: "menu:accounting:pl" },
    { key: "menu:accounting:cashflow" },
    { key: "menu:accounting:billing" },
    
    // 8. Administrative (Team/HR)
    { key: "menu:staff" },
    { key: "menu:staff:employees" },
    { key: "menu:staff:attendance" },
    { key: "menu:staff:payroll" },
    
    // 9. System
    { key: "menu:system" },
    { key: "menu:system:logs" },
    { key: "menu:system:notifications" },
    { key: "menu:system:settings" },
    { key: "menu:system:permissions" },
    { key: "menu:system:integrations" },
    
    // 10. Bar Specific
    { key: "menu:bar:tabs" },
    { key: "menu:bar:tables" },
    { key: "menu:bar:reservations" },
    { key: "menu:bar:happy-hour" },
    { key: "menu:bar:orders" },

    // 11. Pharmacy Specific
    { key: "menu:prescriptions" },
    { key: "menu:patients" },

    // 12. Restaurant Specific
    { key: "menu:kitchen" },
    { key: "menu:tables" },
    { key: "menu:reservations" },
    { key: "menu:recipes" },
    
    // 13. Support
    { key: "menu:support" },
    { key: "menu:support:manual" },
    { key: "menu:support:pricing" },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: { key: p.key },
    });
  }
  
  // Cleanup old keys if any (optional but good for consistency)
  const allPerms = await prisma.permission.findMany();
  const validKeys = permissions.map(p => p.key);
  for (const p of allPerms) {
    if (!validKeys.includes(p.key)) {
      console.log(`Removing obsolete permission: ${p.key}`);
      await prisma.permission.delete({ where: { id: p.id } });
    }
  }

  console.log('✅ Permissions seeded and synchronized.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
