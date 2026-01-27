import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(){
  const samples = [
    { name: 'JACKSON', position: 'Komisaris Utama & Pemegang Saham', photo: '/logo.png', bio: '', order: 1 },
    { name: 'WAHYU TRIWIBOWO', position: 'Direktur Keuangan', photo: '/logo.png', bio: '', order: 2 },
    { name: 'FELIX FERNANDO', position: 'Direktur Utama', photo: '/logo.png', bio: '', order: 3 },
  ];

  for(const s of samples){
    const exists = await prisma.team.findFirst({ where: { name: s.name } });
    if (!exists) {
      const created = await prisma.team.create({ data: s });
      console.log('created team', created.id, created.name);
    } else {
      console.log('exists team', exists.id, exists.name);
    }
  }
}

main()
  .catch((e)=>{ console.error(e); process.exit(1); })
  .finally(()=>prisma.$disconnect());
