import { getPublicReceipt } from './src/lib/actions/public-receipt.ts';
import { prisma } from './src/lib/prisma.ts';

async function test() {
  const latestSales = await prisma.sale.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  console.log("Latest Sales:");
  for (const sale of latestSales) {
    console.log(sale.id, sale.invoiceNumber);
    
    // Try to get public receipt
    const receipt = await getPublicReceipt(sale.id);
    if (!receipt) {
      console.log("FAILED to generate receipt for", sale.id);
    } else {
      console.log("SUCCESS for", sale.id);
    }
  }
}

test().catch(console.error);
