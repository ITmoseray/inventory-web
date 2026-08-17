require('dotenv').config();
const { Pool } = require('pg');

async function createTable() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is missing");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Creating SystemBackup table if not exists in Neon...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "SystemBackup" (
        "id" TEXT NOT NULL,
        "filename" TEXT NOT NULL,
        "sizeBytes" INTEGER NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'MANUAL',
        "data" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SystemBackup_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "SystemBackup_filename_key" ON "SystemBackup"("filename");
      CREATE INDEX IF NOT EXISTS "SystemBackup_createdAt_idx" ON "SystemBackup"("createdAt");
    `);
    console.log("✅ SystemBackup table verified/created in Neon PostgreSQL!");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await pool.end();
  }
}

createTable();
