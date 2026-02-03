import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Tambahkan Kopi Susu Creamy jika belum ada
    const existing = await prisma.togomenu.findFirst({
      where: { name: 'Kopi Susu Creamy' }
    });
    
    if (!existing) {
      await prisma.togomenu.create({
        data: {
          name: 'Kopi Susu Creamy',
          price: 15000,
          description: 'Espresso dengan susu creamy khas Barizta',
          icon: '☕',
          isActive: true,
          order: 0
        }
      });
      console.log('✅ Menu "Kopi Susu Creamy" berhasil ditambahkan!\n');
    }
    
    // Tampilkan semua menu
    const menus = await prisma.togomenu.findMany({
      orderBy: { order: 'asc' }
    });
    
    console.log('Total ToGo Menu:', menus.length);
    console.log('\nDaftar Menu Barizta To Go:');
    console.log('='.repeat(60));
    
    menus.forEach((m, i) => {
      const status = m.isActive ? '✓ Active' : '✗ Inactive';
      console.log(`${i+1}. ${m.name}`);
      console.log(`   Harga: Rp ${m.price.toLocaleString('id-ID')}`);
      console.log(`   Status: ${status}`);
      console.log(`   Icon: ${m.icon}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
