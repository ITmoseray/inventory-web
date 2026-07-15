const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const latestBusinesses = await prisma.business.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  console.log("Recent Businesses:", latestBusinesses.map(b => ({ id: b.id, name: b.name, type: b.type })));
  
  const latestUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: { business: true }
  });
  console.log("Recent Users:", latestUsers.map(u => ({ email: u.email, businessType: u.business?.type })));
}

check()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
