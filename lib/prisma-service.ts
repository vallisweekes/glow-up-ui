/**
 * Prisma Database Service
 * 
 * This module provides database operations using Prisma ORM.
 */

import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import type { DailyRoutine, User, WeeklyCheckIn } from '@/types/routine';
import type { SharedMonthlyTemplate } from '@/src/store/api';

// Singleton pattern for Prisma Client (Next.js best practice)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any); // Type assertion for Pool compatibility
  
  return new PrismaClient({
    adapter: adapter as any, // Type assertion for adapter compatibility
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ==================== Daily Routines ====================

export async function getDailyRoutine(date: string, user: User): Promise<DailyRoutine | null> {
  const record = await prisma.dailyRoutine.findUnique({
    where: { date_user: { date, user } },
  });

  if (!record) return null;

  return {
    date: record.date,
    user: record.user as User,
    month: record.month,
    morningRoutine: record.morningRoutine as any,
    healthHabits: record.healthHabits as any,
    nightRoutine: record.nightRoutine as any,
    nutrition: record.nutrition as any,
    pushUpsCount: record.pushUpsCount,
    stepsCount: record.stepsCount,
  };
}

export async function saveDailyRoutine(routine: DailyRoutine): Promise<DailyRoutine> {
  const record = await prisma.dailyRoutine.upsert({
    where: {
      date_user: { date: routine.date, user: routine.user },
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
      user: routine.user,
      month: routine.month,
      morningRoutine: routine.morningRoutine as any,
      healthHabits: routine.healthHabits as any,
      nightRoutine: routine.nightRoutine as any,
      nutrition: routine.nutrition as any,
      pushUpsCount: routine.pushUpsCount,
      stepsCount: routine.stepsCount,
    },
  });

  return {
    date: record.date,
    user: record.user as User,
    month: record.month,
    morningRoutine: record.morningRoutine as any,
    healthHabits: record.healthHabits as any,
    nightRoutine: record.nightRoutine as any,
    nutrition: record.nutrition as any,
    pushUpsCount: record.pushUpsCount,
    stepsCount: record.stepsCount,
  };
}

export async function getMonthlyRoutines(month: string, user: User): Promise<DailyRoutine[]> {
  const records = await prisma.dailyRoutine.findMany({
    where: {
      user,
      month,
    },
    orderBy: { date: 'asc' },
  });

  return records.map((record) => ({
    date: record.date,
    user: record.user as User,
    month: record.month,
    morningRoutine: record.morningRoutine as any,
    healthHabits: record.healthHabits as any,
    nightRoutine: record.nightRoutine as any,
    nutrition: record.nutrition as any,
    pushUpsCount: record.pushUpsCount,
    stepsCount: record.stepsCount,
  }));
}

export async function deleteDailyRoutine(date: string, user: User): Promise<boolean> {
  try {
    await prisma.dailyRoutine.delete({
      where: { date_user: { date, user } },
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
    orderBy: [{ date: 'desc' }],
  });

  return records.map((record) => ({
    date: record.date,
    user: record.user as User,
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
  const [routinesCount, templatesCount, checkInsCount] = await Promise.all([
    prisma.dailyRoutine.count(),
    prisma.sharedTemplate.count(),
    prisma.weeklyCheckIn.count(),
  ]);

  return { routinesCount, templatesCount, checkInsCount };
}

// ==================== Weekly Check-Ins ====================

export async function getWeeklyCheckIn(
  year: number,
  month: string,
  week: number,
  user: User
): Promise<WeeklyCheckIn | null> {
  const record = await prisma.weeklyCheckIn.findUnique({
    where: {
      user_year_month_weekNumber: { user, year, month, weekNumber: week },
    },
  });

  if (!record) return null;

  return {
    weekNumber: record.weekNumber,
    month: record.month,
    year: record.year,
    user: record.user as User,
    glowUpEntries: record.glowUpEntries as any,
    exercisedTwice: record.exercisedTwice,
    mentalHealthCheckIn: record.mentalHealthCheckIn,
    selfCareAction: record.selfCareAction,
    customGoals: record.customGoals as any,
    oneWin: record.oneWin,
    oneProud: record.oneProud,
    oneImprove: record.oneImprove,
  };
}

export async function saveWeeklyCheckIn(checkIn: WeeklyCheckIn): Promise<WeeklyCheckIn> {
  const record = await prisma.weeklyCheckIn.upsert({
    where: {
      user_year_month_weekNumber: {
        user: checkIn.user,
        year: checkIn.year,
        month: checkIn.month,
        weekNumber: checkIn.weekNumber,
      },
    },
    update: {
      glowUpEntries: checkIn.glowUpEntries as any,
      exercisedTwice: checkIn.exercisedTwice,
      mentalHealthCheckIn: checkIn.mentalHealthCheckIn,
      selfCareAction: checkIn.selfCareAction,
      customGoals: checkIn.customGoals as any,
      oneWin: checkIn.oneWin,
      oneProud: checkIn.oneProud,
      oneImprove: checkIn.oneImprove,
    },
    create: {
      user: checkIn.user,
      year: checkIn.year,
      month: checkIn.month,
      weekNumber: checkIn.weekNumber,
      glowUpEntries: checkIn.glowUpEntries as any,
      exercisedTwice: checkIn.exercisedTwice,
      mentalHealthCheckIn: checkIn.mentalHealthCheckIn,
      selfCareAction: checkIn.selfCareAction,
      customGoals: checkIn.customGoals as any,
      oneWin: checkIn.oneWin,
      oneProud: checkIn.oneProud,
      oneImprove: checkIn.oneImprove,
    },
  });

  return {
    weekNumber: record.weekNumber,
    month: record.month,
    year: record.year,
    user: record.user as User,
    glowUpEntries: record.glowUpEntries as any,
    exercisedTwice: record.exercisedTwice,
    mentalHealthCheckIn: record.mentalHealthCheckIn,
    selfCareAction: record.selfCareAction,
    customGoals: record.customGoals as any,
    oneWin: record.oneWin,
    oneProud: record.oneProud,
    oneImprove: record.oneImprove,
  };
}
