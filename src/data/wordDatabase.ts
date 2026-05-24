// ─────────────────────────────────────────────
//  LexiQ — GRE Word Database — Master Index
//  Combines all 5 batches: 1000+ GRE words
// ─────────────────────────────────────────────

import type { VocabWord } from '../types';
import { WORD_DB_1 } from './wordDb1.ts';
import { WORD_DB_2 } from './wordDb2.ts';
import { WORD_DB_3 } from './wordDb3.ts';
import { WORD_DB_4 } from './wordDb4.ts';
import { WORD_DB_5 } from './wordDb5.ts';

export const WORD_DATABASE: VocabWord[] = [
  ...WORD_DB_1,
  ...WORD_DB_2,
  ...WORD_DB_3,
  ...WORD_DB_4,
  ...WORD_DB_5,
];

export const WORD_DATABASE_COUNT = WORD_DATABASE.length;

// ── Quick lookup by ID ─────────────────────────────────────────
const _wordMap = new Map<string, VocabWord>(
  WORD_DATABASE.map((w) => [w.id, w])
);

export function getWordById(id: string): VocabWord | undefined {
  return _wordMap.get(id);
}

// ── Filter helpers ─────────────────────────────────────────────
export function getWordsByTier(tier: 1 | 2 | 3 | 4 | 5): VocabWord[] {
  return WORD_DATABASE.filter((w) => w.difficultyTier === tier);
}

export function getWordsByPos(pos: VocabWord['partOfSpeech']): VocabWord[] {
  return WORD_DATABASE.filter((w) => w.partOfSpeech === pos);
}

export function getWordsByFrequency(freq: VocabWord['frequency']): VocabWord[] {
  return WORD_DATABASE.filter((w) => w.frequency === freq);
}

export function searchWords(query: string): VocabWord[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return WORD_DATABASE.filter(
    (w) =>
      w.word.toLowerCase().includes(q) ||
      w.definition.text.toLowerCase().includes(q) ||
      w.synonyms.some((s) => s.toLowerCase().includes(q))
  );
}
