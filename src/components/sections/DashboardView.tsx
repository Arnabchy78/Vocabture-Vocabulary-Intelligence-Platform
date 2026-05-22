// ─────────────────────────────────────────────
//  LexiQ — Dashboard View
//  Main content grid for the dashboard section
// ─────────────────────────────────────────────

import React from 'react';
import { WordCard } from './WordCard';
import { StreakPanel } from './StreakPanel';
import { VaultStatsPanel } from './VaultStatsPanel';
import { StudyQueue } from './StudyQueue';
import { AchievementsPanel } from './AchievementsPanel';
import { QuickAddWidget } from './QuickAddWidget';
import type {
  VocabWord,
  StudySession,
  VaultStats,
  Achievement,
  QueueItem,
} from '../../types';

interface DashboardViewProps {
  activeWord: VocabWord;
  session: StudySession;
  vaultStats: VaultStats;
  achievements: Achievement[];
  queue: QueueItem[];
  activeWordId: string;
  onSelectWord: (id: string) => void;
  onStudyNow: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeWord,
  session,
  vaultStats,
  achievements,
  queue,
  activeWordId,
  onSelectWord,
  onStudyNow,
}) => {
  return (
    <div className="p-4 md:p-6 max-w-[1280px] mx-auto">
      {/* Page header */}
      <div className="mb-5 md:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <h2
            className="text-xl md:text-2xl font-bold leading-tight text-[#f1dfd2] mb-1"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Intelligence Dashboard
          </h2>
          <p className="font-mono text-[10px] md:text-[11px] text-[#554335] uppercase tracking-widest">
            Vocabulary · Performance · Analytics
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onStudyNow}
            className="font-mono text-xs font-bold px-4 py-2.5 md:px-5 rounded-lg transition-all hover:opacity-80 active:scale-95 whitespace-nowrap"
            style={{
              background: '#ffb874',
              color: '#0a0705',
            }}
          >
            ▶ Study Now
          </button>

          <div className="hidden md:block font-mono text-[10px] text-[#554335]">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 md:gap-5">
        {/* ── Main Column ── */}
        <div className="flex flex-col gap-4 md:gap-5 min-w-0">
          <WordCard word={activeWord} />
          <StudyQueue
            items={queue}
            activeWordId={activeWordId}
            onSelectWord={onSelectWord}
          />
        </div>

        {/* ── Side Column ── */}
        <div className="flex flex-col gap-4 md:gap-5 min-w-0">
          <StreakPanel session={session} />
          <VaultStatsPanel stats={vaultStats} />
          <QuickAddWidget />
          <AchievementsPanel achievements={achievements} />
        </div>
      </div>
    </div>
  );
};