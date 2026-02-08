import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { DailyRoutine, User, WeeklyCheckIn } from '@/types/routine';

export interface SharedMonthlyTemplate {
  month: string; // YYYY-MM
  title: string;
  focus: string;
  morningRoutine: { id: string; text: string }[];
  healthHabits: { id: string; text: string }[];
  nightRoutine: { id: string; text: string }[];
  weeklyGoals: string[];
  readingGoal?: string;
  finishedBook?: boolean;
}

export const glowApi = createApi({
  reducerPath: 'glowApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Template', 'DailyRoutine', 'WeeklyCheckIn', 'MonthlyReading'],
  endpoints: (builder) => ({
    getSharedTemplate: builder.query<{ template: SharedMonthlyTemplate | null }, string>({
      query: (month) => `templates/${month}`,
      providesTags: (result, error, month) => [{ type: 'Template', id: month }],
    }),
    saveSharedTemplate: builder.mutation<SharedMonthlyTemplate, SharedMonthlyTemplate>({
      query: (body) => ({ url: `templates/${body.month}`, method: 'PUT', body }),
      invalidatesTags: (result) => (result ? [{ type: 'Template', id: result.month }] : []),
    }),
    deleteSharedTemplate: builder.mutation<{ ok: boolean }, string>({
      query: (month) => ({ url: `templates/${month}`, method: 'DELETE' }),
      invalidatesTags: (result, error, month) => [{ type: 'Template', id: month }],
    }),
    getDailyRoutine: builder.query<{ routine: DailyRoutine | null }, { date: string; user: User }>({
      query: ({ date, user }) => `routines/${date}/${user}`,
      providesTags: (result, error, { date, user }) => [{ type: 'DailyRoutine', id: `${date}-${user}` }],
    }),
    saveDailyRoutine: builder.mutation<{ routine: DailyRoutine }, DailyRoutine>({
      query: (body) => ({ url: `routines/${body.date}/${body.user}`, method: 'PUT', body }),
      invalidatesTags: (result) => (result?.routine ? [{ type: 'DailyRoutine', id: `${result.routine.date}-${result.routine.user}` }] : []),
    }),
    getMonthlyRoutines: builder.query<{ routines: DailyRoutine[] }, { month: string; user: User }>({
      query: ({ month, user }) => `routines/month/${month}/${user}`,
      providesTags: (result, error, { month, user }) => [{ type: 'DailyRoutine', id: `month-${month}-${user}` }],
    }),
    getWeeklyCheckIn: builder.query<
      { checkIn: WeeklyCheckIn | null },
      { year: number; month: string; week: number; user: User }
    >({
      query: ({ year, month, week, user }) => `weekly/${year}/${month}/${week}/${user}`,
      providesTags: (result, error, { year, month, week, user }) => [
        { type: 'WeeklyCheckIn', id: `${year}-${month}-${week}-${user}` },
      ],
    }),
    saveWeeklyCheckIn: builder.mutation<WeeklyCheckIn, WeeklyCheckIn>({
      query: (body) => ({
        url: `weekly/${body.year}/${body.month}/${body.weekNumber}/${body.user}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result) =>
        result
          ? [{ type: 'WeeklyCheckIn', id: `${result.year}-${result.month}-${result.weekNumber}-${result.user}` }]
          : [],
    }),    getMonthlyReading: builder.query<{ reading: import('@/types/routine').MonthlyReading | null }, { month: string; user: User }>({
      query: ({ month, user }) => `reading/${month}/${user}`,
      providesTags: (result, error, { month, user }) => [{ type: 'MonthlyReading', id: `${month}-${user}` }],
    }),
    saveMonthlyReading: builder.mutation<{ reading: import('@/types/routine').MonthlyReading }, import('@/types/routine').MonthlyReading>({
      query: (body) => ({ url: `reading/${body.month}/${body.user}`, method: 'PUT', body }),
      invalidatesTags: (result) => (result?.reading ? [{ type: 'MonthlyReading', id: `${result.reading.month}-${result.reading.user}` }] : []),
    }),  }),
});

export const {
  useGetSharedTemplateQuery,
  useSaveSharedTemplateMutation,
  useDeleteSharedTemplateMutation,
  useGetDailyRoutineQuery,
  useSaveDailyRoutineMutation,
  useGetMonthlyRoutinesQuery,
  useGetWeeklyCheckInQuery,
  useSaveWeeklyCheckInMutation,
  useGetMonthlyReadingQuery,
  useSaveMonthlyReadingMutation,
} = glowApi;
