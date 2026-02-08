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
      morningRoutine: [
        { id: 'morning-1', text: 'Prayers / Affirmations / 5 minute meditation or yoga stretching' },
        { id: 'morning-2', text: '10 / 15 mins listen to Eric Thomas or Les Brown' },
        { id: 'morning-3', text: 'Oil pulling' },
        { id: 'morning-4', text: 'Drink clove tea (on an empty stomach)' },
      ],
      healthHabits: [
        { id: 'health-1', text: 'Drink 8-10 cups of water' },
        { id: 'health-2', text: 'Take supplements' },
        { id: 'health-3', text: 'No sugar or unhealthy snacking' },
        { id: 'health-4', text: 'Limited / no alcohol' },
        { id: 'health-6', text: 'Teeth whitening strips' },
      ],
      nightRoutine: [
        { id: 'night-1', text: 'Nightly prayers/affirmations' },
        { id: 'night-2', text: 'Gratitude or reflection moment' },
      ],
      weeklyGoals: [],
      readingGoal: 'The Power of Now',
      finishedBook: false,
    },
    create: {
      month,
      title: 'February Goals',
      focus: '',
      morningRoutine: [
        { id: 'morning-1', text: 'Prayers / Affirmations / 5 minute meditation or yoga stretching' },
        { id: 'morning-2', text: '10 / 15 mins listen to Eric Thomas or Les Brown' },
        { id: 'morning-3', text: 'Oil pulling' },
        { id: 'morning-4', text: 'Drink clove tea (on an empty stomach)' },
      ],
      healthHabits: [
        { id: 'health-1', text: 'Drink 8-10 cups of water' },
        { id: 'health-2', text: 'Take supplements' },
        { id: 'health-3', text: 'No sugar or unhealthy snacking' },
        { id: 'health-4', text: 'Limited / no alcohol' },
        { id: 'health-6', text: 'Teeth whitening strips' },
      ],
      nightRoutine: [
        { id: 'night-1', text: 'Nightly prayers/affirmations' },
        { id: 'night-2', text: 'Gratitude or reflection moment' },
      ],
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
