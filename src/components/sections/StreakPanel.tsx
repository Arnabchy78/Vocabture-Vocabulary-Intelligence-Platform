// ─────────────────────────────────────────────
//  LexiQ Section — StreakPanel
//  Daily session stats + streak counter
// ─────────────────────────────────────────────

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { ProgressMeter } from '../ui/ProgressMeter';
import { StatTile } from '../ui/StatTile';
import type { StudySession } from '../../types';

interface StreakPanelProps {
  session: StudySession;
  className?: string;
}

// 7-day heatmap row mock data
const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEK_ACTIVITY = [100, 80, 100, 60, 100, 100, 40]; // percent intensity

export const StreakPanel: React.FC<StreakPanelProps> = ({ session, className }) => {
  const dailyProgress = Math.round((session.wordsToday / session.wordsTarget) * 100);

  return (
    <GlassCard accent="orange" className={`p-5 flex flex-col gap-5 ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#a38d7b]">
          Session Intel
        </p>
        <div className="flex items-center gap-1.5 rounded-full bg-[#ffb874]/10 border border-[#ffb874]/20 px-3 py-1">
          <span>🔥</span>
          <span className="font-mono text-xs font-bold text-[#ffb874]">
            {session.streak} day streak
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatTile
          label="Words Today"
          value={`${session.wordsToday}/${session.wordsTarget}`}
          sub="daily target"
          accent="orange"
        />
        <StatTile
          label="XP Earned"
          value={session.xpEarned}
          sub="this session"
          accent="gold"
        />
        <StatTile
          label="Accuracy"
          value={`${session.accuracy}%`}
          sub="recall rate"
          accent="secondary"
        />
        <StatTile
          label="Time"
          value={`${session.sessionMinutes}m`}
          sub="active study"
          accent="neutral"
        />
      </div>

      {/* Daily progress meter */}
      <ProgressMeter
        value={dailyProgress}
        label="Daily Target"
        showPercent
        size="md"
        glowing
      />

      {/* 7-day heatmap */}
      <div>
        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#554335] mb-2">
          7-Day Activity
        </p>
        <div className="flex gap-1.5 items-end">
          {WEEK_DAYS.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full rounded-sm transition-all duration-300"
                style={{
                  height: `${Math.max(4, (WEEK_ACTIVITY[i] / 100) * 28)}px`,
                  background: WEEK_ACTIVITY[i] >= 100
                    ? 'linear-gradient(180deg, #ffb874 0%, #f7931a 100%)'
                    : WEEK_ACTIVITY[i] >= 60
                    ? 'rgba(255,184,116,0.4)'
                    : 'rgba(85,67,53,0.4)',
                  boxShadow: WEEK_ACTIVITY[i] >= 100
                    ? '0 0 6px 1px rgba(255,184,116,0.3)'
                    : 'none',
                }}
              />
              <span className="font-mono text-[8px] text-[#554335]">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};
