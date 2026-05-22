// ─────────────────────────────────────────────
//  LexiQ Section — FlashcardView
//  Full-screen flashcard study mode with audio
// ─────────────────────────────────────────────

import React, { useState, useCallback, useEffect } from 'react';
import { useVocabStore } from '../../store/useVocabStore';
import { audioService } from '../../services/audioService';
import { XP_REWARDS } from '../../utils/progressUtils';
import type { ReviewQuality } from '../../utils/sm2';
import type { StoredWord } from '../../store/useVocabStore';

interface FlashcardViewProps {
  onExit: () => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ onExit }) => {
  const {
    getDueWords,
    reviewWord,
    endStudySession,
    sessionResults,
  } = useVocabStore();

  // 🛡️ Lock the due words list at session start so it doesn't shrink mid-session
  const [sessionWords] = useState<StoredWord[]>(() => getDueWords());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [sessionDone, setSessionDone] = useState(false);

  const currentWord: StoredWord | undefined = sessionWords[currentIndex];
  const totalDue = sessionWords.length;
  const progress = totalDue > 0 ? (reviewed.size / totalDue) * 100 : 0;

  // 🔊 Auto-play pronunciation when new card appears
  useEffect(() => {
    if (currentWord && !isFlipped && !sessionDone) {
      const timer = setTimeout(() => {
        audioService.speak(currentWord.word);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentWord?.id, isFlipped, sessionDone]);

  const handleFlip = () => setIsFlipped((f) => !f);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    audioService.speak(text);
  };

  const handleReview = useCallback(
    (quality: ReviewQuality) => {
      if (!currentWord) return;
      reviewWord(currentWord.id, quality);
      setReviewed((prev) => new Set(prev).add(currentWord.id));
      setIsFlipped(false);
      setTimeout(() => {
        if (currentIndex < totalDue - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          setSessionDone(true);
          endStudySession();
        }
      }, 300);
    },
    [currentWord, currentIndex, totalDue, reviewWord, endStudySession]
  );

  const handleExit = () => {
    audioService.stop();
    endStudySession();
    onExit();
  };

  // ── Empty State ──
  if (totalDue === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8"
        style={{ background: '#0a0705' }}>
        <p className="text-4xl">🎉</p>
        <h2 className="font-mono text-xl font-bold text-[#ffb874]">
          No words due for review!
        </h2>
        <p className="font-mono text-sm text-[#a38d7b] text-center max-w-xs">
          All caught up. Come back tomorrow for your next session.
        </p>
        <button onClick={onExit}
          className="font-mono text-xs px-6 py-3 rounded border border-[#3d2b1f] text-[#a38d7b] hover:border-[#ffb874] hover:text-[#ffb874] transition-colors">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Session Complete ──
  if (sessionDone) {
    const correct = sessionResults.filter(
      (r) => r.quality === 'good' || r.quality === 'easy'
    ).length;
    const xpEarned = sessionResults.reduce((acc, r) => acc + XP_REWARDS[r.quality], 0);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8"
        style={{ background: '#0a0705' }}>
        <div className="text-center">
          <p className="text-5xl mb-4">🏆</p>
          <h2 className="font-mono text-2xl font-bold text-[#ffb874] mb-2">
            Session Complete!
          </h2>
          <p className="font-mono text-sm text-[#a38d7b]">
            You reviewed {reviewed.size} word{reviewed.size !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          <StatBox label="Reviewed" value={`${reviewed.size}`} />
          <StatBox label="Correct" value={`${correct}`} color="#4ade80" />
          <StatBox label="XP Earned" value={`+${xpEarned}`} color="#ffb874" />
        </div>

        <div className="w-full max-w-sm flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#554335] mb-1">
            Word Results
          </p>
          {sessionResults.map((r) => (
            <div key={r.wordId}
              className="flex items-center justify-between px-3 py-2 rounded border border-[#2a1a12]"
              style={{ background: '#130e0a' }}>
              <div className="flex items-center gap-2">
                <button onClick={() => audioService.speak(r.word)}
                  className="text-[#ffb874] hover:scale-110 transition-transform"
                  title="Hear pronunciation">
                  🔊
                </button>
                <span className="font-mono text-xs text-[#c4a882]">{r.word}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] px-2 py-0.5 rounded"
                  style={{
                    background: qualityColor(r.quality, 0.15),
                    color: qualityColor(r.quality, 1),
                  }}>
                  {r.quality.toUpperCase()}
                </span>
                <span className="font-mono text-[9px] text-[#a38d7b]">
                  {r.masteryPercent}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={handleExit}
            className="font-mono text-xs px-6 py-3 rounded border border-[#3d2b1f] text-[#a38d7b] hover:border-[#ffb874] hover:text-[#ffb874] transition-colors">
            ← Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 🛡️ Safety guard — if no current word, end the session
  if (!currentWord) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8"
        style={{ background: '#0a0705' }}>
        <p className="text-4xl">✨</p>
        <h2 className="font-mono text-xl font-bold text-[#ffb874]">
          All cards reviewed!
        </h2>
        <button onClick={handleExit}
          className="font-mono text-xs px-6 py-3 rounded border border-[#3d2b1f] text-[#a38d7b] hover:border-[#ffb874] hover:text-[#ffb874] transition-colors">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Main Flashcard UI ──
  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: '#0a0705' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e120c]">
        <button onClick={handleExit}
          className="font-mono text-xs text-[#554335] hover:text-[#a38d7b] transition-colors">
          ✕ Exit
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#554335]">
            {currentIndex + 1} / {totalDue}
          </span>
          <div className="w-32 h-1 rounded-full bg-[#1e120c] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: '#ffb874' }} />
          </div>
        </div>
        <span className="font-mono text-xs text-[#554335]">
          {reviewed.size} done
        </span>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        <div className="w-full max-w-lg cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={handleFlip}>
          <div className="relative w-full transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: '320px',
            }}>
            <CardFace side="front" word={currentWord} onSpeak={handleSpeak} />
            <CardFace side="back" word={currentWord} onSpeak={handleSpeak} />
          </div>
        </div>

        {!isFlipped && (
          <p className="font-mono text-[10px] text-[#554335] animate-pulse">
            click card to reveal definition
          </p>
        )}

        {isFlipped && (
          <div className="flex flex-col items-center gap-4 w-full max-w-lg">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#554335]">
              How well did you know this?
            </p>
            <div className="grid grid-cols-4 gap-3 w-full">
              <ReviewButton label="Blackout" emoji="💀" description="No idea" quality="blackout" color="#ef4444" onClick={handleReview} />
              <ReviewButton label="Wrong" emoji="✗" description="Got it wrong" quality="wrong" color="#f97316" onClick={handleReview} />
              <ReviewButton label="Hard" emoji="~" description="Struggled" quality="hard" color="#eab308" onClick={handleReview} />
              <ReviewButton label="Easy" emoji="✓" description="Got it!" quality="easy" color="#4ade80" onClick={handleReview} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sub-components ──

interface CardFaceProps {
  side: 'front' | 'back';
  word: StoredWord;
  onSpeak: (e: React.MouseEvent, text: string) => void;
}

const CardFace: React.FC<CardFaceProps> = ({ side, word, onSpeak }) => {
  const isFront = side === 'front';

  return (
    <div className="absolute inset-0 rounded-2xl border p-8 flex flex-col"
      style={{
        background: '#130e0a',
        borderColor: '#2a1a12',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: isFront ? 'rotateY(0deg)' : 'rotateY(180deg)',
        minHeight: '320px',
      }}>
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#554335]">
          {isFront ? 'word' : 'definition'}
        </span>
        <span className="font-mono text-[9px] px-2 py-0.5 rounded"
          style={{
            background: masteryColor(word.masteryLevel, 0.15),
            color: masteryColor(word.masteryLevel, 1),
          }}>
          {word.masteryLevel}
        </span>
      </div>

      {isFront ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="font-mono text-5xl font-bold text-[#c4a882] text-center">
            {word.word}
          </h1>
          <p className="font-mono text-sm text-[#554335]">{word.phonetic}</p>

          <button onClick={(e) => onSpeak(e, word.word)}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full border transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255, 184, 116, 0.1)',
              borderColor: 'rgba(255, 184, 116, 0.3)',
            }}
            title="Hear pronunciation">
            <span className="text-lg">🔊</span>
            <span className="font-mono text-[10px] text-[#ffb874]">Listen</span>
          </button>

          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {word.tags?.slice(0, 3).map((tag) => (
              <span key={tag.id}
                className="font-mono text-[9px] px-2 py-1 rounded border border-[#3d2b1f] text-[#a38d7b]">
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#554335]">
              {word.partOfSpeech}
            </span>
            <button onClick={(e) => onSpeak(e, word.word)}
              className="text-[#ffb874] hover:scale-110 transition-transform"
              title="Hear pronunciation">
              🔊
            </button>
          </div>

          <p className="font-mono text-base text-[#c4a882] leading-relaxed">
            {word.definition.text}
          </p>

          {word.definition.example && (
            <div className="border-l-2 border-[#3d2b1f] pl-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-xs text-[#6b4f3a] italic leading-relaxed flex-1">
                  "{word.definition.example}"
                </p>
                <button onClick={(e) => onSpeak(e, word.definition.example)}
                  className="text-[#554335] hover:text-[#ffb874] transition-colors text-xs flex-shrink-0"
                  title="Hear example">
                  🔊
                </button>
              </div>
            </div>
          )}

          {word.synonyms?.length > 0 && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#554335] mb-2">
                Synonyms
              </p>
              <div className="flex flex-wrap gap-1">
                {word.synonyms.slice(0, 4).map((syn) => (
                  <span key={syn}
                    className="font-mono text-[9px] px-2 py-0.5 rounded border border-[#2a1a12] text-[#6b4f3a]">
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ReviewButtonProps {
  label: string;
  emoji: string;
  description: string;
  quality: ReviewQuality;
  color: string;
  onClick: (quality: ReviewQuality) => void;
}

const ReviewButton: React.FC<ReviewButtonProps> = ({
  label, emoji, description, quality, color, onClick,
}) => (
  <button onClick={() => onClick(quality)}
    className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all hover:scale-105 active:scale-95"
    style={{ background: `${color}11`, borderColor: `${color}33` }}>
    <span className="text-lg">{emoji}</span>
    <span className="font-mono text-[9px] font-bold" style={{ color }}>{label}</span>
    <span className="font-mono text-[8px] text-[#554335]">{description}</span>
  </button>
);

const StatBox: React.FC<{ label: string; value: string; color?: string }> = ({
  label, value, color = '#c4a882',
}) => (
  <div className="flex flex-col items-center gap-1 p-4 rounded-xl border border-[#2a1a12]"
    style={{ background: '#130e0a' }}>
    <span className="font-mono text-2xl font-bold" style={{ color }}>{value}</span>
    <span className="font-mono text-[9px] text-[#554335]">{label}</span>
  </div>
);

function masteryColor(level: string, alpha: number): string {
  const colors: Record<string, string> = {
    new: `rgba(100, 116, 139, ${alpha})`,
    learning: `rgba(234, 179, 8, ${alpha})`,
    reviewing: `rgba(249, 115, 22, ${alpha})`,
    mastered: `rgba(74, 222, 128, ${alpha})`,
  };
  return colors[level] ?? colors.new;
}

function qualityColor(quality: string, alpha: number): string {
  const colors: Record<string, string> = {
    blackout: `rgba(239, 68, 68, ${alpha})`,
    wrong: `rgba(249, 115, 22, ${alpha})`,
    hard: `rgba(234, 179, 8, ${alpha})`,
    good: `rgba(74, 222, 128, ${alpha})`,
    easy: `rgba(74, 222, 128, ${alpha})`,
  };
  return colors[quality] ?? colors.good;
}