import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool as PgPool } from 'pg';

function createPrismaClient() {
  const connectionString =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_NON_POOLING ||
    process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new PgPool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  console.log('Creating users...');
  
  const vallis = await prisma.user.upsert({
    where: { name: 'Vallis' },
    update: {},
    create: {
      name: 'Vallis',
      pin: null,
    },
  });
  
  const kashina = await prisma.user.upsert({
    where: { name: 'Kashina' },
    update: {},
    create: {
      name: 'Kashina',
      pin: null,
    },
  });
  
  console.log('✅ Users created successfully:');
  console.log('  - Vallis (ID:', vallis.id + ')');
  console.log('  - Kashina (ID:', kashina.id + ')');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
