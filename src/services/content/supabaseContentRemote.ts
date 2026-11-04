import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContentRemote, Pack, PackMeta } from './contentSync';

type Row = { id: string; kind: 'bundle' | 'roadmap'; version: number; sha256: string; title: string; updated_at: string; deleted_at: string | null; min_app_version: string | null; payload?: unknown; retired?: unknown[] };
const meta = (r: Row): PackMeta => ({ id: r.id, kind: r.kind, version: r.version, sha256: r.sha256, title: r.title, updatedAt: r.updated_at, deleted: !!r.deleted_at, minAppVersion: r.min_app_version });

export function supabaseContentRemote(client: Pick<SupabaseClient, 'from'>): ContentRemote {
  return {
    async manifest() {
      const { data, error } = await client.from('content_packs').select('id, kind, version, sha256, title, updated_at, deleted_at, min_app_version').order('updated_at', { ascending: true });
      if (error) throw new Error(error.message);
      return ((data ?? []) as Row[]).map(meta);
    },
    async pack(id) {
      const { data, error } = await client.from('content_packs').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      const r = data as Row;
      return { ...meta(r), payload: r.payload, retired: r.retired ?? [] } satisfies Pack;
    },
  };
}
