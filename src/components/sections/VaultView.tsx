// ─────────────────────────────────────────────
//  LexiQ — Vocabulary Vault (Full Browser)
// ─────────────────────────────────────────────

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVocabStore } from '../../store/useVocabStore';
import type { StoredWord } from '../../store/useVocabStore';
import type { MasteryLevel } from '../../types';
import { getDueWords as computeDueWords } from '../../utils/sm2';

type SortKey = 'alpha' | 'recent' | 'weakest' | 'strongest' | 'reviews';
type FilterKey =
  | 'all'
  | 'due'
  | 'favorites'
  | 'new'
  | 'learning'
  | 'reviewing'
  | 'mastered'
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb';

interface VaultViewProps {
  onBack?: () => void;
}

export const VaultView: React.FC<VaultViewProps> = ({ onBack }) => {
  const words = useVocabStore((s) => s.words);
  const favorites = useVocabStore((s) => s.favorites);
  const toggleFavorite = useVocabStore((s) => s.toggleFavorite);
  const removeWord = useVocabStore((s) => s.removeWord);
  const discoverWords = useVocabStore((s) => s.discoverWords);
  const isDiscovering = useVocabStore((s) => s.isDiscovering);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('alpha');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selected, setSelected] = useState<StoredWord | null>(null);

  // ── Counts for filter chips ────────────────────────
  const counts = useMemo(() => {
    const dueIds = new Set(computeDueWords(words).map((w) => w.id));
    return {
      all: words.length,
      due: dueIds.size,
      favorites: favorites.length,
      new: words.filter((w) => w.masteryLevel === 'new').length,
      learning: words.filter((w) => w.masteryLevel === 'learning').length,
      reviewing: words.filter((w) => w.masteryLevel === 'reviewing').length,
      mastered: words.filter((w) => w.masteryLevel === 'mastered').length,
      noun: words.filter((w) => w.partOfSpeech === 'noun').length,
      verb: words.filter((w) => w.partOfSpeech === 'verb').length,
      adjective: words.filter((w) => w.partOfSpeech === 'adjective').length,
      adverb: words.filter((w) => w.partOfSpeech === 'adverb').length,
    };
  }, [words, favorites]);

  // ── Filtered + sorted list ────────────────────────
  const visibleWords = useMemo(() => {
    let list = [...words];
    const dueIds = new Set(computeDueWords(words).map((w) => w.id));
    const favSet = new Set(favorites);

    // Filter
    switch (filter) {
      case 'due':       list = list.filter((w) => dueIds.has(w.id)); break;
      case 'favorites': list = list.filter((w) => favSet.has(w.id)); break;
      case 'new':       list = list.filter((w) => w.masteryLevel === 'new'); break;
      case 'learning':  list = list.filter((w) => w.masteryLevel === 'learning'); break;
      case 'reviewing': list = list.filter((w) => w.masteryLevel === 'reviewing'); break;
      case 'mastered':  list = list.filter((w) => w.masteryLevel === 'mastered'); break;
      case 'noun':      list = list.filter((w) => w.partOfSpeech === 'noun'); break;
      case 'verb':      list = list.filter((w) => w.partOfSpeech === 'verb'); break;
      case 'adjective': list = list.filter((w) => w.partOfSpeech === 'adjective'); break;
      case 'adverb':    list = list.filter((w) => w.partOfSpeech === 'adverb'); break;
    }

    // Search
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.definition.text.toLowerCase().includes(q) ||
          w.synonyms.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sort) {
      case 'alpha':     list.sort((a, b) => a.word.localeCompare(b.word)); break;
      case 'recent':    list.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'weakest':   list.sort((a, b) => a.masteryPercent - b.masteryPercent); break;
      case 'strongest': list.sort((a, b) => b.masteryPercent - a.masteryPercent); break;
      case 'reviews':   list.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }

    return list;
  }, [words, query, sort, filter, favorites]);

  // ── Audio ─────────────────────────────────────────
  const playAudio = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-zinc-400 hover:text-white font-mono text-sm"
            >
              ← Back
            </button>
          )}
          <h2 className="font-mono font-bold text-white text-lg tracking-wider">
            WORD VAULT
          </h2>
          <span className="text-zinc-500 font-mono text-sm">
            {visibleWords.length} of {words.length}
          </span>
        </div>

        <button
          onClick={() => discoverWords(15)}
          disabled={isDiscovering}
          className="px-4 py-2 rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-400 font-mono text-sm hover:bg-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isDiscovering ? '⏳ Discovering...' : '✨ Discover 15'}
        </button>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search word, definition, synonym..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700/40 bg-zinc-900/50 text-white font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="px-4 py-3 rounded-xl border border-zinc-700/40 bg-zinc-900/50 text-zinc-300 font-mono text-sm focus:outline-none focus:border-cyan-500/50 cursor-pointer"
        >
          <option value="alpha">A → Z</option>
          <option value="weakest">Weakest first</option>
          <option value="strongest">Strongest first</option>
          <option value="reviews">Most reviewed</option>
          <option value="recent">Recently reviewed</option>
        </select>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Chip label="All"         count={counts.all}        active={filter === 'all'}        onClick={() => setFilter('all')}        color="zinc" />
        <Chip label="Due Today"   count={counts.due}        active={filter === 'due'}        onClick={() => setFilter('due')}        color="cyan" />
        <Chip label="★ Favorites" count={counts.favorites}  active={filter === 'favorites'}  onClick={() => setFilter('favorites')}  color="yellow" />
        <div className="w-px bg-zinc-700/40 mx-1" />
        <Chip label="New"        count={counts.new}        active={filter === 'new'}        onClick={() => setFilter('new')}        color="purple" />
        <Chip label="Learning"   count={counts.learning}   active={filter === 'learning'}   onClick={() => setFilter('learning')}   color="orange" />
        <Chip label="Reviewing"  count={counts.reviewing}  active={filter === 'reviewing'}  onClick={() => setFilter('reviewing')}  color="blue" />
        <Chip label="Mastered"   count={counts.mastered}   active={filter === 'mastered'}   onClick={() => setFilter('mastered')}   color="green" />
        <div className="w-px bg-zinc-700/40 mx-1" />
        <Chip label="Noun"       count={counts.noun}       active={filter === 'noun'}       onClick={() => setFilter('noun')}       color="zinc" />
        <Chip label="Verb"       count={counts.verb}       active={filter === 'verb'}       onClick={() => setFilter('verb')}       color="zinc" />
        <Chip label="Adj"        count={counts.adjective}  active={filter === 'adjective'}  onClick={() => setFilter('adjective')}  color="zinc" />
        <Chip label="Adv"        count={counts.adverb}     active={filter === 'adverb'}     onClick={() => setFilter('adverb')}     color="zinc" />
      </div>

            {/* Word grid */}
      {visibleWords.length === 0 ? (
        words.length === 0 ? (
          <EmptyVault
            onDiscover={() => discoverWords(15)}
            isDiscovering={isDiscovering}
          />
        ) : (
          <EmptyFilter
            filterLabel={
              query
                ? query
                : filter !== 'all'
                ? filter
                : 'current filter'
            }
            onClear={() => {
              setQuery('');
              setFilter('all');
            }}
          />
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleWords.map((w) => (
            <WordCard
              key={w.id}
              word={w}
              isFav={favorites.includes(w.id)}
              onClick={() => setSelected(w)}
              onToggleFav={(e) => {
                e.stopPropagation();
                toggleFavorite(w.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <DetailModal
            word={selected}
            isFav={favorites.includes(selected.id)}
            onClose={() => setSelected(null)}
            onToggleFav={() => toggleFavorite(selected.id)}
            onRemove={() => {
              removeWord(selected.id);
              setSelected(null);
            }}
            onPlayAudio={() => playAudio(selected.word)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
//  Filter Chip
// ─────────────────────────────────────────────
type ChipColor = 'zinc' | 'cyan' | 'yellow' | 'purple' | 'orange' | 'blue' | 'green';

const chipPalette: Record<ChipColor, string> = {
  zinc:   'border-zinc-500/60 bg-zinc-500/15 text-zinc-200',
  cyan:   'border-cyan-500/60 bg-cyan-500/15 text-cyan-300',
  yellow: 'border-yellow-500/60 bg-yellow-500/15 text-yellow-300',
  purple: 'border-purple-500/60 bg-purple-500/15 text-purple-300',
  orange: 'border-orange-500/60 bg-orange-500/15 text-orange-300',
  blue:   'border-blue-500/60 bg-blue-500/15 text-blue-300',
  green:  'border-green-500/60 bg-green-500/15 text-green-300',
};

const Chip: React.FC<{
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: ChipColor;
}> = ({ label, count, active, onClick, color }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg border font-mono text-xs transition-all ${
      active
        ? chipPalette[color]
        : 'border-zinc-700/40 bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600/60'
    }`}
  >
    {label} <span className="opacity-60">({count})</span>
  </button>
);

// ─────────────────────────────────────────────
//  Word Card
// ─────────────────────────────────────────────
const masteryColor = (level: MasteryLevel) => {
  switch (level) {
    case 'mastered':  return 'bg-green-500';
    case 'reviewing': return 'bg-blue-500';
    case 'learning':  return 'bg-orange-500';
    case 'new':       return 'bg-purple-500';
  }
};

const WordCard: React.FC<{
  word: StoredWord;
  isFav: boolean;
  onClick: () => void;
  onToggleFav: (e: React.MouseEvent) => void;
}> = ({ word, isFav, onClick, onToggleFav }) => (
  <button
    onClick={onClick}
    className="p-4 rounded-xl border border-zinc-700/40 bg-zinc-900/50 hover:border-cyan-500/40 hover:bg-zinc-800/60 transition-all text-left group"
  >
    <div className="flex items-start justify-between mb-2">
      <div className="min-w-0 flex-1">
        <p className="text-white font-mono font-bold text-base truncate group-hover:text-cyan-400 transition-colors">
          {word.word}
        </p>
        <p className="text-zinc-500 font-mono text-xs truncate">{word.phonetic}</p>
      </div>
      <button
        onClick={onToggleFav}
        className={`w-7 h-7 rounded-md transition-colors flex items-center justify-center ${
          isFav ? 'text-yellow-400' : 'text-zinc-600 hover:text-yellow-400'
        }`}
      >
        {isFav ? '★' : '☆'}
      </button>
    </div>

    <p className="text-zinc-400 font-mono text-xs line-clamp-2 mb-3 min-h-[2.5rem]">
      {word.definition.text}
    </p>

    <div className="flex items-center justify-between gap-2">
      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest text-purple-300 border border-purple-500/30 bg-purple-500/10">
        {word.partOfSpeech}
      </span>
      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${masteryColor(word.masteryLevel)} transition-all`}
          style={{ width: `${word.masteryPercent}%` }}
        />
      </div>
      <span className="text-zinc-500 font-mono text-xs min-w-[2.5rem] text-right">
        {word.masteryPercent}%
      </span>
    </div>
  </button>
);

// ─────────────────────────────────────────────
//  Empty State
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
//  Empty States
// ─────────────────────────────────────────────
const EmptyVault: React.FC<{ onDiscover: () => void; isDiscovering: boolean }> = ({
  onDiscover,
  isDiscovering,
}) => (
  <div className="p-8 md:p-14 text-center rounded-2xl border border-zinc-700/40 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40">
    <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-400 to-pink-500 text-zinc-950 shadow-lg shadow-purple-500/20 mb-4">
      <span className="text-2xl">🗃️</span>
    </div>
    <h3 className="text-white font-bold text-xl md:text-2xl mb-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      Your vault is empty
    </h3>
    <p className="text-zinc-400 font-mono text-sm max-w-md mx-auto mb-6 leading-relaxed">
      Start by discovering 15 curated words from our bank, or use the search
      bar in the top header to look up any word and add it to your vault.
    </p>
    <button
      onClick={onDiscover}
      disabled={isDiscovering}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffb874] text-[#0a0705] font-mono text-sm font-bold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
    >
      {isDiscovering ? '⏳ Discovering...' : '✨ Discover 15 Words'}
    </button>
  </div>
);

const EmptyFilter: React.FC<{ onClear: () => void; filterLabel: string }> = ({
  onClear,
  filterLabel,
}) => (
  <div className="p-8 md:p-12 text-center rounded-2xl border border-zinc-700/40 bg-zinc-900/30">
    <div className="text-4xl mb-3">🔎</div>
    <h3 className="text-white font-mono font-bold mb-1">No matches</h3>
    <p className="text-zinc-500 font-mono text-sm mb-5">
      No words match <span className="text-zinc-300">"{filterLabel}"</span>.
    </p>
    <button
      onClick={onClear}
      className="px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-zinc-300 font-mono text-sm hover:bg-zinc-800 transition-colors"
    >
      Clear filters
    </button>
  </div>
);
// ─────────────────────────────────────────────
//  Detail Modal
// ─────────────────────────────────────────────
const DetailModal: React.FC<{
  word: StoredWord;
  isFav: boolean;
  onClose: () => void;
  onToggleFav: () => void;
  onRemove: () => void;
  onPlayAudio: () => void;
}> = ({ word, isFav, onClose, onToggleFav, onRemove, onPlayAudio }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-700/60 bg-zinc-950 shadow-2xl"
    >
      <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 p-5 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-white font-mono font-black text-3xl truncate">
              {word.word}
            </h2>
            <button
              onClick={onToggleFav}
              className={`w-9 h-9 rounded-lg border transition-all flex items-center justify-center ${
                isFav
                  ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400'
                  : 'border-zinc-700/40 text-zinc-500 hover:text-yellow-400 hover:border-yellow-500/40'
              }`}
            >
              {isFav ? '★' : '☆'}
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-zinc-400 font-mono text-sm">{word.phonetic}</span>
            <button
              onClick={onPlayAudio}
              className="w-8 h-8 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors flex items-center justify-center"
            >
              🔊
            </button>
            <span className="px-2 py-0.5 rounded-md border border-purple-500/40 bg-purple-500/10 text-purple-300 font-mono text-xs uppercase tracking-widest">
              {word.partOfSpeech}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white font-mono text-lg ml-3"
        >
          ✕
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">
            Definition
          </p>
          <p className="text-white font-mono text-base leading-relaxed">
            {word.definition.text}
          </p>
          {word.definition.example && (
            <p className="text-zinc-400 font-mono text-sm italic mt-2">
              "{word.definition.example}"
            </p>
          )}
        </div>

        {word.etymology && (
          <div>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">
              Etymology
            </p>
            <p className="text-zinc-300 font-mono text-sm leading-relaxed">
              {word.etymology}
            </p>
          </div>
        )}

        {word.synonyms.length > 0 && (
          <div>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">
              Synonyms
            </p>
            <div className="flex flex-wrap gap-2">
              {word.synonyms.map((s) => (
                <span key={s} className="px-2 py-1 rounded-md border border-green-500/30 bg-green-500/5 text-green-400 font-mono text-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {word.antonyms.length > 0 && (
          <div>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">
              Antonyms
            </p>
            <div className="flex flex-wrap gap-2">
              {word.antonyms.map((a) => (
                <span key={a} className="px-2 py-1 rounded-md border border-red-500/30 bg-red-500/5 text-red-400 font-mono text-xs">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-800">
          <StatBox label="Mastery" value={`${word.masteryPercent}%`} />
          <StatBox label="Level" value={word.masteryLevel} />
          <StatBox label="Reviews" value={`${word.reviewCount}`} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800 p-4 flex gap-3">
        <button
          onClick={onRemove}
          className="px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 font-mono text-sm hover:bg-red-500/20 transition-colors"
        >
          Remove
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 font-mono font-bold text-sm hover:bg-cyan-500/20 transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center">
    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className="text-white font-mono font-bold text-sm capitalize">{value}</p>
  </div>
);