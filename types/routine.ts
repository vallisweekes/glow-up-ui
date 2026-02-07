export type User = 'Vallis' | 'Kashina';

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface NutritionEntry {
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface MonthlyRoutineTemplate {
  month: string; // YYYY-MM format
  user: User;
  title: string;
  focus: string;
  morningRoutine: Omit<DailyTask, 'completed'>[];
  healthHabits: Omit<DailyTask, 'completed'>[];
  nightRoutine: Omit<DailyTask, 'completed'>[];
  weeklyGoals: string[];
  readingGoal?: string;
}

export interface DailyRoutine {
  date: string; // YYYY-MM-DD format
  user: User;
  month: string; // YYYY-MM format
  morningRoutine: DailyTask[];
  healthHabits: DailyTask[];
  nutrition: NutritionEntry;
  nightRoutine: DailyTask[];
  pushUpsCount: number;
  stepsCount: number;
}

export interface WeeklyCheckIn {
  weekNumber: number;
  month: string; // YYYY-MM format
  user: User;
  exercisedTwice: boolean;
  mentalHealthCheckIn: boolean;
  selfCareAction: boolean;
  customGoals?: { text: string; completed: boolean }[];
  oneWin: string;
  oneProud: string;
  oneImprove: string;
}

export interface MonthlyReading {
  user: User;
  month: string; // YYYY-MM format
  bookTitle: string;
  readThisWeek: boolean[];
  finishedBook: boolean;
}

export const defaultMorningRoutine: Omit<DailyTask, 'completed'>[] = [
  { id: 'morning-1', text: 'Prayers / Affirmations / 5 minute meditation or yoga stretching' },
  { id: 'morning-2', text: '10 / 15 mins listen to Eric Thomas or Les Brown' },
  { id: 'morning-3', text: 'Oil pulling' },
  { id: 'morning-4', text: 'Drink clove tea (on an empty stomach)' },
];

export const defaultHealthHabits: Omit<DailyTask, 'completed'>[] = [
  { id: 'health-1', text: 'Drink 8-10 cups of water' },
  { id: 'health-2', text: 'Take supplements' },
  { id: 'health-3', text: 'No sugar or unhealthy snacking' },
  { id: 'health-4', text: 'Limited / no alcohol' },
  { id: 'health-6', text: 'Teeth whitening strips' },
];

export const defaultNightRoutine: Omit<DailyTask, 'completed'>[] = [
  { id: 'night-1', text: 'Nightly prayers/affirmations' },
  { id: 'night-2', text: 'Gratitude or reflection moment' },
];

export const defaultWeeklyGoals: string[] = [
  'Exercised at least 2 times a week',
  'Mental health check-in (journal or talk)',
  'Self-presentation & self care action - Health MOT, dental hygiene cleaning, nails',
];

// Shared template (admin-managed for both users)
export interface SharedMonthlyTemplate {
  month: string; // YYYY-MM format
  title: string;
  focus: string;
  morningRoutine: Omit<DailyTask, 'completed'>[];
  healthHabits: Omit<DailyTask, 'completed'>[];
  nightRoutine: Omit<DailyTask, 'completed'>[];
  weeklyGoals: string[];
  readingGoal?: string;
}
