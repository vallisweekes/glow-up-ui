/**
 * Prisma Database Service
 * 
 * This module provides database operations using Prisma ORM.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool as PgPool } from 'pg';
import type { DailyRoutine, User, WeeklyCheckIn } from '@/types/routine';
import type { SharedMonthlyTemplate } from '@/src/store/api';
// Using Neon HTTP driver; no WebSocket setup required

// Singleton pattern for Prisma Client (Next.js best practice)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Prioritize Vercel's Prisma-specific URL, then standard DATABASE_URL
  const connectionString =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_NON_POOLING ||
    process.env.DIRECT_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('[Prisma] Initializing (pg TCP) with connection string:', connectionString.substring(0, 40) + '...');

  try {
    // Use the connection string as-is (Vercel/Neon provide proper SSL configuration)
    const pool = new PgPool({ connectionString });
    const adapter = new PrismaPg(pool);

    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    console.log('[Prisma] Client created successfully (pg adapter)');
    return client;
  } catch (error) {
    console.error('[Prisma] Error creating client (pg):', error);
    throw error;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ==================== User Management ====================

export async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByName(name: string) {
  return await prisma.user.findUnique({
    where: { name },
  });
}

export async function createUser(name: string, pin?: string) {
  return await prisma.user.create({
    data: { name, pin },
  });
}

export async function updateUserPin(id: string, pin: string) {
  return await prisma.user.update({
    where: { id },
    data: { pin },
  });
}

export async function verifyUserPin(id: string, pin: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { pin: true },
  });
  return user?.pin === pin;
}

// ==================== Daily Routines ====================

export async function getDailyRoutine(date: string, userId: string): Promise<DailyRoutine | null> {
  const record = await prisma.dailyRoutine.findUnique({
    where: { date_userId: { date, userId } },
    include: { user: true },
  });

  if (!record) return null;

  return {
    date: record.date,
    user: record.user.name as User,
    month: record.month,
    morningRoutine: record.morningRoutine as any,
    healthHabits: record.healthHabits as any,
    nightRoutine: record.nightRoutine as any,
    nutrition: record.nutrition as any,
    pushUpsCount: record.pushUpsCount,
    stepsCount: record.stepsCount,
    moodRating: record.moodRating ?? undefined,
    energyLevel: record.energyLevel ?? undefined,
    moodNotes: record.moodNotes ?? undefined,
  };
}

export async function saveDailyRoutine(routine: DailyRoutine, userId: string): Promise<DailyRoutine> {
  const record = await prisma.dailyRoutine.upsert({
    where: {
      date_userId: { date: routine.date, userId },
    },
    update: {
      month: routine.month,
      morningRoutine: routine.morningRoutine as any,
      healthHabits: routine.healthHabits as any,
      nightRoutine: routine.nightRoutine as any,
      nutrition: routine.nutrition as any,
      pushUpsCount: routine.pushUpsCount,
      stepsCount: routine.stepsCount,
    },
    create: {
      date: routine.date,
      userId,
      month: routine.month,
      morningRoutine: routine.morningRoutine as any,
      healthHabits: routine.healthHabits as any,
      nightRoutine: routine.nightRoutine as any,
      nutrition: routine.nutrition as any,
      pushUpsCount: routine.pushUpsCount,
      stepsCount: routine.stepsCount,
    },
    include: { user: true },
  });

  // Patch mood fields via raw SQL to avoid Prisma client schema mismatch
  try {
    const moodRating = routine.moodRating ?? null;
    const energyLevel = routine.energyLevel ?? null;
    const moodNotes = routine.moodNotes ?? null;

    if (moodRating != null || energyLevel != null || moodNotes != null) {
      await prisma.$executeRaw`
        UPDATE "DailyRoutine"
        SET "moodRating" = ${moodRating}, "energyLevel" = ${energyLevel}, "moodNotes" = ${moodNotes}
        WHERE "date" = ${routine.date} AND "userId" = ${userId}
      `;
    }
  } catch (e) {
    console.error('[Prisma] Failed to patch mood fields via raw SQL:', e);
  }

  // Re-fetch to return latest values
  const updated = await prisma.dailyRoutine.findUnique({
    where: { date_userId: { date: routine.date, userId } },
    include: { user: true },
  });

  const recAny: any = updated as any;
  return {
    date: updated!.date,
    user: recAny.user.name as User,
    month: updated!.month,
    morningRoutine: updated!.morningRoutine as any,
    healthHabits: updated!.healthHabits as any,
    nightRoutine: updated!.nightRoutine as any,
    nutrition: updated!.nutrition as any,
    pushUpsCount: updated!.pushUpsCount,
    stepsCount: updated!.stepsCount,
    moodRating: updated!.moodRating ?? undefined,
    energyLevel: updated!.energyLevel ?? undefined,
    moodNotes: updated!.moodNotes ?? undefined,
  };
}

export async function getMonthlyRoutines(month: string, userId: string): Promise<DailyRoutine[]> {
  const records = await prisma.dailyRoutine.findMany({
    where: {
      userId,
      month,
    },
    include: { user: true },
    orderBy: { date: 'asc' },
  });

  return records.map((record) => ({
    date: record.date,
    user: record.user.name as User,
    month: record.month,
    morningRoutine: record.morningRoutine as any,
    healthHabits: record.healthHabits as any,
    nightRoutine: record.nightRoutine as any,
    nutrition: record.nutrition as any,
    pushUpsCount: record.pushUpsCount,
    stepsCount: record.stepsCount,
    moodRating: record.moodRating ?? undefined,
    energyLevel: record.energyLevel ?? undefined,
    moodNotes: record.moodNotes ?? undefined,
  }));
}

export async function deleteDailyRoutine(date: string, userId: string): Promise<boolean> {
  try {
    await prisma.dailyRoutine.delete({
      where: { date_userId: { date, userId } },
    });
    return true;
  } catch {
    return false;
  }
}

// ==================== Shared Templates ====================

export async function getSharedTemplate(month: string): Promise<SharedMonthlyTemplate | null> {
  const record = await prisma.sharedTemplate.findUnique({
    where: { month },
  });

  if (!record) return null;

  return {
    month: record.month,
    title: record.title,
    focus: record.focus,
    morningRoutine: record.morningRoutine as any,
    healthHabits: record.healthHabits as any,
    nightRoutine: record.nightRoutine as any,
    weeklyGoals: record.weeklyGoals as any,
    readingGoal: record.readingGoal ?? undefined,
    finishedBook: record.finishedBook,
  };
}

export async function saveSharedTemplate(template: SharedMonthlyTemplate): Promise<SharedMonthlyTemplate> {
  const record = await prisma.sharedTemplate.upsert({
    where: { month: template.month },
    update: {
      title: template.title,
      focus: template.focus,
      morningRoutine: template.morningRoutine as any,
      healthHabits: template.healthHabits as any,
      nightRoutine: template.nightRoutine as any,
      weeklyGoals: template.weeklyGoals as any,
      readingGoal: template.readingGoal ?? null,
      finishedBook: template.finishedBook ?? false,
    },
    create: {
      month: template.month,
      title: template.title,
      focus: template.focus,
      morningRoutine: template.morningRoutine as any,
      healthHabits: template.healthHabits as any,
      nightRoutine: template.nightRoutine as any,
      weeklyGoals: template.weeklyGoals as any,
      readingGoal: template.readingGoal ?? null,
      finishedBook: template.finishedBook ?? false,
    },
  });

  return {
    month: record.month,
    title: record.title,
    focus: record.focus,
    morningRoutine: record.morningRoutine as any,
    healthHabits: record.healthHabits as any,
    nightRoutine: record.nightRoutine as any,
    weeklyGoals: record.weeklyGoals as any,
    readingGoal: record.readingGoal ?? undefined,
    finishedBook: record.finishedBook,
  };
}

export async function deleteSharedTemplate(month: string): Promise<boolean> {
  try {
    await prisma.sharedTemplate.delete({
      where: { month },
    });
    return true;
  } catch {
    return false;
  }
}

// ==================== Utility Functions ====================

export async function getAllRoutines(): Promise<DailyRoutine[]> {
  const records = await prisma.dailyRoutine.findMany({
    include: { user: true },
    orderBy: [{ date: 'desc' }],
  });

  return records.map((record) => ({
    date: record.date,
    user: record.user.name as User,
    month: record.month,
    morningRoutine: record.morningRoutine as any,
    healthHabits: record.healthHabits as any,
    nightRoutine: record.nightRoutine as any,
    nutrition: record.nutrition as any,
    pushUpsCount: record.pushUpsCount,
    stepsCount: record.stepsCount,
  }));
}

export async function getAllTemplates(): Promise<SharedMonthlyTemplate[]> {
  const records = await prisma.sharedTemplate.findMany({
    orderBy: { month: 'desc' },
  });

  return records.map((record) => ({
    month: record.month,
    title: record.title,
    focus: record.focus,
    morningRoutine: record.morningRoutine as any,
    healthHabits: record.healthHabits as any,
    nightRoutine: record.nightRoutine as any,
    weeklyGoals: record.weeklyGoals as any,
    readingGoal: record.readingGoal ?? undefined,
  }));
}

export async function getStoreStats() {
  const [routinesCount, templatesCount, checkInsCount, usersCount] = await Promise.all([
    prisma.dailyRoutine.count(),
    prisma.sharedTemplate.count(),
    prisma.weeklyCheckIn.count(),
    prisma.user.count(),
  ]);

  return { routinesCount, templatesCount, checkInsCount, usersCount };
}

// ==================== Weekly Check-Ins ====================

export async function getWeeklyCheckIn(
  year: number,
  month: string,
  week: number,
  userId: string
): Promise<WeeklyCheckIn | null> {
  const record = await prisma.weeklyCheckIn.findUnique({
    where: {
      userId_year_month_weekNumber: { userId, year, month, weekNumber: week },
    },
    include: { user: true },
  });

  if (!record) return null;

  const rec: any = record as any;
  return {
    weekNumber: record.weekNumber,
    month: record.month,
    year: record.year,
    user: record.user.name as User,
    glowUpEntries: record.glowUpEntries as any,
    customGoals: (record.customGoals as any) || [],
    oneWin: record.oneWin,
    oneProud: record.oneProud,
    oneImprove: record.oneImprove,
    customReflections: (rec.customReflections as any) || [],
  };
}

export async function saveWeeklyCheckIn(checkIn: WeeklyCheckIn, userId: string): Promise<WeeklyCheckIn> {
  const record = await prisma.weeklyCheckIn.upsert({
    where: {
      userId_year_month_weekNumber: {
        userId,
        year: checkIn.year,
        month: checkIn.month,
        weekNumber: checkIn.weekNumber,
      },
    },
    update: {
      glowUpEntries: checkIn.glowUpEntries as any,
      customGoals: checkIn.customGoals as any,
      oneWin: checkIn.oneWin,
      oneProud: checkIn.oneProud,
      oneImprove: checkIn.oneImprove,
      customReflections: (checkIn as any).customReflections as any,
    } as any,
    create: {
      userId,
      year: checkIn.year,
      month: checkIn.month,
      weekNumber: checkIn.weekNumber,
      glowUpEntries: checkIn.glowUpEntries as any,
      customGoals: checkIn.customGoals as any,
      oneWin: checkIn.oneWin,
      oneProud: checkIn.oneProud,
      oneImprove: checkIn.oneImprove,
      customReflections: (checkIn as any).customReflections as any,
    } as any,
    include: { user: true },
  });

  const rec2: any = record as any;
  return {
    weekNumber: record.weekNumber,
    month: record.month,
    year: record.year,
    user: record.user.name as User,
    glowUpEntries: record.glowUpEntries as any,
    customGoals: record.customGoals as any,
    oneWin: record.oneWin,
    oneProud: record.oneProud,
    oneImprove: record.oneImprove,
    customReflections: rec2.customReflections as any,
  };
}

// ==================== Monthly Templates (User-Specific) ====================

export async function getMonthlyTemplate(month: string, userId: string) {
  const record = await prisma.monthlyRoutineTemplate.findUnique({
    where: { userId_month: { userId, month } },
    include: { user: true },
  });

  if (!record) return null;

  return {
    month: record.month,
    user: record.user.name as User,
    morningRoutine: record.morningRoutine as any,
    healthHabits: record.healthHabits as any,
    nightRoutine: record.nightRoutine as any,
  };
}

export async function saveMonthlyTemplate(template: any, userId: string) {
  const record = await prisma.monthlyRoutineTemplate.upsert({
    where: { userId_month: { userId, month: template.month } },
    update: {
      morningRoutine: template.morningRoutine as any,
      healthHabits: template.healthHabits as any,
      nightRoutine: template.nightRoutine as any,
    },
    create: {
      userId,
      month: template.month,
      morningRoutine: template.morningRoutine as any,
      healthHabits: template.healthHabits as any,
      nightRoutine: template.nightRoutine as any,
    },
    include: { user: true },
  });

  return {
    month: record.month,
    user: record.user.name as User,
    morningRoutine: record.morningRoutine as any,
    healthHabits: record.healthHabits as any,
    nightRoutine: record.nightRoutine as any,
  };
}

export async function deleteMonthlyTemplate(month: string, userId: string): Promise<boolean> {
  try {
    await prisma.monthlyRoutineTemplate.delete({
      where: { userId_month: { userId, month } },
    });
    return true;
  } catch {
    return false;
  }
}

// ==================== Monthly Reading ====================

export async function getMonthlyReading(month: string, userId: string) {
  const record = await prisma.monthlyReading.findUnique({
    where: { userId_month: { userId, month } },
    include: { user: true },
  });

  if (!record) return null;

  return {
    month: record.month,
    user: record.user.name as User,
    bookTitle: record.bookTitle,
    readThisWeek: record.readThisWeek as any,
    finishedBook: record.finishedBook,
  };
}

export async function saveMonthlyReading(reading: any, userId: string) {
  const record = await prisma.monthlyReading.upsert({
    where: { userId_month: { userId, month: reading.month } },
    update: {
      bookTitle: reading.bookTitle,
      readThisWeek: reading.readThisWeek as any,
      finishedBook: reading.finishedBook,
    },
    create: {
      userId,
      month: reading.month,
      bookTitle: reading.bookTitle,
      readThisWeek: reading.readThisWeek as any,
      finishedBook: reading.finishedBook,
    },
    include: { user: true },
  });

  return {
    month: record.month,
    user: record.user.name as User,
    bookTitle: record.bookTitle,
    readThisWeek: record.readThisWeek as any,
    finishedBook: record.finishedBook,
  };
}
