const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const b = await prisma.business.findFirst({ where: { slug: 'protech-nexus-core' } });
  console.log('Business:', b);
}

check()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
