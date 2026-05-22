// ─────────────────────────────────────────────
//  LexiQ UI — GlassCard
//  Glassmorphic container with HUD L-bracket accents
// ─────────────────────────────────────────────

import React from 'react';
import { cn } from '../../utils/cn';

type GlassCardAccent = 'orange' | 'gold' | 'none';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: GlassCardAccent;
  glowing?: boolean;
  dotGrid?: boolean;
  onClick?: () => void;
  role?: string;
  as?: React.ElementType;
}

const accentBorderMap: Record<GlassCardAccent, string> = {
  orange: 'border-[#ffb874]/15',
  gold:   'border-[#e9c400]/20',
  none:   'border-white/6',
};

const accentBracketMap: Record<GlassCardAccent, string> = {
  orange: 'border-[#ffb874]/60',
  gold:   'border-[#e9c400]/70',
  none:   'border-transparent',
};

const glowMap: Record<GlassCardAccent, string> = {
  orange: 'glow-orange',
  gold:   'glow-gold',
  none:   '',
};

// The L-bracket corners (HUD / scanning UI accent)
const LBracket: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br'; color: string }> = ({
  position,
  color,
}) => {
  const cornerClasses = {
    tl: 'top-0 left-0 border-t border-l rounded-tl-[0.875rem]',
    tr: 'top-0 right-0 border-t border-r rounded-tr-[0.875rem]',
    bl: 'bottom-0 left-0 border-b border-l rounded-bl-[0.875rem]',
    br: 'bottom-0 right-0 border-b border-r rounded-br-[0.875rem]',
  };

  return (
    <span
      className={cn(
        'pointer-events-none absolute h-3 w-3',
        cornerClasses[position],
        color,
      )}
      aria-hidden="true"
    />
  );
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  accent = 'orange',
  glowing = false,
  dotGrid = false,
  onClick,
  role,
  as: Tag = 'div',
}) => {
  return (
    <Tag
      onClick={onClick}
      role={role}
      className={cn(
        // Glass morphism base
        'relative rounded-[1rem] glass border overflow-hidden',
        accentBorderMap[accent],
        // Optional grid background
        dotGrid && 'dot-grid',
        // Hover / glow
        glowing && glowMap[accent],
        onClick && 'cursor-pointer hover:brightness-110 transition-all duration-200',
        className,
      )}
    >
      {/* HUD L-bracket corners */}
      {accent !== 'none' && (
        <>
          <LBracket position="tl" color={accentBracketMap[accent]} />
          <LBracket position="br" color={accentBracketMap[accent]} />
        </>
      )}
      {children}
    </Tag>
  );
};
