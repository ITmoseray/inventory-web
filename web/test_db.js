const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('🚀 Testing Database Connection...');
  console.log('Environment: DATABASE_URL is', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

  const prisma = new PrismaClient();

  try {
    // Attempt to connect and run a simple query
    await prisma.$connect();
    console.log('✅ Successfully connected to the database.');

    // Count businesses as a simple check
    const businessCount = await prisma.business.count();
    console.log(`📊 Found ${businessCount} businesses in the database.`);

  } catch (e) {
    console.error('❌ Connection failed!');
    console.error('Error details:', e.message);
    if (e.code) console.error('Error code:', e.code);
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Ensure DATABASE_URL is set in Render Environment Variables.');
    console.log('2. If using Neon, ensure the URL ends with ?sslmode=require.');
    console.log('3. Ensure your database allows connections from Render IPs.');
  } finally {
    await prisma.$disconnect();
  }
}

main();
