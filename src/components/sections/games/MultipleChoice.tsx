// src/components/sections/games/MultipleChoice.tsx
// ✅ Add this import at the top


import React, { useState, useEffect, useCallback } from 'react';
import { useVocabStore } from '../../../store/useVocabStore';
import { useProgressStore } from '../../../store/useProgressStore';
import { useToastStore } from '../../../store/useToastStore'
import {
  buildMCQ,
  shuffleArray,
  calculateGameXP,
  formatTime,
  type MCQOption,
} from '../../../utils/gameUtils';
import type { VocabWord } from '../../../types';
import { SessionSummary } from '../../features/SessionSummary';
type Phase = 'playing' | 'feedback' | 'complete';

interface MultipleChoiceProps {
  onBack: () => void;
  questionCount?: number;
}

const KEY_LABELS = ['A', 'B', 'C', 'D'];

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  onBack,
  questionCount = 10,
}) => {
  const words = useVocabStore((s) => s.words);
  const recordReview = useProgressStore((s) => s.recordReview);
  const [sessionKey, setSessionKey] = useState(0);

  const restartGame = () => {
    setSessionKey((k) => k + 1);}

  // Build session questions ONCE on mount (locked)
    const [questions, setQuestions] = useState<VocabWord[]>(() =>
    shuffleArray([...words]).slice(0, Math.min(questionCount, words.length))
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState<MCQOption[]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('playing');

  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [finalXP, setFinalXP] = useState(0);
  const [sessionLeveledUp, setSessionLeveledUp] = useState(false);
  const [sessionGoalHit, setSessionGoalHit] = useState(false);


  // Reset everything when sessionKey changes (Play Again)
  useEffect(() => {
    if (sessionKey === 0) return;
    setQuestions(shuffleArray([...words]).slice(0, Math.min(questionCount, words.length)));
    setCurrentIdx(0);
    setSelectedIdx(null);
    setPhase('playing');
    setCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setStartTime(Date.now());
    setFinalXP(0);
    setSessionLeveledUp(false);
    setSessionGoalHit(false);
  }, [sessionKey, words, questionCount]);

  const currentWord = questions[currentIdx];

  // Build MCQ options when question changes
  useEffect(() => {
    if (!currentWord) return;
    const { options: opts, correctIndex } = buildMCQ(currentWord, words);
    setOptions(opts);
    setCorrectIdx(correctIndex);
    setSelectedIdx(null);
    setPhase('playing');
  }, [currentIdx, currentWord, words]);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (phase !== 'playing' || selectedIdx !== null) return;

      const isCorrect = idx === correctIdx;
      setSelectedIdx(idx);
      setPhase('feedback');

           let result;
      if (isCorrect) {
        setCorrect((c) => c + 1);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));
          return ns;
        });
        result = recordReview('easy');
      } else {
        setStreak(0);
        result = recordReview('wrong');
      }

      if (result?.leveledUp) setSessionLeveledUp(true);
      if (result?.goalHit) setSessionGoalHit(true);
      setTimeout(() => {
        if (currentIdx + 1 >= questions.length) {
          // Complete!
          const finalCorrect = isCorrect ? correct + 1 : correct;
          const elapsed = Date.now() - startTime;
          const xp = calculateGameXP(finalCorrect, questions.length, elapsed, 'mcq');
          setFinalXP(xp);
          setPhase('complete');
        } else {
          setCurrentIdx((i) => i + 1);
        }
      }, 1100);
    },
    [phase, selectedIdx, correctIdx, currentIdx, questions.length, correct, startTime, recordReview]
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, number> = {
        '1': 0, 'a': 0,
        '2': 1, 'b': 1,
        '3': 2, 'c': 2,
        '4': 3, 'd': 3,
      };
      const idx = map[e.key.toLowerCase()];
      if (idx !== undefined && idx < options.length) handleAnswer(idx);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, options.length, handleAnswer]);

  // ─── Complete Screen ───
      
  if (phase === 'complete') {
    return (
      <SessionSummary
        stats={{
          correctCount: correct,
          totalCount: questions.length,
          xpEarned: finalXP,
          bestStreak: bestStreak,
          elapsedMs: Date.now() - startTime,
          leveledUp: sessionLeveledUp,
          goalHit: sessionGoalHit,

        }}
        onClose={onBack}
        onPlayAgain={restartGame}
        title="ROUND COMPLETE"
        subtitle="Definition Match"
      />
    );
  }

  // ─── Playing Screen ───
  if (!currentWord) return null;
  const progress = (currentIdx / questions.length) * 100;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-zinc-400 hover:text-white font-mono text-sm">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          {streak >= 2 && (
            <div className="text-orange-400 font-mono text-sm font-bold animate-pulse">
              🔥 {streak}
            </div>
          )}
          <div className="text-cyan-400 font-mono text-sm">{correct}/{currentIdx} ✓</div>
          <div className="text-zinc-400 font-mono text-xs">
            {currentIdx + 1}/{questions.length}
          </div>
        </div>
      </div>

      <div className="h-1 bg-zinc-800 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-8">
        <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-3">
          Which word matches this definition?
        </p>
        <div className="p-6 rounded-xl border border-zinc-700/50 bg-zinc-900/50">
          <p className="text-white font-mono text-lg leading-relaxed">
            "{currentWord.definition.text}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect = idx === correctIdx;
          const showFeedback = phase === 'feedback';

          let cls = 'border-zinc-700/40 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-zinc-300';
          if (showFeedback) {
            if (isCorrect) cls = 'border-green-500/60 bg-green-500/10 text-green-400';
            else if (isSelected) cls = 'border-red-500/60 bg-red-500/10 text-red-400';
            else cls = 'border-zinc-700/20 text-zinc-500';
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={phase === 'feedback'}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left disabled:cursor-default ${cls}`}
            >
              <span className="w-8 h-8 rounded-lg border border-zinc-600/40 flex items-center justify-center font-mono font-bold text-sm flex-shrink-0">
                {KEY_LABELS[idx]}
              </span>
              <span className="font-mono text-base font-bold">{option.word}</span>
              {showFeedback && isCorrect && <span className="ml-auto">✓</span>}
              {showFeedback && isSelected && !isCorrect && <span className="ml-auto">✗</span>}
            </button>
          );
        })}
      </div>

      <p className="text-zinc-600 font-mono text-xs text-center mt-4">
        Press 1–4 or A–D
      </p>
    </div>
  );
};