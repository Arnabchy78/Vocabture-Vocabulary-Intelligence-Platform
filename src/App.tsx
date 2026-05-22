// ─────────────────────────────────────────────
//  LexiQ — Root App (Phase 3: Real Stats)
// ─────────────────────────────────────────────

import { LoadingScreen } from './components/features/LoadingScreen';
import { useState, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/sections/DashboardView';
import { FlashcardView } from './components/sections/FlashcardView';
import { SettingsModal } from './components/features/SettingsModal';
import { PlaceholderView } from './components/sections/PlaceholderView';
import { ProgressDashboard } from './components/features/ProgressDashboard';
import { OnboardingFlow } from './components/features/OnboardingFlow';
import { GameHub } from './components/sections/games/GameHub';
import { SpeedRound } from './components/sections/games/SpeedRound';
import { MultipleChoice } from './components/sections/games/MultipleChoice';
import { WordScramble } from './components/sections/games/WordScramble';
import { MatchMode } from './components/sections/games/MatchMode';
import { useStudySession } from './hooks/useStudySession';
import { useVocabStore } from './store/useVocabStore';
import { useProgressStore } from './store/useProgressStore';
import { StudyView } from './components/sections/StudyView';
import { VaultView } from './components/sections/VaultView';
import type { NavSection, StudySession } from './types';
import type { GameId } from './components/sections/games/GameHub';

export default function App() {
  const { activeSection, navigateTo, activeWordId, selectWord } =
    useStudySession();

  const [isStudying, setIsStudying] = useState(false);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const words = useVocabStore((s) => s.words);
  const getQueue = useVocabStore((s) => s.getQueue);
  const getStats = useVocabStore((s) => s.getStats);
  const startStudySession = useVocabStore((s) => s.startStudySession);

  const totalXp = useProgressStore((s) => s.totalXp);
  const streak = useProgressStore((s) => s.streak);
  const dailyGoal = useProgressStore((s) => s.dailyGoal);
  const getTodayActivity = useProgressStore((s) => s.getTodayActivity);
  const getAccuracy = useProgressStore((s) => s.getAccuracy);
  const checkAndResetStreak = useProgressStore((s) => s.checkAndResetStreak);
  const getAchievements = useProgressStore((s) => s.getAchievements);
  const onboardingComplete = useProgressStore((s) => s.onboardingComplete);

  useEffect(() => {
    checkAndResetStreak();
  }, [checkAndResetStreak]);

  // Show onboarding on first visit (after loading screen)
  useEffect(() => {
    if (!isLoading && !onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [isLoading, onboardingComplete]);

  const queue = getQueue();
  const vaultStats = getStats();
  const todayActivity = getTodayActivity();
  const accuracy = getAccuracy();
  const achievements = getAchievements();

  const session: StudySession = {
    streak,
    wordsToday: todayActivity.wordsReviewed,
    wordsTarget: dailyGoal,
    xpEarned: todayActivity.xpEarned,
    xpTotal: totalXp,
    accuracy,
    sessionMinutes: 0,
  };

  const activeWord =
    words.find((w) => w.id === activeWordId) || words[0] || null;

  const handleStudyNow = () => {
    startStudySession();
    setIsStudying(true);
  };

  const handleExitStudy = () => {
    setIsStudying(false);
  };

  const handleNavigate = (section: NavSection) => {
    setActiveGame(null);
    if (section === 'settings') {
      setShowSettings(true);
      return;
    }
    navigateTo(section);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  if (isStudying) {
    return <FlashcardView onExit={handleExitStudy} />;
  }

  const renderGames = () => {
    if (activeGame === 'speed') return <SpeedRound onBack={() => setActiveGame(null)} />;
    if (activeGame === 'mcq') return <MultipleChoice onBack={() => setActiveGame(null)} />;
    if (activeGame === 'scramble') return <WordScramble onBack={() => setActiveGame(null)} />;
    if (activeGame === 'match') return <MatchMode onBack={() => setActiveGame(null)} />;
    return <GameHub onSelectGame={(id) => setActiveGame(id)} />;
  };

  return (
    <>
      <AppShell
        activeSection={activeSection}
        onNavigate={handleNavigate}
        streak={streak}
        xp={totalXp}
      >
        {activeSection === 'dashboard' ? (
          <DashboardView
            activeWord={activeWord}
            session={session}
            vaultStats={vaultStats}
            achievements={achievements}
            queue={queue}
            activeWordId={activeWord?.id ?? null}
            onSelectWord={selectWord}
            onStudyNow={handleStudyNow}
          />
        ) : activeSection === 'games' ? (
          renderGames()
        ) : activeSection === 'analytics' ? (
          <ProgressDashboard />
        ) : activeSection === 'study' ? (
          <StudyView onBack={() => handleNavigate('dashboard')} />
        ) : activeSection === 'vault' ? (
          <VaultView onBack={() => handleNavigate('dashboard')} />
        ) : (
          <PlaceholderView
            section={activeSection as Exclude<NavSection, 'dashboard' | 'games' | 'analytics' | 'study'>}
            onBack={() => handleNavigate('dashboard')}
          />
        )}

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </AppShell>

      {showOnboarding && (
        <OnboardingFlow
          onComplete={() => setShowOnboarding(false)}
          onNavigate={(section) => handleNavigate(section as NavSection)}
        />
      )}
    </>
  );
}