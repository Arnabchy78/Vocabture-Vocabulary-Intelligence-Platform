// ─────────────────────────────────────────────
//  LexiQ UI — Button
// ─────────────────────────────────────────────

import React from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-r from-[#ffb874] to-[#f7931a]',
    'text-[#4b2800] font-semibold',
    'border border-[#ffb874]/30',
    'hover:glow-orange hover:brightness-110',
    'transition-all duration-200',
    'glow-orange-sm',
  ].join(' '),

  secondary: [
    'bg-transparent',
    'text-[#ffb874]',
    'border border-[#ffb874]/40',
    'hover:bg-[#ffb874]/8 hover:border-[#ffb874]/70 hover:glow-orange-sm',
    'transition-all duration-200',
  ].join(' '),

  ghost: [
    'bg-transparent',
    'text-[#dbc2ae]',
    'border border-[#554335]/50',
    'hover:bg-[#271e16] hover:text-[#f1dfd2] hover:border-[#a38d7b]/50',
    'transition-all duration-200',
  ].join(' '),

  danger: [
    'bg-transparent',
    'text-[#ffb4ab]',
    'border border-[#ffb4ab]/30',
    'hover:bg-[#93000a]/20 hover:border-[#ffb4ab]/60',
    'transition-all duration-200',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-4 text-xs gap-1.5',
  md: 'h-10 px-6 text-sm gap-2',
  lg: 'h-12 px-8 text-base gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        // Base pill shape
        'inline-flex items-center justify-center rounded-full',
        'font-mono font-medium tracking-wide',
        'select-none cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb874]/50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
};
