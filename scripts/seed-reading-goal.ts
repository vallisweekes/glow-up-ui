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
  return new PrismaClient({ adapter });
}

function getMonthString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function main() {
  const prisma = createPrisma();
  const month = process.env.MONTH || getMonthString();
  const bookTitle = process.env.BOOK || 'The Power of Now';
  console.log('Seeding MonthlyReading for', month, 'book:', bookTitle);

  const users = await prisma.user.findMany({ select: { id: true, name: true } });
  for (const u of users) {
    const rec = await prisma.monthlyReading.upsert({
      where: { userId_month: { userId: u.id, month } },
      update: {
        bookTitle,
        readThisWeek: [],
        finishedBook: false,
      },
      create: {
        userId: u.id,
        month,
        bookTitle,
        readThisWeek: [],
        finishedBook: false,
      },
    });
    console.log(`Seeded for ${u.name}:`, rec.bookTitle);
  }

  await prisma.$disconnect();
  console.log('✅ Done');
}

main().catch((e) => {
  console.error('❌ Failed:', e);
  process.exit(1);
});
