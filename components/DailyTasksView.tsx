'use client';

import { useState, useEffect } from 'react';
import { User, DailyRoutine, DailyTask, defaultMorningRoutine, defaultHealthHabits, defaultNightRoutine } from '@/types/routine';
import { useGetDailyRoutineQuery, useSaveDailyRoutineMutation, useGetSharedTemplateQuery } from '@/src/store/api';

interface DailyTasksViewProps {
  user: User;
  selectedDate: Date;
  onBack: () => void;
}

export default function DailyTasksView({ user, selectedDate, onBack }: DailyTasksViewProps) {
  const dateKey = selectedDate.toISOString().split('T')[0];
  const monthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;

  const { data: routineData } = useGetDailyRoutineQuery({ date: dateKey, user });
  const { data: templateData } = useGetSharedTemplateQuery(monthKey);
  const [saveRoutine] = useSaveDailyRoutineMutation();

  const [routine, setRoutine] = useState<DailyRoutine | null>(null);

  useEffect(() => {
    if (routineData?.routine) {
      // Use existing routine from DB
      const filtered = {
        ...routineData.routine,
        healthHabits: routineData.routine.healthHabits.filter(
          (task) => task.id !== 'health-5' && task.id !== 'health-7'
        ),
      };
      setRoutine(filtered);
    } else {
      // Create new routine based on template or defaults
      const template = templateData?.template;
      const newRoutine: DailyRoutine = {
        date: dateKey,
        user,
        month: monthKey,
        morningRoutine: template
          ? template.morningRoutine.map((t) => ({ ...t, completed: false }))
          : defaultMorningRoutine.map((t) => ({ ...t, completed: false })),
        healthHabits: template
          ? template.healthHabits.map((t) => ({ ...t, completed: false }))
          : defaultHealthHabits.map((t) => ({ ...t, completed: false })),
        nightRoutine: template
          ? template.nightRoutine.map((t) => ({ ...t, completed: false }))
          : defaultNightRoutine.map((t) => ({ ...t, completed: false })),
        nutrition: { breakfast: '', lunch: '', dinner: '' },
        pushUpsCount: 0,
        stepsCount: 0,
      };
      setRoutine(newRoutine);
    }
  }, [routineData, templateData, dateKey, monthKey, user]);

  const handleTaskToggle = (section: 'morningRoutine' | 'healthHabits' | 'nightRoutine', taskId: string) => {
    if (!routine) return;

    const updatedRoutine = { ...routine };
    const task = updatedRoutine[section].find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      setRoutine(updatedRoutine);
      saveRoutine(updatedRoutine);
    }
  };

  const handleNutritionChange = (meal: 'breakfast' | 'lunch' | 'dinner', value: string) => {
    if (!routine) return;

    const updatedRoutine = {
      ...routine,
      nutrition: { ...routine.nutrition, [meal]: value },
    };
    setRoutine(updatedRoutine);
    saveRoutine(updatedRoutine);
  };

  const handlePushUpsChange = (value: number) => {
    if (!routine) return;

    const updatedRoutine = { ...routine, pushUpsCount: value };
    setRoutine(updatedRoutine);
    saveRoutine(updatedRoutine);
  };

  const handleStepsChange = (value: number) => {
    if (!routine) return;

    const updatedRoutine = { ...routine, stepsCount: value };
    setRoutine(updatedRoutine);
    saveRoutine(updatedRoutine);
  };

  if (!routine) {
    return <div>Loading...</div>;
  }

  const TaskSection = ({ 
    title, 
    tasks, 
    section 
  }: { 
    title: string; 
    tasks: DailyTask[]; 
    section: 'morningRoutine' | 'healthHabits' | 'nightRoutine' 
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <label
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50:bg-gray-700 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleTaskToggle(section, task.id)}
              className="mt-1 w-5 h-5 text-blue-900 rounded focus:ring-blue-800 focus:ring-2"
            />
            <span className={`flex-1 text-gray-700 ${task.completed ? 'line-through opacity-60' : ''}`}>
              {task.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const completedTasks = [
    ...routine.morningRoutine,
    ...routine.healthHabits,
    ...routine.nightRoutine,
  ].filter((t) => t.completed).length;

  const totalTasks = routine.morningRoutine.length + routine.healthHabits.length + routine.nightRoutine.length;
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Calendar
        </button>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-lg text-gray-600">
            {completedTasks} / {totalTasks} tasks completed ({completionPercentage}%)
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Daily Progress</span>
          <span className="text-sm font-bold text-blue-900">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-900 h-4 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Task Sections */}
      <TaskSection title="☀️ Daily Morning Routine" tasks={routine.morningRoutine} section="morningRoutine" />
      <TaskSection title="💪 Daily Health Habits" tasks={routine.healthHabits} section="healthHabits" />

      {/* Steps and Push-ups Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Steps Tracker */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🚶 Steps Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={routine.stepsCount}
                onChange={(e) => handleStepsChange(Number(e.target.value))}
                min="0"
                max="10000"
                className="w-32 px-4 py-2 text-lg font-bold text-center border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent text-gray-900 bg-white"
              />
              <span className="text-gray-600">/ 10,000 goal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-900 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((routine.stepsCount / 10000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Push-ups Tracker */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">💪 Push-ups Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={routine.pushUpsCount}
                onChange={(e) => handlePushUpsChange(Number(e.target.value))}
                min="0"
                max="100"
                className="w-32 px-4 py-2 text-lg font-bold text-center border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent text-gray-900 bg-white"
              />
              <span className="text-gray-600">/ 100 goal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${routine.pushUpsCount}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Check-In */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🍽️ Daily Nutrition Check-In</h3>
        <p className="text-sm text-gray-600 mb-4">
          Guidelines: Protein focused • Fruits & vegetables • No bread unless sourdough
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Breakfast
            </label>
            <textarea
              value={routine.nutrition.breakfast}
              onChange={(e) => handleNutritionChange('breakfast', e.target.value)}
              placeholder="What did you have for breakfast?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent text-gray-900 bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lunch
            </label>
            <textarea
              value={routine.nutrition.lunch}
              onChange={(e) => handleNutritionChange('lunch', e.target.value)}
              placeholder="What did you have for lunch?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent text-gray-900 bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dinner
            </label>
            <textarea
              value={routine.nutrition.dinner}
              onChange={(e) => handleNutritionChange('dinner', e.target.value)}
              placeholder="What did you have for dinner?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent text-gray-900 bg-white resize-none"
            />
          </div>
        </div>
      </div>

      <TaskSection title="🌙 Night Routine" tasks={routine.nightRoutine} section="nightRoutine" />
    </div>
  );
}
