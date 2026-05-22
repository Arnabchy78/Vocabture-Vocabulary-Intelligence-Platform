// src/components/sections/games/SpeedRound.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVocabStore } from '../../../store/useVocabStore';
import { useProgressStore } from '../../../store/useProgressStore';
import { useToastStore } from '../../../store/useToastStore';
import { SessionSummary } from '../../features/SessionSummary';
import { buildSpeedRound, calculateGameXP, type SpeedQuestion } from '../../../utils/gameUtils';

const ROUND_DURATION = 60;

interface SpeedRoundProps {
  onBack: () => void;
}

type Phase = 'intro' | 'playing' | 'complete';
type Feedback = 'none' | 'correct' | 'wrong';

export const SpeedRound: React.FC<SpeedRoundProps> = ({ onBack }) => {
  const words = useVocabStore((s) => s.words);
  const recordReview = useProgressStore((s) => s.recordReview);
  const getAchievements = useProgressStore((s) => s.getAchievements);
  const addUnlocks = useToastStore((s) => s.addUnlocks);

  // ── Stable refs ───────────────────────────────────────────────
  const scoreRef      = useRef(0);
  const answeredRef   = useRef(0);
  const startTimeRef  = useRef(0);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef    = useRef(true);
  const seenWordIds   = useRef<Set<string>>(new Set());

  // ── State ─────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<SpeedQuestion[]>(() => buildSpeedRound(words, 40));
  const [phase, setPhase]         = useState<Phase>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft]   = useState(ROUND_DURATION);
  const [score, setScore]         = useState(0);
  const [answered, setAnswered]   = useState(0);
  const [streak, setStreak]       = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback]   = useState<Feedback>('none');
  const [finalXP, setFinalXP]     = useState(0);

  const [sessionLeveledUp, setSessionLeveledUp] = useState(false);
  const [sessionGoalHit, setSessionGoalHit]     = useState(false);

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── End game ──────────────────────────────────────────────────
  const endGame = useCallback(() => {
    if (!mountedRef.current) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = startTimeRef.current > 0
      ? Date.now() - startTimeRef.current
      : ROUND_DURATION * 1000;
    const xp = calculateGameXP(
      scoreRef.current,
      Math.max(answeredRef.current, 1),
      elapsed,
      'speed'
    );
    setFinalXP(xp);
    setPhase('complete');
  }, []);

  // ── Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      setTimeLeft((t) => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, endGame]);

  // ── Start game ────────────────────────────────────────────────
  const startGame = useCallback(() => {
    scoreRef.current    = 0;
    answeredRef.current = 0;
    seenWordIds.current = new Set();
    startTimeRef.current = Date.now();
    setPhase('playing');
  }, []);

  // ── Restart game (Play Again) ─────────────────────────────────
  const restartGame = useCallback(() => {
    scoreRef.current    = 0;
    answeredRef.current = 0;
    seenWordIds.current = new Set();
    setQuestions(buildSpeedRound(words, 40));
    setScore(0);
    setAnswered(0);
    setStreak(0);
    setBestStreak(0);
    setCurrentIdx(0);
    setTimeLeft(ROUND_DURATION);
    setFeedback('none');
    setFinalXP(0);
    setSessionLeveledUp(false);
    setSessionGoalHit(false);
    startTimeRef.current = Date.now();
    setPhase('playing');
  }, [words]);

  // ── Handle answer ─────────────────────────────────────────────
  const handleAnswer = useCallback((idx: number) => {
    if (phase !== 'playing' || feedback !== 'none') return;

    const q = questions[currentIdx];
    if (!q) return;

    const isCorrect = idx === q.correctIndex;

    answeredRef.current += 1;
    setAnswered(answeredRef.current);

    if (isCorrect) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setFeedback('correct');
    } else {
      setStreak(0);
      setFeedback('wrong');
    }

    // Record SM-2 review once per unique word
    const wordId = q.word.id;
    if (!seenWordIds.current.has(wordId)) {
      seenWordIds.current.add(wordId);
      const result = recordReview(isCorrect ? 'good' : 'wrong');
      if (result?.leveledUp) setSessionLeveledUp(true);
      if (result?.goalHit) setSessionGoalHit(true);

      if (result?.newlyUnlocked?.length) {
        const allAchievements = getAchievements();
        const unlocked = allAchievements.filter((a) =>
          result.newlyUnlocked.includes(a.id)
        );
        if (unlocked.length) addUnlocks(unlocked);
      }
    }

    setTimeout(() => {
      if (!mountedRef.current) return;
      setFeedback('none');
      const nextIdx = currentIdx + 1;
      if (nextIdx >= questions.length) {
        endGame();
      } else {
        setCurrentIdx(nextIdx);
      }
    }, 350);
  }, [phase, feedback, currentIdx, questions, recordReview, endGame, getAchievements, addUnlocks]);

  // ── Keyboard handler ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
    const handler = (e: KeyboardEvent) => {
      const i = map[e.key];
      if (i !== undefined) handleAnswer(i);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, handleAnswer]);

  // ── Derived ───────────────────────────────────────────────────
  const timerPct   = (timeLeft / ROUND_DURATION) * 100;
  const timerColor =
    timeLeft > 20 ? 'bg-yellow-500' :
    timeLeft > 10 ? 'bg-orange-500' :
    'bg-red-500 animate-pulse';

  const q = questions[currentIdx];

  // ══════════════════════════════════════════════════════════════
  // INTRO
  // ══════════════════════════════════════════════════════════════
  if (phase === 'intro') {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="font-mono font-bold text-white text-xl mb-2 tracking-wider">
            SPEED ROUND
          </h2>
          <p className="text-zinc-400 font-mono text-sm mb-6">
            Answer as many as you can in{' '}
            <span className="text-yellow-400 font-bold">60 seconds</span>
          </p>

          <div className="text-left space-y-2 mb-8 px-2">
            {[
              ['✓', 'text-green-400',  'Correct answer = +1 point'],
              ['✗', 'text-red-400',    'Wrong answer = streak reset'],
              ['🔥', 'text-orange-400', 'Build streaks for bonus XP'],
              ['⌨', 'text-zinc-400',   'Press 1–4 to answer faster'],
            ].map(([icon, color, text]) => (
              <div key={text} className="flex items-center gap-3 font-mono text-sm">
                <span className={color}>{icon}</span>
                <span className="text-zinc-400">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-lg border border-zinc-600/40
                         text-zinc-300 font-mono text-sm hover:bg-zinc-800/40
                         transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={startGame}
              className="flex-1 py-3 rounded-xl border border-yellow-500/50
                         bg-yellow-500/10 text-yellow-400 font-mono font-bold
                         text-lg hover:bg-yellow-500/20 transition-colors"
            >
              START!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // COMPLETE
  // ══════════════════════════════════════════════════════════════
  if (phase === 'complete') {
    return (
      <SessionSummary
        stats={{
          correctCount: score,
          totalCount: Math.max(answered, 1),
          xpEarned: finalXP,
          bestStreak: bestStreak,
          elapsedMs: startTimeRef.current > 0
            ? Date.now() - startTimeRef.current
            : ROUND_DURATION * 1000,
          leveledUp: sessionLeveledUp,
          goalHit: sessionGoalHit,
        }}
        onClose={onBack}
        onPlayAgain={restartGame}
        title="TIME'S UP!"
        subtitle="Speed Round"
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // PLAYING
  // ══════════════════════════════════════════════════════════════
  if (!q) return null;

  return (
    <div className="p-4 max-w-2xl mx-auto select-none">

      <div className="flex items-center gap-4 mb-4">
        <div className={`font-mono font-black text-4xl min-w-[3.5rem] text-center
          ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
          {timeLeft}
        </div>
        <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${timerColor} rounded-full transition-all duration-1000`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
        <div className="text-right min-w-[3rem]">
          <div className="text-yellow-400 font-mono font-bold text-xl">{score}</div>
          {streak >= 3 && (
            <div className="text-orange-400 font-mono text-xs animate-pulse">
              🔥 ×{streak}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-4 overflow-hidden">
        {questions.slice(0, 20).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300
              ${i < currentIdx  ? 'bg-yellow-500/60' :
                i === currentIdx ? 'bg-yellow-400'    : 'bg-zinc-700/40'}`}
          />
        ))}
      </div>

      <div className={`p-5 rounded-xl border mb-4 transition-all duration-200
        ${feedback === 'correct' ? 'border-green-500/60 bg-green-500/10' :
          feedback === 'wrong'   ? 'border-red-500/60   bg-red-500/10'   :
          'border-zinc-700/40 bg-zinc-900/50'}`}
      >
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">
          Which word matches this definition?
        </p>
        <p className="text-white font-mono text-base leading-relaxed">
          "{q.word.definition.text}"
        </p>
        {feedback === 'correct' && (
          <p className="text-green-400 font-mono text-xs mt-2 animate-pulse">✓ Correct!</p>
        )}
        {feedback === 'wrong' && (
          <p className="text-red-400 font-mono text-xs mt-2">
            ✗ The answer was:{' '}
            <span className="font-bold">{q.options[q.correctIndex]?.word}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, idx) => {
          let cls = 'border-zinc-700/40 bg-zinc-900/50 text-white hover:border-yellow-500/50 hover:bg-yellow-500/5';
          if (feedback !== 'none') {
            cls = idx === q.correctIndex
              ? 'border-green-500/50 bg-green-500/10 text-green-300'
              : 'border-zinc-700/20 text-zinc-600 cursor-default';
          }
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={feedback !== 'none'}
              className={`p-4 rounded-xl border font-mono font-bold text-base
                          transition-all duration-150 active:scale-95 ${cls}`}
            >
              <span className="text-zinc-500 text-xs mr-2">{idx + 1}</span>
              {opt.word}
            </button>
          );
        })}
      </div>

      <p className="text-center text-zinc-700 font-mono text-xs mt-4">
        Press 1 – 4 to answer
      </p>
    </div>
  );
};