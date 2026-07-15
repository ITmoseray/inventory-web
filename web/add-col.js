const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log("Connected to Neon.");
    
    await client.query('ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "institutionType" TEXT;');
    console.log("Successfully added institutionType column.");
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fix();
