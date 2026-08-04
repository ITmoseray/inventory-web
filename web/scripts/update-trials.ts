import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Fetching businesses with a trial...');
  
  // Also update SystemSetting to 30
  await prisma.systemSetting.updateMany({
    data: { defaultTrialDays: 30 },
  });
  console.log('Updated SystemSetting defaultTrialDays to 30.');

  const businesses = await prisma.business.findMany({
    where: {
      trialStartDate: { not: null },
    },
  });

  console.log(`Found ${businesses.length} businesses. Updating trialEndDate to 30 days...`);

  for (const business of businesses) {
    if (business.trialStartDate) {
      const newEndDate = new Date(business.trialStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      await prisma.business.update({
        where: { id: business.id },
        data: { trialEndDate: newEndDate },
      });
      console.log(`Updated business ${business.id}: Trial extended to ${newEndDate}`);
    }
  }

  console.log('Finished updating trials.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
