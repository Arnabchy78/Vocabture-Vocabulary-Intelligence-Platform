// ─────────────────────────────────────────────
//  LexiQ — Mock Data
// ─────────────────────────────────────────────

import type {
  VocabWord,
  StudySession,
  VaultStats,
  Achievement,
  QueueItem,
} from '../types';

export const MOCK_WORDS: VocabWord[] = [
  {
    id: 'w1',
    word: 'Ephemeral',
    phonetic: '/ɪˈfem.ər.əl/',
    partOfSpeech: 'adjective',
    definition: {
      text: 'Lasting for a very short time; transitory.',
      example:
        'The ephemeral beauty of cherry blossoms makes their brief bloom all the more precious.',
    },
    etymology: 'Greek ephḗmeros — "lasting a day," from epi- (on) + hēméra (day)',
    synonyms: ['transient', 'fleeting', 'momentary', 'evanescent'],
    antonyms: ['permanent', 'eternal', 'enduring'],
    masteryLevel: 'mastered',
    masteryPercent: 94,
    frequency: 'high',
    difficultyTier: 3,
    tags: [
      { id: 't1', label: 'Greek Root', variant: 'root' },
      { id: 't2', label: 'Adjective', variant: 'pos' },
      { id: 't3', label: 'High Freq', variant: 'frequency' },
      { id: 't4', label: 'Tier III', variant: 'tier' },
    ],
    nextReview: '2025-02-14',
    reviewCount: 12,
  },
  {
    id: 'w2',
    word: 'Sycophant',
    phonetic: '/ˈsɪk.ə.fænt/',
    partOfSpeech: 'noun',
    definition: {
      text: 'A person who acts obsequiously toward someone important in order to gain advantage.',
      example:
        'The CEO surrounded himself with sycophants who never challenged his increasingly reckless decisions.',
    },
    etymology: 'Greek sykophantēs — "informer," from sykon (fig) + phainein (to show)',
    synonyms: ['flatterer', 'toady', 'yes-man', 'fawner'],
    antonyms: ['critic', 'detractor', 'antagonist'],
    masteryLevel: 'reviewing',
    masteryPercent: 67,
    frequency: 'medium',
    difficultyTier: 4,
    tags: [
      { id: 't5', label: 'Greek Root', variant: 'root' },
      { id: 't6', label: 'Noun', variant: 'pos' },
      { id: 't7', label: 'Med Freq', variant: 'frequency' },
      { id: 't8', label: 'Tier IV', variant: 'tier' },
    ],
    nextReview: '2025-01-31',
    reviewCount: 6,
  },
  {
    id: 'w3',
    word: 'Perspicacious',
    phonetic: '/ˌpɜːr.spɪˈkeɪ.ʃəs/',
    partOfSpeech: 'adjective',
    definition: {
      text: 'Having a ready insight into things; shrewd and discerning.',
      example:
        'Her perspicacious analysis of market trends consistently outpaced her peers.',
    },
    etymology: 'Latin perspicax — "sharp-sighted," from perspicere (to see through)',
    synonyms: ['astute', 'shrewd', 'perceptive', 'discerning'],
    antonyms: ['obtuse', 'dim-witted', 'imperceptive'],
    masteryLevel: 'learning',
    masteryPercent: 38,
    frequency: 'low',
    difficultyTier: 5,
    tags: [
      { id: 't9', label: 'Latin Root', variant: 'root' },
      { id: 't10', label: 'Adjective', variant: 'pos' },
      { id: 't11', label: 'Low Freq', variant: 'frequency' },
      { id: 't12', label: 'Tier V', variant: 'tier' },
    ],
    nextReview: '2025-01-29',
    reviewCount: 3,
  },
  {
    id: 'w4',
    word: 'Mellifluous',
    phonetic: '/məˈlɪf.lu.əs/',
    partOfSpeech: 'adjective',
    definition: {
      text: 'Sweet or musical; pleasant to hear.',
      example:
        'The mellifluous tones of the cello filled the concert hall with warmth.',
    },
    etymology: 'Latin mellifluus — from mel (honey) + fluere (to flow)',
    synonyms: ['dulcet', 'euphonious', 'honeyed', 'melodious'],
    antonyms: ['discordant', 'harsh', 'cacophonous'],
    masteryLevel: 'new',
    masteryPercent: 0,
    frequency: 'low',
    difficultyTier: 4,
    tags: [
      { id: 't13', label: 'Latin Root', variant: 'root' },
      { id: 't14', label: 'Adjective', variant: 'pos' },
      { id: 't15', label: 'Low Freq', variant: 'frequency' },
      { id: 't16', label: 'Tier IV', variant: 'tier' },
    ],
    nextReview: '2025-01-28',
    reviewCount: 0,
  },
  {
    id: 'w5',
    word: 'Obfuscate',
    phonetic: '/ˈɒb.fʌs.keɪt/',
    partOfSpeech: 'verb',
    definition: {
      text: 'To render obscure, unclear, or unintelligible; to confuse.',
      example:
        'The politician tried to obfuscate the facts with misleading statistics and jargon.',
    },
    etymology: 'Latin obfuscare — from ob- (over) + fuscare (to darken)',
    synonyms: ['obscure', 'muddy', 'confuse', 'becloud'],
    antonyms: ['clarify', 'elucidate', 'illuminate'],
    masteryLevel: 'reviewing',
    masteryPercent: 55,
    frequency: 'medium',
    difficultyTier: 4,
    tags: [
      { id: 't17', label: 'Latin Root', variant: 'root' },
      { id: 't18', label: 'Verb', variant: 'pos' },
      { id: 't19', label: 'Med Freq', variant: 'frequency' },
      { id: 't20', label: 'Tier IV', variant: 'tier' },
    ],
    nextReview: '2025-02-01',
    reviewCount: 5,
  },
];

export const MOCK_SESSION: StudySession = {
  streak: 14,
  wordsToday: 8,
  wordsTarget: 15,
  xpEarned: 340,
  xpTotal: 12480,
  accuracy: 87,
  sessionMinutes: 23,
};

export const MOCK_VAULT_STATS: VaultStats = {
  totalWords: 347,
  masteredWords: 189,
  learningWords: 98,
  newWords: 60,
  weeklyGrowth: 12.4,
};

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    title: 'Lexical Genesis',
    description: 'Added your first 10 words to the Vault.',
    icon: '⚡',
    unlockedAt: '2024-11-01',
    tier: 'bronze',
  },
  {
    id: 'a2',
    title: 'Proof of Study',
    description: 'Maintained a 7-day learning streak.',
    icon: '🔥',
    unlockedAt: '2024-12-15',
    tier: 'silver',
  },
  {
    id: 'a3',
    title: 'Digital Gold',
    description: 'Mastered 100 words with ≥ 90% recall.',
    icon: '✦',
    unlockedAt: '2025-01-10',
    tier: 'gold',
  },
  {
    id: 'a4',
    title: 'Omnilexicon',
    description: 'Master 500 words across all tiers.',
    icon: '◈',
    unlockedAt: null,
    tier: 'platinum',
  },
];

export const MOCK_QUEUE: QueueItem[] = [
  { wordId: 'w3', word: 'Perspicacious', masteryPercent: 38, masteryLevel: 'learning', dueIn: 'Now' },
  { wordId: 'w4', word: 'Mellifluous',   masteryPercent: 0,  masteryLevel: 'new',      dueIn: 'Now' },
  { wordId: 'w5', word: 'Obfuscate',     masteryPercent: 55, masteryLevel: 'reviewing', dueIn: '2h' },
  { wordId: 'w2', word: 'Sycophant',     masteryPercent: 67, masteryLevel: 'reviewing', dueIn: '4h' },
  { wordId: 'w1', word: 'Ephemeral',     masteryPercent: 94, masteryLevel: 'mastered',  dueIn: '3d' },
];
