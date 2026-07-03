const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Trovegs35@localhost:5432/inventory_db?schema=public&sslmode=disable' });

async function check() {
  const res = await pool.query("SELECT name, email, \"businessId\" FROM \"User\" WHERE name = 'Admin'");
  console.log("Admin Users:");
  for (const row of res.rows) {
    const bRes = await pool.query("SELECT name, \"trialEndDate\" FROM \"Business\" WHERE id = $1", [row.businessId]);
    const b = bRes.rows[0];
    const expired = b && b.trialEndDate ? new Date(b.trialEndDate) < new Date() : false;
    console.log(`- User ${row.email}: Business=${b?.name}, trialEndDate=${b?.trialEndDate}, expired=${expired}`);
  }
  pool.end();
}
check().catch(console.error);
