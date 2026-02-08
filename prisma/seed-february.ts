import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool as PgPool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

const connectionString =
  process.env.DATABASE_URL_NON_POOLING ||
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new PgPool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function main() {
  console.log('🌱 Seeding February 2026 template...');

  // Default tasks from types/routine.ts
  const defaultMorningRoutine = [
    { id: 'morning-1', text: 'Prayers / Affirmations / 5 minute meditation or yoga stretching' },
    { id: 'morning-2', text: '10 / 15 mins listen to Eric Thomas or Les Brown' },
    { id: 'morning-3', text: 'Oil pulling' },
    { id: 'morning-4', text: 'Drink clove tea (on an empty stomach)' },
  ];

  const defaultHealthHabits = [
    { id: 'health-1', text: 'Drink 8-10 cups of water' },
    { id: 'health-2', text: 'Take supplements' },
    { id: 'health-3', text: 'No sugar or unhealthy snacking' },
    { id: 'health-4', text: 'Limited / no alcohol' },
    { id: 'health-6', text: 'Teeth whitening strips' },
  ];

  const defaultNightRoutine = [
    { id: 'night-1', text: 'Nightly prayers/affirmations' },
    { id: 'night-2', text: 'Gratitude or reflection moment' },
  ];

  const defaultWeeklyGoals = [
    'Exercised at least 2 times a week',
    'Mental health check-in (journal or talk)',
    'Self-presentation & self care action - Health MOT, dental hygiene cleaning, nails',
  ];

  // Create/update February 2026 shared template
  const februaryTemplate = await prisma.sharedTemplate.upsert({
    where: { month: '2026-02' },
    update: {
      title: 'Glow Up February 2026 Routine',
      focus: 'Mental • Physical • Spiritual',
      morningRoutine: defaultMorningRoutine,
      healthHabits: defaultHealthHabits,
      nightRoutine: defaultNightRoutine,
      weeklyGoals: defaultWeeklyGoals,
      readingGoal: 'The Power of Now',
      finishedBook: false,
    },
    create: {
      month: '2026-02',
      title: 'Glow Up February 2026 Routine',
      focus: 'Mental • Physical • Spiritual',
      morningRoutine: defaultMorningRoutine,
      healthHabits: defaultHealthHabits,
      nightRoutine: defaultNightRoutine,
      weeklyGoals: defaultWeeklyGoals,
      readingGoal: 'The Power of Now',
      finishedBook: false,
    },
  });

  console.log('✅ February 2026 template created:', februaryTemplate.month);
  console.log('📋 Title:', februaryTemplate.title);
  console.log('🎯 Focus:', februaryTemplate.focus);
  console.log('☀️ Morning tasks:', februaryTemplate.morningRoutine);
  console.log('💪 Health habits:', februaryTemplate.healthHabits);
  console.log('🌙 Night routine:', februaryTemplate.nightRoutine);
  console.log('📖 Reading goal:', februaryTemplate.readingGoal);
  console.log('✅ Finished book:', februaryTemplate.finishedBook);
  
  console.log('\n🎉 February seeding completed!');
  console.log('\n📝 Note: This is a SHARED template that applies to both Vallis and Kashina.');
  console.log('📚 The reading goal and completion status are SHARED between both users.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding February template:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
