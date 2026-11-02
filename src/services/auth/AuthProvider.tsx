import type { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cloudConfigured, supabase } from '../supabase/client';
import { describeAuthError } from './errors';

export type AuthStatus = 'unconfigured' | 'loading' | 'signed_out' | 'signed_in';
interface AuthValue {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
  /** Resolves to an error message, or null on success. */
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthValue | null>(null);

/**
 * Sign-in is optional: ORBIT is fully usable offline and signed out. Signing in only switches on backup and sync.
 * There is no sign-up here; the private account is created by whoever sets up the Supabase project.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(cloudConfigured);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) { setSession(data.session); setLoading(false); } }).catch(() => alive && setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Cloud backup is not set up on this device.';
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? describeAuthError(error) : null;
    } catch (e) {
      return describeAuthError(e as Error);
    }
  }, []);

  const signOut = useCallback(async () => { if (supabase) await supabase.auth.signOut().catch(() => {}); }, []);

  const value = useMemo<AuthValue>(() => ({
    status: !cloudConfigured ? 'unconfigured' : loading ? 'loading' : session ? 'signed_in' : 'signed_out',
    userId: session?.user.id ?? null, email: session?.user.email ?? null, signIn, signOut,
  }), [session, loading, signIn, signOut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
