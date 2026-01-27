import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check all schedules
    const allSchedules = await prisma.schedule.findMany();
    console.log('=== All Schedules ===');
    console.log(JSON.stringify(allSchedules, null, 2));
    console.log('Total:', allSchedules.length);

    // Check with same filter as API
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const filteredSchedules = await prisma.schedule.findMany({
      where: {
        status: "scheduled",
        date: { gte: oneWeekAgo },
      },
      orderBy: { date: "asc" },
      take: 10,
    });
    
    console.log('\n=== Filtered Schedules (API filter) ===');
    console.log('Filter: status="scheduled", date >= ', oneWeekAgo);
    console.log(JSON.stringify(filteredSchedules, null, 2));
    console.log('Filtered Total:', filteredSchedules.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
