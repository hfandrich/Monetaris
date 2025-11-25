import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Users,
  Building2,
  Settings,
  Moon,
  Sun,
  Sparkles,
  LogOut,
  ArrowRight,
  Command,
  LayoutDashboard,
  Plus,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { Theme } from './Layout';

interface CommandPaletteProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onThemeChange: (theme: Theme) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  setIsOpen,
  onThemeChange,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define Actions
  const actions = [
    {
      category: 'Navigation',
      items: [
        {
          id: 'nav-dash',
          label: 'Gehe zu Dashboard',
          icon: LayoutDashboard,
          action: () => navigate('/dashboard'),
        },
        {
          id: 'nav-claims',
          label: 'Aktenübersicht',
          icon: FileText,
          action: () => navigate('/claims'),
        },
        {
          id: 'nav-kanban',
          label: 'Kanban Board',
          icon: Database,
          action: () => navigate('/claims?view=BOARD'),
        },
        {
          id: 'nav-debtors',
          label: 'Schuldnerkartei',
          icon: Users,
          action: () => navigate('/debtors'),
        },
        {
          id: 'nav-clients',
          label: 'Mandanten',
          icon: Building2,
          action: () => navigate('/clients'),
        },
        {
          id: 'nav-compliance',
          label: 'Compliance Check',
          icon: ShieldCheck,
          action: () => navigate('/compliance'),
        },
        {
          id: 'nav-settings',
          label: 'Einstellungen',
          icon: Settings,
          action: () => navigate('/settings'),
        },
      ],
    },
    {
      category: 'Aktionen',
      items: [
        {
          id: 'act-new-claim',
          label: 'Neue Forderung anlegen',
          icon: Plus,
          action: () => navigate('/claims'),
        }, // Should open wizard, simple nav for now
        {
          id: 'act-theme-light',
          label: 'Theme: Light Mode',
          icon: Sun,
          action: () => onThemeChange('light'),
        },
        {
          id: 'act-theme-dark',
          label: 'Theme: Dark Mode',
          icon: Moon,
          action: () => onThemeChange('dark'),
        },
        {
          id: 'act-theme-barbie',
          label: 'Theme: Barbie Enterprise',
          icon: Sparkles,
          action: () => onThemeChange('barbie'),
        },
        {
          id: 'act-logout',
          label: 'Abmelden',
          icon: LogOut,
          action: () => {
            localStorage.removeItem('monetaris_token');
            window.location.reload();
          },
        },
      ],
    },
  ];

  const filteredGroups = actions
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((group) => group.items.length > 0);

  const flatItems = filteredGroups.flatMap((g) => g.items);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          flatItems[selectedIndex].action();
          setIsOpen(false);
          setQuery('');
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatItems, selectedIndex]);

  // Reset Selection on Query Change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#151515] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[60vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-white/5 py-4">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="Wonach suchen Sie?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="hidden md:flex gap-2">
            <span className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              ESC
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto custom-scrollbar p-2">
          {flatItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500">Keine Ergebnisse gefunden.</div>
          ) : (
            filteredGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="mb-2">
                <h4 className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {group.category}
                </h4>
                {group.items.map((item) => {
                  const isSelected = flatItems[selectedIndex]?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all text-left group ${
                        isSelected
                          ? 'bg-monetaris-500 text-white shadow-md shadow-monetaris-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                      onMouseEnter={() =>
                        setSelectedIndex(flatItems.findIndex((i) => i.id === item.id))
                      }
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          size={18}
                          className={`${isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`}
                        />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {isSelected && (
                        <ArrowRight size={16} className="animate-in fade-in slide-in-from-left-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-[#0A0A0A] border-t border-slate-100 dark:border-white/5 px-4 py-2 text-[10px] text-slate-400 flex justify-between items-center">
          <div className="flex gap-3">
            <span>
              <strong className="text-slate-600 dark:text-slate-300">↑↓</strong> Navigieren
            </span>
            <span>
              <strong className="text-slate-600 dark:text-slate-300">↵</strong> Auswählen
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command size={10} /> <span>Monetaris OS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
