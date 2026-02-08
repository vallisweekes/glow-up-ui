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
  console.log('Seeding database...');

  // Create Vallis
  const vallis = await prisma.user.upsert({
    where: { name: 'Vallis' },
    update: {},
    create: {
      name: 'Vallis',
      pin: '123456', // Default PIN, should be changed by user
    },
  });
  console.log('Created/updated user:', vallis.name);

  // Create Kashina
  const kashina = await prisma.user.upsert({
    where: { name: 'Kashina' },
    update: {},
    create: {
      name: 'Kashina',
      pin: '654321', // Default PIN, should be changed by user
    },
  });
  console.log('Created/updated user:', kashina.name);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
