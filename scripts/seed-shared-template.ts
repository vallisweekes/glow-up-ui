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

async function main() {
  const prisma = createPrisma();
  const month = '2026-02';
  
  const template = await prisma.sharedTemplate.upsert({
    where: { month },
    update: {
      title: 'February Goals',
      focus: '',
      morningRoutine: [{ id: 'pushups', text: '💪 Push-ups (20x)' }],
      healthHabits: [{ id: 'water', text: '💧 Drink 2L Water' }],
      nightRoutine: [],
      weeklyGoals: [],
      readingGoal: 'The Power of Now',
      finishedBook: false,
    },
    create: {
      month,
      title: 'February Goals',
      focus: '',
      morningRoutine: [{ id: 'pushups', text: '💪 Push-ups (20x)' }],
      healthHabits: [{ id: 'water', text: '💧 Drink 2L Water' }],
      nightRoutine: [],
      weeklyGoals: [],
      readingGoal: 'The Power of Now',
      finishedBook: false,
    },
  });
  
  console.log('✅ Created shared template for', month);
  console.log('Reading goal:', template.readingGoal);
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Failed:', e);
  process.exit(1);
});
