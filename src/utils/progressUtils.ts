// ─────────────────────────────────────────────
//  LexiQ — Progress Calculation Utils
// ─────────────────────────────────────────────

import type { ReviewQuality } from './sm2';

// XP rewards per review quality
export const XP_REWARDS: Record<ReviewQuality, number> = {
  blackout: 0,
  wrong: 2,
  hard: 5,
  good: 10,
  easy: 15,
};

// Bonus XP for hitting daily goal
export const DAILY_GOAL_BONUS = 50;

// XP required per level
export const XP_PER_LEVEL = 1000;

/**
 * Calculate level from total XP
 */
export function calcLevel(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

/**
 * Calculate XP progress within current level
 */
export function calcLevelProgress(totalXp: number): {
  currentLevel: number;
  xpInLevel: number;
  xpForNextLevel: number;
  percentToNext: number;
} {
  const currentLevel = calcLevel(totalXp);
  const xpInLevel = totalXp % XP_PER_LEVEL;
  const xpForNextLevel = XP_PER_LEVEL;
  const percentToNext = (xpInLevel / XP_PER_LEVEL) * 100;

  return { currentLevel, xpInLevel, xpForNextLevel, percentToNext };
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date as YYYY-MM-DD string
 */
export function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Calculate days between two date strings
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Update streak based on last study date
 */
export function calcStreakUpdate(
  currentStreak: number,
  lastStudyDate: string | null
): number {
  if (!lastStudyDate) return 1; // First time studying

  const today = todayString();
  if (lastStudyDate === today) return currentStreak; // Already studied today

  const yesterday = yesterdayString();
  if (lastStudyDate === yesterday) return currentStreak + 1; // Continued streak

  return 1; // Streak broken, start over
}

/**
 * Check if streak is broken (more than 1 day gap)
 */
export function isStreakBroken(lastStudyDate: string | null): boolean {
  if (!lastStudyDate) return false;
  const today = todayString();
  const yesterday = yesterdayString();
  return lastStudyDate !== today && lastStudyDate !== yesterday;
}