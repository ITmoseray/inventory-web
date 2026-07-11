const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany();
  console.log('Patients array:', patients);
}
main().catch(console.error);
