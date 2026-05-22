// ─────────────────────────────────────────────
//  LexiQ Section — QuickAddWidget
//  Terminal-style word addition with API fetch
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { TerminalInput } from '../ui/TerminalInput';
import { Button } from '../ui/Button';
import { fetchWord } from '../../services/dictionaryApi';
import { useVocabStore } from '../../store/useVocabStore';

interface QuickAddWidgetProps {
  className?: string;
}

type Status = 'idle' | 'loading' | 'success' | 'notfound' | 'duplicate' | 'error';

export const QuickAddWidget: React.FC<QuickAddWidgetProps> = ({ className }) => {
  const [word, setWord] = useState('');
  const [context, setContext] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const addWord = useVocabStore((s) => s.addWord);

  const handleAdd = async () => {
    const term = word.trim();
    if (!term) return;

    setStatus('loading');

    const fetched = await fetchWord(term);

    if (!fetched) {
      setStatus('notfound');
      return;
    }

    // If user provided context, override the example
    if (context.trim()) {
      fetched.definition.example = context.trim();
    }

    const added = addWord(fetched);
    if (!added) {
      setStatus('duplicate');
      return;
    }

    setStatus('success');
    setWord('');
    setContext('');

    // Reset status after 2 seconds
    setTimeout(() => setStatus('idle'), 2000);
  };

  // Status message
  const statusMessage = (() => {
    switch (status) {
      case 'loading':
        return { text: '⏳ fetching definition...', color: '#a38d7b' };
      case 'success':
        return { text: '✓ word added to vault!', color: '#ffb874' };
      case 'notfound':
        return { text: '✗ word not found in dictionary', color: '#ff6b6b' };
      case 'duplicate':
        return { text: '! word already in vault', color: '#ffb874' };
      case 'error':
        return { text: '✗ network error', color: '#ff6b6b' };
      default:
        return { text: '↵ enter or click to add', color: '#554335' };
    }
  })();

  return (
    <GlassCard accent="orange" className={`p-5 flex flex-col gap-4 ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-bold text-[#ffb874]">$</span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#a38d7b]">
          Add to Vault
        </p>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-4">
        <TerminalInput
          prefix=">"
          label="Word"
          placeholder="type a word..."
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          disabled={status === 'loading'}
        />
        <TerminalInput
          prefix=">"
          label="Context Sentence (optional)"
          placeholder="sentence with the word in context..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={status === 'loading'}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <p
          className="font-mono text-[9px] transition-colors"
          style={{ color: statusMessage.color }}
        >
          {statusMessage.text}
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAdd}
          disabled={!word.trim() || status === 'loading'}
        >
          {status === 'loading' ? '...' : '+ Add Word'}
        </Button>
      </div>
    </GlassCard>
  );
};