import { PrismaClient } from '@prisma/client';
import pkg from 'pg';
const { Pool } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkTemplates() {
  const templates = await prisma.monthlyRoutineTemplate.findMany({
    where: {
      month: '2026-02'
    },
    include: {
      user: true
    }
  });

  console.log('\n=== February 2026 Templates ===\n');
  templates.forEach(t => {
    console.log(`User: ${t.user.name}`);
    console.log('Morning Routine:', JSON.stringify(t.morningRoutine, null, 2));
    console.log('Health Habits:', JSON.stringify(t.healthHabits, null, 2));
    console.log('Night Routine:', JSON.stringify(t.nightRoutine, null, 2));
    console.log('---\n');
  });

  await prisma.$disconnect();
  pool.end();
}

checkTemplates().catch(console.error);
