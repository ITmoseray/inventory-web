import { prisma } from './src/lib/prisma';
prisma.user.findUnique({
  where: { email: 'strangesteven001@gmail.com' },
  include: { business: true, role: { include: { permissions: true } } }
}).then(u => {
  console.log(JSON.stringify(u, null, 2));
  process.exit(0);
});
