import React, { createContext, useContext, useEffect, useState } from 'react';
import { ErrorState, LoadingState, Screen } from '../components/design-system';
import { migrate } from './migrations';
import { seedInitialData } from './seed';
import { openExpoDb } from './sqlite/expoDriver';
import type { SqlDb } from './sqlite/types';

const Ctx = createContext<SqlDb | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SqlDb | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const d = await openExpoDb();
        await migrate(d);
        await seedInitialData(d);
        if (alive) setDb(d);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { alive = false; };
  }, [attempt]);

  if (error) return <Screen><ErrorState message={`Could not open the local database: ${error}`} onRetry={() => { setError(null); setAttempt((a) => a + 1); }} /></Screen>;
  if (!db) return <Screen><LoadingState label="Opening ORBIT" /></Screen>;
  return <Ctx.Provider value={db}>{children}</Ctx.Provider>;
}

export function useDb(): SqlDb {
  const db = useContext(Ctx);
  if (!db) throw new Error('useDb outside DatabaseProvider');
  return db;
}
