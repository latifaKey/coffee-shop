// AUTO IMPORT SEMUA DATA dari MySQL SQL file ke PostgreSQL
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// Parse MySQL INSERT statement menjadi JavaScript objects
function parseInsert(insertStatement) {
  // Extract table name
  const tableMatch = insertStatement.match(/INSERT INTO `(\w+)`/i);
  if (!tableMatch) return null;
  const tableName = tableMatch[1];
  
  // Extract column names
  const columnsMatch = insertStatement.match(/\(([^)]+)\)\s+VALUES/i);
  if (!columnsMatch) return null;
  const columns = columnsMatch[1].split(',').map(c => c.trim().replace(/`/g, ''));
  
  // Extract values - handle multiple rows
  const valuesMatch = insertStatement.match(/VALUES\s+(.+);$/is);
  if (!valuesMatch) return null;
  
  const rows = [];
  let currentRow = [];
  let buffer = '';
  let inString = false;
  let depth = 0;
  
  for (let i = 0; i < valuesMatch[1].length; i++) {
    const char = valuesMatch[1][i];
    const prevChar = valuesMatch[1][i - 1];
    
    if (char === "'" && prevChar !== '\\') {
      inString = !inString;
    }
    
    if (!inString) {
      if (char === '(') {
        depth++;
        if (depth === 1) continue;
      }
      if (char === ')') {
        depth--;
        if (depth === 0) {
          currentRow.push(parseValue(buffer.trim()));
          rows.push(currentRow);
          currentRow = [];
          buffer = '';
          continue;
        }
      }
      if (char === ',' && depth === 1) {
        currentRow.push(parseValue(buffer.trim()));
        buffer = '';
        continue;
      }
    }
    
    if (depth > 0) {
      buffer += char;
    }
  }
  
  // Convert to objects
  const objects = rows.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
  
  return { tableName, data: objects };
}

function parseValue(val) {
  if (val === 'NULL') return null;
  if (val === '0x' || val.startsWith('0x')) return null; // BLOB data
  
  // Remove quotes
  if (val.startsWith("'") && val.endsWith("'")) {
    return val.slice(1, -1).replace(/\\'/g, "'").replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
  }
  
  // Boolean
  if (val === '0') return false;
  if (val === '1' && !val.includes('.')) return true;
  
  // Number
  if (/^\d+$/.test(val)) return parseInt(val);
  if (/^\d+\.\d+$/.test(val)) return parseFloat(val);
  
  return val;
}

async function importAllData() {
  console.log('\n🚀 IMPORT LENGKAP dari MySQL ke PostgreSQL\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const sqlPath = 'd:\\Downloads\\barizta (15).sql';
  
  if (!fs.existsSync(sqlPath)) {
    console.log('❌ File tidak ditemukan:', sqlPath);
    return;
  }
  
  console.log('📂 Membaca file SQL...');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  
  // Extract all INSERT statements
  const insertPattern = /INSERT INTO `\w+`[^;]+;/gis;
  const inserts = sql.match(insertPattern) || [];
  
  console.log(`✅ Ditemukan ${inserts.length} INSERT statements\n`);
  
  let stats = {
    category: 0,
    class: 0,
    product: 0,
    user: 0,
    team: 0,
    news: 0,
    enrollment: 0,
    classregistration: 0,
    other: 0
  };
  
  for (const insert of inserts) {
    try {
      const parsed = parseInsert(insert);
      if (!parsed) continue;
      
      const { tableName, data } = parsed;
      console.log(`📋 Importing ${tableName} (${data.length} records)...`);
      
      for (const record of data) {
        try {
          // Convert date strings
          if (record.createdAt && typeof record.createdAt === 'string') {
            record.createdAt = new Date(record.createdAt);
          }
          if (record.updatedAt && typeof record.updatedAt === 'string') {
            record.updatedAt = new Date(record.updatedAt);
          }
          if (record.schedule && typeof record.schedule === 'string') {
            record.schedule = new Date(record.schedule);
          }
          if (record.publishDate && typeof record.publishDate === 'string') {
            record.publishDate = new Date(record.publishDate);
          }
          if (record.birthDate && typeof record.birthDate === 'string') {
            record.birthDate = new Date(record.birthDate);
          }
          if (record.date && typeof record.date === 'string') {
            record.date = new Date(record.date);
          }
          if (record.startDate && typeof record.startDate === 'string') {
            record.startDate = new Date(record.startDate);
          }
          if (record.resetTokenExpiry && typeof record.resetTokenExpiry === 'string') {
            record.resetTokenExpiry = new Date(record.resetTokenExpiry);
          }
          if (record.replyDate && typeof record.replyDate === 'string') {
            record.replyDate = new Date(record.replyDate);
          }
          
          // Handle BLOB fields
          if (record.paymentProof && record.paymentProof === null) {
            delete record.paymentProof;
          }
          
          // Import based on table
          if (tableName === 'category') {
            await prisma.category.upsert({
              where: { id: record.id },
              create: record,
              update: record
            });
            stats.category++;
          } else if (tableName === 'class') {
            await prisma.Renamedclass.upsert({
              where: { id: record.id },
              create: record,
              update: record
            });
            stats.class++;
          } else if (tableName === 'product') {
            await prisma.product.upsert({
              where: { id: record.id },
              create: record,
              update: record
            });
            stats.product++;
          } else if (tableName === 'user') {
            await prisma.user.upsert({
              where: { id: record.id },
              create: record,
              update: record
            });
            stats.user++;
          } else if (tableName === 'team') {
            await prisma.team.upsert({
              where: { id: record.id },
              create: record,
              update: record
            });
            stats.team++;
          } else if (tableName === 'news') {
            await prisma.news.upsert({
              where: { id: record.id },
              create: record,
              update: record
            });
            stats.news++;
          } else if (tableName === 'enrollment') {
            await prisma.enrollment.upsert({
              where: { id: record.id },
              create: record,
              update: record
            });
            stats.enrollment++;
          } else if (tableName === 'classregistration') {
            await prisma.classregistration.upsert({
              where: { id: record.id },
              create: record,
              update: record
            });
            stats.classregistration++;
          } else {
            // Try generic import for other tables
            if (prisma[tableName]) {
              await prisma[tableName].upsert({
                where: { id: record.id },
                create: record,
                update: record
              }).catch(() => {});
              stats.other++;
            }
          }
        } catch (err) {
          console.log(`   ⚠️  Skip 1 record: ${err.message.substring(0, 60)}...`);
        }
      }
      
      console.log(`   ✅ Done\n`);
      
    } catch (err) {
      console.log(`   ⚠️  Error: ${err.message.substring(0, 60)}...\n`);
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ IMPORT SELESAI!\n');
  console.log('📊 Statistik:');
  console.log(`   • Categories: ${stats.category}`);
  console.log(`   • Classes: ${stats.class}`);
  console.log(`   • Products: ${stats.product}`);
  console.log(`   • Users: ${stats.user}`);
  console.log(`   • Team: ${stats.team}`);
  console.log(`   • News: ${stats.news}`);
  console.log(`   • Enrollments: ${stats.enrollment}`);
  console.log(`   • Class Registrations: ${stats.classregistration}`);
  if (stats.other > 0) {
    console.log(`   • Other tables: ${stats.other}`);
  }
  console.log('\n🔍 Cek hasil: npx prisma studio\n');
}

importAllData()
  .catch(e => {
    console.error('\n❌ Error:', e.message);
    console.error(e);
  })
  .finally(() => prisma.$disconnect());
