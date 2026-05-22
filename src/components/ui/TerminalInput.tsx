// ─────────────────────────────────────────────
//  LexiQ UI — TerminalInput
//  Bottom-border only, orange glow on focus
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { cn } from '../../utils/cn';

interface TerminalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefix?: string;  // e.g. ">" terminal prompt char
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  label,
  prefix,
  className,
  onFocus,
  onBlur,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#a38d7b]">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <span
            className={cn(
              'mr-2 font-mono text-sm font-bold transition-colors duration-200',
              focused ? 'text-[#ffb874]' : 'text-[#554335]',
            )}
          >
            {prefix}
          </span>
        )}

        <input
          className={cn(
            'flex-1 bg-transparent',
            'font-mono text-sm text-[#f1dfd2]',
            'placeholder:text-[#a38d7b]/50 placeholder:font-mono',
            // No border except bottom
            'border-0 border-b',
            'outline-none focus:outline-none ring-0',
            'pb-1.5 pt-0.5',
            // Transition for bottom border
            'transition-all duration-200',
            focused
              ? 'border-[#ffb874] shadow-[0_1px_0_0_rgba(255,184,116,0.5)]'
              : 'border-[#554335]/60',
          )}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        {/* Blinking cursor shown when focused and empty */}
        {focused && !props.value && (
          <span className="pointer-events-none absolute right-0 font-mono text-sm text-[#ffb874] cursor-blink">
            ▮
          </span>
        )}
      </div>
    </div>
  );
};
