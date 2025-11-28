import React, { useEffect } from 'react';
import { X, Command, Keyboard, CornerDownLeft } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const groups = [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['Ctrl', 'K'], desc: 'Command Palette öffnen' },
        { keys: ['Esc'], desc: 'Modals / Menüs schließen' },
        { keys: ['Ctrl', 'B'], desc: 'Sidebar umschalten' },
      ],
    },
    {
      title: 'Aktionen',
      shortcuts: [
        { keys: ['?'], desc: 'Dieses Menü anzeigen' },
        { keys: ['/'], desc: 'Suchfeld fokussieren' },
        { keys: ['Enter'], desc: 'Auswahl bestätigen', icon: CornerDownLeft },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-[#151515] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-[#101010]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-sm">
              <Keyboard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg font-display">
                Tastaturkürzel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Steuern Sie Monetaris effizienter.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {groups.map((group, i) => (
            <div key={i}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                {group.title}
              </h4>
              <div className="space-y-3">
                {group.shortcuts.map((s, j) => (
                  <div key={j} className="flex items-center justify-between group">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-monetaris-600 dark:group-hover:text-monetaris-400 transition-colors">
                      {s.desc}
                    </span>
                    <div className="flex gap-1">
                      {s.keys.map((k, kidx) => (
                        <kbd
                          key={kidx}
                          className="min-w-[24px] h-7 px-1.5 flex items-center justify-center bg-white dark:bg-[#202020] border-b-2 border-slate-200 dark:border-black rounded-md text-[11px] font-bold text-slate-600 dark:text-slate-300 font-mono shadow-sm"
                        >
                          {k === 'Ctrl' ? (
                            <span className="text-[10px]">⌘</span>
                          ) : s.icon ? (
                            <s.icon size={10} />
                          ) : (
                            k
                          )}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-[#101010] border-t border-slate-100 dark:border-white/5 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            Drücken Sie{' '}
            <kbd className="px-1 bg-white dark:bg-[#202020] border rounded text-[10px] font-bold font-mono">
              ESC
            </kbd>{' '}
            zum Schließen
          </p>
        </div>
      </div>
    </div>
  );
};
