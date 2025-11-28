import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, LogOut, RefreshCw } from 'lucide-react';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  remainingTime: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  isOpen,
  remainingTime,
  onExtend,
  onLogout,
}) => {
  const [displayTime, setDisplayTime] = useState(remainingTime);

  useEffect(() => {
    setDisplayTime(remainingTime);
  }, [remainingTime]);

  if (!isOpen) return null;

  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-fadeIn" />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-obsidian-light rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn border border-slate-200 dark:border-slate-700"
          role="alertdialog"
          aria-labelledby="session-timeout-title"
          aria-describedby="session-timeout-description"
        >
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h2
                id="session-timeout-title"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                Session Timeout Warning
              </h2>
              <p
                id="session-timeout-description"
                className="text-sm text-slate-600 dark:text-slate-400 mt-1"
              >
                Your session is about to expire due to inactivity
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="bg-slate-50 dark:bg-obsidian rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Clock className="w-5 h-5 text-monetaris-accent" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>
            <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-2">
              Time remaining until automatic logout
            </p>
          </div>

          {/* Message */}
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-6 text-center">
            To protect your account security, you will be automatically logged out when the timer
            reaches zero.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onExtend}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-monetaris-accent hover:bg-monetaris-accent-dark text-white rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-monetaris-accent/30 focus:outline-none focus:ring-2 focus:ring-monetaris-accent focus:ring-offset-2 dark:focus:ring-offset-obsidian"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Stay Logged In</span>
            </button>
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-obsidian"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Now</span>
            </button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-4 text-center">
            For your security, always log out when using shared computers
          </p>
        </div>
      </div>
    </>
  );
};
