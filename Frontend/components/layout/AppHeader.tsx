import React, { useRef, useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Command,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppNotification, SearchResult } from '../../types';
import { dataService } from '../../services/dataService';
import { authService } from '../../services/authService';
import { FileText, Users, Building2 } from 'lucide-react';

interface AppHeaderProps {
  onMenuClick: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: '1',
      title: 'Mahnlauf abgeschlossen',
      message: '350 Mahnungen erfolgreich versendet.',
      time: 'Vor 2 Min',
      read: false,
      type: 'SUCCESS',
    },
    {
      id: '2',
      title: 'Fristablauf Akte C-102',
      message: 'Handlung erforderlich bei Schuldner Maier.',
      time: 'Vor 1 Std',
      read: false,
      type: 'WARNING',
    },
    {
      id: '3',
      title: 'Systemupdate',
      message: 'Wartungsarbeiten heute Nacht um 03:00 Uhr.',
      time: 'Vor 4 Std',
      read: true,
      type: 'INFO',
    },
  ]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search Effect
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(async () => {
        const { user } = authService.checkSession();
        // Pass user context to searchGlobal for scoping
        const results = await dataService.searchGlobal(searchQuery, user || undefined);
        setSearchResults(results);
        setShowSearch(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }, [searchQuery]);

  const handleSearchResultClick = (link: string) => {
    navigate(link);
    setShowSearch(false);
    setSearchQuery('');
  };

  const getResultIcon = (type: string) => {
    if (type === 'CASE') return <FileText size={16} className="text-purple-500" />;
    if (type === 'DEBTOR') return <Users size={16} className="text-emerald-500" />;
    return <Building2 size={16} className="text-blue-500" />;
  };

  return (
    <header className="h-20 md:h-28 flex items-center justify-between px-4 md:px-12 relative z-20 gap-4">
      <button
        onClick={onMenuClick}
        className="xl:hidden text-slate-500 p-2.5 bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm active:scale-95 transition-transform"
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-[#050505] px-4 py-2 rounded-full border border-white/20 dark:border-white/5 shadow-sm">
        <span className="flex items-center gap-1 text-slate-900 dark:text-white font-bold">
          <Command size={12} /> K
        </span>{' '}
        Suche
      </div>

      <div className="flex items-center gap-3 md:gap-6 ml-auto">
        {/* Global Search */}
        <div className="relative group z-50" ref={searchRef}>
          <div
            className={`flex items-center transition-all duration-300 ${showSearch ? 'w-[280px] md:w-72' : 'w-10 md:w-72'}`}
          >
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 ${showSearch ? 'text-monetaris-600' : ''}`}
              onClick={() => setShowSearch(true)}
            />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearch(true);
              }}
              placeholder="Suche... (/)"
              className={`pl-10 pr-4 py-2.5 md:py-3 bg-white/80 border border-slate-200 dark:border-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:bg-white dark:focus:bg-[#050505] focus:ring-2 focus:ring-monetaris-500/20 rounded-2xl transition-all font-medium dark:bg-[#050505] ${showSearch ? 'w-full opacity-100' : 'w-0 md:w-full opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'}`}
            />
            {!showSearch && (
              <button
                onClick={() => setShowSearch(true)}
                className="md:hidden absolute inset-0 bg-white dark:bg-[#101010] rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500"
              >
                <Search size={18} />
              </button>
            )}
          </div>

          {showSearch && (
            <div className="absolute top-full right-0 md:right-auto md:left-0 w-[300px] md:w-[400px] bg-white dark:bg-[#050505] rounded-2xl shadow-2xl mt-2 border border-slate-100 dark:border-white/10 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <div className="p-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 px-3 py-2">
                  Suchergebnisse
                </p>
                {searchResults.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                    Keine Ergebnisse gefunden.
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleSearchResultClick(result.link)}
                      className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 dark:hover:bg-[#101010] rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#151515] flex items-center justify-center border border-slate-200 dark:border-white/5 shrink-0">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 md:p-3 bg-white/80 dark:bg-[#050505] rounded-2xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors hover:scale-105 shadow-sm border border-slate-200 dark:border-white/5"
          >
            <Bell size={20} />
            {notifications.some((n) => !n.read) && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-monetaris-500 rounded-full shadow-[0_0_10px_rgba(0,240,149,0.5)] animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 w-[300px] md:w-[360px] bg-white dark:bg-[#050505] rounded-2xl shadow-2xl mt-2 md:mt-4 border border-slate-100 dark:border-white/10 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Benachrichtigungen
                </h4>
                <button className="text-[10px] font-bold text-monetaris-600 dark:text-monetaris-500 hover:underline">
                  Alle markieren
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Keine neuen Nachrichten.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-[#101010] transition-colors cursor-pointer ${!n.read ? 'bg-slate-50/50 dark:bg-[#101010]' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'SUCCESS' && (
                            <CheckCircle size={16} className="text-emerald-500" />
                          )}
                          {n.type === 'WARNING' && (
                            <AlertTriangle size={16} className="text-amber-500" />
                          )}
                          {n.type === 'INFO' && <Info size={16} className="text-blue-500" />}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold mb-1 truncate ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2 font-bold uppercase">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 bg-slate-50 dark:bg-[#050505] text-center border-t border-slate-100 dark:border-white/5">
                <button className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Alle anzeigen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
