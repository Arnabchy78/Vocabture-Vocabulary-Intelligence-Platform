// ─────────────────────────────────────────────
//  LexiQ Section — WordCard
//  The primary word-detail card (hero component)
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { GlassCard } from '../ui/GlassCard';
import { DataChip } from '../ui/DataChip';
import { ProgressMeter } from '../ui/ProgressMeter';
import type { VocabWord, MasteryLevel } from '../../types';

interface WordCardProps {
  word: VocabWord;
  className?: string;
}

type Tab = 'definition' | 'etymology' | 'examples';

const masteryAccentMap: Record<MasteryLevel, 'orange' | 'gold' | 'none'> = {
  new:       'none',
  learning:  'orange',
  reviewing: 'orange',
  mastered:  'gold',
};

const masteryGlowMap: Record<MasteryLevel, boolean> = {
  new:       false,
  learning:  false,
  reviewing: true,
  mastered:  true,
};

export const WordCard: React.FC<WordCardProps> = ({ word, className }) => {
  const [activeTab, setActiveTab] = useState<Tab>('definition');

  const masteryChipVariant = `mastery-${word.masteryLevel}` as const;

  return (
    <GlassCard
      accent={masteryAccentMap[word.masteryLevel]}
      glowing={masteryGlowMap[word.masteryLevel]}
      dotGrid
      className={cn('p-4 md:p-6 flex flex-col gap-4 md:gap-5 animate-fade-in-up', className)}
    >
      {/* Top accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            word.masteryLevel === 'mastered'
              ? 'linear-gradient(90deg, transparent 0%, #e9c400 40%, #ffb874 60%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, #ffb874 40%, #f7931a 60%, transparent 100%)',
          opacity: 0.7,
        }}
        aria-hidden="true"
      />

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 md:gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5 min-w-0">
          {/* Word */}
          <h1
            className="text-2xl md:text-4xl font-bold leading-none tracking-tight gradient-text-orange break-words"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {word.word}
          </h1>
          {/* Phonetic */}
          <p className="font-mono text-xs md:text-sm font-medium tracking-wider text-[#a38d7b]">
            {word.phonetic}
          </p>
        </div>

        {/* Mastery badge */}
        <div className="flex flex-col items-end gap-1.5 md:gap-2 shrink-0">
          <DataChip
            label={word.masteryLevel.toUpperCase()}
            variant={masteryChipVariant}
            size="md"
          />
          <span className="font-mono text-[9px] md:text-[10px] text-[#a38d7b]">
            {word.reviewCount} reviews
          </span>
        </div>
      </div>

      {/* ── Tags ── */}
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {word.tags.map((tag) => (
          <DataChip key={tag.id} label={tag.label} variant={tag.variant} />
        ))}
      </div>

      {/* ── Mastery Progress ── */}
      <ProgressMeter
        value={word.masteryPercent}
        label="Mastery Index"
        showPercent
        size="md"
        glowing={word.masteryLevel === 'mastered'}
      />

      {/* ── Tab Bar ── */}
      <div className="flex gap-0 border-b border-[#271e16] overflow-x-auto -mx-1 px-1 scrollbar-none">
        {(['definition', 'etymology', 'examples'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'pb-2 px-3 md:px-4 font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap',
              'border-b-2 transition-all duration-200 -mb-px',
              activeTab === tab
                ? 'border-[#ffb874] text-[#ffb874]'
                : 'border-transparent text-[#554335] hover:text-[#a38d7b]',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="min-h-[100px]">
        {activeTab === 'definition' && (
          <div className="flex flex-col gap-3 animate-fade-in-up">
            <p
              className="text-sm md:text-base leading-relaxed text-[#f1dfd2]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {word.definition.text}
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mt-2">
              {word.synonyms.length > 0 && (
                <div className="min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#554335] mb-1.5">
                    Synonyms
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {word.synonyms.map((s) => (
                      <DataChip key={s} label={s} variant="neutral" size="sm" />
                    ))}
                  </div>
                </div>
              )}
              {word.antonyms.length > 0 && (
                <div className="min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#554335] mb-1.5">
                    Antonyms
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {word.antonyms.map((a) => (
                      <DataChip key={a} label={a} variant="neutral" size="sm" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'etymology' && (
          <div className="animate-fade-in-up">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[#ffb874] shrink-0">◈</span>
              <p className="font-mono text-xs md:text-sm leading-relaxed text-[#dbc2ae]">
                {word.etymology}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="animate-fade-in-up">
            <blockquote className="border-l-2 border-[#ffb874]/40 pl-3 md:pl-4">
              <p
                className="text-sm md:text-base italic leading-relaxed text-[#dbc2ae]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                "{word.definition.example}"
              </p>
            </blockquote>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center pt-3 border-t border-[#271e16]">
        <div className="ml-auto font-mono text-[9px] md:text-[10px] text-[#554335]">
          Next review: {word.nextReview}
        </div>
      </div>
    </GlassCard>
  );
};