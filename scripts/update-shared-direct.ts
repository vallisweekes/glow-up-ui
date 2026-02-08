import { PrismaClient } from '@prisma/client';
import pkg from 'pg';
const { Pool } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function updateSharedTemplate() {
  const updated = await prisma.sharedTemplate.update({
    where: { month: '2026-02' },
    data: {
      morningRoutine: [
        {id: "morning-1", text: "Prayers / Affirmations / 5 minute meditation or yoga stretching"},
        {id: "morning-2", text: "10 / 15 mins listen to Eric Thomas or Les Brown"},
        {id: "morning-3", text: "Oil pulling"},
        {id: "morning-4", text: "Drink clove tea (on an empty stomach)"}
      ],
      healthHabits: [
        {id: "health-1", text: "Drink 8-10 cups of water"},
        {id: "health-2", text: "Take supplements"},
        {id: "health-3", text: "No sugar or unhealthy snacking"},
        {id: "health-4", text: "Limited / no alcohol"},
        {id: "health-6", text: "Teeth whitening strips"}
      ],
      nightRoutine: [
        {id: "night-1", text: "Nightly prayers/affirmations"},
        {id: "night-2", text: "Gratitude or reflection moment"}
      ]
    }
  });
  
  console.log('✅ Updated shared template successfully!');
  console.log('Morning tasks:', updated.morningRoutine);
  console.log('Health tasks:', updated.healthHabits);
  console.log('Night tasks:', updated.nightRoutine);
  
  await prisma.$disconnect();
  pool.end();
}

updateSharedTemplate().catch(console.error);
