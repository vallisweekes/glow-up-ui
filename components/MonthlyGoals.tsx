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
      <div className="rounded-xl border shadow-sm p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
        <p style={{ color: '#9ca3af' }}>Loading monthly goals...</p>
      </div>
    );
  }

  const template = data.template;

  return (
    <div className="rounded-xl border shadow-sm p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#f9fafb' }}>📚 February Reading Goal</h3>
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            hasUnsavedChanges
              ? 'text-white shadow-md'
              : 'cursor-not-allowed'
          }`}
          style={{ backgroundColor: hasUnsavedChanges ? '#8b5cf6' : '#334155', color: hasUnsavedChanges ? '#fff' : '#6b7280' }}
        >
          Save
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold mb-2" style={{ color: '#f9fafb' }}>Book Title:</p>
          <p className="text-lg" style={{ color: '#f9fafb' }}>{template.readingGoal || 'No book set'}</p>
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Shared goal for both Vallis and Kashina</p>
        </div>

        <label className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer" style={{ backgroundColor: '#0f172a' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}>
          <input
            type="checkbox"
            checked={finishedBook}
            onChange={handleToggleFinished}
            className="mt-1 w-5 h-5 rounded focus:ring-2"
            style={{ accentColor: '#8b5cf6' }}
          />
          <span className={`flex-1 ${finishedBook ? 'line-through opacity-60' : ''}`} style={{ color: '#f9fafb' }}>
            Finished book by the end of February
          </span>
        </label>

        {finishedBook && (
          <div className="border rounded-lg p-3" style={{ backgroundColor: '#0f172a', borderColor: '#334155' }}>
            <p className="font-semibold" style={{ color: '#4ade80' }}>🎉 Congratulations on finishing the book!</p>
          </div>
        )}
      </div>
    </div>
  );
}
