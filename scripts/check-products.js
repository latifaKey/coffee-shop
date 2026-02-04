const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkProducts() {
  const products = await p.product.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
    take: 20
  });
  console.log('Products in local DB:');
  products.forEach(prod => {
    console.log(`  ID ${prod.id}: ${prod.name}`);
  });
  console.log(`\nTotal: ${products.length} products`);
  await p.$disconnect();
}

checkProducts();
