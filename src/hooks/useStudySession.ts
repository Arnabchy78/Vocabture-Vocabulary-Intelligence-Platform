// ─────────────────────────────────────────────
//  LexiQ — useStudySession Hook
// ─────────────────────────────────────────────

import { useState, useCallback } from 'react';
import type { VocabWord, NavSection } from '../types';
import { MOCK_WORDS } from '../data/mock';

export function useStudySession() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [activeWordId, setActiveWordId] = useState<string>(MOCK_WORDS[0].id);
  const [words] = useState<VocabWord[]>(MOCK_WORDS);

  const activeWord = words.find((w) => w.id === activeWordId) ?? words[0];

  const selectWord = useCallback((id: string) => {
    setActiveWordId(id);
  }, []);

  const navigateTo = useCallback((section: NavSection) => {
    setActiveSection(section);
  }, []);

  return {
    activeSection,
    navigateTo,
    words,
    activeWord,
    activeWordId,
    selectWord,
  };
}
