const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true, name: true, email: true, role: true }
  });
  console.log('Admin users:', JSON.stringify(admins, null, 2));
  
  // Also show all users count
  const total = await prisma.user.count();
  console.log('Total users:', total);
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
  });
