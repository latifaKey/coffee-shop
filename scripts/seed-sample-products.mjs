/**
 * Seed Sample Products Script
 * 
 * Seeds the database with sample products linked to categories
 * Run with: node scripts/seed-sample-products.mjs
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Helper to create slug
function createSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Get random image from folder
function getRandomImage(folderName) {
  const basePath = path.join(process.cwd(), "public", "images", "menu", folderName);
  
  try {
    if (!fs.existsSync(basePath)) {
      console.log(`⚠️  Folder not found: ${basePath}`);
      return `/images/menu/${folderName}/placeholder.jpg`;
    }
    
    const files = fs.readdirSync(basePath)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    
    if (files.length === 0) {
      return `/images/menu/${folderName}/placeholder.jpg`;
    }
    
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return `/images/menu/${folderName}/${randomFile}`;
  } catch (error) {
    console.log(`⚠️  Error reading folder ${folderName}:`, error.message);
    return `/images/menu/${folderName}/placeholder.jpg`;
  }
}

async function main() {
  console.log("🌱 Seeding sample products...\n");

  // Get all categories
  const categories = await prisma.category.findMany();
  
  if (categories.length === 0) {
    console.log("❌ No categories found. Please run seed-categories.mjs first.");
    return;
  }

  // Sample products for each category
  const sampleProducts = {
    "espresso": [
      { name: "Espresso Shot", description: "Single shot espresso murni, bold dan intens", price: 15000 },
      { name: "Double Espresso", description: "Double shot untuk pecinta kopi kuat", price: 20000 },
      { name: "Americano", description: "Espresso dengan air panas, rasa klasik", price: 22000 },
      { name: "Long Black", description: "Espresso diatas air panas, crema terjaga", price: 22000 },
    ],
    "milk-based": [
      { name: "Cappuccino", description: "Espresso dengan susu steamed dan foam lembut", price: 28000 },
      { name: "Caffe Latte", description: "Espresso dengan susu creamy berlimpah", price: 28000 },
      { name: "Flat White", description: "Double shot dengan microfoam velvet", price: 30000 },
      { name: "Mocha Latte", description: "Latte dengan cokelat premium", price: 32000 },
    ],
    "frappe": [
      { name: "Coffee Frappe", description: "Kopi blended dengan es, segar dan creamy", price: 30000 },
      { name: "Caramel Frappe", description: "Frappe dengan saus caramel manis", price: 35000 },
      { name: "Chocolate Frappe", description: "Cokelat blended dingin yang menyegarkan", price: 32000 },
      { name: "Matcha Frappe", description: "Green tea Jepang yang creamy", price: 35000 },
    ],
    "herb": [
      { name: "Lemon Ginger", description: "Teh jahe dengan perasan lemon segar", price: 20000 },
      { name: "Chamomile Tea", description: "Teh herbal menenangkan dari bunga chamomile", price: 22000 },
      { name: "Peppermint Tea", description: "Teh mint yang menyegarkan", price: 20000 },
    ],
    "mocktail": [
      { name: "Sunset Paradise", description: "Campuran jus tropis dengan gradasi warna indah", price: 28000 },
      { name: "Berry Blast", description: "Mixed berry dengan soda segar", price: 30000 },
      { name: "Tropical Dream", description: "Mangga, nanas, dan passion fruit", price: 28000 },
    ],
    "mojito": [
      { name: "Classic Mojito", description: "Mint segar dengan lime, rasa klasik", price: 28000 },
      { name: "Strawberry Mojito", description: "Mojito dengan tambahan strawberry manis", price: 32000 },
      { name: "Passion Mojito", description: "Mojito dengan passion fruit eksotis", price: 32000 },
    ],
    "tea": [
      { name: "Earl Grey", description: "Teh hitam dengan aroma bergamot khas", price: 22000 },
      { name: "English Breakfast", description: "Teh hitam klasik untuk pagi hari", price: 20000 },
      { name: "Green Tea", description: "Teh hijau murni yang menyehatkan", price: 20000 },
      { name: "Oolong Tea", description: "Teh semi-fermentasi dengan rasa unik", price: 25000 },
    ],
    "yakult-based": [
      { name: "Yakult Original", description: "Yakult segar dengan es", price: 18000 },
      { name: "Yakult Strawberry", description: "Yakult dengan sirup strawberry", price: 22000 },
      { name: "Yakult Lemon", description: "Yakult dengan perasan lemon segar", price: 22000 },
      { name: "Yakult Grape", description: "Yakult dengan anggur manis", price: 22000 },
    ],
    "sepersusuan": [
      { name: "Fresh Milk", description: "Susu segar murni yang creamy", price: 20000 },
      { name: "Chocolate Milk", description: "Susu cokelat yang nikmat", price: 22000 },
      { name: "Taro Milk", description: "Susu dengan rasa taro yang unik", price: 25000 },
      { name: "Red Velvet Milk", description: "Susu dengan rasa red velvet premium", price: 28000 },
    ],
    "makanan": [
      { name: "Croissant", description: "Croissant renyah dengan mentega premium", price: 25000 },
      { name: "Roti Bakar", description: "Roti bakar dengan berbagai topping", price: 20000 },
      { name: "French Fries", description: "Kentang goreng renyah dengan saus", price: 22000 },
      { name: "Sandwich", description: "Sandwich dengan isian pilihan", price: 30000 },
      { name: "Pasta Carbonara", description: "Pasta creamy dengan bacon", price: 45000 },
    ],
  };

  let totalCreated = 0;

  for (const category of categories) {
    const products = sampleProducts[category.slug];
    
    if (!products || products.length === 0) {
      console.log(`⏭️  No sample products for category: ${category.name}`);
      continue;
    }

    console.log(`\n📂 Category: ${category.name} (${category.imageFolder})`);

    for (const product of products) {
      const slug = createSlug(product.name);
      
      // Check if product already exists
      const existing = await prisma.product.findUnique({
        where: { slug }
      });

      if (existing) {
        console.log(`   ⏭️  "${product.name}" already exists`);
        continue;
      }

      const image = getRandomImage(category.imageFolder);

      const created = await prisma.product.create({
        data: {
          name: product.name,
          slug,
          description: product.description,
          price: product.price,
          categoryId: category.id,
          image,
          isAvailable: true,
        }
      });

      console.log(`   ✅ Created: ${created.name} - ${image}`);
      totalCreated++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total products created: ${totalCreated}`);
  
  const productCount = await prisma.product.count();
  console.log(`   Total products in database: ${productCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding products:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
