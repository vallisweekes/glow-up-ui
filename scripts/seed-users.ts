import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding users...');

  // Create Vallis
  const vallis = await prisma.user.upsert({
    where: { name: 'Vallis' },
    update: {},
    create: {
      name: 'Vallis',
      pin: null,
    },
  });
  console.log('✓ Created user:', vallis.name);

  // Create Kashina
  const kashina = await prisma.user.upsert({
    where: { name: 'Kashina' },
    update: {},
    create: {
      name: 'Kashina',
      pin: null,
    },
  });
  console.log('✓ Created user:', kashina.name);

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
