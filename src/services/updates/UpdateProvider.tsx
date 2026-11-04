import * as Updates from 'expo-updates';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { BusyReasons, busyMessage, canRestartNow, friendlyError, shouldCheck, updateState, UpdateState } from './policy';

interface Value {
  state: UpdateState;
  enabled: boolean;
  checking: boolean;
  lastCheckAt: number | null;
  error: string | null;
  busy: BusyReasons;
  message: string | null;
  runtime: { updateId: string | null; runtimeVersion: string | null; channel: string | null; isEmbedded: boolean; createdAt: Date | null };
  check: () => Promise<void>;
  /** Restart into the downloaded update. Refuses while a test or unsaved writing is open, unless `force`. */
  apply: (force?: boolean) => Promise<boolean>;
  setBusy: (key: string, reason: string | null) => void;
}
const Ctx = createContext<Value | null>(null);

/**
 * Checks for compatible over-the-air updates when the app opens and when it returns to the foreground (at most every few
 * hours), downloads them in the background, and never restarts on its own: the update is used the next time the app opens,
 * or when the person chooses "Restart to apply". Expo's own rollback and error recovery stay in charge of a bad update.
 */
export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const enabled = Updates.isEnabled && !__DEV__;
  const u = Updates.useUpdates();
  const [lastCheckAt, setLastCheckAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busyMap, setBusyMap] = useState<Record<string, string>>({});
  const running = useRef(false);

  const check = useCallback(async () => {
    if (!enabled || running.current) return;
    running.current = true; setChecking(true); setError(null); setMessage(null);
    try {
      const r = await Updates.checkForUpdateAsync();
      setOffline(false);
      if (r.isAvailable) await Updates.fetchUpdateAsync();
      setMessage(r.isAvailable ? 'Update downloaded.' : 'No newer update.');
    } catch (e) {
      const f = friendlyError(e);
      setOffline(f.offline); setError(f.offline ? null : f.text);
      setMessage(f.offline ? 'Could not check: no internet connection.' : null);
    } finally { setLastCheckAt(Date.now()); running.current = false; setChecking(false); }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    check();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') setLastCheckAt((at) => { if (shouldCheck(at, Date.now())) check(); return at; }); });
    return () => sub.remove();
  }, [enabled, check]);

  const busy = useMemo(() => Object.values(busyMap), [busyMap]);
  const setBusy = useCallback((key: string, reason: string | null) => {
    setBusyMap((m) => { if (reason === null) { if (!(key in m)) return m; const { [key]: _x, ...rest } = m; return rest; } return m[key] === reason ? m : { ...m, [key]: reason }; });
  }, []);

  const apply = useCallback(async (force = false) => {
    if (!enabled) return false;
    if (!force && !canRestartNow(busy)) { setMessage(busyMessage(busy)); return false; }
    try { await Updates.reloadAsync(); return true; } catch (e) { setError(friendlyError(e).text); return false; }
  }, [enabled, busy]);

  const state = updateState({ enabled, isChecking: checking || u.isChecking, isDownloading: u.isDownloading, isAvailable: u.isUpdateAvailable, isPending: u.isUpdatePending, error: error ?? (u.checkError?.message ?? u.downloadError?.message ?? null), offline });
  const cr = u.currentlyRunning;
  const value: Value = {
    state, enabled, checking: checking || u.isChecking, lastCheckAt, error, busy, message,
    runtime: { updateId: cr.updateId ?? null, runtimeVersion: cr.runtimeVersion ?? null, channel: cr.channel ?? null, isEmbedded: cr.isEmbeddedLaunch, createdAt: cr.createdAt ?? null },
    check, apply, setBusy,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUpdateManager(): Value {
  const v = useContext(Ctx);
  if (!v) throw new Error('UpdateProvider is missing');
  return v;
}

/** Call from a screen that holds work a restart would interrupt (a test, an unsaved note). */
export function useUpdateGuard(reason: string, active: boolean) {
  const { setBusy } = useUpdateManager();
  useEffect(() => {
    if (!active) return;
    setBusy(reason, reason);
    return () => setBusy(reason, null);
  }, [reason, active, setBusy]);
}
