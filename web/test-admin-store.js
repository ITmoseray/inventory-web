const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Trovegs35@localhost:5432/inventory_db?schema=public&sslmode=disable' });

async function check() {
  const res = await pool.query("SELECT name, \"trialEndDate\", \"createdAt\" FROM \"Business\" WHERE name = 'Admin'");
  console.log("Admin Stores:");
  for (const row of res.rows) {
    const expired = row.trialEndDate ? new Date(row.trialEndDate) < new Date() : false;
    console.log(`- ${row.name}: trialEndDate=${row.trialEndDate}, expired=${expired}`);
  }
  pool.end();
}
check().catch(console.error);
