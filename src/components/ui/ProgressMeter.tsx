// ─────────────────────────────────────────────
//  LexiQ UI — ProgressMeter
// ─────────────────────────────────────────────

import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressMeterProps {
  value: number;          // 0–100
  label?: string;
  showPercent?: boolean;
  size?: 'xs' | 'sm' | 'md';
  glowing?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
};

export const ProgressMeter: React.FC<ProgressMeterProps> = ({
  value,
  label,
  showPercent = true,
  size = 'sm',
  glowing = false,
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#a38d7b]">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="font-mono text-[11px] font-bold text-[#ffb874]">
              {clamped.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={cn(
          'w-full rounded-full border border-[#554335]/50 bg-[#140d06] overflow-hidden',
          sizeMap[size],
        )}
      >
        {/* Fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out progress-fill',
            glowing && clamped > 10 && 'glow-orange-sm',
          )}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
