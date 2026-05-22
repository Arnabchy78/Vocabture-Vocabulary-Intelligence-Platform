// ─────────────────────────────────────────────
//  LexiQ — Vocabulary Store (Zustand)
//  With SM-2 spaced repetition + Progress tracking
//  + Favorites + Word Bank Discovery
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VocabWord, QueueItem, VaultStats } from '../types';
import { MOCK_WORDS } from '../data/mock';
import { calculateSM2, DEFAULT_SM2, getDueWords } from '../utils/sm2';
import type { ReviewQuality, SM2Data } from '../utils/sm2';
import { useProgressStore } from './useProgressStore';
import { WORD_BANK } from '../data/wordBank';
import { fetchWord } from '../services/dictionaryApi';

export interface StoredWord extends VocabWord {
  sm2: SM2Data;
}

export interface SessionResult {
  wordId: string;
  word: string;
  quality: ReviewQuality;
  masteryPercent: number;
}

interface VocabState {
  words: StoredWord[];
  favorites: string[];          // word IDs
  currentStudyIndex: number;
  isStudying: boolean;
  sessionResults: SessionResult[];
  isDiscovering: boolean;

  // Word actions
  addWord: (word: VocabWord) => boolean;
  addWords: (words: VocabWord[]) => number;
  removeWord: (id: string) => void;
  updateWord: (id: string, patch: Partial<StoredWord>) => void;
  hasWord: (word: string) => boolean;

  // Favorites
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getFavorites: () => StoredWord[];

  // Discovery
  discoverWords: (count?: number) => Promise<number>;

  // Study actions
  startStudySession: () => void;
  endStudySession: () => void;
  reviewWord: (wordId: string, quality: ReviewQuality) => void;
  nextCard: () => void;
  prevCard: () => void;

  // Selectors
  getQueue: () => QueueItem[];
  getStats: () => VaultStats;
  getDueWords: () => StoredWord[];
  searchWords: (query: string) => StoredWord[];
}

export const useVocabStore = create<VocabState>()(
  persist(
    (set, get) => ({
      words: MOCK_WORDS.map((w) => ({ ...w, sm2: DEFAULT_SM2 })),
      favorites: [],
      currentStudyIndex: 0,
      isStudying: false,
      sessionResults: [],
      isDiscovering: false,

      // ── Word Actions ──
      addWord: (word) => {
        const exists = get().words.some(
          (w) => w.word.toLowerCase() === word.word.toLowerCase()
        );
        if (exists) return false;
        const stored: StoredWord = { ...word, sm2: DEFAULT_SM2 };
        set((state) => ({ words: [stored, ...state.words] }));
        return true;
      },

      addWords: (newWords) => {
        const existingLower = new Set(
          get().words.map((w) => w.word.toLowerCase())
        );
        const toAdd = newWords
          .filter((w) => !existingLower.has(w.word.toLowerCase()))
          .map((w) => ({ ...w, sm2: DEFAULT_SM2 }));
        if (toAdd.length === 0) return 0;
        set((state) => ({ words: [...toAdd, ...state.words] }));
        return toAdd.length;
      },

      removeWord: (id) => {
        set((state) => ({
          words: state.words.filter((w) => w.id !== id),
          favorites: state.favorites.filter((f) => f !== id),
        }));
      },

      updateWord: (id, patch) => {
        set((state) => ({
          words: state.words.map((w) =>
            w.id === id ? { ...w, ...patch } : w
          ),
        }));
      },

      hasWord: (word) => {
        const target = word.trim().toLowerCase();
        return get().words.some((w) => w.word.toLowerCase() === target);
      },

      // ── Favorites ──
      toggleFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        }));
      },

      isFavorite: (id) => get().favorites.includes(id),

      getFavorites: () => {
        const favs = new Set(get().favorites);
        return get().words.filter((w) => favs.has(w.id));
      },

      // ── Discovery (fetch new words from WORD_BANK) ──
      discoverWords: async (count = 10) => {
        if (get().isDiscovering) return 0;
        set({ isDiscovering: true });

        try {
          const existing = new Set(
            get().words.map((w) => w.word.toLowerCase())
          );

          // Pick random candidates from the bank that aren't already in vault
          const candidates: string[] = [];
          const maxTries = count * 5;
          let tries = 0;

          while (candidates.length < count && tries < maxTries) {
            const random =
              WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
            if (!existing.has(random) && !candidates.includes(random)) {
              candidates.push(random);
            }
            tries++;
          }

          // Fetch them in parallel (concurrency = 5)
          const fetched: VocabWord[] = [];
          const queue = [...candidates];

          async function worker() {
            while (queue.length > 0) {
              const w = queue.shift();
              if (!w) continue;
              const result = await fetchWord(w);
              if (result) fetched.push(result);
            }
          }

          await Promise.all(
            Array.from({ length: 5 }, () => worker())
          );

          const added = get().addWords(fetched);
          return added;
        } finally {
          set({ isDiscovering: false });
        }
      },

      // ── Study Actions ──
      startStudySession: () => {
        set({ isStudying: true, currentStudyIndex: 0, sessionResults: [] });
      },

      endStudySession: () => {
        set({ isStudying: false, currentStudyIndex: 0 });
      },

      reviewWord: (wordId, quality) => {
        const word = get().words.find((w) => w.id === wordId);
        if (!word) return;

        const result = calculateSM2(quality, word.sm2 ?? DEFAULT_SM2);

        // 🆕 Record progress (XP, streak, daily activity)
        useProgressStore.getState().recordReview(quality);

        set((state) => ({
          words: state.words.map((w) =>
            w.id === wordId
              ? {
                  ...w,
                  sm2: {
                    easeFactor: result.easeFactor,
                    interval: result.interval,
                    repetitions: result.repetitions,
                  },
                  masteryPercent: result.masteryPercent,
                  masteryLevel: result.masteryLevel,
                  nextReview: result.nextReview,
                  reviewCount: w.reviewCount + 1,
                }
              : w
          ),
          sessionResults: [
            ...state.sessionResults,
            {
              wordId,
              word: word.word,
              quality,
              masteryPercent: result.masteryPercent,
            },
          ],
        }));
      },

      nextCard: () => {
        const dueWords = get().getDueWords();
        const current = get().currentStudyIndex;
        if (current < dueWords.length - 1) {
          set({ currentStudyIndex: current + 1 });
        }
      },

      prevCard: () => {
        const current = get().currentStudyIndex;
        if (current > 0) {
          set({ currentStudyIndex: current - 1 });
        }
      },

      // ── Selectors ──
      getQueue: (): QueueItem[] => {
        const words = get().words;
        const sorted = [...words].sort(
          (a, b) => a.masteryPercent - b.masteryPercent
        );
        return sorted.slice(0, 5).map((w) => ({
          wordId: w.id,
          word: w.word,
          masteryPercent: w.masteryPercent,
          masteryLevel: w.masteryLevel,
          dueIn:
            w.masteryLevel === 'new' || w.masteryLevel === 'learning'
              ? 'Now'
              : w.masteryLevel === 'reviewing'
              ? '2h'
              : '3d',
        }));
      },

      getStats: (): VaultStats => {
        const words = get().words;
        const mastered = words.filter(
          (w) => w.masteryLevel === 'mastered'
        ).length;
        const learning = words.filter(
          (w) =>
            w.masteryLevel === 'learning' || w.masteryLevel === 'reviewing'
        ).length;
        const newCount = words.filter((w) => w.masteryLevel === 'new').length;
        return {
          totalWords: words.length,
          masteredWords: mastered,
          learningWords: learning,
          newWords: newCount,
          weeklyGrowth: 12.4,
        };
      },

      getDueWords: (): StoredWord[] => {
        return getDueWords(get().words);
      },

      searchWords: (query) => {
        const q = query.trim().toLowerCase();
        if (!q) return get().words;
        return get().words.filter(
          (w) =>
            w.word.toLowerCase().includes(q) ||
            w.definition.text.toLowerCase().includes(q) ||
            w.synonyms.some((s) => s.toLowerCase().includes(q))
        );
      },
    }),
    {
      name: 'lexiq-vocab-storage',
      onRehydrate: (_state) => {
        return (state) => {
          if (state) {
            // Add sm2 data to any old words missing it
            state.words = state.words.map((w) => ({
              ...w,
              sm2: w.sm2 ?? DEFAULT_SM2,
            }));
            // Ensure favorites exists on old persisted state
            if (!state.favorites) state.favorites = [];
          }
        };
      },
    }
  )
);