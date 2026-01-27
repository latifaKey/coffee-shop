import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Deskripsi kelas yang lebih informatif dan menonjolkan materi
const classDescriptions = {
  // Basic Barista (keyword matching)
  'basic': `Kelas untuk pemula yang ingin mengenal dan mempelajari dunia kopi secara profesional.

📚 Materi yang akan dipelajari:
• Pengenalan kopi dari hulu ke hilir
• Basic cupping & pengenalan karakter rasa kopi
• Peran dan standar barista profesional
• Dasar espresso & pengenalan mesin kopi
• Teknik kalibrasi grinder dan mesin espresso
• Teknik frothing susu & latte art dasar (heart)
• Manual brew dasar (V60, French Press, Aeropress)
• Pengembangan produk minuman kopi
• Perhitungan HPP dan harga jual
• Dasar pelayanan & hospitality barista`,

  // Intermediate / Latte Art (keyword matching)
  'intermediate': `Kelas lanjutan untuk peserta yang sudah menguasai dasar latte art dan ingin meningkatkan kualitas visual minuman.

📚 Materi yang akan dipelajari:
• Teknik frothing milk yang konsisten dan presisi
• Latte art basic hingga intermediate (heart, tulip, rosetta, swan)
• Pengenalan kompetisi latte art (ILAC)
• Dasar manajemen bar dan workflow`,

  'latte': `Kelas lanjutan untuk peserta yang sudah menguasai dasar latte art dan ingin meningkatkan kualitas visual minuman.

📚 Materi yang akan dipelajari:
• Teknik frothing milk yang konsisten dan presisi
• Latte art basic hingga intermediate (heart, tulip, rosetta, swan)
• Pengenalan kompetisi latte art (ILAC)
• Dasar manajemen bar dan workflow`,

  // Professional / Advanced / Manual Brew (keyword matching)
  'professional': `Kelas advance untuk calon brewer yang ingin menguasai teknik manual brew secara profesional.

📚 Materi yang akan dipelajari:
• Advanced manual brew extraction
• Sensory & flavor profiling lanjutan
• Coffee brewing mastery (V60, Aeropress, Syphon, dll)
• Bar management & customer service profesional
• Pengenalan kompetisi barista & manual brew`,

  'advanced': `Kelas advance untuk calon brewer yang ingin menguasai teknik manual brew secara profesional.

📚 Materi yang akan dipelajari:
• Advanced manual brew extraction
• Sensory & flavor profiling lanjutan
• Coffee brewing mastery (V60, Aeropress, Syphon, dll)
• Bar management & customer service profesional
• Pengenalan kompetisi barista & manual brew`,

  'manual brew': `Kelas advance untuk calon brewer yang ingin menguasai teknik manual brew secara profesional.

📚 Materi yang akan dipelajari:
• Advanced manual brew extraction
• Sensory & flavor profiling lanjutan
• Coffee brewing mastery (V60, Aeropress, Syphon, dll)
• Bar management & customer service profesional
• Pengenalan kompetisi barista & manual brew`,

  // Workshop (keyword matching)
  'workshop': `Kelas singkat yang fun, aplikatif, dan cocok untuk semua kalangan.

📚 Tema workshop yang dapat dipilih:
• Manual Brew Workshop (V60, Aeropress, dll)
• Latte Art Workshop
• Coffee Cupping & Tasting
• Cold Brew & Mocktail Coffee

⏱ Durasi fleksibel sesuai tema yang dipilih.`,

  '1 day': `Kelas singkat yang fun, aplikatif, dan cocok untuk semua kalangan.

📚 Tema workshop yang dapat dipilih:
• Manual Brew Workshop (V60, Aeropress, dll)
• Latte Art Workshop
• Coffee Cupping & Tasting
• Cold Brew & Mocktail Coffee

⏱ Durasi fleksibel sesuai tema yang dipilih.`,
};

async function updateClassDescriptions() {
  console.log('🔄 Memulai update deskripsi kelas...\n');
  
  // Ambil semua kelas
  const allClasses = await prisma.renamedclass.findMany({
    orderBy: { id: 'asc' }
  });
  
  console.log(`📋 Total kelas di database: ${allClasses.length}\n`);
  
  const updatedClasses = [];
  const skippedClasses = [];
  
  for (const classItem of allClasses) {
    const titleLower = classItem.title.toLowerCase();
    
    // Find matching description based on keywords
    let newDescription = null;
    
    if (titleLower.includes('basic') || titleLower.includes('pemula') || titleLower.includes('dasar')) {
      newDescription = classDescriptions['basic'];
    } else if (titleLower.includes('intermediate') || titleLower.includes('latte art') || titleLower.includes('menengah')) {
      newDescription = classDescriptions['intermediate'];
    } else if (titleLower.includes('professional') || titleLower.includes('advanced') || titleLower.includes('manual brew') || titleLower.includes('advance')) {
      newDescription = classDescriptions['professional'];
    } else if (titleLower.includes('workshop') || titleLower.includes('1 day') || titleLower.includes('singkat')) {
      newDescription = classDescriptions['workshop'];
    }
    
    if (newDescription) {
      await prisma.renamedclass.update({
        where: { id: classItem.id },
        data: { description: newDescription }
      });
      
      updatedClasses.push({
        id: classItem.id,
        title: classItem.title,
        matched: titleLower.includes('basic') ? 'Basic Barista' :
                 titleLower.includes('intermediate') || titleLower.includes('latte') ? 'Intermediate Latte Art' :
                 titleLower.includes('professional') || titleLower.includes('advanced') || titleLower.includes('manual') ? 'Professional Manual Brew' :
                 'Workshop'
      });
    } else {
      skippedClasses.push({
        id: classItem.id,
        title: classItem.title
      });
    }
  }
  
  // Output hasil
  console.log('='.repeat(70));
  console.log('📊 HASIL UPDATE DESKRIPSI KELAS');
  console.log('='.repeat(70));
  
  console.log('\n✅ KELAS YANG DESKRIPSINYA DIUPDATE:');
  console.log('-'.repeat(70));
  if (updatedClasses.length > 0) {
    for (const item of updatedClasses) {
      console.log(`  [ID: ${item.id}] ${item.title}`);
      console.log(`    ↳ Matched template: ${item.matched}`);
    }
  } else {
    console.log('  (Tidak ada kelas yang diupdate)');
  }
  
  console.log(`\n⏭ KELAS YANG DI-SKIP (tidak match keyword):`);
  console.log('-'.repeat(70));
  if (skippedClasses.length > 0) {
    for (const item of skippedClasses) {
      console.log(`  [ID: ${item.id}] ${item.title}`);
    }
  } else {
    console.log('  (Semua kelas berhasil diupdate)');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`📈 RINGKASAN:`);
  console.log(`   - Kelas diupdate: ${updatedClasses.length}`);
  console.log(`   - Kelas di-skip: ${skippedClasses.length}`);
  console.log('='.repeat(70));
  
  return { updatedClasses, skippedClasses };
}

updateClassDescriptions()
  .then(() => {
    console.log('\n✨ Update deskripsi kelas selesai!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
