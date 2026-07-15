const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log("Connected to Neon.");
    
    await client.query('ALTER TABLE "SchoolStudent" ADD COLUMN IF NOT EXISTS "guardianName" TEXT;');
    await client.query('ALTER TABLE "SchoolStudent" ADD COLUMN IF NOT EXISTS "guardianPhone" TEXT;');
    await client.query('ALTER TABLE "SchoolStudent" ADD COLUMN IF NOT EXISTS "guardianEmail" TEXT;');
    await client.query('ALTER TABLE "SchoolStudent" ADD COLUMN IF NOT EXISTS "guardianRelation" TEXT;');
    await client.query('ALTER TABLE "SchoolStudent" ADD COLUMN IF NOT EXISTS "bloodGroup" TEXT;');
    await client.query('ALTER TABLE "SchoolStudent" ADD COLUMN IF NOT EXISTS "medicalConditions" TEXT;');
    await client.query('ALTER TABLE "SchoolStudent" ADD COLUMN IF NOT EXISTS "currentLevel" TEXT;');
    
    console.log("Successfully added new columns to SchoolStudent.");
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fix();
