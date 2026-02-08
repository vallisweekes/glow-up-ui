'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetSharedTemplateQuery, useSaveSharedTemplateMutation } from '@/src/store/api';

const ADMIN_PASSWORD = 'valliskashina';

// Predefined exercise options
const PREDEFINED_EXERCISES = [
  { id: 'pushups', label: '💪 Push-ups', emoji: '💪' },
  { id: 'squats', label: '🦵 Squats', emoji: '🦵' },
  { id: 'planks', label: '🧘 Planks', emoji: '🧘' },
  { id: 'lunges', label: '🏃 Lunges', emoji: '🏃' },
  { id: 'jumping-jacks', label: '🤸 Jumping Jacks', emoji: '🤸' },
  { id: 'burpees', label: '🔥 Burpees', emoji: '🔥' },
  { id: 'yoga', label: '🧘‍♀️ Yoga Session', emoji: '🧘‍♀️' },
  { id: 'stretching', label: '🤸‍♂️ Stretching', emoji: '🤸‍♂️' },
  { id: 'cardio', label: '🏃‍♀️ 30-min Cardio', emoji: '🏃‍♀️' },
  { id: 'abs', label: '💥 Ab Workout', emoji: '💥' },
  { id: 'hiit', label: '⚡ HIIT Session', emoji: '⚡' },
  { id: 'pilates', label: '🩰 Pilates', emoji: '🩰' },
];

// Predefined health habits
const PREDEFINED_HEALTH_HABITS = [
  { id: 'water', label: '💧 Drink 2L Water', emoji: '💧' },
  { id: 'skincare-am', label: '🌅 Morning Skincare', emoji: '🌅' },
  { id: 'skincare-pm', label: '🌙 Night Skincare', emoji: '🌙' },
  { id: 'sunscreen', label: '☀️ Apply Sunscreen', emoji: '☀️' },
  { id: 'supplements', label: '💊 Take Supplements', emoji: '💊' },
  { id: 'meditation', label: '🧘‍♀️ Meditate 10min', emoji: '🧘‍♀️' },
  { id: 'sleep', label: '😴 7-9hr Sleep', emoji: '😴' },
  { id: 'face-massage', label: '💆‍♀️ Face Massage', emoji: '💆‍♀️' },
  { id: 'ice-facial', label: '🧊 Ice Cube Facial', emoji: '🧊' },
  { id: 'journal', label: '📔 Journal', emoji: '📔' },
  { id: 'reading', label: '📚 Read 20min', emoji: '📚' },
  { id: 'no-sugar', label: '🚫 No Added Sugar', emoji: '🚫' },
  { id: 'veggies', label: '🥗 Eat Greens', emoji: '🥗' },
  { id: 'digital-detox', label: '📱 Digital Detox Hour', emoji: '📱' },
  { id: 'affirmations', label: '✨ Positive Affirmations', emoji: '✨' },
  { id: 'posture', label: '🪑 Practice Good Posture', emoji: '🪑' },
];

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
  interface ExerciseWithGoal {
    text: string;
    goal?: number;
  }
  const [selectedExercises, setSelectedExercises] = useState<ExerciseWithGoal[]>([]);
  const [exerciseInput, setExerciseInput] = useState('');
  const [exerciseGoalInput, setExerciseGoalInput] = useState<number>(20);
  const [selectedHealth, setSelectedHealth] = useState<string[]>([]);
  const [healthInput, setHealthInput] = useState('');
  const [stepsGoal, setStepsGoal] = useState<number>(10000);
  const [bookInput, setBookInput] = useState('');
  const [books, setBooks] = useState<string[]>([]);
  const [showGoalInput, setShowGoalInput] = useState<string | null>(null);
  const [tempGoal, setTempGoal] = useState<number>(20);

  const addExercise = () => {
    const t = exerciseInput.trim();
    if (!t) return;
    setSelectedExercises((prev) => [...prev, { text: t, goal: exerciseGoalInput }]);
    setExerciseInput('');
    setExerciseGoalInput(20);
  };

  const toggleExercise = (exerciseLabel: string) => {
    const exists = selectedExercises.find(e => e.text === exerciseLabel);
    if (exists) {
      setSelectedExercises((prev) => prev.filter(e => e.text !== exerciseLabel));
    } else {
      setShowGoalInput(exerciseLabel);
      setTempGoal(20);
    }
  };

  const confirmExerciseWithGoal = (exerciseLabel: string, goal: number) => {
    setSelectedExercises((prev) => [...prev, { text: exerciseLabel, goal }]);
    setShowGoalInput(null);
  };

  const updateExerciseGoal = (idx: number, newGoal: number) => {
    setSelectedExercises((prev) => 
      prev.map((ex, i) => i === idx ? { ...ex, goal: newGoal } : ex)
    );
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

  const toggleHealthHabit = (habitLabel: string) => {
    setSelectedHealth((prev) => 
      prev.includes(habitLabel) 
        ? prev.filter(h => h !== habitLabel)
        : [...prev, habitLabel]
    );
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
      morningRoutine: selectedExercises.map(ex => toTask(ex.goal ? `${ex.text} (${ex.goal}x)` : ex.text)),
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
      <h4 className="font-semibold mb-2" style={{ color: '#f9fafb' }}>{title}</h4>
      {items && items.length > 0 ? (
        <ul className="list-disc list-inside" style={{ color: '#cbd5e1' }}>
          {items.map((i) => (
            <li key={i.id}>{i.text}</li>
          ))}
        </ul>
      ) : (
        <p style={{ color: '#94a3b8' }}>No items</p>
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
      <div className="border rounded-xl p-5" style={{
        borderColor: 'rgba(59, 130, 246, 0.2)',
        background: 'rgba(26, 35, 50, 0.4)',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
      }}>
        <h3 className="text-lg font-bold mb-2" style={{ color: '#f9fafb' }}>{label}</h3>
        <p style={{ color: '#94a3b8' }}>No template saved for this month.</p>
      </div>
    );
    return (
      <div className="border rounded-xl p-5" style={{
        borderColor: 'rgba(59, 130, 246, 0.2)',
        background: 'rgba(26, 35, 50, 0.4)',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
      }}>
        <h3 className="text-lg font-bold mb-3" style={{ color: '#f9fafb' }}>{label}</h3>
        {template.title && (
          <p className="mb-2" style={{ color: '#cbd5e1' }}><span className="font-semibold">Title:</span> {template.title}</p>
        )}
        {template.focus && (
          <p className="mb-4" style={{ color: '#cbd5e1' }}><span className="font-semibold">Focus:</span> {template.focus}</p>
        )}
        <Section title="Morning Routine" items={template.morningRoutine || []} />
        <Section title="Health Habits" items={template.healthHabits || []} />
        <Section title="Night Routine" items={template.nightRoutine || []} />
        <div className="mb-2">
          <h4 className="font-semibold mb-2" style={{ color: '#f9fafb' }}>Weekly Goals</h4>
          {template.weeklyGoals && template.weeklyGoals.length ? (
            <ul className="list-disc list-inside" style={{ color: '#cbd5e1' }}>
              {template.weeklyGoals.map((g: string, idx: number) => (
                <li key={`goal-${idx}`}>{g}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#94a3b8' }}>No weekly goals</p>
          )}
        </div>
        {template.readingGoal && (
          <p style={{ color: '#cbd5e1' }}><span className="font-semibold">Reading Goal:</span> {template.readingGoal}</p>
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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ 
        background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f3a 100%)',
      }}>
        <div className="rounded-3xl border p-8 max-w-md w-full backdrop-blur-xl" style={{ 
          background: 'linear-gradient(135deg, rgba(26, 35, 50, 0.8) 0%, rgba(13, 27, 42, 0.95) 100%)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}>
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold mb-2" style={{ 
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Admin Access</h1>
            <p className="mb-6" style={{ color: '#94a3b8' }}>Enter password to manage monthly templates</p>
          </div>
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
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent font-medium transition-all duration-300"
                style={{
                  background: 'rgba(26, 35, 50, 0.6)',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  color: '#f9fafb',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
                autoFocus
              />
              {passwordError && (
                <p className="text-sm mt-2" style={{ color: '#ef4444' }}>{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-semibold rounded-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#f9fafb',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ 
      background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f3a 50%, #0a0f1e 100%)',
    }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ 
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #f9fafb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Monthly Template Builder</h1>
            <p className="text-sm sm:text-base" style={{ color: '#94a3b8' }}>Create customized monthly routines with style</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 text-sm sm:text-base border rounded-xl self-start sm:self-auto transition-all duration-300"
            style={{
              color: '#cbd5e1',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              background: 'rgba(26, 35, 50, 0.6)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
            }}
          >
            ← Back to App
          </button>
        </div>

        <div className="rounded-2xl border p-6 sm:p-8 mb-8" style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(13, 27, 42, 0.95) 40%, rgba(10, 15, 30, 0.98) 100%)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.1) inset',
        }}>
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3" style={{ color: '#f9fafb' }}>
              <span className="text-3xl">📅</span>
              <span>{isCurrent ? 'Current' : ''} Routines for {selectedMonth}</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={jumpToCurrentMonth}
                className="px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#f9fafb',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                }}
              >
                View Current Month
              </button>
              <button
                type="button"
                onClick={jumpToNextMonth}
                className="px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-300"
                style={{
                  background: 'rgba(26, 35, 50, 0.8)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                }}
              >
                Next Month →
              </button>
            </div>
          </div>
          <div className="mt-4">
            <TemplateOverview template={sharedTemplate} label="Shared Template" />
          </div>
        </div>

        <div className="rounded-2xl border p-6 sm:p-8 mb-8" style={{
          background: 'linear-gradient(135deg, rgba(26, 35, 50, 0.8) 0%, rgba(13, 27, 42, 0.95) 100%)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.1) inset',
        }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ color: '#f9fafb' }}>
              <span>1️⃣</span> Select Month & Theme
            </h2>
            {hasActiveTemplates && (
              <span className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ 
                color: '#f97316',
                background: 'rgba(249, 115, 22, 0.1)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
              }}>⚠️ Cannot edit current month with existing routines</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2.5" style={{ color: '#cbd5e1' }}>📅 Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300"
                style={{
                  background: 'rgba(26, 35, 50, 0.6)',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  color: '#f9fafb',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2.5" style={{ color: '#cbd5e1' }}>🎯 Theme</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., Fitness Focus, Mindfulness Month"
                disabled={hasActiveTemplates}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 disabled:cursor-not-allowed transition-all duration-300"
                style={{
                  background: hasActiveTemplates ? 'rgba(15, 22, 33, 0.8)' : 'rgba(26, 35, 50, 0.6)',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  color: '#f9fafb',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2.5" style={{ color: '#cbd5e1' }}>👥 Scope</label>
              <div className="px-4 py-3 border rounded-xl" style={{
                background: 'rgba(15, 22, 33, 0.6)',
                borderColor: 'rgba(59, 130, 246, 0.2)',
                color: '#cbd5e1',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
              }}>
                Shared — applied to both Vallis and Kashina
              </div>
            </div>
          </div>
        </div>

        {hasActiveTemplates ? (
          <div className="rounded-2xl border p-8" style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(13, 27, 42, 0.95) 50%, rgba(10, 15, 30, 0.98) 100%)',
            borderColor: 'rgba(249, 115, 22, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(249, 115, 22, 0.1) inset',
          }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2" style={{ color: '#f9fafb' }}>
                  <span className="text-2xl">📋</span> Viewing Active Month
                </h3>
                <p style={{ color: '#cbd5e1' }}>Editing is locked for the current month while routines are active.</p>
              </div>
              <button
                type="button"
                onClick={jumpToNextMonth}
                className="px-4 py-2.5 rounded-xl font-medium transition-all duration-300"
                style={{
                  background: 'rgba(26, 35, 50, 0.8)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                }}
              >
                Plan Next Month →
              </button>
            </div>
            <div className="mt-4">
              <TemplateOverview template={sharedTemplate} label="Shared Template" />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border p-6 sm:p-8 mb-8 space-y-8" style={{
            background: 'linear-gradient(135deg, rgba(26, 35, 50, 0.8) 0%, rgba(13, 27, 42, 0.95) 100%)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.1) inset',
          }}>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#f9fafb' }}>
                <span>2️⃣</span> Exercises
              </h2>
              
              {/* Predefined Exercise Cards */}
              <div className="mb-6">
                <p className="text-sm mb-3" style={{ color: '#94a3b8' }}>Choose from popular exercises:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {PREDEFINED_EXERCISES.map((exercise) => {
                    const isSelected = selectedExercises.some(ex => ex.text === exercise.label);
                    return (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => toggleExercise(exercise.label)}
                        className="px-4 py-3 rounded-xl font-medium transition-all duration-300 text-left"
                        style={{
                          background: isSelected 
                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            : 'rgba(26, 35, 50, 0.6)',
                          borderColor: isSelected ? '#60a5fa' : 'rgba(59, 130, 246, 0.3)',
                          border: '2px solid',
                          color: isSelected ? '#f9fafb' : '#cbd5e1',
                          boxShadow: isSelected 
                            ? '0 4px 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                            : '0 2px 8px rgba(0, 0, 0, 0.2)',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{exercise.emoji}</span>
                          <span className="text-sm">{exercise.label.split(' ').slice(1).join(' ')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Exercise Input */}
              <div className="mb-4">
                <p className="text-sm mb-3" style={{ color: '#94a3b8' }}>Or add a custom exercise:</p>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={exerciseInput}
                    onChange={(e) => setExerciseInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addExercise()}
                    placeholder="e.g., Mountain climbers, Jump rope"
                    className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300"
                    style={{
                      background: 'rgba(26, 35, 50, 0.6)',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      color: '#f9fafb',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                    }}
                  />
                  <input
                    type="number"
                    value={exerciseGoalInput}
                    onChange={(e) => setExerciseGoalInput(Number(e.target.value))}
                    placeholder="Goal"
                    min="1"
                    className="w-24 px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300 text-center"
                    style={{
                      background: 'rgba(26, 35, 50, 0.6)',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      color: '#f9fafb',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                    }}
                  />
                  <button type="button" onClick={addExercise} className="px-5 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap" style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#f9fafb',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                  }}>+ Add Custom</button>
                </div>
              </div>

              {/* Selected Items */}
              {selectedExercises.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: '#f9fafb' }}>Selected ({selectedExercises.length}):</p>
                  <ul className="space-y-3">
                    {selectedExercises.map((ex, idx) => (
                      <li key={`${ex.text}-${idx}`} className="flex items-center justify-between px-4 py-3 border rounded-xl transition-all duration-300" style={{
                      background: 'rgba(15, 22, 33, 0.6)',
                      borderColor: 'rgba(59, 130, 246, 0.2)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}>
                      <div className="flex items-center gap-3 flex-1">
                        <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{ex.text}</span>
                        {ex.goal && (
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold" style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#f9fafb',
                          }}>
                            {ex.goal}x
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowGoalInput(ex.text);
                            setTempGoal(ex.goal || 20);
                          }} 
                          className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300" 
                          style={{ 
                            color: '#3b82f6',
                            background: 'rgba(59, 130, 246, 0.1)',
                            cursor: 'pointer',
                          }}
                        >
                          Edit Goal
                        </button>
                        <button 
                          type="button" 
                          onClick={() => removeExercise(idx)} 
                          className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300" 
                          style={{ 
                            color: '#ef4444',
                            background: 'rgba(239, 68, 68, 0.1)',
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#f9fafb' }}>
                <span>3️⃣</span> Health Habits
              </h2>

              {/* Predefined Health Habits Cards */}
              <div className="mb-6">
                <p className="text-sm mb-3" style={{ color: '#94a3b8' }}>Choose from wellness habits:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {PREDEFINED_HEALTH_HABITS.map((habit) => {
                    const isSelected = selectedHealth.includes(habit.label);
                    return (
                      <button
                        key={habit.id}
                        type="button"
                        onClick={() => toggleHealthHabit(habit.label)}
                        className="px-4 py-3 rounded-xl font-medium transition-all duration-300 text-left"
                        style={{
                          background: isSelected 
                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            : 'rgba(26, 35, 50, 0.6)',
                          borderColor: isSelected ? '#60a5fa' : 'rgba(59, 130, 246, 0.3)',
                          border: '2px solid',
                          color: isSelected ? '#f9fafb' : '#cbd5e1',
                          boxShadow: isSelected 
                            ? '0 4px 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                            : '0 2px 8px rgba(0, 0, 0, 0.2)',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{habit.emoji}</span>
                          <span className="text-sm">{habit.label.split(' ').slice(1).join(' ')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Health Habit Input */}
              <div className="mb-4">
                <p className="text-sm mb-3" style={{ color: '#94a3b8' }}>Or add a custom habit:</p>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={healthInput}
                    onChange={(e) => setHealthInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHealthHabit()}
                    placeholder="e.g., Take cold shower, Practice gratitude"
                    className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300"
                    style={{
                      background: 'rgba(26, 35, 50, 0.6)',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                    color: '#f9fafb',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                />
                <button type="button" onClick={addHealthHabit} className="px-5 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap" style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#f9fafb',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                }}>+ Add Custom</button>
              </div>
            </div>

            {/* Selected Health Habits */}
            {selectedHealth.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-3" style={{ color: '#f9fafb' }}>Selected ({selectedHealth.length}):</p>
                <ul className="space-y-3">
                  {selectedHealth.map((hh, idx) => (
                    <li key={`${hh}-${idx}`} className="flex items-center justify-between px-4 py-3 border rounded-xl transition-all duration-300" style={{
                      background: 'rgba(15, 22, 33, 0.6)',
                      borderColor: 'rgba(59, 130, 246, 0.2)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}>
                      <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{hh}</span>
                      <button type="button" onClick={() => removeHealthHabit(idx)} className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300" style={{ 
                        color: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.1)',
                        cursor: 'pointer',
                      }}>Remove</button>
                    </li>
                  ))}
                </ul>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#f9fafb' }}>
                <span>4️⃣</span> Steps Goal
              </h2>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={0}
                  value={stepsGoal}
                  onChange={(e) => setStepsGoal(Number(e.target.value) || 0)}
                  className="w-48 px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300"
                  style={{
                    background: 'rgba(26, 35, 50, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    color: '#f9fafb',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                />
                <span className="font-medium" style={{ color: '#94a3b8' }}>steps/day</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#f9fafb' }}>
                <span>5️⃣</span> Books to Read
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="text"
                  value={bookInput}
                  onChange={(e) => setBookInput(e.target.value)}
                  placeholder="Add a book title"
                  className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300"
                  style={{
                    background: 'rgba(26, 35, 50, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    color: '#f9fafb',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                />
                <button
                  type="button"
                  onClick={addBook}
                  className="px-5 py-3 rounded-xl font-medium transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#f9fafb',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                  }}
                >
                  Add
                </button>
              </div>
              {books.length > 0 ? (
                <ul className="space-y-3">
                  {books.map((b, idx) => (
                    <li key={`${b}-${idx}`} className="flex items-center justify-between px-4 py-3 border rounded-xl transition-all duration-300" style={{
                      background: 'rgba(15, 22, 33, 0.6)',
                      borderColor: 'rgba(59, 130, 246, 0.2)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}>
                      <span style={{ color: '#cbd5e1', fontWeight: '500' }}>📚 {b}</span>
                      <button
                        type="button"
                        onClick={() => removeBook(idx)}
                        className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300"
                        style={{ 
                          color: '#ef4444',
                          background: 'rgba(239, 68, 68, 0.1)',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 border rounded-xl" style={{
                  borderColor: 'rgba(59, 130, 246, 0.2)',
                  background: 'rgba(15, 22, 33, 0.4)',
                }}>
                  <p style={{ color: '#94a3b8' }}>No books added yet.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-6 py-3 font-semibold rounded-xl transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#f9fafb',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                }}
              >
                💾 Save Template
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Goal Input Modal */}
      {showGoalInput && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setShowGoalInput(null)}
        >
          <div 
            className="px-8 py-6 rounded-2xl max-w-md w-full mx-4"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(15, 22, 33, 0.95) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: '#f9fafb' }}>
              Set Goal for {showGoalInput}
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                Number of Reps/Minutes:
              </label>
              <input
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(Number(e.target.value))}
                min="1"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300 text-center text-2xl font-bold"
                style={{
                  background: 'rgba(26, 35, 50, 0.6)',
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                  color: '#f9fafb',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowGoalInput(null)}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                style={{
                  background: 'rgba(100, 116, 139, 0.2)',
                  color: '#cbd5e1',
                  border: '2px solid rgba(100, 116, 139, 0.3)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const existingIdx = selectedExercises.findIndex(e => e.text === showGoalInput);
                  if (existingIdx >= 0) {
                    updateExerciseGoal(existingIdx, tempGoal);
                  } else {
                    confirmExerciseWithGoal(showGoalInput, tempGoal);
                  }
                  setShowGoalInput(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#f9fafb',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

