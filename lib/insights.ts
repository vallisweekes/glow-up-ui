import type { DailyRoutine } from '@/types/routine';

export type InsightRecommendation = {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actions: string[];
};

export type InsightsSummary = {
  avgMood?: number;
  avgEnergy?: number;
  bestDay?: string;
  worstDay?: string;
  completionRate: number; // 0-100
  streakDays: number;
};

export type InsightsResult = {
  summary: InsightsSummary;
  recommendations: InsightRecommendation[];
};

function safeAvg(values: Array<number | undefined | null>): number | undefined {
  const nums = values.filter((v): v is number => typeof v === 'number');
  if (!nums.length) return undefined;
  const sum = nums.reduce((acc, v) => acc + v, 0);
  return Number((sum / nums.length).toFixed(2));
}

function completionForRoutine(r: DailyRoutine): number {
  const sections = [r.morningRoutine, r.healthHabits, r.nightRoutine];
  const total = sections.reduce((acc, s) => acc + s.length, 0);
  const completed = sections.reduce((acc, s) => acc + s.filter((t) => t.completed).length, 0);
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function computeStreak(routines: DailyRoutine[]): number {
  // Assumes routines are for a single month and dates are YYYY-MM-DD
  const byDate = new Map<string, DailyRoutine>();
  routines.forEach((r) => byDate.set(r.date, r));
  const dates = Array.from(byDate.keys()).sort();
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const r = byDate.get(dates[i])!;
    const comp = completionForRoutine(r);
    if (comp >= 60) streak += 1; else break;
  }
  return streak;
}

export function generateInsights(routines: DailyRoutine[]): InsightsResult {
  const avgMood = safeAvg(routines.map((r) => r.moodRating ?? undefined));
  const avgEnergy = safeAvg(routines.map((r) => r.energyLevel ?? undefined));

  let bestDay: string | undefined;
  let worstDay: string | undefined;
  let bestScore = -1;
  let worstScore = 999;

  routines.forEach((r) => {
    const comp = completionForRoutine(r);
    if (comp > bestScore) { bestScore = comp; bestDay = r.date; }
    if (comp < worstScore) { worstScore = comp; worstDay = r.date; }
  });

  const completionRate = routines.length
    ? Math.round((routines.reduce((acc, r) => acc + completionForRoutine(r), 0) / (routines.length * 100)) * 100)
    : 0;

  const streakDays = computeStreak(routines);

  const recs: InsightRecommendation[] = [];

  // Hydration & Nutrition cues
  if (avgEnergy !== undefined && avgEnergy < 3) {
    recs.push({
      title: 'Boost Daily Energy',
      description: 'Energy trends are on the lower side. Small foundational habits can lift your baseline.',
      priority: 'high',
      actions: [
        'Drink 8–10 cups of water before 6pm',
        'Add protein to breakfast (e.g., eggs, Greek yogurt)',
        'Get 10–15 min sunlight and a short walk in the morning'
      ]
    });
  }

  // Mindfulness & Morning routine
  if (avgMood !== undefined && avgMood < 3.5) {
    recs.push({
      title: 'Elevate Your Mood',
      description: 'Mood could improve with consistent light mindfulness and gratitude practices.',
      priority: 'medium',
      actions: [
        'Keep the 5-minute affirmation or meditation daily',
        'Write one gratitude before bed',
        'Limit late-night screens to protect sleep quality'
      ]
    });
  }

  // Consistency & Completion
  if (completionRate < 60) {
    recs.push({
      title: 'Focus on Core Habits',
      description: 'Completion rate is below target. Tighten focus to 3 core habits per day.',
      priority: 'high',
      actions: [
        'Pick 1 Morning + 1 Health + 1 Night task as “must-do”',
        'Schedule them at specific times (calendar reminders)',
        'Celebrate small wins; avoid all-or-nothing thinking'
      ]
    });
  } else if (completionRate >= 80) {
    recs.push({
      title: 'Maintain Momentum',
      description: 'Strong consistency — keep momentum with small progressive goals.',
      priority: 'low',
      actions: [
        'Add 5–10 push-ups to daily total',
        'Stretch for 5 minutes after your evening routine',
        'Share weekly wins with your accountability partner'
      ]
    });
  }

  // Alcohol & Sugar moderation
  const hadAlcoholSlip = routines.some((r) => r.healthHabits.some((t) => t.id === 'health-4' && !t.completed));
  const sugarSlip = routines.some((r) => r.healthHabits.some((t) => t.id === 'health-3' && !t.completed));
  if (hadAlcoholSlip || sugarSlip) {
    recs.push({
      title: 'Reduce Sugar/Alcohol Triggers',
      description: 'Plan ahead for evenings and snacks to avoid impulse choices.',
      priority: 'medium',
      actions: [
        'Prep 2 healthy snacks (nuts, fruit, yogurt)',
        'Set a “no drinks on weekdays” rule',
        'Swap dessert for herbal tea after dinner'
      ]
    });
  }

  return {
    summary: {
      avgMood,
      avgEnergy,
      bestDay,
      worstDay,
      completionRate,
      streakDays,
    },
    recommendations: recs,
  };
}
