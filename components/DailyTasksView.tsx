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
  const [saveRoutine, { isLoading: isSaving }] = useSaveDailyRoutineMutation();

  const [routine, setRoutine] = useState<DailyRoutine | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const handleSave = async () => {
    if (!routine) return;
    await saveRoutine(routine);
    setHasUnsavedChanges(false);
  };

  const handleTaskToggle = (section: 'morningRoutine' | 'healthHabits' | 'nightRoutine', taskId: string) => {
    if (!routine) return;

    const updatedRoutine = {
      ...routine,
      [section]: routine[section].map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    };
    setRoutine(updatedRoutine);
    setHasUnsavedChanges(true);
  };

  const handleNutritionChange = (meal: 'breakfast' | 'lunch' | 'dinner', value: string) => {
    if (!routine) return;

    const updatedRoutine = {
      ...routine,
      nutrition: { ...routine.nutrition, [meal]: value },
    };
    setRoutine(updatedRoutine);
    setHasUnsavedChanges(true);
  };

  const handlePushUpsChange = (value: number) => {
    if (!routine) return;

    const updatedRoutine = { ...routine, pushUpsCount: value };
    setRoutine(updatedRoutine);
    setHasUnsavedChanges(true);
  };

  const handleStepsChange = (value: number) => {
    if (!routine) return;

    const updatedRoutine = { ...routine, stepsCount: value };
    setRoutine(updatedRoutine);
    setHasUnsavedChanges(true);
  };

  const handleAddTask = (section: 'morningRoutine' | 'healthHabits' | 'nightRoutine', text: string) => {
    if (!routine || !text.trim()) return;

    const newTask: DailyTask = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      completed: false,
    };

    const updatedRoutine = {
      ...routine,
      [section]: [...routine[section], newTask],
    };
    setRoutine(updatedRoutine);
    setHasUnsavedChanges(true);
  };

  const handleEditTask = (section: 'morningRoutine' | 'healthHabits' | 'nightRoutine', taskId: string, newText: string) => {
    if (!routine || !newText.trim()) return;

    const updatedRoutine = {
      ...routine,
      [section]: routine[section].map(task => 
        task.id === taskId ? { ...task, text: newText.trim() } : task
      )
    };
    setRoutine(updatedRoutine);
    setHasUnsavedChanges(true);
  };

  const handleDeleteTask = (section: 'morningRoutine' | 'healthHabits' | 'nightRoutine', taskId: string) => {
    if (!routine) return;

    const updatedRoutine = {
      ...routine,
      [section]: routine[section].filter((t) => t.id !== taskId),
    };
    setRoutine(updatedRoutine);
    setHasUnsavedChanges(true);
  };

  if (!routine) {
    return <div style={{ color: '#9ca3af' }}>Loading...</div>;
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
    <div className="rounded-xl border shadow-sm p-6 mb-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold" style={{ color: '#f9fafb' }}>{title}</h3>
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
          className="px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer"
          style={{
            backgroundColor: hasUnsavedChanges && !isSaving ? '#8b5cf6' : '#334155',
            color: hasUnsavedChanges && !isSaving ? '#fff' : '#6b7280',
            cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'not-allowed'
          }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <label
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer"
            style={{ backgroundColor: '#0f172a' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleTaskToggle(section, task.id)}
              className="mt-1 w-5 h-5 rounded focus:ring-2"
              style={{ accentColor: '#8b5cf6' }}
            />
            <span className={`flex-1 ${task.completed ? 'line-through opacity-60' : ''}`} style={{ color: '#f9fafb' }}>
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
    <div className="pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 transition-colors self-start cursor-pointer"
          style={{ color: '#9ca3af' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f9fafb')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm sm:text-base">Back to Calendar</span>
        </button>
        <div className="sm:text-right">
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#f9fafb' }}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-base sm:text-lg" style={{ color: '#9ca3af' }}>
            {completedTasks} / {totalTasks} tasks completed ({completionPercentage}%)
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl border shadow-sm p-6 mb-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: '#f9fafb' }}>Daily Progress</span>
          <span className="text-sm font-bold" style={{ color: '#8b5cf6' }}>{completionPercentage}%</span>
        </div>
        <div className="w-full rounded-full h-4" style={{ backgroundColor: '#0f172a' }}>
          <div
            className="h-4 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%`, backgroundColor: '#8b5cf6' }}
          />
        </div>
      </div>

      {/* Task Sections */}
      <TaskSection title="☀️ Daily Morning Routine" tasks={routine.morningRoutine} section="morningRoutine" />
      <TaskSection title="💪 Daily Health Habits" tasks={routine.healthHabits} section="healthHabits" />

      {/* Steps and Push-ups Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Steps Tracker */}
        <div className="rounded-xl border shadow-sm p-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold" style={{ color: '#f9fafb' }}>🚶 Steps Progress</h3>
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className="px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer"
              style={{
                backgroundColor: hasUnsavedChanges && !isSaving ? '#8b5cf6' : '#334155',
                color: hasUnsavedChanges && !isSaving ? '#fff' : '#6b7280',
                cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'not-allowed'
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={routine.stepsCount}
                onChange={(e) => handleStepsChange(Number(e.target.value))}
                min="0"
                max="10000"
                className="w-32 px-4 py-2 text-lg font-bold text-center border-2 rounded-lg focus:ring-2"
                style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
              />
              <span style={{ color: '#9ca3af' }}>/ 10,000 goal</span>
            </div>
            <div className="w-full rounded-full h-3" style={{ backgroundColor: '#0f172a' }}>
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((routine.stepsCount / 10000) * 100, 100)}%`, backgroundColor: '#8b5cf6' }}
              />
            </div>
          </div>
        </div>

        {/* Push-ups Tracker */}
        <div className="rounded-xl border shadow-sm p-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold" style={{ color: '#f9fafb' }}>💪 Push-ups Progress</h3>
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className="px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer"
              style={{
                backgroundColor: hasUnsavedChanges && !isSaving ? '#8b5cf6' : '#334155',
                color: hasUnsavedChanges && !isSaving ? '#fff' : '#6b7280',
                cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'not-allowed'
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={routine.pushUpsCount}
                onChange={(e) => handlePushUpsChange(Number(e.target.value))}
                min="0"
                max="100"
                className="w-32 px-4 py-2 text-lg font-bold text-center border-2 rounded-lg focus:ring-2"
                style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
              />
              <span style={{ color: '#9ca3af' }}>/ 100 goal</span>
            </div>
            <div className="w-full rounded-full h-3" style={{ backgroundColor: '#0f172a' }}>
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{ width: `${routine.pushUpsCount}%`, backgroundColor: '#8b5cf6' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Check-In */}
      <div className="rounded-xl border shadow-sm p-6 mb-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: '#f9fafb' }}>🍽️ Daily Nutrition Check-In</h3>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer"
            style={{
              backgroundColor: hasUnsavedChanges && !isSaving ? '#8b5cf6' : '#334155',
              color: hasUnsavedChanges && !isSaving ? '#fff' : '#6b7280',
              cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'not-allowed'
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
          Guidelines: Protein focused • Fruits & vegetables • No bread unless sourdough
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#f9fafb' }}>
              Breakfast
            </label>
            <textarea
              value={routine.nutrition.breakfast}
              onChange={(e) => handleNutritionChange('breakfast', e.target.value)}
              placeholder="What did you have for breakfast?"
              rows={3}
              className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 resize-none placeholder-gray-500"
              style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#f9fafb' }}>
              Lunch
            </label>
            <textarea
              value={routine.nutrition.lunch}
              onChange={(e) => handleNutritionChange('lunch', e.target.value)}
              placeholder="What did you have for lunch?"
              rows={3}
              className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 resize-none placeholder-gray-500"
              style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#f9fafb' }}>
              Dinner
            </label>
            <textarea
              value={routine.nutrition.dinner}
              onChange={(e) => handleNutritionChange('dinner', e.target.value)}
              placeholder="What did you have for dinner?"
              rows={3}
              className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 resize-none placeholder-gray-500"
              style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
            />
          </div>
        </div>
      </div>

      <TaskSection title="🌙 Night Routine" tasks={routine.nightRoutine} section="nightRoutine" />

      {/* Bottom Save Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
          className="px-8 py-4 rounded-lg font-bold text-lg transition-all cursor-pointer"
          style={{
            backgroundColor: hasUnsavedChanges && !isSaving ? '#8b5cf6' : '#334155',
            color: hasUnsavedChanges && !isSaving ? '#fff' : '#6b7280',
            cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'not-allowed',
            boxShadow: hasUnsavedChanges && !isSaving ? '0 10px 15px -3px rgba(139, 92, 246, 0.3)' : 'none'
          }}
        >
          {isSaving ? 'Saving All Changes...' : hasUnsavedChanges ? 'Save All Changes' : 'All Changes Saved ✓'}
        </button>
      </div>
    </div>
  );
}
