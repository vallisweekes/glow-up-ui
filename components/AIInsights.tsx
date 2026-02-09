'use client';

import React from 'react';
import type { DailyRoutine } from '@/types/routine';
import { generateInsights } from '@/lib/insights';
import type { InsightsResult } from '@/lib/insights';

type Props = {
  routines: DailyRoutine[];
  userColor?: string; // gradient hex used elsewhere
  serverInsights?: InsightsResult;
  isCached?: boolean;
};

export default function AIInsights({ routines, userColor = '#8b5cf6', serverInsights, isCached = false }: Props) {
  const result = serverInsights ?? generateInsights(routines);
  const { summary, recommendations } = result;

  return (
    <div
      className="rounded-xl p-5 sm:p-6 shadow-md"
      style={{
        background: 'linear-gradient(135deg, #0b102a 0%, #12153a 50%, #0b102a 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
      }}
    >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg sm:text-xl font-semibold"
            style={{
              background: 'linear-gradient(135deg, #f9fafb 0%, #a5b4fc 50%, #f9fafb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI Insights
          </h2>
          <span
            className="text-xs sm:text-sm px-2 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#c7d2fe' }}
          >
            Personalized guidance{isCached ? ' • cached' : ''}
          </span>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Metric label="Avg Mood" value={summary.avgMood !== undefined ? summary.avgMood.toString() : '—'} />
          <Metric label="Avg Energy" value={summary.avgEnergy !== undefined ? summary.avgEnergy.toString() : '—'} />
          <Metric label="Completion" value={`${summary.completionRate}%`} />
          <Metric label="Streak" value={`${summary.streakDays}d`} />
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              No guidance needed — keep up the great work!
            </p>
          ) : (
            recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-lg p-4"
                style={{
                  background: 'linear-gradient(135deg, #11153a 0%, #191d4a 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-semibold" style={{ color: '#e5e7eb' }}>
                    {rec.title}
                  </h3>
                  <PriorityBadge level={rec.priority} />
                </div>
                <p className="text-sm mb-3" style={{ color: '#94a3b8' }}>
                  {rec.description}
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {rec.actions.map((a, i) => (
                    <li key={i} className="text-sm" style={{ color: '#cbd5e1' }}>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: 'linear-gradient(135deg, #12153a 0%, #171a44 100%)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}
    >
      <p className="text-xs" style={{ color: '#94a3b8' }}>{label}</p>
      <p className="text-lg font-bold" style={{ color: '#f9fafb' }}>{value}</p>
    </div>
  );
}

function PriorityBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const map = {
    high: { text: 'High', bg: 'rgba(244, 63, 94, 0.15)', color: '#fecaca' },
    medium: { text: 'Medium', bg: 'rgba(234, 179, 8, 0.15)', color: '#fde68a' },
    low: { text: 'Low', bg: 'rgba(34, 197, 94, 0.15)', color: '#bbf7d0' },
  } as const;
  const s = map[level];
  return (
    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.text}
    </span>
  );
}
