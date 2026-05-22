// ─────────────────────────────────────────────
//  LexiQ — Core Type Definitions
// ─────────────────────────────────────────────

export type MasteryLevel = 'new' | 'learning' | 'reviewing' | 'mastered';
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction';
export type Frequency = 'high' | 'medium' | 'low';
export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

export interface WordTag {
  id: string;
  label: string;
  variant: 'root' | 'pos' | 'frequency' | 'origin' | 'tier';
}

export interface WordDefinition {
  text: string;
  example: string;
}

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: PartOfSpeech;
  definition: WordDefinition;
  etymology: string;
  synonyms: string[];
  antonyms: string[];
  masteryLevel: MasteryLevel;
  masteryPercent: number;
  frequency: Frequency;
  difficultyTier: DifficultyTier;
  tags: WordTag[];
  nextReview: string; // ISO date string
  reviewCount: number;
}

export interface StudySession {
  streak: number;
  wordsToday: number;
  wordsTarget: number;
  xpEarned: number;
  xpTotal: number;
  accuracy: number;
  sessionMinutes: number;
}

export interface VaultStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  weeklyGrowth: number; // percent
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface QueueItem {
  wordId: string;
  word: string;
  masteryPercent: number;
  masteryLevel: MasteryLevel;
  dueIn: string;
}
export type NavSection = 'dashboard' | 'vault' | 'study' | 'games' | 'analytics' | 'settings';
