import * as dotenv from 'dotenv';
dotenv.config({ path: 'web/.env' });
import { prisma } from '../src/lib/prisma';

async function checkUserPermissions() {
  const email = 'strangesteven001@gmail.com';
  console.log(`Checking permissions for: ${email}`);
  
  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      role: {
        include: { permissions: true }
      }
    }
  });

  if (!user) {
    console.log('User not found.');
    return;
  }

  console.log('User Found:', user.email);
  console.log('Role Name:', user.role?.name);
  console.log('Permissions Found:', user.role?.permissions?.length || 0);
  
  if (user.role?.permissions) {
    user.role.permissions.forEach(p => console.log('Permission:', p.key));
  }
}

checkUserPermissions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
