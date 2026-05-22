// src/components/sections/games/MatchMode.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useVocabStore } from '../../../store/useVocabStore';
import { useProgressStore } from '../../../store/useProgressStore';
import { useToastStore } from '../../../store/useToastStore';
import { SessionSummary } from '../../features/SessionSummary';
import {
  buildMatchPairs,
  shuffleArray,
  calculateGameXP,
} from '../../../utils/gameUtils';

interface MatchModeProps { onBack: () => void; pairCount?: number; }
interface ColumnItem { id: string; text: string; }

export const MatchMode: React.FC<MatchModeProps> = ({ onBack, pairCount = 6 }) => {
  const words = useVocabStore((s) => s.words);
  const recordReview = useProgressStore((s) => s.recordReview);
  const getAchievements = useProgressStore((s) => s.getAchievements);
  const addUnlocks = useToastStore((s) => s.addUnlocks);

  const [sessionKey, setSessionKey] = useState(0);
  const restartGame = () => setSessionKey((k) => k + 1);

  const [pairs, setPairs] = useState(() => buildMatchPairs(words, Math.min(pairCount, words.length)));
  const [leftCol, setLeftCol] = useState<ColumnItem[]>(() =>
    shuffleArray(pairs.map((p) => ({ id: p.id, text: p.word })))
  );
  const [rightCol, setRightCol] = useState<ColumnItem[]>(() =>
    shuffleArray(pairs.map((p) => ({ id: p.id, text: p.definition })))
  );

  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [selRight, setSelRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<{ l: string; r: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [done, setDone] = useState(false);

  const [sessionLeveledUp, setSessionLeveledUp] = useState(false);
  const [sessionGoalHit, setSessionGoalHit] = useState(false);

  // Reset everything when sessionKey changes (Play Again)
  useEffect(() => {
    if (sessionKey === 0) return;
    const newPairs = buildMatchPairs(words, Math.min(pairCount, words.length));
    setPairs(newPairs);
    setLeftCol(shuffleArray(newPairs.map((p) => ({ id: p.id, text: p.word }))));
    setRightCol(shuffleArray(newPairs.map((p) => ({ id: p.id, text: p.definition }))));
    setSelLeft(null);
    setSelRight(null);
    setMatched(new Set());
    setWrong(null);
    setMistakes(0);
    setStartTime(Date.now());
    setDone(false);
    setSessionLeveledUp(false);
    setSessionGoalHit(false);
  }, [sessionKey, words, pairCount]);

  const handleLeft = (id: string) => {
    if (matched.has(id) || wrong) return;
    setSelLeft(id === selLeft ? null : id);
  };

  const handleRight = useCallback((id: string) => {
    if (matched.has(id) || wrong) return;
    const newRight = id === selRight ? null : id;
    setSelRight(newRight);

    if (selLeft && newRight) {
      let result;
      if (selLeft === newRight) {
        const nm = new Set(matched);
        nm.add(selLeft);
        setMatched(nm);
        setSelLeft(null);
        setSelRight(null);
        result = recordReview('easy');
        if (nm.size === pairs.length) setTimeout(() => setDone(true), 400);
      } else {
        setMistakes((m) => m + 1);
        setWrong({ l: selLeft, r: newRight });
        result = recordReview('wrong');
        setTimeout(() => {
          setWrong(null);
          setSelLeft(null);
          setSelRight(null);
        }, 700);
      }

      if (result?.leveledUp) setSessionLeveledUp(true);
      if (result?.goalHit) setSessionGoalHit(true);

      if (result?.newlyUnlocked?.length) {
        const allAchievements = getAchievements();
        const unlocked = allAchievements.filter((a) =>
          result.newlyUnlocked.includes(a.id)
        );
        if (unlocked.length) addUnlocks(unlocked);
      }
    }
  }, [selLeft, selRight, matched, wrong, pairs.length, recordReview, getAchievements, addUnlocks]);

  const itemStyle = (id: string, side: 'l' | 'r') => {
    if (matched.has(id)) return 'border-green-500/50 bg-green-500/10 text-green-400 opacity-60';
    const sel = side === 'l' ? selLeft === id : selRight === id;
    const isWrong = wrong && ((side === 'l' && wrong.l === id) || (side === 'r' && wrong.r === id));
    if (isWrong) return 'border-red-500/60 bg-red-500/10 text-red-400 animate-pulse';
    if (sel) return 'border-cyan-400/70 bg-cyan-500/15 text-cyan-300';
    return 'border-zinc-700/40 bg-zinc-900/50 text-zinc-300 hover:border-zinc-500/60 hover:bg-zinc-800/50 cursor-pointer';
  };

  // ─── Complete Screen ───
  if (done) {
    const xp = calculateGameXP(pairs.length, pairs.length + mistakes, Date.now() - startTime, 'match');
    return (
      <SessionSummary
        stats={{
          correctCount: pairs.length,
          totalCount: pairs.length + mistakes,
          xpEarned: xp,
          bestStreak: pairs.length, // all matched
          elapsedMs: Date.now() - startTime,
          leveledUp: sessionLeveledUp,
          goalHit: sessionGoalHit,
        }}
        onClose={onBack}
        onPlayAgain={restartGame}
        title="ALL MATCHED!"
        subtitle="Match Mode"
      />
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-zinc-400 hover:text-white font-mono text-sm">← Back</button>
        <div className="font-mono text-sm text-zinc-400">
          {matched.size}/{pairs.length} matched • {selLeft ? <span className="text-cyan-400">Pick a definition →</span> : <span className="text-zinc-500">Pick a word</span>}
        </div>
        <div className="font-mono text-sm">{mistakes > 0 && <span className="text-red-400">{mistakes} ✗</span>}</div>
      </div>

      <div className="h-1 bg-zinc-800 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${(matched.size / pairs.length) * 100}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-3">Words</p>
          {leftCol.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLeft(item.id)}
              disabled={matched.has(item.id)}
              className={`w-full p-4 rounded-xl border text-left font-mono font-bold text-base transition-all duration-200 ${itemStyle(item.id, 'l')}`}
            >
              {matched.has(item.id) && <span className="mr-2">✓</span>}{item.text}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-3">Definitions</p>
          {rightCol.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRight(item.id)}
              disabled={matched.has(item.id)}
              className={`w-full p-4 rounded-xl border text-left font-mono text-sm leading-snug transition-all duration-200 ${itemStyle(item.id, 'r')}`}
            >
              {matched.has(item.id) && <span className="mr-2 font-bold">✓</span>}
              {item.text.length > 80 ? item.text.slice(0, 80) + '…' : item.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};