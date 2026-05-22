// src/components/features/LoadingScreen.tsx

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number; // milliseconds
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  duration = 2200,
}) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 100 / (duration / 50);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase('done'), 300);
          setTimeout(onComplete, 800);
          return 100;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const statusMessages = [
    'Initializing neural pathways...',
    'Loading vocabulary matrix...',
    'Calibrating learning algorithms...',
    'Syncing progress data...',
    'Ready.',
  ];
  const messageIdx = Math.min(
    Math.floor((progress / 100) * statusMessages.length),
    statusMessages.length - 1
  );

  return (
    <AnimatePresence>
      {phase === 'loading' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0705]"
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 184, 116, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 184, 116, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-8">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="relative"
            >
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#ffb874] to-[#f7931a] flex items-center justify-center shadow-2xl shadow-orange-500/50">
                <span className="font-mono text-3xl font-black text-[#4b2800]">
                  VC
                </span>
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border-2 border-orange-400"
              />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <h1 className="font-['Space_Grotesk'] text-4xl font-bold text-[#f1dfd2] tracking-tight">
                Vocabture
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#a38d7b] mt-1">
                Vocabulary Intelligence
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-full space-y-3">
              <div className="h-1 bg-[#271e16] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#ffb874] to-[#f7931a] rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.03 }}
                />
              </div>

              <div className="flex items-center justify-between font-mono text-xs">
                <motion.span
                  key={messageIdx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[#a38d7b]"
                >
                  &gt; {statusMessages[messageIdx]}
                </motion.span>
                <span className="text-[#ffb874] font-bold">
                  {Math.floor(progress)}%
                </span>
              </div>
            </div>

            {/* Boot logs */}
            <div className="w-full space-y-1 font-mono text-[10px] text-[#554335]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 20 ? 1 : 0 }}
              >
                [ OK ] Spaced repetition engine loaded
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 50 ? 1 : 0 }}
              >
                [ OK ] User progress restored
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 80 ? 1 : 0 }}
              >
                [ OK ] All systems operational
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};