import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export function AppShell({ children, activeSection, onNavigate }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleNavigate(section: string) {
    onNavigate(section);
    setSidebarOpen(false); // close drawer after navigation on mobile
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          activeSection={activeSection}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}