// ─────────────────────────────────────────────
//  LexiQ Section — StudyQueue
//  Upcoming review queue list
// ─────────────────────────────────────────────

import React from 'react';
import { cn } from '../../utils/cn';
import { GlassCard } from '../ui/GlassCard';
import { DataChip } from '../ui/DataChip';
import { ProgressMeter } from '../ui/ProgressMeter';
import { Button } from '../ui/Button';
import type { QueueItem, MasteryLevel } from '../../types';

interface StudyQueueProps {
  items: QueueItem[];
  activeWordId: string;
  onSelectWord: (id: string) => void;
  className?: string;
}

const masteryChipVariant = (level: MasteryLevel) =>
  `mastery-${level}` as const;

const dueInColor = (dueIn: string) => {
  if (dueIn === 'Now') return 'text-[#ffb874]';
  if (dueIn.includes('h')) return 'text-[#ffb599]';
  return 'text-[#a38d7b]';
};

export const StudyQueue: React.FC<StudyQueueProps> = ({
  items,
  activeWordId,
  onSelectWord,
  className,
}) => {
  const dueNow = items.filter((i) => i.dueIn === 'Now').length;

  return (
    <GlassCard accent="orange" className={`flex flex-col gap-0 overflow-hidden ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#271e16]">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#a38d7b]">
            Review Queue
          </p>
          {dueNow > 0 && (
            <span className="rounded-full bg-[#ffb874]/15 border border-[#ffb874]/30 px-2 py-0.5 font-mono text-[9px] font-bold text-[#ffb874] pulse-orange">
              {dueNow} due
            </span>
          )}
        </div>
        <Button variant="primary" size="sm">
          Start Session
        </Button>
      </div>

      {/* Queue list */}
      <div className="flex flex-col divide-y divide-[#271e16]">
        {items.map((item) => {
          const isActive = item.wordId === activeWordId;
          return (
            <button
              key={item.wordId}
              onClick={() => onSelectWord(item.wordId)}
              className={cn(
                'flex items-center gap-4 px-5 py-3 text-left',
                'transition-all duration-150 group',
                isActive
                  ? 'bg-[#ffb874]/8'
                  : 'hover:bg-[#271e16]/70',
              )}
            >
              {/* Active indicator */}
              <div
                className={cn(
                  'h-6 w-0.5 rounded-full shrink-0 transition-all duration-200',
                  isActive ? 'bg-[#ffb874]' : 'bg-transparent group-hover:bg-[#554335]',
                )}
              />

              {/* Word info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'font-["Space_Grotesk"] text-sm font-semibold truncate',
                      isActive ? 'text-[#ffb874]' : 'text-[#f1dfd2]',
                    )}
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {item.word}
                  </span>
                  <DataChip
                    label={item.masteryLevel}
                    variant={masteryChipVariant(item.masteryLevel)}
                    size="sm"
                  />
                </div>
                <ProgressMeter
                  value={item.masteryPercent}
                  showPercent={false}
                  size="xs"
                />
              </div>

              {/* Due time */}
              <span className={cn('font-mono text-[10px] font-bold shrink-0', dueInColor(item.dueIn))}>
                {item.dueIn}
              </span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
};
