import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSessionOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout: () => void;
}

const STORAGE_KEY = 'monetaris_last_activity';

/**
 * Session timeout management hook
 * Tracks user activity and triggers timeout/warning callbacks
 * Handles cross-tab synchronization
 */
export function useSession({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
}: UseSessionOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const warningIdRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  // Get last activity time from localStorage
  const getLastActivityTime = useCallback((): number => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : Date.now();
  }, []);

  // Update last activity time in localStorage
  const updateLastActivityTime = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());
  }, []);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (warningIdRef.current) {
      clearTimeout(warningIdRef.current);
      warningIdRef.current = null;
    }
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  // Reset the timeout timers
  const resetTimeout = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    updateLastActivityTime();

    const warningTime = timeoutMs - warningMs;

    // Set warning timer
    warningIdRef.current = setTimeout(() => {
      setShowWarning(true);
    }, warningTime);

    // Set timeout timer
    timeoutIdRef.current = setTimeout(() => {
      onTimeout();
    }, timeoutMs);
  }, [clearTimers, updateLastActivityTime, timeoutMs, warningMs, onTimeout]);

  // Check if session has expired (handles cross-tab activity)
  const checkSessionExpiry = useCallback(() => {
    const lastActivity = getLastActivityTime();
    const now = Date.now();
    const timeSinceActivity = now - lastActivity;

    if (timeSinceActivity >= timeoutMs) {
      // Session expired
      onTimeout();
      return;
    }

    // Calculate remaining time
    const timeUntilExpiry = timeoutMs - timeSinceActivity;
    const secondsRemaining = Math.ceil(timeUntilExpiry / 1000);
    setRemainingTime(secondsRemaining);

    // Show warning if within warning period
    if (timeUntilExpiry <= warningMs) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [getLastActivityTime, timeoutMs, warningMs, onTimeout]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  // Extend session (called from warning modal)
  const extendSession = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  // Initialize and set up activity listeners
  useEffect(() => {
    // Initialize last activity time
    updateLastActivityTime();
    resetTimeout();

    // Activity event handlers
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Throttle activity updates to avoid too many localStorage writes
    let activityTimeout: NodeJS.Timeout | null = null;
    const throttledHandleActivity = () => {
      if (activityTimeout) return;

      activityTimeout = setTimeout(() => {
        handleActivity();
        activityTimeout = null;
      }, 1000); // Throttle to once per second
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, throttledHandleActivity);
    });

    // Check session expiry periodically (handles cross-tab updates)
    checkIntervalRef.current = setInterval(checkSessionExpiry, 1000);

    // Listen for storage changes (activity in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        // Activity detected in another tab, reset our timers
        resetTimeout();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, throttledHandleActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
      clearTimers();
      if (activityTimeout) clearTimeout(activityTimeout);
    };
  }, [handleActivity, resetTimeout, updateLastActivityTime, checkSessionExpiry, clearTimers]);

  return {
    showWarning,
    remainingTime,
    extendSession,
  };
}
