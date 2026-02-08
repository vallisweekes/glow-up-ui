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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <p className="text-gray-500">Loading monthly goals...</p>
      </div>
    );
  }

  const template = data.template;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">📚 February Reading Goal</h3>
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            hasUnsavedChanges
              ? 'bg-[#00121f] hover:bg-[#001830] text-white shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Book Title:</p>
          <p className="text-lg text-gray-900">{template.readingGoal || 'No book set'}</p>
          <p className="text-xs text-gray-500 mt-1">Shared goal for both Vallis and Kashina</p>
        </div>

        <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={finishedBook}
            onChange={handleToggleFinished}
            className="mt-1 w-5 h-5 rounded focus:ring-2"
            style={{ accentColor: '#00121f' }}
          />
          <span className={`flex-1 text-gray-700 ${finishedBook ? 'line-through opacity-60' : ''}`}>
            Finished book by the end of February
          </span>
        </label>

        {finishedBook && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 font-semibold">🎉 Congratulations on finishing the book!</p>
          </div>
        )}
      </div>
    </div>
  );
}
