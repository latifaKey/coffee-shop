/**
 * Script untuk mengecek performa query dashboard admin
 * Usage: node scripts/test-dashboard-performance.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testDashboardQueries() {
  console.log('🔍 Testing Dashboard Admin Query Performance...\n');

  const startTime = Date.now();

  try {
    // Test parallel queries (seperti di dashboard)
    console.log('⏳ Running 11 parallel queries...');
    const queryStart = Date.now();

    const [
      totalProducts,
      activeNews,
      unreadMessages,
      totalMembers,
      activeClasses,
      totalPartnerships,
      scheduledBTG,
      recentEnrollments
    ] = await Promise.all([
      prisma.product.count(),
      prisma.news.count({ where: { status: "published" } }),
      prisma.message.count({ where: { isRead: false } }),
      prisma.user.count({ where: { role: "member" } }),
      prisma.renamedclass.count({ where: { status: "active" } }),
      prisma.partnership.count(),
      prisma.schedule.count({ where: { status: "scheduled" } }),
      prisma.classregistration.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const queryTime = Date.now() - queryStart;
    console.log(`✅ Stats queries completed in ${queryTime}ms`);

    // Test recent activities queries
    console.log('\n⏳ Running recent activities queries...');
    const activitiesStart = Date.now();

    const [recentMessages, recentNews] = await Promise.all([
      prisma.message.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          subject: true,
          createdAt: true,
          isRead: true
        }
      }),
      prisma.news.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true
        }
      })
    ]);

    const activitiesTime = Date.now() - activitiesStart;
    console.log(`✅ Recent activities queries completed in ${activitiesTime}ms`);

    const totalTime = Date.now() - startTime;

    // Display results
    console.log('\n📊 Results:');
    console.log('─────────────────────────────────');
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Active News: ${activeNews}`);
    console.log(`Unread Messages: ${unreadMessages}`);
    console.log(`Total Members: ${totalMembers}`);
    console.log(`Active Classes: ${activeClasses}`);
    console.log(`Total Partnerships: ${totalPartnerships}`);
    console.log(`Scheduled BTG: ${scheduledBTG}`);
    console.log(`Recent Enrollments (30d): ${recentEnrollments}`);
    console.log(`Recent Messages: ${recentMessages.length}`);
    console.log(`Recent News: ${recentNews.length}`);

    // Performance summary
    console.log('\n⚡ Performance Summary:');
    console.log('─────────────────────────────────');
    console.log(`Stats Queries: ${queryTime}ms`);
    console.log(`Activities Queries: ${activitiesTime}ms`);
    console.log(`Total Time: ${totalTime}ms`);

    // Performance rating
    console.log('\n🎯 Performance Rating:');
    if (totalTime < 1000) {
      console.log('✅ EXCELLENT - Dashboard will load fast!');
    } else if (totalTime < 2000) {
      console.log('⚠️  GOOD - Dashboard load time is acceptable');
    } else if (totalTime < 3000) {
      console.log('⚠️  SLOW - Consider adding database indexes');
    } else {
      console.log('❌ VERY SLOW - Check database connection and indexes');
    }

    // Recommendations
    if (totalTime > 2000) {
      console.log('\n💡 Recommendations:');
      console.log('1. Add indexes on frequently queried columns:');
      console.log('   - news.status');
      console.log('   - message.isRead');
      console.log('   - user.role');
      console.log('   - schedule.status');
      console.log('   - renamedclass.status');
      console.log('2. Check database location (should be close to server)');
      console.log('3. Consider upgrading database plan if using free tier');
    }

  } catch (error) {
    console.error('❌ Error running queries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testDashboardQueries();
