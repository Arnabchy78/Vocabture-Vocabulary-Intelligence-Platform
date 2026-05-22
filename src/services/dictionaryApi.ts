// ─────────────────────────────────────────────
//  LexiQ — Dictionary API Service
//  Fetches words from Free Dictionary API
//  https://dictionaryapi.dev/
// ─────────────────────────────────────────────

import type {
  VocabWord,
  PartOfSpeech,
  WordTag,
  Frequency,
  DifficultyTier,
} from '../types';

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// Raw API response types
interface ApiDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface ApiMeaning {
  partOfSpeech: string;
  definitions: ApiDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

interface ApiPhonetic {
  text?: string;
  audio?: string;
}

interface ApiWordResponse {
  word: string;
  phonetic?: string;
  phonetics: ApiPhonetic[];
  meanings: ApiMeaning[];
  origin?: string;
}

// Map API part of speech to our enum
const mapPartOfSpeech = (pos: string): PartOfSpeech => {
  const normalized = pos.toLowerCase();
  if (['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction'].includes(normalized)) {
    return normalized as PartOfSpeech;
  }
  return 'noun'; // fallback
};

// Estimate frequency (simple heuristic — can improve later)
const estimateFrequency = (word: string): Frequency => {
  if (word.length <= 6) return 'high';
  if (word.length <= 9) return 'medium';
  return 'low';
};

// Estimate difficulty tier
const estimateTier = (word: string): DifficultyTier => {
  const len = word.length;
  if (len <= 5) return 1;
  if (len <= 7) return 2;
  if (len <= 9) return 3;
  if (len <= 11) return 4;
  return 5;
};

// Detect Greek/Latin roots from origin text
const detectRootOrigin = (origin: string = ''): string | null => {
  const lower = origin.toLowerCase();
  if (lower.includes('greek')) return 'Greek Root';
  if (lower.includes('latin')) return 'Latin Root';
  if (lower.includes('french')) return 'French Origin';
  if (lower.includes('german')) return 'German Origin';
  return null;
};

// Generate tags for a word
const generateTags = (
  word: string,
  pos: PartOfSpeech,
  origin: string,
  freq: Frequency,
  tier: DifficultyTier
): WordTag[] => {
  const tags: WordTag[] = [];
  const idBase = word.toLowerCase();

  const root = detectRootOrigin(origin);
  if (root) {
    tags.push({ id: `${idBase}-root`, label: root, variant: 'root' });
  }

  tags.push({
    id: `${idBase}-pos`,
    label: pos.charAt(0).toUpperCase() + pos.slice(1),
    variant: 'pos',
  });

  const freqLabel = freq === 'high' ? 'High Freq' : freq === 'medium' ? 'Med Freq' : 'Low Freq';
  tags.push({ id: `${idBase}-freq`, label: freqLabel, variant: 'frequency' });

  const tierLabel = `Tier ${['I', 'II', 'III', 'IV', 'V'][tier - 1]}`;
  tags.push({ id: `${idBase}-tier`, label: tierLabel, variant: 'tier' });

  return tags;
};

/**
 * Fetch a word from the Free Dictionary API and transform it
 * into our VocabWord schema.
 */
export async function fetchWord(searchTerm: string): Promise<VocabWord | null> {
  const cleanWord = searchTerm.trim().toLowerCase();
  if (!cleanWord) return null;

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(cleanWord)}`);

    if (!response.ok) {
      // 404 means word not found
      return null;
    }

    const data: ApiWordResponse[] = await response.json();
    if (!data || data.length === 0) return null;

    const entry = data[0];
    const firstMeaning = entry.meanings[0];
    const firstDef = firstMeaning?.definitions[0];

    if (!firstMeaning || !firstDef) return null;

    // Find phonetic with text
    const phoneticText =
      entry.phonetic ||
      entry.phonetics.find((p) => p.text)?.text ||
      `/${cleanWord}/`;

    const pos = mapPartOfSpeech(firstMeaning.partOfSpeech);
    const freq = estimateFrequency(cleanWord);
    const tier = estimateTier(cleanWord);
    const origin = entry.origin || '';

    // Capitalize first letter for display
    const displayWord = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);

    // Collect synonyms from all meanings (deduplicated)
    const allSynonyms = new Set<string>();
    const allAntonyms = new Set<string>();
    entry.meanings.forEach((m) => {
      m.synonyms?.forEach((s) => allSynonyms.add(s));
      m.definitions.forEach((d) => {
        d.synonyms?.forEach((s) => allSynonyms.add(s));
        d.antonyms?.forEach((a) => allAntonyms.add(a));
      });
      m.antonyms?.forEach((a) => allAntonyms.add(a));
    });

    const word: VocabWord = {
      id: `w-${Date.now()}-${cleanWord}`,
      word: displayWord,
      phonetic: phoneticText,
      partOfSpeech: pos,
      definition: {
        text: firstDef.definition,
        example:
          firstDef.example ||
          `Use "${displayWord.toLowerCase()}" in your own sentence to remember it.`,
      },
      etymology: origin || `Etymology data not available for "${displayWord}".`,
      synonyms: Array.from(allSynonyms).slice(0, 4),
      antonyms: Array.from(allAntonyms).slice(0, 3),
      masteryLevel: 'new',
      masteryPercent: 0,
      frequency: freq,
      difficultyTier: tier,
      tags: generateTags(cleanWord, pos, origin, freq, tier),
      nextReview: new Date().toISOString().split('T')[0],
      reviewCount: 0,
    };

    return word;
  } catch (error) {
    console.error('Dictionary API error:', error);
    return null;
  }
}
// ─────────────────────────────────────────────
//  Audio URL extractor (separate from fetchWord
//  so existing callers don't break)
// ─────────────────────────────────────────────
export async function fetchWordWithAudio(
  searchTerm: string
): Promise<{ word: VocabWord; audioUrl: string | null } | null> {
  const cleanWord = searchTerm.trim().toLowerCase();
  if (!cleanWord) return null;

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(cleanWord)}`);
    if (!response.ok) return null;

    const data: ApiWordResponse[] = await response.json();
    if (!data || data.length === 0) return null;

    const entry = data[0];
    const audioUrl =
      entry.phonetics.find((p) => p.audio && p.audio.trim() !== '')?.audio ?? null;

    // Reuse fetchWord for the heavy lifting
    const word = await fetchWord(searchTerm);
    if (!word) return null;

    return { word, audioUrl };
  } catch (err) {
    console.warn(`fetchWordWithAudio failed for "${cleanWord}":`, err);
    return null;
  }
}

// ─────────────────────────────────────────────
//  Batch fetch with concurrency limit
//  Useful for seeding many words at once
// ─────────────────────────────────────────────
export async function fetchWordsBatch(
  words: string[],
  concurrency = 5
): Promise<VocabWord[]> {
  const results: VocabWord[] = [];
  const queue = [...words];

  async function worker() {
    while (queue.length > 0) {
      const w = queue.shift();
      if (!w) continue;
      const result = await fetchWord(w);
      if (result) results.push(result);
    }
  }

  await Promise.all(
    Array.from({ length: concurrency }, () => worker())
  );

  return results;
}