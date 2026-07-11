const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany();
  console.log('Patients count:', patients.length);
  if (patients.length > 0) {
    console.log(patients.map(p => ({ id: p.id, name: p.name, businessId: p.businessId })));
  }

  const users = await prisma.user.findMany();
  console.log('Users count:', users.length);
  if (users.length > 0) {
    console.log(users.map(u => ({ id: u.id, name: u.name, businessId: u.businessId })));
  }
}

main().finally(() => prisma.$disconnect());
