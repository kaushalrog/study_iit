import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

export interface AsyncState<T> { data: T | null; error: string | null; loading: boolean; reload: () => void }

/** Run a local DB read on mount and every time the screen regains focus (so tab data stays fresh). */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const run = useCallback(() => {
    let alive = true;
    setLoading(true);
    fn().then((d) => { if (alive) { setData(d); setError(null); } })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  useEffect(run, [run]);
  useFocusEffect(useCallback(() => { setTick((t) => t + 1); }, []));
  return { data, error, loading, reload: () => setTick((t) => t + 1) };
}
