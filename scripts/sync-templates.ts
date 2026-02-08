import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool as PgPool } from 'pg';

function createPrisma() {
  const connectionString =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_NON_POOLING ||
    process.env.DIRECT_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const pool = new PgPool({ connectionString });
  const adapter = new PrismaPg(pool);
  return { prisma: new PrismaClient({ adapter }), pool };
}

async function syncTemplates() {
  const { prisma, pool } = createPrisma();
  const month = process.env.MONTH || '2026-02';
  // Get the shared template
  const sharedTemplate = await prisma.sharedTemplate.findUnique({
    where: { month }
  });

  if (!sharedTemplate) {
    console.log('No shared template found for', month);
    await prisma.$disconnect();
    pool.end();
    return;
  }

  console.log('Shared template:', {
    morningRoutine: sharedTemplate.morningRoutine,
    healthHabits: sharedTemplate.healthHabits,
    nightRoutine: sharedTemplate.nightRoutine
  });

  // Get both users
  const users = await prisma.user.findMany({
    where: { name: { in: ['Vallis', 'Kashina'] } }
  });

  // Update both users with the shared template
  for (const user of users) {
    await prisma.monthlyRoutineTemplate.upsert({
      where: {
        userId_month: {
          userId: user.id,
          month
        }
      },
      update: {
        morningRoutine: sharedTemplate.morningRoutine as any,
        healthHabits: sharedTemplate.healthHabits as any,
        nightRoutine: sharedTemplate.nightRoutine as any
      },
      create: {
        userId: user.id,
        month,
        morningRoutine: sharedTemplate.morningRoutine as any,
        healthHabits: sharedTemplate.healthHabits as any,
        nightRoutine: sharedTemplate.nightRoutine as any
      }
    });
    console.log(`✅ Updated template for ${user.name}`);
  }

  console.log('\n✅ Templates synchronized for', month);
  
  await prisma.$disconnect();
  pool.end();
}

syncTemplates().catch(console.error);
