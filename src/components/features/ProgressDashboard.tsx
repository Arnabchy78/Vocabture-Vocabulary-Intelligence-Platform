// src/components/features/ProgressDashboard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { useProgressStore } from '../../store/useProgressStore';
import { calcLevel } from '../../utils/progressUtils';
import { Flame, Star, Target, Trophy, TrendingUp, Zap } from 'lucide-react';

export const ProgressDashboard: React.FC = () => {
  const {
    totalXp,
    streak,
    longestStreak,
    totalReviews,
    totalCorrect,
    dailyGoal,
    activityLog,
  } = useProgressStore();

  const level = calcLevel(totalXp);
  const xpForCurrent = level * level * 100;       // XP needed to reach current level
  const xpForNext = (level + 1) * (level + 1) * 100; // XP needed for next
  const xpProgress = totalXp - xpForCurrent;
  const xpNeeded = xpForNext - xpForCurrent;
  const xpPct = Math.min(100, (xpProgress / xpNeeded) * 100);

  const today = new Date().toISOString().split('T')[0];
  const todayActivity = activityLog.find((a) => a.date === today);
  const todayReviews = todayActivity?.wordsReviewed ?? 0;
  const goalPct = Math.min(100, (todayReviews / dailyGoal) * 100);

  const accuracy =
    totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  // Build last 30 days array
  const last30Days: { date: string; xp: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = activityLog.find((a) => a.date === dateStr);
    last30Days.push({ date: dateStr, xp: log?.xpEarned ?? 0 });
  }

  const maxXp = Math.max(...last30Days.map((d) => d.xp), 1);

  // Last 7 days for bar chart
  const last7Days = last30Days.slice(-7);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-white font-mono font-bold text-2xl tracking-wider mb-6">
        PROGRESS
      </h1>

      {/* TOP ROW — Streak, Level, Daily Goal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-5 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-orange-400 font-mono text-xs uppercase tracking-widest">
              Current Streak
            </span>
            <Flame className="text-orange-400" size={20} />
          </div>
          <div className="text-orange-300 font-mono font-black text-4xl">
            {streak}
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1">
            Longest: {longestStreak} days
          </div>
        </motion.div>

        {/* Level */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">
              Level
            </span>
            <Star className="text-cyan-400" size={20} />
          </div>
          <div className="text-cyan-300 font-mono font-black text-4xl">
            {level}
          </div>
          <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-cyan-400 rounded-full"
            />
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1">
            {xpProgress} / {xpNeeded} XP
          </div>
        </motion.div>

        {/* Daily Goal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 flex items-center gap-4"
        >
          {/* Circular progress */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-zinc-800"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                className="text-green-400"
                initial={{ strokeDasharray: '0 213' }}
                animate={{
                  strokeDasharray: `${(goalPct / 100) * 213} 213`,
                }}
                transition={{ duration: 1.2, delay: 0.4 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-green-300 font-mono font-bold text-sm">
                {Math.round(goalPct)}%
              </span>
            </div>
          </div>

          <div>
            <div className="text-green-400 font-mono text-xs uppercase tracking-widest mb-1">
              Daily Goal
            </div>
            <div className="text-green-300 font-mono font-bold text-lg">
              {todayReviews} / {dailyGoal}
            </div>
            <div className="flex items-center gap-1 text-zinc-500 font-mono text-xs mt-1">
              <Target size={10} /> reviews today
            </div>
          </div>
        </motion.div>
      </div>

      {/* WEEKLY BAR CHART */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-5 rounded-2xl border border-zinc-700/40 bg-zinc-900/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-mono font-bold text-sm tracking-wider">
            LAST 7 DAYS
          </h3>
          <TrendingUp className="text-zinc-500" size={16} />
        </div>
        <div className="flex items-end gap-2 h-32">
          {last7Days.map((day) => {
            const heightPct = (day.xp / maxXp) * 100;
            const dayLabel = new Date(day.date).toLocaleDateString('en', {
              weekday: 'short',
            });
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className={`w-full rounded-t-md ${
                      day.xp > 0
                        ? 'bg-gradient-to-t from-cyan-500/60 to-cyan-400'
                        : 'bg-zinc-800/40'
                    }`}
                  />
                </div>
                <span className="text-zinc-500 font-mono text-xs">
                  {dayLabel.slice(0, 1)}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 30-DAY HEATMAP */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-5 rounded-2xl border border-zinc-700/40 bg-zinc-900/50"
      >
        <h3 className="text-white font-mono font-bold text-sm tracking-wider mb-4">
          30-DAY ACTIVITY
        </h3>
        <div className="grid grid-cols-10 gap-1.5">
          {last30Days.map((day) => {
            const intensity = day.xp / maxXp;
            let bg = 'bg-zinc-800/40';
            if (intensity > 0 && intensity <= 0.25) bg = 'bg-cyan-500/20';
            else if (intensity > 0.25 && intensity <= 0.5) bg = 'bg-cyan-500/40';
            else if (intensity > 0.5 && intensity <= 0.75) bg = 'bg-cyan-500/70';
            else if (intensity > 0.75) bg = 'bg-cyan-400';

            return (
              <div
                key={day.date}
                title={`${day.date}: ${day.xp} XP`}
                className={`aspect-square rounded-sm ${bg} hover:scale-110 transition-transform cursor-pointer`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 mt-3 text-xs font-mono text-zinc-500">
          Less
          <div className="w-3 h-3 rounded-sm bg-zinc-800/40" />
          <div className="w-3 h-3 rounded-sm bg-cyan-500/20" />
          <div className="w-3 h-3 rounded-sm bg-cyan-500/40" />
          <div className="w-3 h-3 rounded-sm bg-cyan-500/70" />
          <div className="w-3 h-3 rounded-sm bg-cyan-400" />
          More
        </div>
      </motion.div>

      {/* LIFETIME STATS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <StatCard icon={<Zap size={16} />} label="Total XP" value={totalXp} color="text-yellow-400" />
        <StatCard icon={<Trophy size={16} />} label="Reviews" value={totalReviews} color="text-blue-400" />
        <StatCard icon={<Target size={16} />} label="Accuracy" value={`${accuracy}%`} color="text-green-400" />
        <StatCard icon={<Flame size={16} />} label="Best Streak" value={longestStreak} color="text-orange-400" />
      </motion.div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="p-4 rounded-xl border border-zinc-700/40 bg-zinc-900/50 text-center">
    <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
    <div className="text-white font-mono font-bold text-lg">{value}</div>
    <div className="text-zinc-500 font-mono text-xs uppercase tracking-wider">
      {label}
    </div>
  </div>
);