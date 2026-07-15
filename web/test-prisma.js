require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const business = await prisma.business.findUnique({ where: { slug: 'protech-nexus-core' } }); 
  console.log('business:', business); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
