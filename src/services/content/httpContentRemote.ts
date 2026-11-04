import type { ContentRemote, Pack, PackMeta } from './contentSync';

/** Reads packs from a plain HTTP feed ({base}/manifest and {base}/pack/{id}). Used for testing delivery on a real device. */
export function httpContentRemote(base: string, fetchFn: typeof fetch = fetch): ContentRemote {
  const get = async <T,>(path: string): Promise<T> => {
    const res = await fetchFn(`${base.replace(/\/$/, '')}${path}`, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`Content feed returned ${res.status}`);
    return (await res.json()) as T;
  };
  return {
    manifest: () => get<PackMeta[]>('/manifest'),
    pack: (id) => get<Pack>(`/pack/${encodeURIComponent(id)}`),
  };
}
