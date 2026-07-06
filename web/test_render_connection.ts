import { Client } from 'pg';

async function main() {
  const connectionString = "postgresql://protech_db_v423_user:CCTeFeHeqPlJpTKwFxm6YLy5sh0KxSoH@dpg-d8mnu7po3t8c73c21n30-a.virginia-postgres.render.com/protech_db_v423?sslmode=require";
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query("SELECT NOW()");
    console.log("Result:", res.rows[0]);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await client.end();
  }
}

main();
