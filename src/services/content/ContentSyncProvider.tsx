import Constants from 'expo-constants';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useDb } from '../../database/DatabaseProvider';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../supabase/client';
import { ContentSyncResult, loadState, pendingPacks, syncContent } from './contentSync';
import { supabaseContentRemote } from './supabaseContentRemote';

interface Value {
  /** False when there is no cloud project or nobody is signed in: published content needs both. */
  available: boolean;
  syncing: boolean;
  last: ContentSyncResult | null;
  lastSuccessAt: string | null;
  /** Packs on the server that this device has not applied yet (known after the last check). */
  pending: number;
  /** Goes up whenever new content has been saved, so open screens can reload without a restart. */
  contentVersion: number;
  refresh: () => Promise<void>;
}
const Ctx = createContext<Value | null>(null);
const MIN_GAP_MS = 10 * 60_000;

/** Fetches published academic content when the app opens, when it returns to the foreground, and on request. */
export function ContentSyncProvider({ children }: { children: React.ReactNode }) {
  const db = useDb();
  const { status } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [last, setLast] = useState<ContentSyncResult | null>(null);
  const [lastSuccessAt, setLastSuccessAt] = useState<string | null>(null);
  const [pending, setPending] = useState(0);
  const [contentVersion, setContentVersion] = useState(0);
  const running = useRef(false);
  const lastRun = useRef(0);
  const available = Boolean(supabase) && status === 'signed_in';
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const refresh = useCallback(async () => {
    if (!supabase || running.current) return;
    running.current = true; setSyncing(true);
    try {
      const remote = supabaseContentRemote(supabase);
      const res = await syncContent(db, remote, appVersion);
      setLast(res);
      const st = await loadState(db);
      setLastSuccessAt(st.lastSuccessAt);
      if (res.applied.length > 0) setContentVersion((v) => v + 1);
      try { setPending(res.status === 'offline' ? pending : pendingPacks(await remote.manifest(), st).length); } catch { /* keep the old number */ }
    } finally { lastRun.current = Date.now(); running.current = false; setSyncing(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, appVersion]);

  useEffect(() => { loadState(db).then((s) => setLastSuccessAt(s.lastSuccessAt)).catch(() => {}); }, [db]);
  useEffect(() => {
    if (!available) return;
    refresh();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active' && Date.now() - lastRun.current > MIN_GAP_MS) refresh(); });
    return () => sub.remove();
  }, [available, refresh]);

  const value = useMemo<Value>(() => ({ available, syncing, last, lastSuccessAt, pending, contentVersion, refresh }), [available, syncing, last, lastSuccessAt, pending, contentVersion, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContentSync(): Value {
  const v = useContext(Ctx);
  if (!v) throw new Error('ContentSyncProvider is missing');
  return v;
}
