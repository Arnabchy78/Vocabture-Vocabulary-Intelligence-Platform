// src/utils/achievements.ts

import type { Achievement } from '../types';

export interface AchievementDefinition extends Omit<Achievement, 'unlockedAt'> {
  check: (stats: AchievementStats) => boolean;
  progress?: (stats: AchievementStats) => { current: number; target: number };
}

export interface AchievementStats {
  totalReviews: number;
  totalXp: number;
  streak: number;
  longestStreak: number;
  level: number;
  totalCorrect: number;
  dailyGoalHitCount: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ─── Bronze ───────────────────────────────────────────
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Review your first word',
    icon: '🌱',
    tier: 'bronze',
    check: (s) => s.totalReviews >= 1,
    progress: (s) => ({ current: Math.min(s.totalReviews, 1), target: 1 }),
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Review 50 words total',
    icon: '📚',
    tier: 'bronze',
    check: (s) => s.totalReviews >= 50,
    progress: (s) => ({ current: Math.min(s.totalReviews, 50), target: 50 }),
  },
  {
    id: 'on-fire',
    title: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    tier: 'bronze',
    check: (s) => s.longestStreak >= 3,
    progress: (s) => ({ current: Math.min(s.longestStreak, 3), target: 3 }),
  },

  // ─── Silver ───────────────────────────────────────────
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Review 100 words total',
    icon: '🎯',
    tier: 'silver',
    check: (s) => s.totalReviews >= 100,
    progress: (s) => ({ current: Math.min(s.totalReviews, 100), target: 100 }),
  },
  {
    id: 'dedicated',
    title: 'Dedicated',
    description: 'Maintain a 7-day streak',
    icon: '🌟',
    tier: 'silver',
    check: (s) => s.longestStreak >= 7,
    progress: (s) => ({ current: Math.min(s.longestStreak, 7), target: 7 }),
  },
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Reach Level 5',
    icon: '⚡',
    tier: 'silver',
    check: (s) => s.level >= 5,
    progress: (s) => ({ current: Math.min(s.level, 5), target: 5 }),
  },

  // ─── Gold ─────────────────────────────────────────────
  {
    id: 'genius',
    title: 'Genius',
    description: 'Reach Level 10',
    icon: '🧠',
    tier: 'gold',
    check: (s) => s.level >= 10,
    progress: (s) => ({ current: Math.min(s.level, 10), target: 10 }),
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: '90%+ accuracy with 50+ reviews',
    icon: '🎯',
    tier: 'gold',
    check: (s) =>
      s.totalReviews >= 50 &&
      s.totalCorrect / Math.max(s.totalReviews, 1) >= 0.9,
    progress: (s) => ({
      current: Math.round(
        (s.totalCorrect / Math.max(s.totalReviews, 1)) * 100
      ),
      target: 90,
    }),
  },
  {
    id: 'goal-crusher',
    title: 'Goal Crusher',
    description: 'Hit daily goal 7 times',
    icon: '🏆',
    tier: 'gold',
    check: (s) => s.dailyGoalHitCount >= 7,
    progress: (s) => ({
      current: Math.min(s.dailyGoalHitCount, 7),
      target: 7,
    }),
  },

  // ─── Platinum ─────────────────────────────────────────
  {
    id: 'legendary',
    title: 'Legendary',
    description: 'Maintain a 30-day streak',
    icon: '💎',
    tier: 'platinum',
    check: (s) => s.longestStreak >= 30,
    progress: (s) => ({ current: Math.min(s.longestStreak, 30), target: 30 }),
  },
];

/**
 * Computes which achievements are unlocked based on current stats.
 * Returns a full Achievement[] array ready for the panel.
 */
export function computeAchievements(
  stats: AchievementStats,
  unlockedMap: Record<string, string> = {}
): Achievement[] {
  const today = new Date().toISOString().split('T')[0];

  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const isUnlocked = def.check(stats);
    const unlockedAt =
      unlockedMap[def.id] ?? (isUnlocked ? today : null);

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      tier: def.tier,
      unlockedAt,
    };
  });
}

/**
 * Returns newly unlocked achievement IDs (compared to previous state).
 */
export function getNewlyUnlocked(
  stats: AchievementStats,
  previouslyUnlocked: string[]
): string[] {
  return ACHIEVEMENT_DEFINITIONS.filter(
    (def) => def.check(stats) && !previouslyUnlocked.includes(def.id)
  ).map((def) => def.id);
}