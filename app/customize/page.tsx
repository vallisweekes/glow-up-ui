'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MonthlyRoutineTemplate, DailyTask, defaultMorningRoutine, defaultHealthHabits, defaultNightRoutine, defaultWeeklyGoals } from '@/types/routine';
import { getCurrentUser, clearCurrentUser, getMonthlyTemplateByMonth, saveMonthlyTemplate } from '@/lib/storage';

export default function CustomizeMonthPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [template, setTemplate] = useState<MonthlyRoutineTemplate | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
    } else {
      setUser(currentUser);
      // Set current month as default
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonth(monthKey);
      loadTemplate(currentUser, monthKey);
    }
  }, [router]);

  const loadTemplate = (user: User, month: string) => {
    const existing = getMonthlyTemplateByMonth(month, user);
    
    if (existing) {
      setTemplate(existing);
    } else {
      // Create default template
      const monthDate = new Date(month + '-01');
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const newTemplate: MonthlyRoutineTemplate = {
        month,
        user,
        title: `Glow Up ${monthName} Routine`,
        focus: 'Mental • Physical • Spiritual',
        morningRoutine: [...defaultMorningRoutine],
        healthHabits: [...defaultHealthHabits],
        nightRoutine: [...defaultNightRoutine],
        weeklyGoals: [...defaultWeeklyGoals],
        readingGoal: 'The Power of Now',
      };
      setTemplate(newTemplate);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const month = e.target.value;
    setSelectedMonth(month);
    if (user) {
      loadTemplate(user, month);
    }
  };

  const handleSave = () => {
    if (template) {
      saveMonthlyTemplate(template);
      alert(`Monthly routine for ${selectedMonth} saved!`);
    }
  };

  const addTask = (section: 'morningRoutine' | 'healthHabits' | 'nightRoutine') => {
    if (!template) return;
    const newId = `${section}-${Date.now()}`;
    const newTask = { id: newId, text: '' };
    setTemplate({
      ...template,
      [section]: [...template[section], newTask],
    });
  };

  const updateTask = (section: 'morningRoutine' | 'healthHabits' | 'nightRoutine', index: number, text: string) => {
    if (!template) return;
    const updated = [...template[section]];
    updated[index] = { ...updated[index], text };
    setTemplate({ ...template, [section]: updated });
  };

  const deleteTask = (section: 'morningRoutine' | 'healthHabits' | 'nightRoutine', index: number) => {
    if (!template) return;
    const updated = template[section].filter((_, i) => i !== index);
    setTemplate({ ...template, [section]: updated });
  };

  const addWeeklyGoal = () => {
    if (!template) return;
    setTemplate({
      ...template,
      weeklyGoals: [...template.weeklyGoals, ''],
    });
  };

  const updateWeeklyGoal = (index: number, text: string) => {
    if (!template) return;
    const updated = [...template.weeklyGoals];
    updated[index] = text;
    setTemplate({ ...template, weeklyGoals: updated });
  };

  const deleteWeeklyGoal = (index: number) => {
    if (!template) return;
    const updated = template.weeklyGoals.filter((_, i) => i !== index);
    setTemplate({ ...template, weeklyGoals: updated });
  };

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/');
  };

  if (!user || !template) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const userColor = user === 'Vallis' ? 'purple' : 'pink';

  const TaskSection = ({
    title,
    tasks,
    section,
  }: {
    title: string;
    tasks: Omit<DailyTask, 'completed'>[];
    section: 'morningRoutine' | 'healthHabits' | 'nightRoutine';
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <button
          onClick={() => addTask(section)}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
        >
          + Add Task
        </button>
      </div>
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div key={task.id} className="flex items-center gap-2">
            <input
              type="text"
              value={task.text}
              onChange={(e) => updateTask(section, index, e.target.value)}
              placeholder="Enter task description..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent"
            />
            <button
              onClick={() => deleteTask(section, index)}
              className="p-2 text-red-500 hover:bg-red-50:bg-red-900 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full bg-${userColor}-600 flex items-center justify-center text-white text-xl font-bold`}>
              {user[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Customize Monthly Routine
              </h1>
              <p className="text-sm text-gray-600">
                Personalize your routine for each month
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900:text-white transition-colors"
            >
              Switch User
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Month Selector */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Month to Customize:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent"
          />
        </div>

        {/* Template Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Routine Title & Focus</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title:
              </label>
              <input
                type="text"
                value={template.title}
                onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Focus Areas:
              </label>
              <input
                type="text"
                value={template.focus}
                onChange={(e) => setTemplate({ ...template, focus: e.target.value })}
                placeholder="e.g., Mental • Physical • Spiritual"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reading Goal (Optional):
              </label>
              <input
                type="text"
                value={template.readingGoal || ''}
                onChange={(e) => setTemplate({ ...template, readingGoal: e.target.value })}
                placeholder="e.g., The Power of Now"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Task Sections */}
        <TaskSection title="☀️ Morning Routine" tasks={template.morningRoutine} section="morningRoutine" />
        <TaskSection title="💪 Daily Health Habits" tasks={template.healthHabits} section="healthHabits" />
        <TaskSection title="🌙 Night Routine" tasks={template.nightRoutine} section="nightRoutine" />

        {/* Weekly Goals */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">📊 Weekly Goals</h3>
            <button
              onClick={addWeeklyGoal}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              + Add Goal
            </button>
          </div>
          <div className="space-y-3">
            {template.weeklyGoals.map((goal, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => updateWeeklyGoal(index, e.target.value)}
                  placeholder="Enter weekly goal..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent"
                />
                <button
                  onClick={() => deleteWeeklyGoal(index)}
                  className="p-2 text-red-500 hover:bg-red-50:bg-red-900 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-blue-900 text-white font-bold rounded-xl border border-gray-200 shadow-sm hover:bg-blue-950 hover:shadow-lg transition-all duration-200"
        >
          Save Monthly Template
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          This template will be used for all days in {selectedMonth}
        </p>
      </main>
    </div>
  );
}
