// Script untuk bersihkan data test/sample sebelum import MySQL
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTestData() {
  console.log('\n🧹 Membersihkan data test/sample...\n');
  
  try {
    // Hapus data test dari seeding sebelumnya
    
    // 1. Hapus products test (yang punya slug *-seed)
    const deletedProducts = await prisma.product.deleteMany({
      where: {
        slug: {
          contains: '-seed'
        }
      }
    });
    console.log(`✅ Hapus ${deletedProducts.count} product test`);
    
    // 2. Hapus categories test (Signature, Special, Klasik) jika tidak ada di MySQL
    const testCategories = await prisma.category.deleteMany({
      where: {
        slug: {
          in: ['signature', 'special', 'klasik']
        }
      }
    });
    console.log(`✅ Hapus ${testCategories.count} category test`);
    
    // 3. Hapus team test (JACKSON, WAHYU TRIWIBOWO, FELIX FERNANDO) - cek by name
    const testTeam = await prisma.team.deleteMany({
      where: {
        name: {
          in: ['JACKSON', 'WAHYU TRIWIBOWO', 'FELIX FERNANDO']
        }
      }
    });
    console.log(`✅ Hapus ${testTeam.count} team member test`);
    
    // 4. Hapus news test
    const testNews = await prisma.news.deleteMany({
      where: {
        title: {
          in: ['Grand Opening BARIZTA', 'Coffee Cupping Workshop', 'Kolaborasi dengan Seniman Lokal']
        }
      }
    });
    console.log(`✅ Hapus ${testNews.count} news test`);
    
    // 5. Hapus user test (member@barizta.com) - keep admin if exists
    const testUsers = await prisma.user.deleteMany({
      where: {
        email: {
          in: ['member@barizta.com']
        }
      }
    });
    console.log(`✅ Hapus ${testUsers.count} user test`);
    
    console.log('\n✅ Data test berhasil dibersihkan!');
    console.log('💡 Data dari MySQL import tetap tersimpan\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanTestData()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
