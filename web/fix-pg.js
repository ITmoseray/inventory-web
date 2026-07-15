const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log("Connected to Neon.");
    
    // Get latest business
    const res = await client.query('SELECT id, name, type FROM "Business" ORDER BY "createdAt" DESC LIMIT 1');
    if (res.rows.length > 0) {
      const latest = res.rows[0];
      console.log('Latest Business:', latest.name, '| Current Type:', latest.type);
      
      if (latest.type !== 'SCHOOL') {
        await client.query('UPDATE "Business" SET type = $1 WHERE id = $2', ['SCHOOL', latest.id]);
        console.log('Successfully updated business type to SCHOOL.');
        
        // Let's also update the associated user role/businessType just in case we need it
        // Actually, user doesn't have businessType in the schema, it fetches from business relation.
      } else {
        console.log('Business is already a SCHOOL. Make sure you log out and log back in to refresh your session!');
      }
    } else {
      console.log('No businesses found.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fix();
