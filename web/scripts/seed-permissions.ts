import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool as PgPool } from "pg";
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  const pool = new PgPool({ connectionString, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const prisma = createPrismaClient();

async function main() {
  const configDir = path.join(__dirname, '../src/lib/sidebar-configs');
  const files = fs.readdirSync(configDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

  const permissions = new Set<string>();

  for (const file of files) {
    const content = fs.readFileSync(path.join(configDir, file), 'utf8');
    const regex = /permission:\s*["']([^"']+)["']/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      permissions.add(match[1]);
    }
  }

  const allPermissions = Array.from(permissions);
  console.log(`Found ${allPermissions.length} unique permissions from sidebar configs.`);

  for (const key of allPermissions) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  console.log('✅ Seeded permissions successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
