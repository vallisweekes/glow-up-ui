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
  const date = process.env.DATE; // Expect YYYY-MM-DD

  if (!userName || !date) {
    console.error('Usage: USER_NAME="Vallis|Kashina" DATE="YYYY-MM-DD" npx tsx scripts/reset-daily-routine.ts');
    process.exit(1);
  }

  const { prisma, pool } = createPrisma();

  try {
    const user = await prisma.user.findUnique({ where: { name: userName } });
    if (!user) {
      console.error('❌ User not found:', userName);
      await prisma.$disconnect();
      pool.end();
      process.exit(1);
    }

    const existing = await prisma.dailyRoutine.findUnique({
      where: { date_userId: { date, userId: user.id } },
      select: { id: true },
    });

    if (!existing) {
      console.log('ℹ️ No existing routine found for', userName, 'on', date);
    } else {
      await prisma.dailyRoutine.delete({ where: { date_userId: { date, userId: user.id } } });
      console.log(`✅ Deleted routine for ${userName} on ${date}`);
    }

    console.log('💡 On next open, the app will rehydrate from the monthly template.');
  } catch (e) {
    console.error('❌ Error resetting daily routine:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

main();
