/**
 * Migration Script: Convert existing BLOB payment proofs to file system
 * 
 * This script should be run ONCE after deploying the new schema changes.
 * It will:
 * 1. Find all classregistration records with paymentProof as BLOB (old data)
 * 2. Save each BLOB to file system
 * 3. Update the database with the new file URL
 * 
 * IMPORTANT: Backup your database before running this script!
 */

import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

async function migratePaymentProofs() {
  console.log('🚀 Starting payment proof migration...');
  
  try {
    // Note: This query will work only if you haven't run the migration yet
    // or if you have old data with BLOB stored in a backup column
    
    // If you already ran the migration and data is lost, you need to restore from backup first
    console.log('⚠️  NOTE: This script assumes you have a backup of BLOB data');
    console.log('⚠️  If paymentProof column is already String type, this script will fail');
    console.log('');
    
    // For PostgreSQL, check if there are any bytea (BLOB) data
    const registrationsWithBlob = await prisma.$queryRaw<Array<{
      id: number;
      paymentProof: Buffer | null;
    }>>`
      SELECT id, "paymentProof"
      FROM classregistration
      WHERE "paymentProof" IS NOT NULL
      AND octet_length("paymentProof") > 0
    `;
    
    console.log(`📊 Found ${registrationsWithBlob.length} registrations with payment proof`);
    
    if (registrationsWithBlob.length === 0) {
      console.log('✅ No BLOB data to migrate');
      return;
    }
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'proofs');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log(`📁 Created directory: ${uploadDir}`);
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const registration of registrationsWithBlob) {
      try {
        const { id, paymentProof } = registration;
        
        if (!paymentProof || paymentProof.length === 0) {
          console.log(`⏭️  Skipping registration ${id} - empty payment proof`);
          continue;
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        
        // Detect file type from magic bytes (first few bytes of file)
        let ext = 'jpg'; // default
        const buffer = Buffer.from(paymentProof);
        
        // PNG signature: 89 50 4E 47
        if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
          ext = 'png';
        }
        // JPEG signature: FF D8 FF
        else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
          ext = 'jpg';
        }
        // WebP signature: RIFF....WEBP
        else if (
          buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
          buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
        ) {
          ext = 'webp';
        }
        
        const filename = `migrated-${id}-${timestamp}-${randomStr}.${ext}`;
        const filePath = join(uploadDir, filename);
        const publicUrl = `/uploads/proofs/${filename}`;
        
        // Write file to disk
        await writeFile(filePath, buffer);
        
        // Update database with URL
        await prisma.$executeRaw`
          UPDATE classregistration
          SET "paymentProof" = ${publicUrl}::text
          WHERE id = ${id}
        `;
        
        successCount++;
        console.log(`✅ Migrated registration ${id} → ${publicUrl}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating registration ${registration.id}:`, error);
      }
    }
    
    console.log('');
    console.log('📈 Migration Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📊 Total: ${registrationsWithBlob.length}`);
    console.log('');
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migratePaymentProofs()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
