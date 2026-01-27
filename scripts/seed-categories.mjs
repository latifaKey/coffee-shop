/**
 * Seed Categories Script
 * 
 * Seeds the database with categories matching the image folder structure
 * Run with: node scripts/seed-categories.mjs
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  // MINUMAN - Kopi
  { name: "Espresso", slug: "espresso", type: "MINUMAN", imageFolder: "ESSPRESO" },
  { name: "Milk Based", slug: "milk-based", type: "MINUMAN", imageFolder: "MILKBASED" },
  
  // MINUMAN - Non-Kopi
  { name: "Frappe", slug: "frappe", type: "MINUMAN", imageFolder: "FRAPPE" },
  { name: "Herb", slug: "herb", type: "MINUMAN", imageFolder: "HERB" },
  { name: "Mocktail", slug: "mocktail", type: "MINUMAN", imageFolder: "MOCKTAIL" },
  { name: "Mojito", slug: "mojito", type: "MINUMAN", imageFolder: "MOJITO" },
  { name: "Tea", slug: "tea", type: "MINUMAN", imageFolder: "TEA" },
  { name: "Yakult Based", slug: "yakult-based", type: "MINUMAN", imageFolder: "YAKULT BASED" },
  { name: "Sepersusuan", slug: "sepersusuan", type: "MINUMAN", imageFolder: "SEPERSUSUAN" },
  
  // MAKANAN
  { name: "Makanan", slug: "makanan", type: "MAKANAN", imageFolder: "FOTO MAKANAN" },
];

async function main() {
  console.log("🌱 Seeding categories...\n");

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug }
    });

    if (existing) {
      console.log(`⏭️  Category "${category.name}" already exists, skipping...`);
      continue;
    }

    const created = await prisma.category.create({
      data: category
    });

    console.log(`✅ Created category: ${created.name} (${created.type}) - Folder: ${created.imageFolder}`);
  }

  console.log("\n📊 Category Summary:");
  const summary = await prisma.category.groupBy({
    by: ['type'],
    _count: true
  });
  
  summary.forEach(s => {
    console.log(`   ${s.type}: ${s._count} categories`);
  });

  const total = await prisma.category.count();
  console.log(`   Total: ${total} categories`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
