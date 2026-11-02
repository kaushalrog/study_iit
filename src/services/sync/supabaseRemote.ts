import type { SupabaseClient } from '@supabase/supabase-js';
import type { RemoteStore } from './engine';

/** Thin adapter from the sync engine's RemoteStore to supabase-js. Row-level security scopes every call to the signed-in student. */
export function supabaseRemote(client: Pick<SupabaseClient, 'from'>): RemoteStore {
  const err = (e: { message: string } | null) => (e ? { message: e.message } : null);
  return {
    async upsert(table, row) {
      const { error } = await client.from(table).upsert(row, { onConflict: 'id' });
      return { error: err(error) };
    },
    async pull(table, sinceIso, limit) {
      let q = client.from(table).select('*').order('updated_at', { ascending: true }).limit(limit);
      if (sinceIso) q = q.gte('updated_at', sinceIso);
      const { data, error } = await q;
      return { rows: (data ?? []) as Record<string, unknown>[], error: err(error) };
    },
  };
}
