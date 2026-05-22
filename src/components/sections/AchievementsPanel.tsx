// ─────────────────────────────────────────────
//  LexiQ Section — AchievementsPanel
// ─────────────────────────────────────────────

import React from 'react';
import { cn } from '../../utils/cn';
import { GlassCard } from '../ui/GlassCard';
import type { Achievement } from '../../types';

interface AchievementsPanelProps {
  achievements: Achievement[];
  className?: string;
}

const tierStyles: Record<Achievement['tier'], { border: string; bg: string; label: string; glow: string }> = {
  bronze:   { border: 'border-[#cd7f32]/30', bg: 'bg-[#cd7f32]/8',  label: 'text-[#cd7f32]', glow: '' },
  silver:   { border: 'border-[#a38d7b]/30', bg: 'bg-[#a38d7b]/8',  label: 'text-[#dbc2ae]', glow: '' },
  gold:     { border: 'border-[#e9c400]/30', bg: 'bg-[#e9c400]/10', label: 'text-[#e9c400]', glow: 'glow-gold-sm' },
  platinum: { border: 'border-[#f1dfd2]/15', bg: 'bg-[#f1dfd2]/5',  label: 'text-[#f1dfd2]', glow: '' },
};

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const style = tierStyles[achievement.tier];
  const unlocked = achievement.unlockedAt !== null;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-xl border p-3 transition-all duration-200',
        style.bg,
        style.border,
        unlocked ? style.glow : 'opacity-45',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-lg',
          style.border,
          style.bg,
        )}
      >
        {achievement.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={cn('font-mono text-[10px] font-bold uppercase tracking-wider truncate', style.label)}>
            {achievement.title}
          </p>
          <span
            className={cn(
              'shrink-0 rounded-full border px-1.5 py-px font-mono text-[8px] font-bold uppercase tracking-widest',
              style.border,
              style.label,
            )}
          >
            {achievement.tier}
          </span>
        </div>
        <p className="font-mono text-[9px] leading-relaxed text-[#554335]">
          {achievement.description}
        </p>
        {unlocked && (
          <p className="mt-1 font-mono text-[9px] text-[#a38d7b]">
            ✓ {achievement.unlockedAt}
          </p>
        )}
        {!unlocked && (
          <p className="mt-1 font-mono text-[9px] text-[#554335]">Locked</p>
        )}
      </div>
    </div>
  );
};

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  achievements,
  className,
}) => {
  const unlocked = achievements.filter((a) => a.unlockedAt !== null).length;

  return (
    <GlassCard accent="gold" className={`p-5 flex flex-col gap-4 ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#a38d7b]">
          Achievements
        </p>
        <span className="font-mono text-[10px] text-[#e9c400]">
          {unlocked}/{achievements.length}
        </span>
      </div>

      {/* Badge list */}
      <div className="flex flex-col gap-2.5">
        {achievements.map((ach) => (
          <AchievementBadge key={ach.id} achievement={ach} />
        ))}
      </div>
    </GlassCard>
  );
};
