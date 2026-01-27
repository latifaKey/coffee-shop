import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Daftar harga baru sesuai permintaan
const priceUpdates = {
  // HOT COFFEE
  'Espresso': 15000,
  'Black Coffee': 20000,
  'Piccolo': 20000,
  'Cappuccino': 22000,
  'Cafe Latte': 22000,
  'Magic': 25000,
  'Flavor Latte': 25000,
  'Caramel Macchiatto': 28000,
  
  // ICED COFFEE
  'Black Coffee (Iced)': 20000,
  'White Coffee': 23000,
  'Flavor Latte (Iced)': 25000,
  'Caramel Macchiatto (Iced)': 28000,
  'Affogato': 25000,
  
  // LOCAL SPECIALTY
  'LNIR': 18000,
  'Kopiku': 18000,
  'Sanger': 20000,
  'Buttery Kiss': 23000,
  
  // NON COFFEE
  'Ice Tea': 10000,
  'Lemon': 17000,
  'Lychee': 20000,
  'Strawberry': 20000,
  'Peach': 20000,
  'Cold Fusion': 25000,
  
  // SIGNATURE
  'Co Berrrr': 25000,
  'Redler Coffee': 25000,
  'Vanilla Orange': 25000,
  'Stronger Black Pink': 28000,
  
  // FRAPPE / BLENDED
  'Matcha Latte': 20000,
  'Dark Choco': 20000,
  'Red Velvet': 20000,
  'Taro': 20000,
  
  // MANUAL BREW
  'Pour Over': 25000,
  'Vietnam Dripp': 18000,
  'Cold Brew': 20000,
  
  // MAIN COURSE
  'Rice Bowl': 25000,
  'Ayam Geprek': 25000,
  'Nasi Ndogg / Sosis': 13000,
  'Indomie Telur': 15000,
  'Indomie Special': 20000,
  
  // SNACKS
  'French Fries': 15000,
  'Nugget': 15000,
  'Sosis': 15000,
  'Mix Platter': 20000,
  
  // BURGER
  'Egg Burger': 15000,
  'Chicken Burger': 20000,
  'Beef Burger': 25000,
};

async function updateMenuPrices() {
  console.log('🔄 Memulai update harga menu (tabel product)...\n');
  
  // Ambil semua menu saat ini dari tabel product
  const allMenus = await prisma.product.findMany({
    orderBy: { id: 'asc' },
    include: { category: true }
  });
  
  console.log(`📋 Total menu di database: ${allMenus.length}\n`);
  
  const updatedMenus = [];
  const unchangedMenus = [];
  const notFoundInList = [];
  
  for (const menu of allMenus) {
    const newPrice = priceUpdates[menu.name];
    
    if (newPrice !== undefined) {
      if (menu.price !== newPrice) {
        // Update harga
        await prisma.product.update({
          where: { id: menu.id },
          data: { price: newPrice }
        });
        
        updatedMenus.push({
          name: menu.name,
          category: menu.category?.name || 'Tanpa Kategori',
          oldPrice: menu.price,
          newPrice: newPrice
        });
      } else {
        unchangedMenus.push({
          name: menu.name,
          category: menu.category?.name || 'Tanpa Kategori',
          price: menu.price
        });
      }
    } else {
      // Menu tidak ada di daftar update
      notFoundInList.push({
        name: menu.name,
        category: menu.category?.name || 'Tanpa Kategori',
        price: menu.price
      });
    }
  }
  
  // Output hasil
  console.log('='.repeat(70));
  console.log('📊 HASIL UPDATE HARGA MENU');
  console.log('='.repeat(70));
  
  console.log('\n✅ MENU YANG HARGANYA DIUBAH:');
  console.log('-'.repeat(70));
  if (updatedMenus.length > 0) {
    for (const item of updatedMenus) {
      const oldFormatted = `Rp ${item.oldPrice.toLocaleString('id-ID')}`;
      const newFormatted = `Rp ${item.newPrice.toLocaleString('id-ID')}`;
      console.log(`  [${item.category}] ${item.name}: ${oldFormatted} → ${newFormatted}`);
    }
  } else {
    console.log('  (Tidak ada perubahan harga)');
  }
  
  console.log(`\n📌 MENU DARI DAFTAR YANG SUDAH SESUAI (tidak perlu diubah):`);
  console.log('-'.repeat(70));
  if (unchangedMenus.length > 0) {
    for (const item of unchangedMenus) {
      console.log(`  [${item.category}] ${item.name}: Rp ${item.price.toLocaleString('id-ID')}`);
    }
  } else {
    console.log('  (Semua menu dari daftar berubah)');
  }
  
  console.log(`\n📂 MENU LAIN (TIDAK dalam daftar update, TETAP dipertahankan):`);
  console.log('-'.repeat(70));
  if (notFoundInList.length > 0) {
    for (const item of notFoundInList) {
      console.log(`  [${item.category}] ${item.name}: Rp ${item.price.toLocaleString('id-ID')}`);
    }
  } else {
    console.log('  (Tidak ada menu lain)');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`📈 RINGKASAN:`);
  console.log(`   - Menu diubah: ${updatedMenus.length}`);
  console.log(`   - Menu sudah sesuai: ${unchangedMenus.length}`);
  console.log(`   - Menu lain (tidak diubah): ${notFoundInList.length}`);
  console.log('='.repeat(70));
  
  return { updatedMenus, unchangedMenus, notFoundInList };
}

updateMenuPrices()
  .then(() => {
    console.log('\n✨ Update harga menu selesai!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
