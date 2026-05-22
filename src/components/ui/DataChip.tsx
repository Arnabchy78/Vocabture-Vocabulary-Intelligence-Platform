// ─────────────────────────────────────────────
//  LexiQ UI — DataChip
// ─────────────────────────────────────────────

import React from 'react';
import { cn } from '../../utils/cn';
import type { WordTag } from '../../types';

type ChipVariant = WordTag['variant'] | 'mastery-new' | 'mastery-learning' | 'mastery-reviewing' | 'mastery-mastered' | 'neutral';

interface DataChipProps {
  label: string;
  variant?: ChipVariant;
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

const variantMap: Record<ChipVariant, string> = {
  root:                'bg-[#f7931a]/12 text-[#ffb874] border-[#f7931a]/25',
  pos:                 'bg-[#271e16] text-[#dbc2ae] border-[#554335]/60',
  frequency:           'bg-[#f66018]/10 text-[#ffb599] border-[#f66018]/25',
  origin:              'bg-[#3d332a] text-[#dbc2ae] border-[#554335]/50',
  tier:                'bg-[#caa900]/10 text-[#e9c400] border-[#caa900]/30',
  'mastery-new':       'bg-[#271e16] text-[#a38d7b] border-[#554335]/50',
  'mastery-learning':  'bg-[#f66018]/12 text-[#ffb599] border-[#f66018]/30',
  'mastery-reviewing': 'bg-[#f7931a]/12 text-[#ffb874] border-[#f7931a]/30',
  'mastery-mastered':  'bg-[#caa900]/12 text-[#e9c400] border-[#caa900]/35',
  neutral:             'bg-[#3d332a]/60 text-[#dbc2ae] border-[#554335]/40',
};

export const DataChip: React.FC<DataChipProps> = ({
  label,
  variant = 'neutral',
  size = 'sm',
  className,
  onClick,
}) => {
  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className={cn(
        'inline-flex items-center rounded-full border',
        'font-mono font-medium tracking-widest uppercase',
        'select-none whitespace-nowrap',
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1 text-xs',
        onClick && 'cursor-pointer hover:brightness-125 transition-all duration-150',
        variantMap[variant] ?? variantMap.neutral,
        className,
      )}
    >
      {label}
    </span>
  );
};
