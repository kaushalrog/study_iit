import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useDb } from '../../database/DatabaseProvider';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../supabase/client';
import { syncOnce, SyncResult } from './engine';
import { supabaseRemote } from './supabaseRemote';

interface SyncValue { syncing: boolean; last: SyncResult | null; syncNow: () => Promise<void> }
const Ctx = createContext<SyncValue | null>(null);

const MIN_GAP_MS = 30_000;
const POLL_MS = 120_000;

/** Runs sync when signed in: on sign-in, when the app returns to the foreground, and every couple of minutes. */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const db = useDb();
  const { status, userId } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [last, setLast] = useState<SyncResult | null>(null);
  const running = useRef(false);
  const lastRun = useRef(0);

  const syncNow = useCallback(async () => {
    if (!supabase || !userId || running.current) return;
    running.current = true; setSyncing(true);
    try {
      setLast(await syncOnce(db, supabaseRemote(supabase), userId));
    } catch (e) {
      setLast({ status: 'failed', pushed: 0, pushFailed: 0, pending: 0, pulled: { inserted: 0, updated: 0, conflicts: 0, failed: 0 }, message: e instanceof Error ? e.message : 'Sync failed' });
    } finally { lastRun.current = Date.now(); running.current = false; setSyncing(false); }
  }, [db, userId]);

  useEffect(() => {
    if (status !== 'signed_in') return;
    syncNow();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active' && Date.now() - lastRun.current > MIN_GAP_MS) syncNow(); });
    const timer = setInterval(() => { if (AppState.currentState === 'active') syncNow(); }, POLL_MS);
    return () => { sub.remove(); clearInterval(timer); };
  }, [status, syncNow]);

  const value = useMemo(() => ({ syncing, last, syncNow }), [syncing, last, syncNow]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSync(): SyncValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSync outside SyncProvider');
  return v;
}
