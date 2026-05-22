

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  XP_REWARDS,
  DAILY_GOAL_BONUS,
  calcLevel,
  calcStreakUpdate,
  isStreakBroken,
  todayString,
} from '../utils/progressUtils';
import type { ReviewQuality } from '../utils/sm2';
import {
  computeAchievements,
  getNewlyUnlocked,
  type AchievementStats,
} from '../utils/achievements';
import type { Achievement } from '../types';

interface DailyActivity {
  date: string;
  wordsReviewed: number;
  xpEarned: number;
  correctCount: number;
  totalCount: number;
}

interface ProgressState {
  // Lifetime stats
  totalXp: number;
  streak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  totalReviews: number;
  totalCorrect: number;

  // Daily goal
  dailyGoal: number;
  dailyGoalHitDates: string[];

  // Activity log
  activityLog: DailyActivity[];

  // Achievements
  unlockedAchievements: Record<string, string>;
  onboardingComplete: boolean;

  // Actions
  recordReview: (quality: ReviewQuality) => {
    xpEarned: number;
    leveledUp: boolean;
    newLevel: number;
    streakChanged: boolean;
    newStreak: number;
    goalHit: boolean;
    newlyUnlocked: string[];
  };
  setDailyGoal: (goal: number) => void;
  setOnboardingComplete: (complete: boolean) => void;
  resetProgress: () => void;

  // Selectors
  getCurrentLevel: () => number;
  getTodayActivity: () => DailyActivity;
  getAccuracy: () => number;
  checkAndResetStreak: () => void;
  getAchievements: () => Achievement[];
}

const createTodayActivity = (): DailyActivity => ({
  date: todayString(),
  wordsReviewed: 0,
  xpEarned: 0,
  correctCount: 0,
  totalCount: 0,
});

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      streak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      totalReviews: 0,
      totalCorrect: 0,
      dailyGoal: 15,
      dailyGoalHitDates: [],
      activityLog: [],
      unlockedAchievements: {},
      onboardingComplete: false,

      recordReview: (quality) => {
        const state = get();
        const today = todayString();
        const xpEarned = XP_REWARDS[quality];
        const isCorrect = quality === 'good' || quality === 'easy';

        // Update streak
        const newStreak = calcStreakUpdate(state.streak, state.lastStudyDate);
        const streakChanged = newStreak !== state.streak;
        const newLongestStreak = Math.max(state.longestStreak, newStreak);

        // Today's activity
        const existingToday = state.activityLog.find((a) => a.date === today);
        const todayActivity: DailyActivity = existingToday
          ? { ...existingToday }
          : createTodayActivity();

        todayActivity.wordsReviewed += 1;
        todayActivity.xpEarned += xpEarned;
        todayActivity.totalCount += 1;
        if (isCorrect) todayActivity.correctCount += 1;

        // Daily goal
        const previousGoalHit = state.dailyGoalHitDates.includes(today);
        const goalJustHit =
          !previousGoalHit && todayActivity.wordsReviewed >= state.dailyGoal;

        let bonusXp = 0;
        if (goalJustHit) {
          bonusXp = DAILY_GOAL_BONUS;
          todayActivity.xpEarned += bonusXp;
        }

        const totalXpEarned = xpEarned + bonusXp;
        const newTotalXp = state.totalXp + totalXpEarned;
        const oldLevel = calcLevel(state.totalXp);
        const newLevel = calcLevel(newTotalXp);
        const leveledUp = newLevel > oldLevel;

        // Activity log (last 30 days)
        const otherActivities = state.activityLog.filter(
          (a) => a.date !== today
        );
        const newActivityLog = [...otherActivities, todayActivity]
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .slice(0, 30);

        const newGoalHitDates = goalJustHit
          ? [...state.dailyGoalHitDates, today]
          : state.dailyGoalHitDates;

        // ─── Check achievements ─────────────────────────────
        const newStats: AchievementStats = {
          totalReviews: state.totalReviews + 1,
          totalXp: newTotalXp,
          streak: newStreak,
          longestStreak: newLongestStreak,
          level: newLevel,
          totalCorrect: state.totalCorrect + (isCorrect ? 1 : 0),
          dailyGoalHitCount: newGoalHitDates.length,
        };

        const previouslyUnlocked = Object.keys(state.unlockedAchievements);
        const newlyUnlocked = getNewlyUnlocked(newStats, previouslyUnlocked);

        const newUnlockedMap = { ...state.unlockedAchievements };
        newlyUnlocked.forEach((id) => {
          newUnlockedMap[id] = today;
        });

        // ─── Commit ─────────────────────────────────────────
        set({
          totalXp: newTotalXp,
          streak: newStreak,
          longestStreak: newLongestStreak,
          lastStudyDate: today,
          totalReviews: state.totalReviews + 1,
          totalCorrect: state.totalCorrect + (isCorrect ? 1 : 0),
          activityLog: newActivityLog,
          dailyGoalHitDates: newGoalHitDates,
          unlockedAchievements: newUnlockedMap,
        });

        return {
          xpEarned: totalXpEarned,
          leveledUp,
          newLevel,
          streakChanged,
          newStreak,
          goalHit: goalJustHit,
          newlyUnlocked,
        };
      },

      setDailyGoal: (goal) => {
        set({ dailyGoal: Math.max(1, goal) });
      },
            setOnboardingComplete: (complete) => {
        set({ onboardingComplete: complete });
      },

            resetProgress: () => {
        set({
          totalXp: 0,
          streak: 0,
          longestStreak: 0,
          lastStudyDate: null,
          totalReviews: 0,
          totalCorrect: 0,
          dailyGoalHitDates: [],
          activityLog: [],
          unlockedAchievements: {},
          onboardingComplete: false,
        });
      },

      getCurrentLevel: () => calcLevel(get().totalXp),

      getTodayActivity: () => {
        const today = todayString();
        return (
          get().activityLog.find((a) => a.date === today) ||
          createTodayActivity()
        );
      },

      getAccuracy: () => {
        const { totalCorrect, totalReviews } = get();
        if (totalReviews === 0) return 0;
        return Math.round((totalCorrect / totalReviews) * 100);
      },

      checkAndResetStreak: () => {
        const state = get();
        if (isStreakBroken(state.lastStudyDate) && state.streak > 0) {
          set({ streak: 0 });
        }
      },

      getAchievements: () => {
        const state = get();
        const stats: AchievementStats = {
          totalReviews: state.totalReviews,
          totalXp: state.totalXp,
          streak: state.streak,
          longestStreak: state.longestStreak,
          level: calcLevel(state.totalXp),
          totalCorrect: state.totalCorrect,
          dailyGoalHitCount: state.dailyGoalHitDates.length,
        };
        return computeAchievements(stats, state.unlockedAchievements);
      },
    }),
    {
      name: 'lexiq-progress-storage',
    }
  )
);