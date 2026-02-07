import { DailyRoutine, WeeklyCheckIn, MonthlyReading, MonthlyRoutineTemplate, User } from '@/types/routine';

const STORAGE_KEYS = {
  DAILY_ROUTINES: 'glowup-daily-routines',
  WEEKLY_CHECKINS: 'glowup-weekly-checkins',
  MONTHLY_READING: 'glowup-monthly-reading',
  MONTHLY_TEMPLATES: 'glowup-monthly-templates',
  CURRENT_USER: 'glowup-current-user',
  USER_PINS: 'glowup-user-pins',
  PIN_VIEWED: 'glowup-pin-viewed',
};

// Daily Routines
export const saveDailyRoutine = (routine: DailyRoutine): void => {
  const routines = getDailyRoutines();
  const index = routines.findIndex(
    (r) => r.date === routine.date && r.user === routine.user
  );
  
  if (index >= 0) {
    routines[index] = routine;
  } else {
    routines.push(routine);
  }
  
  localStorage.setItem(STORAGE_KEYS.DAILY_ROUTINES, JSON.stringify(routines));
};

export const getDailyRoutines = (): DailyRoutine[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_ROUTINES);
  return data ? JSON.parse(data) : [];
};

export const getDailyRoutineByDate = (date: string, user: User): DailyRoutine | null => {
  const routines = getDailyRoutines();
  return routines.find((r) => r.date === date && r.user === user) || null;
};

// Weekly Check-ins
export const saveWeeklyCheckIn = (checkIn: WeeklyCheckIn): void => {
  const checkIns = getWeeklyCheckIns();
  const index = checkIns.findIndex(
    (c) => c.weekNumber === checkIn.weekNumber && c.user === checkIn.user
  );
  
  if (index >= 0) {
    checkIns[index] = checkIn;
  } else {
    checkIns.push(checkIn);
  }
  
  localStorage.setItem(STORAGE_KEYS.WEEKLY_CHECKINS, JSON.stringify(checkIns));
};

export const getWeeklyCheckIns = (): WeeklyCheckIn[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_CHECKINS);
  return data ? JSON.parse(data) : [];
};

export const getWeeklyCheckInByWeek = (weekNumber: number, user: User): WeeklyCheckIn | null => {
  const checkIns = getWeeklyCheckIns();
  return checkIns.find((c) => c.weekNumber === weekNumber && c.user === user) || null;
};

// Monthly Templates
export const saveMonthlyTemplate = (template: MonthlyRoutineTemplate): void => {
  const templates = getMonthlyTemplates();
  const index = templates.findIndex(
    (t) => t.month === template.month && t.user === template.user
  );
  
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(STORAGE_KEYS.MONTHLY_TEMPLATES, JSON.stringify(templates));
};

export const getMonthlyTemplates = (): MonthlyRoutineTemplate[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.MONTHLY_TEMPLATES);
  return data ? JSON.parse(data) : [];
};

export const getMonthlyTemplateByMonth = (month: string, user: User): MonthlyRoutineTemplate | null => {
  const templates = getMonthlyTemplates();
  return templates.find((t) => t.month === month && t.user === user) || null;
};

export const deleteMonthlyTemplate = (month: string, user: User): void => {
  const templates = getMonthlyTemplates();
  const filtered = templates.filter((t) => !(t.month === month && t.user === user));
  localStorage.setItem(STORAGE_KEYS.MONTHLY_TEMPLATES, JSON.stringify(filtered));
};

// Monthly Reading
export const saveMonthlyReading = (reading: MonthlyReading): void => {
  const readings = getMonthlyReadings();
  const index = readings.findIndex(
    (r) => r.month === reading.month && r.user === reading.user
  );
  
  if (index >= 0) {
    readings[index] = reading;
  } else {
    readings.push(reading);
  }
  
  localStorage.setItem(STORAGE_KEYS.MONTHLY_READING, JSON.stringify(readings));
};

export const getMonthlyReadings = (): MonthlyReading[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.MONTHLY_READING);
  return data ? JSON.parse(data) : [];
};

export const getMonthlyReadingByMonth = (month: string, user: User): MonthlyReading | null => {
  const readings = getMonthlyReadings();
  return readings.find((r) => r.month === month && r.user === user) || null;
};

// Current User
export const saveCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, user);
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER) as User | null;
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// User PINs
const generatePIN = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getUserPIN = (user: User): string => {
  if (typeof window === 'undefined') return '';
  const pins = localStorage.getItem(STORAGE_KEYS.USER_PINS);
  const pinData = pins ? JSON.parse(pins) : {};
  
  // If user doesn't have a PIN, generate one
  if (!pinData[user]) {
    pinData[user] = generatePIN();
    localStorage.setItem(STORAGE_KEYS.USER_PINS, JSON.stringify(pinData));
  }
  
  return pinData[user];
};

export const verifyUserPIN = (user: User, enteredPIN: string): boolean => {
  const correctPIN = getUserPIN(user);
  return enteredPIN === correctPIN;
};

export const hasViewedPIN = (user: User): boolean => {
  if (typeof window === 'undefined') return false;
  const viewed = localStorage.getItem(STORAGE_KEYS.PIN_VIEWED);
  const viewedData = viewed ? JSON.parse(viewed) : {};
  return viewedData[user] === true;
};

export const markPINAsViewed = (user: User): void => {
  if (typeof window === 'undefined') return;
  const viewed = localStorage.getItem(STORAGE_KEYS.PIN_VIEWED);
  const viewedData = viewed ? JSON.parse(viewed) : {};
  viewedData[user] = true;
  localStorage.setItem(STORAGE_KEYS.PIN_VIEWED, JSON.stringify(viewedData));
};
