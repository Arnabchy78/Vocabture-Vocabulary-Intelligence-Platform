// src/components/sections/games/GameHub.tsx

import React from 'react';
import { useVocabStore } from '../../../store/useVocabStore';

export type GameId = 'mcq' | 'scramble' | 'speed' | 'match';

interface GameInfo {
  id: GameId;
  title: string;
  subtitle: string;
  icon: string;
  minWords: number;
  borderColor: string;
  textColor: string;
  bgGradient: string;
  description: string;
  tags: string[];
}

const GAMES: GameInfo[] = [
  {
    id: 'mcq',
    title: 'DEFINITION MATCH',
    subtitle: 'Multiple Choice',
    icon: '🎯',
    minWords: 4,
    borderColor: 'border-cyan-500/30 hover:border-cyan-400/60',
    textColor: 'text-cyan-400',
    bgGradient: 'from-cyan-500/10 to-cyan-600/5',
    description: 'Read the definition. Pick the correct word from 4 options.',
    tags: ['Recognition', 'Definitions'],
  },
  {
    id: 'scramble',
    title: 'WORD SCRAMBLE',
    subtitle: 'Unscramble Letters',
    icon: '🔀',
    minWords: 1,
    borderColor: 'border-purple-500/30 hover:border-purple-400/60',
    textColor: 'text-purple-400',
    bgGradient: 'from-purple-500/10 to-purple-600/5',
    description: 'Letters are shuffled. Rebuild the word before time runs out.',
    tags: ['Spelling', 'Speed'],
  },
  {
    id: 'speed',
    title: 'SPEED ROUND',
    subtitle: '60-Second Blitz',
    icon: '⚡',
    minWords: 4,
    borderColor: 'border-yellow-500/30 hover:border-yellow-400/60',
    textColor: 'text-yellow-400',
    bgGradient: 'from-yellow-500/10 to-yellow-600/5',
    description: 'Answer as many words as possible in 60 seconds.',
    tags: ['Timed', 'High Score'],
  },
  {
    id: 'match',
    title: 'MATCH MODE',
    subtitle: 'Word ↔ Definition',
    icon: '🔗',
    minWords: 4,
    borderColor: 'border-green-500/30 hover:border-green-400/60',
    textColor: 'text-green-400',
    bgGradient: 'from-green-500/10 to-green-600/5',
    description: 'Click a word, then click its matching definition.',
    tags: ['Pairs', 'Memory'],
  },
];

interface GameHubProps {
  onSelectGame: (gameId: GameId) => void;
}

export const GameHub: React.FC<GameHubProps> = ({ onSelectGame }) => {
  const words = useVocabStore((s) => s.words);
  const wordCount = words.length;

  return (
    <div className="p-5 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🎮</span>
          <h1 className="text-2xl font-mono font-bold text-white tracking-wider">
            MINI-GAMES
          </h1>
        </div>
        <p className="text-zinc-400 font-mono text-sm ml-9">
          {wordCount} words in vault •{' '}
          <span className="text-cyan-400">Select a game to start</span>
        </p>
      </div>

      {/* Warning if not enough words */}
      {wordCount < 4 && (
        <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/5">
          <p className="text-red-400 font-mono text-sm">
            ⚠ You need at least 4 words to play most games. Add more from the Dashboard.
          </p>
        </div>
      )}

      {/* Game cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GAMES.map((game) => {
          const isLocked = wordCount < game.minWords;

          return (
            <button
              key={game.id}
              onClick={() => !isLocked && onSelectGame(game.id)}
              disabled={isLocked}
              className={`
                relative text-left p-5 rounded-xl border
                bg-gradient-to-br ${game.bgGradient}
                ${isLocked
                  ? 'border-zinc-700/30 opacity-50 cursor-not-allowed'
                  : `${game.borderColor} cursor-pointer`
                }
                transition-all duration-200 group
              `}
            >
              {isLocked && (
                <div className="absolute top-3 right-3 text-zinc-500 text-xs font-mono">
                  🔒 Need {game.minWords} words
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{game.icon}</span>
                <div>
                  <h2 className={`font-mono font-bold text-sm tracking-widest ${game.textColor}`}>
                    {game.title}
                  </h2>
                  <p className="text-zinc-400 text-xs font-mono mt-0.5">
                    {game.subtitle}
                  </p>
                </div>
              </div>

              <p className="text-zinc-300 text-sm font-mono mb-4 leading-relaxed">
                {game.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded text-xs font-mono border ${game.borderColor} ${game.textColor} opacity-70`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {!isLocked && (
                <div className={`absolute bottom-4 right-4 ${game.textColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono text-sm font-bold`}>
                  PLAY →
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};