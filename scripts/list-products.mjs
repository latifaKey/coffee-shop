import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async ()=>{
  const products = await prisma.product.findMany();
  console.log(products);
  await prisma.$disconnect();
})();
