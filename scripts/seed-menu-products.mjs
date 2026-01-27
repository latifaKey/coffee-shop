import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Daftar kategori sesuai folder
const categories = [
  { name: 'Espresso', slug: 'espresso', type: 'MINUMAN', imageFolder: 'ESSPRESO' },
  { name: 'Milk Based', slug: 'milk-based', type: 'MINUMAN', imageFolder: 'MILKBASED' },
  { name: 'Frappe', slug: 'frappe', type: 'MINUMAN', imageFolder: 'FRAPPE' },
  { name: 'Herb', slug: 'herb', type: 'MINUMAN', imageFolder: 'HERB' },
  { name: 'Tea', slug: 'tea', type: 'MINUMAN', imageFolder: 'TEA' },
  { name: 'Mocktail', slug: 'mocktail', type: 'MINUMAN', imageFolder: 'MOCKTAIL' },
  { name: 'Mojito', slug: 'mojito', type: 'MINUMAN', imageFolder: 'MOJITO' },
  { name: 'Sepersusuan', slug: 'sepersusuan', type: 'MINUMAN', imageFolder: 'SEPERSUSUAN' },
  { name: 'Yakult Based', slug: 'yakult-based', type: 'MINUMAN', imageFolder: 'YAKULT BASED' },
  { name: 'Makanan', slug: 'makanan', type: 'MAKANAN', imageFolder: 'FOTO MAKANAN' },
];

// Produk sesuai nama file foto
const products = [
  // ESPRESSO
  { name: 'Affogato', category: 'espresso', price: 20000, image: '/images/menu/ESSPRESO/AFFOGATO.png' },
  { name: 'Americano', category: 'espresso', price: 15000, image: '/images/menu/ESSPRESO/AMERICANO.png' },
  { name: 'Caffe Latte', category: 'espresso', price: 20000, image: '/images/menu/ESSPRESO/CAFFEE LATTEE.png' },
  { name: 'Cappuccino', category: 'espresso', price: 20000, image: '/images/menu/ESSPRESO/CAPPUCINO.png' },
  { name: 'Espresso', category: 'espresso', price: 12000, image: '/images/menu/ESSPRESO/ESSPRESSO.png' },
  { name: 'Magic', category: 'espresso', price: 22000, image: '/images/menu/ESSPRESO/MAGIC_.png' },
  { name: 'Mocha', category: 'espresso', price: 22000, image: '/images/menu/ESSPRESO/MOCHA.png' },
  { name: 'Piccolo', category: 'espresso', price: 18000, image: '/images/menu/ESSPRESO/PICCOLO.png' },

  // MILK BASED
  { name: 'Dark Choco', category: 'milk-based', price: 20000, image: '/images/menu/MILKBASED/DARK CHOCO.png' },
  { name: 'Matcha', category: 'milk-based', price: 22000, image: '/images/menu/MILKBASED/MATCHA_.png' },
  { name: 'Red Velvet', category: 'milk-based', price: 22000, image: '/images/menu/MILKBASED/RED VELVET.png' },
  { name: 'Taro', category: 'milk-based', price: 20000, image: '/images/menu/MILKBASED/TARO.png' },

  // FRAPPE
  { name: 'Coffee Caramel Choco', category: 'frappe', price: 25000, image: '/images/menu/FRAPPE/COFFEE CARAMEL CHOCO.png' },
  { name: 'Matcha Crunch', category: 'frappe', price: 25000, image: '/images/menu/FRAPPE/MATCHA CRUNCH.png' },
  { name: 'Vanilla Crunch', category: 'frappe', price: 25000, image: '/images/menu/FRAPPE/VANILLA CRUNCH.png' },

  // HERB
  { name: 'Ginger Latte', category: 'herb', price: 18000, image: '/images/menu/HERB/GINGER LATTE.png' },
  { name: 'Kopi Wedang', category: 'herb', price: 15000, image: '/images/menu/HERB/kopi wedang.png' },
  { name: 'Lemon Grass', category: 'herb', price: 15000, image: '/images/menu/HERB/LEMON GRASS.png' },

  // TEA
  { name: 'Lemon Tea', category: 'tea', price: 12000, image: '/images/menu/TEA/LEMON TEA.png' },
  { name: 'Lychee Tea', category: 'tea', price: 15000, image: '/images/menu/TEA/LYCHEE TEA.png' },
  { name: 'Peach Tea', category: 'tea', price: 15000, image: '/images/menu/TEA/PEACH TEA.png' },
  { name: 'Strawberry Tea', category: 'tea', price: 15000, image: '/images/menu/TEA/STRAWBERRY TEA.png' },
  { name: 'Thai Green Tea', category: 'tea', price: 18000, image: '/images/menu/TEA/THAI GREEN TEA.png' },
  { name: 'Thai Tea', category: 'tea', price: 18000, image: '/images/menu/TEA/THAI TEA.png' },

  // MOCKTAIL
  { name: 'Boost Your Day', category: 'mocktail', price: 20000, image: '/images/menu/MOCKTAIL/BOOST YOUR DAY.png' },
  { name: 'Coffee Beer', category: 'mocktail', price: 22000, image: '/images/menu/MOCKTAIL/COFFEE BEER.png' },
  { name: 'Redler Coffee', category: 'mocktail', price: 22000, image: '/images/menu/MOCKTAIL/REDLER COFFEE.png' },
  { name: 'Stonger Blackpink', category: 'mocktail', price: 22000, image: '/images/menu/MOCKTAIL/STONGER BLACKPINK.png' },

  // MOJITO
  { name: 'Lemon Mojito', category: 'mojito', price: 18000, image: '/images/menu/MOJITO/LEMON MOJITO.png' },
  { name: 'Lychee Mojito', category: 'mojito', price: 18000, image: '/images/menu/MOJITO/LYCHEE MOJITO.png' },
  { name: 'Orange Mojito', category: 'mojito', price: 18000, image: '/images/menu/MOJITO/ORANGE MOJITO.png' },
  { name: 'Strawberry Mojito', category: 'mojito', price: 18000, image: '/images/menu/MOJITO/STRAWBERRY MOJITO.png' },

  // SEPERSUSUAN (Kopi Susu)
  { name: 'Klepon', category: 'sepersusuan', price: 18000, image: '/images/menu/SEPERSUSUAN/KLEPON.png' },
  { name: 'Kopi Milo', category: 'sepersusuan', price: 18000, image: '/images/menu/SEPERSUSUAN/KOPI MILO.png' },
  { name: 'Kopiku Dulu', category: 'sepersusuan', price: 18000, image: '/images/menu/SEPERSUSUAN/KOPIKU DULU.png' },
  { name: 'Lupa Nama', category: 'sepersusuan', price: 18000, image: '/images/menu/SEPERSUSUAN/LUPA NAMA (2).png' },
  { name: 'Sanger', category: 'sepersusuan', price: 15000, image: '/images/menu/SEPERSUSUAN/SANGER.png' },

  // YAKULT BASED
  { name: 'Lemon Yakult', category: 'yakult-based', price: 18000, image: '/images/menu/YAKULT BASED/LEMON YAKULT.png' },
  { name: 'Lychee Yakult', category: 'yakult-based', price: 18000, image: '/images/menu/YAKULT BASED/LYCHEE YAKULT.png' },
  { name: 'Orange Yakult', category: 'yakult-based', price: 18000, image: '/images/menu/YAKULT BASED/ORANGE YAKULT.png' },
  { name: 'Peach Yakult', category: 'yakult-based', price: 18000, image: '/images/menu/YAKULT BASED/PEACH YAKULT.png' },
  { name: 'Strawberry Yakult', category: 'yakult-based', price: 18000, image: '/images/menu/YAKULT BASED/STRAWBERRY YAKULT.png' },

  // MAKANAN
  { name: 'Ayam Geprek', category: 'makanan', price: 20000, image: '/images/menu/FOTO MAKANAN/AYAM GEPREK.png' },
  { name: 'Beef Cheese Burger', category: 'makanan', price: 30000, image: '/images/menu/FOTO MAKANAN/BEEF CHEESE BURGER.png' },
  { name: 'Chicken Burger', category: 'makanan', price: 25000, image: '/images/menu/FOTO MAKANAN/CHICKEN BURGER.png' },
  { name: 'Egg Burger', category: 'makanan', price: 20000, image: '/images/menu/FOTO MAKANAN/EGG BURGER.png' },
  { name: 'Indomie Goreng Spesial', category: 'makanan', price: 18000, image: '/images/menu/FOTO MAKANAN/INDOMIE GORENG SPESIAL.png' },
  { name: 'Indomie Goreng', category: 'makanan', price: 15000, image: '/images/menu/FOTO MAKANAN/INDOMIE GORENG.png' },
  { name: 'Indomie Rebus Spesial', category: 'makanan', price: 18000, image: '/images/menu/FOTO MAKANAN/INDOMIE REBUS SPESIAL.png' },
  { name: 'Indomie Rebus', category: 'makanan', price: 15000, image: '/images/menu/FOTO MAKANAN/INDOMIE REBUS.png' },
  { name: 'Kentang Goreng', category: 'makanan', price: 15000, image: '/images/menu/FOTO MAKANAN/KENTANG GORENG.png' },
  { name: 'Mix Platter', category: 'makanan', price: 35000, image: '/images/menu/FOTO MAKANAN/MIX PLATTER.png' },
  { name: 'Mix Spicy Burger', category: 'makanan', price: 28000, image: '/images/menu/FOTO MAKANAN/MIX SPICY BURGER.png' },
  { name: 'Nasi Telur', category: 'makanan', price: 12000, image: '/images/menu/FOTO MAKANAN/NASI TELUR.png' },
  { name: 'Nugget', category: 'makanan', price: 15000, image: '/images/menu/FOTO MAKANAN/NUGGET.png' },
  { name: 'Sosis', category: 'makanan', price: 15000, image: '/images/menu/FOTO MAKANAN/SOSIS.png' },
];

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('🌱 Seeding categories and products...\n');

  // 1. Seed categories
  console.log('📁 Creating categories...');
  const categoryMap = {};
  
  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      categoryMap[cat.slug] = existing.id;
      console.log(`  ✓ Category exists: ${cat.name}`);
    } else {
      const created = await prisma.category.create({ data: cat });
      categoryMap[cat.slug] = created.id;
      console.log(`  + Created category: ${cat.name}`);
    }
  }

  // 2. Delete old products that don't match new naming
  console.log('\n🗑️ Cleaning old products...');
  await prisma.product.deleteMany({
    where: {
      slug: {
        contains: '-seed'
      }
    }
  });

  // 3. Seed products
  console.log('\n☕ Creating products...');
  let created = 0;
  let updated = 0;
  
  for (const prod of products) {
    const slug = generateSlug(prod.name);
    const categoryId = categoryMap[prod.category];
    
    const existing = await prisma.product.findUnique({ where: { slug } });
    
    if (existing) {
      // Update existing product
      await prisma.product.update({
        where: { slug },
        data: {
          name: prod.name,
          price: prod.price,
          image: prod.image,
          categoryId,
          isAvailable: true,
        }
      });
      updated++;
      console.log(`  ↻ Updated: ${prod.name}`);
    } else {
      // Create new product
      await prisma.product.create({
        data: {
          name: prod.name,
          slug,
          description: `${prod.name} - Menu spesial Barizta Coffee`,
          price: prod.price,
          image: prod.image,
          categoryId,
          isAvailable: true,
        }
      });
      created++;
      console.log(`  + Created: ${prod.name}`);
    }
  }

  console.log(`\n✅ Done! Created: ${created}, Updated: ${updated}`);
  console.log(`📊 Total products: ${products.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
