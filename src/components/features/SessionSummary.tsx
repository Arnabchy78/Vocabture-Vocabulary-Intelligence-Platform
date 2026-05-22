import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Trophy, Target, Zap, ArrowRight, Flame, Clock, RotateCcw } from 'lucide-react';

interface SessionSummaryProps {
  stats: {
    correctCount: number;
    totalCount: number;
    xpEarned: number;
    bestStreak: number;
    elapsedMs: number;
    leveledUp: boolean;
    goalHit: boolean;
  };
  onClose: () => void;
  onPlayAgain?: () => void;
  title?: string;
  subtitle?: string;
}

const formatTime = (ms: number) => {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  stats,
  onClose,
  onPlayAgain,
  title = 'Session Complete!',
  subtitle = "You're getting stronger",
}) => {
  const accuracy =
    stats.totalCount === 0
      ? 0
      : Math.round((stats.correctCount / stats.totalCount) * 100);

  const grade =
    accuracy === 100 ? 'S' :
    accuracy >= 90 ? 'A' :
    accuracy >= 75 ? 'B' :
    accuracy >= 60 ? 'C' : 'D';

  const gradeColor =
    grade === 'S' ? 'text-yellow-400' :
    grade === 'A' ? 'text-cyan-400' :
    grade === 'B' ? 'text-green-400' :
    grade === 'C' ? 'text-orange-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4"
    >
      {(stats.goalHit || grade === 'S') && (
        <Confetti numberOfPieces={250} recycle={false} />
      )}

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-700/60 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="inline-flex p-3 bg-white/20 rounded-full mb-3"
          >
            <Trophy size={36} />
          </motion.div>
          <h2 className="text-2xl font-bold font-mono tracking-wider">{title}</h2>
          <p className="text-indigo-100 mt-1 text-sm">{subtitle}</p>
        </div>

        {/* GRADE */}
        <div className="text-center pt-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, delay: 0.4 }}
            className={`text-7xl font-mono font-black ${gradeColor}`}
          >
            {grade}
          </motion.div>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-1">
            Grade
          </p>
        </div>

        {/* STATS GRID */}
        <div className="p-6 grid grid-cols-2 gap-3">
          <StatBox
            icon={<Target size={18} />}
            label="Correct"
            value={`${stats.correctCount}/${stats.totalCount}`}
            color="text-blue-400"
          />
          <StatBox
            icon={<Zap size={18} fill="currentColor" />}
            label="Accuracy"
            value={`${accuracy}%`}
            color="text-cyan-400"
          />
          <StatBox
            icon={<Flame size={18} />}
            label="Best Streak"
            value={`${stats.bestStreak}`}
            color="text-orange-400"
          />
          <StatBox
            icon={<Clock size={18} />}
            label="Time"
            value={formatTime(stats.elapsedMs)}
            color="text-purple-400"
          />
        </div>

        {/* XP EARNED */}
        <div className="px-6 pb-4">
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
            <div className="text-cyan-400 font-mono text-2xl font-bold">
              +{stats.xpEarned} XP
            </div>
          </div>
        </div>

        {/* LEVEL UP / GOAL */}
        <AnimatePresence>
          {(stats.leveledUp || stats.goalHit) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="px-6 pb-4"
            >
              <div className="bg-green-500/10 border border-green-500/40 rounded-xl p-3 text-green-400 text-sm flex items-center gap-3 font-mono">
                <div className="bg-green-500 text-white p-1 rounded-full">
                  <Trophy size={14} />
                </div>
                <span>
                  {stats.leveledUp
                    ? 'Level Up! New milestone reached.'
                    : 'Daily Goal Reached! Bonus XP added.'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BUTTONS */}
        <div className="p-6 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-zinc-600/40 text-zinc-300 font-mono text-sm hover:bg-zinc-800/40 transition-all flex items-center justify-center gap-2"
          >
            <ArrowRight size={16} className="rotate-180" />
            Games
          </button>
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="flex-1 py-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-mono text-sm hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Play Again
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper sub-component
const StatBox: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="bg-zinc-800/60 border border-zinc-700/30 p-3 rounded-xl text-center">
    <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
    <div className="text-white font-mono font-bold text-lg">{value}</div>
    <div className="text-zinc-500 font-mono text-xs uppercase tracking-wider">
      {label}
    </div>
  </div>
);
