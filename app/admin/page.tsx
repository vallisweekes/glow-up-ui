'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetSharedTemplateQuery, useSaveSharedTemplateMutation } from '@/src/store/api';

const ADMIN_PASSWORD = 'valliskashina';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const nextMonth = `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(nextMonth);
  const [theme, setTheme] = useState('');

  const { data: sharedData } = useGetSharedTemplateQuery(selectedMonth, { skip: !isAuthenticated });
  const [saveSharedTemplate] = useSaveSharedTemplateMutation();

  // Builder state (no hardcoded defaults; admin adds items)
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseInput, setExerciseInput] = useState('');
  const [selectedHealth, setSelectedHealth] = useState<string[]>([]);
  const [healthInput, setHealthInput] = useState('');
  const [stepsGoal, setStepsGoal] = useState<number>(10000);
  const [bookInput, setBookInput] = useState('');
  const [books, setBooks] = useState<string[]>([]);

  const addExercise = () => {
    const t = exerciseInput.trim();
    if (!t) return;
    setSelectedExercises((prev) => [...prev, t]);
    setExerciseInput('');
  };

  const removeExercise = (idx: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const addHealthHabit = () => {
    const t = healthInput.trim();
    if (!t) return;
    setSelectedHealth((prev) => [...prev, t]);
    setHealthInput('');
  };

  const removeHealthHabit = (idx: number) => {
    setSelectedHealth((prev) => prev.filter((_, i) => i !== idx));
  };

  const addBook = () => {
    const trimmed = bookInput.trim();
    if (!trimmed) return;
    setBooks((prev) => [...prev, trimmed]);
    setBookInput('');
  };

  const removeBook = (idx: number) => {
    setBooks((prev) => prev.filter((_, i) => i !== idx));
  };

  const toTask = (text: string) => ({ id: `custom-${text.toLowerCase().replace(/\s+/g, '-')}`, text });

  const handleSaveTemplate = async () => {
    const payload = {
      month: selectedMonth,
      title: theme || 'Monthly Template',
      focus: '',
      morningRoutine: [],
      healthHabits: selectedHealth.map(toTask),
      nightRoutine: [],
      weeklyGoals: [],
      readingGoal: books.length ? books.join('; ') : undefined,
    };
    const result = await saveSharedTemplate(payload).unwrap();
    // eslint-disable-next-line no-alert
    alert(`Saved template for ${result.month}.`);
  };

  const router = useRouter();

  const isCurrent = selectedMonth === currentMonth;
  const sharedTemplate = sharedData?.template ?? null;
  const hasActiveTemplates = isCurrent && !!sharedTemplate;

  const jumpToCurrentMonth = () => setSelectedMonth(currentMonth);
  const jumpToNextMonth = () => setSelectedMonth(nextMonth);

  const Section = ({ title, items }: { title: string; items: { id: string; text: string }[] }) => (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      {items && items.length > 0 ? (
        <ul className="list-disc list-inside text-gray-800">
          {items.map((i) => (
            <li key={i.id}>{i.text}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No items</p>
      )}
    </div>
  );

  const TemplateOverview = ({
    template,
    label,
  }: {
    template: any;
    label: string;
  }) => {
    if (!template) return (
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{label}</h3>
        <p className="text-gray-600">No template saved for this month.</p>
      </div>
    );
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{label}</h3>
        {template.title && (
          <p className="text-gray-700 mb-2"><span className="font-semibold">Title:</span> {template.title}</p>
        )}
        {template.focus && (
          <p className="text-gray-700 mb-4"><span className="font-semibold">Focus:</span> {template.focus}</p>
        )}
        <Section title="Morning Routine" items={template.morningRoutine || []} />
        <Section title="Health Habits" items={template.healthHabits || []} />
        <Section title="Night Routine" items={template.nightRoutine || []} />
        <div className="mb-2">
          <h4 className="font-semibold text-gray-900 mb-2">Weekly Goals</h4>
          {template.weeklyGoals && template.weeklyGoals.length ? (
            <ul className="list-disc list-inside text-gray-800">
              {template.weeklyGoals.map((g: string, idx: number) => (
                <li key={`goal-${idx}`}>{g}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No weekly goals</p>
          )}
        </div>
        {template.readingGoal && (
          <p className="text-gray-700"><span className="font-semibold">Reading Goal:</span> {template.readingGoal}</p>
        )}
      </div>
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-600 mb-6">Enter password to manage monthly templates</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-gray-900 bg-white"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-950 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monthly Template Builder</h1>
            <p className="text-gray-600">Create customized monthly routines</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg"
          >
            Back to App
          </button>
        </div>

        <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">📅 {isCurrent ? 'Current' : ''} Routines for {selectedMonth}</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={jumpToCurrentMonth}
                className="px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-950"
              >
                View Current Month
              </button>
              <button
                type="button"
                onClick={jumpToNextMonth}
                className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-950"
              >
                Next Month
              </button>
            </div>
          </div>
          <div className="mt-4">
            <TemplateOverview template={sharedTemplate} label="Shared Template" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">1. Select Month & Theme</h2>
            {hasActiveTemplates && (
              <span className="text-sm text-orange-600 font-semibold">⚠️ Cannot edit current month with existing routines</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., Fitness Focus, Mindfulness Month"
                disabled={hasActiveTemplates}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Scope</label>
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800">
                Shared — applied to both Vallis and Kashina
              </div>
            </div>
          </div>
        </div>

        {hasActiveTemplates ? (
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">📋 Viewing Active Month</h3>
                <p className="text-gray-700">Editing is locked for the current month while routines are active.</p>
              </div>
              <button
                type="button"
                onClick={jumpToNextMonth}
                className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-950"
              >
                Plan Next Month
              </button>
            </div>
            <div className="mt-4">
              <TemplateOverview template={sharedTemplate} label="Shared Template" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Exercises</h2>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  value={exerciseInput}
                  onChange={(e) => setExerciseInput(e.target.value)}
                  placeholder="Add exercise"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 text-gray-900 bg-white"
                />
                <button type="button" onClick={addExercise} className="px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-950">Add</button>
              </div>
              {selectedExercises.length ? (
                <ul className="space-y-2">
                  {selectedExercises.map((ex, idx) => (
                    <li key={`${ex}-${idx}`} className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg">
                      <span className="text-gray-800">{ex}</span>
                      <button type="button" onClick={() => removeExercise(idx)} className="text-red-600 hover:text-red-800">Remove</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No exercises added yet.</p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Health Habits</h2>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  value={healthInput}
                  onChange={(e) => setHealthInput(e.target.value)}
                  placeholder="Add health habit"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 text-gray-900 bg-white"
                />
                <button type="button" onClick={addHealthHabit} className="px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-950">Add</button>
              </div>
              {selectedHealth.length ? (
                <ul className="space-y-2">
                  {selectedHealth.map((hh, idx) => (
                    <li key={`${hh}-${idx}`} className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg">
                      <span className="text-gray-800">{hh}</span>
                      <button type="button" onClick={() => removeHealthHabit(idx)} className="text-red-600 hover:text-red-800">Remove</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No health habits added yet.</p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Steps Goal</h2>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  value={stepsGoal}
                  onChange={(e) => setStepsGoal(Number(e.target.value) || 0)}
                  className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 text-gray-900 bg-white"
                />
                <span className="text-gray-600">steps/day</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Books to Read</h2>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  value={bookInput}
                  onChange={(e) => setBookInput(e.target.value)}
                  placeholder="Add a book title"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={addBook}
                  className="px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-950"
                >
                  Add
                </button>
              </div>
              {books.length > 0 ? (
                <ul className="space-y-2">
                  {books.map((b, idx) => (
                    <li key={`${b}-${idx}`} className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg">
                      <span className="text-gray-800">{b}</span>
                      <button
                        type="button"
                        onClick={() => removeBook(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No books added yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800"
              >
                Save Template
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

