// ─────────────────────────────────────────────
//  LexiQ — SM-2 Spaced Repetition Algorithm
//  Based on SuperMemo SM-2
//  Quality ratings: 0=Blackout, 1=Wrong, 2=Hard, 3=Good, 4=Easy, 5=Perfect
// ─────────────────────────────────────────────

import type { MasteryLevel } from '../types';

export interface SM2Data {
  easeFactor: number;    // starts at 2.5, min 1.3
  interval: number;      // days until next review
  repetitions: number;   // how many times reviewed
}

export interface SM2Result extends SM2Data {
  nextReview: string;    // ISO date string
  masteryPercent: number;
  masteryLevel: MasteryLevel;
}

export type ReviewQuality = 'blackout' | 'wrong' | 'hard' | 'good' | 'easy';

const QUALITY_MAP: Record<ReviewQuality, number> = {
  blackout: 0,
  wrong: 1,
  hard: 2,
  good: 4,
  easy: 5,
};

/**
 * Calculate next review date using SM-2 algorithm
 */
export function calculateSM2(
  quality: ReviewQuality,
  current: SM2Data
): SM2Result {
  const q = QUALITY_MAP[quality];
  let { easeFactor, interval, repetitions } = current;

  if (q >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect — reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  );

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  const nextReview = nextReviewDate.toISOString().split('T')[0];

  // Calculate mastery percent
  const masteryPercent = calcMasteryPercent(repetitions, easeFactor, interval);

  // Calculate mastery level
  const masteryLevel = calcMasteryLevel(repetitions, masteryPercent);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview,
    masteryPercent,
    masteryLevel,
  };
}

function calcMasteryPercent(
  repetitions: number,
  easeFactor: number,
  interval: number
): number {
  if (repetitions === 0) return 0;

  // Score based on repetitions (40%), ease factor (30%), interval (30%)
  const repScore = Math.min(repetitions / 10, 1) * 40;
  const easeScore = ((easeFactor - 1.3) / (3.0 - 1.3)) * 30;
  const intervalScore = Math.min(interval / 21, 1) * 30;

  return Math.round(repScore + easeScore + intervalScore);
}

function calcMasteryLevel(
  repetitions: number,
  masteryPercent: number
): MasteryLevel {
  if (repetitions === 0) return 'new';
  if (masteryPercent < 40) return 'learning';
  if (masteryPercent < 75) return 'reviewing';
  return 'mastered';
}

/**
 * Default SM2 data for new words
 */
export const DEFAULT_SM2: SM2Data = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
};

/**
 * Get words that are due for review today
 */
export function getDueWords<T extends { nextReview: string; masteryLevel: MasteryLevel }>(
  words: T[]
): T[] {
  const today = new Date().toISOString().split('T')[0];
  return words.filter(
    (w) => w.nextReview <= today || w.masteryLevel === 'new'
  );
}