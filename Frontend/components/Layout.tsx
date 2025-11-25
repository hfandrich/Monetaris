import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AppSidebar } from './layout/AppSidebar';
import { AppHeader } from './layout/AppHeader';
import { GeminiAssistant } from './GeminiAssistant';
import { CommandPalette } from './CommandPalette';
import { ShortcutsModal } from './layout/ShortcutsModal';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export type Theme = 'light' | 'dark' | 'barbie';

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Initialize theme from localStorage to remember user preference
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('monetaris_theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'barbie') {
        return savedTheme;
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Reset classes
    root.classList.remove('dark');
    root.classList.remove('theme-barbie');

    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else if (currentTheme === 'barbie') {
      // Barbie Mode is now a "Friendly/Light" mode variant.
      root.classList.add('theme-barbie');
    }

    // Save preference
    localStorage.setItem('monetaris_theme', currentTheme);
  }, [currentTheme]);

  // Global Command Palette & Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);

      // Command Palette (Ctrl+K or Cmd+K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }

      // Help Menu (?) - prevent if typing
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !isInput) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }

      // Toggle Sidebar (Ctrl+B)
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }

      // Focus Search (/) - prevent if typing
      if (e.key === '/' && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen font-sans bg-[#FAFAFA] dark:bg-obsidian text-slate-950 dark:text-white transition-colors duration-700">
      {/* Subtle Background Grid */}
      <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none"></div>

      {/* Sidebar Component */}
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 lg:pl-[290px] relative transition-all duration-300 ${sidebarOpen ? 'lg:pl-[290px]' : 'lg:pl-0'}`}
      >
        {/* Dynamic Ambient Glow - Adapts to Theme */}
        {currentTheme === 'barbie' ? (
          <>
            {/* Barbie Glows: Gold & Pink */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-pink-300/20 rounded-full blur-[150px] pointer-events-none animate-blob mix-blend-multiply"></div>
            <div className="fixed bottom-0 left-20 w-[600px] h-[600px] bg-purple-300/20 rounded-full blur-[120px] pointer-events-none animate-blob animation-delay-2000 mix-blend-multiply"></div>
          </>
        ) : (
          <>
            {/* Standard Glows: Emerald & Blue */}
            <div className="fixed top-0 right-0 w-[1000px] h-[1000px] bg-monetaris-accent/5 rounded-full blur-[180px] pointer-events-none animate-blob mix-blend-screen opacity-0 dark:opacity-100 transition-opacity duration-700"></div>
            <div className="fixed bottom-0 left-20 w-[800px] h-[800px] bg-ai-blue/5 rounded-full blur-[150px] pointer-events-none animate-blob animation-delay-2000 mix-blend-screen opacity-0 dark:opacity-100 transition-opacity duration-700"></div>
          </>
        )}

        {/* Header Component */}
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 sm:px-8 lg:px-10 pb-10 relative z-10 overflow-x-hidden max-w-[1600px] mx-auto w-full">
          {children}
        </main>

        {/* --- GLOBAL AI ASSISTANT --- */}
        <GeminiAssistant />

        {/* --- COMMAND PALETTE --- */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          setIsOpen={setCommandPaletteOpen}
          onThemeChange={setCurrentTheme}
        />

        {/* --- SHORTCUTS HELP --- */}
        <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      </div>
    </div>
  );
};
