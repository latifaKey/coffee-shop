import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCoffeeBusinessDescription() {
  const description = `Kelas khusus untuk calon entrepreneur dan pemilik coffee shop yang ingin mengembangkan bisnis kopi.

📚 Materi yang akan dipelajari:
• Analisis pasar dan peluang bisnis kopi
• Pengembangan menu dan signature drinks
• Perhitungan HPP dan strategi pricing
• Manajemen operasional coffee shop
• Branding dan marketing bisnis kopi
• SOP barista dan quality control`;

  await prisma.renamedclass.update({
    where: { id: 5 },
    data: { description }
  });
  
  console.log('✅ Deskripsi kelas "Coffee Business & Menu Development" berhasil diupdate!');
}

updateCoffeeBusinessDescription()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
