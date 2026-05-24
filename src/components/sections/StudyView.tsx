// ─────────────────────────────────────────────
//  LexiQ — Study Mode
// ─────────────────────────────────────────────

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVocabStore } from '../../store/useVocabStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useToastStore } from '../../store/useToastStore';
import { SessionSummary } from '../features/SessionSummary';
import type { StoredWord } from '../../store/useVocabStore';

type StudyMode = 'due' | 'all' | 'weakest';
type Phase = 'picker' | 'studying' | 'complete';

interface StudyViewProps {
  onBack?: () => void;
}

export const StudyView: React.FC<StudyViewProps> = ({ onBack }) => {
  const words = useVocabStore((s) => s.words);
  const getDueWords = useVocabStore((s) => s.getDueWords);
  const reviewWord = useVocabStore((s) => s.reviewWord);
  const toggleFavorite = useVocabStore((s) => s.toggleFavorite);
  const favorites = useVocabStore((s) => s.favorites);
  const discoverWords = useVocabStore((s) => s.discoverWords);
  const isDiscovering = useVocabStore((s) => s.isDiscovering);

  const dailyGoal = useProgressStore((s) => s.dailyGoal);
  const recordReview = useProgressStore((s) => s.recordReview);
  const getAchievements = useProgressStore((s) => s.getAchievements);
  const addUnlocks = useToastStore((s) => s.addUnlocks);

  const [phase, setPhase] = useState<Phase>('picker');
  const [mode, setMode] = useState<StudyMode>('due');
  const [sessionWords, setSessionWords] = useState<StoredWord[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [studiedIds, setStudiedIds] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [sessionLeveledUp, setSessionLeveledUp] = useState(false);
  const [sessionGoalHit, setSessionGoalHit] = useState(false);

  // ── Build session word list based on mode ───────────────
  const availableWords = useMemo(() => {
    switch (mode) {
      case 'due':
        return getDueWords();
      case 'weakest':
        return [...words].sort((a, b) => a.masteryPercent - b.masteryPercent);
      case 'all':
      default:
        return [...words].sort(() => Math.random() - 0.5);
    }
  }, [mode, words, getDueWords]);

  const sessionSize = Math.min(dailyGoal, availableWords.length);

  // ── Start session ───────────────────────────────────────
  const startSession = () => {
    const picked = availableWords.slice(0, sessionSize);
    if (picked.length === 0) return;
    setSessionWords(picked);
    setCurrentIdx(0);
    setStudiedIds(new Set());
    setStartTime(Date.now());
    setXpEarned(0);
    setSessionLeveledUp(false);
    setSessionGoalHit(false);
    setPhase('studying');
  };

  const restartSession = () => {
    setPhase('picker');
  };

  const currentWord = sessionWords[currentIdx];

  // ── Audio pronunciation ─────────────────────────────────
  const playAudio = useCallback(() => {
    if (!currentWord) return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(currentWord.word);
    u.rate = 0.9;
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  }, [currentWord]);

  // ── Mark studied ────────────────────────────────────────
  const markStudied = () => {
    if (!currentWord || studiedIds.has(currentWord.id)) return;

    reviewWord(currentWord.id, 'good');
    const result = recordReview('good');
    setStudiedIds((s) => new Set(s).add(currentWord.id));
    setXpEarned((xp) => xp + (result?.xpEarned ?? 0));

    if (result?.leveledUp) setSessionLeveledUp(true);
    if (result?.goalHit) setSessionGoalHit(true);

    if (result?.newlyUnlocked?.length) {
      const all = getAchievements();
      const unlocked = all.filter((a) => result.newlyUnlocked.includes(a.id));
      if (unlocked.length) addUnlocks(unlocked);
    }
  };

  const goNext = () => {
    if (currentIdx + 1 >= sessionWords.length) {
      setPhase('complete');
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  // ── Keyboard shortcuts ──────────────────────────────────
  useEffect(() => {
    if (phase !== 'studying') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.code === 'Space') {
        e.preventDefault();
        playAudio();
      } else if (e.key.toLowerCase() === 'm') markStudied();
      else if (e.key.toLowerCase() === 'f' && currentWord) {
        toggleFavorite(currentWord.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, currentIdx, sessionWords, currentWord]);

  // ─────────────────────────────────────────────
  //  Picker Screen
  // ─────────────────────────────────────────────
  if (phase === 'picker') {
    const dueCount = getDueWords().length;
    const totalCount = words.length;

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="text-zinc-400 hover:text-white font-mono text-sm"
            >
              ← Back
            </button>
          )}
          <h2 className="font-mono font-bold text-white text-lg tracking-wider">
            STUDY MODE
          </h2>
          <div className="w-12" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <ModeCard
            active={mode === 'due'}
            label="Due Today"
            count={dueCount}
            onClick={() => setMode('due')}
            color="cyan"
          />
          <ModeCard
            active={mode === 'all'}
            label="All Words"
            count={totalCount}
            onClick={() => setMode('all')}
            color="purple"
          />
          <ModeCard
            active={mode === 'weakest'}
            label="Weakest"
            count={totalCount}
            onClick={() => setMode('weakest')}
            color="orange"
          />
        </div>

        <div className="p-6 rounded-2xl border border-zinc-700/40 bg-zinc-900/40 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">
              Session Size
            </p>
            <p className="text-white font-mono font-bold">
              {sessionSize} / {dailyGoal} goal
            </p>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${(sessionSize / dailyGoal) * 100}%` }}
            />
          </div>
          {availableWords.length === 0 && (
            <p className="text-orange-400 font-mono text-sm mt-3">
              ⚠ No words available in this mode.
            </p>
          )}
        </div>

        <button
          onClick={startSession}
          disabled={sessionSize === 0}
          className="w-full py-4 rounded-xl border border-cyan-500/50
                     bg-cyan-500/10 text-cyan-400 font-mono font-bold text-lg
                     hover:bg-cyan-500/20 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors mb-3"
        >
          START STUDYING →
        </button>

        <button
          onClick={() => discoverWords(15)}
          disabled={isDiscovering}
          className="w-full py-3 rounded-xl border border-purple-500/40
                     bg-purple-500/10 text-purple-400 font-mono text-sm
                     hover:bg-purple-500/20 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors"
        >
          {isDiscovering ? '⏳ Discovering...' : '✨ Discover 15 New Words'}
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  //  Complete Screen
  // ─────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <SessionSummary
        stats={{
          correctCount: studiedIds.size,
          totalCount: sessionWords.length,
          xpEarned,
          bestStreak: studiedIds.size,
          elapsedMs: Date.now() - startTime,
          leveledUp: sessionLeveledUp,
          goalHit: sessionGoalHit,
        }}
        onClose={() => setPhase('picker')}
        onPlayAgain={restartSession}
        title="SESSION COMPLETE"
        subtitle="Study Mode"
      />
    );
  }

  // ─────────────────────────────────────────────
  //  Studying Screen
  // ─────────────────────────────────────────────
  if (!currentWord) return null;

  const progress = ((currentIdx + 1) / sessionWords.length) * 100;
  const fav = favorites.includes(currentWord.id);
  const studied = studiedIds.has(currentWord.id);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setPhase('picker')}
          className="text-zinc-400 hover:text-white font-mono text-sm"
        >
          ← Exit
        </button>
        <div className="font-mono text-zinc-400 text-sm">
          Card {currentIdx + 1} / {sessionWords.length}
        </div>
        <div className="text-cyan-400 font-mono text-sm">
          {studiedIds.size} studied
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="p-8 rounded-2xl border border-zinc-700/40 bg-zinc-900/50 mb-6"
        >
          {/* Word header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-white font-mono font-black text-4xl mb-2 tracking-wide">
                {currentWord.word}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-zinc-400 font-mono text-sm">
                  {currentWord.phonetic}
                </span>
                <button
                  onClick={playAudio}
                  className="w-8 h-8 rounded-lg border border-cyan-500/40
                             bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20
                             transition-colors flex items-center justify-center"
                  title="Play (Space)"
                >
                  🔊
                </button>
                <span className="px-2 py-0.5 rounded-md border border-purple-500/40
                                 bg-purple-500/10 text-purple-300 font-mono text-xs
                                 uppercase tracking-widest">
                  {currentWord.partOfSpeech}
                </span>
              </div>
            </div>

            <button
              onClick={() => toggleFavorite(currentWord.id)}
              className={`w-10 h-10 rounded-lg border transition-all
                ${fav
                  ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400'
                  : 'border-zinc-700/40 bg-zinc-900/50 text-zinc-500 hover:text-yellow-400 hover:border-yellow-500/40'
                }`}
              title="Favorite (F)"
            >
              {fav ? '★' : '☆'}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800 my-4" />

          {/* Definition */}
          <div className="mb-4">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">
              Definition
            </p>
            <p className="text-white font-mono text-base leading-relaxed">
              {currentWord.definition.text}
            </p>
            {currentWord.definition.example && !currentWord.definition.example.toLowerCase().includes('use "') && 
(
              <p className="text-zinc-400 font-mono text-sm italic mt-2">
                "{currentWord.definition.example}"
              </p>
            )}
          </div>

          {/* Etymology */}
          {currentWord.etymology && (
            <div className="mb-4">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">
                Etymology
              </p>
              <p className="text-zinc-300 font-mono text-sm leading-relaxed">
                {currentWord.etymology}
              </p>
            </div>
          )}

          {/* Synonyms */}
          {currentWord.synonyms.length > 0 && (
            <div className="mb-4">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">
                Synonyms
              </p>
              <div className="flex flex-wrap gap-2">
                {currentWord.synonyms.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 rounded-md border border-green-500/30
                               bg-green-500/5 text-green-400 font-mono text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Antonyms */}
          {currentWord.antonyms.length > 0 && (
            <div className="mb-2">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">
                Antonyms
              </p>
              <div className="flex flex-wrap gap-2">
                {currentWord.antonyms.map((a) => (
                  <span
                    key={a}
                    className="px-2 py-1 rounded-md border border-red-500/30
                               bg-red-500/5 text-red-400 font-mono text-xs"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="px-4 py-3 rounded-xl border border-zinc-700/40
                     bg-zinc-900/50 text-zinc-400 font-mono text-sm
                     hover:bg-zinc-800/60 disabled:opacity-30
                     disabled:cursor-not-allowed transition-colors"
        >
          ◀ Prev
        </button>

        <button
          onClick={markStudied}
          disabled={studied}
          className={`flex-1 py-3 rounded-xl border font-mono font-bold text-sm transition-all
            ${studied
              ? 'border-green-500/60 bg-green-500/10 text-green-400 cursor-default'
              : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
            }`}
        >
          {studied ? '✓ Studied' : 'Mark Studied (M)'}
        </button>

        <button
          onClick={goNext}
          className="px-4 py-3 rounded-xl border border-cyan-500/40
                     bg-cyan-500/10 text-cyan-400 font-mono text-sm
                     hover:bg-cyan-500/20 transition-colors"
        >
          {currentIdx + 1 >= sessionWords.length ? 'Finish' : 'Next ▶'}
        </button>
      </div>

      <p className="text-center text-zinc-600 font-mono text-xs mt-4">
        ← / → navigate · Space audio · M mark · F favorite
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────
//  Mode Card
// ─────────────────────────────────────────────
interface ModeCardProps {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  color: 'cyan' | 'purple' | 'orange';
}

const ModeCard: React.FC<ModeCardProps> = ({
  active,
  label,
  count,
  onClick,
  color,
}) => {
  const palette = {
    cyan: 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400',
    purple: 'border-purple-500/60 bg-purple-500/10 text-purple-400',
    orange: 'border-orange-500/60 bg-orange-500/10 text-orange-400',
  }[color];

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all text-center
        ${active
          ? palette
          : 'border-zinc-700/40 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600/60'
        }`}
    >
      <div className="font-mono font-bold text-2xl mb-1">{count}</div>
      <div className="font-mono text-xs uppercase tracking-widest">{label}</div>
    </button>
  );
};