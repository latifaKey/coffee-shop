import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(){
  const samples = [
    {
      name: 'BARIZTA Signature Latte (seed)',
      slug: 'barizta-signature-latte-seed',
      description: 'Latte spesial dari biji pilihan.',
      price: 28000,
      category: 'Signature',
      image: '/images/menu/signature-latte.jpg',
      isAvailable: true,
    },
    {
      name: 'V60 Single Origin (seed)',
      slug: 'v60-single-origin-seed',
      description: 'Manual brew single origin.',
      price: 30000,
      category: 'Special',
      image: '/images/menu/v60.jpg',
      isAvailable: true,
    },
    {
      name: 'Cappuccino Classic (seed)',
      slug: 'cappuccino-classic-seed',
      description: 'Klasik cappuccino dengan foam lembut.',
      price: 25000,
      category: 'Klasik',
      image: '/images/menu/cappuccino.jpg',
      isAvailable: true,
    },
  ];

  for(const s of samples){
    const exists = await prisma.product.findUnique({ where: { slug: s.slug } });
    if (!exists) {
      const created = await prisma.product.create({ data: s });
      console.log('created', created.id, created.name);
    } else {
      console.log('exists', exists.id, exists.name);
    }
  }
}

main()
  .catch((e)=>{ console.error(e); process.exit(1); })
  .finally(()=>prisma.$disconnect());
