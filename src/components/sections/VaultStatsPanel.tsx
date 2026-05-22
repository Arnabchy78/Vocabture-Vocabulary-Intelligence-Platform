// ─────────────────────────────────────────────
//  LexiQ Section — VaultStatsPanel
//  Macro vocabulary stats + circular-style breakdown
// ─────────────────────────────────────────────

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import type { VaultStats } from '../../types';

interface VaultStatsPanelProps {
  stats: VaultStats;
  className?: string;
}

interface BreakdownBar {
  label: string;
  value: number;
  color: string;
  bg: string;
}

export const VaultStatsPanel: React.FC<VaultStatsPanelProps> = ({ stats, className }) => {
  const masteredPct   = Math.round((stats.masteredWords / stats.totalWords) * 100);
  const learningPct   = Math.round((stats.learningWords / stats.totalWords) * 100);
  const newPct        = Math.round((stats.newWords       / stats.totalWords) * 100);

  const bars: BreakdownBar[] = [
    { label: 'Mastered',  value: stats.masteredWords, color: '#e9c400', bg: 'bg-[#e9c400]' },
    { label: 'Learning',  value: stats.learningWords, color: '#ffb874', bg: 'bg-[#ffb874]' },
    { label: 'New',       value: stats.newWords,       color: '#554335', bg: 'bg-[#554335]' },
  ];

  return (
    <GlassCard accent="gold" className={`p-5 flex flex-col gap-5 ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#a38d7b]">
          Vault Metrics
        </p>
        <div className="flex items-center gap-1 text-[#e9c400]">
          <span className="font-mono text-[10px]">+{stats.weeklyGrowth}%</span>
          <span className="font-mono text-[9px] text-[#554335]">/ 7d</span>
        </div>
      </div>

      {/* Big number */}
      <div className="flex items-end gap-3">
        <span
          className="text-5xl font-bold leading-none gradient-text-gold"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {stats.totalWords}
        </span>
        <div className="pb-1">
          <p className="font-mono text-[10px] text-[#a38d7b] uppercase tracking-widest">
            Total Words
          </p>
          <p className="font-mono text-[10px] text-[#554335]">in the vault</p>
        </div>
      </div>

      {/* Segmented bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full border border-[#554335]/40 gap-px">
        <div
          className="h-full bg-[#e9c400] transition-all duration-700"
          style={{ width: `${masteredPct}%` }}
          title={`Mastered: ${masteredPct}%`}
        />
        <div
          className="h-full bg-[#ffb874] transition-all duration-700"
          style={{ width: `${learningPct}%` }}
          title={`Learning: ${learningPct}%`}
        />
        <div
          className="h-full flex-1 bg-[#3d332a]"
          title={`New: ${newPct}%`}
        />
      </div>

      {/* Legend breakdown */}
      <div className="flex flex-col gap-2.5">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: bar.color }}
              />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#a38d7b]">
                {bar.label}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#f1dfd2]">
              {bar.value}
            </span>
          </div>
        ))}
      </div>

      {/* Divider + Mastery rate */}
      <div className="flex items-center justify-between border-t border-[#271e16] pt-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#554335]">
          Mastery Rate
        </span>
        <span className="font-mono text-sm font-bold gradient-text-gold">
          {masteredPct}%
        </span>
      </div>
    </GlassCard>
  );
};
