import 'dotenv/config';
import { Pool as PgPool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function createTargetPrisma() {
  const connectionString =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_NON_POOLING ||
    process.env.DIRECT_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const pool = new PgPool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function createLegacyPool() {
  const legacyUrl = process.env.LEGACY_DATABASE_URL;
  if (!legacyUrl) throw new Error('LEGACY_DATABASE_URL is not set');
  return new PgPool({ connectionString: legacyUrl });
}

function parseJson<T>(val: any): T {
  if (val == null) return val as T;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return val as T;
    }
  }
  return val as T;
}

async function main() {
  const legacy = createLegacyPool();
  const prisma = createTargetPrisma();

  console.log('🔗 Reading legacy data...');

  const legacyUsersRes = await legacy.query('SELECT DISTINCT "user" FROM "DailyRoutine"');
  const legacyUsers = legacyUsersRes.rows.map((r) => r.user as string).filter(Boolean);

  console.log('👥 Ensuring users exist:', legacyUsers);
  const userMap: Record<string, string> = {};
  for (const name of legacyUsers) {
    const u = await prisma.user.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true },
    });
    userMap[name] = u.id;
  }

  console.log('📆 Migrating DailyRoutine...');
  const drRes = await legacy.query('SELECT * FROM "DailyRoutine"');
  for (const r of drRes.rows) {
    const userName: string = r.user;
    const userId = userMap[userName];
    if (!userId) continue;
    await prisma.dailyRoutine.upsert({
      where: { date_userId: { date: r.date, userId } },
      update: {
        month: r.month,
        morningRoutine: parseJson(r.morningRoutine),
        healthHabits: parseJson(r.healthHabits),
        nightRoutine: parseJson(r.nightRoutine),
        nutrition: parseJson(r.nutrition),
        pushUpsCount: r.pushUpsCount ?? 0,
        stepsCount: r.stepsCount ?? 0,
      },
      create: {
        date: r.date,
        month: r.month,
        userId,
        morningRoutine: parseJson(r.morningRoutine),
        healthHabits: parseJson(r.healthHabits),
        nightRoutine: parseJson(r.nightRoutine),
        nutrition: parseJson(r.nutrition),
        pushUpsCount: r.pushUpsCount ?? 0,
        stepsCount: r.stepsCount ?? 0,
      },
    });
  }

  console.log('🗓️ Migrating WeeklyCheckIn...');
  const wcRes = await legacy.query('SELECT * FROM "WeeklyCheckIn"');
  for (const r of wcRes.rows) {
    const userName: string = r.user;
    const userId = userMap[userName];
    if (!userId) continue;
    await prisma.weeklyCheckIn.upsert({
      where: { userId_year_month_weekNumber: { userId, year: r.year, month: r.month, weekNumber: r.weekNumber } },
      update: {
        glowUpEntries: parseJson(r.glowUpEntries),
        customGoals: parseJson(r.customGoals),
        oneWin: r.oneWin ?? '',
        oneProud: r.oneProud ?? '',
        oneImprove: r.oneImprove ?? '',
        // If legacy had reflections, try parse
        customReflections: parseJson(r.customReflections ?? '[]'),
      } as any,
      create: {
        userId,
        year: r.year,
        month: r.month,
        weekNumber: r.weekNumber,
        glowUpEntries: parseJson(r.glowUpEntries),
        customGoals: parseJson(r.customGoals),
        oneWin: r.oneWin ?? '',
        oneProud: r.oneProud ?? '',
        oneImprove: r.oneImprove ?? '',
        customReflections: parseJson(r.customReflections ?? '[]'),
      } as any,
    });
  }

  console.log('📚 Migrating MonthlyReading...');
  const mrRes = await legacy.query('SELECT * FROM "MonthlyReading"');
  for (const r of mrRes.rows) {
    const userName: string = r.user;
    const userId = userMap[userName];
    if (!userId) continue;
    await prisma.monthlyReading.upsert({
      where: { userId_month: { userId, month: r.month } },
      update: {
        bookTitle: r.bookTitle ?? '',
        readThisWeek: parseJson(r.readThisWeek),
        finishedBook: r.finishedBook ?? false,
      },
      create: {
        userId,
        month: r.month,
        bookTitle: r.bookTitle ?? '',
        readThisWeek: parseJson(r.readThisWeek),
        finishedBook: r.finishedBook ?? false,
      },
    });
  }

  console.log('✅ Migration complete');

  await prisma.$disconnect();
  await legacy.end();
}

main().catch(async (e) => {
  console.error('❌ Migration failed:', e);
  process.exit(1);
});
