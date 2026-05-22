// ─────────────────────────────────────────────
//  LexiQ UI — StatTile
//  Single metric display tile (used in stats grid)
// ─────────────────────────────────────────────

import React from 'react';
import { cn } from '../../utils/cn';

interface StatTileProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'orange' | 'gold' | 'secondary' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

const accentValueMap = {
  orange:    'gradient-text-orange',
  gold:      'gradient-text-gold',
  secondary: 'text-[#ffb599]',
  neutral:   'text-[#f1dfd2]',
};

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  sub,
  accent = 'orange',
  icon,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className="text-[#a38d7b]" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#a38d7b]">
          {label}
        </span>
      </div>

      <span
        className={cn(
          'font-grotesk text-3xl font-bold leading-none',
          '[font-family:var(--font-grotesk)]',
          accentValueMap[accent],
        )}
      >
        {value}
      </span>

      {sub && (
        <span className="font-mono text-[11px] text-[#a38d7b]">{sub}</span>
      )}
    </div>
  );
};
