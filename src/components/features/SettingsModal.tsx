// src/components/features/SettingsModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Flame, Trophy, Zap } from 'lucide-react';
import { useProgressStore } from '../../store/useProgressStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const dailyGoal = useProgressStore((s) => s.dailyGoal);
  const setDailyGoal = useProgressStore((s) => s.setDailyGoal);
  const streak = useProgressStore((s) => s.streak);
  const longestStreak = useProgressStore((s) => s.longestStreak);
  const totalXp = useProgressStore((s) => s.totalXp);
  const totalReviews = useProgressStore((s) => s.totalReviews);

  const [tempGoal, setTempGoal] = useState(dailyGoal);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTempGoal(dailyGoal);
  }, [dailyGoal, isOpen]);

  const handleSave = () => {
    setDailyGoal(tempGoal);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const presets = [5, 10, 15, 20, 30, 50];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-700/60 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-700/50">
              <div>
                <h2 className="text-white font-mono font-bold text-lg tracking-wider">
                  SETTINGS
                </h2>
                <p className="text-zinc-500 font-mono text-xs">
                  Customize your learning experience
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Daily Goal */}
            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target size={16} className="text-green-400" />
                  <h3 className="text-white font-mono font-bold text-sm tracking-wider">
                    DAILY GOAL
                  </h3>
                </div>
                <p className="text-zinc-500 font-mono text-xs mb-4">
                  How many words do you want to review per day?
                </p>

                {/* Current value display */}
                <div className="text-center mb-4">
                  <motion.div
                    key={tempGoal}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-baseline gap-2"
                  >
                    <span className="text-green-400 font-mono font-black text-5xl">
                      {tempGoal}
                    </span>
                    <span className="text-zinc-500 font-mono text-sm">
                      reviews / day
                    </span>
                  </motion.div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-green-400"
                />
                <div className="flex justify-between text-zinc-600 font-mono text-xs mt-1">
                  <span>5</span>
                  <span>50</span>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-6 gap-2 mt-4">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setTempGoal(preset)}
                      className={`py-2 rounded-lg border font-mono text-xs font-bold transition-all ${
                        tempGoal === preset
                          ? 'border-green-500/60 bg-green-500/10 text-green-400'
                          : 'border-zinc-700/40 text-zinc-400 hover:border-zinc-600/60'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Section */}
              <div className="pt-4 border-t border-zinc-700/40">
                <h3 className="text-white font-mono font-bold text-sm tracking-wider mb-3">
                  YOUR STATS
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <StatRow
                    icon={<Flame size={14} className="text-orange-400" />}
                    label="Current Streak"
                    value={`${streak} days`}
                  />
                  <StatRow
                    icon={<Trophy size={14} className="text-yellow-400" />}
                    label="Best Streak"
                    value={`${longestStreak} days`}
                  />
                  <StatRow
                    icon={<Zap size={14} className="text-cyan-400" />}
                    label="Total XP"
                    value={totalXp.toLocaleString()}
                  />
                  <StatRow
                    icon={<Target size={14} className="text-green-400" />}
                    label="Total Reviews"
                    value={totalReviews.toLocaleString()}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-zinc-700/40 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-zinc-600/40 text-zinc-300 font-mono text-sm hover:bg-zinc-800/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={tempGoal === dailyGoal}
                className={`flex-1 py-3 rounded-xl border font-mono text-sm font-bold transition-all ${
                  saved
                    ? 'border-green-500/60 bg-green-500/20 text-green-400'
                    : tempGoal === dailyGoal
                    ? 'border-zinc-700/40 text-zinc-600 cursor-not-allowed'
                    : 'border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                }`}
              >
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StatRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/40">
    {icon}
    <div className="flex-1 min-w-0">
      <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider truncate">
        {label}
      </div>
      <div className="text-white font-mono font-bold text-xs truncate">
        {value}
      </div>
    </div>
  </div>
);