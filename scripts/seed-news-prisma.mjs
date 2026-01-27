import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(){
  const samples = [
    {
      title: 'Grand Opening BARIZTA',
      category: 'event',
      content: 'BARIZTA resmi membuka pintu pertama kali dengan konsep modern dan ramah lingkungan.',
      excerpt: 'BARIZTA resmi membuka pintu pertama kali. Dapatkan promo dan diskon selama opening weekend!',
      image: '/images/news/opening.jpg',
      author: 'Admin',
      publishDate: new Date('2024-10-15'),
      status: 'published',
      views: 0,
    },
    {
      title: 'Coffee Cupping Workshop',
      category: 'event',
      content: 'Ikuti workshop cupping untuk memahami karakteristik dan cita rasa berbagai jenis kopi.',
      excerpt: 'Pelajari teknik cupping dan cara mengevaluasi kopi dengan metode profesional.',
      image: '/images/news/cupping.jpg',
      author: 'Admin',
      publishDate: new Date('2024-10-25'),
      status: 'published',
      views: 0,
    },
    {
      title: 'Kolaborasi dengan Seniman Lokal',
      category: 'info',
      content: 'Pameran karya seni lokal sambil menikmati kopi; dukung talenta kreatif daerah!',
      excerpt: 'Kolaborasi dengan seniman lokal berlangsung di Barizta untuk bulan November',
      image: '/images/news/art-collab.jpg',
      author: 'Admin',
      publishDate: new Date('2024-11-05'),
      status: 'published',
      views: 0,
    },
  ];

  for (const s of samples) {
    const exists = await prisma.news.findFirst({ where: { title: s.title } });
    if (!exists) {
      const created = await prisma.news.create({ data: s });
      console.log('created news', created.id, created.title);
    } else {
      console.log('exists news', exists.id, exists.title);
    }
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
