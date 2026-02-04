import { PrismaClient } from '@prisma/client';

// Database lokal
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:12345@localhost:5432/barizta'
    }
  }
});

// Database Supabase (Session Pooler)
const supabasePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.gwotokcjyjmoobyvgvpo:Barizta2107@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true'
    }
  }
});

async function syncData() {
  console.log('🚀 Starting data sync from local to Supabase...\n');

  try {
    // 1. Sync Categories
    console.log('📦 Syncing Categories...');
    const categories = await localPrisma.category.findMany();
    for (const cat of categories) {
      await supabasePrisma.category.upsert({
        where: { id: cat.id },
        update: cat,
        create: cat
      });
    }
    console.log(`   ✅ ${categories.length} categories synced`);

    // 2. Sync Products
    console.log('📦 Syncing Products...');
    const products = await localPrisma.product.findMany();
    for (const prod of products) {
      await supabasePrisma.product.upsert({
        where: { id: prod.id },
        update: prod,
        create: prod
      });
    }
    console.log(`   ✅ ${products.length} products synced`);

    // 3. Sync Users
    console.log('👥 Syncing Users...');
    const users = await localPrisma.user.findMany();
    for (const user of users) {
      await supabasePrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`   ✅ ${users.length} users synced`);

    // 4. Sync Team
    console.log('👥 Syncing Team...');
    const team = await localPrisma.team.findMany();
    for (const t of team) {
      await supabasePrisma.team.upsert({
        where: { id: t.id },
        update: t,
        create: t
      });
    }
    console.log(`   ✅ ${team.length} team members synced`);

    // 5. Sync News
    console.log('📰 Syncing News...');
    const news = await localPrisma.news.findMany();
    for (const n of news) {
      await supabasePrisma.news.upsert({
        where: { id: n.id },
        update: n,
        create: n
      });
    }
    console.log(`   ✅ ${news.length} news synced`);

    // 6. Sync Media
    console.log('🖼️ Syncing Media...');
    const media = await localPrisma.media.findMany();
    for (const m of media) {
      await supabasePrisma.media.upsert({
        where: { id: m.id },
        update: m,
        create: m
      });
    }
    console.log(`   ✅ ${media.length} media synced`);

    // 7. Sync Partnership
    console.log('🤝 Syncing Partnerships...');
    const partnerships = await localPrisma.partnership.findMany();
    for (const p of partnerships) {
      await supabasePrisma.partnership.upsert({
        where: { id: p.id },
        update: p,
        create: p
      });
    }
    console.log(`   ✅ ${partnerships.length} partnerships synced`);

    // 8. Sync Milestones
    console.log('🏆 Syncing Milestones...');
    const milestones = await localPrisma.milestone.findMany();
    for (const m of milestones) {
      await supabasePrisma.milestone.upsert({
        where: { id: m.id },
        update: m,
        create: m
      });
    }
    console.log(`   ✅ ${milestones.length} milestones synced`);

    // 9. Sync Renamedclass (Classes)
    console.log('📚 Syncing Classes...');
    const classes = await localPrisma.renamedclass.findMany();
    for (const c of classes) {
      await supabasePrisma.renamedclass.upsert({
        where: { id: c.id },
        update: c,
        create: c
      });
    }
    console.log(`   ✅ ${classes.length} classes synced`);

    // 10. Sync Schedule
    console.log('📅 Syncing Schedules...');
    const schedules = await localPrisma.schedule.findMany();
    for (const s of schedules) {
      await supabasePrisma.schedule.upsert({
        where: { id: s.id },
        update: s,
        create: s
      });
    }
    console.log(`   ✅ ${schedules.length} schedules synced`);

    // 11. Sync KolaborasiSetting
    console.log('⚙️ Syncing Kolaborasi Settings...');
    const kolabSettings = await localPrisma.kolaborasisetting.findMany();
    for (const k of kolabSettings) {
      await supabasePrisma.kolaborasisetting.upsert({
        where: { id: k.id },
        update: k,
        create: k
      });
    }
    console.log(`   ✅ ${kolabSettings.length} kolaborasi settings synced`);

    // 12. Sync TogoFeature
    console.log('🚗 Syncing Togo Features...');
    const togoFeatures = await localPrisma.togofeature.findMany();
    for (const t of togoFeatures) {
      await supabasePrisma.togofeature.upsert({
        where: { id: t.id },
        update: t,
        create: t
      });
    }
    console.log(`   ✅ ${togoFeatures.length} togo features synced`);

    // 13. Sync TogoGallery
    console.log('🖼️ Syncing Togo Gallery...');
    const togoGallery = await localPrisma.togogallery.findMany();
    for (const t of togoGallery) {
      await supabasePrisma.togogallery.upsert({
        where: { id: t.id },
        update: t,
        create: t
      });
    }
    console.log(`   ✅ ${togoGallery.length} togo gallery synced`);

    // 14. Sync TogoMenu
    console.log('🍽️ Syncing Togo Menu...');
    const togoMenu = await localPrisma.togomenu.findMany();
    for (const t of togoMenu) {
      await supabasePrisma.togomenu.upsert({
        where: { id: t.id },
        update: t,
        create: t
      });
    }
    console.log(`   ✅ ${togoMenu.length} togo menu synced`);

    // 15. Sync TogoSetting
    console.log('⚙️ Syncing Togo Settings...');
    const togoSettings = await localPrisma.togosetting.findMany();
    for (const t of togoSettings) {
      await supabasePrisma.togosetting.upsert({
        where: { id: t.id },
        update: t,
        create: t
      });
    }
    console.log(`   ✅ ${togoSettings.length} togo settings synced`);

    // 16. Sync WebsiteSetting
    console.log('🌐 Syncing Website Settings...');
    const webSettings = await localPrisma.websitesetting.findMany();
    for (const w of webSettings) {
      await supabasePrisma.websitesetting.upsert({
        where: { id: w.id },
        update: w,
        create: w
      });
    }
    console.log(`   ✅ ${webSettings.length} website settings synced`);

    console.log('\n🎉 Data sync completed successfully!');

  } catch (error) {
    console.error('❌ Error syncing data:', error);
  } finally {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  }
}

syncData();
