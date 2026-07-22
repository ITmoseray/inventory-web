const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.systemSetting.upsert({
    where: { id: 'singleton' },
    update: { 
      announcementBanner: 'Notice: The inventory is currently on shop outreach.', 
      announcementBannerUpdatedAt: new Date().toISOString() 
    },
    create: { 
      id: 'singleton', 
      announcementBanner: 'Notice: The inventory is currently on shop outreach.', 
      announcementBannerUpdatedAt: new Date().toISOString(), 
      registrationOpen: true, 
      defaultTrialDays: 7, 
      emailAlertsEnabled: true 
    }
  });
  console.log('Banner updated!');
  await prisma.$disconnect();
}
run();
