import { prisma } from './src/lib/prisma';

async function main() {
  const business = await prisma.business.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  console.log("LATEST BUSINESS:");
  console.log(business);
}

main().catch(console.error).finally(() => prisma.$disconnect());
