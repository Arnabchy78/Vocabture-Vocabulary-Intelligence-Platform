// src/utils/gameUtils.ts

import type { VocabWord } from '../types';

// ─────────────────────────────────────────────────────────────
// Shuffle (Fisher-Yates)
// ─────────────────────────────────────────────────────────────
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────
// Multiple Choice helpers
// ─────────────────────────────────────────────────────────────
export interface MCQOption {
  word: string;
  definition: string;
  isCorrect: boolean;
}

export function pickDistractors(
  target: VocabWord,
  pool: VocabWord[],
  count: number
): VocabWord[] {
  const others = pool.filter((w) => w.id !== target.id);
  return shuffleArray(others).slice(0, count);
}

export function buildMCQ(
  target: VocabWord,
  pool: VocabWord[]
): { options: MCQOption[]; correctIndex: number } {
  const distractors = pickDistractors(target, pool, 3);
  const options: MCQOption[] = [
    {
      word: target.word,
      definitionText: target.definition.text,
      isCorrect: true,
    },
    ...distractors.map((d) => ({
      word: d.word,
      definitionText: d.definition.text,
      isCorrect: false,
    })),
  ];
  
  const shuffled = shuffleArray(options);
  const correctIndex = shuffled.findIndex((o) => o.isCorrect);

  return { options: shuffled, correctIndex };
}

// ─────────────────────────────────────────────────────────────
// Scramble
// ─────────────────────────────────────────────────────────────
export function scrambleWord(word: string): string {
  const letters = word.toLowerCase().split('');
  let scrambled: string;
  let attempts = 0;
  do {
    scrambled = shuffleArray(letters).join('');
    attempts++;
  } while (scrambled === word.toLowerCase() && attempts < 20);
  return scrambled;
}

export function buildScrambleHint(word: string): string {
  if (word.length <= 2) return word;
  if (word.length === 3) return `${word[0]}_${word[2]}`;
  return `${word[0]}${'_'.repeat(word.length - 2)}${word[word.length - 1]}`;
}

// ─────────────────────────────────────────────────────────────
// Match Mode
// ─────────────────────────────────────────────────────────────
export interface MatchPair {
  id: string;
  word: string;
  definition: string;
  matched: boolean;
}

export function buildMatchPairs(words: VocabWord[], count = 6): MatchPair[] {
  const selected = shuffleArray([...words]).slice(0, count);
  return selected.map((w) => ({
    id: w.id,
    word: w.word,
    definition: w.definition.text,
    matched: false,
  }));
}

// ─────────────────────────────────────────────────────────────
// Speed Round
// ─────────────────────────────────────────────────────────────
export interface SpeedQuestion {
  word: VocabWord;
  options: MCQOption[];
  correctIndex: number;
}

export function buildSpeedRound(
  pool: VocabWord[],
  count = 40
): SpeedQuestion[] {
  const selected = shuffleArray([...pool]).slice(0, Math.min(count, pool.length));
  return selected.map((word) => ({
    word,
    ...buildMCQ(word, pool),
  }));
}

// ─────────────────────────────────────────────────────────────
// XP Scoring
// ─────────────────────────────────────────────────────────────
export function calculateGameXP(
  correct: number,
  total: number,
  timeMs: number,
  gameType: 'mcq' | 'scramble' | 'speed' | 'match'
): number {
  const accuracy = correct / Math.max(total, 1);
  const baseXP = correct * 3;

  const speedBonus =
    gameType === 'speed'
      ? Math.max(0, Math.floor((60000 - timeMs) / 5000)) * 2
      : 0;

  const accuracyBonus = accuracy === 1 ? 10 : accuracy >= 0.8 ? 5 : 0;

  return baseXP + speedBonus + accuracyBonus;
}

// ─────────────────────────────────────────────────────────────
// Format helpers
// ─────────────────────────────────────────────────────────────
export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remaining}s` : `${remaining}s`;
}