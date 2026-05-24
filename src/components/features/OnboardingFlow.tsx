import { useState } from 'react';
import {
  Sparkles,
  Target,
  Library,
  GraduationCap,
  Gamepad2,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { useProgressStore } from '../../store/useProgressStore';
import { useVocabStore } from '../../store/useVocabStore';

interface OnboardingFlowProps {
  onComplete: () => void;
  onNavigate: (section: string) => void;
}

type Step = 'welcome' | 'goal' | 'tour' | 'discover';

const GOAL_OPTIONS = [
  { value: 5,  label: 'Casual',     desc: '5 words / day' },
  { value: 10, label: 'Steady',     desc: '10 words / day' },
  { value: 15, label: 'Focused',    desc: '15 words / day', recommended: true },
  { value: 25, label: 'Intensive',  desc: '25 words / day' },
];

export function OnboardingFlow({ onComplete, onNavigate }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedGoal, setSelectedGoal] = useState<number>(15);
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState(false);

  const setDailyGoal = useProgressStore((s) => s.setDailyGoal);
  const setOnboardingComplete = useProgressStore((s) => s.setOnboardingComplete);
  const discoverWords = useVocabStore((s) => s.discoverWords);

  function handleNext() {
    if (step === 'welcome') setStep('goal');
    else if (step === 'goal') {
      setDailyGoal(selectedGoal);
      setStep('tour');
    } else if (step === 'tour') setStep('discover');
  }

  function handleBack() {
    if (step === 'goal') setStep('welcome');
    else if (step === 'tour') setStep('goal');
    else if (step === 'discover') setStep('tour');
  }

  async function handleDiscover() {
    setDiscovering(true);
    try {
      await discoverWords(15);
      setDiscovered(true);
      setTimeout(() => finish('vault'), 800);
    } catch {
      setDiscovering(false);
    }
  }

  function finish(destination: string = 'dashboard') {
    setOnboardingComplete(true);
    onComplete();
    onNavigate(destination);
  }

  const stepIndex = ['welcome', 'goal', 'tour', 'discover'].indexOf(step);
  const totalSteps = 4;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-gray-950 shadow-2xl my-auto">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={[
                'h-1.5 rounded-full transition-all',
                i === stepIndex
                  ? 'w-8 bg-[#ffb874]'
                  : i < stepIndex
                  ? 'w-1.5 bg-[#ffb874]/60'
                  : 'w-1.5 bg-white/15',
              ].join(' ')}
            />
          ))}
        </div>

        <div className="p-6 md:p-10">
          {/* ── WELCOME ── */}
          {step === 'welcome' && (
            <div className="flex flex-col items-center text-center gap-5 animate-fade-in-up">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-violet-500 text-gray-950 shadow-lg shadow-cyan-500/20">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold gradient-text-orange mb-2"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Welcome to Vocabture
                </h1>
                <p className="text-base text-gray-300">
                  Vocabulary mastery, gamified.
                </p>
              </div>
              <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                Build a personal vault of words, study them with spaced
                repetition, play games to reinforce memory, and watch your
                vocabulary grow.
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 mt-2">
                Let's set you up in 3 quick steps
              </p>
            </div>
          )}

          {/* ── GOAL ── */}
          {step === 'goal' && (
            <div className="flex flex-col gap-5 animate-fade-in-up">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffb874]/15 text-[#ffb874]">
                  <Target className="h-7 w-7" />
                </div>
                <h2
                  className="text-2xl md:text-3xl font-bold text-[#f1dfd2]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Set your daily goal
                </h2>
                <p className="text-sm text-gray-400 max-w-sm">
                  How many words do you want to review each day? You can
                  change this later in Settings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((opt) => {
                  const isSelected = selectedGoal === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedGoal(opt.value)}
                      className={[
                        'relative flex flex-col items-start gap-1 p-4 rounded-2xl border text-left transition',
                        isSelected
                          ? 'border-[#ffb874] bg-[#ffb874]/10 ring-2 ring-[#ffb874]/30'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20',
                      ].join(' ')}
                    >
                      {opt.recommended && (
                        <span className="absolute top-2 right-2 font-mono text-[8px] uppercase tracking-widest text-[#ffb874] px-1.5 py-0.5 rounded border border-[#ffb874]/40 bg-[#ffb874]/10">
                          Recommended
                        </span>
                      )}
                      <span className="text-lg font-bold text-white">
                        {opt.label}
                      </span>
                      <span className="font-mono text-xs text-gray-400">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TOUR ── */}
          {step === 'tour' && (
            <div className="flex flex-col gap-5 animate-fade-in-up">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h2
                  className="text-2xl md:text-3xl font-bold text-[#f1dfd2]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Here's what you can do
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                <TourItem
                  icon={<Library className="h-5 w-5" />}
                  title="Vault"
                  desc="Browse, search, and manage every word you save."
                />
                <TourItem
                  icon={<GraduationCap className="h-5 w-5" />}
                  title="Study"
                  desc="Spaced-repetition sessions for due, weak, or all words."
                />
                <TourItem
                  icon={<Gamepad2 className="h-5 w-5" />}
                  title="Games"
                  desc="Speed Round, Multiple Choice, Word Scramble & Match Mode."
                />
                <TourItem
                  icon={<Target className="h-5 w-5" />}
                  title="Daily Goal"
                  desc={`Hit ${selectedGoal} reviews each day to build your streak.`}
                />
              </div>
            </div>
          )}

          {/* ── DISCOVER ── */}
          {step === 'discover' && (
            <div className="flex flex-col items-center text-center gap-5 animate-fade-in-up">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 text-gray-950 shadow-lg shadow-orange-500/20">
                <Rocket className="h-8 w-8" />
              </div>
              <h2
                className="text-2xl md:text-3xl font-bold text-[#f1dfd2]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Bootstrap your vault
              </h2>
              <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                Let's discover <span className="text-[#ffb874] font-bold">15
                words</span> from our curated bank to get you started.
                You can always add more later.
              </p>

              <button
                onClick={handleDiscover}
                disabled={discovering || discovered}
                className={[
                  'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-sm font-bold transition',
                  discovered
                    ? 'bg-green-500/15 text-green-300 border border-green-400/30'
                    : 'bg-[#ffb874] text-[#0a0705] hover:opacity-90 active:scale-95 disabled:opacity-60',
                ].join(' ')}
              >
                {discovered ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added to your vault!
                  </>
                ) : discovering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Discover 15 Words
                  </>
                )}
              </button>

              <button
                onClick={() => finish('dashboard')}
                className="font-mono text-xs text-gray-500 hover:text-gray-300 transition underline-offset-2 hover:underline"
              >
                Skip — I'll add words myself
              </button>
            </div>
          )}

          {/* ── Footer nav ── */}
          {step !== 'discover' && (
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/10">
              {step !== 'welcome' ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl font-mono text-xs text-gray-400 hover:bg-white/5 hover:text-white transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-[#ffb874] text-[#0a0705] hover:opacity-90 active:scale-95 transition"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TourItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl border border-white/10 bg-white/5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-cyan-300 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-white">{title}</div>
        <div className="text-xs text-gray-400 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}