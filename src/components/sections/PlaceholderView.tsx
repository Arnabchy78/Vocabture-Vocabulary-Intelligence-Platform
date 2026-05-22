// ─────────────────────────────────────────────
//  LexiQ — PlaceholderView
//  Shown for sections not yet built out
// ─────────────────────────────────────────────

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import type { NavSection } from '../../types';

const CONFIG: Record<
  Exclude<NavSection, 'dashboard'>,
  { icon: string; label: string; sub: string }
> = {
  vault: {
    icon: '◈',
    label: 'Word Vault',
    sub: '347 words indexed · Spaced repetition engine active',
  },
  study: {
    icon: '⚡',
    label: 'Study Mode',
    sub: 'Adaptive flashcard sessions · Contextual recall drills',
  },
  analytics: {
    icon: '◎',
    label: 'Analytics',
    sub: 'Recall curves · Learning velocity · Mastery heatmaps',
  },
  settings: {
    icon: '⊙',
    label: 'Settings',
    sub: 'Session preferences · Notification schedule · Themes',
  },
};

interface PlaceholderViewProps {
  section: Exclude<NavSection, 'dashboard'>;
  onBack: () => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ section, onBack }) => {
  const cfg = CONFIG[section];

  return (
    <div className="flex h-full items-center justify-center p-8">
      <GlassCard
        accent="orange"
        dotGrid
        className="max-w-md w-full p-10 flex flex-col items-center gap-6 text-center animate-fade-in-up"
      >
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffb874]/10 border border-[#ffb874]/20 text-3xl text-[#ffb874] glow-orange-sm">
          {cfg.icon}
        </div>

        {/* Label */}
        <div>
          <h2
            className="text-2xl font-bold text-[#f1dfd2] mb-2"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {cfg.label}
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#554335]">
            {cfg.sub}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 rounded-full bg-[#271e16] border border-[#554335]/50 px-4 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ffb874] pulse-orange" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#a38d7b]">
            Module In Development
          </span>
        </div>

        <Button variant="secondary" size="md" onClick={onBack}>
          ← Back to Dashboard
        </Button>
      </GlassCard>
    </div>
  );
};
