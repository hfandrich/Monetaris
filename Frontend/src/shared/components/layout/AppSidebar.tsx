import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  UploadCloud,
  FileText,
  Users,
  ShieldCheck,
  Building2,
  Settings,
  FileCode,
  CreditCard,
  Home,
  Sparkles,
} from 'lucide-react';
import { MonetarisLogo } from '@/shared/components/ui';
import { User, UserRole } from '@/types';
import { Theme } from './AppLayout';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  user: User | null;
  onLogout: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  user,
  onLogout,
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true; // Handle root match
    return location.pathname.startsWith(path);
  };

  // --- Role-Based Navigation ---
  let navigation = [
    {
      name: 'Cockpit',
      href: '/dashboard',
      icon: LayoutDashboard,
      role: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT],
    },
    { name: 'Übersicht', href: '/portal/debtor', icon: Home, role: [UserRole.DEBTOR] }, // DEBTOR Only
    { name: 'Dateiimport', href: '/import', icon: UploadCloud, role: [UserRole.CLIENT] },
    {
      name: 'Forderungen',
      href: '/claims',
      icon: FileText,
      role: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT],
    },
    { name: 'Schuldner', href: '/debtors', icon: Users, role: [UserRole.ADMIN, UserRole.AGENT] },
    {
      name: 'Vorlagen',
      href: '/templates',
      icon: FileCode,
      role: [UserRole.ADMIN, UserRole.AGENT],
    },
    {
      name: 'Compliance',
      href: '/compliance',
      icon: ShieldCheck,
      role: [UserRole.ADMIN, UserRole.AGENT],
    },
    { name: 'Mandanten', href: '/clients', icon: Building2, role: [UserRole.ADMIN] },
    {
      name: 'Einstellungen',
      href: '/settings',
      icon: Settings,
      role: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT, UserRole.DEBTOR],
    },
  ];

  // Filter navigation based on user role
  const filteredNav = navigation.filter((item) => {
    if (!user) return false;
    // @ts-ignore - We know the role is in the array logic
    return item.role.includes(user.role);
  });

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar Dock */}
      <aside
        className={`fixed top-4 bottom-4 left-4 w-[260px] z-50 flex flex-col bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[24px] shadow-2xl transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'}`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 shrink-0 border-b border-slate-100/50 dark:border-white/5">
          <div className="flex items-center gap-3 group cursor-pointer">
            <MonetarisLogo className="h-7 w-auto text-slate-900 dark:text-white" />
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-monetaris-500 transition-colors">
              {user?.role === UserRole.DEBTOR ? 'Monetaris Pay' : 'Monetaris'}
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3 space-y-1">
          {filteredNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`relative flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group ${
                  active
                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-monetaris-500 rounded-r-md shadow-[0_0_10px_rgba(0,240,149,0.6)]"></div>
                )}
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors ${active ? 'text-monetaris-600 dark:text-monetaris-accent' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Footer: User & Theme */}
        <div className="p-4 border-t border-slate-100/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 rounded-b-[24px]">
          {/* Theme Toggle */}
          <div className="grid grid-cols-3 bg-slate-200/50 dark:bg-black/40 p-1 rounded-lg mb-4 gap-1">
            <button
              onClick={() => onThemeChange('light')}
              className={`flex items-center justify-center py-1.5 rounded-md text-xs font-bold transition-all ${currentTheme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              title="Light Mode"
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              className={`flex items-center justify-center py-1.5 rounded-md text-xs font-bold transition-all ${currentTheme === 'dark' ? 'bg-[#151515] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              title="Dark Mode"
            >
              <Moon size={14} />
            </button>
            <button
              onClick={() => onThemeChange('barbie')}
              className={`flex items-center justify-center py-1.5 rounded-md text-xs font-bold transition-all ${currentTheme === 'barbie' ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30' : 'text-slate-500 hover:text-pink-500'}`}
              title="Enterprise Barbie"
            >
              <Sparkles size={14} />
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-[#202020] dark:to-[#303030] border border-white/10 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate opacity-80">
                {user?.role === UserRole.AGENT || user?.role === 1
                  ? 'Agent'
                  : user?.role === UserRole.CLIENT || user?.role === 2
                    ? 'Mandant'
                    : user?.role === UserRole.DEBTOR || user?.role === 3
                      ? 'Gast'
                      : 'Admin'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
