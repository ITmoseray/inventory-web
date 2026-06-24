const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  // Load DATABASE_URL from .env file if not present in process.env
  if (!process.env.DATABASE_URL) {
    try {
      const envPath = path.resolve(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
        if (match && match[1]) {
          process.env.DATABASE_URL = match[1];
        }
      }
    } catch (err) {
      console.error("Failed to read local .env file:", err);
    }
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("No DATABASE_URL found. Skipping pre-build database migration.");
    return;
  }

  console.log("Found DATABASE_URL. Connecting to database to migrate PREMIUM plans...");

  const isLocal = dbUrl.includes('sslmode=disable') || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
  const client = new Client({
    connectionString: dbUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Successfully connected to database. Running updates...");

    // Check if the SubscriptionPlan type exists
    const checkTypeExists = await client.query(`
      SELECT 1 FROM pg_type WHERE typname = 'SubscriptionPlan'
    `);
    
    if (checkTypeExists.rowCount > 0) {
      console.log("SubscriptionPlan type exists. Checking for new enum values...");

      // Check and add 'ENTERPRISE'
      const checkEnterprise = await client.query(`
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'SubscriptionPlan' AND e.enumlabel = 'ENTERPRISE'
      `);
      if (checkEnterprise.rowCount === 0) {
        console.log("Adding 'ENTERPRISE' value to SubscriptionPlan enum...");
        await client.query('ALTER TYPE "SubscriptionPlan" ADD VALUE \'ENTERPRISE\'');
      }

      // Check and add 'BUSINESS'
      const checkBusiness = await client.query(`
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'SubscriptionPlan' AND e.enumlabel = 'BUSINESS'
      `);
      if (checkBusiness.rowCount === 0) {
        console.log("Adding 'BUSINESS' value to SubscriptionPlan enum...");
        await client.query('ALTER TYPE "SubscriptionPlan" ADD VALUE \'BUSINESS\'');
      }
    } else {
      console.log("SubscriptionPlan enum type does not exist yet. Skipping enum values check.");
    }

    // Update Business table
    const res1 = await client.query('UPDATE "Business" SET plan = \'ENTERPRISE\' WHERE plan::text = \'PREMIUM\'');
    console.log(`Updated ${res1.rowCount} businesses from PREMIUM to ENTERPRISE.`);

    // Update Subscription table
    const res2 = await client.query('UPDATE "Subscription" SET plan = \'ENTERPRISE\' WHERE plan::text = \'PREMIUM\'');
    console.log(`Updated ${res2.rowCount} subscriptions from PREMIUM to ENTERPRISE.`);

    console.log("Pre-build database migration completed successfully.");
  } catch (error) {
    console.error("Error during pre-build database migration:", error);
    // Do not throw error here to allow build process to continue if database is already in sync or not accessible yet
  } finally {
    await client.end();
  }
}

run();
