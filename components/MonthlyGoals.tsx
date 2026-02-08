'use client';

import { useState, useEffect } from 'react';
import { useGetSharedTemplateQuery, useSaveSharedTemplateMutation } from '@/src/store/api';

interface MonthlyGoalsProps {
  currentMonth: string; // YYYY-MM format
}

export default function MonthlyGoals({ currentMonth }: MonthlyGoalsProps) {
  const { data, isLoading } = useGetSharedTemplateQuery(currentMonth);
  const [saveTemplate] = useSaveSharedTemplateMutation();
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [finishedBook, setFinishedBook] = useState(false);

  useEffect(() => {
    if (data?.template) {
      setFinishedBook(data.template.finishedBook || false);
    }
  }, [data]);

  const handleToggleFinished = () => {
    setFinishedBook(!finishedBook);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!data?.template) return;
    
    const updatedTemplate = {
      ...data.template,
      finishedBook,
    };
    
    await saveTemplate(updatedTemplate);
    setHasUnsavedChanges(false);
  };

  if (isLoading || !data?.template) {
    return (
      <div className="rounded-xl border shadow-sm p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #1a2f3f 0%, #152838 100%)', borderColor: '#2a3f4f' }}>
        <p style={{ color: '#8b96a5' }}>Loading monthly goals...</p>
      </div>
    );
  }

  const template = data.template;

  return (
    <div className="rounded-xl border shadow-sm p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #1a2f3f 0%, #152838 100%)', borderColor: '#2a3f4f' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#e0e7ee' }}>📚 February Reading Goal</h3>
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            hasUnsavedChanges
              ? 'text-white shadow-md'
              : 'cursor-not-allowed'
          }`}
          style={{ backgroundColor: hasUnsavedChanges ? '#9333ea' : '#2a3f4f', color: hasUnsavedChanges ? '#fff' : '#6b7885' }}
        >
          Save
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold mb-2" style={{ color: '#e0e7ee' }}>Book Title:</p>
          <p className="text-lg" style={{ color: '#e0e7ee' }}>{template.readingGoal || 'No book set'}</p>
          <p className="text-xs mt-1" style={{ color: '#6b7885' }}>Shared goal for both Vallis and Kashina</p>
        </div>

        <label className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer" style={{ backgroundColor: '#0f1f2d' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a2837')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f1f2d')}>
          <input
            type="checkbox"
            checked={finishedBook}
            onChange={handleToggleFinished}
            className="mt-1 w-5 h-5 rounded focus:ring-2"
            style={{ accentColor: '#9333ea' }}
          />
          <span className={`flex-1 ${finishedBook ? 'line-through opacity-60' : ''}`} style={{ color: '#e0e7ee' }}>
            Finished book by the end of February
          </span>
        </label>

        {finishedBook && (
          <div className="border rounded-lg p-3" style={{ backgroundColor: '#0f2820', borderColor: '#1a4030' }}>
            <p className="font-semibold" style={{ color: '#4ade80' }}>🎉 Congratulations on finishing the book!</p>
          </div>
        )}
      </div>
    </div>
  );
}
