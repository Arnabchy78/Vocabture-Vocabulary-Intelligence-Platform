import {
  LayoutDashboard,
  Library,
  GraduationCap,
  Gamepad2,
  BarChart3,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vault', label: 'Vault', icon: Library },
  { id: 'study', label: 'Study', icon: GraduationCap },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  activeSection,
  onNavigate,
  isOpen = false,
  onClose,
}: SidebarProps) {
  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-40 w-72 shrink-0',
        'border-r border-white/10 bg-gray-950/95 backdrop-blur-xl',
        'transform transition-transform duration-300 ease-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:static md:z-auto md:translate-x-0',
      ].join(' ')}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4 md:h-20 md:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-gray-950 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white md:text-base">Vocabture</div>
              <div className="text-xs text-gray-400">Vocabulary mastery</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-2 p-3 md:p-4">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={[
                  'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                  'min-h-[48px]',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white ring-1 ring-cyan-400/30'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white',
                ].join(' ')}
              >
                <div
                  className={[
                    'flex h-10 w-10 items-center justify-center rounded-xl transition',
                    isActive
                      ? 'bg-cyan-400/15 text-cyan-300'
                      : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white',
                  ].join(' ')}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-medium md:text-[15px]">{label}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}