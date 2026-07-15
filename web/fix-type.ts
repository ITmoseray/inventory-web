import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  const latestBusiness = await prisma.business.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  if (latestBusiness) {
    console.log('Found latest business:', latestBusiness.name, 'Type:', latestBusiness.type);
    if (latestBusiness.type === 'SHOP') {
      await prisma.business.update({
        where: { id: latestBusiness.id },
        data: { type: 'SCHOOL' }
      });
      console.log('Updated to SCHOOL!');
    } else {
      console.log('Already SCHOOL!');
    }
  }
}

fix()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
