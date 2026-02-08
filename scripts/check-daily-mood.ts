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
  const prisma = new PrismaClient({ adapter });
  return { prisma, pool };
}

async function main() {
  const date = process.env.DATE; // YYYY-MM-DD
  if (!date) {
    console.error('Usage: DATE="YYYY-MM-DD" npx tsx scripts/check-daily-mood.ts');
    process.exit(1);
  }
  const { prisma, pool } = createPrisma();
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true } });
    for (const u of users) {
      const rec = await prisma.dailyRoutine.findUnique({ where: { date_userId: { date, userId: u.id } } });
      if (!rec) {
        console.log(`${u.name}: No routine for ${date}`);
      } else {
        console.log(`${u.name}: moodRating=${rec.moodRating ?? 'null'} energyLevel=${rec.energyLevel ?? 'null'} moodNotes=${rec.moodNotes ?? ''}`);
      }
    }
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

main();
