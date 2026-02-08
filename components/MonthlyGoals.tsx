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
      <div className="rounded-xl border shadow-sm p-4 sm:p-6" style={{ 
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        borderRadius: '1.25rem',
      }}>
        <p style={{ color: '#94a3b8' }}>Loading monthly goals...</p>
      </div>
    );
  }

  const template = data.template;

  return (
    <div className="rounded-xl border shadow-sm p-4 sm:p-6 transition-all duration-400" style={{ 
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      borderRadius: '1.25rem',
    }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold" style={{ 
          background: 'linear-gradient(135deg, #f9fafb 0%, #a5b4fc 50%, #f9fafb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>📚 February Reading Goal</h3>
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-400 cursor-pointer ${
            hasUnsavedChanges
              ? 'text-white shadow-md'
              : 'cursor-not-allowed'
          }`}
          style={{ 
            background: hasUnsavedChanges 
              ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
              : 'linear-gradient(135deg, #0a0b1e 0%, #12132e 100%)',
            color: hasUnsavedChanges ? '#fff' : '#6b7280',
            boxShadow: hasUnsavedChanges 
              ? '0 8px 24px rgba(139, 92, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
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

        <label className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer" style={{ backgroundColor: '#0f172a' }}>
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
