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
