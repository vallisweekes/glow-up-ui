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
  const userName = process.env.USER_NAME || process.env.USER;
  const date = process.env.DATE; // YYYY-MM-DD
  const mood = Number(process.env.MOOD || '');
  const energy = Number(process.env.ENERGY || '');
  const notes = process.env.NOTES || '';

  if (!userName || !date || isNaN(mood) || isNaN(energy)) {
    console.error('Usage: USER_NAME="Vallis|Kashina" DATE="YYYY-MM-DD" MOOD=1-5 ENERGY=1-5 [NOTES="..."] npx tsx scripts/set-daily-mood.ts');
    process.exit(1);
  }

  const { prisma, pool } = createPrisma();
  try {
    const user = await prisma.user.findUnique({ where: { name: userName } });
    if (!user) {
      console.error('❌ User not found:', userName);
      process.exit(1);
    }

    const existing = await prisma.dailyRoutine.findUnique({ where: { date_userId: { date, userId: user.id } } });
    if (!existing) {
      console.error('❌ No routine found for', userName, 'on', date);
      process.exit(1);
    }

    await prisma.dailyRoutine.update({
      where: { date_userId: { date, userId: user.id } },
      data: { moodRating: mood, energyLevel: energy, moodNotes: notes || null },
    });

    console.log(`✅ Set mood/energy for ${userName} on ${date} to mood=${mood}, energy=${energy}`);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

main();
