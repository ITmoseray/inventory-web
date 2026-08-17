require('dotenv').config();
const { Pool } = require('pg');

async function testEngine() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  try {
    console.log("1. Fetching all user tables...");
    const tablesRes = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename != 'SystemBackup'
        AND tablename != '_prisma_migrations'
      ORDER BY tablename ASC;
    `);

    const tables = tablesRes.rows.map(r => r.tablename);
    console.log(`Found ${tables.length} tables in Neon.`);

    const dumpPayload = {
      metadata: {
        version: "2.0-cloud",
        createdAt: new Date().toISOString(),
        type: "MANUAL",
        totalTables: tables.length,
      },
      tables: {},
    };

    for (const table of tables) {
      const rowsRes = await pool.query(`SELECT * FROM "${table}"`);
      dumpPayload.tables[table] = rowsRes.rows;
    }

    const jsonData = JSON.stringify(dumpPayload);
    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `nexus-backup-${timestampStr}.json`;
    const sizeBytes = Buffer.byteLength(jsonData, "utf8");

    console.log(`2. Saving snapshot ${filename} (${(sizeBytes / 1024).toFixed(2)} KB) to SystemBackup table...`);

    const id = "bkp_" + Date.now();
    await pool.query(`
      INSERT INTO "SystemBackup" ("id", "filename", "sizeBytes", "type", "data", "createdAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT ("filename") DO NOTHING;
    `, [id, filename, sizeBytes, "MANUAL", jsonData]);

    console.log("3. Querying SystemBackup list from Neon...");
    const listRes = await pool.query(`
      SELECT "id", "filename", "sizeBytes", "type", "createdAt" 
      FROM "SystemBackup" 
      ORDER BY "createdAt" DESC;
    `);

    console.log("✅ Current Backups in Neon:", listRes.rows);
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await pool.end();
  }
}

testEngine();
