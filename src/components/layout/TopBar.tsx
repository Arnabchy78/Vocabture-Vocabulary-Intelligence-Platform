import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { GlobalSearchModal } from '../features/GlobalSearchModal';

interface TopBarProps {
  activeSection: string;
  onMenuClick: () => void;
}

const sectionMeta: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Track your vocabulary growth' },
  vault:     { title: 'Vocabulary Vault', subtitle: 'Browse, filter, and review your saved words' },
  study:     { title: 'Study Mode', subtitle: 'Focus on due, weak, or all words' },
  games:     { title: 'Games', subtitle: 'Practice with fast and playful challenges' },
  analytics: { title: 'Analytics', subtitle: 'See progress, streaks, and mastery trends' },
  settings:  { title: 'Settings', subtitle: 'Customize your learning experience' },
};

export function TopBar({ activeSection, onMenuClick }: TopBarProps) {
  const meta = sectionMeta[activeSection] ?? {
    title: 'Vocabture',
    subtitle: 'Vocabulary mastery',
  };

  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setModalOpen(true);
    setMobileSearchOpen(false);
  }

  function closeModal() {
    setModalOpen(false);
    setInput('');
  }

  return (
    <>
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 md:h-20 md:px-6">
          {/* Hamburger (mobile) */}
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-white md:text-xl">
              {meta.title}
            </h1>
            <p className="hidden text-sm text-gray-400 md:block">{meta.subtitle}</p>
          </div>

          {/* Desktop search */}
          <form onSubmit={handleSubmit} className="hidden w-full max-w-md md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Look up any word..."
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-20 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-cyan-400/40 focus:bg-white/10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-gray-500 px-1.5 py-0.5 border border-white/10 rounded">
                ↵
              </span>
            </div>
          </form>

          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile search drawer */}
        {mobileSearchOpen && (
          <div className="border-t border-white/10 bg-gray-950 p-3 md:hidden">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  autoFocus
                  type="search"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Look up any word..."
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-cyan-400/40 focus:bg-white/10"
                />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="px-3 h-11 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </header>

      <GlobalSearchModal query={query} isOpen={modalOpen} onClose={closeModal} />
    </>
  );
}