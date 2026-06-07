const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      where: { imageUrl: { not: null } },
      select: { name: true, imageUrl: true },
      take: 10
    });
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error("Prisma Error:", err.message);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
