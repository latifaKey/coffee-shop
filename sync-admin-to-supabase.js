// Script to sync admin user to Supabase
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Local database
const localPrisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://postgres:12345@localhost:5432/barizta" }
  }
});

// Supabase database - Direct Connection
const supabasePrisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://postgres.gwotokcjyjmoobyvgvpo:Barizta2107@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" }
  }
});

async function main() {
  console.log('🔍 Checking local admin users...');
  
  // Get admin users from local
  const localAdmins = await localPrisma.user.findMany({
    where: { role: 'admin' }
  });
  
  console.log(`Found ${localAdmins.length} admin(s) in local database:`);
  localAdmins.forEach(a => console.log(`  - ${a.email} (${a.name})`));
  
  if (localAdmins.length === 0) {
    console.log('\n⚠️ No admin found in local database. Creating default admin...');
    
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    const newAdmin = await localPrisma.user.create({
      data: {
        name: 'Admin Barizta',
        email: 'admin@barizta.me',
        password: hashedPassword,
        role: 'admin',
        phone: '081234567890'
      }
    });
    console.log(`✅ Created admin: ${newAdmin.email}`);
    localAdmins.push(newAdmin);
  }
  
  console.log('\n🔄 Syncing to Supabase...');
  
  for (const admin of localAdmins) {
    try {
      // Check if exists in Supabase
      const existing = await supabasePrisma.user.findUnique({
        where: { email: admin.email }
      });
      
      if (existing) {
        console.log(`  ⏭️ Admin ${admin.email} already exists in Supabase`);
      } else {
        // Create in Supabase
        await supabasePrisma.user.create({
          data: {
            name: admin.name,
            email: admin.email,
            password: admin.password,
            role: admin.role,
            phone: admin.phone
          }
        });
        console.log(`  ✅ Synced admin ${admin.email} to Supabase`);
      }
    } catch (error) {
      console.error(`  ❌ Error syncing ${admin.email}:`, error.message);
    }
  }
  
  console.log('\n✅ Sync completed!');
  console.log('\n📝 Admin login credentials:');
  localAdmins.forEach(a => {
    console.log(`   Email: ${a.email}`);
    console.log(`   Password: (use existing password or Admin123! for new admin)`);
  });
  console.log('\n🔗 Login at: https://www.barizta.me/admin/login');
}

main()
  .catch(e => console.error('Error:', e))
  .finally(async () => {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  });
