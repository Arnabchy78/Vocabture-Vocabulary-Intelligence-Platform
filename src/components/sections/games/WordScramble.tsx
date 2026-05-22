// src/components/sections/games/WordScramble.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVocabStore } from '../../../store/useVocabStore';
import { useProgressStore } from '../../../store/useProgressStore';
import { useToastStore } from '../../../store/useToastStore';
import { SessionSummary } from '../../features/SessionSummary';
import {
  scrambleWord,
  buildScrambleHint,
  shuffleArray,
  calculateGameXP,
} from '../../../utils/gameUtils';
import type { VocabWord } from '../../../types';

type Phase = 'playing' | 'correct' | 'wrong' | 'timeout' | 'complete';
const TIME_PER_WORD = 20;

interface WordScrambleProps {
  onBack: () => void;
  questionCount?: number;
}

export const WordScramble: React.FC<WordScrambleProps> = ({
  onBack,
  questionCount = 10,
}) => {
  const words = useVocabStore((s) => s.words);
  const recordReview = useProgressStore((s) => s.recordReview);
  const getAchievements = useProgressStore((s) => s.getAchievements);
  const addUnlocks = useToastStore((s) => s.addUnlocks);

  const [sessionKey, setSessionKey] = useState(0);
  const restartGame = () => setSessionKey((k) => k + 1);

  const [questions, setQuestions] = useState<VocabWord[]>(() =>
    shuffleArray([...words]).slice(0, Math.min(questionCount, words.length))
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('playing');
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_WORD);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const [sessionLeveledUp, setSessionLeveledUp] = useState(false);
  const [sessionGoalHit, setSessionGoalHit] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const currentWord = questions[currentIdx];

  // Helper to fire achievement toast
  const fireUnlocks = useCallback((result: any) => {
    if (result?.newlyUnlocked?.length) {
      const allAchievements = getAchievements();
      const unlocked = allAchievements.filter((a) =>
        result.newlyUnlocked.includes(a.id)
      );
      if (unlocked.length) addUnlocks(unlocked);
    }
  }, [getAchievements, addUnlocks]);

  // Reset everything on Play Again
  useEffect(() => {
    if (sessionKey === 0) return;
    setQuestions(shuffleArray([...words]).slice(0, Math.min(questionCount, words.length)));
    setCurrentIdx(0);
    setInput('');
    setShowHint(false);
    setTimeLeft(TIME_PER_WORD);
    setPhase('playing');
    setCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setStartTime(Date.now());
    setSessionLeveledUp(false);
    setSessionGoalHit(false);
  }, [sessionKey, words, questionCount]);

  useEffect(() => {
    if (!currentWord) return;
    setScrambled(scrambleWord(currentWord.word));
    setInput('');
    setShowHint(false);
    setTimeLeft(TIME_PER_WORD);
    setPhase('playing');
    inputRef.current?.focus();
  }, [currentIdx, currentWord]);

  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase('timeout');
          const result = recordReview('blackout');
          if (result?.leveledUp) setSessionLeveledUp(true);
          if (result?.goalHit) setSessionGoalHit(true);
          fireUnlocks(result);
          setStreak(0);
          setTimeout(() => advance(), 1500);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, currentIdx]);

  const advance = () => {
    if (currentIdx + 1 >= questions.length) {
      setPhase('complete');
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleSubmit = useCallback(() => {
    if (phase !== 'playing') return;
    const isCorrect = input.trim().toLowerCase() === currentWord.word.toLowerCase();

    if (isCorrect) {
      setPhase('correct');
      setCorrect((c) => c + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
      const result = recordReview(showHint ? 'good' : 'easy');
      if (result?.leveledUp) setSessionLeveledUp(true);
      if (result?.goalHit) setSessionGoalHit(true);
      fireUnlocks(result);
      setTimeout(() => advance(), 900);
    } else {
      setPhase('wrong');
      setTimeout(() => {
        setPhase('playing');
        setInput('');
        inputRef.current?.focus();
      }, 500);
    }
  }, [input, currentWord, phase, showHint, recordReview, fireUnlocks]);

  // ─── Complete Screen ───
  if (phase === 'complete') {
    const total = questions.length;
    const xp = calculateGameXP(correct, total, Date.now() - startTime, 'scramble');

    return (
      <SessionSummary
        stats={{
          correctCount: correct,
          totalCount: total,
          xpEarned: xp,
          bestStreak: bestStreak,
          elapsedMs: Date.now() - startTime,
          leveledUp: sessionLeveledUp,
          goalHit: sessionGoalHit,
        }}
        onClose={onBack}
        onPlayAgain={restartGame}
        title="SCRAMBLE COMPLETE"
        subtitle="Word Scramble"
      />
    );
  }

  if (!currentWord) return null;
  const timerPct = (timeLeft / TIME_PER_WORD) * 100;
  const timerColor = timeLeft > 10 ? 'bg-purple-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-zinc-400 hover:text-white font-mono text-sm">← Back</button>
        <div className="font-mono text-zinc-400 text-sm">
          {currentIdx + 1}/{questions.length} • <span className="text-purple-400">{correct} solved</span>
          {streak >= 2 && <span className="text-orange-400 ml-2 animate-pulse">🔥 {streak}</span>}
        </div>
      </div>

      <div className="h-2 bg-zinc-800 rounded-full mb-6 overflow-hidden">
        <div className={`h-full ${timerColor} rounded-full transition-all duration-1000`} style={{ width: `${timerPct}%` }} />
      </div>

      <div className={`text-center font-mono text-4xl font-black mb-6 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-zinc-300'}`}>
        {timeLeft}
      </div>

      <div className="p-4 rounded-xl border border-zinc-700/40 bg-zinc-900/50 mb-6">
        <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-2">Definition</p>
        <p className="text-white font-mono text-base">{currentWord.definition.text}</p>
        {showHint && (
          <p className="text-purple-400 font-mono text-sm mt-2">
            💡 {buildScrambleHint(currentWord.word)} <span className="text-zinc-500">({currentWord.word.length} letters)</span>
          </p>
        )}
      </div>

      <div className="text-center mb-6">
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-3">Unscramble:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {scrambled.split('').map((letter, i) => (
            <span key={i} className="w-10 h-10 flex items-center justify-center border border-purple-500/40 bg-purple-500/10 text-purple-300 font-mono font-bold text-xl rounded-lg">
              {letter.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Type your answer..."
          disabled={phase !== 'playing'}
          className={`flex-1 px-4 py-3 rounded-xl border font-mono text-base bg-zinc-900/80 text-white placeholder-zinc-600 focus:outline-none transition-colors ${
            phase === 'correct' ? 'border-green-500/60 bg-green-500/10 text-green-400'
            : phase === 'wrong' ? 'border-red-500/60 bg-red-500/10'
            : 'border-zinc-700/40 focus:border-purple-500/60'
          }`}
        />
        <button
          onClick={handleSubmit}
          disabled={phase !== 'playing' || !input.trim()}
          className="px-6 py-3 rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-400 font-mono font-bold hover:bg-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          CHECK
        </button>
      </div>

      {!showHint && (
        <button onClick={() => setShowHint(true)} className="w-full py-2 rounded-lg border border-zinc-700/30 text-zinc-500 font-mono text-sm hover:border-zinc-600/40 hover:text-zinc-400">
          💡 Show Hint
        </button>
      )}

      {phase === 'timeout' && (
        <div className="text-center mt-4">
          <p className="text-red-400 font-mono font-bold">⏱ TIME'S UP!</p>
          <p className="text-zinc-400 font-mono text-sm mt-1">
            Answer: <span className="text-white font-bold">{currentWord.word}</span>
          </p>
        </div>
      )}
    </div>
  );
};