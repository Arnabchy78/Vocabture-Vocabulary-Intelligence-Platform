// src/utils/seedWords.ts
// Run this in browser console: import('/src/utils/seedWords.ts').then(m => m.seedVocabWords())
// OR we'll wire it to a button

import { useVocabStore } from '../store/useVocabStore';
import { fetchWord } from '../services/dictionaryApi';

const SEED_WORD_LIST = [
  // Tier 1 — Common academic
  'ephemeral', 'ubiquitous', 'ambiguous', 'eloquent', 'resilient',
  'pragmatic', 'altruistic', 'verbose', 'lucid', 'tenacious',
  // Tier 2 — Advanced
  'sycophant', 'obfuscate', 'perfidious', 'laconic', 'mellifluous',
  'perspicacious', 'recalcitrant', 'solipsistic', 'truculent', 'byzantine',
  // Tier 3 — Literary/rare
  'susurrus', 'petrichor', 'hiraeth', 'sonder', 'liminal',
];

export async function seedVocabWords(
  onProgress?: (current: number, total: number, word: string) => void
) {
  const store = useVocabStore.getState();
  const existingWords = new Set(
    store.words.map((w) => w.word.toLowerCase())
  );

  const wordsToAdd = SEED_WORD_LIST.filter(
    (w) => !existingWords.has(w.toLowerCase())
  );

  console.log(`[Seed] Adding ${wordsToAdd.length} words...`);

  const results = { success: 0, failed: 0, skipped: SEED_WORD_LIST.length - wordsToAdd.length };
  const failed: string[] = [];

  for (let i = 0; i < wordsToAdd.length; i++) {
    const word = wordsToAdd[i];
    onProgress?.(i + 1, wordsToAdd.length, word);

    try {
      const data = await fetchWord(word);
      if (data) {
        store.addWord(data);
        results.success++;
        console.log(`[Seed] ✅ ${word}`);
      } else {
        results.failed++;
        failed.push(word);
        console.log(`[Seed] ❌ ${word} — no data`);
      }
    } catch (err) {
      results.failed++;
      failed.push(word);
      console.log(`[Seed] ❌ ${word} — error:`, err);
    }

    // Respect API rate limits — 200ms between requests
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log('[Seed] Complete:', results);
  if (failed.length) console.log('[Seed] Failed words:', failed);
  return results;
}