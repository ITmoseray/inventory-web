const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Trovegs35@localhost:5432/inventory_db?schema=public&sslmode=disable' });

async function check() {
  const res = await pool.query("SELECT name, \"createdAt\", \"trialEndDate\" FROM \"Business\" ORDER BY \"createdAt\" DESC LIMIT 5");
  console.log("Recent Businesses:");
  for (const row of res.rows) {
    console.log(`- ${row.name}: createdAt=${row.createdAt}, trialEndDate=${row.trialEndDate}`);
  }
  pool.end();
}
check().catch(console.error);
