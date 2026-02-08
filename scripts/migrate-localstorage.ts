/**
 * Migration Helper Script
 * 
 * This script helps you migrate data from localStorage to the database.
 * 
 * Instructions:
 * 1. Open your browser console on localhost:3000
 * 2. Run this code to export localStorage data:
 * 
 * console.log(JSON.stringify({
 *   routines: localStorage.getItem('glowup-daily-routines'),
 *   checkIns: localStorage.getItem('glowup-weekly-checkins'),
 *   templates: localStorage.getItem('glowup-monthly-templates'),
 *   reading: localStorage.getItem('glowup-monthly-reading')
 * }));
 * 
 * 3. Copy the output and save it to a file called 'localstorage-export.json'
 * 4. Run: npx tsx scripts/migrate-localstorage.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool as PgPool } from 'pg';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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

async function migrate() {
  console.log('🔄 Starting migration from localStorage to database...');

  const exportPath = path.join(process.cwd(), 'localstorage-export.json');
  
  if (!fs.existsSync(exportPath)) {
    console.log('❌ No localstorage-export.json file found.');
    console.log('📋 Follow the instructions in the script header to export your localStorage data.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));

  // Get users
  const vallis = await prisma.user.findUnique({ where: { name: 'Vallis' } });
  const kashina = await prisma.user.findUnique({ where: { name: 'Kashina' } });

  if (!vallis || !kashina) {
    console.log('❌ Users not found. Run seed script first.');
    return;
  }

  // Migrate daily routines
  if (data.routines) {
    const routines = JSON.parse(data.routines);
    console.log(`📅 Migrating ${routines.length} daily routines...`);
    
    for (const routine of routines) {
      const userId = routine.user === 'Vallis' ? vallis.id : kashina.id;
      await prisma.dailyRoutine.upsert({
        where: { date_userId: { date: routine.date, userId } },
        update: {
          month: routine.month,
          morningRoutine: routine.morningRoutine,
          healthHabits: routine.healthHabits,
          nightRoutine: routine.nightRoutine,
          nutrition: routine.nutrition,
          pushUpsCount: routine.pushUpsCount || 0,
          stepsCount: routine.stepsCount || 0,
        },
        create: {
          date: routine.date,
          userId,
          month: routine.month,
          morningRoutine: routine.morningRoutine,
          healthHabits: routine.healthHabits,
          nightRoutine: routine.nightRoutine,
          nutrition: routine.nutrition,
          pushUpsCount: routine.pushUpsCount || 0,
          stepsCount: routine.stepsCount || 0,
        },
      });
    }
    console.log('✅ Daily routines migrated!');
  }

  // Migrate weekly check-ins
  if (data.checkIns) {
    const checkIns = JSON.parse(data.checkIns);
    console.log(`📝 Migrating ${checkIns.length} weekly check-ins...`);
    
    for (const checkIn of checkIns) {
      const userId = checkIn.user === 'Vallis' ? vallis.id : kashina.id;
      await prisma.weeklyCheckIn.upsert({
        where: {
          userId_year_month_weekNumber: {
            userId,
            year: checkIn.year,
            month: checkIn.month,
            weekNumber: checkIn.weekNumber,
          },
        },
        update: {
          glowUpEntries: checkIn.glowUpEntries || [],
          customGoals: checkIn.customGoals || [],
          oneWin: checkIn.oneWin || '',
          oneProud: checkIn.oneProud || '',
          oneImprove: checkIn.oneImprove || '',
          customReflections: checkIn.customReflections || [],
        },
        create: {
          userId,
          year: checkIn.year,
          month: checkIn.month,
          weekNumber: checkIn.weekNumber,
          glowUpEntries: checkIn.glowUpEntries || [],
          customGoals: checkIn.customGoals || [],
          oneWin: checkIn.oneWin || '',
          oneProud: checkIn.oneProud || '',
          oneImprove: checkIn.oneImprove || '',
          customReflections: checkIn.customReflections || [],
        },
      });
    }
    console.log('✅ Weekly check-ins migrated!');
  }

  // Migrate monthly templates
  if (data.templates) {
    const templates = JSON.parse(data.templates);
    console.log(`📋 Migrating ${templates.length} monthly templates...`);
    
    for (const template of templates) {
      const userId = template.user === 'Vallis' ? vallis.id : kashina.id;
      await prisma.monthlyRoutineTemplate.upsert({
        where: { userId_month: { userId, month: template.month } },
        update: {
          morningRoutine: template.morningRoutine,
          healthHabits: template.healthHabits,
          nightRoutine: template.nightRoutine,
        },
        create: {
          userId,
          month: template.month,
          morningRoutine: template.morningRoutine,
          healthHabits: template.healthHabits,
          nightRoutine: template.nightRoutine,
        },
      });
    }
    console.log('✅ Monthly templates migrated!');
  }

  // Migrate monthly reading
  if (data.reading) {
    const readings = JSON.parse(data.reading);
    console.log(`📚 Migrating ${readings.length} monthly reading records...`);
    
    for (const reading of readings) {
      const userId = reading.user === 'Vallis' ? vallis.id : kashina.id;
      await prisma.monthlyReading.upsert({
        where: { userId_month: { userId, month: reading.month } },
        update: {
          bookTitle: reading.bookTitle || '',
          readThisWeek: reading.readThisWeek || [],
          finishedBook: reading.finishedBook || false,
        },
        create: {
          userId,
          month: reading.month,
          bookTitle: reading.bookTitle || '',
          readThisWeek: reading.readThisWeek || [],
          finishedBook: reading.finishedBook || false,
        },
      });
    }
    console.log('✅ Monthly reading migrated!');
  }

  console.log('🎉 Migration completed successfully!');
}

migrate()
  .catch((e) => {
    console.error('❌ Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
