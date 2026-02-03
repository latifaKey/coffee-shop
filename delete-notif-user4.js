const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const result = await prisma.notification.deleteMany({
      where: { userId: 4 }
    });
    console.log(`✅ Berhasil menghapus ${result.count} notifikasi untuk userId 4`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
