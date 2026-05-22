import { useEffect, useState } from 'react';
import { X, Volume2, Plus, Check, Loader2, Search } from 'lucide-react';
import { fetchWordWithAudio } from '../../services/dictionaryApi';
import { useVocabStore } from '../../store/useVocabStore';
import type { VocabWord } from '../../types';

interface GlobalSearchModalProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
}

// Safely coerce anything to a printable string
function asText(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object' && 'text' in (v as any)) return String((v as any).text ?? '');
  return '';
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(asText).filter(Boolean);
}

export function GlobalSearchModal({ query, isOpen, onClose }: GlobalSearchModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [word, setWord] = useState<VocabWord | null>(null);
  const [added, setAdded] = useState(false);

  const addWords = useVocabStore((s) => s.addWords);
  const hasWord = useVocabStore((s) => s.hasWord);

  useEffect(() => {
    if (!isOpen || !query.trim()) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setWord(null);
    setAdded(false);

        fetchWordWithAudio(query.trim().toLowerCase())
      .then((result) => {
        if (cancelled) return;
        const fetchedWord = result?.word ?? null;
        if (!fetchedWord) {
          setError(`No definition found for "${query}"`);
        } else {
          console.log('[GlobalSearch] API result:', result);
          setWord(fetchedWord);
          if (hasWord(fetchedWord.word)) setAdded(true);
        }
      })
      .catch((err) => {
        console.error('[GlobalSearch] fetch failed:', err);
        if (!cancelled) setError('Failed to fetch word. Check your connection.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, isOpen, hasWord]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  function speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }

  function handleAdd() {
    if (!word) return;
    addWords([word]);
    setAdded(true);
  }

  if (!isOpen) return null;

  const wordText      = asText(word?.word);
  const phoneticText  = asText(word?.phonetic);
  const posText       = asText(word?.partOfSpeech);
  const defText       = asText(word?.definition?.text ?? word?.definition);
  const exampleText   = asText(word?.definition?.example);
  const synonyms      = asStringArray(word?.synonyms);
  const antonyms      = asStringArray(word?.antonyms);
  console.log('[Modal] render', {
    isOpen,
    loading,
    error,
    word,
    wordText,
    posText,
    defText,
  });
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 pt-[10vh] overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 md:p-8">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              <p className="font-mono text-xs text-gray-400">
                Searching dictionary for "{query}"...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Search className="h-10 w-10 text-gray-600" />
              <p className="text-base text-white">{error}</p>
              <p className="font-mono text-xs text-gray-500">
                Try a different word or check spelling.
              </p>
            </div>
          )}

          {!loading && word && (
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <h2
                    className="text-3xl md:text-4xl font-bold leading-none gradient-text-orange"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {wordText}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {phoneticText && (
                      <span className="font-mono text-sm text-[#a38d7b]">{phoneticText}</span>
                    )}
                    <button
                      onClick={() => speak(wordText)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
                      aria-label="Pronounce"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {posText && (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb874] px-2 py-1 rounded-md border border-[#ffb874]/30 bg-[#ffb874]/10">
                    {posText}
                  </span>
                )}
              </div>

              {defText && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Definition
                  </p>
                  <p className="text-base leading-relaxed text-[#f1dfd2]">{defText}</p>
                </div>
              )}

              {exampleText && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Example
                  </p>
                  <blockquote className="border-l-2 border-[#ffb874]/40 pl-4">
                    <p className="text-sm italic leading-relaxed text-[#dbc2ae]">
                      "{exampleText}"
                    </p>
                  </blockquote>
                </div>
              )}

              {(synonyms.length > 0 || antonyms.length > 0) && (
                <div className="flex flex-wrap gap-6">
                  {synonyms.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                        Synonyms
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {synonyms.slice(0, 6).map((s, i) => (
                          <span
                            key={`${s}-${i}`}
                            className="font-mono text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5 text-gray-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {antonyms.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                        Antonyms
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {antonyms.slice(0, 6).map((a, i) => (
                          <span
                            key={`${a}-${i}`}
                            className="font-mono text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5 text-gray-300"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={handleAdd}
                  disabled={added}
                  className={[
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition',
                    added
                      ? 'bg-green-500/15 text-green-300 border border-green-400/30 cursor-default'
                      : 'bg-[#ffb874] text-[#0a0705] hover:opacity-90 active:scale-95',
                  ].join(' ')}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" />
                      In Your Vault
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add to Vault
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}